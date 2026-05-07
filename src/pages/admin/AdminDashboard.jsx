import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

// ── SVG icon set ──────────────────────────────────────────────────────────────
const Icon = ({ d, children, size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none"
    stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    {d ? <path d={d} /> : children}
  </svg>
);

const ICONS = {
  newArticle: 'M8 1v14M1 8h14',
  articles:   'M2 3h12M2 7h12M2 11h8',
  inbox:      'M1 10h14v4a1 1 0 01-1 1H2a1 1 0 01-1-1v-4zm3-9h6l3 9H1L4 1z',
  finance:    'M8 1v14M5 4.5h4.5a1.5 1.5 0 010 3H6a1.5 1.5 0 000 3H11',
  ads:        'M8 3a5 5 0 100 10A5 5 0 008 3zm0 0V1m0 14v-2m5-5h2M1 8h2',
  spotify:    'M6 13V3l8 3-8 3',
  amazon:     'M2 4h12v8a1 1 0 01-1 1H3a1 1 0 01-1-1V4zm3-3h6',
  external:   'M10 2h4v4M14 2L8 8M5 2H2v12h12v-4',
  logout:     'M6 3H3v10h3M10 5l4 3-4 3M7 8h7',
  dashboard:  'M1 1h6v6H1zM9 1h6v6H9zM1 9h6v6H1zM9 9h6v6H9z',
  dollar:     'M8 2v12M5.5 5h4a1.5 1.5 0 110 3H6a1.5 1.5 0 100 3h4.5',
};

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ admin, stats, onLogout }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const path      = location.pathname;

  const isActive = (p) => path === p || (p !== '/admin/dashboard' && path.startsWith(p));

  const NavItem = ({ label, icon, to, count, accent = 'green' }) => {
    const active = isActive(to);
    const accents = {
      green:  { border: 'border-green-500',  text: 'text-green-400',  bg: 'bg-green-500/8' },
      blue:   { border: 'border-blue-500',   text: 'text-blue-400',   bg: 'bg-blue-500/8' },
      purple: { border: 'border-purple-500', text: 'text-purple-400', bg: 'bg-purple-500/8' },
      yellow: { border: 'border-yellow-500', text: 'text-yellow-400', bg: 'bg-yellow-500/8' },
      orange: { border: 'border-orange-500', text: 'text-orange-400', bg: 'bg-orange-500/8' },
    };
    const ac = accents[accent] || accents.green;
    return (
      <button
        onClick={() => navigate(to)}
        className={`
          w-full flex items-center gap-3 px-4 py-2 text-left transition-all duration-100
          border-l-2 group relative
          ${active
            ? `${ac.border} ${ac.bg} ${ac.text}`
            : 'border-transparent text-gray-600 hover:text-gray-300 hover:border-gray-700 hover:bg-white/[0.03]'
          }
        `}
      >
        <span className={`flex-shrink-0 ${active ? ac.text : 'text-gray-700 group-hover:text-gray-400'}`}>
          <Icon d={ICONS[icon]} size={13} />
        </span>
        <span className={`text-[11px] font-mono tracking-wide flex-1 ${active ? '' : ''}`}>{label}</span>
        {count != null && count > 0 && (
          <span className={`text-[9px] font-mono font-bold px-1.5 py-px border ${active ? `${ac.text} border-current` : 'text-gray-700 border-gray-800'}`}>
            {count}
          </span>
        )}
      </button>
    );
  };

  const GroupLabel = ({ children }) => (
    <div className="px-4 pt-4 pb-1">
      <div className="text-[9px] font-mono text-gray-700 uppercase tracking-[.18em]">{children}</div>
    </div>
  );

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-52 bg-[#080b10] border-r border-gray-900 flex flex-col z-30 select-none">

      {/* Brand */}
      <div className="px-4 py-4 border-b border-gray-900">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]" />
          <span className="text-xs font-mono font-bold text-white tracking-widest">CRY808</span>
        </div>
        <div className="text-[9px] font-mono text-gray-700 uppercase tracking-[.2em] pl-3.5">Command Center</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 scrollbar-none">

        <GroupLabel>Content</GroupLabel>
        <NavItem label="New Article"  icon="newArticle" to="/admin/articles/create" accent="blue" />
        <NavItem label="All Articles" icon="articles"   to="/admin/articles"        count={stats.total} />
        <NavItem label="Submissions"  icon="inbox"      to="/admin/submissions"     count={stats.submissions} accent="purple" />

        <GroupLabel>Business &amp; Config</GroupLabel>
        <NavItem label="Finance Hub"     icon="finance"  to="/admin/finance"          accent="green" />
        <NavItem label="Ad Settings"     icon="ads"      to="/admin/settings"         accent="yellow" />
        <NavItem label="Spotify Manager" icon="spotify"  to="/admin/spotify"          accent="green" />
        <NavItem label="Amazon Products" icon="amazon"   to="/admin/amazon-products"  accent="orange" />

        <GroupLabel>AI Systems</GroupLabel>
        <div className="px-4 py-2">
          <div className="text-[10px] font-mono text-gray-800 uppercase tracking-wider">Scout Agent</div>
          <div className="text-[9px] font-mono text-gray-900 mt-0.5">808-engine only</div>
        </div>

      </nav>

      {/* Footer */}
      <div className="border-t border-gray-900 p-3 space-y-1">
        {admin && (
          <div className="px-1 mb-2">
            <div className="text-[10px] font-mono text-gray-500">{admin.username}</div>
            <div className="text-[9px] font-mono text-gray-700 truncate">{admin.email}</div>
          </div>
        )}
        <button
          onClick={() => window.open('/', '_blank')}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 text-gray-700 hover:text-gray-400 transition-colors"
        >
          <Icon d={ICONS.external} size={11} />
          <span className="text-[10px] font-mono uppercase tracking-wider">View Site</span>
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 text-red-900 hover:text-red-600 transition-colors"
        >
          <Icon d={ICONS.logout} size={11} />
          <span className="text-[10px] font-mono uppercase tracking-wider">Logout</span>
        </button>
      </div>
    </aside>
  );
}

// ── Shared micro-components ───────────────────────────────────────────────────
const Dot = ({ color = 'bg-green-500', pulse }) => (
  <span className={`w-1.5 h-1.5 rounded-full inline-block flex-shrink-0 ${color} ${pulse ? 'animate-pulse' : ''}`} />
);

const PanelHeader = ({ label, badge, right, accent = 'bg-blue-500' }) => (
  <div className="flex items-center justify-between px-4 py-2 border-b border-gray-900">
    <div className="flex items-center gap-2">
      <span className={`w-0.5 h-4 ${accent} inline-block`} />
      <span className="text-[10px] font-mono text-gray-500 uppercase tracking-[.18em]">{label}</span>
      {badge && (
        <span className="text-[9px] font-mono text-green-600 border border-green-900 px-1.5 py-px uppercase tracking-wider">{badge}</span>
      )}
    </div>
    {right && <div className="text-[10px] font-mono text-gray-700">{right}</div>}
  </div>
);

const StatTile = ({ label, value, sub, accent = 'text-white', border = 'border-l-gray-800', trend }) => (
  <div className={`bg-[#0d1117] border-y border-r border-gray-900 border-l-2 ${border} px-3 py-2.5`}>
    <div className="text-[9px] font-mono text-gray-600 uppercase tracking-wider mb-1.5">{label}</div>
    <div className={`text-lg font-bold font-mono leading-none ${accent}`}>{value ?? '—'}</div>
    {trend !== undefined && (
      <div className={`text-[9px] font-mono mt-1 ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-700'}`}>
        {trend > 0 ? '▲' : trend < 0 ? '▼' : '─'} {Math.abs(trend)}%
      </div>
    )}
    {sub && trend === undefined && <div className="text-[9px] font-mono text-gray-700 mt-1 truncate">{sub}</div>}
  </div>
);

const fmt = n => `$${(+n || 0).toFixed(2)}`;

// ── Main dashboard ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();

  const [admin,    setAdmin]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [stats,    setStats]    = useState({ total: 0, published: 0, drafts: 0, submissions: 0 });
  const [analytics,setAnalytics]= useState({ current:0, previous:0, allTime:0, average:0, change:0, realtime:0, loading:true, error:null });
  const [seo,      setSeo]      = useState({ performance:{clicks:0,impressions:0,ctr:0,position:0}, topQueries:[], topPages:[], loading:true, error:null });
  const [finance,  setFinance]  = useState(null);
  const [adConfig, setAdConfig] = useState(null);

  const token  = () => localStorage.getItem('adminToken');
  const hdrs   = () => ({ Authorization: `Bearer ${token()}` });
  const logout = () => { localStorage.removeItem('adminToken'); localStorage.removeItem('adminInfo'); navigate('/admin/login'); };

  useEffect(() => {
    const init = async () => {
      const tok = token();
      const ai  = localStorage.getItem('adminInfo');
      if (!tok || !ai) { navigate('/admin/login'); return; }

      const r = await fetch(`${API_URL}/api/admin/dashboard`, { headers: hdrs() }).catch(() => null);
      if (!r?.ok) { logout(); return; }
      setAdmin(JSON.parse(ai));
      setLoading(false);

      // Content counts
      Promise.all([
        fetch(`${API_URL}/api/articles`),
        fetch(`${API_URL}/api/submissions`),
      ]).then(async ([a, s]) => {
        const ad = a.ok ? await a.json() : {};
        const sd = s.ok ? await s.json() : {};
        setStats({ total: ad.count??0, published: ad.count??0, drafts:0, submissions: sd.count??0 });
      }).catch(()=>{});

      // Analytics
      fetch(`${API_URL}/api/analytics/visitors?site=cry808`, { headers: hdrs() })
        .then(async r => {
          if (!r.ok) { const d=await r.json(); setAnalytics(p=>({...p,loading:false,error:d.message||'Not configured'})); return; }
          const d = await r.json();
          setAnalytics({...d.visitors, loading:false, error:null});
        }).catch(()=>setAnalytics(p=>({...p,loading:false,error:'Failed to load'})));

      // Search Console
      Promise.all([
        fetch(`${API_URL}/api/search-console/performance`, { headers: hdrs() }),
        fetch(`${API_URL}/api/search-console/top-queries`,  { headers: hdrs() }),
        fetch(`${API_URL}/api/search-console/top-pages`,    { headers: hdrs() }),
      ]).then(async ([p,q,pg]) => {
        const perf = p.ok  ? (await p.json()).performance : null;
        const qs   = q.ok  ? (await q.json()).queries||[] : [];
        const pgs  = pg.ok ? (await pg.json()).pages||[]  : [];
        setSeo({ performance: perf||{clicks:0,impressions:0,ctr:0,position:0}, topQueries:qs, topPages:pgs, loading:false, error: perf?null:'Not configured' });
      }).catch(()=>setSeo(p=>({...p,loading:false,error:'Failed to load'})));

      // Finance (optional)
      fetch(`${API_URL}/api/finance/summary`, { headers: hdrs() })
        .then(r=>r.ok?r.json():null).then(d=>{ if(d) setFinance(d); }).catch(()=>{});

      // Ad settings (optional)
      fetch(`${API_URL}/api/admin/settings`, { headers: hdrs() })
        .then(r=>r.ok?r.json():null).then(d=>{ if(d?.settings) setAdConfig(d.settings); }).catch(()=>{});
    };
    init();
  }, [navigate]);

  const handleDelete = async () => {
    setDeleteLoading(true);
    const r = await fetch(`${API_URL}/api/auth/delete-account`, { method:'DELETE', headers: hdrs() }).catch(()=>null);
    if (r?.ok) { logout(); } else { setDeleteLoading(false); setShowDelete(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="flex items-center gap-3">
        <Dot pulse />
        <span className="text-[10px] font-mono text-gray-700 uppercase tracking-widest">Connecting to CRY808 systems…</span>
      </div>
    </div>
  );

  // ── Derived ─────────────────────────────────────────────────────────────────
  const adOn  = (k) => adConfig?.[k] === 'true' || adConfig?.[k] === true;
  const adAny = adConfig && ['adsterra_enabled','hilltop_enabled','beatport_banner_enabled','monetag_enabled'].some(adOn);

  const alerts = [
    analytics.change < -15 && { level:'yellow', text:`Traffic ▼${Math.abs(analytics.change)}% vs last month` },
    stats.submissions > 0  && { level:'purple', text:`${stats.submissions} pending submission${stats.submissions>1?'s':''}` },
    finance?.upcomingRenewals?.[0]?.daysUntil <= 14 && { level:'red', text:`Renewal in ${finance.upcomingRenewals[0].daysUntil}d — ${finance.upcomingRenewals[0].name}` },
    finance?.payoutProgressBySource?.some(p=>p.ready) && { level:'green', text:'Payout ready — Finance Hub' },
    !analytics.loading && !analytics.error && adConfig && !adAny && { level:'yellow', text:'All ad networks disabled' },
  ].filter(Boolean);

  const alertColors = {
    green: 'border-green-900/60 bg-green-950/15 text-green-500',
    yellow:'border-yellow-900/60 bg-yellow-950/15 text-yellow-500',
    red:   'border-red-900/60 bg-red-950/15 text-red-500',
    purple:'border-purple-900/60 bg-purple-950/15 text-purple-400',
  };

  const trafficBadge = () => {
    if (analytics.loading||analytics.error) return null;
    const c = analytics.change;
    if (c >= 25)  return {label:'SPIKE',   cls:'text-green-300 border-green-700'};
    if (c >= 5)   return {label:'GROWING', cls:'text-green-500 border-green-800'};
    if (c >= -10) return {label:'NORMAL',  cls:'text-blue-400  border-blue-800'};
    return              {label:'LOW',      cls:'text-yellow-400 border-yellow-800'};
  };
  const traffic = trafficBadge();

  return (
    <div className="flex min-h-screen bg-black text-white">

      {/* ── SIDEBAR ─────────────────────────────────────────────────────── */}
      <Sidebar admin={admin} stats={stats} onLogout={logout} />

      {/* ── MAIN VIEWPORT ─────────────────────────────────────────────── */}
      <div className="ml-52 flex-1 flex flex-col min-h-screen overflow-x-hidden">

        {/* Top status strip */}
        <div className="bg-[#080b10] border-b border-gray-900 px-5 h-10 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1.5">
              <Dot pulse />
              <span className="text-[10px] font-mono text-green-600 uppercase tracking-widest">Online</span>
            </div>
            {analytics.realtime > 0 && (
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-green-400">
                <Dot color="bg-green-400" pulse />
                {analytics.realtime} live now
              </div>
            )}
            <div className="text-[10px] font-mono text-gray-700">
              {stats.total.toLocaleString()} articles · {stats.submissions} pending
            </div>
          </div>
          <div className="flex items-center gap-4">
            {finance && (
              <span className="text-[10px] font-mono text-gray-600">
                Net <span className="text-green-600">{fmt(finance.totalNetRevenue)}</span>
                <span className="text-gray-800 mx-2">·</span>
                Profit <span className={+finance.lifetimeProfit>=0?'text-green-600':'text-red-600'}>{fmt(finance.lifetimeProfit)}</span>
              </span>
            )}
            <span className="text-[10px] font-mono text-gray-700">
              {new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}
            </span>
          </div>
        </div>

        <main className="flex-1 p-5 space-y-4">

          {/* Alert strip */}
          {alerts.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {alerts.map((a,i) => (
                <div key={i} className={`flex items-center gap-1.5 border px-3 py-1 text-[9px] font-mono uppercase tracking-wider ${alertColors[a.level]}`}>
                  <span className="w-1 h-1 rounded-full inline-block bg-current flex-shrink-0" />
                  {a.text}
                </div>
              ))}
            </div>
          )}

          {/* ── SYSTEM TELEMETRY ─────────────────────────────────────── */}
          <section>
            <PanelHeader label="System Telemetry" badge="LIVE" accent="bg-green-600"
              right={`Last sync ${new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}`} />
            <div className="grid grid-cols-8 border-b border-l border-gray-900">
              <StatTile label="Articles"    value={stats.total.toLocaleString()}       border="border-l-blue-800"   accent="text-blue-400" />
              <StatTile label="Published"   value={stats.published.toLocaleString()}   border="border-l-green-800"  accent="text-green-400" />
              <StatTile label="Submissions" value={stats.submissions}                  border="border-l-purple-800" accent={stats.submissions>0?'text-purple-400':'text-gray-600'} />
              <StatTile label="Live"        value={analytics.realtime>0?analytics.realtime:'—'} border="border-l-green-700" accent="text-green-400" />
              <StatTile label="This Month"  value={analytics.loading?'…':analytics.current.toLocaleString()} border="border-l-blue-700" trend={analytics.loading?undefined:analytics.change} />
              <StatTile label="Last Month"  value={analytics.loading?'…':analytics.previous.toLocaleString()} border="border-l-gray-700" />
              <StatTile label="All Time"    value={analytics.loading?'…':analytics.allTime.toLocaleString()}  border="border-l-gray-700" />
              <StatTile label="Avg Monthly" value={analytics.loading?'…':analytics.average.toLocaleString()}  border="border-l-gray-700" />
            </div>
          </section>

          {/* ── ANALYTICS + REVENUE ─────────────────────────────────── */}
          <div className="grid grid-cols-3 gap-4">

            {/* Analytics (wider — 2 cols) */}
            <section className="col-span-2 bg-[#0d1117] border border-gray-900">
              <PanelHeader label="Traffic Intelligence" badge={traffic?.label}
                accent="bg-blue-600"
                right={analytics.realtime>0?`${analytics.realtime} online now`:undefined} />

              {analytics.loading ? (
                <div className="px-5 py-8 text-[10px] font-mono text-gray-700 uppercase tracking-widest">Fetching signals…</div>
              ) : analytics.error ? (
                <div className="px-5 py-8 text-[10px] font-mono text-yellow-800 uppercase tracking-widest">{analytics.error}</div>
              ) : (
                <>
                  {/* Big numbers row */}
                  <div className="grid grid-cols-4 divide-x divide-gray-900 border-b border-gray-900">
                    {[
                      { label:'This Month', value:analytics.current.toLocaleString(), accent: analytics.change>0?'text-green-400':analytics.change<0?'text-red-400':'text-white', sub: analytics.change!==0?`${analytics.change>0?'▲':'▼'} ${Math.abs(analytics.change)}% vs prior`:null },
                      { label:'Last Month', value:analytics.previous.toLocaleString(), accent:'text-gray-300', sub:null },
                      { label:'All Time',   value:analytics.allTime.toLocaleString(),  accent:'text-white', sub:null },
                      { label:'Avg Monthly',value:analytics.average.toLocaleString(),  accent:'text-gray-300', sub:null },
                    ].map(c => (
                      <div key={c.label} className="px-5 py-4">
                        <div className="text-[9px] font-mono text-gray-600 uppercase tracking-wider mb-2">{c.label}</div>
                        <div className={`text-3xl font-bold font-mono ${c.accent}`}>{c.value}</div>
                        {c.sub && <div className={`text-[10px] font-mono mt-1 ${analytics.change>0?'text-green-600':'text-red-600'}`}>{c.sub}</div>}
                      </div>
                    ))}
                  </div>

                  {/* Traffic status bar */}
                  <div className="px-5 py-3 flex items-center gap-4 border-b border-gray-900">
                    <div className="text-[9px] font-mono text-gray-700 uppercase tracking-widest">Traffic Status</div>
                    {traffic && (
                      <span className={`text-[9px] font-mono font-bold border px-2 py-0.5 uppercase tracking-wider ${traffic.cls}`}>
                        {traffic.label}
                      </span>
                    )}
                    <div className="flex-1 h-1 bg-gray-800 overflow-hidden">
                      {!analytics.loading && analytics.previous > 0 && (
                        <div
                          className={`h-full ${analytics.change>=25?'bg-green-400':analytics.change>=5?'bg-green-600':analytics.change>=-10?'bg-blue-600':'bg-yellow-600'}`}
                          style={{ width:`${Math.min(100,Math.max(5,50+(analytics.change||0)))}%`, transition:'width 1s ease' }}
                        />
                      )}
                    </div>
                  </div>
                </>
              )}
            </section>

            {/* Revenue Snapshot (1 col) */}
            <section className="bg-[#0d1117] border border-gray-900">
              <PanelHeader label="Revenue Snapshot" accent="bg-green-700" />
              {finance ? (
                <>
                  <div className="divide-y divide-gray-900">
                    {[
                      { label:'Net Revenue', value:fmt(finance.totalNetRevenue), accent:'text-green-400' },
                      { label:'Pending',     value:fmt(finance.pendingRevenue),  accent:'text-yellow-400' },
                      { label:'Expenses',    value:fmt(finance.totalExpenses),   accent:'text-red-400' },
                      { label:'Profit',      value:fmt(finance.lifetimeProfit),  accent:+finance.lifetimeProfit>=0?'text-green-400':'text-red-400' },
                      { label:'This Month',  value:fmt(finance.currentMonthRevenue), accent:'text-blue-400' },
                    ].map(r => (
                      <div key={r.label} className="px-4 py-2.5 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-gray-600 uppercase tracking-wider">{r.label}</span>
                        <span className={`text-sm font-bold font-mono ${r.accent}`}>{r.value}</span>
                      </div>
                    ))}
                  </div>
                  {finance.payoutProgressBySource?.some(p=>p.ready) && (
                    <div className="px-4 py-2 border-t border-gray-900 flex items-center gap-1.5">
                      <Dot pulse /><span className="text-[10px] font-mono text-green-500 uppercase tracking-wider">Payout ready</span>
                    </div>
                  )}
                  <button onClick={()=>navigate('/admin/finance')}
                    className="w-full px-4 py-2.5 border-t border-gray-900 text-[10px] font-mono text-green-700 hover:text-green-500 hover:bg-green-950/20 transition-colors uppercase tracking-wider text-left">
                    Open Revenue Command →
                  </button>
                </>
              ) : (
                <div className="px-4 py-6 text-[10px] font-mono text-gray-700 uppercase tracking-widest">No finance data</div>
              )}
            </section>
          </div>

          {/* ── SEARCH CONSOLE ──────────────────────────────────────── */}
          <section className="bg-[#0d1117] border border-gray-900">
            <PanelHeader label="Search Console Intelligence" badge={!seo.loading&&!seo.error?'ACTIVE':undefined}
              accent="bg-purple-700" right="28-day window" />

            {seo.loading ? (
              <div className="px-5 py-6 text-[10px] font-mono text-gray-700 uppercase tracking-widest">Fetching signals…</div>
            ) : seo.error ? (
              <div className="px-5 py-6 text-[10px] font-mono text-yellow-800 uppercase tracking-widest">{seo.error}</div>
            ) : (
              <div>
                {/* Performance row */}
                <div className="grid grid-cols-4 divide-x divide-gray-900 border-b border-gray-900">
                  {[
                    { label:'Clicks',      value:seo.performance.clicks.toLocaleString(),      accent:'text-blue-400',   border:'border-l-blue-800' },
                    { label:'Impressions', value:seo.performance.impressions.toLocaleString(), accent:'text-white',       border:'border-l-gray-700' },
                    { label:'CTR',         value:`${seo.performance.ctr}%`,                    accent:'text-green-400',  border:'border-l-green-800' },
                    { label:'Avg Position',value:seo.performance.position,                     accent:'text-gray-300',   border:'border-l-gray-700' },
                  ].map(c => (
                    <div key={c.label} className={`px-5 py-4 border-l-2 ${c.border}`}>
                      <div className="text-[9px] font-mono text-gray-600 uppercase tracking-wider mb-1.5">{c.label}</div>
                      <div className={`text-2xl font-bold font-mono ${c.accent}`}>{c.value}</div>
                    </div>
                  ))}
                </div>

                {/* Tables */}
                <div className="grid grid-cols-2 divide-x divide-gray-900">
                  {[
                    { title:'Top Keywords', rows: seo.topQueries.slice(0,6).map(q=>({ a:q.query, b:q.clicks, c:`${q.ctr}%`, d:q.position })), heads:['Query','Clicks','CTR','Pos'] },
                    { title:'Top Pages',    rows: seo.topPages.slice(0,6).map(p=>({ a:p.page.replace(/^https?:\/\/[^/]+/,'') || '/', b:p.clicks, c:p.impressions, d:`${p.ctr}%` })), heads:['Page','Clicks','Impr','CTR'] },
                  ].map(tbl => (
                    <div key={tbl.title}>
                      <div className="px-4 py-1.5 border-b border-gray-900 text-[9px] font-mono text-gray-700 uppercase tracking-widest">{tbl.title}</div>
                      {tbl.rows.length > 0 ? (
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-900">
                              {tbl.heads.map((h,i) => (
                                <th key={h} className={`px-4 py-1.5 text-[9px] font-mono text-gray-700 uppercase tracking-wider font-normal ${i===0?'text-left':'text-right'}`}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {tbl.rows.map((r,i) => (
                              <tr key={i} className="border-b border-gray-900/50 hover:bg-white/[0.025] transition-colors">
                                <td className="px-4 py-2 text-[10px] font-mono text-gray-400 truncate max-w-[180px]">{r.a}</td>
                                <td className="px-4 py-2 text-[10px] font-mono text-blue-400 text-right">{r.b}</td>
                                <td className="px-4 py-2 text-[10px] font-mono text-gray-500 text-right">{r.c}</td>
                                <td className="px-4 py-2 text-[10px] font-mono text-green-600 text-right">{r.d}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="px-4 py-5 text-[10px] font-mono text-gray-800 uppercase text-center">No data</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* ── AD NETWORK + ACTIVITY ───────────────────────────────── */}
          <div className="grid grid-cols-2 gap-4">

            {/* Ad Network */}
            <section className="bg-[#0d1117] border border-gray-900">
              <PanelHeader label="Ad Network Status" accent="bg-yellow-700"
                right={adConfig ? `${['adsterra_enabled','hilltop_enabled','beatport_banner_enabled','monetag_enabled'].filter(adOn).length} active` : undefined} />
              <div className="divide-y divide-gray-900">
                {[
                  { name:'Adsterra',   key:'adsterra_enabled',        desc:'Display / Social Bar' },
                  { name:'Hilltop Ads',key:'hilltop_enabled',          desc:'Article sidebar' },
                  { name:'Beatport',   key:'beatport_banner_enabled',  desc:'Affiliate banners' },
                  { name:'Monetag',    key:'monetag_enabled',          desc:'Pop / push network' },
                ].map(ad => {
                  const on = adConfig ? adOn(ad.key) : null;
                  return (
                    <div key={ad.name} className="px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Dot color={on===true?'bg-green-500 shadow-[0_0_6px_#22c55e]':on===false?'bg-gray-800':'bg-gray-900'} />
                        <div>
                          <div className="text-[11px] font-mono text-white">{ad.name}</div>
                          <div className="text-[9px] font-mono text-gray-700">{ad.desc}</div>
                        </div>
                      </div>
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 border uppercase tracking-wider ${
                        on===true ?'border-green-900 text-green-500 bg-green-950/20':
                        on===false?'border-gray-800 text-gray-700':
                                   'border-gray-900 text-gray-800'
                      }`}>{on===null?'—':on?'ACTIVE':'OFF'}</span>
                    </div>
                  );
                })}
              </div>
              <button onClick={()=>navigate('/admin/settings')}
                className="w-full px-4 py-2.5 border-t border-gray-900 text-[10px] font-mono text-yellow-800 hover:text-yellow-600 hover:bg-yellow-950/20 transition-colors uppercase tracking-wider text-left">
                Open Ad Control →
              </button>
            </section>

            {/* Recent Operations */}
            <section className="bg-[#0d1117] border border-gray-900">
              <PanelHeader label="Operations Feed" accent="bg-gray-700" />
              <div className="px-4 py-3 flex items-center justify-between border-b border-gray-900">
                <span className="text-[9px] font-mono text-gray-800 uppercase tracking-wider">Activity log · frontend placeholder</span>
              </div>
              <div className="px-4 py-8 text-center">
                <div className="text-[10px] font-mono text-gray-700 uppercase tracking-widest">No operations logged</div>
                <div className="text-[9px] font-mono text-gray-800 mt-1">Full activity database not implemented</div>
              </div>
              <div className="px-4 py-2.5 border-t border-gray-900 flex items-center justify-between">
                <button onClick={()=>navigate('/admin/finance')} className="text-[10px] font-mono text-gray-700 hover:text-gray-500 uppercase tracking-wider transition-colors">
                  View Finance Activity →
                </button>
                <button onClick={()=>navigate('/admin/articles')} className="text-[10px] font-mono text-gray-700 hover:text-gray-500 uppercase tracking-wider transition-colors">
                  View Articles →
                </button>
              </div>
            </section>
          </div>

          {/* ── DANGER ──────────────────────────────────────────────── */}
          <section>
            <div className="bg-[#0d1117] border border-red-950/60">
              <div className="px-4 py-2 border-b border-red-950/40 flex items-center gap-2">
                <span className="w-0.5 h-4 bg-red-900 inline-block" />
                <span className="text-[9px] font-mono text-red-900 uppercase tracking-widest">Danger Zone</span>
              </div>
              <div className="px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono text-gray-600 uppercase tracking-wider">Delete Admin Account</div>
                  <div className="text-[9px] font-mono text-gray-800 mt-0.5">Permanently removes account. Cannot be undone.</div>
                </div>
                <button onClick={()=>setShowDelete(true)}
                  className="text-[10px] font-mono text-red-800 hover:text-red-600 border border-red-900 hover:border-red-700 px-3 py-1.5 uppercase tracking-wider transition-colors flex-shrink-0 ml-6">
                  Delete Account
                </button>
              </div>
            </div>
          </section>

        </main>
      </div>

      {/* ── DELETE MODAL ──────────────────────────────────────────── */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 px-4">
          <div className="bg-[#0d1117] border border-red-900 max-w-sm w-full">
            <div className="px-5 py-3 border-b border-red-900/50">
              <div className="text-[10px] font-mono text-red-700 uppercase tracking-widest">Confirm Deletion</div>
            </div>
            <div className="px-5 py-4">
              <p className="text-xs font-mono text-gray-400 mb-1">Delete admin account permanently?</p>
              <p className="text-[9px] font-mono text-gray-700">Allows new registration. Cannot be undone.</p>
            </div>
            <div className="px-5 py-3 border-t border-gray-800 flex gap-2">
              <button onClick={()=>setShowDelete(false)} disabled={deleteLoading}
                className="flex-1 py-2 text-[10px] font-mono text-gray-500 border border-gray-700 hover:border-gray-500 uppercase tracking-wider transition-colors disabled:opacity-40">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleteLoading}
                className="flex-1 py-2 text-[10px] font-mono text-red-500 border border-red-800 hover:bg-red-950/30 uppercase tracking-wider transition-colors disabled:opacity-40">
                {deleteLoading?'Deleting…':'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
