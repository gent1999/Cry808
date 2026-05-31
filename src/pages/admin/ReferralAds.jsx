import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from '../../assets/cry808_logo.png';

const API_URL = import.meta.env.VITE_API_URL;

const SideIcon = ({ path }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);

function ContentSidePanel() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const active = (to) => pathname === to || (to !== '/admin/dashboard' && pathname.startsWith(to));

  const groups = [
    ['Content', [
      ['New Article',   'M12 5v14M5 12h14',      '/admin/articles/create'],
      ['All Articles',  'M5 6h14M5 12h14M5 18h9', '/admin/articles'],
      ['Submissions',   'M4 13h4l2 3h4l2-3h4M5 5h14l1 8v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5l1-8Z', '/admin/submissions'],
    ]],
    ['Intelligence', [
      ['Cortex', 'M12 2a5 5 0 0 1 5 5c0 2.4-1.7 4.4-4 4.9V21h-2v-9.1C8.7 11.4 7 9.4 7 7a5 5 0 0 1 5-5Z', '/admin/cortex'],
    ]],
    ['Business & Config', [
      ['Finance Hub',     'M12 3v18M8 7h6a3 3 0 0 1 0 6h-4a3 3 0 0 0 0 6h6',          '/admin/finance'],
      ['Ad Settings',     'M12 4v16M4 12h16M7 7l10 10M17 7 7 17',                       '/admin/settings'],
      ['Referral Ads',    'M4 5h16v4H4zM4 11h6v8H4zM12 11h8v8h-8z',                    '/admin/referral-ads'],
      ['Spotify Manager', 'M7 18V6l11 6-11 6Z',                                         '/admin/spotify'],
      ['Amazon Products', 'M5 7h14v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7Zm4 0a3 3 0 0 1 6 0', '/admin/amazon-products'],
    ]],
  ];

  return (
    <aside className="content-side-panel fixed inset-y-0 left-0 z-30 flex w-[264px] flex-col border-r border-white/[0.07] bg-[#0b1019]/95 px-4 py-5 shadow-[20px_0_80px_rgba(0,0,0,.34)] backdrop-blur-xl">
      <button onClick={() => navigate('/admin/dashboard')} className="mb-7 flex items-center gap-3 text-left">
        <span className="grid h-11 w-11 place-items-center overflow-hidden bg-transparent">
          <img src={logo} alt="Cry808" className="h-full w-full object-contain" />
        </span>
        <span>
          <span className="block text-[15px] font-semibold tracking-[.16em] text-white">CRY808</span>
          <span className="block text-[11px] font-medium text-slate-500">Content System</span>
        </span>
      </button>

      <nav className="flex-1 space-y-7 overflow-y-auto pr-1">
        {groups.map(([label, items]) => (
          <div key={label}>
            <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[.16em] text-slate-500/90">{label}</div>
            <div className="space-y-1.5">
              {items.map(([labelText, icon, to]) => {
                const isActive = active(to);
                return (
                  <button
                    key={labelText}
                    onClick={() => navigate(to)}
                    className={`group flex w-full items-center gap-3 border px-3 py-2.5 text-left text-sm transition duration-200 ${
                      isActive
                        ? 'border-sky-300/25 bg-sky-300/10 text-white shadow-[0_16px_44px_rgba(14,165,233,.12)]'
                        : 'border-transparent text-slate-400 hover:border-white/[0.07] hover:bg-white/[0.04] hover:text-slate-100'
                    }`}
                  >
                    <span className={`grid h-8 w-8 place-items-center ${isActive ? 'bg-sky-500/20 text-sky-200' : 'bg-white/[0.04] text-slate-500 group-hover:text-slate-200'}`}>
                      <SideIcon path={icon} />
                    </span>
                    <span className="min-w-0 flex-1 font-medium">{labelText}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}

// ── Empty form state ──────────────────────────────────────────────────────────
const EMPTY = { title: '', link_url: '', display_order: '0' };

export default function ReferralAds() {
  const navigate = useNavigate();

  const [ads,       setAds]       = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [deleting,  setDeleting]  = useState(null);
  const [toggling,  setToggling]  = useState(null);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState('');
  const [form,      setForm]      = useState(EMPTY);
  const [editId,    setEditId]    = useState(null);
  const [preview,   setPreview]   = useState(null); // data URL for preview
  const [imageFile, setImageFile] = useState(null);
  const fileRef = useRef();

  const token = () => localStorage.getItem('adminToken');
  const hdrs  = () => ({ Authorization: `Bearer ${token()}` });

  const flash = (msg, type = 'success') => {
    if (type === 'success') { setSuccess(msg); setTimeout(() => setSuccess(''), 4000); }
    else                    { setError(msg);   setTimeout(() => setError(''), 5000); }
  };

  // ── Load ads ───────────────────────────────────────────────────────────────
  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API_URL}/api/referral-ads/all`, { headers: hdrs() });
      const d = await r.json();
      setAds(d.ads || []);
    } catch (e) { flash(e.message, 'error'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // ── Image picker ───────────────────────────────────────────────────────────
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  // ── Open edit ─────────────────────────────────────────────────────────────
  const openEdit = (ad) => {
    setEditId(ad.id);
    setForm({ title: ad.title || '', link_url: ad.link_url, display_order: String(ad.display_order ?? 0) });
    setPreview(ad.image_url);
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm(EMPTY);
    setPreview(null);
    setImageFile(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  // ── Save (create or update) ────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.link_url.trim()) return flash('Link URL is required', 'error');
    if (!editId && !imageFile) return flash('Please upload an image', 'error');

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('link_url', form.link_url);
      fd.append('display_order', form.display_order || '0');
      if (imageFile) fd.append('image', imageFile);

      const url    = editId ? `${API_URL}/api/referral-ads/${editId}` : `${API_URL}/api/referral-ads`;
      const method = editId ? 'PUT' : 'POST';
      const r = await fetch(url, { method, headers: hdrs(), body: fd });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || 'Save failed');

      flash(editId ? 'Ad updated!' : 'Ad created!');
      cancelEdit();
      load();
    } catch (e) { flash(e.message, 'error'); }
    setSaving(false);
  };

  // ── Toggle active ─────────────────────────────────────────────────────────
  const handleToggle = async (ad) => {
    setToggling(ad.id);
    try {
      const fd = new FormData();
      fd.append('is_active', String(!ad.is_active));
      const r = await fetch(`${API_URL}/api/referral-ads/${ad.id}`, { method: 'PUT', headers: hdrs(), body: fd });
      if (!r.ok) throw new Error('Toggle failed');
      setAds(prev => prev.map(a => a.id === ad.id ? { ...a, is_active: !ad.is_active } : a));
    } catch (e) { flash(e.message, 'error'); }
    setToggling(null);
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!confirm('Delete this ad? This cannot be undone.')) return;
    setDeleting(id);
    try {
      const r = await fetch(`${API_URL}/api/referral-ads/${id}`, { method: 'DELETE', headers: hdrs() });
      if (!r.ok) throw new Error('Delete failed');
      setAds(prev => prev.filter(a => a.id !== id));
      flash('Ad deleted');
    } catch (e) { flash(e.message, 'error'); }
    setDeleting(null);
  };

  return (
    <div className="admin-command-center content-command-center min-h-screen bg-[#070b12] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(59,130,246,.16),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(139,92,246,.14),transparent_30%),linear-gradient(180deg,#070b12_0%,#0a0f1a_48%,#070b12_100%)]" />
      <ContentSidePanel />

      <div className="relative ml-[264px] min-h-screen">

        {/* ── Header ── */}
        <header className="sticky top-0 z-20 border-b border-white/[0.07] bg-[#070b12]/82 px-8 py-3 backdrop-blur-xl">
          <div className="flex h-8 items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/admin/dashboard')}
                className="text-xs text-slate-500 hover:text-slate-200 uppercase tracking-[.16em] font-semibold transition-colors">
                ← Dashboard
              </button>
              <span className="text-gray-700">│</span>
              <span className="text-xs text-sky-300 font-bold uppercase tracking-[.18em]">Referral Ads</span>
            </div>
          </div>
        </header>

        <main className="px-8 py-7 space-y-6 max-w-4xl">

          {/* ── Notifications ── */}
          {error   && <div className="border border-red-800/60 bg-red-950/20 px-4 py-2.5 text-xs font-mono text-red-400 uppercase tracking-wider">{error}</div>}
          {success && <div className="border border-emerald-800/60 bg-emerald-950/20 px-4 py-2.5 text-xs font-mono text-emerald-400 uppercase tracking-wider">{success}</div>}

          {/* ── Create / Edit Form ── */}
          <section className="border border-gray-800/60 bg-[#0a0e14]">
            <div className="border-b border-gray-800/60 px-5 py-3">
              <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-sky-300">
                {editId ? '✎ Edit Ad' : '+ New Referral Ad'}
              </h2>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">

              {/* Image upload */}
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-2">
                  Ad Image <span className="text-red-400">*</span> (square recommended)
                </label>
                <div className="flex items-start gap-4">
                  {/* Preview */}
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="w-24 h-24 flex-shrink-0 border border-gray-700/60 cursor-pointer hover:border-sky-700/60 transition-colors flex items-center justify-center overflow-hidden bg-black/40"
                  >
                    {preview
                      ? <img src={preview} alt="preview" className="w-full h-full object-cover" />
                      : <span className="text-[10px] font-mono text-gray-600 text-center px-2">Click to upload</span>
                    }
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFile}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="text-[10px] font-mono uppercase tracking-wider border border-gray-700/60 text-gray-400 hover:border-sky-700/60 hover:text-sky-300 px-3 py-1.5 transition-colors"
                    >
                      {preview ? 'Change Image' : 'Upload Image'}
                    </button>
                    <p className="text-[10px] font-mono text-gray-600">
                      Square images work best (e.g. 300×300). Max 5 MB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Link URL */}
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1.5">
                  Destination URL <span className="text-red-400">*</span>
                </label>
                <input
                  type="url"
                  value={form.link_url}
                  onChange={e => setForm(f => ({ ...f, link_url: e.target.value }))}
                  placeholder="https://example.com/landing-page"
                  className="w-full bg-black/50 border border-gray-700/60 text-sm text-gray-200 font-mono px-3 py-2 focus:outline-none focus:border-sky-700/60 placeholder-gray-700"
                />
              </div>

              {/* Title (optional) */}
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1.5">
                  Caption / Title <span className="text-gray-600">(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Short description shown under the ad"
                  className="w-full bg-black/50 border border-gray-700/60 text-sm text-gray-200 font-mono px-3 py-2 focus:outline-none focus:border-sky-700/60 placeholder-gray-700"
                />
              </div>

              {/* Display order */}
              <div className="w-32">
                <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1.5">
                  Display Order
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.display_order}
                  onChange={e => setForm(f => ({ ...f, display_order: e.target.value }))}
                  className="w-full bg-black/50 border border-gray-700/60 text-sm text-gray-200 font-mono px-3 py-2 focus:outline-none focus:border-sky-700/60"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="text-[10px] font-mono px-4 py-2 border border-sky-700/60 text-sky-300 hover:bg-sky-950/30 uppercase tracking-wider transition-colors disabled:opacity-40"
                >
                  {saving ? 'Saving…' : editId ? 'Update Ad' : 'Create Ad'}
                </button>
                {editId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="text-[10px] font-mono px-4 py-2 border border-gray-700/50 text-gray-500 hover:border-gray-500 hover:text-gray-300 uppercase tracking-wider transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </section>

          {/* ── Ads List ── */}
          <section className="border border-gray-800/60">
            <div className="border-b border-gray-800/60 px-5 py-3 flex items-center justify-between">
              <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-gray-400">
                All Referral Ads
              </h2>
              <span className="text-[10px] font-mono text-gray-600">{ads.length} total</span>
            </div>

            {loading ? (
              <div className="px-5 py-10 text-center text-xs font-mono text-gray-600 uppercase tracking-widest animate-pulse">
                Loading…
              </div>
            ) : ads.length === 0 ? (
              <div className="px-5 py-10 text-center text-xs font-mono text-gray-600 uppercase tracking-widest">
                No referral ads yet — create one above.
              </div>
            ) : (
              <div className="divide-y divide-gray-800/40">
                {ads.map(ad => (
                  <div key={ad.id} className="flex items-center gap-4 px-5 py-4 hover:bg-[#111827] transition-colors group">
                    {/* Thumbnail */}
                    <img
                      src={ad.image_url}
                      alt={ad.title || 'Ad'}
                      className="w-16 h-16 object-cover flex-shrink-0 border border-gray-800/60"
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-200 truncate">
                        {ad.title || <span className="text-gray-600 italic">No caption</span>}
                      </div>
                      <a
                        href={ad.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-mono text-blue-400 hover:text-blue-300 truncate block mt-0.5"
                      >
                        {ad.link_url}
                      </a>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 border ${
                          ad.is_active
                            ? 'text-emerald-400 border-emerald-800/60'
                            : 'text-gray-600 border-gray-700/40'
                        }`}>
                          {ad.is_active ? 'Active' : 'Hidden'}
                        </span>
                        <span className="text-[10px] font-mono text-gray-600">
                          Order: {ad.display_order}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleToggle(ad)}
                        disabled={toggling === ad.id}
                        title={ad.is_active ? 'Hide ad' : 'Show ad'}
                        className={`text-[10px] font-mono px-2.5 py-1.5 border uppercase tracking-wide transition-colors disabled:opacity-40 ${
                          ad.is_active
                            ? 'border-emerald-800/60 text-emerald-400 hover:bg-emerald-950/20'
                            : 'border-gray-700/50 text-gray-600 hover:border-emerald-800/40 hover:text-emerald-500'
                        }`}
                      >
                        {toggling === ad.id ? '…' : ad.is_active ? 'Hide' : 'Show'}
                      </button>
                      <button
                        onClick={() => openEdit(ad)}
                        className="text-[10px] font-mono px-2.5 py-1.5 border border-gray-700/50 text-gray-400 hover:border-sky-700/60 hover:text-sky-300 uppercase tracking-wide transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(ad.id)}
                        disabled={deleting === ad.id}
                        className="text-[10px] font-mono px-2.5 py-1.5 border border-gray-700/50 text-gray-500 hover:border-red-800/60 hover:text-red-400 uppercase tracking-wide transition-colors disabled:opacity-40"
                      >
                        {deleting === ad.id ? '…' : 'Del'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </main>
      </div>
    </div>
  );
}
