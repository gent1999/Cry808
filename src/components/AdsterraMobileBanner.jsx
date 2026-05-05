import { useEffect, useRef } from 'react';

const AdsterraMobileBanner = ({ className = '' }) => {
  const adRef = useRef(null);

  useEffect(() => {
    if (adRef.current && !adRef.current.hasAttribute('data-ad-loaded')) {
      adRef.current.setAttribute('data-ad-loaded', 'true');

      const atOptionsScript = document.createElement('script');
      atOptionsScript.type = 'text/javascript';
      atOptionsScript.innerHTML = `
        atOptions = {
          'key': '38f31b9c6e8ed534955f94a07854e264',
          'format': 'iframe',
          'height': 600,
          'width': 160,
          'params': {}
        };
      `;

      const invokeScript = document.createElement('script');
      invokeScript.type = 'text/javascript';
      invokeScript.src = 'https://www.highperformanceformat.com/38f31b9c6e8ed534955f94a07854e264/invoke.js';

      adRef.current.appendChild(atOptionsScript);
      adRef.current.appendChild(invokeScript);
    }
  }, []);

  return (
    <div className={`xl:hidden w-full flex flex-col items-center ${className}`}>
      <div className="text-xs text-white/40 mb-2">Advertisement</div>
      <div
        ref={adRef}
        className="flex items-center justify-center bg-white/5 border border-white/10"
        style={{ width: '160px', minHeight: '600px' }}
      />
    </div>
  );
};

export default AdsterraMobileBanner;
