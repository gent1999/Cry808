import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FinanceHeader } from './Finance';

const API_URL = import.meta.env.VITE_API_URL;
const fmt = n => `$${(+n || 0).toFixed(2)}`;

const CATEGORIES = ['domain', 'hosting', 'software', 'ads', 'other'];
const CYCLES     = ['one_time', 'monthly', 'yearly'];
const PAYMENT    = ['paid', 'pending'];

const BLANK = { name: '', category: 'other', amount: '', billing_cycle: 'one_time', vendor: '', renewal_date: '', payment_status: 'paid', notes: '' };

export default function Expenses() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [totals,   setTotals]   = useState({ total: 0, monthly: 0, yearly: 0 });
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(null);

  const token = () => localStorage.getItem('adminToken');
  const hdrs  = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API_URL}/api/finance/expenses`, { headers: hdrs() });
      if (r.status === 401) { navigate('/admin/login'); return; }
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || `Server error ${r.status}`);
      setExpenses(d.expenses || []);
      setTotals(d.totals || { total: 0, monthly: 0, yearly: 0 });
    } catch (e) { console.error('[Expenses] load failed:', e.message); }
    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    if (!token()) { navigate('/admin/login'); return; }
    load();
  }, [load]);

  const openAdd  = () => setModal({ mode: 'add',  data: { ...BLANK } });
  const openEdit = e => setModal({ mode: 'edit', data: { ...e, renewal_date: e.renewal_date?.slice(0,10) || '', amount: e.amount || '' } });

  const save = async () => {
    setSaving(true);
    try {
      const { mode, data } = modal;
      const url    = mode === 'add' ? `${API_URL}/api/finance/expenses` : `${API_URL}/api/finance/expenses/${data.id}`;
      const method = mode === 'add' ? 'POST' : 'PUT';
      const r = await fetch(url, { method, headers: hdrs(), body: JSON.stringify(data) });
      const d = await r.json();
      if (!r.ok) { alert(d.message || `Save failed (${r.status})`); setSaving(false); return; }
      setModal(null);
      load();
    } catch (e) { alert(e.message); }
    setSaving(false);
  };

  const del = async (id) => {
    if (!confirm('Delete this expense?')) return;
    setDeleting(id);
    await fetch(`${API_URL}/api/finance/expenses/${id}`, { method: 'DELETE', headers: hdrs() });
    setDeleting(null); load();
  };

  const inp = 'bg-gray-700 border border-gray-600 text-white text-sm px-3 py-2 w-full focus:outline-none focus:border-gray-500';
  const sel = inp + ' cursor-pointer';

  const renewalBadge = (days) => {
    if (days === null || days === undefined) return null;
    if (days < 0)  return <span className="text-xs px-1.5 py-0.5 rounded bg-gray-700 text-gray-500">Expired</span>;
    if (days <= 14) return <span className="text-xs px-1.5 py-0.5 rounded bg-red-900/40 text-red-400">⚠ {days}d</span>;
    if (days <= 30) return <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-900/40 text-yellow-400">{days}d</span>;
    return <span className="text-xs px-1.5 py-0.5 rounded bg-gray-700 text-gray-400">{days}d</span>;
  };

  return (
    <div className="admin-command-center finance-command-center finance-subpage min-h-screen bg-[#070b12] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_25%_0%,rgba(16,185,129,.12),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,.12),transparent_30%),linear-gradient(180deg,#070b12_0%,#0a0f1a_48%,#070b12_100%)]" />
      <FinanceHeader active="Expenses" />
      <main className="finance-main relative ml-[264px] px-8 py-7 space-y-4">

        {/* Summary */}
        <div className="grid grid-cols-3 gap-px bg-gray-700">
          <div className="bg-gray-900 border border-gray-700 px-4 py-3">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Expenses</div>
            <div className="text-2xl font-bold text-red-400">{fmt(totals.total)}</div>
          </div>
          <div className="bg-gray-900 border border-gray-700 px-4 py-3">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Monthly Recurring</div>
            <div className="text-2xl font-bold text-white">{fmt(totals.monthly)}</div>
            <div className="text-xs text-gray-500 mt-0.5">{fmt(totals.monthly * 12)}/yr</div>
          </div>
          <div className="bg-gray-900 border border-gray-700 px-4 py-3">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Yearly Recurring</div>
            <div className="text-2xl font-bold text-white">{fmt(totals.yearly)}</div>
            <div className="text-xs text-gray-500 mt-0.5">{fmt(totals.yearly / 12)}/mo avg</div>
          </div>
        </div>

        {/* Renewal Warnings */}
        {expenses.filter(e => e.days_until_renewal !== null && e.days_until_renewal <= 30).length > 0 && (
          <div className="bg-yellow-950/30 border border-yellow-800/40 px-4 py-3 space-y-1">
            <div className="text-xs font-semibold text-yellow-400 uppercase tracking-widest mb-2">Renewal Alerts</div>
            {expenses.filter(e => e.days_until_renewal !== null && e.days_until_renewal <= 30).map(e => (
              <div key={e.id} className="flex items-center justify-between text-sm">
                <span className="text-yellow-300">{e.name} ({e.vendor || 'N/A'})</span>
                <div className="flex items-center gap-3">
                  <span className="text-white">{fmt(e.amount)}</span>
                  <span className="text-gray-400">{e.renewal_date?.slice(0,10)}</span>
                  {renewalBadge(e.days_until_renewal)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add button */}
        <div className="flex justify-end">
          <button onClick={openAdd} className="bg-red-800 hover:bg-red-700 text-white text-sm px-4 py-2 transition-colors">
            + Add Expense
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="bg-gray-800 border border-gray-700 px-4 py-8 text-center text-gray-500 text-sm">Loading...</div>
        ) : expenses.length === 0 ? (
          <div className="bg-gray-800 border border-gray-700 px-4 py-12 text-center">
            <div className="text-gray-500 text-sm mb-2">No expenses logged yet.</div>
            <button onClick={openAdd} className="text-red-400 text-sm hover:underline">Add first expense →</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-800 border-b border-gray-700 text-gray-500">
                  {['Name','Category','Amount','Cycle','Vendor','Renewal','Status',''].map(h => (
                    <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {expenses.map(e => (
                  <tr key={e.id} className="hover:bg-gray-800/50 bg-gray-900">
                    <td className="px-3 py-2 text-white font-medium">{e.name}</td>
                    <td className="px-3 py-2 text-gray-400 capitalize">{e.category}</td>
                    <td className="px-3 py-2 text-red-400 font-medium">{fmt(e.amount)}</td>
                    <td className="px-3 py-2 text-gray-400">{e.billing_cycle?.replace(/_/g,' ')}</td>
                    <td className="px-3 py-2 text-gray-400">{e.vendor || '—'}</td>
                    <td className="px-3 py-2">
                      {e.renewal_date ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-400">{e.renewal_date?.slice(0,10)}</span>
                          {renewalBadge(e.days_until_renewal)}
                        </div>
                      ) : <span className="text-gray-600">—</span>}
                    </td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${e.payment_status === 'paid' ? 'bg-green-900/40 text-green-400' : 'bg-yellow-900/40 text-yellow-400'}`}>
                        {e.payment_status}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <button onClick={() => openEdit(e)} className="text-gray-500 hover:text-white mr-2 transition-colors">Edit</button>
                      <button onClick={() => del(e.id)} disabled={deleting === e.id}
                        className="text-gray-600 hover:text-red-400 transition-colors disabled:opacity-50">
                        {deleting === e.id ? '...' : 'Del'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {modal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-800 border border-gray-700 w-full max-w-md">
            <div className="px-5 py-3 border-b border-gray-700 flex items-center justify-between">
              <h3 className="font-bold text-white">{modal.mode === 'add' ? 'Add Expense' : 'Edit Expense'}</h3>
              <button onClick={() => setModal(null)} className="text-gray-500 hover:text-white text-lg">×</button>
            </div>
            <div className="px-5 py-4 space-y-3">
              {[
                ['Name', <input className={inp} placeholder="Namecheap domain..." value={modal.data.name}
                  onChange={e => setModal(m => ({ ...m, data: { ...m.data, name: e.target.value } }))} />],
                ['Vendor', <input className={inp} placeholder="Namecheap, Vercel, etc." value={modal.data.vendor}
                  onChange={e => setModal(m => ({ ...m, data: { ...m.data, vendor: e.target.value } }))} />],
              ].map(([l, c]) => (
                <div key={l}>
                  <label className="block text-xs text-gray-400 mb-1">{l}</label>
                  {c}
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Category</label>
                  <select className={sel} value={modal.data.category}
                    onChange={e => setModal(m => ({ ...m, data: { ...m.data, category: e.target.value } }))}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Billing Cycle</label>
                  <select className={sel} value={modal.data.billing_cycle}
                    onChange={e => setModal(m => ({ ...m, data: { ...m.data, billing_cycle: e.target.value } }))}>
                    {CYCLES.map(c => <option key={c} value={c}>{c.replace(/_/g,' ')}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Amount ($)</label>
                  <input type="number" step="0.01" min="0" className={inp} value={modal.data.amount}
                    onChange={e => setModal(m => ({ ...m, data: { ...m.data, amount: e.target.value } }))} />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Payment Status</label>
                  <select className={sel} value={modal.data.payment_status}
                    onChange={e => setModal(m => ({ ...m, data: { ...m.data, payment_status: e.target.value } }))}>
                    {PAYMENT.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Renewal Date</label>
                <input type="date" className={inp} value={modal.data.renewal_date}
                  onChange={e => setModal(m => ({ ...m, data: { ...m.data, renewal_date: e.target.value } }))} />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Notes</label>
                <textarea className={inp + ' resize-none'} rows={2} value={modal.data.notes}
                  onChange={e => setModal(m => ({ ...m, data: { ...m.data, notes: e.target.value } }))} />
              </div>
            </div>
            <div className="px-5 py-3 border-t border-gray-700 flex gap-2 justify-end">
              <button onClick={() => setModal(null)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-sm transition-colors">Cancel</button>
              <button onClick={save} disabled={saving} className="px-4 py-2 bg-red-800 hover:bg-red-700 text-sm transition-colors disabled:opacity-50">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
