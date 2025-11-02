import React from 'react';

/**
 * Adsterra Smartlink Component
 *
 * Smartlinks automatically optimize to show the highest-paying ad format
 * for each visitor. They work best when disguised as natural content.
 *
 * Props:
 * - type: 'button' | 'card' | 'banner' | 'text-link'
 * - text: Custom text to display
 * - className: Additional CSS classes
 */
const AdsterraSmartlink = ({
  type = 'button',
  text = 'View More',
  className = ''
}) => {
  const smartlinkUrl = 'https://www.effectivegatecpm.com/wq9c2ekgta?key=17aa5d02788d061181c61dde77d721b6';

  const handleClick = (e) => {
    e.preventDefault();
    window.open(smartlinkUrl, '_blank', 'noopener,noreferrer');
  };

  // Button style (CTA)
  if (type === 'button') {
    return (
      <a
        href={smartlinkUrl}
        onClick={handleClick}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={`inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg ${className}`}
      >
        {text}
      </a>
    );
  }

  // Featured content card
  if (type === 'card') {
    return (
      <a
        href={smartlinkUrl}
        onClick={handleClick}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={`block bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-lg p-6 hover:border-purple-500/50 transition-all cursor-pointer ${className}`}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <div className="text-xs text-purple-400 font-semibold">SPONSORED</div>
            <div className="text-sm text-white/70">Featured Content</div>
          </div>
        </div>
        <h3 className="text-white font-bold mb-2">{text}</h3>
        <p className="text-white/60 text-sm mb-3">
          Discover exclusive content and opportunities curated for hip-hop fans.
        </p>
        <div className="text-purple-400 text-sm font-semibold flex items-center gap-1">
          Learn More
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </a>
    );
  }

  // Banner style
  if (type === 'banner') {
    return (
      <a
        href={smartlinkUrl}
        onClick={handleClick}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={`block bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg p-4 hover:border-purple-500/50 transition-all ${className}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="text-xs text-purple-400 mb-1">SPONSORED</div>
            <div className="text-white font-semibold">{text}</div>
          </div>
          <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>
      </a>
    );
  }

  // Text link style
  return (
    <a
      href={smartlinkUrl}
      onClick={handleClick}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={`text-purple-400 hover:text-purple-300 underline transition-colors ${className}`}
    >
      {text}
    </a>
  );
};

export default AdsterraSmartlink;
