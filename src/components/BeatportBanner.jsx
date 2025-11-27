import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

export default function BeatportBanner() {
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
  if (bannerSettings?.beatport_banner_enabled !== 'true') {
    return null;
  }

  return (
    <div className="bg-white/5 border border-white/10 p-4">
      <a
        href="https://www.loopcloud.com/cloud/subscriptions/plans?a_aid=69279c96df583&a_bid=289f80c7"
        target="_top"
        rel="noopener noreferrer"
        className="block"
      >
        <img
          src="/loopcloud_300x250.jpg"
          alt="Loopcloud Affiliate"
          width="300"
          height="250"
          className="w-full h-auto"
        />
      </a>
    </div>
  );
}
