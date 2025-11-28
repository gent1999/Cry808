import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

export default function BeatportArticleTopBanner({ className = '' }) {
  const [bannerSettings, setBannerSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBannerSettings = async () => {
      try {
        const response = await fetch(`${API_URL}/api/settings/public`);
        if (!response.ok) {
          throw new Error('Failed to fetch settings');
        }
        const data = await response.json();
        setBannerSettings(data.settings);
      } catch (error) {
        console.error('Error fetching banner settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBannerSettings();
  }, []);

  if (loading) {
    return null;
  }

  // Check if enabled (value is stored as string 'true' or 'false')
  if (bannerSettings?.beatport_article_bottom_enabled !== 'true') {
    return null;
  }

  return (
    <div className={`hidden xl:block ${className}`}>
      <div className="flex justify-center">
        <a
          href="https://www.loopcloud.com/cloud/subscriptions/plans?a_aid=69279c96df583&a_bid=838bdb4a"
          target="_top"
          rel="noopener noreferrer"
          className="block bg-white/5 border border-white/10 overflow-hidden hover:border-purple-500/50 transition-all"
        >
          <img
            src="/loopcloud_970x90.jpg"
            alt="Loopcloud"
            width="970"
            height="90"
            className="w-full h-auto"
          />
        </a>
      </div>
    </div>
  );
}
