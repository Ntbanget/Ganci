'use client';

import { useEffect, useRef, useState } from 'react';

export default function POCPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isARStarted, setIsARStarted] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Placeholder URL - ganti dengan file asli nanti
  const MARKER_URL = '/assets/marker.mind'; // File marker MindAR
  const VIDEO_URL = '/assets/video.mp4';   // File video test

  useEffect(() => {
    // Load MindAR dari CDN
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-three.prod.js';
    script.async = true;
    script.onload = () => {
      console.log('MindAR loaded');
    };
    script.onerror = () => {
      setError('Gagal memuat MindAR. Pastikan koneksi internet aktif.');
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const startAR = async () => {
    try {
      // @ts-ignore - MindAR dimuat dari CDN
      const mindarThree = new window.MINDAR.IMAGE.MindARThree({
        container: document.querySelector('#ar-container') as HTMLElement,
        imageTargetSrc: MARKER_URL,
      });

      // Konfigurasi kualitas kamera sesuai README
      // @ts-ignore
      mindarThree.camera = {
        // Minta resolusi kamera eksplisit HD (1280x720)
        width: 1280,
        height: 720,
        // Hindari crop otomatis yang terlihat seperti zoom
        facingMode: 'environment',
      };

      const { renderer, scene, camera } = mindarThree;

      // Setup video element untuk AR overlay
      const video = document.createElement('video');
      video.src = VIDEO_URL;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.crossOrigin = 'anonymous';
      
      // object-fit: contain untuk hindari crop/zoom otomatis
      video.style.objectFit = 'contain';
      video.style.width = '100%';
      video.style.height = '100%';

      // Setup texture dari video
      // @ts-ignore
      const videoTexture = new THREE.VideoTexture(video);
      // @ts-ignore
      const planeGeometry = new THREE.PlaneGeometry(1, 1);
      // @ts-ignore
      const planeMaterial = new THREE.MeshBasicMaterial({ 
        map: videoTexture,
        transparent: true,
      });
      // @ts-ignore
      const plane = new THREE.Mesh(planeGeometry, planeMaterial);

      // @ts-ignore
      const anchor = mindarThree.addAnchor(0);
      anchor.group.add(plane);

      // Parameter smoothing MindAR untuk hindari jitter
      // @ts-ignore
      mindarThree.filterMinCF = 0.0001;
      // @ts-ignore
      mindarThree.filterBeta = 0.001;

      await mindarThree.start();
      setIsARStarted(true);

      // Play video saat marker terdeteksi
      anchor.onTargetFound = () => {
        video.play();
      };

      anchor.onTargetLost = () => {
        video.pause();
      };

      renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
      });

    } catch (err) {
      console.error('AR Error:', err);
      setError('Gagal memulai AR. Pastikan browser mendukung WebGL dan kamera dapat diakses.');
      setShowFallback(true);
    }
  };

  const playFallbackVideo = () => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-4 text-black">
          Proof of Concept - AR
        </h1>
        <p className="text-center mb-6 text-gray-700">
          Halaman test AR dengan foto & video hardcode
        </p>

        {!isARStarted && !showFallback && (
          <div className="text-center">
            <button
              onClick={startAR}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors"
            >
              Mulai Scan AR
            </button>
            <p className="mt-4 text-sm text-gray-600">
              Pastikan izinkan akses kamera saat diminta
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Error:</p>
            <p>{error}</p>
            <p className="text-sm mt-2">
              Saran: Buka via Chrome (Android) atau Safari (iPhone), bukan in-app browser WhatsApp/Instagram
            </p>
          </div>
        )}

        {showFallback && (
          <div className="text-center">
            <p className="mb-4 text-gray-700">
              AR tidak dapat dimulai. Gunakan opsi fallback di bawah:
            </p>
            <video
              ref={videoRef}
              src={VIDEO_URL}
              controls
              className="w-full rounded-lg shadow-lg"
              style={{ objectFit: 'contain' }}
            />
            <button
              onClick={playFallbackVideo}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg"
            >
              Tonton Videonya di Sini
            </button>
          </div>
        )}

        <div id="ar-container" className="w-full h-96 bg-black rounded-lg overflow-hidden mt-4" />
      </div>
    </div>
  );
}
