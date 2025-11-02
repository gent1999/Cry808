import { useEffect, useRef } from 'react';

/**
 * Adsterra Native Banner Ad Component
 *
 * This component displays native ads that blend with your content.
 * Native ads typically have higher CTR (click-through rates) and earnings.
 *
 * Props:
 * - className: Additional CSS classes
 * - showLabel: Whether to show "Advertisement" label (default: true)
 */
const AdsterraNative = ({ className = '', showLabel = true }) => {
  const adRef = useRef(null);

  useEffect(() => {
    // Load Adsterra 300x250 banner ad
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
    <div className={`adsterra-native-ad ${className}`}>
      {showLabel && (
        <div className="text-xs text-white/40 mb-2 text-center">Advertisement</div>
      )}
      <div
        ref={adRef}
        className="min-h-[250px] bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-center"
      >
        {/* Native ad will load here */}
      </div>
    </div>
  );
};

export default AdsterraNative;
