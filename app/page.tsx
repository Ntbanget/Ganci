'use client';

import { useEffect, useRef, useState } from 'react';

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isARStarted, setIsARStarted] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMindARLoaded, setIsMindARLoaded] = useState(false);
  const [isLoadingScripts, setIsLoadingScripts] = useState(true);

  // URL file test yang sudah ada
  const MARKER_URL = '/assets/targets.mind'; // File marker MindAR
  const VIDEO_URL = '/assets/ssstik.io_@syaahagordl_1784859582793.mp4';   // File video test

  useEffect(() => {
    console.log('Starting to load scripts...');
    setIsLoadingScripts(true);

    // Load Three.js dulu (dependency MindAR)
    const threeScript = document.createElement('script');
    threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    threeScript.async = true;
    threeScript.onload = () => {
      console.log('✓ Three.js loaded successfully');
      
      // Setelah Three.js load, baru load MindAR
      // Gunakan versi non-UMD yang lebih kompatibel
      const mindarScript = document.createElement('script');
      mindarScript.src = 'https://cdn.jsdelivr.net/npm/mind-ar@1.2.2/dist/mindar-image-three.js';
      mindarScript.async = true;
      mindarScript.onload = () => {
        console.log('✓ MindAR loaded successfully');
        // @ts-ignore - MindAR dimuat dari CDN
        console.log('Checking if MINDAR is available:', typeof window.MINDAR);
        setIsMindARLoaded(true);
        setIsLoadingScripts(false);
      };
      mindarScript.onerror = () => {
        console.error('✗ Failed to load MindAR');
        setError('Gagal memuat MindAR. Pastikan koneksi internet aktif.');
        setIsLoadingScripts(false);
      };
      document.body.appendChild(mindarScript);
    };
    threeScript.onerror = () => {
      console.error('✗ Failed to load Three.js');
      setError('Gagal memuat Three.js. Pastikan koneksi internet aktif.');
      setIsLoadingScripts(false);
    };
    document.body.appendChild(threeScript);

    return () => {
      // Cleanup scripts
      const scripts = document.querySelectorAll('script[src*="three"], script[src*="mind-ar"]');
      scripts.forEach(script => script.remove());
    };
  }, []);

  const startAR = async () => {
    console.log('🔘 Button clicked: Starting AR...');
    
    if (!isMindARLoaded) {
      console.error('✗ MindAR not loaded yet');
      setError('MindAR belum selesai dimuat. Tunggu sebentar lalu coba lagi.');
      return;
    }

    try {
      console.log('📷 Initializing MindAR...');
      // @ts-ignore - MindAR dimuat dari CDN
      const mindarThree = new window.MINDAR.IMAGE.MindARThree({
        container: document.querySelector('#ar-container') as HTMLElement,
        imageTargetSrc: MARKER_URL,
      });
      console.log('✓ MindAR initialized');

      // Konfigurasi kualitas kamera sesuai README
      // @ts-ignore
      mindarThree.camera = {
        // Minta resolusi kamera eksplisit HD (1280x720)
        width: 1280,
        height: 720,
        // Hindari crop otomatis yang terlihat seperti zoom
        facingMode: 'environment',
      };
      console.log('✓ Camera configured: 1280x720 HD');

      const { renderer, scene, camera } = mindarThree;

      // Setup video element untuk AR overlay
      console.log('🎬 Setting up video element...');
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
      console.log('✓ Video element created');

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
      console.log('✓ 3D plane created with video texture');

      // @ts-ignore
      const anchor = mindarThree.addAnchor(0);
      anchor.group.add(plane);
      console.log('✓ Anchor added to scene');

      // Parameter smoothing MindAR untuk hindari jitter
      // @ts-ignore
      mindarThree.filterMinCF = 0.0001;
      // @ts-ignore
      mindarThree.filterBeta = 0.001;
      console.log('✓ Smoothing parameters set');

      console.log('🚀 Starting MindAR (requesting camera permission)...');
      await mindarThree.start();
      console.log('✓ MindAR started successfully - camera should be active');
      setIsARStarted(true);

      // Play video saat marker terdeteksi
      anchor.onTargetFound = () => {
        console.log('🎯 Marker detected! Playing video');
        video.play();
      };

      anchor.onTargetLost = () => {
        console.log('❌ Marker lost - pausing video');
        video.pause();
      };

      renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
      });
      console.log('✓ Animation loop started');

    } catch (err) {
      console.error('✗ AR Error:', err);
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
            {isLoadingScripts ? (
              <div className="text-gray-600">
                <p className="text-lg">Memuat MindAR...</p>
                <p className="text-sm mt-2">Mohon tunggu sebentar</p>
              </div>
            ) : !isMindARLoaded ? (
              <div className="text-red-600">
                <p className="text-lg">Gagal memuat MindAR</p>
                <p className="text-sm mt-2">Coba refresh halaman</p>
              </div>
            ) : (
              <>
                <button
                  onClick={startAR}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors"
                >
                  Mulai Scan AR
                </button>
                <p className="mt-4 text-sm text-gray-600">
                  Pastikan izinkan akses kamera saat diminta
                </p>
              </>
            )}
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
