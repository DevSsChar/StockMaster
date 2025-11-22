"use client"
import { useEffect, useRef } from 'react';

const VantaWaves = ({ children }) => {
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);

  useEffect(() => {
    let timeoutId;
    
    const initVanta = () => {
      if (typeof window !== 'undefined' && window.VANTA && window.THREE && vantaRef.current && !vantaEffect.current) {
        try {
          vantaEffect.current = window.VANTA.WAVES({
            el: vantaRef.current,
            THREE: window.THREE,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.00,
            scaleMobile: 1.00,
            color: 0x16213e,
            shininess: 30.00,
            waveHeight: 20.00,
            waveSpeed: 1.00,
            zoom: 0.65
          });
          console.log('Vanta Waves initialized successfully!');
        } catch (error) {
          console.error('Error initializing Vanta:', error);
        }
      } else {
        // Retry after a short delay
        timeoutId = setTimeout(initVanta, 100);
      }
    };

    // Start initialization
    timeoutId = setTimeout(initVanta, 100);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (vantaEffect.current) {
        try {
          vantaEffect.current.destroy();
        } catch (e) {
          console.log('Vanta cleanup error:', e);
        }
        vantaEffect.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={vantaRef}
      className="w-full h-full relative bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900"
      style={{ minHeight: '100vh' }}
    >
      {children}
    </div>
  );
};

export default VantaWaves;