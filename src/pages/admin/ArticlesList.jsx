import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

// ── helpers ───────────────────────────────────────────────────────────────────
const slugify = t => t.toLowerCase().trim()
  .replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/--+/g, '-');

const articlePath = a => `/article/${a.id}-${slugify(a.title)}`;

const fmt  = n => (+n || 0).toLocaleString();
const fmtD = d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });

// ── Tiny shared atoms ─────────────────────────────────────────────────────────
const Chip = ({ label, value, color = 'text-gray-500', loading }) => (
  <div className="flex flex-col items-center min-w-[44px]">
    <span className={`text-[11px] font-mono font-bold leading-none ${loading ? 'text-gray-800' : color}`}>
      {loading ? '…' : (value ?? '—')}
    </span>
    <span className="text-[8px] font-mono text-gray-700 uppercase tracking-wider mt-0.5">{label}</span>
  </div>
);

const SkeletonRow = () => (
  <tr className="border-b border-gray-900 animate-pulse">
    {Array(10).fill(0).map((_, i) => (
      <td key={i} className="px-3 py-2.5"><div className="h-3 bg-gray-800 rounded w-full" /></td>
    ))}
  </tr>
);

// ── Summary stat card ─────────────────────────────────────────────────────────
const SumCard = ({ label, value, accent = 'text-white', border = 'border-l-gray-700', loading, sub }) => (
  <div className={`bg-[#0d1117] border border-gray-900 border-l-2 ${border} px-3 py-2.5`}>
    <div className="text-[9px] font-mono text-gray-600 uppercase tracking-widest mb-1">{label}</div>
    <div className={`text-lg font-bold font-mono ${loading ? 'text-gray-800' : accent}`}>
      {loading ? '…' : value}
    </div>
    {sub && <div className="text-[9px] font-mono text-gray-700 mt-0.5 truncate">{sub}</div>}
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
export default function ArticlesList() {
  const navigate = useNavigate();

  const [articles,    setArticles]    = useState([]);
  const [artLoading,  setArtLoading]  = useState(true);
  const [anaLoading,  setAnaLoading]  = useState(true);
  const [gaPages,     setGaPages]     = useState({});
  const [gscPages,    setGscPages]    = useState({});
  const [viewMode,    setViewMode]    = useState('list');
  const [search,      setSearch]      = useState('');
  const [sortBy,      setSortBy]      = useState('newest');
  const [filterFeat,  setFilterFeat]  = useState(false);
  const [deleting,    setDeleting]    = useState(null);
  const [featuring,   setFeaturing]   = useState(null);
  const [error,       setError]       = useState('');

  // Session cache ref — analytics won't re-fetch on toggle/filter
  const anaCache = useRef({ ga: null, gsc: null });

  const token = () => localStorage.getItem('adminToken');
  const hdrs  = () => ({ Authorization: `Bearer ${token()}` });

  // ── Load articles ─────────────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${API_URL}/api/articles`)
      .then(r => r.json())
      .then(d => setArticles(d.articles || []))
      .catch(e => setError(e.message))
      .finally(() => setArtLoading(false));
  }, []);

  // ── Load analytics (auto, parallel) ──────────────────────────────────────
  const loadAnalytics = async () => {
    setAnaLoading(true);
    try {
      const [gaRes, gscRes] = await Promise.all([
        fetch(`${API_URL}/api/analytics/article-pages`,       { headers: hdrs() }),
        fetch(`${API_URL}/api/search-console/article-pages`,  { headers: hdrs() }),
      ]);
      const ga  = gaRes.ok  ? await gaRes.json()  : {};
      const gsc = gscRes.ok ? await gscRes.json() : {};
      const gaP  = ga.pages  || {};
      const gscP = gsc.pages || {};
      setGaPages(gaP);
      setGscPages(gscP);
      anaCache.current = { ga: gaP, gsc: gscP };
    } catch (e) {
      console.warn('Analytics fetch failed:', e.message);
    } finally {
      setAnaLoading(false);
    }
  };

  useEffect(() => {
    if (!artLoading) loadAnalytics();
  }, [artLoading]);

  // ── Per-article analytics helper ──────────────────────────────────────────
  const getAna = (article) => {
    const path = articlePath(article);
    const ga  = gaPages[path]  || null;
    const gsc = gscPages[path] || gscPages[`https://cry808.com${path}`] || null;
    return { ga, gsc };
  };

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!confirm('Delete this article? This cannot be undone.')) return;
    setDeleting(id);
    try {
      const r = await fetch(`${API_URL}/api/articles/${id}`, { method: 'DELETE', headers: hdrs() });
      if (!r.ok) throw new Error('Delete failed');
      setArticles(prev => prev.filter(a => a.id !== id));
    } catch (e) { setError(e.message); }
    setDeleting(null);
  };

  const handleFeature = async (id, current) => {
    setFeaturing(id);
    try {
      const r = await fetch(`${API_URL}/api/featured/${id}`, {
        method: current ? 'DELETE' : 'PUT',
        headers: hdrs(),
      });
      if (!r.ok) throw new Error('Feature toggle failed');
      setArticles(prev => prev.map(a => ({
        ...a,
        is_featured: current ? false : a.id === id,
      })));
    } catch (e) { setError(e.message); }
    setFeaturing(null);
  };

  // ── Derived / filtered list ───────────────────────────────────────────────
  const enriched = useMemo(() => articles.map(a => {
    const { ga, gsc } = getAna(a);
    return { ...a, ga, gsc };
  }), [articles, gaPages, gscPages]);

  const filtered = useMemo(() => {
    let list = [...enriched];
    if (filterFeat) list = list.filter(a => a.is_featured);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.author?.toLowerCase().includes(q) ||
        (a.tags || []).some(t => t.toLowerCase().includes(q))
      );
    }
    switch (sortBy) {
      case 'oldest':    list.sort((a,b) => new Date(a.created_at) - new Date(b.created_at)); break;
      case 'views':     list.sort((a,b) => (b.ga?.pageViews||0) - (a.ga?.pageViews||0)); break;
      case 'clicks':    list.sort((a,b) => (b.gsc?.clicks||0)    - (a.gsc?.clicks||0)); break;
      case 'ctr_best':  list.sort((a,b) => (b.gsc?.ctr||0)       - (a.gsc?.ctr||0)); break;
      case 'ctr_worst': list.sort((a,b) => (a.gsc?.ctr||0)       - (b.gsc?.ctr||0)); break;
      case 'position':  list.sort((a,b) => {
        const ap = a.gsc?.position || 999, bp = b.gsc?.position || 999;
        return ap - bp;
      }); break;
      default: list.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    }
    return list;
  }, [enriched, search, sortBy, filterFeat]);

  // ── Summary stats ─────────────────────────────────────────────────────────
  const summary = useMemo(() => {
    const totalViews   = enriched.reduce((s, a) => s + (a.ga?.pageViews  || 0), 0);
    const totalClicks  = enriched.reduce((s, a) => s + (a.gsc?.clicks    || 0), 0);
    const totalImpr    = enriched.reduce((s, a) => s + (a.gsc?.impressions || 0), 0);
    const featured     = enriched.filter(a => a.is_featured).length;
    const bestCtr      = [...enriched].filter(a=>a.gsc?.ctr).sort((a,b)=>(b.gsc.ctr||0)-(a.gsc.ctr||0))[0];
    const topView      = [...enriched].filter(a=>a.ga?.pageViews).sort((a,b)=>(b.ga.pageViews||0)-(a.ga.pageViews||0))[0];
    return { totalViews, totalClicks, totalImpr, featured, bestCtr, topView };
  }, [enriched]);

  if (artLoading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="flex items-center gap-3">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
        <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">Loading content library…</span>
      </div>
    </div>
  );

  return (
    <div className="ml-52 min-h-screen bg-black text-white">

      {/* ── Command Bar ──────────────────────────────────────────────────── */}
      <header className="bg-[#080b10] border-b border-gray-900 sticky top-0 z-10">
        <div className="px-5 h-11 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin/dashboard')}
              className="text-[10px] font-mono text-gray-700 hover:text-gray-400 uppercase tracking-wider transition-colors">
              ← Dashboard
            </button>
            <span className="text-gray-800">│</span>
            <span className="text-[10px] font-mono text-blue-500 font-bold uppercase tracking-widest">Content Intelligence</span>
            <span className="text-[10px] font-mono text-gray-700">{articles.length} records</span>
          </div>
          <div className="flex items-center gap-2">
            {!anaLoading && (
              <button onClick={loadAnalytics}
                className="text-[9px] font-mono text-gray-700 hover:text-blue-400 uppercase tracking-wider border border-gray-900 hover:border-blue-900 px-2 py-1 transition-colors">
                ↻ Refresh Analytics
              </button>
            )}
            <button onClick={() => setViewMode(v => v === 'list' ? 'grid' : 'list')}
              className="text-[9px] font-mono text-gray-600 hover:text-white uppercase tracking-wider border border-gray-900 px-2 py-1 transition-colors">
              {viewMode === 'list' ? '⊞ Grid' : '≡ List'}
            </button>
            <button onClick={() => navigate('/admin/articles/create')}
              className="text-[9px] font-mono text-blue-400 border border-blue-900 hover:bg-blue-950/30 px-3 py-1 uppercase tracking-wider transition-colors">
              + New Article
            </button>
          </div>
        </div>
      </header>

      <main className="px-5 py-4 space-y-4">

        {error && (
          <div className="border border-red-900 bg-red-950/20 px-4 py-2 text-[10px] font-mono text-red-400 uppercase tracking-wider">
            {error}
          </div>
        )}

        {/* ── Summary Row ────────────────────────────────────────────────── */}
        <section>
          <div className="grid grid-cols-8 gap-px bg-gray-900">
            <SumCard label="Total Articles" value={fmt(articles.length)}       border="border-l-blue-800"   accent="text-blue-400" />
            <SumCard label="Published"      value={fmt(articles.length)}       border="border-l-green-800"  accent="text-green-400" />
            <SumCard label="Featured"       value={fmt(summary.featured)}       border="border-l-yellow-700" accent="text-yellow-400" />
            <SumCard label="Total Views"    value={fmt(summary.totalViews)}     border="border-l-blue-700"   accent="text-blue-300"  loading={anaLoading} />
            <SumCard label="Total Clicks"   value={fmt(summary.totalClicks)}    border="border-l-green-700"  accent="text-green-400" loading={anaLoading} />
            <SumCard label="Impressions"    value={fmt(summary.totalImpr)}      border="border-l-gray-700"   accent="text-gray-300"  loading={anaLoading} />
            <SumCard label="Best CTR"
              value={summary.bestCtr ? `${summary.bestCtr.gsc.ctr}%` : '—'}
              sub={summary.bestCtr?.title?.slice(0,20)}
              border="border-l-purple-700" accent="text-purple-400"           loading={anaLoading} />
            <SumCard label="Top Viewed"
              value={summary.topView ? fmt(summary.topView.ga.pageViews) : '—'}
              sub={summary.topView?.title?.slice(0,20)}
              border="border-l-blue-600" accent="text-blue-400"               loading={anaLoading} />
          </div>
        </section>

        {/* ── Filters ────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search title, author, tag…"
            className="bg-[#0d1117] border border-gray-800 text-sm text-white font-mono px-3 py-1.5 focus:outline-none focus:border-blue-800 placeholder-gray-700 w-64"
          />
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="bg-[#0d1117] border border-gray-800 text-[11px] text-gray-400 font-mono px-3 py-1.5 focus:outline-none cursor-pointer">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="views">Most Views</option>
            <option value="clicks">Most Clicks</option>
            <option value="ctr_best">Best CTR</option>
            <option value="ctr_worst">Worst CTR</option>
            <option value="position">Best Position</option>
          </select>
          <button
            onClick={() => setFilterFeat(f => !f)}
            className={`text-[10px] font-mono uppercase tracking-wider border px-3 py-1.5 transition-colors ${
              filterFeat
                ? 'border-yellow-800 text-yellow-400 bg-yellow-950/20'
                : 'border-gray-800 text-gray-600 hover:border-gray-700'
            }`}
          >
            ★ Featured Only
          </button>
          <span className="text-[10px] font-mono text-gray-700 ml-auto">
            {filtered.length} / {articles.length}
          </span>
          {anaLoading && (
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[9px] font-mono text-blue-700 uppercase tracking-widest">Loading analytics…</span>
            </div>
          )}
        </div>

        {/* ── LIST VIEW ──────────────────────────────────────────────────── */}
        {viewMode === 'list' ? (
          <div className="bg-[#0d1117] border border-gray-900">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-gray-900">
                    {[
                      { label: 'Article',     w: '' },
                      { label: 'Author/Date', w: 'w-28' },
                      { label: 'Tags',        w: 'w-32' },
                      { label: 'Views',       w: 'w-16' },
                      { label: 'Clicks',      w: 'w-16' },
                      { label: 'Impr',        w: 'w-16' },
                      { label: 'CTR',         w: 'w-14' },
                      { label: 'Pos',         w: 'w-14' },
                      { label: 'Status',      w: 'w-16' },
                      { label: 'Actions',     w: 'w-28' },
                    ].map(h => (
                      <th key={h.label} className={`px-3 py-2 text-[9px] font-mono text-gray-700 uppercase tracking-widest text-left font-normal ${h.w}`}>
                        {h.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {artLoading
                    ? Array(8).fill(0).map((_, i) => <SkeletonRow key={i} />)
                    : filtered.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="px-4 py-12 text-center text-[10px] font-mono text-gray-700 uppercase tracking-widest">
                          No articles match filters
                        </td>
                      </tr>
                    ) : filtered.map(article => {
                      const { ga, gsc } = article;
                      return (
                        <tr key={article.id} className="border-b border-gray-900/60 hover:bg-white/[0.02] transition-colors group">

                          {/* Article */}
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-2.5">
                              {article.image_url
                                ? <img src={article.image_url} alt="" className="w-10 h-7 object-cover flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
                                : <div className="w-10 h-7 bg-gray-800 flex-shrink-0" />
                              }
                              <button
                                onClick={() => window.open(`/article/${article.id}`, '_blank')}
                                className="text-[11px] font-mono text-gray-300 hover:text-white text-left leading-tight line-clamp-2 transition-colors"
                              >
                                {article.title}
                              </button>
                            </div>
                          </td>

                          {/* Author / Date */}
                          <td className="px-3 py-2.5">
                            <div className="text-[10px] font-mono text-gray-500">{article.author}</div>
                            <div className="text-[9px] font-mono text-gray-700">{fmtD(article.created_at)}</div>
                          </td>

                          {/* Tags */}
                          <td className="px-3 py-2.5">
                            <div className="flex flex-wrap gap-1">
                              {(article.tags || []).slice(0,2).map((t,i) => (
                                <span key={i} className="text-[8px] font-mono text-purple-600 border border-purple-900/50 px-1 py-px">{t}</span>
                              ))}
                              {(article.tags || []).length > 2 && (
                                <span className="text-[8px] font-mono text-gray-700">+{article.tags.length-2}</span>
                              )}
                            </div>
                          </td>

                          {/* GA Views */}
                          <td className="px-3 py-2.5 text-[11px] font-mono text-right">
                            <span className={anaLoading ? 'text-gray-800' : ga ? 'text-blue-400' : 'text-gray-800'}>
                              {anaLoading ? '…' : ga ? fmt(ga.pageViews) : '—'}
                            </span>
                          </td>

                          {/* GSC Clicks */}
                          <td className="px-3 py-2.5 text-[11px] font-mono text-right">
                            <span className={anaLoading ? 'text-gray-800' : gsc ? 'text-green-400' : 'text-gray-800'}>
                              {anaLoading ? '…' : gsc ? fmt(gsc.clicks) : '—'}
                            </span>
                          </td>

                          {/* GSC Impressions */}
                          <td className="px-3 py-2.5 text-[11px] font-mono text-right">
                            <span className={anaLoading ? 'text-gray-800' : gsc ? 'text-gray-400' : 'text-gray-800'}>
                              {anaLoading ? '…' : gsc ? fmt(gsc.impressions) : '—'}
                            </span>
                          </td>

                          {/* CTR */}
                          <td className="px-3 py-2.5 text-[11px] font-mono text-right">
                            <span className={
                              anaLoading ? 'text-gray-800' :
                              !gsc ? 'text-gray-800' :
                              gsc.ctr >= 5 ? 'text-green-400' :
                              gsc.ctr >= 2 ? 'text-yellow-400' : 'text-gray-500'
                            }>
                              {anaLoading ? '…' : gsc ? `${gsc.ctr}%` : '—'}
                            </span>
                          </td>

                          {/* Position */}
                          <td className="px-3 py-2.5 text-[11px] font-mono text-right">
                            <span className={
                              anaLoading ? 'text-gray-800' :
                              !gsc ? 'text-gray-800' :
                              gsc.position <= 3  ? 'text-green-400' :
                              gsc.position <= 10 ? 'text-yellow-400' : 'text-gray-500'
                            }>
                              {anaLoading ? '…' : gsc ? `#${gsc.position}` : '—'}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-3 py-2.5">
                            {article.is_featured
                              ? <span className="text-[8px] font-mono font-bold text-yellow-400 border border-yellow-900 px-1.5 py-px">FEATURED</span>
                              : <span className="text-[8px] font-mono text-gray-700 border border-gray-800 px-1.5 py-px">PUBLISHED</span>
                            }
                          </td>

                          {/* Actions */}
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleFeature(article.id, article.is_featured)}
                                disabled={featuring === article.id}
                                title={article.is_featured ? 'Remove featured' : 'Set featured'}
                                className={`text-[10px] px-1.5 py-1 border transition-colors disabled:opacity-40 ${
                                  article.is_featured
                                    ? 'border-yellow-800 text-yellow-500 hover:bg-yellow-950/20'
                                    : 'border-gray-800 text-gray-600 hover:border-yellow-900 hover:text-yellow-600'
                                }`}
                              >
                                ★
                              </button>
                              <button
                                onClick={() => navigate(`/admin/articles/edit/${article.id}`)}
                                className="text-[9px] font-mono px-1.5 py-1 border border-gray-800 text-gray-600 hover:border-blue-900 hover:text-blue-400 transition-colors uppercase"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(article.id)}
                                disabled={deleting === article.id}
                                className="text-[9px] font-mono px-1.5 py-1 border border-gray-800 text-gray-700 hover:border-red-900 hover:text-red-500 transition-colors disabled:opacity-40 uppercase"
                              >
                                {deleting === article.id ? '…' : 'Del'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  }
                </tbody>
              </table>
            </div>
          </div>

        ) : (
          /* ── GRID VIEW ─────────────────────────────────────────────────── */
          <div className="grid grid-cols-3 gap-3 xl:grid-cols-4">
            {filtered.map(article => {
              const { ga, gsc } = article;
              return (
                <div
                  key={article.id}
                  className={`bg-[#0d1117] border flex flex-col transition-colors ${
                    article.is_featured ? 'border-yellow-900/60' : 'border-gray-900 hover:border-blue-900/50'
                  }`}
                >
                  {/* Image */}
                  <div className="relative">
                    {article.image_url
                      ? <img src={article.image_url} alt={article.title}
                          className="w-full h-28 object-cover opacity-75" />
                      : <div className="w-full h-28 bg-gradient-to-br from-blue-950 to-gray-900" />
                    }
                    {article.is_featured && (
                      <span className="absolute top-1.5 right-1.5 text-[8px] font-mono font-bold text-yellow-400 bg-black/80 border border-yellow-900 px-1.5 py-px">
                        ★ FEATURED
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="px-3 py-2.5 flex-1">
                    <button
                      onClick={() => window.open(`/article/${article.id}`, '_blank')}
                      className="text-[11px] font-mono text-gray-200 hover:text-white text-left leading-tight line-clamp-2 mb-1.5 transition-colors w-full"
                    >
                      {article.title}
                    </button>
                    <div className="text-[9px] font-mono text-gray-600 mb-2">
                      {article.author} · {fmtD(article.created_at)}
                    </div>
                    {/* Analytics chips */}
                    <div className="flex gap-3 border-t border-gray-800/60 pt-2">
                      <Chip label="Views" value={ga ? fmt(ga.pageViews)       : '—'} color="text-blue-400"   loading={anaLoading} />
                      <Chip label="Clicks" value={gsc ? fmt(gsc.clicks)       : '—'} color="text-green-400"  loading={anaLoading} />
                      <Chip label="CTR"   value={gsc ? `${gsc.ctr}%`          : '—'} color={gsc?.ctr>=5?'text-green-400':gsc?.ctr>=2?'text-yellow-400':'text-gray-500'} loading={anaLoading} />
                      <Chip label="Pos"   value={gsc ? `#${gsc.position}`     : '—'} color={gsc?.position<=3?'text-green-400':gsc?.position<=10?'text-yellow-400':'text-gray-500'} loading={anaLoading} />
                    </div>
                    {/* Tags */}
                    {(article.tags||[]).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {article.tags.slice(0,3).map((t,i) => (
                          <span key={i} className="text-[8px] font-mono text-purple-700 border border-purple-900/40 px-1 py-px">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex border-t border-gray-900">
                    <button
                      onClick={() => handleFeature(article.id, article.is_featured)}
                      disabled={featuring === article.id}
                      className={`flex-1 py-2 text-[9px] font-mono uppercase tracking-wider transition-colors border-r border-gray-900 ${
                        article.is_featured ? 'text-yellow-500 hover:bg-yellow-950/20' : 'text-gray-700 hover:text-yellow-500'
                      } disabled:opacity-40`}
                    >★</button>
                    <button
                      onClick={() => navigate(`/admin/articles/edit/${article.id}`)}
                      className="flex-1 py-2 text-[9px] font-mono text-gray-600 hover:text-blue-400 uppercase tracking-wider transition-colors border-r border-gray-900"
                    >Edit</button>
                    <button
                      onClick={() => handleDelete(article.id)}
                      disabled={deleting === article.id}
                      className="flex-1 py-2 text-[9px] font-mono text-gray-700 hover:text-red-500 uppercase tracking-wider transition-colors disabled:opacity-40"
                    >{deleting === article.id ? '…' : 'Del'}</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
