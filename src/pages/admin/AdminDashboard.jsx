import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from '../../assets/cry808_logo.png';

const API_URL = import.meta.env.VITE_API_URL;

const ICONS = {
  add: 'M12 5v14M5 12h14',
  list: 'M5 6h14M5 12h14M5 18h9',
  inbox: 'M4 13h4l2 3h4l2-3h4M5 5h14l1 8v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5l1-8Z',
  finance: 'M12 3v18M8 7h6a3 3 0 0 1 0 6h-4a3 3 0 0 0 0 6h6',
  ads: 'M12 4v16M4 12h16M7 7l10 10M17 7 7 17',
  spotify: 'M7 18V6l11 6-11 6Z',
  amazon: 'M5 7h14v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7Zm4 0a3 3 0 0 1 6 0',
  scout: 'M12 3l2.5 5.4 5.9.7-4.4 4 1.3 5.9L12 16.7 6.7 20 8 14.1l-4.4-4 5.9-.7L12 3Z',
  users: 'M16 19v-1a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v1M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM20 19v-1a3 3 0 0 0-2-2.83',
  chart: 'M4 17l6-6 4 4 6-8',
  search: 'M11 19a8 8 0 1 1 5.7-2.3L21 21',
  pulse: 'M4 12h4l2-7 4 14 2-7h4',
  clock: 'M12 6v6l4 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  check: 'm5 13 4 4L19 7',
  external: 'M14 4h6v6M20 4l-9 9M10 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4',
  logout: 'M10 6H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h4M15 16l4-4-4-4M19 12H9',
};

const money = (value) => `$${(+value || 0).toFixed(2)}`;
const num = (value) => (+value || 0).toLocaleString();
const shortDate = (value) => value ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No date';
const currentTime = (value) => new Date(value).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

function Icon({ name, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={ICONS[name]} />
    </svg>
  );
}

function Sidebar({ admin, stats, onLogout }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const active = (to) => pathname === to || (to !== '/admin/dashboard' && pathname.startsWith(to));

  const groups = [
    ['Content', [
      ['New Article', 'add', '/admin/articles/create'],
      ['All Articles', 'list', '/admin/articles', stats.total],
      ['Submissions', 'inbox', '/admin/submissions', stats.submissions],
    ]],
    ['Business & Config', [
      ['Finance Hub',     'finance', '/admin/finance'],
      ['Ad Settings',     'ads',     '/admin/settings'],
      ['Referral Ads',    'scout',   '/admin/referral-ads'],
      ['Spotify Manager', 'spotify', '/admin/spotify'],
      ['Amazon Products', 'amazon',  '/admin/amazon-products'],
    ]],
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-[264px] flex-col border-r border-white/[0.07] bg-[#0b1019]/95 px-4 py-5 shadow-[20px_0_80px_rgba(0,0,0,.34)] backdrop-blur-xl">
      <button onClick={() => navigate('/admin/dashboard')} className="mb-7 flex items-center gap-3 rounded-2xl px-2 py-2 text-left transition hover:bg-white/[0.04]">
        <span className="grid h-11 w-11 place-items-center overflow-hidden rounded-2xl bg-transparent shadow-[0_14px_34px_rgba(124,58,237,.18)]">
          <img src={logo} alt="Cry808" className="h-full w-full object-contain" />
        </span>
        <span>
          <span className="block text-[15px] font-semibold tracking-[.16em] text-white">CRY808</span>
          <span className="block text-[11px] font-medium text-slate-500">Command Center</span>
        </span>
      </button>

      <nav className="flex-1 space-y-7 overflow-y-auto pr-1">
        {groups.map(([label, items]) => (
          <div key={label}>
            <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[.16em] text-slate-500/90">{label}</div>
            <div className="space-y-1.5">
              {items.map(([labelText, icon, to, count]) => {
                const isActive = active(to);
                return (
                  <button
                    key={labelText}
                    onClick={() => navigate(to)}
                    className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm transition duration-200 ${
                      isActive
                        ? 'bg-white/[0.08] text-white shadow-[0_12px_34px_rgba(99,102,241,.18),inset_0_0_0_1px_rgba(255,255,255,.08)]'
                        : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-100'
                    }`}
                  >
                    <span className={`grid h-8 w-8 place-items-center rounded-xl transition ${isActive ? 'bg-violet-500/20 text-violet-200' : 'bg-white/[0.04] text-slate-500 group-hover:text-slate-200'}`}>
                      <Icon name={icon} size={16} />
                    </span>
                    <span className="min-w-0 flex-1 font-medium">{labelText}</span>
                    {!!count && <span className="rounded-full bg-white/[0.08] px-2 py-0.5 text-[11px] font-semibold text-slate-300">{count}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-5 rounded-3xl border border-white/[0.07] bg-white/[0.035] p-4 shadow-[0_18px_44px_rgba(0,0,0,.2)]">
        {admin && (
          <div className="mb-4">
            <div className="truncate text-sm font-semibold text-white">{admin.username}</div>
            <div className="truncate text-xs text-slate-500">{admin.email}</div>
          </div>
        )}
        <button onClick={() => window.open('/', '_blank')} className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-sm text-slate-400 transition hover:bg-white/[0.05] hover:text-white">
          <Icon name="external" size={15} /> View Site
        </button>
        <button onClick={onLogout} className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-sm text-rose-300/75 transition hover:bg-rose-500/10 hover:text-rose-200">
          <Icon name="logout" size={15} /> Logout
        </button>
      </div>
    </aside>
  );
}

function Pill({ children, tone = 'slate', pulse = false }) {
  const tones = {
    slate: 'bg-white/[0.055] text-slate-300 ring-white/[0.08]',
    green: 'bg-emerald-400/10 text-emerald-200 ring-emerald-400/20',
    blue: 'bg-sky-400/10 text-sky-200 ring-sky-400/20',
    purple: 'bg-violet-400/10 text-violet-200 ring-violet-400/20',
    amber: 'bg-amber-400/10 text-amber-200 ring-amber-400/20',
    rose: 'bg-rose-400/10 text-rose-200 ring-rose-400/20',
  };
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ring-1 ${tones[tone]}`}>
      {pulse && <span className="h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_10px_currentColor]" />}
      {children}
    </span>
  );
}

function Panel({ title, subtitle, icon, right, children, className = '' }) {
  return (
    <section className={`rounded-[28px] border border-white/[0.07] bg-[#111827]/72 shadow-[0_20px_70px_rgba(0,0,0,.28)] backdrop-blur-xl ${className}`}>
      <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] px-5 py-4">
        <div className="flex items-center gap-3">
          {icon && <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/[0.055] text-slate-200"><Icon name={icon} size={18} /></span>}
          <div>
            <h2 className="text-base font-semibold tracking-tight text-white">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
          </div>
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

function MetricCard({ label, value, meta, tone = 'slate', trend }) {
  const tones = {
    slate: 'text-slate-200 bg-white/[0.055]',
    green: 'text-emerald-300 bg-emerald-400/10',
    blue: 'text-sky-300 bg-sky-400/10',
    purple: 'text-violet-300 bg-violet-400/10',
    amber: 'text-amber-300 bg-amber-400/10',
    rose: 'text-rose-300 bg-rose-400/10',
  };
  return (
    <div className="group rounded-[26px] border border-white/[0.07] bg-[#111827]/72 p-5 shadow-[0_18px_54px_rgba(0,0,0,.22)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#152033]/82">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="text-sm font-medium text-slate-400">{label}</div>
        {trend != null && <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${trend >= 0 ? 'bg-emerald-400/10 text-emerald-300' : 'bg-rose-400/10 text-rose-300'}`}>{trend >= 0 ? '+' : ''}{trend}%</span>}
      </div>
      <div className={`inline-flex rounded-2xl px-3 py-1.5 text-3xl font-semibold tracking-tight ${tones[tone]}`}>{value}</div>
      {meta && <div className="mt-3 text-sm text-slate-500">{meta}</div>}
    </div>
  );
}

function TrafficChart({ analytics }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const monthly = analytics.monthly || [];
  if (!monthly.length) {
    return (
      <div className="px-5 py-5">
        <div className="mb-5 grid grid-cols-3 gap-3">
          {[
            ['Last Month', analytics.previous],
            ['Average', analytics.average],
            ['This Month', analytics.current],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-white/[0.035] p-3">
              <div className="text-xs text-slate-500">{label}</div>
              <div className="mt-1 text-xl font-semibold text-white">{num(value)}</div>
            </div>
          ))}
        </div>
        <div className="grid min-h-[280px] place-items-center border border-white/[0.06] bg-white/[0.02] text-center text-sm text-slate-500">
          Monthly Google Analytics data is not in the API response yet. Restart Server808, then refresh this page.
        </div>
      </div>
    );
  }
  const values = monthly.map((point) => Math.max(0, +point.visitors || 0));
  const max = Math.max(...values, 1);
  const chartWidth = 760;
  const chartHeight = 320;
  const left = 56;
  const right = 28;
  const top = 26;
  const bottom = 52;
  const plotWidth = chartWidth - left - right;
  const plotHeight = chartHeight - top - bottom;
  const points = values.map((value, index) => {
    const divisor = Math.max(values.length - 1, 1);
    return [
      left + (index / divisor) * plotWidth,
      top + plotHeight - (value / max) * plotHeight,
    ];
  });
  const d = points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ');
  const area = `${d} L ${points.at(-1)[0]} ${chartHeight - bottom} L ${points[0][0]} ${chartHeight - bottom} Z`;
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
    y: top + plotHeight - ratio * plotHeight,
    value: Math.round(max * ratio),
  }));
  const labelStep = Math.max(1, Math.ceil(monthly.length / 9));

  return (
    <div className="px-5 py-5">
      <div className="mb-5 grid grid-cols-3 gap-3">
        {[
          ['Last Month', analytics.previous],
          ['Average', analytics.average],
          ['This Month', analytics.current],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-white/[0.035] p-3">
            <div className="text-xs text-slate-500">{label}</div>
            <div className="mt-1 text-xl font-semibold text-white">{num(value)}</div>
          </div>
        ))}
      </div>
      <div className="relative">
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="admin-traffic-chart-svg w-full overflow-visible">
        <defs>
          <linearGradient id="trafficLine" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="55%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
          <linearGradient id="trafficArea" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
        </defs>
        {yTicks.map(({ y, value }) => (
          <g key={y}>
            <line x1={left} x2={chartWidth - right} y1={y} y2={y} stroke="rgba(148,163,184,.1)" />
            <text x="8" y={y + 4} fill="rgba(148,163,184,.55)" fontSize="11">{num(value)}</text>
          </g>
        ))}
        <path d={area} fill="url(#trafficArea)" />
        <path d={d} fill="none" stroke="url(#trafficLine)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        {points.map(([x, y], index) => (
          <g key={monthly[index]?.yearMonth || index}>
            <circle cx={x} cy={y} r="4.2" fill="#0f172a" stroke="#a78bfa" strokeWidth="2.3" />
            <circle
              cx={x}
              cy={y}
              r="14"
              fill="transparent"
              className="cursor-crosshair"
              onMouseEnter={() => setHoveredPoint({
                label: monthly[index]?.label,
                visitors: monthly[index]?.visitors,
                left: `${(x / chartWidth) * 100}%`,
                top: `${(y / chartHeight) * 100}%`,
              })}
              onMouseLeave={() => setHoveredPoint(null)}
            />
            {(index % labelStep === 0 || index === points.length - 1) && (
              <text x={x} y={chartHeight - 18} textAnchor="middle" fill="rgba(148,163,184,.65)" fontSize="12">{monthly[index]?.label}</text>
            )}
          </g>
        ))}
      </svg>
      {hoveredPoint && (
        <div
          className="pointer-events-none absolute z-10 border border-white/[0.1] bg-[#060b13]/95 px-3 py-2 text-xs shadow-[0_18px_48px_rgba(0,0,0,.42)] backdrop-blur-md"
          style={{ left: hoveredPoint.left, top: hoveredPoint.top, transform: 'translate(-50%, calc(-100% - 12px))' }}
        >
          <div className="font-semibold text-white">{num(hoveredPoint.visitors)} visits</div>
          <div className="mt-0.5 text-slate-500">{hoveredPoint.label}</div>
        </div>
      )}
      </div>
    </div>
  );
}

function SearchTable({ title, rows, firstColumn }) {
  return (
    <div className="min-w-0">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <span className="text-xs text-slate-500">28 days</span>
      </div>
      <div className="overflow-hidden rounded-2xl border border-white/[0.06]">
        <table className="w-full text-left">
          <thead className="bg-white/[0.035] text-xs text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">{firstColumn}</th>
              <th className="px-4 py-3 text-right font-medium">Clicks</th>
              <th className="px-4 py-3 text-right font-medium">Impr.</th>
              <th className="px-4 py-3 text-right font-medium">CTR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05] text-sm">
            {rows.length ? rows.map((row, index) => (
              <tr key={`${row.label}-${index}`} className="transition hover:bg-white/[0.035]">
                <td className="max-w-[260px] truncate px-4 py-3 text-slate-300">{row.label}</td>
                <td className="px-4 py-3 text-right font-medium text-sky-300">{num(row.clicks)}</td>
                <td className="px-4 py-3 text-right text-slate-400">{num(row.impressions)}</td>
                <td className="px-4 py-3 text-right text-emerald-300">{row.ctr}%</td>
              </tr>
            )) : (
              <tr><td colSpan="4" className="px-4 py-8 text-center text-sm text-slate-500">No Search Console data yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RecentArticle({ article }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl p-2 transition hover:bg-white/[0.035]">
      <div className="h-14 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-white/[0.06]">
        {article.image_url ? <img src={article.image_url} alt="" className="h-full w-full object-cover" /> : <div className="h-full w-full bg-gradient-to-br from-violet-500/30 to-sky-500/10" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-white">{article.title}</div>
        <div className="mt-1 text-xs text-slate-500">{article.author || 'Cry808'} / {shortDate(article.created_at)}</div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {(article.tags || []).slice(0, 3).map((tag) => <span key={tag} className="rounded-full bg-white/[0.055] px-2 py-0.5 text-[11px] text-slate-400">{tag}</span>)}
          {article.is_featured && <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-[11px] text-amber-200">Featured</span>}
        </div>
      </div>
      <div className="hidden text-right text-xs text-slate-500 sm:block">
        <div>{article.category || 'article'}</div>
        <div className="mt-1">ID {article.id}</div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, published: 0, featured: 0, submissions: 0 });
  const [articles, setArticles] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [analytics, setAnalytics] = useState({ current: 0, previous: 0, allTime: 0, average: 0, change: 0, realtime: 0, loading: true, error: null });
  const [seo, setSeo] = useState({ performance: { clicks: 0, impressions: 0, ctr: 0, position: 0 }, topQueries: [], topPages: [], loading: true, error: null });
  const [finance, setFinance] = useState(null);
  const [adConfig, setAdConfig] = useState(null);
  const [neon, setNeon] = useState({ loading: true, error: null });
  const [now, setNow] = useState(new Date());

  const token = () => localStorage.getItem('adminToken');
  const hdrs = () => ({ Authorization: `Bearer ${token()}` });
  const logout = () => { localStorage.removeItem('adminToken'); localStorage.removeItem('adminInfo'); navigate('/admin/login'); };

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const init = async () => {
      const tok = token();
      const adminInfo = localStorage.getItem('adminInfo');
      if (!tok || !adminInfo) { navigate('/admin/login'); return; }

      const authCheck = await fetch(`${API_URL}/api/admin/dashboard`, { headers: hdrs() }).catch(() => null);
      if (!authCheck?.ok) { logout(); return; }
      setAdmin(JSON.parse(adminInfo));
      setLoading(false);

      Promise.all([fetch(`${API_URL}/api/articles`), fetch(`${API_URL}/api/submissions`)])
        .then(async ([articleResponse, submissionResponse]) => {
          const articleData = articleResponse.ok ? await articleResponse.json() : {};
          const submissionData = submissionResponse.ok ? await submissionResponse.json() : {};
          const loadedArticles = articleData.articles || [];
          const loadedSubmissions = submissionData.submissions || [];
          setArticles(loadedArticles);
          setSubmissions(loadedSubmissions);
          setStats({
            total: articleData.count ?? loadedArticles.length,
            published: loadedArticles.length,
            featured: loadedArticles.filter((article) => article.is_featured).length,
            submissions: submissionData.count ?? loadedSubmissions.length,
          });
        }).catch(() => {});

      fetch(`${API_URL}/api/analytics/visitors?site=cry808`, { headers: hdrs() })
        .then(async (response) => {
          if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            setAnalytics((prev) => ({ ...prev, loading: false, error: data.message || 'Not configured' }));
            return;
          }
          const data = await response.json();
          setAnalytics({ ...data.visitors, loading: false, error: null });
        }).catch(() => setAnalytics((prev) => ({ ...prev, loading: false, error: 'Failed to load analytics' })));

      Promise.all([
        fetch(`${API_URL}/api/search-console/performance`, { headers: hdrs() }),
        fetch(`${API_URL}/api/search-console/top-queries`, { headers: hdrs() }),
        fetch(`${API_URL}/api/search-console/top-pages`, { headers: hdrs() }),
      ]).then(async ([performanceResponse, queryResponse, pageResponse]) => {
        const performance = performanceResponse.ok ? (await performanceResponse.json()).performance : null;
        const queries = queryResponse.ok ? (await queryResponse.json()).queries || [] : [];
        const pages = pageResponse.ok ? (await pageResponse.json()).pages || [] : [];
        setSeo({
          performance: performance || { clicks: 0, impressions: 0, ctr: 0, position: 0 },
          topQueries: queries,
          topPages: pages,
          loading: false,
          error: performance ? null : 'Not configured',
        });
      }).catch(() => setSeo((prev) => ({ ...prev, loading: false, error: 'Failed to load Search Console' })));

      fetch(`${API_URL}/api/finance/summary`, { headers: hdrs() })
        .then((response) => response.ok ? response.json() : null)
        .then((data) => { if (data) setFinance(data); }).catch(() => {});

      fetch(`${API_URL}/api/admin/settings`, { headers: hdrs() })
        .then((response) => response.ok ? response.json() : null)
        .then((data) => { if (data?.settings) setAdConfig(data.settings); }).catch(() => {});

      fetch(`${API_URL}/api/neon/usage`, { headers: hdrs() })
        .then((r) => r.ok ? r.json() : r.json().then(d => Promise.reject(d)))
        .then((data) => setNeon({ ...data, loading: false, error: null }))
        .catch((err) => setNeon({ loading: false, error: err?.message || 'Failed to load' }));
    };

    init();
  }, [navigate]);

  const handleDelete = async () => {
    setDeleteLoading(true);
    const response = await fetch(`${API_URL}/api/auth/delete-account`, { method: 'DELETE', headers: hdrs() }).catch(() => null);
    if (response?.ok) logout();
    else { setDeleteLoading(false); setShowDelete(false); }
  };

  const adOn = (key) => adConfig?.[key] === 'true' || adConfig?.[key] === true;
  const activeAds = adConfig ? ['adsterra_enabled', 'hilltop_enabled', 'beatport_banner_enabled', 'monetag_enabled'].filter(adOn).length : 0;
  const pendingSubmissions = submissions.filter((submission) => !['approved', 'rejected'].includes(submission.submission_status)).length || stats.submissions;

  if (loading) {
    return (
      <div className="admin-command-center grid min-h-screen place-items-center bg-[#070b12] text-white">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_45%_35%,rgba(59,130,246,.16),transparent_28%),radial-gradient(circle_at_58%_48%,rgba(139,92,246,.14),transparent_30%)]" />
        <div className="relative w-[360px] border border-white/[0.08] bg-[#0d1421]/90 p-7 shadow-[0_28px_90px_rgba(0,0,0,.45)]">
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center border border-white/[0.08] bg-white/[0.04]">
            <div className="admin-loader-ring" />
          </div>
          <div className="text-center text-sm font-semibold uppercase tracking-[.2em] text-white">Loading Dashboard</div>
          <div className="mt-2 text-center text-sm text-slate-500">Syncing content, traffic, revenue, and submissions.</div>
          <div className="mt-6 grid gap-2">
            <div className="admin-loading-bar" />
            <div className="admin-loading-bar admin-loading-bar-delay" />
          </div>
        </div>
      </div>
    );
  }

  const queryRows = seo.topQueries.slice(0, 6).map((query) => ({ label: query.query, clicks: query.clicks, impressions: query.impressions, ctr: query.ctr }));
  const pageRows = seo.topPages.slice(0, 6).map((page) => ({ label: page.page?.replace(/^https?:\/\/[^/]+/, '') || '/', clicks: page.clicks, impressions: page.impressions, ctr: page.ctr }));

  return (
    <div className="admin-command-center min-h-screen bg-[#070b12] text-white selection:bg-violet-400/30">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(59,130,246,.16),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(139,92,246,.14),transparent_30%),linear-gradient(180deg,#070b12_0%,#0a0f1a_48%,#070b12_100%)]" />
      <Sidebar admin={admin} stats={{ ...stats, submissions: pendingSubmissions }} onLogout={logout} />

      <div className="relative ml-[264px] min-h-screen">
        <header className="admin-topbar sticky top-0 z-20 border-b border-white/[0.07] bg-[#070b12]/82 px-8 py-3 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <Pill tone="green" pulse>Online</Pill>
              <Pill tone="blue"><Icon name="users" size={14} /> {analytics.realtime || 0} live viewers</Pill>
              <Pill>{stats.total} articles</Pill>
              <Pill tone={pendingSubmissions ? 'purple' : 'slate'}>{pendingSubmissions} pending</Pill>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              {finance && <Pill tone="green">Net {money(finance.totalNetRevenue)}</Pill>}
              {finance && <Pill tone={+finance.lifetimeProfit >= 0 ? 'green' : 'rose'}>Profit {money(finance.lifetimeProfit)}</Pill>}
              <Pill><Icon name="clock" size={14} /> {currentTime(now)}</Pill>
            </div>
          </div>
        </header>

        <main className="admin-main px-8 py-7">
          <section className="mb-6 grid gap-4 md:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-9">
            <MetricCard label="Articles" value={num(stats.total)} meta="Total library" tone="blue" />
            <MetricCard label="Published" value={num(stats.published)} meta="Live content" tone="green" />
            <MetricCard label="Featured" value={num(stats.featured)} meta="Homepage priority" tone="amber" />
            <MetricCard label="Submissions" value={num(pendingSubmissions)} meta="Awaiting action" tone="purple" />
            <MetricCard label="Live Visitors" value={num(analytics.realtime)} meta="Realtime traffic" tone="green" />
            <MetricCard label="This Month" value={analytics.loading ? '...' : num(analytics.current)} meta="Visitor sessions" tone="blue" trend={analytics.loading ? null : analytics.change} />
            <MetricCard label="Last Month" value={analytics.loading ? '...' : num(analytics.previous)} meta="Prior period" />
            <MetricCard label="All Time" value={analytics.loading ? '...' : num(analytics.allTime)} meta="Tracked visitors" />
            <MetricCard label="Avg Monthly" value={analytics.loading ? '...' : num(analytics.average)} meta="Monthly baseline" />
          </section>

          <section className="mb-6 grid gap-5 xl:grid-cols-[1.08fr_.92fr]">
            <Panel title="Traffic Overview" subtitle={analytics.error || 'Monthly visitor movement'} icon="chart" right={!analytics.loading && <Pill tone={analytics.change >= 0 ? 'green' : 'amber'}>{analytics.change >= 0 ? '+' : ''}{analytics.change}% vs previous</Pill>}>
              {analytics.loading ? <div className="px-5 py-16 text-center text-sm text-slate-500">Loading traffic data...</div> : <TrafficChart analytics={analytics} />}
            </Panel>

            <Panel title="Search Console Overview" subtitle={seo.error || 'Clicks, impressions, CTR, and ranking signals'} icon="search">
              <div className="grid grid-cols-2 gap-3 px-5 py-5 lg:grid-cols-4">
                {[
                  ['Clicks', num(seo.performance.clicks), 'text-sky-300'],
                  ['Impressions', num(seo.performance.impressions), 'text-white'],
                  ['CTR', `${seo.performance.ctr || 0}%`, 'text-emerald-300'],
                  ['Position', seo.performance.position || 0, 'text-violet-300'],
                ].map(([label, value, color]) => (
                  <div key={label} className="rounded-2xl bg-white/[0.035] p-3">
                    <div className="text-xs text-slate-500">{label}</div>
                    <div className={`mt-1 text-xl font-semibold ${color}`}>{value}</div>
                  </div>
                ))}
              </div>
              <div className="grid gap-5 px-5 pb-5 lg:grid-cols-2">
                <SearchTable title="Top Keywords" firstColumn="Keyword" rows={queryRows} />
                <SearchTable title="Top Pages" firstColumn="Page" rows={pageRows} />
              </div>
            </Panel>
          </section>

          <section className="mb-6 grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
            <Panel title="Revenue Snapshot" subtitle="Net, pending, expenses, and profit" icon="finance" right={<button onClick={() => navigate('/admin/finance')} className="rounded-full bg-white/[0.06] px-3 py-1 text-xs font-semibold text-slate-300 transition hover:bg-white/[0.1]">Open Finance</button>}>
              <div className="grid gap-3 p-5 sm:grid-cols-2">
                {finance ? [
                  ['Net Revenue', money(finance.totalNetRevenue), 'text-emerald-300'],
                  ['Pending', money(finance.pendingRevenue), 'text-amber-300'],
                  ['Expenses', money(finance.totalExpenses), 'text-rose-300'],
                  ['Profit', money(finance.lifetimeProfit), +finance.lifetimeProfit >= 0 ? 'text-emerald-300' : 'text-rose-300'],
                  ['This Month', money(finance.currentMonthRevenue), 'text-sky-300'],
                  ['Monthly Expense', money(finance.monthlyExpenses), 'text-slate-300'],
                ].map(([label, value, color]) => (
                  <div key={label} className="rounded-2xl bg-white/[0.035] p-4">
                    <div className="text-sm text-slate-500">{label}</div>
                    <div className={`mt-2 text-2xl font-semibold ${color}`}>{value}</div>
                  </div>
                )) : <div className="col-span-2 py-10 text-center text-sm text-slate-500">No finance data available</div>}
              </div>
            </Panel>

            <Panel title="Recent Articles" subtitle="Latest content with tags and publishing context" icon="list" right={<button onClick={() => navigate('/admin/articles')} className="rounded-full bg-white/[0.06] px-3 py-1 text-xs font-semibold text-slate-300 transition hover:bg-white/[0.1]">View All</button>}>
              <div className="space-y-1 p-4">
                {articles.slice(0, 5).length ? articles.slice(0, 5).map((article) => <RecentArticle key={article.id} article={article} />) : <div className="py-12 text-center text-sm text-slate-500">No articles found</div>}
              </div>
            </Panel>
          </section>

          {/* ── Infrastructure ── */}
          <section className="mb-6">
            <Panel
              title="Database · Neon"
              subtitle="Compute usage for the current billing period"
              icon="pulse"
              right={
                <a
                  href="https://console.neon.tech"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1 text-xs font-semibold text-slate-300 transition hover:bg-white/[0.1]"
                >
                  <Icon name="external" size={12} /> Neon Console
                </a>
              }
            >
              {neon.loading ? (
                <div className="px-5 py-10 text-center text-sm text-slate-500">Loading Neon stats…</div>
              ) : neon.error ? (
                <div className="px-5 py-10 text-center text-sm text-rose-400">
                  {neon.error.includes('not configured') ? 'Add NEON_PROJECT_ID + NEON_API_KEY env vars to enable.' : neon.error}
                </div>
              ) : (() => {
                const barColor = neon.percentUsed >= 90 ? 'bg-rose-500' : neon.percentUsed >= 70 ? 'bg-amber-400' : neon.percentUsed >= 40 ? 'bg-sky-400' : 'bg-emerald-400';
                const textColor = neon.percentUsed >= 90 ? 'text-rose-400' : neon.percentUsed >= 70 ? 'text-amber-300' : 'text-emerald-400';
                const remaining = Math.max(0, neon.cuHoursLimit - neon.cuHoursUsed).toFixed(1);
                return (
                  <div>
                    {/* Progress bar */}
                    <div className="px-5 pt-5 pb-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm text-slate-400">
                          <span className="text-xl font-bold text-white">{neon.cuHoursUsed}</span>
                          {' '}/ {neon.cuHoursLimit} CU-hrs used
                        </span>
                        <span className={`text-sm font-bold tabular-nums ${textColor}`}>{neon.percentUsed}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.07]">
                        <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${neon.percentUsed}%` }} />
                      </div>
                      <div className="mt-1.5 text-xs text-slate-500">
                        {+remaining > 0 ? `${remaining} CU-hrs remaining this period` : 'Allowance exhausted — compute suspended until reset'}
                      </div>
                    </div>

                    {/* Stat grid */}
                    <div className="grid grid-cols-2 gap-3 px-5 pb-5 sm:grid-cols-4">
                      {[
                        ['CU-hrs Used',   `${neon.cuHoursUsed}`,                                 textColor],
                        ['Remaining',     `${remaining}`,                                         'text-white'],
                        ['Resets In',     neon.daysLeft !== null ? `${neon.daysLeft} days` : '—', 'text-sky-300'],
                        ['Storage',       neon.dataStorageGBHour !== null ? `${neon.dataStorageGBHour} GB·hr` : '—', 'text-violet-300'],
                      ].map(([label, value, color]) => (
                        <div key={label} className="rounded-2xl bg-white/[0.035] p-3">
                          <div className="text-xs text-slate-500">{label}</div>
                          <div className={`mt-1 text-xl font-semibold ${color}`}>{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </Panel>
          </section>

        </main>
      </div>

      {showDelete && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] border border-rose-300/15 bg-[#101827] p-6 shadow-2xl">
            <div className="text-lg font-semibold text-white">Confirm account deletion</div>
            <p className="mt-2 text-sm leading-6 text-slate-400">This permanently removes the admin account and allows a new registration. This cannot be undone.</p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setShowDelete(false)} disabled={deleteLoading} className="flex-1 rounded-2xl border border-white/[0.09] bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.075] disabled:opacity-50">Cancel</button>
              <button onClick={handleDelete} disabled={deleteLoading} className="flex-1 rounded-2xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-400 disabled:opacity-50">{deleteLoading ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
