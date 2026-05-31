import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

export default function ReferralAdWidget() {
  const [ads, setAds] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/referral-ads`)
      .then(r => r.json())
      .then(d => setAds(d.ads || []))
      .catch(() => {});
  }, []);

  if (!ads.length) return null;

  return (
    <div className="mt-3 space-y-2">
      {ads.map(ad => (
        <a
          key={ad.id}
          href={ad.link_url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="group block overflow-hidden border border-white/[0.08] hover:border-purple-500/30 transition-all duration-200"
        >
          <div className="relative">
            <img
              src={ad.image_url}
              alt={ad.title || 'Ad'}
              className="w-full aspect-square object-cover opacity-85 group-hover:opacity-100 transition-opacity duration-200"
            />
          </div>
          {ad.title && (
            <div className="px-3 py-2 bg-white/[0.03]">
              <p className="text-[11px] text-white/60 group-hover:text-white/80 transition-colors leading-snug line-clamp-2">
                {ad.title}
              </p>
            </div>
          )}
        </a>
      ))}
    </div>
  );
}
