import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

const GeniusLyricsPanel = ({ geniusUrl }) => {
  const [lyrics, setLyrics] = useState(null);
  const [title, setTitle]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(false);

  useEffect(() => {
    if (!geniusUrl) return;

    setLoading(true);
    fetch(`${API_URL}/api/genius-lyrics?url=${encodeURIComponent(geniusUrl)}`)
      .then(r => r.json())
      .then(data => {
        if (data.lyrics) {
          setLyrics(data.lyrics);
          setTitle(data.title);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [geniusUrl]);

  if (!geniusUrl) return null;

  return (
    <div className="hidden xl:block w-80 flex-shrink-0">
      <div className="sticky top-24 max-h-[calc(100vh-6rem)] flex flex-col bg-white/5 border border-white/10 rounded-lg overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/10 bg-white/5 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 font-bold text-xs">GENIUS</span>
            {title && (
              <>
                <span className="text-white/30 text-xs">·</span>
                <span className="text-white/60 text-xs truncate max-w-[140px]">{title}</span>
              </>
            )}
          </div>
          <a
            href={geniusUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/30 hover:text-yellow-400 transition-colors flex-shrink-0"
            title="Open on Genius"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        {/* Lyrics body */}
        <div className="overflow-y-auto flex-1 px-3 py-3">
          {loading && (
            <div className="flex items-center justify-center h-24">
              <div className="w-4 h-4 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-4">
              <p className="text-white/40 text-xs mb-3">Couldn't load lyrics</p>
              <a
                href={geniusUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-yellow-400 hover:text-yellow-300 text-xs underline"
              >
                View on Genius
              </a>
            </div>
          )}

          {lyrics && !loading && (
            <pre className="text-white/80 text-xs leading-relaxed font-sans whitespace-pre-wrap break-words">
              {lyrics}
            </pre>
          )}
        </div>

      </div>
    </div>
  );
};

export default GeniusLyricsPanel;
