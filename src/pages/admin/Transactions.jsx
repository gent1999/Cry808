import { useState, useEffect, useCallback, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { FinanceHeader } from './Finance';
import TransactionModal, { editDataFromTransaction } from './TransactionModal';

const API_URL = import.meta.env.VITE_API_URL;
const SITE = 'cry808';
const fmt = n => `$${Math.abs(+n || 0).toFixed(2)}`;

const TABS = [
  { key: '',        label: 'All' },
  { key: 'income',  label: 'Income' },
  { key: 'expense', label: 'Expenses' },
  { key: 'payout',  label: 'Payouts' },
];

const KIND_META = {
  income:  { badge: 'bg-green-900/40 text-green-400',  amount: 'text-green-400',  sign: '+' },
  expense: { badge: 'bg-red-900/40 text-red-400',      amount: 'text-red-400',    sign: '-' },
  payout:  { badge: 'bg-purple-900/40 text-purple-400',amount: 'text-purple-400', sign: '+' },
};

const STATUS_LABEL = (row) => {
  if (row.kind === 'payout') return 'Complete';
  if (row.kind === 'income' && row.payment_status === 'paid' && row.payout_status === 'not_ready') return 'Pending payout';
  return row.payment_status;
};

export default function Transactions() {
  const navigate = useNavigate();
  const [rows,    setRows]    = useState([]);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState('');
  const [filters, setFilters] = useState({ source_id: '', from: '', to: '', payment_status: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [expanded, setExpanded] = useState(null); // id-kind of expanded row
  const [modal, setModal] = useState(null); // { mode, type, data }
  const [deleting, setDeleting] = useState(null);

  const token = () => localStorage.getItem('adminToken');
  const hdrs  = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(Object.entries({ ...filters, type: tab, site: SITE }).filter(([, v]) => v));
      const [tRes, sRes] = await Promise.all([
        fetch(`${API_URL}/api/finance/transactions?${params}`, { headers: hdrs() }),
        fetch(`${API_URL}/api/finance/sources?site=${SITE}`, { headers: hdrs() }),
      ]);
      if (tRes.status === 401 || sRes.status === 401) { navigate('/admin/login'); return; }
      const td = await tRes.json();
      const sd = await sRes.json();
      setRows(td.transactions || []);
      setSources(sd.sources || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, [filters, tab, navigate]);

  useEffect(() => {
    if (!token()) { navigate('/admin/login'); return; }
    load();
  }, [load]);

  const totals = rows.reduce((acc, r) => {
    if (r.kind === 'income') acc.income += +r.amount;
    if (r.kind === 'expense') acc.expense += Math.abs(+r.amount);
    if (r.kind === 'payout') acc.payout += +r.amount;
    return acc;
  }, { income: 0, expense: 0, payout: 0 });

  const openAdd = (type = 'income') => setModal({ mode: 'add', type, data: null });
  const openEdit = (row) => {
    if (row.kind === 'payout') return; // payouts have never supported editing — delete + re-log instead
    setModal({ mode: 'edit', type: row.kind, data: editDataFromTransaction(row) });
  };

  const del = async (row) => {
    const endpoint = { income: 'entries', expense: 'expenses', payout: 'payouts' }[row.kind];
    if (!confirm('Delete this transaction?')) return;
    const key = `${row.kind}-${row.id}`;
    setDeleting(key);
    await fetch(`${API_URL}/api/finance/${endpoint}/${row.id}?site=${SITE}`, { method: 'DELETE', headers: hdrs() });
    setDeleting(null);
    load();
  };

  const inp = 'bg-gray-800 border border-gray-700 text-sm text-gray-300 px-3 py-2';

  return (
    <div className="admin-command-center finance-command-center finance-subpage min-h-screen bg-[#070b12] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_25%_0%,rgba(16,185,129,.12),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,.12),transparent_30%),linear-gradient(180deg,#070b12_0%,#0a0f1a_48%,#070b12_100%)]" />
      <FinanceHeader active="Transactions" sources={sources} />
      <main className="finance-main relative px-4 py-7 space-y-4 sm:px-8 lg:ml-[264px]">

        {/* Totals for current filter/tab */}
        <div className="grid grid-cols-1 gap-px bg-gray-700 sm:grid-cols-3">
          <div className="bg-gray-900 border border-gray-700 px-4 py-3">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Income</div>
            <div className="text-2xl font-bold text-green-400">{fmt(totals.income)}</div>
          </div>
          <div className="bg-gray-900 border border-gray-700 px-4 py-3">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Expenses</div>
            <div className="text-2xl font-bold text-red-400">{fmt(totals.expense)}</div>
          </div>
          <div className="bg-gray-900 border border-gray-700 px-4 py-3">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Payouts</div>
            <div className="text-2xl font-bold text-purple-400">{fmt(totals.payout)}</div>
          </div>
        </div>

        {/* Type tabs */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex gap-1 border border-gray-700 bg-gray-900 p-1">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  tab === t.key ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'
                }`}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowFilters(v => !v)}
              className="text-xs text-gray-500 hover:text-white px-2 py-1.5 border border-gray-700">
              {showFilters ? 'Hide Filters' : 'Filters'}
            </button>
            <button onClick={() => openAdd(tab || 'income')} className="bg-green-700 hover:bg-green-600 text-white text-sm px-4 py-2 transition-colors">
              + Add Transaction
            </button>
          </div>
        </div>

        {/* Filter bar */}
        {showFilters && (
          <div className="flex flex-wrap gap-2 items-end">
            <select value={filters.source_id} onChange={e => setFilters(f => ({ ...f, source_id: e.target.value }))} className={inp}>
              <option value="">All Sources</option>
              {sources.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select value={filters.payment_status} onChange={e => setFilters(f => ({ ...f, payment_status: e.target.value }))} className={inp}>
              <option value="">Status: All</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <input type="date" value={filters.from} onChange={e => setFilters(f => ({ ...f, from: e.target.value }))} className={inp} />
            <input type="date" value={filters.to} onChange={e => setFilters(f => ({ ...f, to: e.target.value }))} className={inp} />
            {Object.values(filters).some(Boolean) &&
              <button onClick={() => setFilters({ source_id: '', from: '', to: '', payment_status: '' })}
                className="text-xs text-gray-500 hover:text-white px-2">Clear</button>}
          </div>
        )}

        {/* Ledger */}
        {loading ? (
          <div className="bg-gray-800 border border-gray-700 px-4 py-8 text-center text-gray-500 text-sm">Loading...</div>
        ) : rows.length === 0 ? (
          <div className="bg-gray-800 border border-gray-700 px-4 py-12 text-center">
            <div className="text-gray-500 text-sm mb-2">No transactions yet.</div>
            <button onClick={() => openAdd('income')} className="text-green-400 text-sm hover:underline">Add your first transaction →</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-800 border-b border-gray-700 text-gray-500">
                  {['Date', 'Type', 'Source', 'Description', 'Amount', 'Status', ''].map(h => (
                    <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {rows.map(r => {
                  const key = `${r.kind}-${r.id}`;
                  const m = KIND_META[r.kind];
                  const isOpen = expanded === key;
                  const hasDetails = r.kind === 'income';
                  return (
                    <Fragment key={key}>
                      <tr className="hover:bg-gray-800/50 bg-gray-900 cursor-pointer" onClick={() => hasDetails && setExpanded(isOpen ? null : key)}>
                        <td className="px-3 py-2 text-gray-400 whitespace-nowrap">{r.date?.slice(0, 10)}</td>
                        <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${m.badge}`}>{r.kind}</span></td>
                        <td className="px-3 py-2 text-white whitespace-nowrap">{r.source_name || '—'}</td>
                        <td className="px-3 py-2 max-w-[220px] truncate text-gray-300">{r.description}</td>
                        <td className={`px-3 py-2 font-medium whitespace-nowrap ${m.amount}`}>{m.sign}{fmt(r.amount)}</td>
                        <td className="px-3 py-2 text-gray-400 capitalize whitespace-nowrap">{STATUS_LABEL(r)}</td>
                        <td className="px-3 py-2 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                          {r.kind !== 'payout' && (
                            <button onClick={() => openEdit(r)} className="text-gray-500 hover:text-white mr-2 transition-colors">Edit</button>
                          )}
                          <button onClick={() => del(r)} disabled={deleting === key}
                            className="text-gray-600 hover:text-red-400 transition-colors disabled:opacity-50">
                            {deleting === key ? '...' : 'Del'}
                          </button>
                        </td>
                      </tr>
                      {isOpen && hasDetails && (
                        <tr className="bg-gray-950">
                          <td colSpan={7} className="px-3 py-3">
                            <div className="flex flex-wrap gap-6 text-xs">
                              <span className="text-gray-500">Gross: <span className="text-white">{fmt(r.gross_amount)}</span></span>
                              <span className="text-gray-500">Fee: <span className="text-red-400">{fmt(r.fee_amount)}</span></span>
                              <span className="text-gray-500">Net: <span className="text-green-400">{fmt(r.net_amount)}</span></span>
                              <span className="text-gray-500">Payout status: <span className="text-gray-300 capitalize">{r.payout_status?.replace(/_/g, ' ')}</span></span>
                              {r.article_url && (
                                <a href={r.article_url} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-blue-400">
                                  {r.article_url.replace('https://cry808.com', '')}
                                </a>
                              )}
                              {r.notes && <span className="text-gray-600 italic">{r.notes}</span>}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {modal && (
        <TransactionModal
          mode={modal.mode}
          type={modal.type}
          data={modal.data}
          sources={sources}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); }}
        />
      )}
    </div>
  );
}
