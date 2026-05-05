import { useEffect, useRef } from 'react';

const AdsterraNative = ({ className = '' }) => {
  const adRef = useRef(null);

  useEffect(() => {
    if (adRef.current && !adRef.current.hasAttribute('data-ad-loaded')) {
      adRef.current.setAttribute('data-ad-loaded', 'true');

      const atOptionsScript = document.createElement('script');
      atOptionsScript.type = 'text/javascript';
      atOptionsScript.innerHTML = `
        atOptions = {
          'key': '513c04d634d0a2ba825c8fe0ac47a077',
          'format': 'iframe',
          'height': 250,
          'width': 300,
          'params': {}
        };
      `;

      const invokeScript = document.createElement('script');
      invokeScript.type = 'text/javascript';
      invokeScript.src = 'https://www.highperformanceformat.com/513c04d634d0a2ba825c8fe0ac47a077/invoke.js';

      adRef.current.appendChild(atOptionsScript);
      adRef.current.appendChild(invokeScript);
    }
  }, []);

  return (
    <div className={className}>
      <div className="text-xs text-white/40 mb-2 text-center">Advertisement</div>
      <div
        ref={adRef}
        className="flex items-center justify-center bg-white/5 border border-white/10"
        style={{ width: '300px', minHeight: '250px' }}
      />
    </div>
  );
};

export default AdsterraNative;
