'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';

export default function ScanPage() {
  const params = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data, error } = await supabase
          .rpc('get_order_by_slug', { p_slug: params.slug });

        if (error || !data || data.length === 0) {
          setError('Order tidak ditemukan');
          setLoading(false);
          return;
        }

        setOrder(data[0]);
        setLoading(false);
      } catch (err) {
        setError('Gagal memuat data');
        setLoading(false);
      }
    };

    fetchOrder();
  }, [params.slug]);

  useEffect(() => {
    if (!order) return;

    const loadMindAR = async () => {
      const importmap = document.createElement('script');
      importmap.type = 'importmap';
      importmap.textContent = JSON.stringify({
        imports: {
          three: 'https://unpkg.com/three@0.160.0/build/three.module.js',
          'three/addons/': 'https://unpkg.com/three@0.160.0/examples/jsm/',
          'mindar-image-three': 'https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-three.prod.js',
        },
      });
      document.head.appendChild(importmap);

      const script = document.createElement('script');
      script.type = 'module';
      script.textContent = `
        import * as THREE from 'three';
        import { MindARThree } from 'mindar-image-three';

        const mindarThree = new MindARThree({
          container: document.querySelector("#ar-container"),
          imageTargetSrc: "${order.marker_url}",
          uiScanning: "no",
          filterMinCF: 0.0001,
          filterBeta: 0.001
        });
        const {renderer, scene, camera} = mindarThree;

        // Configure camera for HD resolution
        camera.fov = 45;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        // Configure renderer
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const anchor = mindarThree.addAnchor(0);

        const video = document.createElement('video');
        video.src = "${order.video_url}";
        video.loop = true;
        video.muted = false;
        video.playsInline = true;
        video.pause();
        const videoTexture = new THREE.VideoTexture(video);
        const geometry = new THREE.PlaneGeometry(1, 1.4);
        const material = new THREE.MeshBasicMaterial({ map: videoTexture });
        const plane = new THREE.Mesh(geometry, material);
        anchor.group.add(plane);

        anchor.onTargetFound = () => {
          console.log('Target found, playing video');
          video.play();
        };

        anchor.onTargetLost = () => {
          console.log('Target lost, pausing video');
          video.pause();
        };

        const start = async () => {
          console.log('Starting MindAR with marker:', "${order.marker_url}");
          console.log('Video URL:', "${order.video_url}");
          await mindarThree.start();
          renderer.setAnimationLoop(() => {
            renderer.render(scene, camera);
          });
        };
        start();
      `;
      document.body.appendChild(script);
    };

    loadMindAR();
  }, [order]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center">
        <p className="text-lg">Memuat data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-100">
      <div id="ar-container" style={{ width: '100vw', height: '100vh' }} />
    </div>
  );
}
