'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import * as QRCode from 'qrcode';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const [namaPelanggan, setNamaPelanggan] = useState('');
  const [foto, setFoto] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [mindFile, setMindFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (!foto || !video || !mindFile) {
        throw new Error('Foto, video, dan file .mind wajib diupload');
      }

      // Check video duration (max 30 seconds)
      const videoDuration = await getVideoDuration(video);
      if (videoDuration > 30) {
        throw new Error('Video maksimal 30 detik');
      }

      // Generate unique slug
      const slug = generateSlug();

      // Upload files to Supabase Storage
      const fotoPreviewUrl = await uploadFile(foto, `orders/${slug}-foto.jpg`);
      const videoUrl = await uploadFile(video, `orders/${slug}-video.mp4`);
      const markerUrl = await uploadFile(mindFile, `orders/${slug}.mind`);

      // Save to Supabase
      const { error: insertError } = await supabase.from('orders').insert({
        id: slug,
        nama_pelanggan: namaPelanggan || null,
        foto_preview_url: fotoPreviewUrl,
        marker_url: markerUrl,
        video_url: videoUrl,
        status: 'dipesan',
      });

      if (insertError) throw insertError;

      setSuccess(true);
      setNamaPelanggan('');
      setFoto(null);
      setVideo(null);
      setMindFile(null);

      // Generate QR code for the slug
      const qrDataUrl = await QRCode.toDataURL(`${window.location.origin}/${slug}`);
      setQrCode(qrDataUrl);

      // Refresh orders list
      fetchOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan pesanan');
    } finally {
      setLoading(false);
    }
  };

  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };
      video.src = URL.createObjectURL(file);
    });
  };

  const generateSlug = (): string => {
    return Math.random().toString(36).substring(2, 10);
  };

  const uploadFile = async (file: File, path: string): Promise<string> => {
    const { data, error } = await supabase.storage.from('orders').upload(path, file);
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage.from('orders').getPublicUrl(path);
    return publicUrl;
  };

  const fetchOrders = async () => {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching orders:', error);
    } else {
      setOrders(data || []);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setAuthChecked(true);
        fetchOrders();
      }
    };

    checkAuth();
  }, [router]);

  if (!authChecked) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Loading...</div>;
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Admin - Tambah Pesanan Baru</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            Pesanan berhasil disimpan!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2">Nama Pelanggan (opsional)</label>
            <input
              type="text"
              value={namaPelanggan}
              onChange={(e) => setNamaPelanggan(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block mb-2">Foto (JPG/PNG)</label>
            <input
              type="file"
              accept="image/jpeg,image/png"
              onChange={(e) => setFoto(e.target.files?.[0] || null)}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-2">Video (Maks 30 detik)</label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setVideo(e.target.files?.[0] || null)}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-2">File .mind (Marker AR - hasil compile dari MindAR)</label>
            <input
              type="file"
              accept=".mind"
              onChange={(e) => setMindFile(e.target.files?.[0] || null)}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
          >
            {loading ? 'Menyimpan...' : 'Simpan & Generate Slug'}
          </button>
        </form>

        {qrCode && (
          <div className="mt-6 p-4 bg-white rounded border">
            <h3 className="font-bold mb-2">QR Code untuk Pesanan Terakhir:</h3>
            <img src={qrCode} alt="QR Code" className="w-32 h-32" />
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Daftar Pesanan</h2>
          {orders.length === 0 ? (
            <p className="text-gray-500">Belum ada pesanan</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border">
                <thead>
                  <tr>
                    <th className="border px-4 py-2">Preview</th>
                    <th className="border px-4 py-2">ID/Slug</th>
                    <th className="border px-4 py-2">Nama Pelanggan</th>
                    <th className="border px-4 py-2">Status</th>
                    <th className="border px-4 py-2">Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="border px-4 py-2">
                        {order.foto_preview_url && (
                          <img 
                            src={order.foto_preview_url} 
                            alt="Preview" 
                            className="w-16 h-16 object-cover"
                          />
                        )}
                      </td>
                      <td className="border px-4 py-2">{order.id}</td>
                      <td className="border px-4 py-2">{order.nama_pelanggan || '-'}</td>
                      <td className="border px-4 py-2">{order.status}</td>
                      <td className="border px-4 py-2">{new Date(order.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
