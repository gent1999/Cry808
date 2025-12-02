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
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-white">

        {/* Ad Networks Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="text-3xl">📢</span>
            Ad Networks
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Adsterra Card */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">Adsterra</h3>
                  <p className="text-sm text-gray-400 mt-1">Home page ads</p>
                </div>
                <button
                  onClick={() => handleToggle('adsterra_enabled')}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                    settings.adsterra_enabled ? 'bg-green-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      settings.adsterra_enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                settings.adsterra_enabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'
              }`}>
                {settings.adsterra_enabled ? 'Active' : 'Inactive'}
              </span>
            </div>

            {/* Hilltop Card */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">Hilltop Ads</h3>
                  <p className="text-sm text-gray-400 mt-1">Article page ads</p>
                </div>
                <button
                  onClick={() => handleToggle('hilltop_enabled')}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                    settings.hilltop_enabled ? 'bg-green-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      settings.hilltop_enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                settings.hilltop_enabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'
              }`}>
                {settings.hilltop_enabled ? 'Active' : 'Inactive'}
              </span>
            </div>

            {/* Monetag Card */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">Monetag</h3>
                  <p className="text-sm text-gray-400 mt-1">Future use</p>
                </div>
                <button
                  onClick={() => handleToggle('monetag_enabled')}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                    settings.monetag_enabled ? 'bg-green-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      settings.monetag_enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                settings.monetag_enabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'
              }`}>
                {settings.monetag_enabled ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        {/* Beatport/Loopcloud Banners Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="text-3xl">🎨</span>
            Beatport/Loopcloud Banners
          </h2>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Home Desktop */}
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">Home - Desktop Sidebar</h4>
                    <p className="text-xs text-gray-400 mt-1">300x250</p>
                    <p className="text-xs text-gray-500">loopcloud_300x250.jpg</p>
                  </div>
                  <button
                    onClick={() => handleToggle('beatport_home_desktop_enabled')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.beatport_home_desktop_enabled ? 'bg-green-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.beatport_home_desktop_enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Home Mobile */}
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">Home - Mobile Banner</h4>
                    <p className="text-xs text-gray-400 mt-1">300x50</p>
                    <p className="text-xs text-gray-500">loopcloud_300x50.jpg</p>
                  </div>
                  <button
                    onClick={() => handleToggle('beatport_home_mobile_enabled')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.beatport_home_mobile_enabled ? 'bg-green-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.beatport_home_mobile_enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Article Top */}
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">Article - Top Banner</h4>
                    <p className="text-xs text-gray-400 mt-1">1916x260 (above content)</p>
                    <p className="text-xs text-gray-500">loopcloud_1916x260.jpg</p>
                  </div>
                  <button
                    onClick={() => handleToggle('beatport_article_desktop_enabled')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.beatport_article_desktop_enabled ? 'bg-green-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.beatport_article_desktop_enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Article Bottom */}
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">Article - Bottom Banner</h4>
                    <p className="text-xs text-gray-400 mt-1">970x90 (below video)</p>
                    <p className="text-xs text-gray-500">loopcloud_970x90.jpg</p>
                  </div>
                  <button
                    onClick={() => handleToggle('beatport_article_bottom_enabled')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.beatport_article_bottom_enabled ? 'bg-green-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.beatport_article_bottom_enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Sidebar Order Sections */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="text-3xl">📊</span>
            Sidebar Display Order
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Home Page Sidebar Order */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold mb-2 text-white">Home Page Sidebar</h3>
              <p className="text-sm text-gray-400 mb-4">Lower numbers appear higher on the page</p>

              <div className="space-y-3">
                {/* Adsterra Order - Only show if enabled */}
                {settings.adsterra_enabled && (
                  <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                    <div className="flex items-center justify-between">
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
                        className="w-16 px-3 py-1.5 bg-gray-800 border border-gray-600 rounded-md text-white text-center text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                )}

                {/* Beatport Sidebar Order - Only show if enabled */}
                {settings.beatport_home_desktop_enabled && (
                  <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                    <div className="flex items-center justify-between">
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
                        className="w-16 px-3 py-1.5 bg-gray-800 border border-gray-600 rounded-md text-white text-center text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                )}

                {/* Spotify Order - Always shown */}
                <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <label htmlFor="spotify_order" className="text-sm font-medium text-white">
                      Spotify Embed
                    </label>
                    <input
                      id="spotify_order"
                      type="number"
                      min="1"
                      max="10"
                      value={settings.spotify_order}
                      onChange={(e) => handleInputChange('spotify_order', e.target.value)}
                      className="w-16 px-3 py-1.5 bg-gray-800 border border-gray-600 rounded-md text-white text-center text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {/* Amazon Order - Always shown */}
                <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                  <div className="flex items-center justify-between">
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
                      className="w-16 px-3 py-1.5 bg-gray-800 border border-gray-600 rounded-md text-white text-center text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Article Page Sidebar Order */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold mb-2 text-white">Article Page Sidebar</h3>
              <p className="text-sm text-gray-400 mb-4">Lower numbers appear higher on the page</p>

              <div className="space-y-3">
                {/* Hilltop Order - Only show if enabled */}
                {settings.hilltop_enabled && (
                  <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                    <div className="flex items-center justify-between">
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
                        className="w-16 px-3 py-1.5 bg-gray-800 border border-gray-600 rounded-md text-white text-center text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                )}

                {/* Amazon Article Order - Always shown */}
                <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                  <div className="flex items-center justify-between">
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
                      className="w-16 px-3 py-1.5 bg-gray-800 border border-gray-600 rounded-md text-white text-center text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {/* Spotify Article Order - Always shown */}
                <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <label htmlFor="spotify_article_order" className="text-sm font-medium text-white">
                      Spotify Embed
                    </label>
                    <input
                      id="spotify_article_order"
                      type="number"
                      min="1"
                      max="10"
                      value={settings.spotify_article_order}
                      onChange={(e) => handleInputChange('spotify_article_order', e.target.value)}
                      className="w-16 px-3 py-1.5 bg-gray-800 border border-gray-600 rounded-md text-white text-center text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
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
      </main>
    </div>
  );
};

export default AdminSettings;
