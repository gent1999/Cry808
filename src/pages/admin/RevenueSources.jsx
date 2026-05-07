import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FinanceHeader } from './Finance';

const API_URL = import.meta.env.VITE_API_URL;
const fmt = n => `$${(+n || 0).toFixed(2)}`;

const TYPES    = ['article_sale', 'ad_network', 'manual', 'other'];
const FEE_TYPES = ['none', 'percentage', 'fixed'];
const STATUSES = ['active', 'pending', 'inactive'];

const statusBadge = {
  active:   'bg-green-900/40 text-green-400',
  pending:  'bg-yellow-900/40 text-yellow-400',
  inactive: 'bg-gray-700 text-gray-500',
};

const BLANK = { name: '', type: 'article_sale', default_gross: '', fee_type: 'none', fee_value: '', payout_threshold: '', status: 'active', notes: '' };

export default function RevenueSources() {
  const navigate = useNavigate();
  const [sources,  setSources]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(null);

  const token = () => localStorage.getItem('adminToken');
  const hdrs  = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API_URL}/api/finance/sources`, { headers: hdrs() });
      if (r.status === 401) { navigate('/admin/login'); return; }
      const d = await r.json();
      setSources(d.sources || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    if (!token()) { navigate('/admin/login'); return; }
    load();
  }, [load]);

  const openAdd  = () => setModal({ mode: 'add',  data: { ...BLANK } });
  const openEdit = s => setModal({ mode: 'edit', data: { ...s, default_gross: s.default_gross||'', fee_value: s.fee_value||'', payout_threshold: s.payout_threshold||'' } });

  const calcNet = (data) => {
    const gross = parseFloat(data.default_gross) || 0;
    if (data.fee_type === 'percentage') return gross - gross * ((parseFloat(data.fee_value) || 0) / 100);
    if (data.fee_type === 'fixed')      return gross - (parseFloat(data.fee_value) || 0);
    return gross;
  };

  const save = async () => {
    if (!modal.data.name) { alert('Name required'); return; }
    setSaving(true);
    try {
      const { mode, data } = modal;
      const url    = mode === 'add' ? `${API_URL}/api/finance/sources` : `${API_URL}/api/finance/sources/${data.id}`;
      const method = mode === 'add' ? 'POST' : 'PUT';
      const r = await fetch(url, { method, headers: hdrs(), body: JSON.stringify(data) });
      if (!r.ok) { const d = await r.json(); alert(d.message); }
      setModal(null); load();
    } catch (e) { alert(e.message); }
    setSaving(false);
  };

  const del = async (id) => {
    if (!confirm('Delete this source? Revenue entries referencing it will keep their data.')) return;
    setDeleting(id);
    await fetch(`${API_URL}/api/finance/sources/${id}`, { method: 'DELETE', headers: hdrs() });
    setDeleting(null); load();
  };

  const inp = 'bg-gray-700 border border-gray-600 text-white text-sm px-3 py-2 w-full focus:outline-none focus:border-gray-500';
  const sel = inp + ' cursor-pointer';

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <FinanceHeader active="Sources" />
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-4">

        <div className="flex justify-end">
          <button onClick={openAdd} className="bg-blue-700 hover:bg-blue-600 text-white text-sm px-4 py-2 transition-colors">
            + Add Source
          </button>
        </div>

        {loading ? (
          <div className="bg-gray-800 border border-gray-700 px-4 py-8 text-center text-gray-500 text-sm">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-700">
            {sources.map(s => {
              const net = parseFloat(s.default_gross) - (
                s.fee_type === 'percentage' ? parseFloat(s.default_gross) * (parseFloat(s.fee_value) / 100) :
                s.fee_type === 'fixed' ? parseFloat(s.fee_value) : 0
              );
              return (
                <div key={s.id} className="bg-gray-800 px-4 py-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-white text-sm">{s.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge[s.status]}`}>{s.status}</span>
                      </div>
                      <div className="text-xs text-gray-500 capitalize">{s.type?.replace(/_/g,' ')}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(s)} className="text-xs text-gray-500 hover:text-white transition-colors">Edit</button>
                      <button onClick={() => del(s.id)} disabled={deleting === s.id} className="text-xs text-gray-600 hover:text-red-400 transition-colors disabled:opacity-50">
                        {deleting === s.id ? '...' : 'Del'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                    <div className="bg-gray-900/60 rounded px-2 py-1.5">
                      <div className="text-xs text-gray-500 mb-0.5">Gross</div>
                      <div className="text-sm font-medium text-white">{parseFloat(s.default_gross) > 0 ? fmt(s.default_gross) : '—'}</div>
                    </div>
                    <div className="bg-gray-900/60 rounded px-2 py-1.5">
                      <div className="text-xs text-gray-500 mb-0.5">Fee</div>
                      <div className="text-sm font-medium text-red-400">
                        {s.fee_type === 'none' ? 'None' :
                         s.fee_type === 'percentage' ? `${s.fee_value}%` :
                         fmt(s.fee_value)}
                      </div>
                    </div>
                    <div className="bg-gray-900/60 rounded px-2 py-1.5">
                      <div className="text-xs text-gray-500 mb-0.5">Net</div>
                      <div className="text-sm font-medium text-green-400">{parseFloat(s.default_gross) > 0 ? fmt(net) : '—'}</div>
                    </div>
                  </div>

                  <div className="mt-2 flex gap-4 text-xs text-gray-500">
                    {parseFloat(s.payout_threshold) > 0 && <span>Threshold: <span className="text-gray-300">{fmt(s.payout_threshold)}</span></span>}
                    {parseFloat(s.current_balance) > 0 && <span>Balance: <span className="text-yellow-400">{fmt(s.current_balance)}</span></span>}
                    <span className="ml-auto">{s.entry_count} entries</span>
                  </div>
                  {s.notes && <div className="mt-1.5 text-xs text-gray-600 italic">{s.notes}</div>}
                </div>
              );
            })}
          </div>
        )}

        {/* Future Integration Note */}
        <div className="bg-gray-800/50 border border-dashed border-gray-700 px-4 py-3 text-xs text-gray-600">
          <span className="text-gray-500 font-medium">Future Integration:</span> When Scout/Listener/manual article posting creates an article, 808-engine can call{' '}
          <code className="text-gray-400">POST /api/finance/entries</code> to auto-log revenue. Add <code className="text-gray-400">source_id</code> to the payload.
        </div>
      </main>

      {modal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-800 border border-gray-700 w-full max-w-md">
            <div className="px-5 py-3 border-b border-gray-700 flex items-center justify-between">
              <h3 className="font-bold text-white">{modal.mode === 'add' ? 'Add Revenue Source' : 'Edit Source'}</h3>
              <button onClick={() => setModal(null)} className="text-gray-500 hover:text-white text-lg">×</button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Name</label>
                <input className={inp} placeholder="Fiverr, OneSubmit..." value={modal.data.name}
                  onChange={e => setModal(m => ({ ...m, data: { ...m.data, name: e.target.value } }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Type</label>
                  <select className={sel} value={modal.data.type}
                    onChange={e => setModal(m => ({ ...m, data: { ...m.data, type: e.target.value } }))}>
                    {TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g,' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Status</label>
                  <select className={sel} value={modal.data.status}
                    onChange={e => setModal(m => ({ ...m, data: { ...m.data, status: e.target.value } }))}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Default Gross ($)</label>
                  <input type="number" step="0.01" min="0" className={inp} value={modal.data.default_gross}
                    onChange={e => setModal(m => ({ ...m, data: { ...m.data, default_gross: e.target.value } }))} />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Fee Type</label>
                  <select className={sel} value={modal.data.fee_type}
                    onChange={e => setModal(m => ({ ...m, data: { ...m.data, fee_type: e.target.value } }))}>
                    {FEE_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Fee Value</label>
                  <input type="number" step="0.01" min="0" className={inp} placeholder="0" value={modal.data.fee_value}
                    onChange={e => setModal(m => ({ ...m, data: { ...m.data, fee_value: e.target.value } }))}
                    disabled={modal.data.fee_type === 'none'} />
                </div>
              </div>
              {parseFloat(modal.data.default_gross) > 0 && (
                <div className="bg-gray-700/50 rounded px-3 py-2 text-xs text-gray-400">
                  Net per entry: <span className="text-green-400 font-medium">{fmt(calcNet(modal.data))}</span>
                </div>
              )}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Payout Threshold ($) <span className="text-gray-600">— 0 = no threshold</span></label>
                <input type="number" step="0.01" min="0" className={inp} placeholder="50.00" value={modal.data.payout_threshold}
                  onChange={e => setModal(m => ({ ...m, data: { ...m.data, payout_threshold: e.target.value } }))} />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Notes</label>
                <textarea className={inp + ' resize-none'} rows={2} value={modal.data.notes}
                  onChange={e => setModal(m => ({ ...m, data: { ...m.data, notes: e.target.value } }))} />
              </div>
            </div>
            <div className="px-5 py-3 border-t border-gray-700 flex gap-2 justify-end">
              <button onClick={() => setModal(null)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-sm transition-colors">Cancel</button>
              <button onClick={save} disabled={saving} className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-sm transition-colors disabled:opacity-50">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
