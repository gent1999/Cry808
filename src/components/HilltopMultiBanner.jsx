import { useEffect, useRef } from 'react';

/**
 * Hilltop Ads Multi-Tag Banner Component
 * 300x250 - Works on both desktop and mobile
 */
const HilltopMultiBanner = ({ className = '' }) => {
  const adRef = useRef(null);

  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (adRef.current) {
        const containerId = `hilltop-container-${Date.now()}`;

        // Create container
        const container = document.createElement('div');
        container.id = containerId;
        adRef.current.appendChild(container);

        // Create wrapper script that executes the Hilltop ad code
        const wrapperScript = document.createElement('script');
        wrapperScript.type = 'text/javascript';
        wrapperScript.innerHTML = `
          (function() {
            var d = document,
                s = d.createElement('script'),
                container = d.getElementById('${containerId}');
            s.src = "//itchytree.com/b.XSVIsgd-GQl_0/YlWucR/aeJmF9GudZxUXlBkdPoTzYh2ZOZTRkY3BN/D/YetxN/j/Yk5PO/TGcc0KNJwh";
            s.async = true;
            s.referrerPolicy = 'no-referrer-when-downgrade';
            if (container) {
              container.appendChild(s);
            }
          })();
        `;

        adRef.current.appendChild(wrapperScript);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`hilltop-multi-banner ${className}`}>
      <div className="text-xs text-white/40 mb-2 text-center">Advertisement</div>
      <div
        ref={adRef}
        className="min-h-[250px] bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-center"
      >
        {/* Hilltop ad will load here */}
      </div>
    </div>
  );
};

export default HilltopMultiBanner;
