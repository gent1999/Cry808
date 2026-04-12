const GeniusLyricsPanel = ({ geniusUrl }) => {
  if (!geniusUrl) return null;

  return (
    <div className="hidden xl:block w-80 flex-shrink-0">
      <div className="sticky top-24">
        <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">

          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/10 bg-white/5">
            <span className="text-yellow-400 font-bold text-xs">GENIUS</span>
            <span className="text-white/40 text-xs">·</span>
            <span className="text-white/70 text-xs font-medium truncate">Lyrics</span>
          </div>

          <div className="p-3">
            <a
              href={geniusUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col gap-2 group"
            >
              <span className="text-xs text-white/50 group-hover:text-white/70 transition-colors">
                Read the full lyrics
              </span>
              <div className="w-full py-2 px-3 bg-yellow-400/10 hover:bg-yellow-400/20 border border-yellow-400/20 rounded text-yellow-400 text-xs font-medium text-center transition-colors">
                Open on Genius
              </div>
            </a>
          </div>

        </div>
      </div>
    </div>
  );
};

export default GeniusLyricsPanel;
