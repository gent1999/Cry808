import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import TransactionModal from './TransactionModal';

const API_URL = import.meta.env.VITE_API_URL;

// ── Shared nav (used by all Finance sub-pages) ────────────────────────────────
const NAV = [
  { path: '/admin/finance',              label: 'Overview' },
  { path: '/admin/finance/transactions', label: 'Transactions' },
  { path: '/admin/finance/sources',      label: 'Sources' },
];

// Compact horizontal tab row shown only below the lg breakpoint, where the
// fixed 264px FinanceSidePanel is hidden to avoid squeezing/overflowing content.
export function FinanceMobileNav({ active }) {
  const navigate = useNavigate();
  return (
    <div className="relative z-10 scrollbar-none flex gap-1 overflow-x-auto border-b border-white/[0.07] bg-[#0b1019]/95 px-3 py-2 lg:hidden">
      {NAV.map(item => (
        <button
          key={item.path}
          onClick={() => navigate(item.path)}
          className={`flex-shrink-0 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
            active === item.label ? 'bg-emerald-300/10 text-emerald-200' : 'text-slate-400 hover:text-white'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function FinanceHeader({ active, sources = [] }) {
  const navigate = useNavigate();
  return (
    <>
      <FinanceSidePanel active={active} summary={null} sources={sources} />
      <FinanceMobileNav active={active} />
      <header className="finance-subpage-topbar sticky top-0 z-20 border-b border-white/[0.07] bg-[#070b12]/82 px-4 py-3 backdrop-blur-xl sm:px-8">
        <div className="flex h-8 items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="hidden text-xs text-slate-500 hover:text-slate-200 transition-colors font-semibold tracking-[.16em] uppercase sm:inline"
            >
              ? Dashboard
            </button>
            <span className="hidden text-white/[0.15] sm:inline">|</span>
            <span className="text-xs font-bold text-emerald-300 tracking-[.18em] uppercase">
              Finance / {active}
            </span>
          </div>
        </div>
      </header>
    </>
  );
}

export function FinanceSidePanel({ active, summary, sources = [] }) {
  const navigate = useNavigate();
  const activeSources = sources.filter(s => s.status === 'active').length;

  return (
    <aside className="finance-side-panel fixed inset-y-0 left-0 z-30 hidden w-[264px] flex-col border-r border-white/[0.07] bg-[#0b1019]/95 px-4 py-5 shadow-[20px_0_80px_rgba(0,0,0,.34)] backdrop-blur-xl lg:flex">
      <button onClick={() => navigate('/admin/dashboard')} className="mb-7 text-left">
        <div className="text-[11px] font-semibold uppercase tracking-[.2em] text-slate-500">Back To</div>
        <div className="mt-1 text-lg font-semibold tracking-tight text-white">Dashboard</div>
      </button>

      <div className="mb-6 border border-white/[0.07] bg-white/[0.035] p-4">
        <div className="text-[11px] font-semibold uppercase tracking-[.18em] text-emerald-300">Finance</div>
        <div className="mt-3 text-3xl font-semibold text-white">{summary ? fmt(summary.lifetimeProfit) : 'Control'}</div>
        <div className="mt-1 text-sm text-slate-500">{summary ? 'Lifetime profit' : 'Financial command'}</div>
      </div>

      <nav className="flex-1 space-y-1.5">
        {NAV.map(item => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-full border px-3 py-3 text-left transition ${
              active === item.label
                ? 'border-emerald-300/25 bg-emerald-300/10 text-white shadow-[0_16px_44px_rgba(16,185,129,.12)]'
                : 'border-transparent text-slate-400 hover:border-white/[0.07] hover:bg-white/[0.04] hover:text-white'
            }`}
          >
            <div className="text-sm font-semibold">{item.label}</div>
          </button>
        ))}
      </nav>

      <div className="border border-white/[0.07] bg-white/[0.035] p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Active sources</span>
          <span className="font-semibold text-sky-300">{activeSources}</span>
        </div>
      </div>
    </aside>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt   = n  => `$${(+n || 0).toFixed(2)}`;
const fmtTs = ts => {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// ── KPI card ──────────────────────────────────────────────────────────────────
function KpiCard({ label, value, accentClass = 'text-white', primary = false }) {
  return (
    <div className={`bg-gray-950 border px-4 py-4 flex flex-col justify-between min-h-[84px] ${primary ? 'border-emerald-700/60' : 'border-gray-800'}`}>
      <div className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mb-2">{label}</div>
      <div className={`font-bold font-mono ${primary ? 'text-3xl' : 'text-2xl'} ${accentClass}`}>{value}</div>
    </div>
  );
}

// ── Monthly Overview (revenue vs. expenses, 12-month window) ─────────────────
// Same visual system as AdminDashboard's TrafficChart: multi-color gradient
// line, gradient area fill, Y-axis gridlines, and a hover tooltip. Expenses
// rides along as a thin secondary reference line. Range selector top-right
// switches between a rolling last-12-months view and any calendar year that
// actually has data (new years appear on their own once they start).
function MonthlyChart({ data, range, availableYears, onRangeChange }) {
  const [hovered, setHovered] = useState(null);
  if (!data || data.length === 0) return null;

  const n     = data.length;
  const max   = Math.max(1, ...data.flatMap(m => [m.revenue, m.expenses]));
  const chartWidth  = 640;
  const chartHeight = 220;
  const left = 48, right = 12, top = 16, bottom = 28;
  const plotWidth  = chartWidth - left - right;
  const plotHeight = chartHeight - top - bottom;
  const divisor = Math.max(n - 1, 1);

  const pointsFor = key => data.map((m, i) => [
    left + (i / divisor) * plotWidth,
    top + plotHeight - (Math.max(0, m[key]) / max) * plotHeight,
  ]);
  const revPoints = pointsFor('revenue');
  const expPoints = pointsFor('expenses');
  const pathFor   = pts => pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ');
  const revLine   = pathFor(revPoints);
  const revArea   = `${revLine} L ${revPoints.at(-1)[0]} ${chartHeight - bottom} L ${revPoints[0][0]} ${chartHeight - bottom} Z`;
  const expLine   = pathFor(expPoints);

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(ratio => ({
    y: top + plotHeight - ratio * plotHeight,
    value: Math.round(max * ratio),
  }));
  const labelStep = Math.max(1, Math.ceil(n / 9));

  return (
    <div className="bg-gray-950 border border-gray-800">
      <div className="px-4 py-2 border-b border-gray-800 flex flex-wrap items-center justify-between gap-2">
        <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Monthly Overview</span>
        <div className="flex items-center gap-3 text-[10px] font-mono text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 inline-block rounded-full" style={{ background: 'linear-gradient(90deg,#38bdf8,#8b5cf6,#34d399)' }} />
            Revenue
          </span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-2.5 inline-block bg-red-400/70" />Expenses</span>
          <select
            value={range}
            onChange={e => onRangeChange(e.target.value)}
            className="bg-gray-900 border border-gray-700 text-gray-300 text-[10px] font-mono uppercase tracking-wider px-2 py-1 cursor-pointer focus:outline-none focus:border-gray-500"
          >
            <option value="last12">Last 12 Months</option>
            {availableYears.map(y => <option key={y} value={y}>{y} · 12 Months</option>)}
          </select>
        </div>
      </div>
      <div className="relative px-3 py-4">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full overflow-visible" style={{ height: '200px' }}>
          <defs>
            <linearGradient id="financeLineGrad" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%"  stopColor="#38bdf8" />
              <stop offset="55%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
            <linearGradient id="financeAreaGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%"   stopColor="#8b5cf6" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
            </linearGradient>
          </defs>

          {yTicks.map(({ y, value }) => (
            <g key={y}>
              <line x1={left} x2={chartWidth - right} y1={y} y2={y} stroke="rgba(148,163,184,.1)" />
              <text x="0" y={y + 4} fill="rgba(148,163,184,.55)" fontSize="11">{fmt(value)}</text>
            </g>
          ))}

          <path d={revArea} fill="url(#financeAreaGrad)" />
          <path d={expLine} fill="none" stroke="#f87171" strokeWidth="1.5" strokeDasharray="3 3" strokeLinecap="round" strokeLinejoin="round" />
          <path d={revLine} fill="none" stroke="url(#financeLineGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {revPoints.map(([x, y], i) => (
            <g key={data[i].month}>
              <circle cx={x} cy={y} r="4" fill="#0f172a" stroke="#a78bfa" strokeWidth="2" />
              <circle
                cx={x} cy={y} r="14" fill="transparent" className="cursor-crosshair"
                onMouseEnter={() => setHovered({ i, left: `${(x / chartWidth) * 100}%`, top: `${(y / chartHeight) * 100}%` })}
                onMouseLeave={() => setHovered(null)}
              />
              {(i % labelStep === 0 || i === n - 1) && (
                <text x={x} y={chartHeight - 8} textAnchor="middle" fill="rgba(148,163,184,.65)" fontSize="12">{data[i].label}</text>
              )}
            </g>
          ))}
        </svg>
        {hovered && (
          <div
            className="pointer-events-none absolute z-10 border border-white/[0.1] bg-[#060b13]/95 px-3 py-2 text-xs shadow-[0_18px_48px_rgba(0,0,0,.42)] backdrop-blur-md"
            style={{ left: hovered.left, top: hovered.top, transform: 'translate(-50%, calc(-100% - 12px))' }}
          >
            <div className="font-semibold text-green-400">{fmt(data[hovered.i].revenue)} revenue</div>
            <div className="text-red-400">{fmt(data[hovered.i].expenses)} expenses</div>
            <div className="mt-0.5 text-slate-500">{data[hovered.i].label}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Revenue by Source (where the money actually comes from) ──────────────────
// Reuses the same sources list already fetched for the sidebar/Balances —
// no extra request. Only sources with real lifetime earnings show up.
function RevenueBySource({ sources, onNavigate }) {
  const ranked = (sources || [])
    .filter(s => +s.lifetime_net > 0)
    .sort((a, b) => +b.lifetime_net - +a.lifetime_net);
  const total = ranked.reduce((sum, s) => sum + +s.lifetime_net, 0) || 1;
  const BAR_COLORS = ['#34d399', '#38bdf8', '#a78bfa', '#f59e0b', '#f87171', '#22d3ee'];

  return (
    <div className="bg-gray-950 border border-gray-800">
      <div className="px-4 py-2 border-b border-gray-800 flex items-center justify-between">
        <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Revenue by Source</span>
        <button onClick={onNavigate} className="text-[10px] font-mono text-gray-700 hover:text-gray-400 transition-colors uppercase tracking-wider">
          Sources →
        </button>
      </div>
      {ranked.length === 0 ? (
        <div className="px-4 py-5 text-[10px] font-mono text-gray-700 uppercase tracking-wider">No revenue logged yet</div>
      ) : (
        <div className="divide-y divide-gray-800/60">
          {ranked.map((s, i) => {
            const pct = Math.round((+s.lifetime_net / total) * 100);
            return (
              <div key={s.id} className="px-4 py-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-mono font-medium text-white">{s.name}</span>
                  <span className="text-xs font-mono text-gray-400">{fmt(s.lifetime_net)} <span className="text-gray-700">· {pct}%</span></span>
                </div>
                <div className="h-1 bg-gray-800 overflow-hidden">
                  <div className="h-full" style={{ width: `${pct}%`, backgroundColor: BAR_COLORS[i % BAR_COLORS.length] }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Balances (only sources that actually have money waiting) ─────────────────
function Balances({ balances, onNavigate }) {
  return (
    <div className="bg-gray-950 border border-gray-800">
      <div className="px-4 py-2 border-b border-gray-800 flex items-center justify-between">
        <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Balances</span>
        {balances.length > 0 && (
          <button onClick={onNavigate} className="text-[10px] font-mono text-gray-700 hover:text-gray-400 transition-colors uppercase tracking-wider">
            Sources →
          </button>
        )}
      </div>
      {balances.length === 0 ? (
        <div className="px-4 py-5 text-[10px] font-mono text-gray-700 uppercase tracking-wider">Nothing waiting for payout</div>
      ) : (
        <div className="divide-y divide-gray-800/60">
          {balances.map(p => (
            <div key={p.sourceId} className="px-4 py-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-mono font-medium text-white">{p.sourceName}</span>
                <span className="text-xs font-mono text-white">{fmt(p.pendingBalance)} <span className="text-gray-700">/ {fmt(p.threshold)}</span></span>
              </div>
              <div className="h-1 bg-gray-800 overflow-hidden">
                <div className={`h-full ${p.ready ? 'bg-green-500' : 'bg-blue-600'}`} style={{ width: `${p.progress}%` }} />
              </div>
              <div className="mt-1 text-[10px] font-mono text-gray-600">
                {p.ready ? 'Ready to cash out' : `${fmt(p.remaining)} to payout`}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Upcoming Costs — never shows a past-due/negative countdown ───────────────
function UpcomingCosts({ renewals }) {
  return (
    <div className="bg-gray-950 border border-gray-800">
      <div className="px-4 py-2 border-b border-gray-800 flex items-center gap-2">
        <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Upcoming Costs</span>
      </div>
      {!renewals || renewals.length === 0 ? (
        <div className="px-4 py-5 text-[10px] font-mono text-gray-700 uppercase tracking-wider">No upcoming costs</div>
      ) : (
        <div className="divide-y divide-gray-800/60">
          {renewals.slice(0, 5).map(r => (
            <div key={r.id} className="px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {r.daysUntil <= 14 && <span className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />}
                <div>
                  <div className="text-xs font-mono text-white">{r.name}</div>
                  <div className="text-[10px] font-mono text-gray-600">
                    {new Date(r.renewalDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>
              <span className="text-xs font-mono text-white">{fmt(r.amount)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Recent Activity ───────────────────────────────────────────────────────────
function RecentActivity({ activity, onNavigate }) {
  const KIND = {
    income:  { sign: '+', color: 'text-green-400' },
    expense: { sign: '-', color: 'text-red-400' },
    payout:  { sign: '+', color: 'text-purple-400' },
  };

  return (
    <div className="bg-gray-950 border border-gray-800">
      <div className="px-4 py-2 border-b border-gray-800 flex items-center justify-between">
        <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Recent Activity</span>
        <button onClick={onNavigate} className="text-[10px] font-mono text-gray-700 hover:text-gray-400 transition-colors uppercase tracking-wider">
          View All →
        </button>
      </div>
      {!activity || activity.length === 0 ? (
        <div className="px-4 py-6 text-center text-[10px] font-mono text-gray-700 uppercase tracking-wider">No activity yet</div>
      ) : (
        <div className="divide-y divide-gray-800/40">
          {activity.map(a => {
            const k = KIND[a.kind];
            return (
              <div key={`${a.kind}-${a.id}`} className="px-4 py-2.5 flex items-center gap-3">
                <span className="text-[10px] font-mono text-gray-600 flex-shrink-0 w-12">{fmtTs(a.date)}</span>
                <span className="text-xs font-mono text-gray-400 flex-shrink-0 w-24 truncate">{a.source_name}</span>
                <span className="text-xs font-mono text-gray-300 flex-1 truncate">{a.description}</span>
                <span className={`text-xs font-mono font-bold flex-shrink-0 ${k.color}`}>{k.sign}{fmt(Math.abs(a.amount))}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main Overview Page ────────────────────────────────────────────────────────
export default function Finance() {
  const navigate = useNavigate();
  const [loading,  setLoading]  = useState(true);
  const [summary,  setSummary]  = useState(null);
  const [sources,  setSources]  = useState([]);
  const [activity, setActivity] = useState([]);
  const [error,    setError]    = useState('');
  const [addOpen,  setAddOpen]  = useState(false);

  const [trendRange, setTrendRange] = useState('last12');
  const [trend,       setTrend]       = useState([]);
  const [trendYears,  setTrendYears]  = useState([]);

  const load = useCallback(async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) { navigate('/admin/login'); return; }

    try {
      const hdrs = { Authorization: `Bearer ${token}` };
      const [sumRes, srcRes, txRes] = await Promise.all([
        fetch(`${API_URL}/api/finance/summary`,  { headers: hdrs }),
        fetch(`${API_URL}/api/finance/sources`,  { headers: hdrs }),
        fetch(`${API_URL}/api/finance/transactions?limit=5`, { headers: hdrs }),
      ]);

      if ([sumRes, srcRes, txRes].some(r => r.status === 401)) {
        navigate('/admin/login'); return;
      }

      const [sum, src, tx] = await Promise.all([sumRes.json(), srcRes.json(), txRes.json()]);

      setSummary(sum);
      setSources(src.sources || []);
      setActivity(tx.transactions || []);
    } catch (e) { setError(e.message); }
    finally    { setLoading(false); }
  }, [navigate]);

  useEffect(() => { load(); }, [load]);

  const loadTrend = useCallback(async (range) => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    try {
      const r = await fetch(`${API_URL}/api/finance/monthly-trend?range=${range}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!r.ok) return;
      const d = await r.json();
      setTrend(d.trend || []);
      setTrendYears(d.availableYears || []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { loadTrend(trendRange); }, [trendRange, loadTrend]);

  if (loading) return (
    <div className="admin-command-center grid min-h-screen place-items-center bg-[#070b12] text-white">
      <div className="relative w-[360px] border border-white/[0.08] bg-[#0d1421]/90 p-7 shadow-[0_28px_90px_rgba(0,0,0,.45)]">
        <div className="mx-auto mb-5 grid h-16 w-16 place-items-center border border-white/[0.08] bg-white/[0.04]">
          <div className="admin-loader-ring" />
        </div>
        <div className="text-center text-sm font-semibold uppercase tracking-[.2em] text-white">Loading Finance</div>
        <div className="mt-2 text-center text-sm text-slate-500">Syncing revenue, expenses, and balances.</div>
        <div className="mt-6 grid gap-2">
          <div className="admin-loading-bar" />
          <div className="admin-loading-bar admin-loading-bar-delay" />
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-xs font-mono text-red-400 uppercase tracking-wider">System error: {error}</div>
    </div>
  );

  const s = summary;
  const profitPositive = +s.lifetimeProfit >= 0;
  const monthPositive  = +s.currentMonthProfit >= 0;
  const balances = (s.payoutProgressBySource || []).filter(p => +p.pendingBalance > 0);

  return (
    <div className="admin-command-center finance-command-center min-h-screen bg-[#070b12] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_25%_0%,rgba(16,185,129,.12),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,.12),transparent_30%),linear-gradient(180deg,#070b12_0%,#0a0f1a_48%,#070b12_100%)]" />
      <FinanceSidePanel active="Overview" summary={s} sources={sources} />
      <FinanceMobileNav active="Overview" />

      <div className="relative min-h-screen lg:ml-[264px]">
        <header className="sticky top-0 z-20 border-b border-white/[0.07] bg-[#070b12]/82 px-4 py-3 backdrop-blur-xl sm:px-8">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-bold text-emerald-300 tracking-[.18em] uppercase">Finance</span>
            <button onClick={() => setAddOpen(true)} className="bg-green-700 hover:bg-green-600 text-white text-sm px-4 py-2 transition-colors">
              + Add Transaction
            </button>
          </div>
        </header>

        <main className="finance-main px-4 py-7 space-y-5 sm:px-8">

          {/* KPI Grid — Lifetime Profit primary */}
          <section>
            <div className="grid grid-cols-2 gap-px bg-gray-800 sm:grid-cols-3 lg:grid-cols-5">
              <KpiCard label="Lifetime Profit" value={fmt(s.lifetimeProfit)} accentClass={profitPositive ? 'text-green-400' : 'text-red-400'} primary />
              <KpiCard label="Gross Income"    value={fmt(s.totalGrossRevenue)} accentClass="text-white" />
              <KpiCard label="Net Revenue"     value={fmt(s.totalNetRevenue)} accentClass="text-green-400" />
              <KpiCard label="Expenses"        value={fmt(s.totalExpenses)}   accentClass="text-red-400" />
              <KpiCard label="This Month"      value={`${monthPositive ? '+' : '-'}${fmt(Math.abs(s.currentMonthProfit))}`} accentClass={monthPositive ? 'text-green-400' : 'text-red-400'} />
            </div>
          </section>

          {/* Monthly Overview chart + Revenue by Source */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <MonthlyChart data={trend} range={trendRange} availableYears={trendYears} onRangeChange={setTrendRange} />
            <RevenueBySource sources={sources} onNavigate={() => navigate('/admin/finance/sources')} />
          </div>

          {/* Balances + Upcoming Costs */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Balances balances={balances} onNavigate={() => navigate('/admin/finance/sources')} />
            <UpcomingCosts renewals={s.upcomingRenewals} />
          </div>

          {/* Recent Activity */}
          <RecentActivity activity={activity} onNavigate={() => navigate('/admin/finance/transactions')} />
        </main>
      </div>

      {addOpen && (
        <TransactionModal
          mode="add"
          type="income"
          data={null}
          sources={sources}
          onClose={() => setAddOpen(false)}
          onSaved={() => { setAddOpen(false); load(); }}
        />
      )}
    </div>
  );
}
