import { useEffect, useRef } from 'react';

/**
 * Hilltop Ads In-Page Push Component
 * In-page push notification ad
 */
const HilltopInPagePush = () => {
  const adRef = useRef(null);

  useEffect(() => {
    if (adRef.current && adRef.current.children.length === 0) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.text = `
        (function(pqjpqy){
          var d = document,
              s = d.createElement('script'),
              l = d.scripts[d.scripts.length - 1];
          s.settings = pqjpqy || {};
          s.src = "//itchytree.com/bSXsVts.dOGhlC0/YaWUcZ/bebm/9jucZ/UulJkcPPToYc3fMlDZA/1aMgz_c/tsN/jocuw/MaDPUszROiAE";
          s.async = true;
          s.referrerPolicy = 'no-referrer-when-downgrade';
          l.parentNode.insertBefore(s, l);
        })({})
      `;

      adRef.current.appendChild(script);
    }
  }, []);

  return (
    <div ref={adRef} style={{ display: 'none' }}>
      {/* Hilltop in-page push ad will load here */}
    </div>
  );
};

export default HilltopInPagePush;
