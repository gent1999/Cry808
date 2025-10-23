import React from 'react';

const AdSidebar = () => {
  return (
    <div className="hidden xl:block w-80 flex-shrink-0">
      <div className="sticky top-24 space-y-6">
        {/* Large Rectangle Ad - 300x250 */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="text-xs text-white/40 mb-2 text-center">Advertisement</div>
          <div className="w-full h-64 bg-white/10 rounded flex items-center justify-center">
            <div className="text-center text-white/30">
              <p className="text-sm mb-2">Google AdSense</p>
              <p className="text-xs">300 x 250</p>
              {/* Replace this div with your Google AdSense code */}
              {/* Example:
              <ins className="adsbygoogle"
                   style={{display: 'block'}}
                   data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                   data-ad-slot="XXXXXXXXXX"
                   data-ad-format="auto"
                   data-full-width-responsive="true"></ins>
              */}
            </div>
          </div>
        </div>

        {/* Half Page Ad - 300x600 */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="text-xs text-white/40 mb-2 text-center">Advertisement</div>
          <div className="w-full h-[600px] bg-white/10 rounded flex items-center justify-center">
            <div className="text-center text-white/30">
              <p className="text-sm mb-2">Google AdSense</p>
              <p className="text-xs">300 x 600</p>
              {/* Replace this div with your Google AdSense code */}
              {/* Example:
              <ins className="adsbygoogle"
                   style={{display: 'block'}}
                   data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                   data-ad-slot="XXXXXXXXXX"
                   data-ad-format="auto"
                   data-full-width-responsive="true"></ins>
              */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdSidebar;
