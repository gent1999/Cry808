import React, { useEffect, useRef } from 'react';
import AdsterraSmartlink from './AdsterraSmartlink';

const AdSidebar = () => {
  const ad1Ref = useRef(null);

  useEffect(() => {
    // Load Adsterra Ad 1 - 300x250
    if (ad1Ref.current && !ad1Ref.current.hasAttribute('data-ad-loaded')) {
      ad1Ref.current.setAttribute('data-ad-loaded', 'true');

      // Create atOptions script
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

      // Create invoke script
      const invokeScript = document.createElement('script');
      invokeScript.type = 'text/javascript';
      invokeScript.src = '//www.highperformanceformat.com/513c04d634d0a2ba825c8fe0ac47a077/invoke.js';

      // Append scripts to ad container
      ad1Ref.current.appendChild(atOptionsScript);
      ad1Ref.current.appendChild(invokeScript);
    }
  }, []);

  return (
    <div className="hidden xl:block w-80 flex-shrink-0">
      <div className="sticky top-24 space-y-6">
        {/* Adsterra Ad - 300x250 Banner */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="text-xs text-white/40 mb-2 text-center">Advertisement</div>
          <div ref={ad1Ref} className="flex items-center justify-center min-h-[250px]">
            {/* Adsterra ad will load here */}
          </div>
        </div>

        {/* Smartlink - Featured Content Card (High Earning) */}
        <AdsterraSmartlink
          type="card"
          text="Exclusive Hip-Hop Content"
        />
      </div>
    </div>
  );
};

export default AdSidebar;
