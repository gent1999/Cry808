import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * SpotifyPlaylistSection
 * Full-width homepage section showing all playlists tagged page_type='playlist'.
 * Managed from Admin → Ad Settings → Spotify tab.
 * Distinct from the sidebar SpotifyEmbed (page_type='home'/'article').
 */
export default function SpotifyPlaylistSection() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/spotify-embeds?page_type=playlist&site=cry808`)
      .then(r => r.json())
      .then(d => setPlaylists(d.embeds || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || playlists.length === 0) return null;

  const cols =
    playlists.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
    playlists.length === 2 ? 'grid-cols-1 sm:grid-cols-2' :
                             'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  return (
    <div className="mb-10">
      {/* Section header */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold mb-1 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            🎧 Our Playlists
          </h2>
          <p className="text-white/40 text-xs mb-3">The sounds we're on right now</p>
          <div className="h-1 w-20 bg-gradient-to-r from-green-500 to-emerald-500"></div>
        </div>
      </div>

      {/* Playlist grid */}
      <div className={`grid gap-4 ${cols}`}>
        {playlists.map(embed => (
          <div
            key={embed.id}
            className="border border-white/[0.08] bg-white/[0.03] overflow-hidden hover:border-green-500/30 transition-colors"
          >
            <iframe
              src={embed.spotify_url}
              width="100%"
              height="352"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title={embed.title}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
