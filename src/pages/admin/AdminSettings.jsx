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
    adsterra_home_desktop_enabled: true,
    adsterra_home_mobile_enabled: true,
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

  const Toggle = ({ settingKey }) => (
    <button
      onClick={() => handleToggle(settingKey)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 ${
        settings[settingKey] ? 'bg-green-600' : 'bg-gray-600'
      }`}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
        settings[settingKey] ? 'translate-x-4' : 'translate-x-0.5'
      }`} />
    </button>
  );

  const Row = ({ label, size, network, settingKey }) => (
    <div className="flex items-center justify-between py-2 px-3 rounded hover:bg-gray-700/40">
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-xs font-medium text-gray-400 w-16 flex-shrink-0">{network}</span>
        <span className="text-sm text-white truncate">{label}</span>
        {size && <span className="text-xs text-gray-500 flex-shrink-0">{size}</span>}
      </div>
      <div className="flex items-center gap-2 ml-3 flex-shrink-0">
        <span className={`text-xs ${settings[settingKey] ? 'text-green-400' : 'text-gray-500'}`}>
          {settings[settingKey] ? 'On' : 'Off'}
        </span>
        <Toggle settingKey={settingKey} />
      </div>
    </div>
  );

  const OrderInput = ({ label, settingKey }) => (
    <div className="flex items-center justify-between py-1.5 px-3">
      <span className="text-sm text-gray-300">{label}</span>
      <input
        type="number" min="1" max="10"
        value={settings[settingKey] || ''}
        onChange={(e) => handleInputChange(settingKey, e.target.value)}
        className="w-12 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-center text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
      />
    </div>
  );

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
      <main className="max-w-2xl mx-auto px-4 py-6 text-white">

        <div className="space-y-4">

          {/* Ad Placements */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-gray-700 bg-gray-750">
              <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Ad Placements</h2>
            </div>
            <div className="divide-y divide-gray-700/50">
              <Row label="Home — Desktop Sidebar" size="300×250" network="Adsterra" settingKey="adsterra_home_desktop_enabled" />
              <Row label="Home — Mobile Banner" size="320×50" network="Adsterra" settingKey="adsterra_home_mobile_enabled" />
              <Row label="Home — Social Bar" size="sticky" network="Adsterra" settingKey="adsterra_enabled" />
              <Row label="Article — Desktop Sidebar" size="300×250" network="Hilltop" settingKey="hilltop_enabled" />
              <Row label="Home — Desktop Sidebar" size="300×250" network="Beatport" settingKey="beatport_home_desktop_enabled" />
              <Row label="Home — Mobile Banner" size="300×50" network="Beatport" settingKey="beatport_home_mobile_enabled" />
              <Row label="Article — Top Banner" size="1916×260" network="Beatport" settingKey="beatport_article_desktop_enabled" />
              <Row label="Article — Bottom Banner" size="970×90" network="Beatport" settingKey="beatport_article_bottom_enabled" />
            </div>
          </div>

          {/* Sidebar Order */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              <div className="px-4 py-2.5 border-b border-gray-700">
                <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Home Sidebar Order</h2>
              </div>
              <div className="divide-y divide-gray-700/50 py-1">
                <OrderInput label="Adsterra" settingKey="adsterra_order" />
                <OrderInput label="Beatport" settingKey="beatport_sidebar_order" />
                <OrderInput label="Spotify" settingKey="spotify_order" />
                <OrderInput label="Amazon" settingKey="amazon_order" />
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              <div className="px-4 py-2.5 border-b border-gray-700">
                <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Article Sidebar Order</h2>
              </div>
              <div className="divide-y divide-gray-700/50 py-1">
                <OrderInput label="Hilltop" settingKey="hilltop_article_order" />
                <OrderInput label="Amazon" settingKey="amazon_article_order" />
                <OrderInput label="Spotify" settingKey="spotify_article_order" />
              </div>
            </div>
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-lg font-semibold transition-colors text-sm"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>

          {message && (
            <div className={`p-3 rounded-lg text-sm text-center ${
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
