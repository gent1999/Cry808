import { useState, useEffect, useRef } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

const GeniusLyricsPanel = ({ geniusUrl }) => {
  const [songId, setSongId] = useState(null);
  const [title, setTitle]   = useState(null);
  const scriptLoadedRef     = useRef(false);

  // Try to get song ID for the embed widget — panel shows regardless
  useEffect(() => {
    if (!geniusUrl) return;

    fetch(`${API_URL}/api/genius-embed?url=${encodeURIComponent(geniusUrl)}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.songId) {
          setSongId(data.songId);
          setTitle(data.title);
        }
      })
      .catch(() => {});
  }, [geniusUrl]);

  // Dynamically load the Genius embed script once we have the song ID
  useEffect(() => {
    if (!songId || scriptLoadedRef.current) return;
    scriptLoadedRef.current = true;

    const script = document.createElement('script');
    script.src = `https://genius.com/songs/${songId}/embed.js`;
    script.crossOrigin = 'anonymous';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
      scriptLoadedRef.current = false;
    };
  }, [songId]);

  if (!geniusUrl) return null;

  return (
    <div className="hidden xl:block w-80 flex-shrink-0">
      <div className="sticky top-24">
        <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">

          {/* Header */}
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/10 bg-white/5">
            {/* Genius "G" wordmark approximation */}
            <span className="text-yellow-400 font-bold text-xs leading-none">GENIUS</span>
            <span className="text-white/40 text-xs">·</span>
            <span className="text-white/70 text-xs font-medium truncate">
              {title || 'Lyrics'}
            </span>
          </div>

          {/* Embed area */}
          <div className="p-3">
            {songId ? (
              <div
                id={`rg_embed_link_${songId}`}
                className="rg_embed_link"
                data-song-id={songId}
              >
                {/* Genius embed.js replaces this content with the full widget */}
                <a
                  href={geniusUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-yellow-400 hover:text-yellow-300 text-xs underline"
                >
                  View lyrics on Genius
                </a>
              </div>
            ) : (
              /* Fallback: no embed, just a clean link card */
              <a
                href={geniusUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col gap-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/50 group-hover:text-white/70 transition-colors">
                    Read the lyrics
                  </span>
                  <svg className="w-3 h-3 text-white/30 group-hover:text-yellow-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
                <div className="w-full py-2 px-3 bg-yellow-400/10 hover:bg-yellow-400/20 border border-yellow-400/20 rounded text-yellow-400 text-xs font-medium text-center transition-colors">
                  Open on Genius
                </div>
              </a>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default GeniusLyricsPanel;
