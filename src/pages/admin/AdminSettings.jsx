import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

const AdminSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [settings, setSettings] = useState({
    adsterra_enabled: false,
    hilltop_enabled: true,
    monetag_enabled: false,
    beatport_banner_enabled: false,
    beatport_home_desktop_enabled: false,
    beatport_home_mobile_enabled: false,
    beatport_article_desktop_enabled: false,
    beatport_article_bottom_enabled: false,
    adsterra_order: '1',
    beatport_sidebar_order: '2',
    spotify_order: '3',
    amazon_order: '4',
    hilltop_article_order: '1',
    amazon_article_order: '2',
    spotify_article_order: '3'
  });

  useEffect(() => {
    const verifyAdmin = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      try {
        // Fetch current settings
        const response = await fetch(`${API_URL}/api/admin/settings`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch settings');
        }

        const data = await response.json();
        // Convert string 'true'/'false' to boolean for UI
        const convertedSettings = {};
        Object.entries(data.settings).forEach(([key, value]) => {
          if (value === 'true' || value === 'false') {
            convertedSettings[key] = value === 'true';
          } else {
            convertedSettings[key] = value;
          }
        });
        setSettings(convertedSettings);
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
      }
    };

    verifyAdmin();
  }, [navigate]);

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleInputChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    const token = localStorage.getItem('adminToken');

    try {
      // Convert boolean values back to strings for storage
      const convertedSettings = {};
      Object.entries(settings).forEach(([key, value]) => {
        if (typeof value === 'boolean') {
          convertedSettings[key] = value.toString();
        } else {
          convertedSettings[key] = value;
        }
      });

      const response = await fetch(`${API_URL}/api/admin/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ settings: convertedSettings }),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error saving settings: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Ad Network Settings</h1>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-white">

        {/* Settings Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
          <h2 className="text-2xl font-semibold mb-6">Ad Networks</h2>

          {/* Adsterra */}
          <div className="flex items-center justify-between py-4 border-b border-white/10">
            <div>
              <h3 className="text-lg font-medium">Adsterra</h3>
              <p className="text-sm text-white/60">Enable Adsterra ads on the home page</p>
            </div>
            <button
              onClick={() => handleToggle('adsterra_enabled')}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                settings.adsterra_enabled ? 'bg-green-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  settings.adsterra_enabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Hilltop */}
          <div className="flex items-center justify-between py-4 border-b border-white/10">
            <div>
              <h3 className="text-lg font-medium">Hilltop Ads</h3>
              <p className="text-sm text-white/60">Enable Hilltop ads on article detail pages</p>
            </div>
            <button
              onClick={() => handleToggle('hilltop_enabled')}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                settings.hilltop_enabled ? 'bg-green-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  settings.hilltop_enabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Monetag */}
          <div className="flex items-center justify-between py-4 border-b border-white/10">
            <div>
              <h3 className="text-lg font-medium">Monetag</h3>
              <p className="text-sm text-white/60">Enable Monetag ads (future use)</p>
            </div>
            <button
              onClick={() => handleToggle('monetag_enabled')}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                settings.monetag_enabled ? 'bg-green-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  settings.monetag_enabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Beatport/Loopcloud Banners */}
          <div className="py-4 border-t border-white/10">
            <h3 className="text-lg font-medium mb-4">Beatport/Loopcloud Banners</h3>

            {/* Home Desktop 300x250 */}
            <div className="flex items-center justify-between py-3 pl-4">
              <div>
                <h4 className="text-base font-medium">Home - Desktop Sidebar</h4>
                <p className="text-sm text-white/60">300x250 (loopcloud_300x250.jpg)</p>
              </div>
              <button
                onClick={() => handleToggle('beatport_home_desktop_enabled')}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  settings.beatport_home_desktop_enabled ? 'bg-green-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    settings.beatport_home_desktop_enabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Home Mobile 300x50 */}
            <div className="flex items-center justify-between py-3 pl-4">
              <div>
                <h4 className="text-base font-medium">Home - Mobile Banner</h4>
                <p className="text-sm text-white/60">300x50 (loopcloud_300x50.jpg)</p>
              </div>
              <button
                onClick={() => handleToggle('beatport_home_mobile_enabled')}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  settings.beatport_home_mobile_enabled ? 'bg-green-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    settings.beatport_home_mobile_enabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Article Top Banner 1916x260 */}
            <div className="flex items-center justify-between py-3 pl-4">
              <div>
                <h4 className="text-base font-medium">Article - Top Banner</h4>
                <p className="text-sm text-white/60">1916x260 (above article & sidebar)</p>
                <p className="text-xs text-white/40 mt-1">loopcloud_1916x260.jpg</p>
              </div>
              <button
                onClick={() => handleToggle('beatport_article_desktop_enabled')}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  settings.beatport_article_desktop_enabled ? 'bg-green-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    settings.beatport_article_desktop_enabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Article Bottom Banner 970x90 */}
            <div className="flex items-center justify-between py-3 pl-4">
              <div>
                <h4 className="text-base font-medium">Article - Bottom Banner</h4>
                <p className="text-sm text-white/60">970x90 (below video)</p>
                <p className="text-xs text-white/40 mt-1">loopcloud_970x90.jpg</p>
              </div>
              <button
                onClick={() => handleToggle('beatport_article_bottom_enabled')}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  settings.beatport_article_bottom_enabled ? 'bg-green-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    settings.beatport_article_bottom_enabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Home Page Sidebar Order */}
          <div className="py-4 border-t border-white/10 mt-6">
            <h3 className="text-lg font-medium mb-4">Home Page Sidebar Order</h3>
            <p className="text-sm text-white/60 mb-4">Set the display order for enabled sidebar components. Lower numbers appear higher.</p>

            <div className="space-y-3">
              {/* Adsterra Order - Only show if enabled */}
              {settings.adsterra_enabled && (
                <div className="flex items-center justify-between py-2">
                  <label htmlFor="adsterra_order" className="text-sm font-medium text-white">
                    Adsterra Ads
                  </label>
                  <input
                    id="adsterra_order"
                    type="number"
                    min="1"
                    max="10"
                    value={settings.adsterra_order}
                    onChange={(e) => handleInputChange('adsterra_order', e.target.value)}
                    className="w-20 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}

              {/* Beatport Sidebar Order - Only show if enabled */}
              {settings.beatport_home_desktop_enabled && (
                <div className="flex items-center justify-between py-2">
                  <label htmlFor="beatport_sidebar_order" className="text-sm font-medium text-white">
                    Beatport/Loopcloud Banner
                  </label>
                  <input
                    id="beatport_sidebar_order"
                    type="number"
                    min="1"
                    max="10"
                    value={settings.beatport_sidebar_order}
                    onChange={(e) => handleInputChange('beatport_sidebar_order', e.target.value)}
                    className="w-20 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}

              {/* Spotify Order - Always shown */}
              <div className="flex items-center justify-between py-2">
                <label htmlFor="spotify_order" className="text-sm font-medium text-white">
                  Spotify Embed (HOME PAGE ONLY)
                </label>
                <input
                  id="spotify_order"
                  type="number"
                  min="1"
                  max="10"
                  value={settings.spotify_order}
                  onChange={(e) => handleInputChange('spotify_order', e.target.value)}
                  className="w-20 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Amazon Order - Always shown */}
              <div className="flex items-center justify-between py-2">
                <label htmlFor="amazon_order" className="text-sm font-medium text-white">
                  Amazon Products
                </label>
                <input
                  id="amazon_order"
                  type="number"
                  min="1"
                  max="10"
                  value={settings.amazon_order}
                  onChange={(e) => handleInputChange('amazon_order', e.target.value)}
                  className="w-20 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Article Page Sidebar Order */}
          <div className="py-4 border-t border-white/10 mt-6">
            <h3 className="text-lg font-medium mb-4">Article Page Sidebar Order</h3>
            <p className="text-sm text-white/60 mb-4">Set the display order for enabled sidebar components. Lower numbers appear higher.</p>

            <div className="space-y-3">
              {/* Hilltop Order - Only show if enabled */}
              {settings.hilltop_enabled && (
                <div className="flex items-center justify-between py-2">
                  <label htmlFor="hilltop_article_order" className="text-sm font-medium text-white">
                    Hilltop Ads
                  </label>
                  <input
                    id="hilltop_article_order"
                    type="number"
                    min="1"
                    max="10"
                    value={settings.hilltop_article_order}
                    onChange={(e) => handleInputChange('hilltop_article_order', e.target.value)}
                    className="w-20 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}

              {/* Amazon Article Order - Always shown */}
              <div className="flex items-center justify-between py-2">
                <label htmlFor="amazon_article_order" className="text-sm font-medium text-white">
                  Amazon Products
                </label>
                <input
                  id="amazon_article_order"
                  type="number"
                  min="1"
                  max="10"
                  value={settings.amazon_article_order}
                  onChange={(e) => handleInputChange('amazon_article_order', e.target.value)}
                  className="w-20 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Spotify Article Order - Always shown */}
              <div className="flex items-center justify-between py-2">
                <label htmlFor="spotify_article_order" className="text-sm font-medium text-white">
                  Spotify Embed (ARTICLE PAGE ONLY)
                </label>
                <input
                  id="spotify_article_order"
                  type="number"
                  min="1"
                  max="10"
                  value={settings.spotify_article_order}
                  onChange={(e) => handleInputChange('spotify_article_order', e.target.value)}
                  className="w-20 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-8">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-lg font-semibold transition-colors"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>

          {/* Message */}
          {message && (
            <div className={`mt-4 p-4 rounded-lg ${
              message.includes('Error') ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
            }`}>
              {message}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminSettings;
