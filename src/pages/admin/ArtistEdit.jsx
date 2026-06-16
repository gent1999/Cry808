import { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
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

const inputCls = 'w-full bg-black/50 border border-gray-700/60 text-sm text-gray-200 px-3 py-2.5 focus:outline-none focus:border-sky-700/60 placeholder-gray-700 transition-colors';

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-[11px] font-mono font-semibold uppercase tracking-widest text-gray-400 mb-2">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-[10px] font-mono text-gray-600">{hint}</p>}
    </div>
  );
}

export default function ArtistEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [artist, setArtist] = useState(null);
  const [linkedArticles, setLinkedArticles] = useState([]);
  const [allArticles, setAllArticles] = useState([]);
  const [articleSearch, setArticleSearch] = useState('');
  const [linking, setLinking] = useState(null);
  const [unlinking, setUnlinking] = useState(null);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) { navigate('/admin/login'); return; }
    loadArtist();
  }, [id]);

  async function loadArtist() {
    setFetching(true);
    try {
      const [listRes, articlesRes] = await Promise.all([
        fetch(`${API_URL}/api/artists`),
        fetch(`${API_URL}/api/articles`),
      ]);
      const listData = await listRes.json();
      const articlesData = await articlesRes.json();

      const found = (listData.artists || []).find(a => String(a.id) === String(id));
      if (!found) { setError('Artist not found'); return; }

      const profileRes = await fetch(`${API_URL}/api/artists/${found.slug}`);
      const profileData = await profileRes.json();

      setArtist(profileData.artist || found);
      setLinkedArticles(profileData.articles || []);
      setAllArticles(articlesData.articles || []);
      setName((profileData.artist || found).name);
      setBio((profileData.artist || found).bio || '');
      setImagePreview((profileData.artist || found).profile_image_url || null);
    } catch {
      setError('Failed to load artist');
    } finally {
      setFetching(false);
    }
  }

  async function linkArticle(article) {
    setLinking(article.id);
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`${API_URL}/api/artists/${id}/link/${article.id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setLinkedArticles(prev => [article, ...prev]);
      setArticleSearch('');
    } catch {}
    setLinking(null);
  }

  async function unlinkArticle(articleId) {
    setUnlinking(articleId);
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`${API_URL}/api/artists/${id}/link/${articleId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setLinkedArticles(prev => prev.filter(a => a.id !== articleId));
    } catch {}
    setUnlinking(null);
  }

  function handleImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) { setError('Name is required'); return; }
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('adminToken');
      const fd = new FormData();
      fd.append('name', name.trim());
      fd.append('bio', bio.trim());
      if (imageFile) fd.append('profile_image', imageFile);

      const res = await fetch(`${API_URL}/api/artists/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update artist');
      navigate('/admin/artists');
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#070b12] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(59,130,246,.16),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(139,92,246,.14),transparent_30%)]" />
      <SidePanel />

      <div className="relative ml-[264px] min-h-screen">
        <header className="sticky top-0 z-20 border-b border-white/[0.07] bg-[#070b12]/82 px-8 py-3 backdrop-blur-xl">
          <div className="flex h-8 items-center gap-2 text-sm text-slate-400">
            <button onClick={() => navigate('/admin/dashboard')} className="hover:text-white transition">Dashboard</button>
            <span className="text-slate-600">/</span>
            <button onClick={() => navigate('/admin/artists')} className="hover:text-white transition">Artists</button>
            <span className="text-slate-600">/</span>
            <span className="text-white font-medium">{artist?.name || 'Edit'}</span>
          </div>
        </header>

        <main className="px-8 py-8 max-w-2xl">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-white">Edit Artist Profile</h1>
          </div>

          {error && (
            <div className="mb-6 border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {fetching ? (
            <div className="text-slate-500 text-sm">Loading…</div>
          ) : (
            <>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Field label="Artist Name *" hint="Must match the 'Author' field used on their articles exactly.">
                <input
                  className={inputCls}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </Field>

              <Field label="Bio">
                <textarea
                  className={`${inputCls} resize-none`}
                  rows={5}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Write a short bio…"
                />
              </Field>

              <Field label="Profile Photo" hint="Upload a new photo to replace the current one. Max 5MB.">
                <div className="flex items-start gap-4">
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden border border-white/[0.08] bg-white/[0.04]">
                    {imagePreview
                      ? <img src={imagePreview} alt="preview" className="h-full w-full object-cover" />
                      : <div className="flex h-full w-full items-center justify-center text-slate-600 text-3xl">🎤</div>
                    }
                  </div>
                  <div className="flex-1">
                    <label className="cursor-pointer inline-block border border-white/[0.12] bg-white/[0.04] px-4 py-2 text-sm text-slate-300 hover:bg-white/[0.08] transition">
                      {imageFile ? imageFile.name : 'Replace photo…'}
                      <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
                    </label>
                  </div>
                </div>
              </Field>

              <div className="flex items-center gap-4 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-sm font-medium px-6 py-2.5 transition"
                >
                  {loading ? 'Saving…' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/admin/artists')}
                  className="text-sm text-slate-500 hover:text-slate-300 transition"
                >
                  Cancel
                </button>
                {artist && (
                  <a
                    href={`/artist/${artist.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-auto text-xs text-slate-500 hover:text-slate-300 transition"
                  >
                    View public page →
                  </a>
                )}
              </div>
            </form>

            {/* ── Linked Articles ──────────────────────────────────────────── */}
            <div className="mt-12 border-t border-white/[0.06] pt-8">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-sm font-semibold text-white">Linked Articles</h2>
                  <p className="text-[11px] text-slate-600 mt-0.5">Articles that feature or mention {name || 'this artist'}</p>
                </div>
                <span className="text-xs text-slate-600">{linkedArticles.length} linked</span>
              </div>

              {/* Search to add articles */}
              <div className="mb-4 relative">
                <input
                  className="w-full bg-black/50 border border-gray-700/60 text-sm text-gray-200 px-3 py-2.5 pr-8 focus:outline-none focus:border-sky-700/60 placeholder-gray-700 transition-colors"
                  placeholder="Search articles to link…"
                  value={articleSearch}
                  onChange={e => setArticleSearch(e.target.value)}
                />
                {articleSearch && (
                  <button
                    type="button"
                    onClick={() => setArticleSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 text-lg leading-none"
                  >×</button>
                )}
              </div>

              {/* Search results */}
              {articleSearch.trim().length >= 1 && (() => {
                const linkedIds = new Set(linkedArticles.map(a => a.id));
                const q = articleSearch.toLowerCase();
                const results = allArticles
                  .filter(a => !linkedIds.has(a.id) && (
                    a.title.toLowerCase().includes(q) ||
                    (a.author || '').toLowerCase().includes(q) ||
                    (a.tags || []).some(t => t.toLowerCase().includes(q))
                  ))
                  .slice(0, 8);
                return results.length === 0 ? (
                  <div className="mb-4 border border-white/[0.05] px-4 py-3 text-xs text-slate-600 text-center">No matching articles found</div>
                ) : (
                  <div className="mb-4 border border-white/[0.08] divide-y divide-white/[0.04]">
                    {results.map(article => (
                      <div key={article.id} className="flex items-center gap-3 bg-white/[0.02] px-4 py-2.5 hover:bg-white/[0.04] transition">
                        {article.image_url && (
                          <img src={article.image_url} alt="" className="h-8 w-11 flex-shrink-0 object-cover" />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="text-sm text-white truncate">{article.title}</div>
                          <div className="text-[11px] text-slate-600">{article.author}</div>
                        </div>
                        <button
                          type="button"
                          disabled={linking === article.id}
                          onClick={() => linkArticle(article)}
                          className="flex-shrink-0 text-xs bg-sky-600/20 hover:bg-sky-600/40 text-sky-400 border border-sky-600/30 px-3 py-1 transition disabled:opacity-40"
                        >
                          {linking === article.id ? '…' : '+ Link'}
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Currently linked */}
              {linkedArticles.length === 0 ? (
                <div className="border border-white/[0.05] bg-white/[0.02] px-4 py-6 text-center text-xs text-slate-600">
                  No articles linked yet. Search above to add some.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {linkedArticles.map(article => (
                    <div key={article.id} className="flex items-center gap-3 border border-white/[0.05] bg-white/[0.02] px-4 py-3 hover:bg-white/[0.04] transition">
                      {article.image_url && (
                        <img src={article.image_url} alt="" className="h-10 w-14 flex-shrink-0 object-cover" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="text-sm text-white truncate">{article.title}</div>
                        <div className="text-[11px] text-slate-600 mt-0.5">
                          {article.author}
                          {article.created_at && (
                            <span className="ml-2">{new Date(article.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/articles/edit/${article.id}`)}
                        className="flex-shrink-0 text-xs text-sky-500 hover:text-sky-400 transition px-2"
                      >
                        Edit →
                      </button>
                      <button
                        type="button"
                        disabled={unlinking === article.id}
                        onClick={() => unlinkArticle(article.id)}
                        className="flex-shrink-0 text-xs text-red-500/60 hover:text-red-400 transition disabled:opacity-40"
                      >
                        {unlinking === article.id ? '…' : 'Remove'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
