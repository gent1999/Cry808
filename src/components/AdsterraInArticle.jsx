import React, { useEffect, useRef } from 'react';

/**
 * Adsterra In-Article Ad Component
 *
 * This component is designed to be placed within article content
 * for better ad visibility and engagement.
 *
 * Recommended placements:
 * - After the first 2-3 paragraphs of an article
 * - Between article sections
 * - Before the conclusion
 */
const AdsterraInArticle = () => {
  const adRef = useRef(null);

  useEffect(() => {
    // Load Adsterra in-article ad
    if (adRef.current && !adRef.current.hasAttribute('data-ad-loaded')) {
      adRef.current.setAttribute('data-ad-loaded', 'true');

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
      adRef.current.appendChild(atOptionsScript);
      adRef.current.appendChild(invokeScript);
    }
  }, []);

  return (
    <div className="my-8 py-6 border-y border-white/10">
      <div className="text-xs text-white/40 mb-3 text-center">Advertisement</div>
      <div
        ref={adRef}
        className="flex items-center justify-center min-h-[250px] bg-white/5 border border-white/10 rounded-lg"
      >
        {/* Adsterra ad will load here */}
      </div>
    </div>
  );
};

export default AdsterraInArticle;
