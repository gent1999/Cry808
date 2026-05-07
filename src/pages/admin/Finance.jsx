import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

// ── Shared nav (used by all Finance sub-pages) ────────────────────────────────
const NAV = [
  { path: '/admin/finance',          label: 'Overview' },
  { path: '/admin/finance/revenue',  label: 'Revenue' },
  { path: '/admin/finance/payouts',  label: 'Payouts' },
  { path: '/admin/finance/expenses', label: 'Expenses' },
  { path: '/admin/finance/sources',  label: 'Sources' },
];

export function FinanceHeader({ active }) {
  const navigate = useNavigate();
  return (
    <header className="bg-black border-b border-gray-800 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 h-11 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="text-xs text-gray-600 hover:text-gray-300 transition-colors font-mono tracking-wider uppercase"
          >
            ← Dashboard
          </button>
          <span className="text-gray-800">│</span>
          <span className="text-xs font-mono font-bold text-green-500 tracking-widest uppercase">
            Revenue Command
          </span>
        </div>
        <nav className="flex">
          {NAV.map(n => (
            <button
              key={n.path}
              onClick={() => navigate(n.path)}
              className={`px-4 h-11 text-xs font-mono tracking-wider uppercase transition-colors border-b-2 ${
                active === n.label
                  ? 'text-white border-green-500 bg-gray-900'
                  : 'text-gray-600 border-transparent hover:text-gray-300 hover:border-gray-700'
              }`}
            >
              {n.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt   = n  => `$${(+n || 0).toFixed(2)}`;
const fmtTs = ts => {
  if (!ts) return '—';
  const d = new Date(ts);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  if (isToday) return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  if (isYesterday) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusBar({ summary, sources, lastUpdate }) {
  const activeSources = sources.filter(s => s.status === 'active').length;
  const soonestRenewal = summary?.upcomingRenewals?.[0];
  const readyPayouts = summary?.payoutProgressBySource?.filter(p => p.ready).length ?? 0;

  const Chip = ({ label, value, accent = 'text-gray-300', dimLabel = true }) => (
    <div className="flex items-center gap-2 flex-shrink-0">
      <span className={`text-xs font-mono ${dimLabel ? 'text-gray-600' : 'text-gray-500'} uppercase tracking-wider`}>{label}</span>
      <span className={`text-xs font-mono font-bold ${accent}`}>{value}</span>
    </div>
  );

  return (
    <div className="bg-black border-b border-gray-900 px-4 py-2 overflow-x-auto">
      <div className="max-w-7xl mx-auto flex items-center gap-6 min-w-0">
        {/* Online indicator */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_6px_#22c55e]" />
          <span className="text-xs font-mono font-bold text-green-500 tracking-widest">ONLINE</span>
        </div>
        <div className="w-px h-3 bg-gray-800 flex-shrink-0" />
        <Chip label="Month Net" value={fmt(summary?.currentMonthRevenue)} accent="text-green-400" />
        <div className="w-px h-3 bg-gray-800 flex-shrink-0" />
        <Chip label="Pending" value={fmt(summary?.pendingRevenue)} accent="text-yellow-400" />
        <div className="w-px h-3 bg-gray-800 flex-shrink-0" />
        {readyPayouts > 0
          ? <Chip label="Payouts Ready" value={readyPayouts} accent="text-green-400" />
          : <Chip label="Active Sources" value={activeSources} accent="text-blue-400" />
        }
        <div className="w-px h-3 bg-gray-800 flex-shrink-0" />
        {soonestRenewal
          ? <Chip
              label="Next Renewal"
              value={`${soonestRenewal.name} · ${soonestRenewal.daysUntil}d`}
              accent={soonestRenewal.daysUntil <= 14 ? 'text-red-400' : 'text-yellow-400'}
            />
          : <Chip label="Renewals" value="None Soon" accent="text-gray-500" />
        }
        <div className="w-px h-3 bg-gray-800 flex-shrink-0" />
        <Chip label="Updated" value={lastUpdate ? new Date(lastUpdate).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'}) : '—'} accent="text-gray-500" />
      </div>
    </div>
  );
}

function MissionCard({ label, value, sub, accentClass = '', borderClass = 'border-l-gray-700', trend }) {
  return (
    <div className={`bg-gray-950 border border-gray-800 border-l-2 ${borderClass} px-4 py-3 flex flex-col justify-between min-h-[80px]`}>
      <div className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mb-2">{label}</div>
      <div className="flex items-end justify-between">
        <div className={`text-2xl font-bold font-mono ${accentClass}`}>{value}</div>
        {trend !== undefined && (
          <div className={`text-xs font-mono ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(0)}%
          </div>
        )}
      </div>
      {sub && <div className="text-[10px] font-mono text-gray-700 mt-1">{sub}</div>}
    </div>
  );
}

function PayoutRadar({ payouts, onNavigate }) {
  if (!payouts || payouts.length === 0) return null;

  const urgency = (p) => {
    if (p.ready)         return { label: 'READY TO CASH OUT', color: 'text-green-400', bar: 'bg-green-500' };
    if (p.progress >= 75) return { label: 'CLOSE TO PAYOUT',  color: 'text-yellow-400', bar: 'bg-yellow-500' };
    if (p.progress > 0)   return { label: 'BUILDING',          color: 'text-blue-400',   bar: 'bg-blue-600' };
    return                       { label: 'INACTIVE',           color: 'text-gray-600',   bar: 'bg-gray-700' };
  };

  return (
    <div className="bg-gray-950 border border-gray-800">
      <div className="px-4 py-2 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-1 h-4 bg-purple-500 inline-block" />
          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Payout Radar</span>
        </div>
        <button onClick={onNavigate} className="text-[10px] font-mono text-gray-700 hover:text-gray-400 transition-colors uppercase tracking-wider">
          View All →
        </button>
      </div>
      <div className="divide-y divide-gray-800/60">
        {payouts.map(p => {
          const u = urgency(p);
          return (
            <div key={p.sourceId} className="px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${p.ready ? 'bg-green-500 shadow-[0_0_6px_#22c55e]' : p.progress > 0 ? 'bg-blue-500' : 'bg-gray-700'}`} />
                  <span className="text-sm font-mono font-medium text-white">{p.sourceName}</span>
                  <span className={`text-[9px] font-mono font-bold uppercase tracking-widest ${u.color}`}>{u.label}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-white">{fmt(p.pendingBalance)}</span>
                  <span className="text-xs font-mono text-gray-700"> / {fmt(p.threshold)}</span>
                </div>
              </div>
              <div className="h-1 bg-gray-800 overflow-hidden">
                <div className={`h-full transition-all ${u.bar}`} style={{ width: `${p.progress}%` }} />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] font-mono text-gray-700">{p.progress}%</span>
                {!p.ready && p.remaining > 0 &&
                  <span className="text-[10px] font-mono text-gray-600">{fmt(p.remaining)} remaining</span>
                }
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StreamHealth({ sources, onNavigate }) {
  if (!sources || sources.length === 0) return null;

  const indicator = (s) => {
    if (s.status === 'inactive') return { dot: 'bg-gray-700',   label: 'INACTIVE',   color: 'text-gray-600' };
    if (s.status === 'pending')  return { dot: 'bg-yellow-500', label: 'PENDING',     color: 'text-yellow-500' };
    if (+s.lifetime_net > 0)     return { dot: 'bg-green-500 shadow-[0_0_4px_#22c55e]', label: 'ACTIVE', color: 'text-green-400' };
    return                              { dot: 'bg-gray-600',   label: 'NO DATA',    color: 'text-gray-500' };
  };

  return (
    <div className="bg-gray-950 border border-gray-800">
      <div className="px-4 py-2 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-1 h-4 bg-blue-500 inline-block" />
          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Revenue Streams</span>
        </div>
        <button onClick={onNavigate} className="text-[10px] font-mono text-gray-700 hover:text-gray-400 transition-colors uppercase tracking-wider">
          Manage →
        </button>
      </div>
      <div className="divide-y divide-gray-800/60">
        {sources.map(s => {
          const ind = indicator(s);
          return (
            <div key={s.id} className="px-4 py-2.5 grid grid-cols-[auto_1fr_auto] gap-3 items-center">
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${ind.dot}`} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-medium text-white">{s.name}</span>
                  <span className={`text-[9px] font-mono uppercase tracking-widest font-bold ${ind.color}`}>{ind.label}</span>
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-[10px] font-mono text-gray-600">
                    Net: <span className="text-gray-400">{fmt(s.lifetime_net)}</span>
                  </span>
                  <span className="text-[10px] font-mono text-gray-700">·</span>
                  <span className="text-[10px] font-mono text-gray-600">
                    {s.entry_count} {+s.entry_count === 1 ? 'entry' : 'entries'}
                  </span>
                  {s.last_entry_date && (
                    <>
                      <span className="text-[10px] font-mono text-gray-700">·</span>
                      <span className="text-[10px] font-mono text-gray-600">
                        Last: {new Date(s.last_entry_date).toLocaleDateString('en-US',{month:'short',day:'numeric'})}
                      </span>
                    </>
                  )}
                </div>
              </div>
              {+s.current_balance > 0 && (
                <div className="text-right">
                  <div className="text-[10px] font-mono text-gray-600 uppercase">Balance</div>
                  <div className="text-xs font-mono text-yellow-400">{fmt(s.current_balance)}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RenewalWatch({ renewals, expenses, onNavigate }) {
  const recurring = expenses?.filter(e => e.billing_cycle !== 'one_time') || [];
  const alerts    = renewals?.filter(r => r.daysUntil <= 30) || [];

  return (
    <div className="bg-gray-950 border border-gray-800">
      <div className="px-4 py-2 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-1 h-4 bg-red-600 inline-block" />
          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Renewal Watch</span>
        </div>
        <button onClick={onNavigate} className="text-[10px] font-mono text-gray-700 hover:text-gray-400 transition-colors uppercase tracking-wider">
          All Expenses →
        </button>
      </div>
      {alerts.length === 0 && recurring.length === 0 ? (
        <div className="px-4 py-4 text-[10px] font-mono text-gray-700 uppercase tracking-wider">No upcoming renewals</div>
      ) : (
        <div className="divide-y divide-gray-800/60">
          {alerts.map(r => (
            <div key={r.id} className="px-4 py-2.5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  {r.daysUntil <= 7  && <span className="text-[9px] font-mono text-red-400 font-bold uppercase tracking-wider border border-red-800 px-1">CRITICAL</span>}
                  {r.daysUntil > 7 && r.daysUntil <= 14 && <span className="text-[9px] font-mono text-orange-400 font-bold uppercase tracking-wider border border-orange-900 px-1">URGENT</span>}
                  {r.daysUntil > 14  && <span className="text-[9px] font-mono text-yellow-600 font-bold uppercase tracking-wider border border-yellow-900 px-1">SOON</span>}
                  <span className="text-xs font-mono text-white">{r.name}</span>
                </div>
                <div className="text-[10px] font-mono text-gray-600 mt-0.5">
                  {new Date(r.renewalDate).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono text-white">{fmt(r.amount)}</div>
                <div className={`text-[10px] font-mono font-bold mt-0.5 ${r.daysUntil <= 7 ? 'text-red-400' : r.daysUntil <= 14 ? 'text-orange-400' : 'text-yellow-400'}`}>
                  {r.daysUntil}d
                </div>
              </div>
            </div>
          ))}
          {recurring.slice(0, 3).map(e => (
            <div key={e.id} className="px-4 py-2.5 flex items-center justify-between opacity-60">
              <div>
                <div className="text-xs font-mono text-gray-400">{e.name}</div>
                <div className="text-[10px] font-mono text-gray-700 capitalize">{e.billing_cycle?.replace(/_/g,' ')}</div>
              </div>
              <div className="text-xs font-mono text-gray-500">{fmt(e.amount)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AlertStrip({ summary, sources }) {
  const alerts = [];

  summary?.payoutProgressBySource?.forEach(p => {
    if (p.ready) alerts.push({ level: 'green', text: `${p.sourceName} ready for payout — ${fmt(p.pendingBalance)}` });
  });
  summary?.upcomingRenewals?.filter(r => r.daysUntil <= 14).forEach(r => {
    alerts.push({ level: 'red', text: `${r.name} renews in ${r.daysUntil} days — ${fmt(r.amount)}` });
  });
  if (+summary?.currentMonthRevenue === 0) {
    alerts.push({ level: 'yellow', text: 'No revenue logged this month yet' });
  }
  sources?.filter(s => s.status === 'pending').forEach(s => {
    alerts.push({ level: 'yellow', text: `${s.name} pending approval` });
  });
  if (+summary?.totalExpenses > +summary?.totalNetRevenue && +summary?.totalNetRevenue > 0) {
    alerts.push({ level: 'red', text: 'Expenses exceed net revenue — review spending' });
  }

  if (alerts.length === 0) return null;

  const colors = {
    green:  'border-green-900/60 bg-green-950/20 text-green-400',
    yellow: 'border-yellow-900/60 bg-yellow-950/20 text-yellow-400',
    red:    'border-red-900/60 bg-red-950/20 text-red-400',
  };

  return (
    <div className="flex flex-wrap gap-2">
      {alerts.map((a, i) => (
        <div key={i} className={`flex items-center gap-1.5 border px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider ${colors[a.level]}`}>
          <span className={`w-1 h-1 rounded-full inline-block flex-shrink-0 ${a.level === 'green' ? 'bg-green-400' : a.level === 'red' ? 'bg-red-400' : 'bg-yellow-400'}`} />
          {a.text}
        </div>
      ))}
    </div>
  );
}

function ActivityFeed({ activity }) {
  if (!activity || activity.length === 0) {
    return (
      <div className="bg-gray-950 border border-gray-800">
        <div className="px-4 py-2 border-b border-gray-800 flex items-center gap-2">
          <span className="w-1 h-4 bg-gray-600 inline-block" />
          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Activity Feed</span>
        </div>
        <div className="px-4 py-6 text-center text-[10px] font-mono text-gray-700 uppercase tracking-wider">No activity yet</div>
      </div>
    );
  }

  const icons = { revenue: '+', payout: '↑', expense: '-' };
  const colors = {
    revenue: 'text-green-400',
    payout:  'text-purple-400',
    expense: 'text-red-400',
  };

  return (
    <div className="bg-gray-950 border border-gray-800">
      <div className="px-4 py-2 border-b border-gray-800 flex items-center gap-2">
        <span className="w-1 h-4 bg-gray-600 inline-block" />
        <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Activity Feed</span>
      </div>
      <div className="divide-y divide-gray-800/40">
        {activity.map((a, i) => (
          <div key={i} className="px-4 py-2 flex items-start gap-3">
            <span className={`text-xs font-mono font-bold flex-shrink-0 mt-0.5 ${colors[a.kind]}`}>
              {icons[a.kind]}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-mono text-gray-300 truncate">{a.label}</div>
              {a.detail && <div className="text-[10px] font-mono text-gray-600 truncate mt-0.5">{a.detail}</div>}
            </div>
            <span className="text-[10px] font-mono text-gray-700 flex-shrink-0">{fmtTs(a.created_at)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActionDock({ navigate }) {
  const actions = [
    { label: '+ Log Revenue',  path: '/admin/finance/revenue',  accent: 'border-green-800 hover:border-green-600 hover:bg-green-950/40 text-green-400', icon: '💰' },
    { label: '+ Log Payout',   path: '/admin/finance/payouts',  accent: 'border-purple-800 hover:border-purple-600 hover:bg-purple-950/40 text-purple-400', icon: '↑' },
    { label: '+ Log Expense',  path: '/admin/finance/expenses', accent: 'border-red-800 hover:border-red-600 hover:bg-red-950/40 text-red-400', icon: '−' },
    { label: 'Manage Sources', path: '/admin/finance/sources',  accent: 'border-gray-700 hover:border-gray-500 hover:bg-gray-800/60 text-gray-400', icon: '⚙' },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {actions.map(a => (
        <button
          key={a.path}
          onClick={() => navigate(a.path)}
          className={`bg-gray-950 border ${a.accent} px-4 py-3 text-left transition-all duration-150 group`}
        >
          <div className="text-lg mb-1 opacity-60 group-hover:opacity-100 transition-opacity">{a.icon}</div>
          <div className="text-[10px] font-mono uppercase tracking-widest font-bold">{a.label}</div>
        </button>
      ))}
    </div>
  );
}

// ── Main Overview Page ────────────────────────────────────────────────────────
export default function Finance() {
  const navigate = useNavigate();
  const [loading,  setLoading]  = useState(true);
  const [summary,  setSummary]  = useState(null);
  const [sources,  setSources]  = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [activity, setActivity] = useState([]);
  const [error,    setError]    = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);

  const load = useCallback(async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) { navigate('/admin/login'); return; }

    try {
      const hdrs = { Authorization: `Bearer ${token}` };
      const [sumRes, srcRes, expRes, actRes] = await Promise.all([
        fetch(`${API_URL}/api/finance/summary`,  { headers: hdrs }),
        fetch(`${API_URL}/api/finance/sources`,  { headers: hdrs }),
        fetch(`${API_URL}/api/finance/expenses`, { headers: hdrs }),
        fetch(`${API_URL}/api/finance/activity`, { headers: hdrs }),
      ]);

      if ([sumRes, srcRes, expRes, actRes].some(r => r.status === 401)) {
        navigate('/admin/login'); return;
      }

      const [sum, src, exp, act] = await Promise.all([
        sumRes.json(), srcRes.json(), expRes.json(), actRes.json(),
      ]);

      setSummary(sum);
      setSources(src.sources || []);
      setExpenses(exp.expenses || []);
      setActivity(act.activity || []);
      setLastUpdate(new Date().toISOString());
    } catch (e) { setError(e.message); }
    finally    { setLoading(false); }
  }, [navigate]);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="flex items-center gap-3">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">Initializing revenue systems...</span>
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
  const mProfitPositive = +s.currentMonthProfit >= 0;

  const monthTrend = +s.lastMonthRevenue > 0
    ? Math.round(((+s.currentMonthRevenue - +s.lastMonthRevenue) / +s.lastMonthRevenue) * 100)
    : undefined;

  return (
    <div className="min-h-screen bg-black text-white">
      <FinanceHeader active="Overview" />
      <StatusBar summary={s} sources={sources} lastUpdate={lastUpdate} />

      <main className="max-w-7xl mx-auto px-4 py-5 space-y-4">

        {/* Alert Strip */}
        <AlertStrip summary={s} sources={sources} />

        {/* Mission Summary Grid */}
        <section>
          <div className="text-[10px] font-mono text-gray-700 uppercase tracking-widest mb-2">Mission Summary</div>
          <div className="grid grid-cols-4 gap-px bg-gray-800 sm:grid-cols-2 lg:grid-cols-4">
            <MissionCard label="Gross Revenue"   value={fmt(s.totalGrossRevenue)} borderClass="border-l-gray-600" />
            <MissionCard label="Net Revenue"     value={fmt(s.totalNetRevenue)}   borderClass="border-l-green-700" accentClass="text-green-400" sub="After all fees" />
            <MissionCard label="Paid Out"        value={fmt(s.paidRevenue)}       borderClass="border-l-green-800" accentClass="text-green-400" />
            <MissionCard label="Pending"         value={fmt(s.pendingRevenue)}    borderClass="border-l-yellow-700" accentClass="text-yellow-400" sub="Awaiting payment" />
          </div>
          <div className="grid grid-cols-4 gap-px bg-gray-800 mt-px sm:grid-cols-2 lg:grid-cols-4">
            <MissionCard label="Total Expenses"   value={fmt(s.totalExpenses)}      borderClass="border-l-red-800"    accentClass="text-red-400" />
            <MissionCard label="Lifetime Profit"  value={fmt(s.lifetimeProfit)}     borderClass={profitPositive ? 'border-l-green-600' : 'border-l-red-600'} accentClass={profitPositive ? 'text-green-400' : 'text-red-400'} sub="Net minus expenses" />
            <MissionCard label="This Month"       value={fmt(s.currentMonthRevenue)} borderClass="border-l-blue-800" trend={monthTrend} sub={`Last: ${fmt(s.lastMonthRevenue)}`} />
            <MissionCard label="Month Profit"     value={fmt(s.currentMonthProfit)} borderClass={mProfitPositive ? 'border-l-green-800' : 'border-l-red-800'} accentClass={mProfitPositive ? 'text-green-400' : 'text-red-400'} sub={`Exp/mo: ${fmt(s.monthlyExpenses)}`} />
          </div>
        </section>

        {/* Middle row: Payout Radar + Stream Health */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-2 sm:grid-cols-1">
          <PayoutRadar payouts={s.payoutProgressBySource} onNavigate={() => navigate('/admin/finance/payouts')} />
          <StreamHealth sources={sources} onNavigate={() => navigate('/admin/finance/sources')} />
        </div>

        {/* Bottom row: Renewal Watch + Activity + Actions */}
        <div className="grid grid-cols-3 gap-4 lg:grid-cols-3 sm:grid-cols-1">
          <RenewalWatch
            renewals={s.upcomingRenewals}
            expenses={expenses}
            onNavigate={() => navigate('/admin/finance/expenses')}
          />
          <div className="col-span-2 sm:col-span-1 space-y-4">
            <ActionDock navigate={navigate} />
            <ActivityFeed activity={activity} />
          </div>
        </div>

      </main>
    </div>
  );
}
