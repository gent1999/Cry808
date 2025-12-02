import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SpotifyManager = () => {
  const navigate = useNavigate();
  const [embeds, setEmbeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [pageType, setPageType] = useState('home');
  const [message, setMessage] = useState({ text: '', type: '' });

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    fetchEmbeds();
  }, []);

  const fetchEmbeds = async () => {
    try {
      const response = await fetch(`${API_URL}/api/spotify-embeds/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setEmbeds(data.embeds || []);
    } catch (error) {
      console.error('Error fetching embeds:', error);
      showMessage('Failed to fetch Spotify embeds', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!spotifyUrl) {
      showMessage('Please enter a Spotify URL', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/spotify-embeds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ spotify_url: spotifyUrl, page_type: pageType })
      });

      const data = await response.json();

      if (response.ok) {
        showMessage(data.message, 'success');
        fetchEmbeds();
        setSpotifyUrl('');
        setPageType('home');
      } else {
        showMessage(data.message || 'Error saving embed', 'error');
      }
    } catch (error) {
      console.error('Error saving embed:', error);
      showMessage('Failed to save Spotify embed', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this Spotify embed?')) return;

    try {
      const response = await fetch(`${API_URL}/api/spotify-embeds/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        showMessage(data.message, 'success');
        fetchEmbeds();
      } else {
        showMessage(data.message || 'Error deleting embed', 'error');
      }
    } catch (error) {
      console.error('Error deleting embed:', error);
      showMessage('Failed to delete Spotify embed', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading Spotify embeds...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Spotify Embed Manager</h1>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Form */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-8">
        <h3 className="text-xl font-semibold text-white mb-4">Add Spotify Embed</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/70 mb-2">
              Page Type
            </label>
            <select
              value={pageType}
              onChange={(e) => setPageType(e.target.value)}
              className="w-full px-4 py-2 bg-black/50 border border-white/20 rounded-lg text-white"
            >
              <option value="home">Home Page</option>
              <option value="article">Article Page</option>
            </select>
            <p className="text-xs text-white/50 mt-2">
              Choose which page this Spotify embed will appear on
            </p>
          </div>

          <div>
            <label className="block text-white/70 mb-2">
              Paste Spotify Link
            </label>
            <input
              type="text"
              value={spotifyUrl}
              onChange={(e) => setSpotifyUrl(e.target.value)}
              className="w-full px-4 py-2 bg-black/50 border border-white/20 rounded-lg text-white"
              placeholder="https://open.spotify.com/playlist/... or https://open.spotify.com/album/..."
              required
            />
            <p className="text-xs text-white/50 mt-2">
              📝 Just paste any Spotify link (playlist, album, track, or artist) - everything else is automatic!
            </p>
          </div>

          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition transform hover:scale-105"
          >
            Add to Sidebar
          </button>
        </form>
      </div>

      {/* List of Embeds */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Existing Embeds</h3>

        {embeds.length === 0 ? (
          <p className="text-white/50">No Spotify embeds yet. Add one above!</p>
        ) : (
          <div className="space-y-4">
            {embeds.map((embed) => (
              <div
                key={embed.id}
                className="bg-black/30 border border-white/10 rounded-lg p-4 flex items-start justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-white font-semibold">{embed.title}</h4>
                    <span className={`px-2 py-1 text-xs rounded ${
                      embed.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {embed.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded">
                      {embed.embed_type}
                    </span>
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                      {embed.page_type === 'article' ? 'Article Page' : 'Home Page'}
                    </span>
                    <span className="text-white/50 text-xs">Order: {embed.display_order}</span>
                  </div>
                  <p className="text-white/50 text-sm truncate">{embed.spotify_url}</p>
                </div>
                <div className="ml-4">
                  <button
                    onClick={() => handleDelete(embed.id)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </main>
    </div>
  );
};

export default SpotifyManager;
