const GeniusLyricsPanel = ({ lyrics, geniusUrl }) => {
  if (!lyrics) return null;

  return (
    <div className="hidden xl:block w-80 flex-shrink-0">
      <div className="sticky top-24 max-h-[calc(100vh-6rem)] flex flex-col bg-white/5 border border-white/10 rounded-lg overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/10 bg-white/5 flex-shrink-0">
          <span className="text-yellow-400 font-bold text-xs tracking-wide">LYRICS</span>
          {geniusUrl && (
            <a
              href={geniusUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/30 hover:text-yellow-400 transition-colors text-xs"
              title="Open on Genius"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>

        {/* Lyrics */}
        <div className="overflow-y-auto flex-1 px-3 py-3">
          <pre className="text-white/80 text-xs leading-relaxed font-sans whitespace-pre-wrap break-words">
            {lyrics}
          </pre>
        </div>

      </div>
    </div>
  );
};

export default GeniusLyricsPanel;
