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
    // Load Adsterra native ad
    if (adRef.current && !adRef.current.hasAttribute('data-ad-loaded')) {
      adRef.current.setAttribute('data-ad-loaded', 'true');

      // Create container div with specific ID (add timestamp to make unique)
      const uniqueId = `container-09bd789febed0d52285f37d4273b028e-${Date.now()}`;
      const containerDiv = document.createElement('div');
      containerDiv.id = uniqueId;

      // Create native ad script
      const nativeScript = document.createElement('script');
      nativeScript.async = true;
      nativeScript.setAttribute('data-cfasync', 'false');
      nativeScript.src = '//pl27975526.effectivegatecpm.com/09bd789febed0d52285f37d4273b028e/invoke.js';

      // Append to ad container
      adRef.current.appendChild(nativeScript);
      adRef.current.appendChild(containerDiv);
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
