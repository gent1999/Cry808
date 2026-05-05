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
          'key': 'ad951cea811b4fbc62cf82ef7b8b0ce8',
          'format': 'iframe',
          'height': 50,
          'width': 320,
          'params': {}
        };
      `;

      const invokeScript = document.createElement('script');
      invokeScript.type = 'text/javascript';
      invokeScript.src = 'https://www.highperformanceformat.com/ad951cea811b4fbc62cf82ef7b8b0ce8/invoke.js';

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
        style={{ width: '320px', minHeight: '50px' }}
      />
    </div>
  );
};

export default AdsterraMobileBanner;
