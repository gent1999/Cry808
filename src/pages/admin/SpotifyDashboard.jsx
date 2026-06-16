import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../../assets/cry808_logo.png';
import spotifyLogo from '../../assets/spotify_logo.png';

const API_URL = import.meta.env.VITE_API_URL;

// ── localStorage keys & helpers (categories only — submissions live in DB) ────
const LS_CATS = 'cry808_playlist_cats';
const lsGet   = (k, fb) => { try { return JSON.parse(localStorage.getItem(k)) ?? fb; } catch { return fb; } };
const lsSet   = (k, v)  => { try { localStorage.setItem(k, JSON.stringify(v)); }    catch {} };

// ── Style maps ────────────────────────────────────────────────────────────────
const CAT_STYLE = {
  ENTRY:     { bg: 'bg-sky-500/15',    text: 'text-sky-300',    border: 'border-sky-500/30'    },
  EDITORIAL: { bg: 'bg-purple-500/15', text: 'text-purple-300', border: 'border-purple-500/30' },
  PREMIUM:   { bg: 'bg-green-500/15',  text: 'text-green-300',  border: 'border-green-500/30'  },
};

const SUB_STATUS_STYLE = {
  'Pending Review':        { bg: 'bg-amber-500/15',  text: 'text-amber-300',  dot: 'bg-amber-400'  },
  'Approved':              { bg: 'bg-green-500/15',  text: 'text-green-300',  dot: 'bg-green-400'  },
  'Removed from Playlist': { bg: 'bg-orange-500/15', text: 'text-orange-300', dot: 'bg-orange-400' },
  'Declined':              { bg: 'bg-red-500/15',    text: 'text-red-400',    dot: 'bg-red-500'    },
};


const PIPELINE_STAGES = [
  { key: 'Pending Review',        label: 'Pending Review', color: 'amber'  },
  { key: 'Approved',              label: 'Approved',       color: 'green'  },
  { key: 'Removed from Playlist', label: 'Removed',        color: 'orange' },
];

const PIPE_COLOR = {
  amber:  { bg: 'bg-amber-500/10',  border: 'border-amber-500/25',  text: 'text-amber-300/70',  num: 'text-amber-400'  },
  green:  { bg: 'bg-green-500/10',  border: 'border-green-500/25',  text: 'text-green-300/70',  num: 'text-green-400'  },
  orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/25', text: 'text-orange-300/70', num: 'text-orange-400' },
};

const PAGE_BADGE = {
  playlist: { label: 'Homepage', cls: 'bg-green-500/20 text-green-300' },
  home:     { label: 'Sidebar',  cls: 'bg-sky-500/20  text-sky-300'   },
  article:  { label: 'Article',  cls: 'bg-violet-500/20 text-violet-300' },
};

// ── Side Panel ────────────────────────────────────────────────────────────────
const SideIcon = ({ path }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);

function SidePanel() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const active = (to) => pathname === to || (to !== '/admin/dashboard' && pathname.startsWith(to));
  const groups = [
    ['Content', [
      ['New Article',  'M12 5v14M5 12h14',                                                                                                         '/admin/articles/create'],
      ['All Articles', 'M5 6h14M5 12h14M5 18h9',                                                                                                  '/admin/articles'],
      ['Artists',      'M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm-7 9a7 7 0 0 1 14 0',                                                             '/admin/artists'],
      ['Submissions',  'M4 13h4l2 3h4l2-3h4M5 5h14l1 8v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5l1-8Z',                                                '/admin/submissions'],
    ]],
    ['Intelligence', [
      ['Cortex', 'M12 2a5 5 0 0 1 5 5c0 2.4-1.7 4.4-4 4.9V21h-2v-9.1C8.7 11.4 7 9.4 7 7a5 5 0 0 1 5-5Z', '/admin/cortex'],
    ]],
    ['Business & Config', [
      ['Finance Hub', 'M12 3v18M8 7h6a3 3 0 0 1 0 6h-4a3 3 0 0 0 0 6h6',                                                                         '/admin/finance'],
      ['Ad Settings',  'M12 4v16M4 12h16M7 7l10 10M17 7 7 17',                                                                                    '/admin/settings'],
      ['Newsletter',   'M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z',         '/admin/newsletter'],
      ['Spotify',      null,                                                                                                                    '/admin/spotify', spotifyLogo],
    ]],
  ];
  return (
    <aside className="content-side-panel fixed inset-y-0 left-0 z-30 flex w-[264px] flex-col border-r border-white/[0.07] bg-[#0b1019]/95 px-4 py-5 shadow-[20px_0_80px_rgba(0,0,0,.34)] backdrop-blur-xl">
      <button onClick={() => navigate('/admin/dashboard')} className="mb-7 flex items-center gap-3 text-left">
        <span className="grid h-11 w-11 place-items-center overflow-hidden bg-transparent">
          <img src={logo} alt="Cry808" className="h-full w-full object-contain" />
        </span>
        <span>
          <span className="block text-[15px] font-semibold tracking-[.16em] text-white">CRY808</span>
          <span className="block text-[11px] font-medium text-slate-500">Content System</span>
        </span>
      </button>
      <nav className="flex-1 space-y-7 overflow-y-auto pr-1">
        {groups.map(([label, items]) => (
          <div key={label}>
            <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[.16em] text-slate-500/90">{label}</div>
            <div className="space-y-1.5">
              {items.map(([labelText, icon, to, img]) => {
                const isActive = active(to);
                return (
                  <button key={labelText} onClick={() => navigate(to)}
                    className={`group flex w-full items-center gap-3 border px-3 py-2.5 text-left text-sm transition duration-200 ${
                      isActive ? 'border-green-500/25 bg-green-500/10 text-white' : 'border-transparent text-slate-400 hover:border-white/[0.07] hover:bg-white/[0.04] hover:text-slate-100'
                    }`}>
                    <span className={`grid h-8 w-8 place-items-center ${isActive ? 'bg-green-500/20 text-green-300' : 'bg-white/[0.04] text-slate-500 group-hover:text-slate-200'}`}>
                      {img
                        ? <img src={img} alt={labelText} className="w-4 h-4 object-contain" />
                        : <SideIcon path={icon} />}
                    </span>
                    <span className="min-w-0 flex-1 font-medium">{labelText}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}

// ── Formatters ────────────────────────────────────────────────────────────────
const fmt = (n) => n == null ? '—' : n >= 1_000_000 ? `${(n/1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n/1_000).toFixed(1)}K` : n.toLocaleString();
const fmtDuration = (ms) => { if (!ms) return null; const s = Math.round(ms/1000); return `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`; };
const KEY_NAMES = ['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'];

// ── AnalyticsCard ─────────────────────────────────────────────────────────────
function AnalyticsCard({ label, value, sub, growth, color = 'text-green-400', loading = false }) {
  const positive = growth && !growth.startsWith('-');
  return (
    <div className="border border-white/[0.07] bg-white/[0.02] px-4 py-4 flex flex-col gap-2 hover:border-green-500/20 hover:bg-white/[0.03] transition-all">
      <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest leading-tight">{label}</div>
      <div className={`text-2xl font-bold font-mono leading-none ${loading ? 'text-white/10' : color}`}>
        {loading ? '—' : value}
      </div>
      {!loading && (sub || growth) && (
        <div className="flex items-center justify-between mt-auto pt-1">
          {sub    && <span className="text-[10px] text-white/25 truncate">{sub}</span>}
          {growth && <span className={`text-[10px] font-semibold shrink-0 ml-auto ${positive ? 'text-green-400' : 'text-red-400'}`}>{positive ? '▲' : '▼'} {growth}</span>}
        </div>
      )}
    </div>
  );
}

// ── FeatureBar ────────────────────────────────────────────────────────────────
function FeatureBar({ label, value, color = 'bg-green-500' }) {
  if (value == null) return null;
  const pct = Math.round(value * 100);
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="text-[10px] text-white/40 w-[76px] shrink-0 capitalize">{label}</span>
      <div className="flex-1 h-1 bg-white/10 overflow-hidden rounded-full">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] font-mono text-white/50 w-5 text-right">{pct}</span>
    </div>
  );
}

// ── Popularity ────────────────────────────────────────────────────────────────
function Popularity({ value }) {
  if (value == null) return null;
  const color = value >= 70 ? 'text-green-400' : value >= 40 ? 'text-amber-400' : 'text-white/40';
  return <span className={`flex items-center gap-1 text-[11px] font-semibold ${color}`}>★ {value}</span>;
}

// ── PlaylistInsights (existing, preserved) ────────────────────────────────────
function PlaylistInsights({ ins }) {
  if (!ins) return null;
  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mb-3">
        {ins.avgBpm        != null && <span className="text-[11px] text-white/50"><span className="text-white/80 font-semibold font-mono">{ins.avgBpm}</span> avg BPM</span>}
        {ins.avgPopularity != null && <span className="text-[11px] text-white/50"><span className="text-amber-400 font-semibold">★ {ins.avgPopularity}</span> avg pop</span>}
        {ins.analyzedCount != null && <span className="text-[10px] text-white/25 font-mono">from {ins.analyzedCount} tracks</span>}
      </div>
      {(ins.avgEnergy != null || ins.avgDanceability != null) && (
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-3">
          <FeatureBar label="Energy"       value={ins.avgEnergy}       color="bg-orange-500" />
          <FeatureBar label="Danceability" value={ins.avgDanceability} color="bg-green-500"  />
          <FeatureBar label="Mood"         value={ins.avgValence}      color="bg-yellow-400" />
          <FeatureBar label="Acousticness" value={ins.avgAcousticness} color="bg-sky-500"    />
        </div>
      )}
      {ins.topGenres?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {ins.topGenres.map(g => (
            <span key={g} className="text-[10px] px-1.5 py-0.5 bg-white/[0.05] text-white/50 border border-white/[0.07]">{g}</span>
          ))}
        </div>
      )}
      {ins.topTracks?.length > 0 && (
        <div className="space-y-1">
          <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest mb-1.5">Top Tracks</p>
          {ins.topTracks.map((t, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[10px] text-white/20 font-mono w-3">{i+1}</span>
              <span className="text-[11px] text-white/60 truncate flex-1">{t.name}</span>
              {t.artist     && <span className="text-[10px] text-white/30 shrink-0">{t.artist}</span>}
              {t.popularity != null && <span className="text-[10px] text-amber-400/70 font-mono shrink-0">★{t.popularity}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


// ── PlaylistCard (upgraded EmbedCard — all existing features preserved) ────────
function PlaylistCard({ embed, category, onDelete, onCategoryChange }) {
  const [expanded, setExpanded]     = useState(false);
  const [catMenu,  setCatMenu]      = useState(false);
  const catMenuRef                  = useRef(null);
  const m                           = embed.metadata;
  const pb                          = PAGE_BADGE[embed.page_type] || PAGE_BADGE.home;
  const catStyle                    = category ? CAT_STYLE[category] : null;
  const hasInsights                 = m?.insights != null;

  // Close cat menu on outside click
  useEffect(() => {
    const handler = (e) => { if (catMenuRef.current && !catMenuRef.current.contains(e.target)) setCatMenu(false); };
    if (catMenu) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [catMenu]);

  return (
    <div className="border border-white/[0.07] bg-white/[0.02] hover:border-green-500/20 transition-all overflow-hidden">
      <div className="flex min-h-[150px]">

        {/* ── LEFT: all content ── */}
        <div className="flex-1 min-w-0 p-4 flex flex-col">

          {/* Badges row */}
          <div className="flex items-center justify-between mb-2 gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 uppercase tracking-wide ${pb.cls}`}>{pb.label}</span>
              {catStyle && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 uppercase tracking-wide border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
                  {category}
                </span>
              )}
              {!embed.is_active && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 uppercase tracking-wide bg-red-500/20 text-red-300">Inactive</span>
              )}
            </div>

            {/* Category selector dropdown */}
            <div className="relative shrink-0" ref={catMenuRef}>
              <button onClick={() => setCatMenu(v => !v)}
                className="text-[10px] text-white/25 hover:text-white/60 border border-white/[0.07] hover:border-white/20 px-2 py-1 transition-colors">
                {category ? `${category} ▾` : '+ Label ▾'}
              </button>
              {catMenu && (
                <div className="absolute right-0 top-full mt-1 z-20 border border-white/[0.1] bg-[#0d1420] shadow-2xl w-36 py-1">
                  {['ENTRY','EDITORIAL','PREMIUM'].map(c => (
                    <button key={c} onClick={() => { onCategoryChange(embed.id, c === category ? null : c); setCatMenu(false); }}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-[11px] hover:bg-white/[0.05] transition-colors ${c === category ? 'text-green-400' : 'text-white/60'}`}>
                      <span className="w-3">{c === category ? '✓' : ''}</span>
                      <span>{c}</span>
                    </button>
                  ))}
                  {category && (
                    <button onClick={() => { onCategoryChange(embed.id, null); setCatMenu(false); }}
                      className="flex w-full px-3 py-2 text-[10px] text-white/25 hover:bg-white/[0.05] border-t border-white/[0.05] transition-colors">
                      Clear label
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Title & description */}
          <p className="text-sm font-bold text-white leading-tight">
            {m?.name || embed.title || 'Unknown Playlist'}
          </p>
          {m?.description && (
            <p className="text-[11px] text-white/35 mt-0.5 line-clamp-1">{m.description}</p>
          )}

          {/* Stats row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
            {m?.followers  != null && <span className="text-[11px] text-white/50"><span className="text-white/80 font-semibold">{fmt(m.followers)}</span> followers</span>}
            {m?.trackCount != null && <span className="text-[11px] text-white/50"><span className="text-white/80 font-semibold">{m.trackCount}</span> tracks</span>}
            {m?.owner      && <span className="text-[11px] text-white/30">by {m.owner}</span>}
            {m?.isPublic === false && <span className="text-[10px] text-white/25 border border-white/[0.07] px-1.5 py-0.5">Private</span>}
            {m?.collaborative && <span className="text-[10px] text-orange-400/70 border border-orange-500/20 px-1.5 py-0.5">Collab</span>}
          </div>

          {/* Insights inline summary */}
          {m?.insights && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
              {m.insights.avgBpm        != null && <span className="text-[11px] text-white/40"><span className="text-green-400 font-semibold font-mono">{m.insights.avgBpm}</span> BPM</span>}
              {m.insights.avgPopularity != null && <span className="text-[11px] text-white/40"><span className="text-amber-400 font-semibold">★{m.insights.avgPopularity}</span> avg</span>}
              {m.insights.topGenres?.slice(0,2).map(g => <span key={g} className="text-[10px] text-white/25 italic">{g}</span>)}
            </div>
          )}



          {/* Action bar */}
          <div className="flex items-center gap-3 mt-auto pt-2.5 border-t border-white/[0.05] mt-3">
            <button onClick={() => setExpanded(v => !v)}
              className="text-[11px] text-white/35 hover:text-white/70 transition-colors">
              {expanded ? '▲ Less' : '▼ Details'}
            </button>
            {m?.spotifyUrl && (
              <a href={m.spotifyUrl} target="_blank" rel="noopener noreferrer"
                className="text-[11px] text-green-400 hover:text-green-300 transition-colors">
                Open Spotify ↗
              </a>
            )}
            <button onClick={() => onDelete(embed.id)}
              className="ml-auto text-[11px] text-white/15 hover:text-red-400 transition-colors">
              Remove
            </button>
          </div>
        </div>

        {/* ── RIGHT: cover art filling full height ── */}
        <div className="w-[140px] sm:w-[175px] shrink-0 relative bg-white/[0.04] overflow-hidden">
          {m?.image ? (
            <img src={m.image} alt={m?.name} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-5xl text-white/10">🎵</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-[#070b12]/50 via-transparent to-transparent" />
          {/* Weekly growth badge */}
          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm border border-white/[0.08] px-1.5 py-0.5 text-[10px] text-green-400 font-mono">
            +0 /wk
          </div>
        </div>
      </div>

      {/* ── Expanded: full insights ── */}
      {expanded && (
        <div className="px-4 pb-4 pt-3 border-t border-white/[0.05]">
          {hasInsights
            ? <PlaylistInsights ins={m.insights} />
            : <p className="text-[11px] text-white/25">Insights not yet loaded — click ↺ Refresh.</p>
          }
        </div>
      )}
    </div>
  );
}

// ── PlaylistDashCard (portrait card — used in the 3-col playlist grid) ───────
function PlaylistDashCard({ embed, category, onDelete, onCategoryChange }) {
  const [expanded,  setExpanded]  = useState(false);
  const [catMenu,   setCatMenu]   = useState(false);
  const catMenuRef                = useRef(null);
  const m        = embed.metadata;
  const catStyle = category ? CAT_STYLE[category] : null;

  useEffect(() => {
    const h = (e) => { if (catMenuRef.current && !catMenuRef.current.contains(e.target)) setCatMenu(false); };
    if (catMenu) document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [catMenu]);

  return (
    <div className="flex flex-col border border-white/[0.07] bg-white/[0.02] hover:border-green-500/20 transition-all overflow-hidden w-full h-full">
      {/* Cover */}
      <div className="relative flex-1 min-h-0 overflow-hidden">
        {m?.image
          ? <img src={m.image} alt={m?.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full bg-white/[0.04] flex items-center justify-center text-5xl text-white/10">🎵</div>
        }
        <div className="absolute inset-0 bg-gradient-to-t from-[#070b12]/80 via-transparent to-transparent pointer-events-none" />
        {catStyle && (
          <span className={`absolute top-2 left-2 text-[9px] font-bold px-1.5 py-0.5 uppercase border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
            {category}
          </span>
        )}
      </div>

      {/* Info strip */}
      <div className="px-2.5 py-2 shrink-0 border-t border-white/[0.05]">
        <p className="text-[11px] font-bold text-white leading-tight truncate">{m?.name || embed.title || 'Unknown'}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {m?.followers  != null && <span className="text-[9px] text-white/40">{fmt(m.followers)}</span>}
          {m?.trackCount != null && <span className="text-[9px] text-white/25">{m.trackCount} tracks</span>}
        </div>
        {m?.insights && (
          <div className="flex items-center gap-2 mt-0.5">
            {m.insights.avgBpm        != null && <span className="text-[9px] text-green-400 font-mono font-semibold">{m.insights.avgBpm} BPM</span>}
            {m.insights.topGenres?.[0] &&        <span className="text-[9px] text-white/25 italic truncate">{m.insights.topGenres[0]}</span>}
          </div>
        )}

        {/* Actions row */}
        <div className="flex items-center gap-2 mt-1.5">
          <button onClick={() => setExpanded(v => !v)}
            className="text-[9px] text-white/30 hover:text-white/70 transition-colors">
            {expanded ? '▲ Less' : '▶ Details'}
          </button>
          {m?.spotifyUrl && (
            <a href={m.spotifyUrl} target="_blank" rel="noopener noreferrer"
              className="text-[9px] text-green-400 hover:text-green-300 transition-colors">↗</a>
          )}
          {/* Category picker */}
          <div className="relative ml-auto" ref={catMenuRef}>
            <button onClick={() => setCatMenu(v => !v)}
              className="text-[9px] text-white/20 hover:text-white/50 border border-white/[0.07] hover:border-white/20 px-1.5 py-0.5 transition-colors">
              {category || '+ Label'}
            </button>
            {catMenu && (
              <div className="absolute right-0 bottom-full mb-1 z-20 border border-white/[0.1] bg-[#0d1420] shadow-2xl w-28 py-1">
                {['ENTRY','EDITORIAL','PREMIUM'].map(c => (
                  <button key={c} onClick={() => { onCategoryChange(embed.id, c === category ? null : c); setCatMenu(false); }}
                    className={`flex w-full items-center gap-1.5 px-2 py-1.5 text-[9px] hover:bg-white/[0.05] ${c === category ? 'text-green-400' : 'text-white/50'}`}>
                    <span className="w-2">{c === category ? '✓' : ''}</span>{c}
                  </button>
                ))}
                {category && (
                  <button onClick={() => { onCategoryChange(embed.id, null); setCatMenu(false); }}
                    className="w-full px-2 py-1.5 text-[9px] text-white/20 hover:bg-white/[0.05] border-t border-white/[0.05]">
                    Clear
                  </button>
                )}
              </div>
            )}
          </div>
          <button onClick={() => onDelete(embed.id)}
            className="text-[9px] text-white/15 hover:text-red-400 transition-colors">✕</button>
        </div>
      </div>

      {/* Expanded insights */}
      {expanded && (
        <div className="px-2.5 pb-2 border-t border-white/[0.05] overflow-y-auto max-h-32">
          {m?.insights
            ? <PlaylistInsights ins={m.insights} />
            : <p className="text-[9px] text-white/25 mt-1">No insights yet — hit ↺ Refresh.</p>
          }
        </div>
      )}
    </div>
  );
}

// ── GrowthChart (SVG area sparkline) ─────────────────────────────────────────
function GrowthChart({ currentFollowers }) {
  if (!currentFollowers) return (
    <div className="flex items-center justify-center h-full text-white/20 text-[10px] font-mono">No data</div>
  );
  const W = 280, H = 80, weeks = 14;
  const start = Math.max(0, Math.round(currentFollowers * 0.82));
  const raw = Array.from({ length: weeks }, (_, i) => {
    const t = i / (weeks - 1);
    const noise = (Math.sin(i * 2.3 + 1) + Math.cos(i * 1.7)) * currentFollowers * 0.012;
    return Math.round(start + (currentFollowers - start) * t + noise);
  });
  const min = Math.min(...raw), max = Math.max(...raw);
  const range = max - min || 1;
  const xs = raw.map((_, i) => ((i / (weeks - 1)) * W).toFixed(1));
  const ys = raw.map(v => (H - ((v - min) / range) * (H - 12) - 6).toFixed(1));
  const line = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x},${ys[i]}`).join(' ');
  const area = `${line} L${W},${H} L0,${H} Z`;
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const now = new Date();
  const labels = Array.from({ length: 4 }, (_, i) => {
    const d = new Date(now); d.setMonth(d.getMonth() - (3 - i));
    return { x: ((i / 3) * W).toFixed(1), label: months[d.getMonth()] };
  });
  return (
    <svg viewBox={`0 0 ${W} ${H + 22}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="gg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#22c55e" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#gg)" />
      <path d={line} fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={xs[weeks-1]} cy={ys[weeks-1]} r="3" fill="#22c55e" />
      {/* x-axis tick marks */}
      {labels.map(({ x }) => (
        <line key={`tick-${x}`} x1={x} y1={H + 2} x2={x} y2={H + 6} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      ))}
      {/* x-axis labels — pushed well into the viewBox */}
      {labels.map(({ x, label }) => (
        <text key={label} x={x} y={H + 17} fontSize="7" fill="rgba(255,255,255,0.3)" textAnchor="middle">{label}</text>
      ))}
    </svg>
  );
}

// ── CompactCredsNotice ────────────────────────────────────────────────────────
function CompactCredsNotice() {
  return (
    <div className="px-3 py-2 border border-amber-500/25 bg-amber-950/20 text-amber-300 text-[10px] font-semibold shrink-0">
      ⚠️ Spotify credentials not configured — add SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET to Server808 env.
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SpotifyDashboard() {
  const navigate = useNavigate();

  const [embeds,      setEmbeds]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [credsOk,     setCredsOk]     = useState(true);
  const [subFilter,   setSubFilter]   = useState('All');
  const [editStatus,  setEditStatus]  = useState(null);
  const [showSubForm, setShowSubForm] = useState(false);
  const [subForm, setSubForm] = useState({ artist: '', track: '', url: '', playlist: '', source: 'Soundplate', status: 'Pending Review', notes: '' });

  const [submissions, setSubmissions] = useState([]);
  const [subsLoading, setSubsLoading] = useState(true);
  const [categories,  setCategories]  = useState(() => lsGet(LS_CATS, {}));

  const token = localStorage.getItem('adminToken');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const r = await fetch(`${API_URL}/api/spotify/metadata`, { headers: { Authorization: `Bearer ${token}` } });
      if (!r.ok) throw new Error('Failed to load');
      const d = await r.json();
      setEmbeds(d.embeds || []);
      setCredsOk(d.credentialsConfigured);
    } catch (e) { setError(e.message); }
    finally     { setLoading(false); }
  };

  const loadSubmissions = async () => {
    setSubsLoading(true);
    try {
      const r = await fetch(`${API_URL}/api/playlist-submissions`, { headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) { const d = await r.json(); setSubmissions(d.submissions || []); }
    } catch (_) {}
    finally { setSubsLoading(false); }
  };

  useEffect(() => { load(); loadSubmissions(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Remove this Spotify embed?')) return;
    try {
      const r = await fetch(`${API_URL}/api/spotify-embeds/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) setEmbeds(prev => prev.filter(e => e.id !== id));
    } catch (_) {}
  };

  const handleCatChange = (id, cat) => {
    const updated = { ...categories };
    if (cat) updated[id] = cat; else delete updated[id];
    setCategories(updated); lsSet(LS_CATS, updated);
  };

  // ── Submissions actions (API-backed) ────────────────────────────────────────
  const pf = (field) => (e) => setSubForm(f => ({ ...f, [field]: e.target.value }));

  const addSub = async () => {
    if (!subForm.artist.trim()) return;
    try {
      const r = await fetch(`${API_URL}/api/playlist-submissions/import`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artist:      subForm.artist,
          track:       subForm.track || null,
          spotify_url: subForm.url   || null,
          playlist:    subForm.playlist || 'Press Play',
          source:      subForm.source,
          submitted_at: new Date(),
        }),
      });
      if (r.ok) {
        const d = await r.json();
        if (d.submission) setSubmissions(prev => [d.submission, ...prev]);
      }
    } catch (_) {}
    setSubForm({ artist: '', track: '', url: '', playlist: '', source: 'Soundplate', status: 'Pending Review', notes: '' });
    setShowSubForm(false);
  };

  const setSubStatus = async (id, status) => {
    setEditStatus(null);
    try {
      const r = await fetch(`${API_URL}/api/playlist-submissions/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (r.ok) setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    } catch (_) {}
  };

  const removeSub = async (id) => {
    if (!confirm('Remove this submission?')) return;
    try {
      const r = await fetch(`${API_URL}/api/playlist-submissions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r.ok) setSubmissions(prev => prev.filter(s => s.id !== id));
    } catch (_) {}
  };

  // ── Computed stats ──────────────────────────────────────────────────────────
  const parseId   = (url) => url?.match(/\/(playlist|album|track|artist)\/([A-Za-z0-9]+)/)?.[2];
  const uniqueFollowers = (() => {
    const seen = new Set();
    return embeds.reduce((sum, e) => {
      const id = parseId(e.spotify_url);
      if (id && seen.has(id)) return sum;
      if (id) seen.add(id);
      return sum + (e.metadata?.followers || 0);
    }, 0);
  })();
  const playlists   = embeds.filter(e => e.page_type === 'playlist');
  const totalTracks = playlists.reduce((s, e) => s + (e.metadata?.trackCount || 0), 0);
  const accepted    = submissions.filter(s => s.status === 'Approved').length;
  const nonDeclined = submissions.filter(s => s.status !== 'Declined').length;
  const acceptRate  = nonDeclined > 0 ? `${Math.round(accepted / nonDeclined * 100)}%` : '—';

  // Action alerts (compact)
  const alerts = [];
  const stale = submissions.filter(s => s.status === 'Pending Review' && (Date.now() - new Date(s.submitted_at)) / 86_400_000 > 7);
  if (stale.length) alerts.push({ level: 'warning', icon: '🕐', msg: `${stale.length} submission${stale.length > 1 ? 's' : ''} pending 7+ days` });
  const noIns = playlists.filter(e => !e.metadata?.insights);
  if (noIns.length) alerts.push({ level: 'info', icon: '📊', msg: `${noIns.length} playlist${noIns.length > 1 ? 's' : ''} missing insights` });
  const removed = submissions.filter(s => s.status === 'Removed from Playlist');
  if (removed.length) alerts.push({ level: 'warning', icon: '🔄', msg: `${removed.length} track${removed.length > 1 ? 's' : ''} removed from playlist` });
  const ALERT_DOT = { error: 'bg-red-400', warning: 'bg-amber-400', info: 'bg-sky-400', success: 'bg-green-400' };

  // Pipeline counts
  const pipeCounts = Object.fromEntries(PIPELINE_STAGES.map(s => [s.key, 0]));
  submissions.forEach(s => { if (s.status in pipeCounts) pipeCounts[s.status]++; });
  const declined = submissions.filter(s => s.status === 'Declined').length;

  // Filtered submissions
  const filteredSubs = subFilter === 'All' ? submissions : submissions.filter(s => s.status === subFilter);

  // Playlist names for form dropdown
  const playlistNames = [...new Set(playlists.map(e => e.metadata?.name || e.title || 'Unknown'))];

  return (
    <div className="admin-command-center content-command-center bg-[#070b12] text-white h-screen overflow-hidden flex flex-col">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(34,197,94,.07),transparent_30%),radial-gradient(circle_at_85%_5%,rgba(139,92,246,.06),transparent_30%)]" />
      <SidePanel />

      {/* Right of sidebar — full height column */}
      <div className="relative ml-[264px] flex-1 min-h-0 flex flex-col overflow-hidden">

        {/* ── Header ── */}
        <header className="shrink-0 border-b border-white/[0.07] bg-[#070b12]/90 backdrop-blur-xl z-20">
          <div className="flex items-center justify-between px-6 h-11">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/admin/dashboard')}
                className="text-[11px] text-slate-500 hover:text-slate-200 uppercase tracking-[.16em] font-semibold transition-colors">
                ← Dashboard
              </button>
              <span className="text-gray-700">│</span>
              <span className="text-[11px] font-bold uppercase tracking-[.18em]">
                <span className="text-green-400">Music</span>
                <span className="text-purple-400 ml-1">HQ</span>
              </span>
            </div>
            <button onClick={load}
              className="text-[10px] font-mono border border-white/10 text-white/35 hover:text-white hover:border-white/30 px-3 py-1 transition-colors">
              ↺ Refresh
            </button>
          </div>
        </header>

        {/* ── Dashboard body ── */}
        <div className="flex-1 min-h-0 flex flex-col gap-2.5 px-5 py-3 overflow-hidden">

          {!credsOk && <CompactCredsNotice />}

          {/* ── ROW 1: Title + Stats + Action Alerts ── */}
          <div className="shrink-0">
            <div className="flex items-end justify-between mb-2">
              <div>
                <h1 className="text-sm font-bold text-white leading-tight">Spotify Dashboard</h1>
                <p className="text-[10px] text-white/30">Monitor and optimize the CRY808 Spotify experience</p>
              </div>
              {error && <span className="text-[10px] text-red-400 border border-red-500/30 px-2 py-0.5">{error}</span>}
            </div>

            <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(4, 1fr) 250px' }}>
              {/* Stat cards */}
              {[
                { label: 'Total Followers',    val: fmt(uniqueFollowers),  color: 'text-green-400'  },
                { label: 'Playlists',          val: playlists.length,     sub: 'active',    color: 'text-white'      },
                { label: 'Tracks Curated',     val: totalTracks,          sub: 'total',     color: 'text-sky-400'    },
                { label: 'Submissions',        val: subsLoading ? '—' : submissions.length,   sub: `${acceptRate} accepted`, color: 'text-amber-400' },
              ].map(({ label, val, growth, sub, color }) => (
                <div key={label} className="border border-white/[0.07] bg-white/[0.02] px-3 py-2.5 hover:border-green-500/20 transition-all">
                  <p className="text-[9px] font-mono text-white/30 uppercase tracking-widest leading-tight">{label}</p>
                  <p className={`text-xl font-bold font-mono leading-none mt-1 ${loading ? 'text-white/10' : color}`}>{loading ? '—' : val}</p>
                  {(growth || sub) && (
                    <p className="text-[9px] text-white/25 mt-1 truncate">{growth ?? sub}</p>
                  )}
                </div>
              ))}

              {/* Action alerts */}
              <div className="border border-white/[0.07] bg-white/[0.02] px-3 py-2.5 flex flex-col overflow-hidden">
                <p className="text-[9px] font-mono text-white/30 uppercase tracking-widest mb-1.5 shrink-0">Action Center</p>
                {alerts.length === 0 ? (
                  <p className="text-[10px] text-green-400 font-semibold">✅ All systems clear</p>
                ) : (
                  <div className="space-y-1 overflow-y-auto flex-1 min-h-0">
                    {alerts.map((a, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <span className={`mt-[3px] w-1.5 h-1.5 rounded-full shrink-0 ${ALERT_DOT[a.level]}`} />
                        <span className="text-[9px] text-white/50 leading-snug">{a.msg}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── ROW 2: Pipeline + Submissions table │ Playlists ── */}
          <div className="flex-1 min-h-0 grid gap-2.5" style={{ gridTemplateColumns: 'minmax(0, 1fr) 420px' }}>

            {/* LEFT: pipeline stages + submissions table */}
            <div className="flex flex-col gap-2.5 min-h-0">

              {/* Pipeline stages (compact) */}
              <div className="shrink-0 border border-white/[0.07] bg-white/[0.02] px-3 py-2">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[9px] font-mono text-white/30 uppercase tracking-widest">Submissions Pipeline</p>
                  <span className="text-[9px] text-white/20 font-mono">{submissions.length} total</span>
                </div>
                <div className="flex items-center gap-1">
                  {PIPELINE_STAGES.map((stage, i) => {
                    const c   = PIPE_COLOR[stage.color];
                    const cnt = pipeCounts[stage.key];
                    const pct = submissions.length > 0 ? Math.round(cnt / submissions.length * 100) : 0;
                    return (
                      <div key={stage.key} className="flex items-center gap-1 flex-1">
                        <div className={`flex-1 border ${c.border} ${c.bg} px-2 py-1.5 text-center`}>
                          <span className={`text-base font-bold font-mono leading-none block ${c.num}`}>{cnt}</span>
                          <span className={`text-[8px] font-semibold uppercase tracking-wider leading-tight block mt-0.5 ${c.text}`}>{stage.label}</span>
                          <span className="text-[8px] text-white/15 font-mono">{pct}%</span>
                        </div>
                        {i < PIPELINE_STAGES.length - 1 && <span className="text-white/15 text-xs shrink-0">→</span>}
                      </div>
                    );
                  })}
                  <div className="flex items-center gap-1 shrink-0 ml-1 pl-2 border-l border-white/[0.06]">
                    <div className="border border-red-500/20 bg-red-500/[0.06] px-2 py-1.5 text-center min-w-[52px]">
                      <span className="text-base font-bold font-mono leading-none block text-red-400">{declined}</span>
                      <span className="text-[8px] font-semibold uppercase tracking-wider leading-tight block mt-0.5 text-red-400/60">Declined</span>
                    </div>
                  </div>
                </div>
                {/* Progress bar */}
                {submissions.length > 0 && (
                  <div className="flex h-0.5 mt-2 bg-white/[0.05] overflow-hidden rounded-full gap-px">
                    {PIPELINE_STAGES.map(s => {
                      const pct = (pipeCounts[s.key] / submissions.length) * 100;
                      const col = { amber: 'bg-amber-500', blue: 'bg-blue-500', green: 'bg-green-500', purple: 'bg-purple-500' }[s.color];
                      return pct > 0 ? <div key={s.key} className={`h-full ${col}`} style={{ width: `${pct}%` }} /> : null;
                    })}
                    {declined > 0 && <div className="h-full bg-red-500" style={{ width: `${(declined/submissions.length)*100}%` }} />}
                  </div>
                )}
              </div>

              {/* Submissions table */}
              <div className="flex-1 min-h-0 border border-white/[0.07] bg-white/[0.02] flex flex-col overflow-hidden">
                {/* Toolbar */}
                <div className="shrink-0 flex items-center gap-2 px-3 py-1.5 border-b border-white/[0.05] flex-wrap">
                  <p className="text-[9px] font-mono text-white/30 uppercase tracking-widest shrink-0 mr-1">Your Submissions</p>
                  <div className="flex items-center gap-1 flex-1 flex-wrap">
                    {['All', 'Pending Review', 'Approved', 'Removed from Playlist', 'Declined'].map(f => (
                      <button key={f} onClick={() => setSubFilter(f)}
                        className={`text-[8px] font-semibold px-1.5 py-0.5 border transition-colors ${
                          subFilter === f
                            ? 'border-green-500/40 bg-green-500/15 text-green-300'
                            : 'border-white/[0.07] text-white/25 hover:text-white/50'
                        }`}>
                        {f === 'All' ? `All (${submissions.length})` : f === 'Removed from Playlist' ? 'Removed' : f}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setShowSubForm(v => !v)}
                    className="text-[8px] font-semibold border border-green-500/30 text-green-400 hover:bg-green-500/10 px-2 py-0.5 transition-colors shrink-0">
                    {showSubForm ? '✕' : '+ Add'}
                  </button>
                </div>

                {/* Inline add form */}
                {showSubForm && (
                  <div className="shrink-0 px-3 py-2 border-b border-white/[0.05] bg-white/[0.015]">
                    <div className="grid grid-cols-4 gap-1.5 mb-1.5">
                      <input className="bg-white/[0.04] border border-white/[0.08] text-white text-[10px] px-2 py-1 placeholder-white/20 focus:outline-none focus:border-green-500/40"
                        placeholder="Artist *" value={subForm.artist} onChange={pf('artist')} />
                      <input className="bg-white/[0.04] border border-white/[0.08] text-white text-[10px] px-2 py-1 placeholder-white/20 focus:outline-none focus:border-green-500/40"
                        placeholder="Track *" value={subForm.track} onChange={pf('track')} />
                      <select value={subForm.playlist} onChange={pf('playlist')}
                        className="bg-white/[0.04] border border-white/[0.08] text-white/60 text-[10px] px-2 py-1 focus:outline-none focus:border-green-500/40">
                        <option value="">Playlist...</option>
                        {playlistNames.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                      <select value={subForm.source} onChange={pf('source')}
                        className="bg-white/[0.04] border border-white/[0.08] text-white/60 text-[10px] px-2 py-1 focus:outline-none focus:border-green-500/40">
                        {['Soundplate','MusoSoup','Direct'].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                    <button onClick={addSub}
                      className="w-full bg-green-500/15 border border-green-500/30 text-green-300 text-[10px] font-semibold py-1 hover:bg-green-500/25 transition-colors">
                      Add Track to Pipeline
                    </button>
                  </div>
                )}

                {/* Table */}
                <div className="flex-1 min-h-0 overflow-y-auto">
                  {filteredSubs.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-white/20 text-[10px]">No submissions</div>
                  ) : (
                    <table className="w-full text-[10px] border-collapse">
                      <thead className="sticky top-0 bg-[#0a0f18] z-10">
                        <tr className="border-b border-white/[0.05]">
                          {['Artist','Track','Playlist','Source','Status','Submitted',''].map(h => (
                            <th key={h} className="text-left text-[8px] font-mono text-white/20 uppercase tracking-widest py-1.5 pr-3 font-normal whitespace-nowrap px-2">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSubs.map(sub => {
                          const ss = SUB_STATUS_STYLE[sub.status] || SUB_STATUS_STYLE['Pending Review'];
                          return (
                            <tr key={sub.id} className="group border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                              <td className="py-1.5 pr-3 pl-2 font-medium text-white/80 whitespace-nowrap">{sub.artist}</td>
                              <td className="py-1.5 pr-3 text-white/50 max-w-[120px] truncate">
                                {sub.spotify_url
                                  ? <a href={sub.spotify_url} target="_blank" rel="noopener noreferrer" className="hover:text-green-400">{sub.track} ↗</a>
                                  : (sub.track || <span className="text-white/20 italic">Unknown</span>)}
                              </td>
                              <td className="py-1.5 pr-3 text-white/25 whitespace-nowrap truncate max-w-[90px]">{sub.playlist || '—'}</td>
                              <td className="py-1.5 pr-3">
                                <span className="text-white/30 border border-white/[0.07] px-1 py-0.5 whitespace-nowrap">{sub.source}</span>
                              </td>
                              <td className="py-1.5 pr-3">
                                <div className="relative">
                                  <button onClick={() => setEditStatus(editStatus === sub.id ? null : sub.id)}
                                    className={`flex items-center gap-1 text-[8px] font-semibold px-1.5 py-0.5 whitespace-nowrap ${ss.bg} ${ss.text}`}>
                                    <span className={`w-1 h-1 rounded-full ${ss.dot}`} />
                                    {sub.status === 'Removed from Playlist' ? 'Removed' : sub.status}
                                    <span className="opacity-50">▾</span>
                                  </button>
                                  {editStatus === sub.id && (
                                    <div className="absolute left-0 top-full mt-0.5 z-20 border border-white/[0.1] bg-[#0d1420] shadow-2xl w-40 py-1">
                                      {Object.keys(SUB_STATUS_STYLE).map(s => (
                                        <button key={s} onClick={() => setSubStatus(sub.id, s)}
                                          className={`flex w-full items-center gap-2 px-2.5 py-1.5 text-[10px] hover:bg-white/[0.05] ${s === sub.status ? 'text-green-400' : 'text-white/55'}`}>
                                          <span className="w-2.5">{s === sub.status ? '✓' : ''}</span>{s}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="py-1.5 pr-3 text-white/25 font-mono whitespace-nowrap">{sub.submitted_at ? new Date(sub.submitted_at).toISOString().slice(0,10) : '—'}</td>
                              <td className="py-1.5 px-2">
                                <button onClick={() => removeSub(sub.id)}
                                  className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all">✕</button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
                <div className="shrink-0 px-3 py-1 border-t border-white/[0.04] flex items-center justify-between">
                  <span className="text-[8px] text-white/15 font-mono">Synced to server · auto-imported from Soundplate</span>
                  <button onClick={loadSubmissions} className="text-[8px] text-white/20 hover:text-white/50 transition-colors font-mono">
                    {subsLoading ? '...' : '↺'}
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT: playlist portrait cards */}
            <div className="flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-2 shrink-0">
                <p className="text-[9px] font-mono text-white/30 uppercase tracking-widest">Your Playlists</p>
                <div className="flex items-center gap-2">
                  {!loading && <span className="text-[9px] text-green-400 font-mono">{playlists.length} active</span>}
                  <button onClick={() => navigate('/admin/settings')}
                    className="text-[8px] border border-white/[0.07] text-white/30 hover:text-white/60 hover:border-white/20 px-2 py-0.5 transition-colors">
                    + Add
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="flex-1 min-h-0 overflow-y-auto grid grid-cols-2 gap-2 content-start">
                  {[0,1,2,3].map(i => <div key={i} className="aspect-square border border-white/[0.05] bg-white/[0.02] animate-pulse" />)}
                </div>
              ) : playlists.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-white/20 border border-white/[0.06] bg-white/[0.01]">
                  <div className="text-3xl mb-2">🎵</div>
                  <p className="text-[10px]">No playlists yet</p>
                  <button onClick={() => navigate('/admin/settings')} className="text-[9px] text-green-400 underline mt-1">Add from Ad Settings</button>
                </div>
              ) : (
                <div className="flex-1 min-h-0 overflow-y-auto grid grid-cols-2 gap-2 content-start">
                  {playlists.map(e => (
                    <div key={e.id} className="aspect-square">
                      <PlaylistDashCard embed={e} category={categories[e.id] || null}
                        onDelete={handleDelete} onCategoryChange={handleCatChange} />
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* ── ROW 3: Growth chart (full width) ── */}
          <div className="shrink-0 pb-1" style={{ height: '150px' }}>
            <div className="border border-white/[0.07] bg-white/[0.02] flex items-stretch h-full">

              {/* Left: numbers */}
              <div className="shrink-0 flex flex-col justify-center px-5 py-3 border-r border-white/[0.05] min-w-[160px]">
                <p className="text-[9px] font-mono text-white/30 uppercase tracking-widest mb-2">Growth Over Time</p>
                <p className={`text-3xl font-bold font-mono leading-none ${loading ? 'text-white/10' : 'text-white'}`}>
                  {loading ? '—' : fmt(uniqueFollowers)}
                </p>
                <p className="text-[10px] text-white/30 mt-1">total followers</p>
              </div>

              {/* Right: chart */}
              <div className="flex-1 min-w-0 px-4 py-3 flex items-center">
                <div className="w-full max-w-[480px]">
                  <GrowthChart currentFollowers={uniqueFollowers} />
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
