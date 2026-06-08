import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../../assets/cry808_logo.png';

const API_URL = import.meta.env.VITE_API_URL;

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
      ['New Article',  'M12 5v14M5 12h14',       '/admin/articles/create'],
      ['All Articles', 'M5 6h14M5 12h14M5 18h9',  '/admin/articles'],
      ['Submissions',  'M4 13h4l2 3h4l2-3h4M5 5h14l1 8v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5l1-8Z', '/admin/submissions'],
    ]],
    ['Intelligence', [
      ['Cortex', 'M12 2a5 5 0 0 1 5 5c0 2.4-1.7 4.4-4 4.9V21h-2v-9.1C8.7 11.4 7 9.4 7 7a5 5 0 0 1 5-5Z', '/admin/cortex'],
    ]],
    ['Business & Config', [
      ['Finance Hub', 'M12 3v18M8 7h6a3 3 0 0 1 0 6h-4a3 3 0 0 0 0 6h6', '/admin/finance'],
      ['Ad Settings',  'M12 4v16M4 12h16M7 7l10 10M17 7 7 17',            '/admin/settings'],
      ['Newsletter',   'M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z', '/admin/newsletter'],
      ['Spotify',      'M9 18V5l12-2v13M9 9l12-2', '/admin/spotify'],
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
              {items.map(([labelText, icon, to]) => {
                const isActive = active(to);
                return (
                  <button key={labelText} onClick={() => navigate(to)}
                    className={`group flex w-full items-center gap-3 border px-3 py-2.5 text-left text-sm transition duration-200 ${
                      isActive
                        ? 'border-green-500/25 bg-green-500/10 text-white'
                        : 'border-transparent text-slate-400 hover:border-white/[0.07] hover:bg-white/[0.04] hover:text-slate-100'
                    }`}
                  >
                    <span className={`grid h-8 w-8 place-items-center ${isActive ? 'bg-green-500/20 text-green-300' : 'bg-white/[0.04] text-slate-500 group-hover:text-slate-200'}`}>
                      <SideIcon path={icon} />
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

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) => n == null ? '—' : n >= 1_000_000
  ? `${(n / 1_000_000).toFixed(1)}M`
  : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K`
  : n.toLocaleString();

const TYPE_BADGE = {
  playlist: { label: 'Playlist', cls: 'bg-green-500/20 text-green-300' },
  album:    { label: 'Album',    cls: 'bg-blue-500/20  text-blue-300'  },
  track:    { label: 'Track',    cls: 'bg-purple-500/20 text-purple-300' },
  artist:   { label: 'Artist',  cls: 'bg-amber-500/20 text-amber-300' },
};

const PAGE_BADGE = {
  playlist: { label: 'Homepage Playlists', cls: 'bg-green-500/20 text-green-300' },
  home:     { label: 'Home Sidebar',       cls: 'bg-sky-500/20   text-sky-300'   },
  article:  { label: 'Article Sidebar',    cls: 'bg-violet-500/20 text-violet-300' },
};

// ── Embed card ────────────────────────────────────────────────────────────────
function EmbedCard({ embed, onDelete }) {
  const m = embed.metadata;
  const tb = TYPE_BADGE[m?.type] || TYPE_BADGE.playlist;
  const pb = PAGE_BADGE[embed.page_type] || PAGE_BADGE.home;

  return (
    <div className="group relative flex gap-4 p-4 border border-white/[0.07] bg-white/[0.02] hover:border-green-500/25 hover:bg-white/[0.04] transition-all">

      {/* Cover art */}
      <div className="flex-shrink-0 w-20 h-20 bg-white/[0.06] overflow-hidden">
        {m?.image
          ? <img src={m.image} alt={m.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-2xl text-white/20">🎵</div>
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-1.5 mb-1">
          <span className={`text-[10px] font-bold px-1.5 py-0.5 uppercase tracking-wide ${tb.cls}`}>
            {tb.label}
          </span>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 uppercase tracking-wide ${pb.cls}`}>
            {pb.label}
          </span>
          {!embed.is_active && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 uppercase tracking-wide bg-red-500/20 text-red-300">Inactive</span>
          )}
        </div>

        <p className="text-sm font-semibold text-white truncate">
          {m?.name || embed.title || 'Unknown'}
        </p>

        {m?.description && (
          <p className="text-[11px] text-white/40 truncate mt-0.5">{m.description}</p>
        )}

        <div className="flex items-center gap-4 mt-2">
          {m?.followers != null && (
            <span className="text-[11px] text-white/50">
              <span className="text-white/70 font-medium">{fmt(m.followers)}</span> followers
            </span>
          )}
          {m?.trackCount != null && (
            <span className="text-[11px] text-white/50">
              <span className="text-white/70 font-medium">{fmt(m.trackCount)}</span> tracks
            </span>
          )}
          {m?.owner && (
            <span className="text-[11px] text-white/40">by {m.owner}</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col items-end justify-between gap-2 flex-shrink-0">
        {m?.spotifyUrl && (
          <a
            href={m.spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] text-green-400 hover:text-green-300 transition-colors"
          >
            Open ↗
          </a>
        )}
        <button
          onClick={() => onDelete(embed.id)}
          className="text-[11px] text-white/25 hover:text-red-400 transition-colors px-2 py-1 border border-transparent hover:border-red-500/30"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

// ── No-credentials notice ─────────────────────────────────────────────────────
function CredsNotice() {
  return (
    <div className="px-5 py-4 border border-amber-500/25 bg-amber-950/20 mb-6">
      <p className="text-amber-300 text-xs font-semibold mb-1">⚠️ Spotify credentials not configured</p>
      <p className="text-amber-200/50 text-[11px] leading-relaxed">
        Add <code className="bg-white/10 px-1">SPOTIFY_CLIENT_ID</code> and{' '}
        <code className="bg-white/10 px-1">SPOTIFY_CLIENT_SECRET</code> to your Server808 environment
        variables to load live playlist names, covers, and stats.
        Create a free app at{' '}
        <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline text-amber-300">
          developer.spotify.com/dashboard
        </a>.
      </p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SpotifyDashboard() {
  const navigate = useNavigate();
  const [embeds, setEmbeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [credsOk, setCredsOk] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const token = localStorage.getItem('adminToken');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const r = await fetch(`${API_URL}/api/spotify/metadata`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) throw new Error('Failed to load');
      const d = await r.json();
      setEmbeds(d.embeds || []);
      setCredsOk(d.credentialsConfigured);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Remove this Spotify embed?')) return;
    setDeleting(id);
    try {
      const r = await fetch(`${API_URL}/api/spotify-embeds/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r.ok) setEmbeds(prev => prev.filter(e => e.id !== id));
    } catch (_) {}
    setDeleting(null);
  };

  // Group by page_type
  const playlists   = embeds.filter(e => e.page_type === 'playlist');
  const sidebars    = embeds.filter(e => e.page_type !== 'playlist');

  const stats = {
    total:     embeds.length,
    playlists: playlists.length,
    sidebars:  sidebars.length,
    followers: embeds.reduce((sum, e) => sum + (e.metadata?.followers || 0), 0),
  };

  return (
    <div className="admin-command-center content-command-center min-h-screen bg-[#070b12] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(34,197,94,.08),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(74,222,128,.06),transparent_30%)]" />
      <SidePanel />

      <div className="relative ml-[264px] min-h-screen">

        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-white/[0.07] bg-[#070b12]/82 px-8 py-3 backdrop-blur-xl">
          <div className="flex h-8 items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/admin/dashboard')}
                className="text-xs text-slate-500 hover:text-slate-200 uppercase tracking-[.16em] font-semibold transition-colors">
                ← Dashboard
              </button>
              <span className="text-gray-700">│</span>
              <span className="text-xs text-green-400 font-bold uppercase tracking-[.18em]">Spotify</span>
            </div>
            <button
              onClick={load}
              className="text-[11px] font-mono border border-white/10 text-white/40 hover:text-white hover:border-white/30 px-3 py-1.5 transition-colors"
            >
              ↺ Refresh
            </button>
          </div>
        </header>

        <div className="px-8 py-8 max-w-5xl">

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { label: 'Total Embeds',    value: stats.total,     color: 'text-white'    },
              { label: 'Playlists',       value: stats.playlists, color: 'text-green-400'},
              { label: 'Sidebar Embeds',  value: stats.sidebars,  color: 'text-sky-400'  },
              { label: 'Total Followers', value: fmt(stats.followers), color: 'text-green-300' },
            ].map(({ label, value, color }) => (
              <div key={label} className="border border-white/[0.07] bg-white/[0.02] px-4 py-3">
                <div className="text-[10px] font-mono text-white/35 uppercase tracking-wider mb-1">{label}</div>
                <div className={`text-2xl font-bold font-mono ${loading ? 'text-white/10' : color}`}>
                  {loading ? '—' : value}
                </div>
              </div>
            ))}
          </div>

          {!credsOk && <CredsNotice />}

          {error && (
            <div className="mb-6 px-4 py-3 border border-red-500/30 bg-red-950/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 border border-white/[0.05] bg-white/[0.02] animate-pulse" />
              ))}
            </div>
          ) : embeds.length === 0 ? (
            <div className="text-center py-20 text-white/30">
              <div className="text-5xl mb-4">🎵</div>
              <p className="text-sm">No Spotify embeds yet.</p>
              <p className="text-xs mt-2">Add them from <button onClick={() => navigate('/admin/settings')} className="text-green-400 underline">Ad Settings → Spotify</button></p>
            </div>
          ) : (
            <>
              {/* ── Homepage Playlists ─────────────────────────────── */}
              {playlists.length > 0 && (
                <section className="mb-10">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-bold text-white">🎧 Homepage Playlists</h2>
                      <p className="text-[11px] text-white/35 mt-0.5">Shown in the playlist section on the homepage</p>
                    </div>
                    <span className="text-[11px] font-mono text-green-400 border border-green-500/20 px-2 py-1">
                      {playlists.length} active
                    </span>
                  </div>
                  <div className="space-y-2">
                    {playlists.map(e => (
                      <EmbedCard key={e.id} embed={e} onDelete={handleDelete} />
                    ))}
                  </div>
                </section>
              )}

              {/* ── Sidebar Embeds ─────────────────────────────────── */}
              {sidebars.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-bold text-white">📌 Sidebar Embeds</h2>
                      <p className="text-[11px] text-white/35 mt-0.5">Embedded in page sidebars</p>
                    </div>
                    <span className="text-[11px] font-mono text-sky-400 border border-sky-500/20 px-2 py-1">
                      {sidebars.length} active
                    </span>
                  </div>
                  <div className="space-y-2">
                    {sidebars.map(e => (
                      <EmbedCard key={e.id} embed={e} onDelete={handleDelete} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          {/* Add more CTA */}
          {!loading && embeds.length > 0 && (
            <div className="mt-10 border border-white/[0.07] bg-white/[0.02] px-5 py-4 flex items-center justify-between">
              <p className="text-xs text-white/40">Add more Spotify embeds from Ad Settings</p>
              <button
                onClick={() => navigate('/admin/settings')}
                className="text-[11px] font-semibold border border-green-500/30 text-green-400 hover:bg-green-500/10 px-4 py-1.5 transition-colors"
              >
                + Add Embed
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
