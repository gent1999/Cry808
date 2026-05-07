import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

const NAV = [
  { path: '/admin/finance',         label: 'Overview' },
  { path: '/admin/finance/revenue', label: 'Revenue' },
  { path: '/admin/finance/payouts', label: 'Payouts' },
  { path: '/admin/finance/expenses',label: 'Expenses' },
  { path: '/admin/finance/sources', label: 'Sources' },
];

export function FinanceHeader({ active }) {
  const navigate = useNavigate();
  return (
    <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/dashboard')} className="text-gray-500 hover:text-white text-sm transition-colors">← Dashboard</button>
          <span className="text-gray-700">|</span>
          <span className="text-sm font-bold text-green-400">Finance Hub</span>
        </div>
        <nav className="flex gap-px bg-gray-700">
          {NAV.map(n => (
            <button key={n.path} onClick={() => navigate(n.path)}
              className={`px-4 py-2 text-xs font-medium transition-colors ${
                active === n.label ? 'bg-gray-900 text-white' : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
              }`}>
              {n.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}

const StatCard = ({ label, value, sub, accent = 'text-white', small }) => (
  <div className="bg-gray-900 border border-gray-700 px-4 py-3">
    <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider">{label}</div>
    <div className={`font-bold ${small ? 'text-xl' : 'text-2xl'} ${accent}`}>{value}</div>
    {sub && <div className="text-xs text-gray-500 mt-0.5">{sub}</div>}
  </div>
);

const fmt = (n) => `$${(+n || 0).toFixed(2)}`;

export default function Finance() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) { navigate('/admin/login'); return; }

    (async () => {
      try {
        const r = await fetch(`${API_URL}/api/finance/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (r.status === 401) { navigate('/admin/login'); return; }
        if (!r.ok) throw new Error('Failed to load summary');
        setSummary(await r.json());
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, [navigate]);

  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><div className="text-gray-400">Loading...</div></div>;
  if (error)   return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><div className="text-red-400">{error}</div></div>;

  const s = summary;
  const profitColor = s.lifetimeProfit >= 0 ? 'text-green-400' : 'text-red-400';
  const mProfitColor = s.currentMonthProfit >= 0 ? 'text-green-400' : 'text-red-400';

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <FinanceHeader active="Overview" />

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* Revenue */}
        <section>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1 px-1">Revenue</div>
          <div className="grid grid-cols-4 gap-px bg-gray-700">
            <StatCard label="Gross Revenue" value={fmt(s.totalGrossRevenue)} />
            <StatCard label="Net Revenue" value={fmt(s.totalNetRevenue)} accent="text-green-400" />
            <StatCard label="Paid Out" value={fmt(s.paidRevenue)} accent="text-green-400" />
            <StatCard label="Pending" value={fmt(s.pendingRevenue)} accent="text-yellow-400" />
          </div>
        </section>

        {/* Profitability */}
        <section>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1 px-1">Profitability</div>
          <div className="grid grid-cols-4 gap-px bg-gray-700">
            <StatCard label="Total Expenses" value={fmt(s.totalExpenses)} accent="text-red-400" />
            <StatCard label="Lifetime Profit" value={fmt(s.lifetimeProfit)} accent={profitColor} />
            <StatCard label="This Month Revenue" value={fmt(s.currentMonthRevenue)}
              sub={`Last month: ${fmt(s.lastMonthRevenue)}`} />
            <StatCard label="This Month Profit" value={fmt(s.currentMonthProfit)} accent={mProfitColor}
              sub={`Monthly expenses: ${fmt(s.monthlyExpenses)}`} />
          </div>
        </section>

        {/* Payout Progress */}
        {s.payoutProgressBySource.length > 0 && (
          <section>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1 px-1">Payout Progress</div>
            <div className="bg-gray-800 border border-gray-700 divide-y divide-gray-700">
              {s.payoutProgressBySource.map(p => (
                <div key={p.sourceId} className="px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-white">{p.sourceName}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        p.ready ? 'bg-green-900/50 text-green-400' : 'bg-gray-700 text-gray-400'
                      }`}>{p.ready ? '✓ Ready for Payout' : 'Accumulating'}</span>
                    </div>
                    <div className="text-right text-xs text-gray-400">
                      <span className="text-white font-medium">{fmt(p.pendingBalance)}</span>
                      <span className="text-gray-600"> / {fmt(p.threshold)}</span>
                      {!p.ready && <span className="text-yellow-400 ml-2">({fmt(p.remaining)} to go)</span>}
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${p.ready ? 'bg-green-500' : 'bg-purple-500'}`}
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                  <div className="text-right text-xs text-gray-600 mt-0.5">{p.progress}%</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Renewals */}
        {s.upcomingRenewals.length > 0 && (
          <section>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1 px-1">Upcoming Renewals</div>
            <div className="bg-gray-800 border border-gray-700 divide-y divide-gray-700">
              {s.upcomingRenewals.map(r => (
                <div key={r.id} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-medium ${r.daysUntil <= 14 ? 'text-red-400' : r.daysUntil <= 30 ? 'text-yellow-400' : 'text-white'}`}>
                      {r.daysUntil <= 14 ? '⚠ ' : ''}{r.name}
                    </span>
                    <span className="text-xs text-gray-500">{new Date(r.renewalDate).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-white">{fmt(r.amount)}</span>
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                      r.daysUntil <= 14 ? 'bg-red-900/40 text-red-400' :
                      r.daysUntil <= 30 ? 'bg-yellow-900/40 text-yellow-400' :
                      'bg-gray-700 text-gray-300'
                    }`}>{r.daysUntil}d</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Quick Actions */}
        <section>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1 px-1">Quick Actions</div>
          <div className="grid grid-cols-4 gap-px bg-gray-700">
            {[
              { label: '+ Log Revenue', path: '/admin/finance/revenue', color: 'bg-green-900 hover:bg-green-800' },
              { label: '+ Log Payout',  path: '/admin/finance/payouts',  color: 'bg-purple-900 hover:bg-purple-800' },
              { label: '+ Log Expense', path: '/admin/finance/expenses', color: 'bg-red-900 hover:bg-red-800' },
              { label: 'Manage Sources',path: '/admin/finance/sources',  color: 'bg-gray-700 hover:bg-gray-600' },
            ].map(a => (
              <button key={a.path} onClick={() => navigate(a.path)}
                className={`${a.color} text-white text-sm px-4 py-3 transition-colors text-left`}>
                {a.label}
              </button>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
