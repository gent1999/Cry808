import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FinanceHeader } from './Finance';

const API_URL = import.meta.env.VITE_API_URL;
const fmt = n => `$${(+n || 0).toFixed(2)}`;

const PAYMENT_STATUS = ['pending', 'paid', 'cancelled'];
const PAYOUT_STATUS  = ['not_ready', 'ready_for_payout', 'paid_out'];

const statusBadge = {
  pending:  'bg-yellow-900/40 text-yellow-400',
  paid:     'bg-green-900/40 text-green-400',
  cancelled:'bg-gray-700 text-gray-500',
  not_ready:'bg-gray-700 text-gray-400',
  ready_for_payout: 'bg-blue-900/40 text-blue-400',
  paid_out: 'bg-green-900/40 text-green-400',
};

const BLANK = {
  date: new Date().toISOString().split('T')[0],
  source_id: '', article_title: '', article_url: '',
  client_name: '', gross_amount: '', fee_amount: '',
  net_amount: '', payment_status: 'pending',
  payout_status: 'not_ready', notes: '',
};

export default function RevenueLog() {
  const navigate = useNavigate();
  const [entries, setEntries]   = useState([]);
  const [totals, setTotals]     = useState({ gross: 0, fee: 0, net: 0 });
  const [sources, setSources]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filters, setFilters]   = useState({ source_id: '', payment_status: '', payout_status: '', from: '', to: '' });
  const [modal, setModal]       = useState(null); // null | { mode: 'add'|'edit', data }
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(null);

  const token = () => localStorage.getItem('adminToken');
  const hdrs  = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(Object.entries(filters).filter(([, v]) => v));
      const [eRes, sRes] = await Promise.all([
        fetch(`${API_URL}/api/finance/entries?${params}`, { headers: hdrs() }),
        fetch(`${API_URL}/api/finance/sources`, { headers: hdrs() }),
      ]);
      if (eRes.status === 401 || sRes.status === 401) { navigate('/admin/login'); return; }
      const ed = await eRes.json();
      const sd = await sRes.json();
      setEntries(ed.entries || []);
      setTotals(ed.totals  || { gross: 0, fee: 0, net: 0 });
      setSources(sd.sources || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, [filters, navigate]);

  useEffect(() => {
    if (!token()) { navigate('/admin/login'); return; }
    load();
  }, [load]);

  const openAdd  = () => setModal({ mode: 'add', data: { ...BLANK } });
  const openEdit = e => setModal({ mode: 'edit', data: { ...e, source_id: e.source_id || '' } });

  const applySourceDefaults = (sourceId, prev) => {
    const src = sources.find(s => s.id === +sourceId);
    if (!src) return prev;
    const gross = parseFloat(src.default_gross) || 0;
    let fee = 0;
    if (src.fee_type === 'percentage') fee = gross * (parseFloat(src.fee_value) / 100);
    else if (src.fee_type === 'fixed') fee = parseFloat(src.fee_value) || 0;
    return { ...prev, source_id: sourceId, gross_amount: gross || '', fee_amount: fee || '', net_amount: (gross - fee) || '' };
  };

  const save = async () => {
    setSaving(true);
    try {
      const { mode, data } = modal;
      const url    = mode === 'add' ? `${API_URL}/api/finance/entries` : `${API_URL}/api/finance/entries/${data.id}`;
      const method = mode === 'add' ? 'POST' : 'PUT';
      const r = await fetch(url, { method, headers: hdrs(), body: JSON.stringify(data) });
      if (!r.ok) { const d = await r.json(); alert(d.message); }
      setModal(null);
      load();
    } catch (e) { alert(e.message); }
    setSaving(false);
  };

  const del = async (id) => {
    setDeleting(id);
    await fetch(`${API_URL}/api/finance/entries/${id}`, { method: 'DELETE', headers: hdrs() });
    setDeleting(null);
    load();
  };

  const Field = ({ label, children }) => (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      {children}
    </div>
  );
  const inp = 'bg-gray-700 border border-gray-600 text-white text-sm px-3 py-2 w-full focus:outline-none focus:border-gray-500';
  const sel = inp + ' cursor-pointer';

  return (
    <div className="admin-command-center finance-command-center finance-subpage min-h-screen bg-[#070b12] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_25%_0%,rgba(16,185,129,.12),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,.12),transparent_30%),linear-gradient(180deg,#070b12_0%,#0a0f1a_48%,#070b12_100%)]" />
      <FinanceHeader active="Revenue" />
      <main className="finance-main relative ml-[264px] px-8 py-7 space-y-4">

        {/* Totals */}
        <div className="grid grid-cols-3 gap-px bg-gray-700">
          {[['Total Gross', totals.gross, ''], ['Total Fees', totals.fee, 'text-red-400'], ['Total Net', totals.net, 'text-green-400']].map(([l,v,c]) => (
            <div key={l} className="bg-gray-900 border border-gray-700 px-4 py-3">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{l}</div>
              <div className={`text-2xl font-bold ${c || 'text-white'}`}>{fmt(v)}</div>
            </div>
          ))}
        </div>

        {/* Filter + Add */}
        <div className="flex flex-wrap gap-2 items-end">
          <select value={filters.source_id} onChange={e => setFilters(f => ({ ...f, source_id: e.target.value }))}
            className="bg-gray-800 border border-gray-700 text-sm text-gray-300 px-3 py-2">
            <option value="">All Sources</option>
            {sources.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={filters.payment_status} onChange={e => setFilters(f => ({ ...f, payment_status: e.target.value }))}
            className="bg-gray-800 border border-gray-700 text-sm text-gray-300 px-3 py-2">
            <option value="">Payment: All</option>
            {PAYMENT_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filters.payout_status} onChange={e => setFilters(f => ({ ...f, payout_status: e.target.value }))}
            className="bg-gray-800 border border-gray-700 text-sm text-gray-300 px-3 py-2">
            <option value="">Payout: All</option>
            {PAYOUT_STATUS.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
          </select>
          <input type="date" value={filters.from} onChange={e => setFilters(f => ({ ...f, from: e.target.value }))}
            className="bg-gray-800 border border-gray-700 text-sm text-gray-300 px-3 py-2" />
          <input type="date" value={filters.to} onChange={e => setFilters(f => ({ ...f, to: e.target.value }))}
            className="bg-gray-800 border border-gray-700 text-sm text-gray-300 px-3 py-2" />
          {Object.values(filters).some(Boolean) &&
            <button onClick={() => setFilters({ source_id:'', payment_status:'', payout_status:'', from:'', to:'' })}
              className="text-xs text-gray-500 hover:text-white px-2">Clear</button>}
          <button onClick={openAdd} className="ml-auto bg-green-700 hover:bg-green-600 text-white text-sm px-4 py-2 transition-colors">
            + Log Revenue
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="bg-gray-800 border border-gray-700 px-4 py-8 text-center text-gray-500 text-sm">Loading...</div>
        ) : entries.length === 0 ? (
          <div className="bg-gray-800 border border-gray-700 px-4 py-12 text-center">
            <div className="text-gray-500 text-sm mb-2">No revenue entries yet.</div>
            <button onClick={openAdd} className="text-green-400 text-sm hover:underline">Log your first entry →</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-800 border-b border-gray-700 text-gray-500">
                  {['Date','Source','Article / Client','Gross','Fee','Net','Payment','Payout',''].map(h => (
                    <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {entries.map(e => (
                  <tr key={e.id} className="hover:bg-gray-800/50 bg-gray-900">
                    <td className="px-3 py-2 text-gray-400 whitespace-nowrap">{e.date?.slice(0,10)}</td>
                    <td className="px-3 py-2 text-white">{e.source_name || '—'}</td>
                    <td className="px-3 py-2 max-w-[200px]">
                      <div className="text-white truncate">{e.article_title || e.client_name || '—'}</div>
                      {e.article_url && <a href={e.article_url} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-blue-400 text-xs truncate block">{e.article_url.replace('https://cry808.com','')}</a>}
                    </td>
                    <td className="px-3 py-2 text-white">{fmt(e.gross_amount)}</td>
                    <td className="px-3 py-2 text-red-400">{fmt(e.fee_amount)}</td>
                    <td className="px-3 py-2 text-green-400 font-medium">{fmt(e.net_amount)}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusBadge[e.payment_status]}`}>{e.payment_status}</span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusBadge[e.payout_status]}`}>{e.payout_status?.replace(/_/g,' ')}</span>
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

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4 py-6 overflow-y-auto">
          <div className="bg-gray-800 border border-gray-700 w-full max-w-xl my-auto">
            <div className="px-5 py-3 border-b border-gray-700 flex items-center justify-between">
              <h3 className="font-bold text-white">{modal.mode === 'add' ? 'Log Revenue' : 'Edit Entry'}</h3>
              <button onClick={() => setModal(null)} className="text-gray-500 hover:text-white text-lg">×</button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Date">
                  <input type="date" className={inp} value={modal.data.date}
                    onChange={e => setModal(m => ({ ...m, data: { ...m.data, date: e.target.value } }))} />
                </Field>
                <Field label="Revenue Source">
                  <select className={sel} value={modal.data.source_id}
                    onChange={e => setModal(m => ({ ...m, data: applySourceDefaults(e.target.value, m.data) }))}>
                    <option value="">— Select Source —</option>
                    {sources.filter(s => s.status !== 'inactive').map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Article Title">
                  <input className={inp} placeholder="Article title..." value={modal.data.article_title}
                    onChange={e => setModal(m => ({ ...m, data: { ...m.data, article_title: e.target.value } }))} />
                </Field>
                <Field label="Client / Artist Name">
                  <input className={inp} placeholder="Client name..." value={modal.data.client_name}
                    onChange={e => setModal(m => ({ ...m, data: { ...m.data, client_name: e.target.value } }))} />
                </Field>
              </div>
              <Field label="Article URL">
                <input className={inp} placeholder="https://cry808.com/article/..." value={modal.data.article_url}
                  onChange={e => setModal(m => ({ ...m, data: { ...m.data, article_url: e.target.value } }))} />
              </Field>
              <div className="grid grid-cols-3 gap-3">
                {[['Gross ($)', 'gross_amount'], ['Fee ($)', 'fee_amount'], ['Net ($)', 'net_amount']].map(([l, k]) => (
                  <Field key={k} label={l}>
                    <input type="number" step="0.01" min="0" className={inp} value={modal.data[k]}
                      onChange={e => setModal(m => ({ ...m, data: { ...m.data, [k]: e.target.value } }))} />
                  </Field>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Payment Status">
                  <select className={sel} value={modal.data.payment_status}
                    onChange={e => setModal(m => ({ ...m, data: { ...m.data, payment_status: e.target.value } }))}>
                    {PAYMENT_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Payout Status">
                  <select className={sel} value={modal.data.payout_status}
                    onChange={e => setModal(m => ({ ...m, data: { ...m.data, payout_status: e.target.value } }))}>
                    {PAYOUT_STATUS.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Notes">
                <textarea className={inp + ' resize-none'} rows={2} value={modal.data.notes}
                  onChange={e => setModal(m => ({ ...m, data: { ...m.data, notes: e.target.value } }))} />
              </Field>
            </div>
            <div className="px-5 py-3 border-t border-gray-700 flex gap-2 justify-end">
              <button onClick={() => setModal(null)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-sm transition-colors">Cancel</button>
              <button onClick={save} disabled={saving} className="px-4 py-2 bg-green-700 hover:bg-green-600 text-sm transition-colors disabled:opacity-50">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
