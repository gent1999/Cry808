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

// ── Monthly Overview (revenue vs. expenses, last 6 months) ───────────────────
// SVG line/area chart — revenue gets the filled area treatment (primary
// series), expenses is a thin reference line on the same scale.
function MonthlyChart({ data }) {
  if (!data || data.length === 0) return null;

  const W = 640, H = 150, PAD_X = 8, PAD_Y = 10;
  const n    = data.length;
  const max  = Math.max(1, ...data.flatMap(m => [m.revenue, m.expenses]));
  const xFor = i => n > 1 ? PAD_X + (i / (n - 1)) * (W - PAD_X * 2) : W / 2;
  const yFor = v => H - PAD_Y - (v / max) * (H - PAD_Y * 2);

  const linePath = key => data.map((m, i) => `${i === 0 ? 'M' : 'L'}${xFor(i).toFixed(1)},${yFor(m[key]).toFixed(1)}`).join(' ');
  const areaPath = key => `${linePath(key)} L${xFor(n - 1).toFixed(1)},${H - PAD_Y} L${xFor(0).toFixed(1)},${H - PAD_Y} Z`;

  const last = data[n - 1];

  return (
    <div className="bg-gray-950 border border-gray-800">
      <div className="px-4 py-2 border-b border-gray-800 flex items-center justify-between">
        <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Monthly Overview</span>
        <div className="flex items-center gap-3 text-[10px] font-mono text-gray-500">
          <span className="font-bold text-green-400">{fmt(last.revenue)} this month</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 inline-block bg-green-500" />Revenue</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-2.5 inline-block bg-red-500" />Expenses</span>
        </div>
      </div>
      <div className="px-4 pb-1 pt-3">
        {/* Text lives outside the SVG so it never gets non-uniformly
            stretched/squished by the viewBox scaling to the container width. */}
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: '150px' }} preserveAspectRatio="none">
          <defs>
            <linearGradient id="financeRevGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#22c55e" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* horizontal gridlines */}
          {[0.25, 0.5, 0.75].map(p => (
            <line key={p} x1={PAD_X} x2={W - PAD_X} y1={H - PAD_Y - p * (H - PAD_Y * 2)} y2={H - PAD_Y - p * (H - PAD_Y * 2)}
              stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          ))}

          {/* revenue — area + line */}
          <path d={areaPath('revenue')} fill="url(#financeRevGrad)" />
          <path d={linePath('revenue')} fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />

          {/* expenses — thin reference line */}
          <path d={linePath('expenses')} fill="none" stroke="#f87171" strokeWidth="1.5" strokeDasharray="3 3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />

          {/* point markers */}
          {data.map((m, i) => (
            <circle key={m.month} cx={xFor(i)} cy={yFor(m.revenue)} r={i === n - 1 ? 3 : 2}
              fill="#070b12" stroke="#22c55e" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          ))}
        </svg>
        <div className="flex justify-between px-1">
          {data.map(m => (
            <span key={m.month} className="flex-1 text-center text-[9px] font-mono uppercase tracking-wider text-gray-600">
              {m.label}
            </span>
          ))}
        </div>
      </div>
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

          {/* Monthly Overview chart */}
          <MonthlyChart data={s.monthlyTrend} />

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
