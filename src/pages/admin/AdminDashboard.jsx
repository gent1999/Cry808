import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

// ── Tiny reusables ────────────────────────────────────────────────────────────

const Dot = ({ color = 'bg-green-500', pulse }) => (
  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 inline-block ${color} ${pulse ? 'animate-pulse' : ''}`} />
);

const SectionLabel = ({ children, badge }) => (
  <div className="flex items-center gap-2 mb-2">
    <div className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">{children}</div>
    {badge && <span className="text-[9px] font-mono text-green-600 border border-green-900 px-1.5 py-px uppercase tracking-wider">{badge}</span>}
  </div>
);

const StatCard = ({ label, value, sub, accent = 'text-white', border = 'border-l-gray-700', trend }) => (
  <div className={`bg-gray-950 border border-gray-800 border-l-2 ${border} px-3 py-2.5`}>
    <div className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mb-1.5">{label}</div>
    <div className={`text-xl font-bold font-mono ${accent}`}>{value ?? '—'}</div>
    {trend !== undefined && (
      <div className={`text-[10px] font-mono mt-0.5 ${trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-gray-600'}`}>
        {trend > 0 ? '▲' : trend < 0 ? '▼' : '—'} {Math.abs(trend)}% vs last month
      </div>
    )}
    {sub && !trend && <div className="text-[10px] font-mono text-gray-700 mt-0.5">{sub}</div>}
  </div>
);

const fmt = n => `$${(+n || 0).toFixed(2)}`;

// ── Main Component ────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [admin,       setAdmin]       = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [showDelete,  setShowDelete]  = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [stats,    setStats]    = useState({ total: 0, published: 0, drafts: 0, submissions: 0 });
  const [finance,  setFinance]  = useState(null);
  const [adConfig, setAdConfig] = useState(null);

  const [analytics, setAnalytics] = useState({
    current: 0, previous: 0, allTime: 0, average: 0, change: 0, realtime: 0,
    loading: true, error: null,
  });

  const [seo, setSeo] = useState({
    performance: { clicks: 0, impressions: 0, ctr: 0, position: 0 },
    topQueries: [], topPages: [],
    loading: true, error: null,
  });

  const token = () => localStorage.getItem('adminToken');
  const hdrs  = () => ({ Authorization: `Bearer ${token()}` });

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    navigate('/admin/login');
  };

  // ── Data fetching ────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const tok     = token();
      const adminInfo = localStorage.getItem('adminInfo');
      if (!tok || !adminInfo) { navigate('/admin/login'); return; }

      try {
        const r = await fetch(`${API_URL}/api/admin/dashboard`, { headers: hdrs() });
        if (!r.ok) throw new Error('Session expired');
        setAdmin(JSON.parse(adminInfo));
      } catch {
        handleLogout(); return;
      } finally { setLoading(false); }

      // Content stats
      Promise.all([
        fetch(`${API_URL}/api/articles`),
        fetch(`${API_URL}/api/submissions`),
      ]).then(async ([aRes, sRes]) => {
        const art  = aRes.ok  ? await aRes.json()  : {};
        const sub  = sRes.ok  ? await sRes.json()  : {};
        setStats({ total: art.count ?? 0, published: art.count ?? 0, drafts: 0, submissions: sub.count ?? 0 });
      }).catch(() => {});

      // Analytics
      fetch(`${API_URL}/api/analytics/visitors?site=cry808`, { headers: hdrs() })
        .then(async r => {
          if (!r.ok) { const d = await r.json(); setAnalytics(p => ({ ...p, loading: false, error: d.message || 'Not configured' })); return; }
          const d = await r.json();
          setAnalytics({ ...d.visitors, loading: false, error: null });
        }).catch(() => setAnalytics(p => ({ ...p, loading: false, error: 'Failed to load' })));

      // Search Console
      Promise.all([
        fetch(`${API_URL}/api/search-console/performance`, { headers: hdrs() }),
        fetch(`${API_URL}/api/search-console/top-queries`,  { headers: hdrs() }),
        fetch(`${API_URL}/api/search-console/top-pages`,    { headers: hdrs() }),
      ]).then(async ([pRes, qRes, pgRes]) => {
        const perf = pRes.ok  ? (await pRes.json()).performance  : null;
        const qs   = qRes.ok  ? (await qRes.json()).queries || [] : [];
        const pgs  = pgRes.ok ? (await pgRes.json()).pages   || [] : [];
        setSeo({ performance: perf || { clicks:0, impressions:0, ctr:0, position:0 }, topQueries: qs, topPages: pgs, loading: false, error: perf ? null : 'Not configured' });
      }).catch(() => setSeo(p => ({ ...p, loading: false, error: 'Failed to load' })));

      // Finance summary — optional, fail silently
      fetch(`${API_URL}/api/finance/summary`, { headers: hdrs() })
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d) setFinance(d); })
        .catch(() => {});

      // Ad settings — optional
      fetch(`${API_URL}/api/admin/settings`, { headers: hdrs() })
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d?.settings) setAdConfig(d.settings); })
        .catch(() => {});
    };

    init();
  }, [navigate]);

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      const r = await fetch(`${API_URL}/api/auth/delete-account`, { method: 'DELETE', headers: hdrs() });
      if (!r.ok) throw new Error();
      handleLogout();
    } catch {
      setError('Failed to delete account');
      setDeleteLoading(false);
      setShowDelete(false);
    }
  };

  // ── Loading / Error screens ───────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="flex items-center gap-3">
        <Dot color="bg-green-500" pulse />
        <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">Connecting to CRY808 systems...</span>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-xs font-mono text-red-400 uppercase">{error}</div>
    </div>
  );

  // ── Derived values ────────────────────────────────────────────────────────────
  const trafficStatus = () => {
    if (analytics.loading || analytics.error) return null;
    const ch = analytics.change;
    if (ch >= 25)  return { label: 'SPIKE',   color: 'text-green-300 border-green-700' };
    if (ch >= 5)   return { label: 'GROWING', color: 'text-green-500 border-green-800' };
    if (ch >= -10) return { label: 'NORMAL',  color: 'text-blue-400 border-blue-800' };
    return              { label: 'LOW',     color: 'text-yellow-400 border-yellow-800' };
  };
  const traffic = trafficStatus();

  const adStatus = (key) => adConfig?.[key] === 'true' || adConfig?.[key] === true;
  const adPlacements = adConfig ? Object.entries(adConfig).filter(([k,v]) => k.endsWith('_enabled') && !k.includes('order') && (v === 'true' || v === true)).length : 0;

  const alerts = [];
  if (!analytics.loading && !analytics.error && analytics.change < -15)
    alerts.push({ level: 'yellow', text: `Traffic down ${Math.abs(analytics.change)}% vs last month` });
  if (stats.submissions > 0)
    alerts.push({ level: 'purple', text: `${stats.submissions} pending artist submission${stats.submissions > 1 ? 's' : ''}` });
  if (finance?.upcomingRenewals?.some(r => r.daysUntil <= 14))
    alerts.push({ level: 'red', text: `Domain renewal in ${finance.upcomingRenewals[0].daysUntil}d — ${finance.upcomingRenewals[0].name}` });
  if (finance?.payoutProgressBySource?.some(p => p.ready))
    alerts.push({ level: 'green', text: 'Payout ready — open Finance Hub' });
  if (!adStatus('hilltop_enabled') && !adStatus('adsterra_enabled'))
    alerts.push({ level: 'yellow', text: 'All ad networks disabled' });

  const alertColors = {
    green:  'border-green-900/60 bg-green-950/20 text-green-400',
    yellow: 'border-yellow-900/60 bg-yellow-950/20 text-yellow-400',
    red:    'border-red-900/60 bg-red-950/20 text-red-400',
    purple: 'border-purple-900/60 bg-purple-950/20 text-purple-400',
  };

  return (
    <div className="min-h-screen bg-black text-white">

      {/* ── TOP COMMAND BAR ─────────────────────────────────────────────────── */}
      <header className="bg-black border-b border-gray-900 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between">
          {/* Identity */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Dot color="bg-green-500" pulse />
              <span className="text-xs font-mono font-bold text-white tracking-widest uppercase">CRY808</span>
              <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest hidden sm:block">Command Center</span>
            </div>
            <div className="w-px h-4 bg-gray-800" />
            <span className="text-[10px] font-mono text-green-600 uppercase tracking-wider hidden sm:block">ONLINE</span>
          </div>

          {/* Center — live viewers */}
          {analytics.realtime > 0 && (
            <div className="flex items-center gap-1.5 absolute left-1/2 -translate-x-1/2">
              <Dot color="bg-green-400" pulse />
              <span className="text-xs font-mono text-green-400">{analytics.realtime} live</span>
            </div>
          )}

          {/* Right — user + actions */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-gray-600 hidden md:block">
              {admin?.username}
            </span>
            <div className="w-px h-4 bg-gray-800 hidden md:block" />
            <button
              onClick={() => navigate('/')}
              className="text-[10px] font-mono text-gray-500 hover:text-white uppercase tracking-wider transition-colors px-2 py-1 border border-gray-800 hover:border-gray-600"
            >
              View Site
            </button>
            <button
              onClick={handleLogout}
              className="text-[10px] font-mono text-red-600 hover:text-red-400 uppercase tracking-wider transition-colors px-2 py-1 border border-red-900 hover:border-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-5 space-y-5">

        {/* ── ALERT STRIP ─────────────────────────────────────────────────── */}
        {alerts.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {alerts.map((a, i) => (
              <div key={i} className={`flex items-center gap-1.5 border px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider ${alertColors[a.level]}`}>
                <span className={`w-1 h-1 rounded-full inline-block flex-shrink-0 ${a.level === 'green' ? 'bg-green-400' : a.level === 'red' ? 'bg-red-400' : a.level === 'purple' ? 'bg-purple-400' : 'bg-yellow-400'}`} />
                {a.text}
              </div>
            ))}
          </div>
        )}

        {/* ── SYSTEM OVERVIEW ROW ─────────────────────────────────────────── */}
        <section>
          <SectionLabel badge="LIVE">System Overview</SectionLabel>
          <div className="grid grid-cols-4 gap-px bg-gray-800 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Articles"  value={stats.total.toLocaleString()}        border="border-l-blue-800" />
            <StatCard label="Published"       value={stats.published.toLocaleString()}    border="border-l-green-800" accent="text-green-400" />
            <StatCard label="Drafts"          value={stats.drafts}                         border="border-l-gray-700" />
            <StatCard label="Submissions"     value={stats.submissions}                    border="border-l-purple-800" accent="text-purple-400"
              sub={stats.submissions > 0 ? 'Pending review' : 'Queue clear'} />
          </div>
          <div className="grid grid-cols-4 gap-px bg-gray-800 mt-px sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Live Visitors"  value={analytics.realtime > 0 ? analytics.realtime : '—'}    border="border-l-green-600" accent="text-green-400" />
            <StatCard label="This Month"     value={analytics.loading ? '…' : analytics.current.toLocaleString()}  border="border-l-blue-700" trend={analytics.change} />
            <StatCard label="All Time"       value={analytics.loading ? '…' : analytics.allTime.toLocaleString()}  border="border-l-gray-600" />
            <StatCard label="Avg Monthly"    value={analytics.loading ? '…' : analytics.average.toLocaleString()}  border="border-l-gray-600" />
          </div>
        </section>

        {/* ── TWO-COLUMN: ANALYTICS + SEARCH CONSOLE ──────────────────────── */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-2 sm:grid-cols-1">

          {/* Analytics Control Panel */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <SectionLabel>Analytics</SectionLabel>
              <div className="flex items-center gap-2">
                {traffic && (
                  <span className={`text-[9px] font-mono font-bold border px-1.5 py-px uppercase tracking-wider ${traffic.color}`}>
                    {traffic.label}
                  </span>
                )}
                {analytics.realtime > 0 && (
                  <div className="flex items-center gap-1 text-[10px] font-mono text-green-400">
                    <Dot color="bg-green-400" pulse />
                    {analytics.realtime} online
                  </div>
                )}
              </div>
            </div>
            {analytics.loading ? (
              <div className="bg-gray-950 border border-gray-800 px-4 py-6 text-[10px] font-mono text-gray-700 uppercase tracking-widest">Loading signals...</div>
            ) : analytics.error ? (
              <div className="bg-gray-950 border border-gray-800 px-4 py-6 text-[10px] font-mono text-yellow-700 uppercase tracking-widest">{analytics.error}</div>
            ) : (
              <div className="grid grid-cols-2 gap-px bg-gray-800">
                <div className={`bg-gray-950 border border-gray-800 border-l-2 ${analytics.change > 0 ? 'border-l-green-700' : analytics.change < 0 ? 'border-l-red-700' : 'border-l-gray-700'} px-3 py-2.5`}>
                  <div className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mb-1.5">This Month</div>
                  <div className={`text-xl font-bold font-mono ${analytics.change > 0 ? 'text-green-400' : analytics.change < 0 ? 'text-red-400' : 'text-white'}`}>
                    {analytics.current.toLocaleString()}
                  </div>
                  {analytics.change !== 0 && (
                    <div className={`text-[10px] font-mono mt-0.5 ${analytics.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {analytics.change > 0 ? '▲' : '▼'} {Math.abs(analytics.change)}% vs prior month
                    </div>
                  )}
                </div>
                <StatCard label="Last Month"  value={analytics.previous.toLocaleString()} border="border-l-gray-700" />
                <StatCard label="All Time"    value={analytics.allTime.toLocaleString()}   border="border-l-gray-700" />
                <StatCard label="Avg Monthly" value={analytics.average.toLocaleString()}   border="border-l-gray-700" />
              </div>
            )}
          </section>

          {/* Search Console Intelligence */}
          <section>
            <SectionLabel badge={seo.loading ? '' : seo.error ? '' : 'ACTIVE'}>
              Search Console <span className="text-gray-700 normal-case tracking-normal font-sans font-normal text-[9px] ml-1">(28d)</span>
            </SectionLabel>
            {seo.loading ? (
              <div className="bg-gray-950 border border-gray-800 px-4 py-6 text-[10px] font-mono text-gray-700 uppercase tracking-widest">Fetching signals...</div>
            ) : seo.error ? (
              <div className="bg-gray-950 border border-gray-800 px-4 py-6 text-[10px] font-mono text-yellow-700 uppercase tracking-widest">{seo.error}</div>
            ) : (
              <div className="space-y-px bg-gray-800">
                <div className="grid grid-cols-4 gap-px bg-gray-800">
                  {[
                    ['Clicks',     seo.performance.clicks.toLocaleString(),     'border-l-blue-700', 'text-blue-400'],
                    ['Impressions',seo.performance.impressions.toLocaleString(),'border-l-gray-700', 'text-white'],
                    ['CTR',        `${seo.performance.ctr}%`,                   'border-l-green-800','text-green-400'],
                    ['Avg Pos',    seo.performance.position,                    'border-l-gray-700', 'text-white'],
                  ].map(([l,v,b,a]) => (
                    <StatCard key={l} label={l} value={v} border={b} accent={a} />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-px bg-gray-800">
                  {/* Keywords */}
                  <div className="bg-gray-950 border border-gray-800">
                    <div className="px-3 py-1.5 border-b border-gray-800 text-[9px] font-mono text-gray-600 uppercase tracking-widest">Top Keywords</div>
                    {seo.topQueries.length > 0 ? (
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-800">
                            {['Query','Clicks','CTR','Pos'].map(h => (
                              <th key={h} className="px-3 py-1 text-[9px] font-mono text-gray-700 uppercase tracking-wider text-left last:text-right [&:not(:first-child)]:text-right font-normal">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {seo.topQueries.slice(0, 5).map((q, i) => (
                            <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-900/40">
                              <td className="px-3 py-1.5 text-[10px] font-mono text-gray-300 truncate max-w-[100px]">{q.query}</td>
                              <td className="px-3 py-1.5 text-[10px] font-mono text-blue-400 text-right">{q.clicks}</td>
                              <td className="px-3 py-1.5 text-[10px] font-mono text-green-500 text-right">{q.ctr}%</td>
                              <td className="px-3 py-1.5 text-[10px] font-mono text-gray-500 text-right">{q.position}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : <div className="px-3 py-4 text-[10px] font-mono text-gray-700 uppercase text-center">No data</div>}
                  </div>
                  {/* Pages */}
                  <div className="bg-gray-950 border border-gray-800">
                    <div className="px-3 py-1.5 border-b border-gray-800 text-[9px] font-mono text-gray-600 uppercase tracking-widest">Top Pages</div>
                    {seo.topPages.length > 0 ? (
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-800">
                            {['Page','Clicks','Impr','CTR'].map(h => (
                              <th key={h} className="px-3 py-1 text-[9px] font-mono text-gray-700 uppercase tracking-wider text-left last:text-right [&:not(:first-child)]:text-right font-normal">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {seo.topPages.slice(0, 5).map((p, i) => (
                            <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-900/40">
                              <td className="px-3 py-1.5 text-[10px] font-mono text-gray-500 truncate max-w-[100px]">{p.page.replace(/^https?:\/\/[^/]+/, '') || '/'}</td>
                              <td className="px-3 py-1.5 text-[10px] font-mono text-blue-400 text-right">{p.clicks}</td>
                              <td className="px-3 py-1.5 text-[10px] font-mono text-gray-600 text-right">{p.impressions}</td>
                              <td className="px-3 py-1.5 text-[10px] font-mono text-green-600 text-right">{p.ctr}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : <div className="px-3 py-4 text-[10px] font-mono text-gray-700 uppercase text-center">No data</div>}
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* ── THREE-COLUMN: CONTENT OPS + CONFIG OPS + FINANCE SNAPSHOT ─── */}
        <div className="grid grid-cols-3 gap-4 lg:grid-cols-3 sm:grid-cols-1">

          {/* Content Operations */}
          <section>
            <SectionLabel>Content Operations</SectionLabel>
            <div className="space-y-px">
              {[
                {
                  label: '+ New Article',
                  desc: 'Manual publishing console',
                  path: '/admin/articles/create',
                  border: 'border-l-blue-700',
                  accent: 'text-blue-400',
                  badge: null,
                },
                {
                  label: 'All Articles',
                  desc: `${stats.total} content records`,
                  path: '/admin/articles',
                  border: 'border-l-gray-600',
                  accent: 'text-white',
                  badge: null,
                },
                {
                  label: 'Submissions',
                  desc: stats.submissions > 0 ? `${stats.submissions} pending` : 'Queue clear',
                  path: '/admin/submissions',
                  border: 'border-l-purple-700',
                  accent: 'text-purple-400',
                  badge: stats.submissions > 0 ? `${stats.submissions}` : null,
                },
              ].map(m => (
                <button
                  key={m.path}
                  onClick={() => navigate(m.path)}
                  className={`w-full bg-gray-950 border border-gray-800 border-l-2 ${m.border} px-4 py-3 text-left hover:bg-gray-900 transition-colors group`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-xs font-mono font-bold ${m.accent}`}>{m.label}</span>
                    {m.badge && (
                      <span className="text-[9px] font-mono font-bold text-purple-400 border border-purple-800 px-1.5 py-px">{m.badge}</span>
                    )}
                  </div>
                  <div className="text-[10px] font-mono text-gray-600">{m.desc}</div>
                </button>
              ))}
            </div>
          </section>

          {/* Business Config Operations */}
          <section>
            <SectionLabel>Config Modules</SectionLabel>
            <div className="space-y-px">
              {[
                { label: 'Finance Hub',     desc: 'Revenue, payouts, expenses',   path: '/admin/finance',          border: 'border-l-green-700', accent: 'text-green-400' },
                { label: 'Ad Settings',     desc: 'Ad network placement control', path: '/admin/settings',         border: 'border-l-yellow-700', accent: 'text-yellow-400' },
                { label: 'Spotify Manager', desc: 'Music data & source tools',    path: '/admin/spotify',          border: 'border-l-green-800', accent: 'text-green-500' },
                { label: 'Amazon Products', desc: 'Affiliate product placement',  path: '/admin/amazon-products',  border: 'border-l-orange-800', accent: 'text-orange-400' },
              ].map(m => (
                <button
                  key={m.path}
                  onClick={() => navigate(m.path)}
                  className={`w-full bg-gray-950 border border-gray-800 border-l-2 ${m.border} px-4 py-3 text-left hover:bg-gray-900 transition-colors`}
                >
                  <div className={`text-xs font-mono font-bold ${m.accent} mb-0.5`}>{m.label}</div>
                  <div className="text-[10px] font-mono text-gray-600">{m.desc}</div>
                </button>
              ))}
            </div>
          </section>

          {/* Revenue Snapshot */}
          <section>
            <SectionLabel>Revenue Snapshot</SectionLabel>
            <div className="bg-gray-950 border border-gray-800">
              {finance ? (
                <>
                  <div className="grid grid-cols-2 gap-px bg-gray-800">
                    <div className="bg-gray-950 px-3 py-2.5">
                      <div className="text-[9px] font-mono text-gray-600 uppercase tracking-widest mb-1">Net Revenue</div>
                      <div className="text-base font-bold font-mono text-green-400">{fmt(finance.totalNetRevenue)}</div>
                    </div>
                    <div className="bg-gray-950 px-3 py-2.5">
                      <div className="text-[9px] font-mono text-gray-600 uppercase tracking-widest mb-1">Pending</div>
                      <div className="text-base font-bold font-mono text-yellow-400">{fmt(finance.pendingRevenue)}</div>
                    </div>
                    <div className="bg-gray-950 px-3 py-2.5">
                      <div className="text-[9px] font-mono text-gray-600 uppercase tracking-widest mb-1">Expenses</div>
                      <div className="text-base font-bold font-mono text-red-400">{fmt(finance.totalExpenses)}</div>
                    </div>
                    <div className="bg-gray-950 px-3 py-2.5">
                      <div className="text-[9px] font-mono text-gray-600 uppercase tracking-widest mb-1">Profit</div>
                      <div className={`text-base font-bold font-mono ${+finance.lifetimeProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>{fmt(finance.lifetimeProfit)}</div>
                    </div>
                  </div>
                  {finance.payoutProgressBySource?.some(p => p.ready) && (
                    <div className="px-3 py-2 border-t border-gray-800 flex items-center gap-1.5">
                      <Dot color="bg-green-500" pulse />
                      <span className="text-[10px] font-mono text-green-500 uppercase tracking-wider">Payout ready</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="px-4 py-4 text-[10px] font-mono text-gray-700 uppercase tracking-widest">No finance data</div>
              )}
              <button
                onClick={() => navigate('/admin/finance')}
                className="w-full px-4 py-2.5 bg-green-950/30 border-t border-green-900/40 text-[10px] font-mono text-green-500 hover:bg-green-950/60 transition-colors uppercase tracking-widest text-left"
              >
                Open Revenue Command →
              </button>
            </div>
          </section>
        </div>

        {/* ── AD NETWORK + RECENT OPS ─────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-1">

          {/* Ad Network Status */}
          <section>
            <SectionLabel>Ad Network Status</SectionLabel>
            <div className="bg-gray-950 border border-gray-800">
              <div className="divide-y divide-gray-800/60">
                {[
                  { name: 'Adsterra',      key: 'adsterra_enabled',  desc: 'Display / Social Bar' },
                  { name: 'Hilltop Ads',   key: 'hilltop_enabled',   desc: 'Article sidebar' },
                  { name: 'Beatport',      key: 'beatport_banner_enabled', desc: 'Affiliate banners' },
                  { name: 'Monetag',       key: 'monetag_enabled',   desc: 'Pop/push network' },
                ].map(ad => {
                  const active = adConfig ? adStatus(ad.key) : null;
                  return (
                    <div key={ad.name} className="px-4 py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Dot color={active === true ? 'bg-green-500' : active === false ? 'bg-gray-700' : 'bg-gray-800'} />
                        <div>
                          <div className="text-xs font-mono text-white">{ad.name}</div>
                          <div className="text-[10px] font-mono text-gray-600">{ad.desc}</div>
                        </div>
                      </div>
                      <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 border ${
                        active === true  ? 'text-green-400 border-green-900 bg-green-950/20' :
                        active === false ? 'text-gray-600 border-gray-800' :
                        'text-gray-700 border-gray-800'
                      }`}>
                        {active === null ? '—' : active ? 'ACTIVE' : 'OFF'}
                      </span>
                    </div>
                  );
                })}
              </div>
              {adConfig && (
                <div className="px-4 py-2 border-t border-gray-800 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-gray-600">{adPlacements} active placement{adPlacements !== 1 ? 's' : ''}</span>
                  <button
                    onClick={() => navigate('/admin/settings')}
                    className="text-[10px] font-mono text-yellow-600 hover:text-yellow-400 uppercase tracking-wider transition-colors"
                  >
                    Open Ad Control →
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Recent Operations Feed */}
          <section>
            <SectionLabel>Recent Operations</SectionLabel>
            <div className="bg-gray-950 border border-gray-800">
              <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Dot color="bg-gray-700" />
                  <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">Activity log</span>
                </div>
                <span className="text-[9px] font-mono text-gray-700 uppercase tracking-wider border border-gray-800 px-1.5 py-px">Frontend Only</span>
              </div>
              <div className="px-4 py-6 text-center">
                <div className="text-[10px] font-mono text-gray-700 uppercase tracking-widest mb-1">No operations logged</div>
                <div className="text-[9px] font-mono text-gray-800">Activity database not yet implemented</div>
              </div>
              <div className="px-4 py-2 border-t border-gray-800">
                <button
                  onClick={() => navigate('/admin/finance')}
                  className="text-[10px] font-mono text-gray-600 hover:text-gray-400 uppercase tracking-wider transition-colors"
                >
                  View Finance Activity →
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* ── DANGER ZONE ─────────────────────────────────────────────────── */}
        <section>
          <div className="bg-gray-950 border border-red-950">
            <div className="px-4 py-2 border-b border-red-950 flex items-center gap-2">
              <span className="w-1 h-4 bg-red-800 inline-block" />
              <span className="text-[10px] font-mono text-red-800 uppercase tracking-widest">Danger Zone</span>
            </div>
            <div className="px-4 py-3 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-mono text-gray-600 uppercase tracking-wider">Delete Admin Account</div>
                <div className="text-[9px] font-mono text-gray-700 mt-0.5">Permanently removes account. Cannot be undone.</div>
              </div>
              <button
                onClick={() => setShowDelete(true)}
                className="text-[10px] font-mono text-red-700 hover:text-red-500 uppercase tracking-wider border border-red-900 hover:border-red-700 px-3 py-1.5 transition-colors ml-6 flex-shrink-0"
              >
                Delete Account
              </button>
            </div>
          </div>
        </section>

      </main>

      {/* ── DELETE MODAL ─────────────────────────────────────────────────── */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-950 border border-red-900 max-w-sm w-full">
            <div className="px-5 py-3 border-b border-red-900">
              <div className="text-[10px] font-mono text-red-600 uppercase tracking-widest">Confirm Deletion</div>
            </div>
            <div className="px-5 py-4">
              <p className="text-xs font-mono text-gray-400 mb-1">Delete admin account permanently?</p>
              <p className="text-[10px] font-mono text-gray-700">This will allow new admin registration. Cannot be undone.</p>
            </div>
            <div className="px-5 py-3 border-t border-gray-800 flex gap-2">
              <button
                onClick={() => setShowDelete(false)}
                disabled={deleteLoading}
                className="flex-1 py-2 text-xs font-mono text-gray-400 border border-gray-700 hover:border-gray-500 transition-colors disabled:opacity-40 uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="flex-1 py-2 text-xs font-mono text-red-400 border border-red-800 hover:bg-red-950/40 transition-colors disabled:opacity-40 uppercase tracking-wider"
              >
                {deleteLoading ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
