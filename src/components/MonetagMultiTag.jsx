import React, { useEffect, useRef } from 'react';

/**
 * Monetag MultiTag Component
 *
 * Automatically shows the best ad format for each visitor
 * Zone ID: 183170
 */
const MonetagMultiTag = ({ className = '' }) => {
  const adRef = useRef(null);

  useEffect(() => {
    // Load Monetag MultiTag script
    if (adRef.current && !adRef.current.hasAttribute('data-ad-loaded')) {
      adRef.current.setAttribute('data-ad-loaded', 'true');

      const script = document.createElement('script');
      script.src = 'https://fpyf8.com/88/tag.min.js';
      script.setAttribute('data-zone', '183170');
      script.async = true;
      script.setAttribute('data-cfasync', 'false');

      adRef.current.appendChild(script);
    }
  }, []);

  return (
    <div className={`monetag-multitag ${className}`}>
      <div className="text-xs text-white/40 mb-2 text-center">Advertisement</div>
      <div
        ref={adRef}
        className="min-h-[100px] bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-center"
      >
        {/* Monetag ad will load here */}
      </div>
    </div>
  );
};

export default MonetagMultiTag;
