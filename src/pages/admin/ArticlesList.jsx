import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

const slugify = t => t.toLowerCase().trim()
  .replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/--+/g, '-');

const articlePath = a => `/article/${a.id}-${slugify(a.title)}`;

const fmt  = n => (+n || 0).toLocaleString();
const fmtD = d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });

// ── Analytics chip (grid view) ────────────────────────────────────────────────
const Chip = ({ label, value, color = 'text-gray-400', loading }) => (
  <div className="flex flex-col items-center min-w-[48px]">
    <span className={`text-xs font-mono font-bold leading-none ${loading ? 'text-gray-700' : color}`}>
      {loading ? '…' : (value ?? '—')}
    </span>
    <span className="text-[9px] font-mono text-gray-600 uppercase tracking-wider mt-0.5">{label}</span>
  </div>
);

// ── Skeleton row ──────────────────────────────────────────────────────────────
const SkeletonRow = ({ idx }) => (
  <tr className={`border-b border-gray-800/40 animate-pulse ${idx % 2 === 0 ? 'bg-[#0a0e14]' : 'bg-black'}`}>
    {[null, '60%', '50%', '40%', '40%', '40%', '35%', '35%', '30%', '70%'].map((w, i) => (
      <td key={i} className="px-4 py-4">
        <div className={`h-3 bg-gray-800 rounded`} style={{ width: w || '80%' }} />
      </td>
    ))}
  </tr>
);

// ── Summary stat card ─────────────────────────────────────────────────────────
const SumCard = ({ label, value, accent = 'text-white', border = 'border-l-gray-700', loading, sub }) => (
  <div className={`bg-[#0a0e14] border border-gray-800/60 border-l-2 ${border} px-3.5 py-3`}>
    <div className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1.5">{label}</div>
    <div className={`text-xl font-bold font-mono ${loading ? 'text-gray-800' : accent}`}>
      {loading ? '—' : value}
    </div>
    {sub && <div className="text-[10px] font-mono text-gray-600 mt-1 truncate">{sub}</div>}
  </div>
);

// ── CTR color helper ──────────────────────────────────────────────────────────
const ctrColor  = v => v >= 5 ? 'text-emerald-400' : v >= 2 ? 'text-amber-400' : 'text-gray-400';
const posColor  = v => v <= 3 ? 'text-emerald-400' : v <= 10 ? 'text-amber-400' : 'text-gray-400';

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

  const anaCache = useRef({ ga: null, gsc: null });

  const token = () => localStorage.getItem('adminToken');
  const hdrs  = () => ({ Authorization: `Bearer ${token()}` });

  useEffect(() => {
    fetch(`${API_URL}/api/articles`)
      .then(r => r.json())
      .then(d => setArticles(d.articles || []))
      .catch(e => setError(e.message))
      .finally(() => setArtLoading(false));
  }, []);

  const loadAnalytics = async () => {
    setAnaLoading(true);
    try {
      const [gaRes, gscRes] = await Promise.all([
        fetch(`${API_URL}/api/analytics/article-pages`,      { headers: hdrs() }),
        fetch(`${API_URL}/api/search-console/article-pages`, { headers: hdrs() }),
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

  useEffect(() => { if (!artLoading) loadAnalytics(); }, [artLoading]);

  const getAna = (article) => {
    const path = articlePath(article);
    return {
      ga:  gaPages[path]  || null,
      gsc: gscPages[path] || gscPages[`https://cry808.com${path}`] || null,
    };
  };

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
      case 'clicks':    list.sort((a,b) => (b.gsc?.clicks||0)   - (a.gsc?.clicks||0)); break;
      case 'ctr_best':  list.sort((a,b) => (b.gsc?.ctr||0)      - (a.gsc?.ctr||0)); break;
      case 'ctr_worst': list.sort((a,b) => (a.gsc?.ctr||0)      - (b.gsc?.ctr||0)); break;
      case 'position':  list.sort((a,b) => (a.gsc?.position||999) - (b.gsc?.position||999)); break;
      default:          list.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    }
    return list;
  }, [enriched, search, sortBy, filterFeat]);

  const summary = useMemo(() => {
    const totalViews  = enriched.reduce((s, a) => s + (a.ga?.pageViews    || 0), 0);
    const totalClicks = enriched.reduce((s, a) => s + (a.gsc?.clicks      || 0), 0);
    const totalImpr   = enriched.reduce((s, a) => s + (a.gsc?.impressions || 0), 0);
    const featured    = enriched.filter(a => a.is_featured).length;
    const bestCtr     = [...enriched].filter(a=>a.gsc?.ctr).sort((a,b)=>(b.gsc.ctr||0)-(a.gsc.ctr||0))[0];
    const topView     = [...enriched].filter(a=>a.ga?.pageViews).sort((a,b)=>(b.ga.pageViews||0)-(a.ga.pageViews||0))[0];
    return { totalViews, totalClicks, totalImpr, featured, bestCtr, topView };
  }, [enriched]);

  if (artLoading) return (
    <div className="ml-52 min-h-screen bg-black flex items-center justify-center">
      <div className="flex items-center gap-3">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
        <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">Loading content library…</span>
      </div>
    </div>
  );

  return (
    <div className="ml-52 min-h-screen bg-black text-white">

      {/* ── Command Bar ──────────────────────────────────────────────────────── */}
      <header className="bg-[#080b10] border-b border-gray-800/60 sticky top-0 z-20">
        <div className="px-5 h-11 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin/dashboard')}
              className="text-[10px] font-mono text-gray-600 hover:text-gray-300 uppercase tracking-wider transition-colors">
              ← Dashboard
            </button>
            <span className="text-gray-700">│</span>
            <span className="text-[11px] font-mono text-blue-400 font-bold uppercase tracking-widest">Content Intelligence</span>
            <span className="text-[10px] font-mono text-gray-500">{articles.length} records</span>
          </div>
          <div className="flex items-center gap-2">
            {!anaLoading && (
              <button onClick={loadAnalytics}
                className="text-[10px] font-mono text-gray-500 hover:text-blue-300 uppercase tracking-wider border border-gray-800 hover:border-blue-800/60 px-2.5 py-1 transition-colors">
                ↻ Refresh
              </button>
            )}
            <button onClick={() => setViewMode(v => v === 'list' ? 'grid' : 'list')}
              className="text-[10px] font-mono text-gray-500 hover:text-gray-200 uppercase tracking-wider border border-gray-800 hover:border-gray-600 px-2.5 py-1 transition-colors">
              {viewMode === 'list' ? '⊞ Grid' : '≡ List'}
            </button>
            <button onClick={() => navigate('/admin/articles/create')}
              className="text-[10px] font-mono text-blue-300 border border-blue-800/60 hover:bg-blue-950/30 hover:border-blue-600 px-3 py-1 uppercase tracking-wider transition-colors">
              + New Article
            </button>
          </div>
        </div>
      </header>

      <main className="px-5 py-5 space-y-4">

        {error && (
          <div className="border border-red-800/60 bg-red-950/20 px-4 py-2.5 text-xs font-mono text-red-400 uppercase tracking-wider">
            {error}
          </div>
        )}

        {/* ── Summary Row ──────────────────────────────────────────────────── */}
        <section>
          <div className="grid grid-cols-8 gap-px bg-gray-800/30">
            <SumCard label="Total Articles" value={fmt(articles.length)}        border="border-l-blue-700"    accent="text-blue-300" />
            <SumCard label="Published"      value={fmt(articles.length)}        border="border-l-emerald-700" accent="text-emerald-400" />
            <SumCard label="Featured"       value={fmt(summary.featured)}       border="border-l-amber-700"   accent="text-amber-400" />
            <SumCard label="Total Views"    value={fmt(summary.totalViews)}     border="border-l-sky-700"     accent="text-sky-300"   loading={anaLoading} />
            <SumCard label="Total Clicks"   value={fmt(summary.totalClicks)}    border="border-l-emerald-700" accent="text-emerald-400" loading={anaLoading} />
            <SumCard label="Impressions"    value={fmt(summary.totalImpr)}      border="border-l-gray-600"    accent="text-gray-300"  loading={anaLoading} />
            <SumCard label="Best CTR"
              value={summary.bestCtr ? `${summary.bestCtr.gsc.ctr}%` : '—'}
              sub={summary.bestCtr?.title?.slice(0,22)}
              border="border-l-violet-700" accent="text-violet-400"             loading={anaLoading} />
            <SumCard label="Top Viewed"
              value={summary.topView ? fmt(summary.topView.ga.pageViews) : '—'}
              sub={summary.topView?.title?.slice(0,22)}
              border="border-l-sky-600"   accent="text-sky-300"                loading={anaLoading} />
          </div>
        </section>

        {/* ── Filter Bar ───────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search title, author, tag…"
            className="bg-[#0a0e14] border border-gray-700/60 text-sm text-gray-200 font-mono px-3 py-2 focus:outline-none focus:border-blue-700/60 placeholder-gray-600 w-64"
          />
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="bg-[#0a0e14] border border-gray-700/60 text-xs text-gray-300 font-mono px-3 py-2 focus:outline-none cursor-pointer">
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
            className={`text-[11px] font-mono uppercase tracking-wider border px-3 py-2 transition-colors ${
              filterFeat
                ? 'border-amber-700/60 text-amber-400 bg-amber-950/20'
                : 'border-gray-700/60 text-gray-500 hover:border-gray-600 hover:text-gray-300'
            }`}
          >
            ★ Featured Only
          </button>
          <span className="text-xs font-mono text-gray-500 ml-auto">
            {filtered.length} / {articles.length}
          </span>
          {anaLoading && (
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-mono text-blue-600 uppercase tracking-widest">Loading analytics…</span>
            </div>
          )}
        </div>

        {/* ── LIST VIEW ────────────────────────────────────────────────────── */}
        {viewMode === 'list' ? (
          <div className="border border-gray-800/60">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead className="sticky top-11 z-10">
                  <tr className="bg-[#0d1420] border-b border-gray-700/60">
                    {[
                      { label: 'Article',     w: '' },
                      { label: 'Author / Date', w: 'w-32' },
                      { label: 'Tags',          w: 'w-36' },
                      { label: 'Views',         w: 'w-20' },
                      { label: 'Clicks',        w: 'w-20' },
                      { label: 'Impressions',   w: 'w-24' },
                      { label: 'CTR',           w: 'w-16' },
                      { label: 'Position',      w: 'w-20' },
                      { label: 'Status',        w: 'w-20' },
                      { label: 'Actions',       w: 'w-32' },
                    ].map(h => (
                      <th key={h.label} className={`px-4 py-2.5 text-[10px] font-mono text-gray-400 uppercase tracking-widest text-left font-semibold ${h.w}`}>
                        {h.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {artLoading
                    ? Array(8).fill(0).map((_, i) => <SkeletonRow key={i} idx={i} />)
                    : filtered.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="px-4 py-14 text-center text-xs font-mono text-gray-600 uppercase tracking-widest">
                          No articles match filters
                        </td>
                      </tr>
                    ) : filtered.map((article, idx) => {
                      const { ga, gsc } = article;
                      return (
                        <tr key={article.id}
                          className={`border-b border-gray-800/40 transition-colors group ${
                            idx % 2 === 0 ? 'bg-[#0a0e14]' : 'bg-black'
                          } hover:bg-[#111827]`}
                        >

                          {/* Article */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              {article.image_url
                                ? <img src={article.image_url} alt="" className="w-14 h-10 object-cover flex-shrink-0 opacity-70 group-hover:opacity-90 transition-opacity" />
                                : <div className="w-14 h-10 bg-gray-800/60 flex-shrink-0" />
                              }
                              <button
                                onClick={() => window.open(`/article/${article.id}`, '_blank')}
                                className="text-[13px] font-semibold text-gray-100 hover:text-white text-left leading-snug line-clamp-2 transition-colors"
                              >
                                {article.title}
                              </button>
                            </div>
                          </td>

                          {/* Author / Date */}
                          <td className="px-4 py-3.5">
                            <div className="text-[11px] font-mono text-gray-400">{article.author}</div>
                            <div className="text-[10px] font-mono text-gray-600 mt-0.5">{fmtD(article.created_at)}</div>
                          </td>

                          {/* Tags */}
                          <td className="px-4 py-3.5">
                            <div className="flex flex-wrap gap-1">
                              {(article.tags || []).slice(0,2).map((t,i) => (
                                <span key={i} className="text-[9px] font-mono text-gray-500 border border-gray-700/50 px-1.5 py-px">{t}</span>
                              ))}
                              {(article.tags || []).length > 2 && (
                                <span className="text-[9px] font-mono text-gray-600">+{article.tags.length-2}</span>
                              )}
                            </div>
                          </td>

                          {/* Views */}
                          <td className="px-4 py-3.5 text-right">
                            <span className={`text-sm font-mono font-semibold ${anaLoading ? 'text-gray-700' : ga ? 'text-sky-300' : 'text-gray-700'}`}>
                              {anaLoading ? '—' : ga ? fmt(ga.pageViews) : '—'}
                            </span>
                          </td>

                          {/* Clicks */}
                          <td className="px-4 py-3.5 text-right">
                            <span className={`text-sm font-mono font-semibold ${anaLoading ? 'text-gray-700' : gsc ? 'text-emerald-400' : 'text-gray-700'}`}>
                              {anaLoading ? '—' : gsc ? fmt(gsc.clicks) : '—'}
                            </span>
                          </td>

                          {/* Impressions */}
                          <td className="px-4 py-3.5 text-right">
                            <span className={`text-sm font-mono font-semibold ${anaLoading ? 'text-gray-700' : gsc ? 'text-gray-300' : 'text-gray-700'}`}>
                              {anaLoading ? '—' : gsc ? fmt(gsc.impressions) : '—'}
                            </span>
                          </td>

                          {/* CTR */}
                          <td className="px-4 py-3.5 text-right">
                            <span className={`text-sm font-mono font-semibold ${anaLoading ? 'text-gray-700' : !gsc ? 'text-gray-700' : ctrColor(gsc.ctr)}`}>
                              {anaLoading ? '—' : gsc ? `${gsc.ctr}%` : '—'}
                            </span>
                          </td>

                          {/* Position */}
                          <td className="px-4 py-3.5 text-right">
                            <span className={`text-sm font-mono font-semibold ${anaLoading ? 'text-gray-700' : !gsc ? 'text-gray-700' : posColor(gsc.position)}`}>
                              {anaLoading ? '—' : gsc ? `#${gsc.position}` : '—'}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3.5">
                            {article.is_featured
                              ? <span className="text-[9px] font-mono font-bold text-amber-400 border border-amber-800/60 px-2 py-1">FEATURED</span>
                              : <span className="text-[9px] font-mono text-gray-500 border border-gray-700/40 px-2 py-1">PUBLISHED</span>
                            }
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleFeature(article.id, article.is_featured)}
                                disabled={featuring === article.id}
                                title={article.is_featured ? 'Remove featured' : 'Set featured'}
                                className={`text-sm px-2 py-1.5 border transition-colors disabled:opacity-40 ${
                                  article.is_featured
                                    ? 'border-amber-700/60 text-amber-400 hover:bg-amber-950/30'
                                    : 'border-gray-700/50 text-gray-600 hover:border-amber-800/60 hover:text-amber-500'
                                }`}
                              >
                                ★
                              </button>
                              <button
                                onClick={() => navigate(`/admin/articles/edit/${article.id}`)}
                                className="text-[10px] font-mono px-2.5 py-1.5 border border-gray-700/50 text-gray-400 hover:border-blue-700/60 hover:text-blue-300 transition-colors uppercase tracking-wide"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(article.id)}
                                disabled={deleting === article.id}
                                className="text-[10px] font-mono px-2.5 py-1.5 border border-gray-700/50 text-gray-500 hover:border-red-800/60 hover:text-red-400 transition-colors disabled:opacity-40 uppercase tracking-wide"
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
          /* ── GRID VIEW ───────────────────────────────────────────────────── */
          <div className="grid grid-cols-3 gap-3 xl:grid-cols-4">
            {filtered.map(article => {
              const { ga, gsc } = article;
              return (
                <div
                  key={article.id}
                  className={`bg-[#0a0e14] border flex flex-col transition-colors ${
                    article.is_featured ? 'border-amber-800/50' : 'border-gray-800/60 hover:border-gray-700/80'
                  }`}
                >
                  {/* Image */}
                  <div className="relative">
                    {article.image_url
                      ? <img src={article.image_url} alt={article.title}
                          className="w-full h-28 object-cover opacity-80" />
                      : <div className="w-full h-28 bg-gradient-to-br from-blue-950 to-gray-900" />
                    }
                    {article.is_featured && (
                      <span className="absolute top-1.5 right-1.5 text-[9px] font-mono font-bold text-amber-400 bg-black/80 border border-amber-800/60 px-1.5 py-px">
                        ★ FEATURED
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="px-3.5 py-3 flex-1">
                    <button
                      onClick={() => window.open(`/article/${article.id}`, '_blank')}
                      className="text-[13px] font-semibold text-gray-100 hover:text-white text-left leading-snug line-clamp-2 mb-1.5 transition-colors w-full"
                    >
                      {article.title}
                    </button>
                    <div className="text-[10px] font-mono text-gray-500 mb-2.5">
                      {article.author} · {fmtD(article.created_at)}
                    </div>

                    {/* Analytics chips */}
                    <div className="flex gap-3 border-t border-gray-800/50 pt-2.5">
                      <Chip label="Views"  value={ga  ? fmt(ga.pageViews)   : '—'} color="text-sky-300"   loading={anaLoading} />
                      <Chip label="Clicks" value={gsc ? fmt(gsc.clicks)     : '—'} color="text-emerald-400" loading={anaLoading} />
                      <Chip label="CTR"    value={gsc ? `${gsc.ctr}%`       : '—'} color={gsc?.ctr ? ctrColor(gsc.ctr) : 'text-gray-500'} loading={anaLoading} />
                      <Chip label="Pos"    value={gsc ? `#${gsc.position}`  : '—'} color={gsc?.position ? posColor(gsc.position) : 'text-gray-500'} loading={anaLoading} />
                    </div>

                    {/* Tags */}
                    {(article.tags||[]).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2.5">
                        {article.tags.slice(0,3).map((t,i) => (
                          <span key={i} className="text-[9px] font-mono text-gray-500 border border-gray-700/50 px-1.5 py-px">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex border-t border-gray-800/50">
                    <button
                      onClick={() => handleFeature(article.id, article.is_featured)}
                      disabled={featuring === article.id}
                      className={`flex-1 py-2.5 text-sm transition-colors border-r border-gray-800/50 ${
                        article.is_featured ? 'text-amber-400 hover:bg-amber-950/20' : 'text-gray-600 hover:text-amber-500 hover:bg-amber-950/10'
                      } disabled:opacity-40`}
                    >★</button>
                    <button
                      onClick={() => navigate(`/admin/articles/edit/${article.id}`)}
                      className="flex-1 py-2.5 text-[10px] font-mono text-gray-500 hover:text-blue-300 hover:bg-blue-950/10 uppercase tracking-wide transition-colors border-r border-gray-800/50"
                    >Edit</button>
                    <button
                      onClick={() => handleDelete(article.id)}
                      disabled={deleting === article.id}
                      className="flex-1 py-2.5 text-[10px] font-mono text-gray-600 hover:text-red-400 hover:bg-red-950/10 uppercase tracking-wide transition-colors disabled:opacity-40"
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
