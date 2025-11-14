import { useEffect, useRef } from 'react';

/**
 * Infolinks Ad Component
 *
 * Infolinks provides in-text advertising and other ad formats
 * that integrate seamlessly with your content.
 */
const Infolinks = ({ className = '' }) => {
  const adRef = useRef(null);

  useEffect(() => {
    console.log('🔗 Infolinks component mounted');

    // Load Infolinks ads
    if (adRef.current && !adRef.current.hasAttribute('data-ad-loaded')) {
      adRef.current.setAttribute('data-ad-loaded', 'true');

      // Create configuration script
      const configScript = document.createElement('script');
      configScript.type = 'text/javascript';
      configScript.innerHTML = `
        var infolinks_pid = 3441542;
        var infolinks_wsid = 0;
      `;

      // Create main Infolinks script
      const mainScript = document.createElement('script');
      mainScript.type = 'text/javascript';
      mainScript.src = '//resources.infolinks.com/js/infolinks_main.js';

      mainScript.onload = () => {
        console.log('✅ Infolinks script loaded');
      };

      mainScript.onerror = () => {
        console.error('❌ Infolinks script failed to load');
      };

      // Append scripts to ad container
      adRef.current.appendChild(configScript);
      adRef.current.appendChild(mainScript);

      console.log('📢 Infolinks initialization started');
    }
  }, []);

  return (
    <div ref={adRef} className={className}>
      {/* Infolinks will automatically inject ads into page content */}
    </div>
  );
};

export default Infolinks;
