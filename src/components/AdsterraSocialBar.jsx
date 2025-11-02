import { useEffect, useRef } from 'react';

/**
 * Adsterra Social Bar Ad Component
 *
 * This creates a sticky footer ad that stays at the bottom of the screen
 * as users scroll. It's visible but non-intrusive.
 *
 * Shows on all devices and all pages.
 */
const AdsterraSocialBar = () => {
  const adRef = useRef(null);

  useEffect(() => {
    // Load Adsterra social bar script
    if (adRef.current && !adRef.current.hasAttribute('data-ad-loaded')) {
      adRef.current.setAttribute('data-ad-loaded', 'true');

      // Create social bar script
      const socialBarScript = document.createElement('script');
      socialBarScript.type = 'text/javascript';
      socialBarScript.src = '//pl27975754.effectivegatecpm.com/c9/91/de/c991de2cb4ad33c5683259463e57923e.js';

      // Append script to body (social bar ads usually inject themselves)
      document.body.appendChild(socialBarScript);
    }
  }, []);

  return (
    <div ref={adRef} className="adsterra-social-bar">
      {/* Social bar will inject itself into the page */}
    </div>
  );
};

export default AdsterraSocialBar;
