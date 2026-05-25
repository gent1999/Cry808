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
    amazon_home_enabled: true,
    amazon_article_enabled: true,
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
      className={`relative inline-flex h-5 w-9 items-center flex-shrink-0 transition-colors ${
        settings[settingKey] ? 'bg-green-600' : 'bg-gray-600'
      }`}
    >
      <span className={`inline-block h-3.5 w-3.5 transform bg-white transition-transform ${
        settings[settingKey] ? 'translate-x-4' : 'translate-x-0.5'
      }`} />
    </button>
  );

  const AdTable = ({ title, rows }) => (
    <div>
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1 px-1">{title}</h2>
      <table className="w-full border border-gray-700 text-sm">
        <thead>
          <tr className="bg-gray-800 text-left">
            <th className="px-3 py-2 text-xs font-medium text-gray-400 border-b border-gray-700 w-1/2">Placement</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-400 border-b border-gray-700">Size</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-400 border-b border-gray-700 text-right">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700 bg-gray-900">
          {rows.map(({ label, size, settingKey }) => (
            <tr key={settingKey} className="hover:bg-gray-800/60">
              <td className="px-3 py-2.5 text-white">{label}</td>
              <td className="px-3 py-2.5 text-gray-400 text-xs">{size}</td>
              <td className="px-3 py-2.5">
                <div className="flex items-center justify-end gap-2">
                  <span className={`text-xs ${settings[settingKey] ? 'text-green-400' : 'text-gray-500'}`}>
                    {settings[settingKey] ? 'On' : 'Off'}
                  </span>
                  <Toggle settingKey={settingKey} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const OrderTable = ({ title, rows }) => (
    <div>
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1 px-1">{title}</h2>
      <table className="w-full border border-gray-700 text-sm">
        <tbody className="divide-y divide-gray-700 bg-gray-900">
          {rows.map(({ label, settingKey }) => (
            <tr key={settingKey} className="hover:bg-gray-800/60">
              <td className="px-3 py-2 text-white">{label}</td>
              <td className="px-3 py-2 text-right">
                <input
                  type="number" min="1" max="10"
                  value={settings[settingKey] || ''}
                  onChange={(e) => handleInputChange(settingKey, e.target.value)}
                  className="w-12 px-2 py-1 bg-gray-700 border border-gray-600 text-white text-center text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-white">Ad Settings</h1>
          <div className="flex gap-2">
            <button onClick={() => navigate('/admin/dashboard')} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm transition-colors">
              ← Dashboard
            </button>
            <button onClick={handleLogout} className="px-3 py-1.5 bg-red-700 hover:bg-red-600 text-white text-sm transition-colors">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 text-white space-y-6">

        <AdTable title="Adsterra" rows={[
          { label: 'Home — Desktop Sidebar', size: '300×250', settingKey: 'adsterra_home_desktop_enabled' },
          { label: 'Home — Mobile Banner',   size: '320×50',  settingKey: 'adsterra_home_mobile_enabled' },
          { label: 'Home — Social Bar',      size: 'Sticky',  settingKey: 'adsterra_enabled' },
        ]} />

        <AdTable title="Hilltop" rows={[
          { label: 'Article — Desktop Sidebar', size: '300×250', settingKey: 'hilltop_enabled' },
        ]} />

        <AdTable title="Beatport / Loopcloud" rows={[
          { label: 'Home — Desktop Sidebar',  size: '300×250',  settingKey: 'beatport_home_desktop_enabled' },
          { label: 'Home — Mobile Banner',     size: '300×50',   settingKey: 'beatport_home_mobile_enabled' },
          { label: 'Article — Top Banner',     size: '1916×260', settingKey: 'beatport_article_desktop_enabled' },
          { label: 'Article — Bottom Banner',  size: '970×90',   settingKey: 'beatport_article_bottom_enabled' },
        ]} />

        <AdTable title="Amazon" rows={[
          { label: 'Home — Sidebar Widget',    size: 'Product cards', settingKey: 'amazon_home_enabled' },
          { label: 'Article — Sidebar Widget', size: 'Product cards', settingKey: 'amazon_article_enabled' },
        ]} />

        <div className="grid grid-cols-2 gap-6">
          <OrderTable title="Home Sidebar Order" rows={[
            { label: 'Adsterra',  settingKey: 'adsterra_order' },
            { label: 'Beatport',  settingKey: 'beatport_sidebar_order' },
            { label: 'Spotify',   settingKey: 'spotify_order' },
            { label: 'Amazon',    settingKey: 'amazon_order' },
          ]} />
          <OrderTable title="Article Sidebar Order" rows={[
            { label: 'Hilltop',  settingKey: 'hilltop_article_order' },
            { label: 'Amazon',   settingKey: 'amazon_article_order' },
            { label: 'Spotify',  settingKey: 'spotify_article_order' },
          ]} />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 font-semibold transition-colors text-sm"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>

        {message && (
          <div className={`p-3 text-sm text-center border ${
            message.includes('Error')
              ? 'border-red-700 bg-red-500/10 text-red-400'
              : 'border-green-700 bg-green-500/10 text-green-400'
          }`}>
            {message}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminSettings;
