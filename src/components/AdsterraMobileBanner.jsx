import { useEffect, useRef } from 'react';

/**
 * Adsterra Mobile Banner Ad Component (320x50)
 *
 * This is optimized for mobile devices and shows at the top of pages
 * for maximum visibility on phones/tablets.
 */
const AdsterraMobileBanner = ({ position = 'top', className = '' }) => {
  const adRef = useRef(null);

  useEffect(() => {
    // Load Adsterra mobile banner ad
    if (adRef.current && !adRef.current.hasAttribute('data-ad-loaded')) {
      adRef.current.setAttribute('data-ad-loaded', 'true');

      // Create atOptions script
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

      // Create invoke script
      const invokeScript = document.createElement('script');
      invokeScript.type = 'text/javascript';
      invokeScript.src = '//www.highperformanceformat.com/ad951cea811b4fbc62cf82ef7b8b0ce8/invoke.js';

      // Append scripts to ad container
      adRef.current.appendChild(atOptionsScript);
      adRef.current.appendChild(invokeScript);
    }
  }, []);

  return (
    <div className={`xl:hidden w-full flex justify-center ${className}`}>
      <div className="text-xs text-white/40 mb-2 text-center w-full">
        <div className="mb-1">Advertisement</div>
        <div
          ref={adRef}
          className="flex items-center justify-center min-h-[50px] bg-white/5 border border-white/10 rounded-lg mx-auto"
          style={{ maxWidth: '320px' }}
        >
          {/* Mobile banner ad will load here */}
        </div>
      </div>
    </div>
  );
};

export default AdsterraMobileBanner;
