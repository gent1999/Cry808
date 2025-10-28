import React, { useEffect } from 'react';

const AdSidebar = () => {
  useEffect(() => {
    // Push ads after component mounts
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  return (
    <div className="hidden xl:block w-80 flex-shrink-0">
      <div className="sticky top-24 space-y-6">
        {/* Large Rectangle Ad - 300x250 */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="text-xs text-white/40 mb-2 text-center">Advertisement</div>
          <ins
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client="ca-pub-3253360189362413"
            data-ad-slot="auto"
            data-ad-format="rectangle"
            data-full-width-responsive="true"
          ></ins>
        </div>

        {/* Half Page Ad - 300x600 */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="text-xs text-white/40 mb-2 text-center">Advertisement</div>
          <ins
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client="ca-pub-3253360189362413"
            data-ad-slot="auto"
            data-ad-format="vertical"
            data-full-width-responsive="true"
          ></ins>
        </div>
      </div>
    </div>
  );
};

export default AdSidebar;
