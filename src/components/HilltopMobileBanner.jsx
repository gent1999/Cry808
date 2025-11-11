import { useEffect, useRef } from 'react';

/**
 * Hilltop Ads Mobile Banner Component
 * 300x100 - Mobile only
 */
const HilltopMobileBanner = ({ className = '' }) => {
  const adRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (adRef.current && adRef.current.children.length === 0) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = "//itchytree.com/bNXzVZs.dEG/lu0YYiWjcs/-eXmQ9buEZlU/lfkpPITJY_3IMSDdA/0/NBjHIwtYNxjjcbwRMmDLQN2gMzwS";
        script.async = true;
        script.setAttribute('data-cfasync', 'false');

        script.onload = () => {
          console.log('Hilltop mobile ad script loaded');
          console.log('Mobile ad container contents:', adRef.current?.innerHTML);
        };
        script.onerror = () => console.error('Failed to load Hilltop mobile ad script');

        adRef.current.appendChild(script);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`hilltop-mobile-banner ${className}`}>
      <div className="text-xs text-white/40 mb-2 text-center">Advertisement</div>
      <div
        ref={adRef}
        id="hilltop-mobile-ad-zone"
        className="min-h-[100px] w-full max-w-[300px] mx-auto"
        style={{ minHeight: '100px', width: '300px', maxWidth: '100%', margin: '0 auto' }}
      >
        {/* Hilltop mobile ad will load here */}
      </div>
    </div>
  );
};

export default HilltopMobileBanner;
