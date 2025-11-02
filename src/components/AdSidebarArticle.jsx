import React, { useEffect, useRef } from 'react';

const AdSidebarArticle = () => {
  const adRef = useRef(null);

  useEffect(() => {
    // Load Adsterra Ad - 160x600
    if (adRef.current && !adRef.current.hasAttribute('data-ad-loaded')) {
      adRef.current.setAttribute('data-ad-loaded', 'true');

      // Create atOptions script
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

      // Create invoke script
      const invokeScript = document.createElement('script');
      invokeScript.type = 'text/javascript';
      invokeScript.src = '//www.highperformanceformat.com/38f31b9c6e8ed534955f94a07854e264/invoke.js';

      // Append scripts to ad container
      adRef.current.appendChild(atOptionsScript);
      adRef.current.appendChild(invokeScript);
    }
  }, []);

  return (
    <div className="hidden xl:block w-80 flex-shrink-0">
      <div className="sticky top-24">
        {/* Adsterra Ad - 160x600 Skyscraper */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="text-xs text-white/40 mb-2 text-center">Advertisement</div>
          <div ref={adRef} className="flex items-center justify-center min-h-[600px]">
            {/* Adsterra ad will load here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdSidebarArticle;
