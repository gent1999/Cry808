import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL;
const SITE = 'cry808';

const PAYMENT_STATUS = ['pending', 'paid', 'cancelled'];
const PAYOUT_STATUS  = ['not_ready', 'ready_for_payout', 'paid_out'];
const EXPENSE_PAYMENT = ['paid', 'pending'];
const CATEGORIES = ['domain', 'hosting', 'software', 'ads', 'other'];
const CYCLES     = ['one_time', 'monthly', 'yearly'];

const today = () => new Date().toISOString().split('T')[0];

const BLANK = {
  income: {
    date: today(), source_id: '', article_title: '', article_url: '',
    client_name: '', gross_amount: '', fee_amount: '', net_amount: '',
    payment_status: 'pending', payout_status: 'not_ready', notes: '',
  },
  expense: {
    date: today(), name: '', category: 'other', amount: '', billing_cycle: 'one_time',
    vendor: '', renewal_date: '', payment_status: 'paid', notes: '',
  },
  payout: {
    date: today(), source_id: '', amount: '', notes: '', mark_entries_paid: true,
  },
};

// Reconstructs a per-type edit payload from a row returned by
// GET /api/finance/transactions (see Server808 routes/finance.js).
export function editDataFromTransaction(row) {
  if (row.kind === 'income') {
    return {
      id: row.id, date: row.date?.slice(0, 10) || today(), source_id: row.source_id || '',
      article_title: row.article_title || '', article_url: row.article_url || '',
      client_name: row.client_name || '', gross_amount: row.gross_amount ?? '',
      fee_amount: row.fee_amount ?? '', net_amount: row.net_amount ?? '',
      payment_status: row.payment_status || 'pending', payout_status: row.payout_status || 'not_ready',
      notes: row.notes || '',
    };
  }
  if (row.kind === 'expense') {
    return {
      id: row.id, name: row.description || '', category: row.category || 'other',
      amount: row.net_amount ?? '', billing_cycle: row.billing_cycle || 'one_time',
      vendor: row.vendor || '', renewal_date: row.renewal_date?.slice(0, 10) || '',
      payment_status: row.payment_status || 'paid', notes: row.notes || '',
    };
  }
  // payouts have no edit capability upstream (only add/delete) — kept as-is
  return { id: row.id, source_id: row.source_id || '', amount: row.amount ?? '', date: row.date?.slice(0, 10) || today(), notes: row.notes || '' };
}

const inp = 'bg-gray-700 border border-gray-600 text-white text-sm px-3 py-2 w-full focus:outline-none focus:border-gray-500';
const sel = inp + ' cursor-pointer';

const Field = ({ label, children }) => (
  <div>
    <label className="block text-xs text-gray-400 mb-1">{label}</label>
    {children}
  </div>
);

const TYPE_META = {
  income:  { label: 'Income',  accent: 'bg-green-700 hover:bg-green-600', ring: 'border-green-500 bg-green-950/30 text-green-300' },
  expense: { label: 'Expense', accent: 'bg-red-800 hover:bg-red-700',     ring: 'border-red-500 bg-red-950/30 text-red-300' },
  payout:  { label: 'Payout',  accent: 'bg-purple-700 hover:bg-purple-600', ring: 'border-purple-500 bg-purple-950/30 text-purple-300' },
};

// One unified Add/Edit Transaction modal. `mode` is 'add' | 'edit'.
// For 'edit', `type` is locked to the transaction's existing kind (income/expense/payout
// are separate tables — converting one into another isn't a supported operation).
export default function TransactionModal({ mode, type: initialType, data: initialData, sources, onClose, onSaved }) {
  const [type, setType] = useState(initialType);
  const [data, setData] = useState(initialData || BLANK[initialType]);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const token = () => localStorage.getItem('adminToken');
  const hdrs  = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` });

  const switchType = (t) => {
    setType(t);
    setData(BLANK[t]);
  };

  const set = (patch) => setData(d => ({ ...d, ...patch }));

  const applySourceDefaults = (sourceId) => {
    const src = sources.find(s => s.id === +sourceId);
    if (!src) { set({ source_id: sourceId }); return; }
    const gross = parseFloat(src.default_gross) || 0;
    let fee = 0;
    if (src.fee_type === 'percentage') fee = gross * (parseFloat(src.fee_value) / 100);
    else if (src.fee_type === 'fixed') fee = parseFloat(src.fee_value) || 0;
    set({ source_id: sourceId, gross_amount: gross || '', fee_amount: fee || '', net_amount: (gross - fee) || '' });
  };

  const endpointFor = (t) => ({ income: 'entries', expense: 'expenses', payout: 'payouts' }[t]);

  const save = async () => {
    setErrorMsg('');
    if (type === 'expense' && !data.name) { setErrorMsg('Name is required'); return; }
    if (type !== 'expense' && (!data.source_id || (type === 'payout' && !data.amount))) {
      setErrorMsg('Source is required'); return;
    }
    setSaving(true);
    try {
      const base   = `${API_URL}/api/finance/${endpointFor(type)}`;
      const url    = mode === 'add' ? `${base}?site=${SITE}` : `${base}/${data.id}?site=${SITE}`;
      const method = mode === 'add' ? 'POST' : 'PUT';
      const r = await fetch(url, { method, headers: hdrs(), body: JSON.stringify({ ...data, site: SITE }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { setErrorMsg(d.message || `Save failed (${r.status})`); setSaving(false); return; }
      onSaved();
    } catch (e) { setErrorMsg(e.message); }
    setSaving(false);
  };

  const meta = TYPE_META[type];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4 py-6 overflow-y-auto">
      <div className="bg-gray-800 border border-gray-700 w-full max-w-xl my-auto">
        <div className="px-5 py-3 border-b border-gray-700 flex items-center justify-between">
          <h3 className="font-bold text-white">{mode === 'add' ? 'Add Transaction' : `Edit ${meta.label}`}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-lg">×</button>
        </div>

        <div className="px-5 py-4 space-y-3">
          {/* Type selector — locked once editing an existing record */}
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(TYPE_META).map(([t, m]) => (
              <button key={t} type="button" disabled={mode === 'edit'}
                onClick={() => switchType(t)}
                className={`border px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                  type === t ? m.ring : 'border-gray-700 text-gray-500 hover:border-gray-600'
                }`}>
                {m.label}
              </button>
            ))}
          </div>

          {type === 'income' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Date">
                  <input type="date" className={inp} value={data.date} onChange={e => set({ date: e.target.value })} />
                </Field>
                <Field label="Revenue Source">
                  <select className={sel} value={data.source_id} onChange={e => applySourceDefaults(e.target.value)}>
                    <option value="">— Select Source —</option>
                    {sources.filter(s => s.status !== 'inactive').map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Article Title">
                  <input className={inp} placeholder="Article title..." value={data.article_title} onChange={e => set({ article_title: e.target.value })} />
                </Field>
                <Field label="Client / Artist Name">
                  <input className={inp} placeholder="Client name..." value={data.client_name} onChange={e => set({ client_name: e.target.value })} />
                </Field>
              </div>
              <Field label="Article / Client URL">
                <input className={inp} placeholder="https://cry808.com/article/..." value={data.article_url} onChange={e => set({ article_url: e.target.value })} />
              </Field>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Gross ($)"><input type="number" step="0.01" min="0" className={inp} value={data.gross_amount} onChange={e => set({ gross_amount: e.target.value })} /></Field>
                <Field label="Fee ($)"><input type="number" step="0.01" min="0" className={inp} value={data.fee_amount} onChange={e => set({ fee_amount: e.target.value })} /></Field>
                <Field label="Net ($)"><input type="number" step="0.01" min="0" className={inp} value={data.net_amount} onChange={e => set({ net_amount: e.target.value })} /></Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Payment Status">
                  <select className={sel} value={data.payment_status} onChange={e => set({ payment_status: e.target.value })}>
                    {PAYMENT_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Payout Status">
                  <select className={sel} value={data.payout_status} onChange={e => set({ payout_status: e.target.value })}>
                    {PAYOUT_STATUS.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Notes"><textarea className={inp + ' resize-none'} rows={2} value={data.notes} onChange={e => set({ notes: e.target.value })} /></Field>
            </>
          )}

          {type === 'expense' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Name"><input className={inp} placeholder="Namecheap domain..." value={data.name} onChange={e => set({ name: e.target.value })} /></Field>
                <Field label="Vendor"><input className={inp} placeholder="Namecheap, Vercel, etc." value={data.vendor} onChange={e => set({ vendor: e.target.value })} /></Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Category">
                  <select className={sel} value={data.category} onChange={e => set({ category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Billing Cycle">
                  <select className={sel} value={data.billing_cycle} onChange={e => set({ billing_cycle: e.target.value })}>
                    {CYCLES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Amount ($)"><input type="number" step="0.01" min="0" className={inp} value={data.amount} onChange={e => set({ amount: e.target.value })} /></Field>
                <Field label="Payment Status">
                  <select className={sel} value={data.payment_status} onChange={e => set({ payment_status: e.target.value })}>
                    {EXPENSE_PAYMENT.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Renewal Date (optional)">
                <input type="date" className={inp} value={data.renewal_date} onChange={e => set({ renewal_date: e.target.value })} />
              </Field>
              <Field label="Notes"><textarea className={inp + ' resize-none'} rows={2} value={data.notes} onChange={e => set({ notes: e.target.value })} /></Field>
            </>
          )}

          {type === 'payout' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Revenue Source">
                  <select className={sel} value={data.source_id} onChange={e => set({ source_id: e.target.value })}>
                    <option value="">— Select Source —</option>
                    {sources.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </Field>
                <Field label="Amount ($)"><input type="number" step="0.01" min="0" className={inp} value={data.amount} onChange={e => set({ amount: e.target.value })} /></Field>
              </div>
              <Field label="Date"><input type="date" className={inp} value={data.date} onChange={e => set({ date: e.target.value })} /></Field>
              <Field label="Notes"><input className={inp} placeholder="Optional notes..." value={data.notes} onChange={e => set({ notes: e.target.value })} /></Field>
              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input type="checkbox" checked={!!data.mark_entries_paid} onChange={e => set({ mark_entries_paid: e.target.checked })} className="accent-purple-500" />
                Mark related revenue entries as paid out
              </label>
            </>
          )}

          {errorMsg && <div className="text-xs text-red-400 border border-red-900/60 bg-red-950/20 px-3 py-2">{errorMsg}</div>}
        </div>

        <div className="px-5 py-3 border-t border-gray-700 flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-sm transition-colors">Cancel</button>
          <button onClick={save} disabled={saving} className={`px-4 py-2 text-sm text-white transition-colors disabled:opacity-50 ${meta.accent}`}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
