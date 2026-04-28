import { useEffect, useRef } from 'react';

/**
 * Hilltop Ads Multi-Tag Banner Component
 * 300x250 - Works on both desktop and mobile
 */
const HilltopMultiBanner = ({ className = '' }) => {
  const adRef = useRef(null);

  useEffect(() => {
    if (adRef.current && adRef.current.children.length === 0) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = "//pricklyassociation.com/bDX/V.sYdjGxlJ0/YAWzcL/Oehme9Zu/ZVUdlSkfPmTLYK2ZOVTLkD3bN/D/YAtDNdjSYm5/OETjc/0tNcwM";
      script.async = true;
      script.settings = {};
      script.referrerPolicy = 'no-referrer-when-downgrade';
      script.setAttribute('data-cfasync', 'false');

      script.onload = () => console.log('Hilltop desktop ad script loaded');
      script.onerror = () => console.error('Failed to load Hilltop desktop ad script');

      adRef.current.appendChild(script);

      return () => {
        if (adRef.current && adRef.current.contains(script)) {
          adRef.current.removeChild(script);
        }
      };
    }
  }, []);

  return (
    <div className={`hilltop-multi-banner ${className}`}>
      <div className="text-xs text-white/40 mb-2 text-center">Advertisement</div>
      <div
        ref={adRef}
        className="min-h-[250px] w-full max-w-[300px] mx-auto"
      >
        {/* Hilltop ad will load here */}
      </div>
    </div>
  );
};

export default HilltopMultiBanner;
