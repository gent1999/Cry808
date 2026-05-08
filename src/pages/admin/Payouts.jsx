import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FinanceHeader } from './Finance';

const API_URL = import.meta.env.VITE_API_URL;
const fmt = n => `$${(+n || 0).toFixed(2)}`;

export default function Payouts() {
  const navigate = useNavigate();
  const [payouts,  setPayouts]  = useState([]);
  const [sources,  setSources]  = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(null);

  const token = () => localStorage.getItem('adminToken');
  const hdrs  = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, sRes, sumRes] = await Promise.all([
        fetch(`${API_URL}/api/finance/payouts`, { headers: hdrs() }),
        fetch(`${API_URL}/api/finance/sources`,  { headers: hdrs() }),
        fetch(`${API_URL}/api/finance/summary`,  { headers: hdrs() }),
      ]);
      if ([pRes, sRes, sumRes].some(r => r.status === 401)) { navigate('/admin/login'); return; }
      const pd  = await pRes.json();
      const sd  = await sRes.json();
      const sum = await sumRes.json();
      setPayouts(pd.payouts || []);
      setSources(sd.sources || []);
      setProgress(sum.payoutProgressBySource || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    if (!token()) { navigate('/admin/login'); return; }
    load();
  }, [load]);

  const save = async () => {
    if (!modal.source_id || !modal.amount) { alert('Source and amount required'); return; }
    setSaving(true);
    try {
      const r = await fetch(`${API_URL}/api/finance/payouts`, {
        method: 'POST', headers: hdrs(),
        body: JSON.stringify({ ...modal, mark_entries_paid: modal.mark_entries_paid }),
      });
      if (!r.ok) { const d = await r.json(); alert(d.message); }
      setModal(null);
      load();
    } catch (e) { alert(e.message); }
    setSaving(false);
  };

  const del = async (id) => {
    if (!confirm('Delete this payout record?')) return;
    setDeleting(id);
    await fetch(`${API_URL}/api/finance/payouts/${id}`, { method: 'DELETE', headers: hdrs() });
    setDeleting(null);
    load();
  };

  const inp = 'bg-gray-700 border border-gray-600 text-white text-sm px-3 py-2 w-full focus:outline-none focus:border-gray-500';

  return (
    <div className="admin-command-center finance-command-center finance-subpage min-h-screen bg-[#070b12] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_25%_0%,rgba(16,185,129,.12),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,.12),transparent_30%),linear-gradient(180deg,#070b12_0%,#0a0f1a_48%,#070b12_100%)]" />
      <FinanceHeader active="Payouts" />
      <main className="finance-main relative ml-[264px] px-8 py-7 space-y-6">

        {/* Payout Progress Cards */}
        {progress.length > 0 && (
          <section>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1 px-1">Progress Toward Payout</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-700">
              {progress.map(p => (
                <div key={p.sourceId} className="bg-gray-800 px-4 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-white">{p.sourceName}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.ready ? 'bg-green-900/50 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                      {p.ready ? '✓ Ready' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                    <span>Balance: <span className="text-white font-medium">{fmt(p.pendingBalance)}</span></span>
                    <span>Threshold: {fmt(p.threshold)}</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden mb-1">
                    <div className={`h-full rounded-full ${p.ready ? 'bg-green-500' : 'bg-purple-500'}`}
                      style={{ width: `${p.progress}%` }} />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">{p.progress}%</span>
                    {!p.ready && <span className="text-yellow-400">{fmt(p.remaining)} to go</span>}
                  </div>
                  {p.ready && (
                    <button onClick={() => setModal({ source_id: p.sourceId, amount: p.pendingBalance.toFixed(2), date: new Date().toISOString().split('T')[0], notes: '', mark_entries_paid: true })}
                      className="mt-3 w-full py-1.5 bg-green-800 hover:bg-green-700 text-green-300 text-xs font-medium transition-colors rounded">
                      Log Payout →
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Payout Log */}
        <section>
          <div className="flex items-center justify-between mb-1 px-1">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Payout History</div>
            <button onClick={() => setModal({ source_id: '', amount: '', date: new Date().toISOString().split('T')[0], notes: '', mark_entries_paid: true })}
              className="bg-purple-700 hover:bg-purple-600 text-white text-xs px-3 py-1.5 transition-colors">
              + Log Payout
            </button>
          </div>

          {loading ? (
            <div className="bg-gray-800 border border-gray-700 px-4 py-8 text-center text-gray-500 text-sm">Loading...</div>
          ) : payouts.length === 0 ? (
            <div className="bg-gray-800 border border-gray-700 px-4 py-12 text-center text-gray-500 text-sm">No payouts recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-800 border-b border-gray-700 text-gray-500">
                    {['Date', 'Source', 'Amount', 'Notes', ''].map(h => (
                      <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {payouts.map(p => (
                    <tr key={p.id} className="hover:bg-gray-800/50 bg-gray-900">
                      <td className="px-3 py-2 text-gray-400">{p.date?.slice(0,10)}</td>
                      <td className="px-3 py-2 text-white">{p.source_name || '—'}</td>
                      <td className="px-3 py-2 text-green-400 font-medium">{fmt(p.amount)}</td>
                      <td className="px-3 py-2 text-gray-400 max-w-[300px] truncate">{p.notes || '—'}</td>
                      <td className="px-3 py-2">
                        <button onClick={() => del(p.id)} disabled={deleting === p.id}
                          className="text-gray-600 hover:text-red-400 transition-colors disabled:opacity-50">
                          {deleting === p.id ? '...' : 'Del'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {modal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-800 border border-gray-700 w-full max-w-md">
            <div className="px-5 py-3 border-b border-gray-700 flex items-center justify-between">
              <h3 className="font-bold text-white">Log Payout</h3>
              <button onClick={() => setModal(null)} className="text-gray-500 hover:text-white text-lg">×</button>
            </div>
            <div className="px-5 py-4 space-y-3">
              {[
                ['Revenue Source', <select className="bg-gray-700 border border-gray-600 text-white text-sm px-3 py-2 w-full" value={modal.source_id}
                  onChange={e => setModal(m => ({ ...m, source_id: e.target.value }))}>
                  <option value="">— Select Source —</option>
                  {sources.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>],
                ['Amount ($)', <input type="number" step="0.01" min="0" className={inp} value={modal.amount}
                  onChange={e => setModal(m => ({ ...m, amount: e.target.value }))} />],
                ['Date', <input type="date" className={inp} value={modal.date}
                  onChange={e => setModal(m => ({ ...m, date: e.target.value }))} />],
                ['Notes', <input className={inp} placeholder="Optional notes..." value={modal.notes}
                  onChange={e => setModal(m => ({ ...m, notes: e.target.value }))} />],
              ].map(([label, control]) => (
                <div key={label}>
                  <label className="block text-xs text-gray-400 mb-1">{label}</label>
                  {control}
                </div>
              ))}
              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input type="checkbox" checked={modal.mark_entries_paid}
                  onChange={e => setModal(m => ({ ...m, mark_entries_paid: e.target.checked }))}
                  className="accent-purple-500" />
                Mark related revenue entries as paid out
              </label>
            </div>
            <div className="px-5 py-3 border-t border-gray-700 flex gap-2 justify-end">
              <button onClick={() => setModal(null)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-sm transition-colors">Cancel</button>
              <button onClick={save} disabled={saving} className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-sm transition-colors disabled:opacity-50">
                {saving ? 'Saving...' : 'Log Payout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
