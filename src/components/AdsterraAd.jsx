import { useEffect, useRef } from 'react';

/**
 * Adsterra Ad Component
 *
 * Usage:
 * 1. Sign up at https://publishers.adsterra.com/
 * 2. Get your ad code from Adsterra dashboard
 * 3. Replace the placeholder code below with your actual ad code
 *
 * Props:
 * - type: 'banner' | 'sidebar' | 'native' | 'in-article'
 * - className: Additional CSS classes
 */
const AdsterraAd = ({ type = 'banner', className = '' }) => {
  const adRef = useRef(null);

  useEffect(() => {
    // Ad script will be loaded here once you get your Adsterra code
    // This prevents the ad from loading multiple times on re-renders
    if (adRef.current && !adRef.current.hasChildNodes()) {
      try {
        // The ad script will be injected here
        // Example: (atOptions script from Adsterra)
      } catch (error) {
        console.error('Error loading Adsterra ad:', error);
      }
    }
  }, []);

  // Different ad sizes based on type
  const getAdDimensions = () => {
    switch (type) {
      case 'banner':
        return 'min-h-[90px] md:min-h-[120px]'; // 728x90 or 970x90
      case 'sidebar':
        return 'min-h-[250px] w-full max-w-[300px]'; // 300x250
      case 'native':
        return 'min-h-[100px]'; // Responsive native ad
      case 'in-article':
        return 'min-h-[250px]'; // 300x250 or responsive
      default:
        return 'min-h-[90px]';
    }
  };

  return (
    <div className={`adsterra-ad ${getAdDimensions()} ${className}`}>
      {/* Placeholder until you add your Adsterra code */}
      <div ref={adRef} className="w-full h-full flex items-center justify-center bg-gray-800/30 border border-gray-700/50 rounded-lg">
        <div className="text-center text-white/50 text-sm p-4">
          <p className="mb-2">📢 Ad Space</p>
          <p className="text-xs">Replace with your Adsterra ad code</p>
        </div>
      </div>

      {/*
        INSTRUCTIONS: After signing up with Adsterra, replace the placeholder div above with:

        <div ref={adRef}></div>

        Then add this script tag configuration in your useEffect:

        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;

        // For banner ads, add atOptions configuration:
        const atOptions = {
          key: 'YOUR_AD_KEY_HERE',
          format: 'iframe',
          height: 90,
          width: 728,
          params: {}
        };
        script.innerHTML = `atOptions = ${JSON.stringify(atOptions)};`;

        const invokeScript = document.createElement('script');
        invokeScript.type = 'text/javascript';
        invokeScript.src = '//www.topcreativeformat.com/YOUR_INVOKE_KEY/invoke.js';

        if (adRef.current) {
          adRef.current.appendChild(script);
          adRef.current.appendChild(invokeScript);
        }
      */}
    </div>
  );
};

export default AdsterraAd;
