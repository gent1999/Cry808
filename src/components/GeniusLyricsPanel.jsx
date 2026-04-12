import { useState, useEffect, useRef } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

const GeniusLyricsPanel = ({ geniusUrl }) => {
  const [songId, setSongId]   = useState(null);
  const [title, setTitle]     = useState(null);
  const [error, setError]     = useState(false);
  const containerRef          = useRef(null);
  const scriptLoadedRef       = useRef(false);

  useEffect(() => {
    if (!geniusUrl) return;

    fetch(`${API_URL}/api/genius-embed?url=${encodeURIComponent(geniusUrl)}`)
      .then(r => r.json())
      .then(data => {
        if (data.songId) {
          setSongId(data.songId);
          setTitle(data.title);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true));
  }, [geniusUrl]);

  useEffect(() => {
    if (!songId || scriptLoadedRef.current) return;
    scriptLoadedRef.current = true;

    const script = document.createElement('script');
    script.src = `https://genius.com/songs/${songId}/embed.js`;
    script.crossOrigin = 'anonymous';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
      scriptLoadedRef.current = false;
    };
  }, [songId]);

  if (!geniusUrl || error) return null;

  return (
    <div className="hidden 2xl:block w-64 flex-shrink-0">
      <div className="sticky top-24">
        <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
            <svg className="w-4 h-4 text-yellow-400 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
            </svg>
            <span className="text-sm font-semibold text-white/90 truncate">
              {title || 'Lyrics'}
            </span>
          </div>

          {/* Embed */}
          <div className="p-3" ref={containerRef}>
            {songId ? (
              <div
                id={`rg_embed_link_${songId}`}
                className="rg_embed_link"
                data-song-id={songId}
              >
                <a
                  href={geniusUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-yellow-400 hover:text-yellow-300 text-sm underline"
                >
                  View lyrics on Genius
                </a>
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Footer link */}
          <div className="px-4 py-2 border-t border-white/10">
            <a
              href={geniusUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-white/40 hover:text-yellow-400 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Open on Genius
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeniusLyricsPanel;
