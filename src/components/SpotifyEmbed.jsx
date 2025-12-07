import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Spotify Embed Component
 * Displays Spotify playlist/album/track embeds in sidebar
 * Fetches embeds from spotify_embeds table filtered by page type
 * @param {string} pageType - 'home' or 'article' to determine which embeds to show
 */
const SpotifyEmbed = ({ pageType = 'home' }) => {
  const [embeds, setEmbeds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmbeds = async () => {
      try {
        const response = await fetch(`${API_URL}/api/spotify-embeds?page_type=${pageType}`);
        const data = await response.json();
        setEmbeds(data.embeds || []);
      } catch (error) {
        console.error('Error fetching Spotify embeds:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmbeds();
  }, [pageType]);

  if (loading) {
    return (
      <div className="w-full space-y-4">
        {[...Array(1)].map((_, i) => (
          <div key={i} className="bg-white/5 rounded-none p-4 animate-pulse">
            <div className="h-80 bg-white/10 rounded-none"></div>
          </div>
        ))}
      </div>
    );
  }

  // Don't show if no embeds exist for this page type
  if (embeds.length === 0) {
    return null;
  }

  return (
    <div className="w-full space-y-4">
      {embeds.map((embed) => (
        <div key={embed.id} className="bg-white/5 border border-white/10 rounded-none p-4">
          <h3 className="text-white font-semibold mb-3 text-sm">{embed.title}</h3>
          <iframe
            style={{ borderRadius: '0px' }}
            src={embed.spotify_url}
            width="100%"
            height="352"
            frameBorder="0"
            allowFullScreen=""
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            title={embed.title}
          ></iframe>
        </div>
      ))}
    </div>
  );
};

export default SpotifyEmbed;
