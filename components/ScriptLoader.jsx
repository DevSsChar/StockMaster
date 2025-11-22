"use client"
import Script from "next/script";

const ScriptLoader = () => {
  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"
        strategy="beforeInteractive"
        onLoad={() => console.log('Three.js loaded successfully')}
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.waves.min.js"
        strategy="beforeInteractive" 
        onLoad={() => console.log('Vanta.js loaded successfully')}
      />
    </>
  );
};

export default ScriptLoader;