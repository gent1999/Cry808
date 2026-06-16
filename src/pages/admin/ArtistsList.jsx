import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../../assets/cry808_logo.png';

const API_URL = import.meta.env.VITE_API_URL;

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
      ['New Article',  'M12 5v14M5 12h14',      '/admin/articles/create'],
      ['All Articles', 'M5 6h14M5 12h14M5 18h9', '/admin/articles'],
      ['Artists',      'M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm-7 9a7 7 0 0 1 14 0', '/admin/artists'],
      ['Submissions',  'M4 13h4l2 3h4l2-3h4M5 5h14l1 8v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5l1-8Z', '/admin/submissions'],
    ]],
    ['Intelligence', [
      ['Cortex', 'M12 2a5 5 0 0 1 5 5c0 2.4-1.7 4.4-4 4.9V21h-2v-9.1C8.7 11.4 7 9.4 7 7a5 5 0 0 1 5-5Z', '/admin/cortex'],
    ]],
    ['Business & Config', [
      ['Finance Hub', 'M12 3v18M8 7h6a3 3 0 0 1 0 6h-4a3 3 0 0 0 0 6h6', '/admin/finance'],
      ['Ad Settings',  'M12 4v16M4 12h16M7 7l10 10M17 7 7 17', '/admin/settings'],
      ['Newsletter',   'M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z', '/admin/newsletter'],
      ['Spotify',      'M9 18V5l12-2v13M9 9l12-2', '/admin/spotify'],
    ]],
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-[264px] flex-col border-r border-white/[0.07] bg-[#0b1019]/95 px-4 py-5 shadow-[20px_0_80px_rgba(0,0,0,.34)] backdrop-blur-xl">
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
                        ? 'border-sky-300/25 bg-sky-300/10 text-white'
                        : 'border-transparent text-slate-400 hover:border-white/[0.07] hover:bg-white/[0.04] hover:text-slate-100'
                    }`}
                  >
                    <span className={`grid h-8 w-8 place-items-center ${isActive ? 'bg-sky-500/20 text-sky-200' : 'bg-white/[0.04] text-slate-500 group-hover:text-slate-200'}`}>
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

export default function ArtistsList() {
  const navigate = useNavigate();
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) { navigate('/admin/login'); return; }
    loadArtists();
  }, []);

  async function loadArtists() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/artists`);
      const data = await res.json();
      setArtists(data.artists || []);
    } catch {}
    setLoading(false);
  }

  async function handleDelete(artist) {
    if (!window.confirm(`Delete "${artist.name}"? This cannot be undone.`)) return;
    setDeleting(artist.id);
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`${API_URL}/api/artists/${artist.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setArtists(a => a.filter(x => x.id !== artist.id));
    } catch {}
    setDeleting(null);
  }

  return (
    <div className="min-h-screen bg-[#070b12] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(59,130,246,.16),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(139,92,246,.14),transparent_30%)]" />
      <SidePanel />

      <div className="relative ml-[264px] min-h-screen">
        <header className="sticky top-0 z-20 border-b border-white/[0.07] bg-[#070b12]/82 px-8 py-3 backdrop-blur-xl">
          <div className="flex h-8 items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <button onClick={() => navigate('/admin/dashboard')} className="hover:text-white transition">Dashboard</button>
              <span className="text-slate-600">/</span>
              <span className="text-white font-medium">Artists</span>
            </div>
            <button
              onClick={() => navigate('/admin/artists/create')}
              className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium px-4 py-1.5 transition"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              New Artist
            </button>
          </div>
        </header>

        <main className="px-8 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-white">Artist Profiles</h1>
            <p className="mt-1 text-sm text-slate-500">Profiles for artists featured across multiple articles.</p>
          </div>

          {loading ? (
            <div className="text-slate-500 text-sm">Loading…</div>
          ) : artists.length === 0 ? (
            <div className="border border-white/[0.06] bg-white/[0.02] p-12 text-center">
              <div className="text-slate-600 text-sm mb-4">No artist profiles yet.</div>
              <button
                onClick={() => navigate('/admin/artists/create')}
                className="text-sky-400 hover:text-sky-300 text-sm transition"
              >
                Create your first artist profile →
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {artists.map(artist => (
                <div key={artist.id} className="flex items-center gap-4 border border-white/[0.06] bg-white/[0.02] px-5 py-4 hover:bg-white/[0.04] transition">
                  {/* Avatar */}
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden bg-white/[0.05]">
                    {artist.profile_image_url
                      ? <img src={artist.profile_image_url} alt={artist.name} className="h-full w-full object-cover" />
                      : <div className="flex h-full w-full items-center justify-center text-slate-600 text-xl">🎤</div>
                    }
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-white text-sm">{artist.name}</div>
                    {artist.bio && (
                      <div className="mt-0.5 text-xs text-slate-500 truncate max-w-xl">{artist.bio}</div>
                    )}
                  </div>

                  {/* View public page */}
                  <a
                    href={`/artist/${artist.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-slate-500 hover:text-slate-300 transition px-2"
                  >
                    View →
                  </a>

                  {/* Edit */}
                  <button
                    onClick={() => navigate(`/admin/artists/edit/${artist.id}`)}
                    className="text-xs text-sky-400 hover:text-sky-300 transition px-2"
                  >
                    Edit
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(artist)}
                    disabled={deleting === artist.id}
                    className="text-xs text-red-500/70 hover:text-red-400 transition px-2 disabled:opacity-40"
                  >
                    {deleting === artist.id ? '…' : 'Delete'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
