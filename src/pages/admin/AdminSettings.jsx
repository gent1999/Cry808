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
    beatport_banner_enabled: false
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Ad Network Settings</h1>
          <div className="space-x-4">
            <button
              onClick={() => navigate('/admin')}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Back to Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

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

          {/* Beatport/Loopcloud Banner */}
          <div className="flex items-center justify-between py-4">
            <div>
              <h3 className="text-lg font-medium">Beatport/Loopcloud Banner</h3>
              <p className="text-sm text-white/60">300x250 affiliate banner on home page sidebar</p>
            </div>
            <button
              onClick={() => handleToggle('beatport_banner_enabled')}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                settings.beatport_banner_enabled ? 'bg-green-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  settings.beatport_banner_enabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
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
      </div>
    </div>
  );
};

export default AdminSettings;
