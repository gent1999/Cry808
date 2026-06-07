import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from '../../assets/cry808_logo.png';

const API_URL = import.meta.env.VITE_API_URL;

const SideIcon = ({ path }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);

function SidePanel() {
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
      ['Finance Hub',     'M12 3v18M8 7h6a3 3 0 0 1 0 6h-4a3 3 0 0 0 0 6h6',                '/admin/finance'],
      ['Ad Settings',     'M12 4v16M4 12h16M7 7l10 10M17 7 7 17',                             '/admin/settings'],
      ['Referral Ads',    'M4 5h16v4H4zM4 11h6v8H4zM12 11h8v8h-8z',                          '/admin/referral-ads'],
      ['Newsletter',      'M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z', '/admin/newsletter'],
      ['Spotify Manager', 'M7 18V6l11 6-11 6Z',                                               '/admin/spotify'],
      ['Amazon Products', 'M5 7h14v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7Zm4 0a3 3 0 0 1 6 0',  '/admin/amazon-products'],
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
                  <button key={labelText} onClick={() => navigate(to)}
                    className={`group flex w-full items-center gap-3 border px-3 py-2.5 text-left text-sm transition duration-200 ${
                      isActive
                        ? 'border-sky-300/25 bg-sky-300/10 text-white'
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

const fmt = d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit', hour: '2-digit', minute: '2-digit' });

export default function Newsletter() {
  const navigate = useNavigate();

  // Form state
  const [subject,    setSubject]    = useState('');
  const [introText,  setIntroText]  = useState('');
  const [imageUrl,   setImageUrl]   = useState('');
  const [imageFile,  setImageFile]  = useState(null);
  const [preview,    setPreview]    = useState(null);

  // Status
  const [uploading,  setUploading]  = useState(false);
  const [sending,    setSending]    = useState(false);
  const [sendResult, setSendResult] = useState(null);
  const [error,      setError]      = useState('');

  // Data
  const [subCount,      setSubCount]      = useState(null);
  const [sends,         setSends]         = useState([]);
  const [sendsLoading,  setSendsLoading]  = useState(true);
  const [subscribers,   setSubscribers]   = useState([]);
  const [subsLoading,   setSubsLoading]   = useState(true);
  const [subSearch,     setSubSearch]     = useState('');
  const [subFilter,     setSubFilter]     = useState('active'); // 'all' | 'active' | 'inactive'

  const fileRef = useRef();
  const token   = () => localStorage.getItem('adminToken');
  const hdrs    = () => ({ Authorization: `Bearer ${token()}` });

  // Load subscribers + send history
  useEffect(() => {
    fetch(`${API_URL}/api/newsletter/subscribers`, { headers: hdrs() })
      .then(r => r.json())
      .then(d => {
        setSubCount(d.active_count ?? d.count ?? 0);
        setSubscribers(d.subscribers || []);
      })
      .catch(() => {})
      .finally(() => setSubsLoading(false));

    fetch(`${API_URL}/api/newsletter/sends`, { headers: hdrs() })
      .then(r => r.json())
      .then(d => setSends(d.sends || []))
      .catch(() => {})
      .finally(() => setSendsLoading(false));
  }, []);

  // Handle image file selection
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
    setImageUrl(''); // will be set after upload
  };

  // Upload cover directly to Cloudinary (browser → Cloudinary, no server proxy)
  // Step 1: fetch signing params from our server (tiny GET, no file data)
  // Step 2: POST the file straight to api.cloudinary.com with those params
  // This avoids Vercel body-size limits and function timeouts entirely.
  const uploadCover = async () => {
    if (!imageFile) return imageUrl; // already uploaded or URL provided
    setUploading(true);
    try {
      // ── 1. Get Cloudinary signing params ─────────────────────────────────
      const paramsRes = await fetch(`${API_URL}/api/newsletter/upload-params`, {
        headers: hdrs(),
      });
      const params = await paramsRes.json();
      if (!paramsRes.ok) throw new Error(params.message || 'Could not get upload params');

      // ── 2. Upload file directly to Cloudinary ────────────────────────────
      const fd = new FormData();
      fd.append('file',      imageFile);
      fd.append('api_key',   params.api_key);
      fd.append('timestamp', params.timestamp);
      fd.append('signature', params.signature);
      fd.append('folder',    params.folder);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${params.cloud_name}/image/upload`,
        { method: 'POST', body: fd }
      );
      const data = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(data.error?.message || 'Cloudinary upload failed');

      setImageUrl(data.secure_url);
      setUploading(false);
      return data.secure_url;
    } catch (e) {
      setError(e.message);
      setUploading(false);
      return null;
    }
  };

  // Send newsletter
  const handleSend = async (isTest) => {
    setError('');
    setSendResult(null);

    if (!subject.trim()) return setError('Subject line is required');
    if (!imageFile && !imageUrl) return setError('Please upload a magazine cover image');

    if (!isTest) {
      const confirmed = window.confirm(
        `This will send the newsletter to all ${subCount ?? '?'} active subscribers.\n\nAre you sure?`
      );
      if (!confirmed) return;
    }

    setSending(true);
    try {
      // Upload image first if needed
      const finalImageUrl = await uploadCover();
      if (!finalImageUrl) { setSending(false); return; }

      const r = await fetch(`${API_URL}/api/newsletter/send`, {
        method: 'POST',
        headers: { ...hdrs(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subject.trim(),
          image_url: finalImageUrl,
          intro_text: introText.trim() || null,
          is_test: isTest,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || 'Send failed');

      setSendResult({ ...d, isTest });

      // Refresh history
      const histRes = await fetch(`${API_URL}/api/newsletter/sends`, { headers: hdrs() });
      const histData = await histRes.json();
      setSends(histData.sends || []);
    } catch (e) {
      setError(e.message);
    }
    setSending(false);
  };

  const canSend = subject.trim() && (imageFile || imageUrl);

  return (
    <div className="admin-command-center content-command-center min-h-screen bg-[#070b12] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(59,130,246,.16),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(139,92,246,.14),transparent_30%)]" />
      <SidePanel />

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
              <span className="text-xs text-sky-300 font-bold uppercase tracking-[.18em]">Newsletter</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-gray-500 border border-gray-800 px-2.5 py-1">
                {subCount === null ? '…' : subCount} active subscribers
              </span>
            </div>
          </div>
        </header>

        <main className="px-8 py-7">
          <div className="flex gap-6 items-start max-w-6xl">

            {/* ── LEFT: Compose ── */}
            <div className="flex-1 min-w-0 space-y-5">

              {/* Notifications */}
              {error && (
                <div className="border border-red-800/60 bg-red-950/20 px-4 py-2.5 text-xs font-mono text-red-400 uppercase tracking-wider">
                  {error}
                </div>
              )}
              {sendResult && (
                <div className={`border px-4 py-3 text-xs font-mono uppercase tracking-wider ${
                  sendResult.errors?.length
                    ? 'border-amber-800/60 bg-amber-950/20 text-amber-400'
                    : 'border-emerald-800/60 bg-emerald-950/20 text-emerald-400'
                }`}>
                  ✓ {sendResult.message}
                  {sendResult.errors?.length > 0 && (
                    <div className="mt-1 text-amber-500/70 normal-case">
                      Failed: {sendResult.errors.map(e => e.email).join(', ')}
                    </div>
                  )}
                </div>
              )}

              {/* Cover Image */}
              <section className="border border-gray-800/60 bg-[#0a0e14]">
                <div className="border-b border-gray-800/60 px-5 py-3">
                  <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-sky-300">
                    1 — Magazine Cover
                  </h2>
                </div>
                <div className="p-5">
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />

                  {preview ? (
                    <div className="flex items-start gap-4">
                      <img src={preview} alt="cover preview" className="w-32 h-32 object-cover border border-gray-700/60 flex-shrink-0" />
                      <div className="space-y-2 pt-1">
                        <p className="text-xs font-mono text-gray-400">Cover ready</p>
                        <button
                          type="button"
                          onClick={() => fileRef.current?.click()}
                          className="text-[10px] font-mono uppercase tracking-wider border border-gray-700/60 text-gray-400 hover:border-sky-700/60 hover:text-sky-300 px-3 py-1.5 transition-colors"
                        >
                          Change Image
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="w-full h-36 border border-dashed border-gray-700/60 hover:border-sky-700/60 flex flex-col items-center justify-center gap-2 transition-colors group"
                    >
                      <svg className="w-8 h-8 text-gray-700 group-hover:text-sky-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2 1.586-1.586a2 2 0 0 1 2.828 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
                      </svg>
                      <span className="text-[11px] font-mono text-gray-600 group-hover:text-gray-400 uppercase tracking-wider">
                        Upload your magazine cover
                      </span>
                      <span className="text-[10px] font-mono text-gray-700">JPG or PNG, up to 10 MB</span>
                    </button>
                  )}
                </div>
              </section>

              {/* Subject */}
              <section className="border border-gray-800/60 bg-[#0a0e14]">
                <div className="border-b border-gray-800/60 px-5 py-3">
                  <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-sky-300">
                    2 — Subject Line
                  </h2>
                </div>
                <div className="p-5">
                  <input
                    type="text"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="e.g. Cry808 Issue #1 — The Underground Is Rising"
                    className="w-full bg-black/50 border border-gray-700/60 text-sm text-gray-200 font-mono px-3 py-2.5 focus:outline-none focus:border-sky-700/60 placeholder-gray-700"
                  />
                  <p className="mt-2 text-[10px] font-mono text-gray-600">
                    This is the subject line subscribers see in their inbox.
                  </p>
                </div>
              </section>

              {/* Intro text */}
              <section className="border border-gray-800/60 bg-[#0a0e14]">
                <div className="border-b border-gray-800/60 px-5 py-3">
                  <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-sky-300">
                    3 — Intro Text <span className="text-gray-600 font-normal normal-case tracking-normal">(optional)</span>
                  </h2>
                </div>
                <div className="p-5">
                  <textarea
                    value={introText}
                    onChange={e => setIntroText(e.target.value)}
                    rows={4}
                    placeholder="Short message shown above the cover image, e.g. 'Issue 1 is finally here. Tap in.'"
                    className="w-full bg-black/50 border border-gray-700/60 text-sm text-gray-200 font-mono px-3 py-2.5 focus:outline-none focus:border-sky-700/60 placeholder-gray-700 resize-none"
                  />
                </div>
              </section>

              {/* Send Buttons */}
              <section className="border border-gray-800/60 bg-[#0a0e14]">
                <div className="border-b border-gray-800/60 px-5 py-3">
                  <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-sky-300">
                    4 — Send
                  </h2>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    {/* Test send */}
                    <button
                      onClick={() => handleSend(true)}
                      disabled={!canSend || sending || uploading}
                      className="text-[11px] font-mono px-4 py-2.5 border border-amber-700/60 text-amber-400 hover:bg-amber-950/20 uppercase tracking-wider transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {sending || uploading ? '…' : '⚑ Send Test Email'}
                    </button>

                    {/* Send to all */}
                    <button
                      onClick={() => handleSend(false)}
                      disabled={!canSend || sending || uploading}
                      className="text-[11px] font-mono px-4 py-2.5 border border-sky-700/60 text-sky-300 hover:bg-sky-950/20 uppercase tracking-wider transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {sending || uploading ? (uploading ? 'Uploading image…' : 'Sending…') : `✉ Send to All ${subCount ?? '?'} Subscribers`}
                    </button>
                  </div>

                  <p className="text-[10px] font-mono text-gray-600">
                    Test email goes to <span className="text-gray-500">tamerbots@gmail.com</span> only.
                    Use it to verify layout before the real send.
                  </p>
                </div>
              </section>

            </div>

            {/* ── RIGHT: Email Preview ── */}
            <div className="w-80 flex-shrink-0">
              <div className="sticky top-20">
                <div className="border border-gray-800/60 bg-[#0a0e14]">
                  <div className="border-b border-gray-800/60 px-4 py-3">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-gray-400">
                      Email Preview
                    </h3>
                  </div>

                  {/* Mini email mockup */}
                  <div className="p-4">
                    <div className="bg-black border border-gray-800/60 overflow-hidden">
                      {/* Email header bar */}
                      <div className="px-4 py-3 border-b border-gray-800/60">
                        <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-white">CRY808</p>
                        <p className="text-[9px] text-gray-600 uppercase tracking-widest mt-0.5">Hip-Hop News &amp; Culture</p>
                      </div>
                      {/* Subject preview */}
                      <div className="px-4 py-2 border-b border-gray-800/40">
                        <p className="text-[10px] font-mono text-gray-500">Subject:</p>
                        <p className="text-[11px] text-gray-200 mt-0.5 line-clamp-2">
                          {subject || <span className="text-gray-700 italic">Your subject line…</span>}
                        </p>
                      </div>
                      {/* Intro text preview */}
                      {introText && (
                        <div className="px-4 py-3 border-b border-gray-800/40">
                          <p className="text-[10px] text-gray-400 line-clamp-3">{introText}</p>
                        </div>
                      )}
                      {/* Cover image */}
                      {preview ? (
                        <img src={preview} alt="cover" className="w-full object-cover" />
                      ) : (
                        <div className="w-full h-40 bg-gray-900/60 flex items-center justify-center">
                          <span className="text-[9px] font-mono text-gray-700 uppercase tracking-widest">Magazine cover here</span>
                        </div>
                      )}
                      {/* CTA */}
                      <div className="px-4 py-4 flex justify-center">
                        <div className="px-4 py-2 text-[9px] font-bold uppercase tracking-widest text-white"
                          style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899)' }}>
                          Read More on Cry808 →
                        </div>
                      </div>
                      {/* Footer */}
                      <div className="px-4 py-3 border-t border-gray-800/40 text-center">
                        <p className="text-[8px] text-gray-700">You're receiving this because you subscribed.</p>
                        <p className="text-[8px] text-gray-700 mt-0.5 underline">Unsubscribe</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ── Send History ── */}
          <div className="mt-8 max-w-6xl">
            <div className="border border-gray-800/60">
              <div className="border-b border-gray-800/60 px-5 py-3 flex items-center justify-between">
                <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-gray-400">
                  Send History
                </h2>
                <span className="text-[10px] font-mono text-gray-600">{sends.length} campaigns</span>
              </div>

              {sendsLoading ? (
                <div className="px-5 py-8 text-center text-xs font-mono text-gray-600 uppercase tracking-widest animate-pulse">
                  Loading…
                </div>
              ) : sends.length === 0 ? (
                <div className="px-5 py-8 text-center text-xs font-mono text-gray-600 uppercase tracking-widest">
                  No newsletters sent yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="border-b border-gray-800/60 bg-[#0d1420]">
                        {['Subject', 'Recipients', 'Type', 'Sent At'].map(h => (
                          <th key={h} className="px-4 py-2.5 text-[10px] font-mono text-gray-500 uppercase tracking-widest text-left">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sends.map((s, i) => (
                        <tr key={s.id}
                          className={`border-b border-gray-800/40 ${i % 2 === 0 ? 'bg-[#0a0e14]' : 'bg-black'} hover:bg-[#111827] transition-colors`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {s.image_url && (
                                <img src={s.image_url} alt="" className="w-8 h-8 object-cover flex-shrink-0 border border-gray-800/60" />
                              )}
                              <span className="text-sm text-gray-200 line-clamp-1">{s.subject}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm font-mono text-sky-300">{s.recipient_count}</td>
                          <td className="px-4 py-3">
                            <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 border ${
                              s.is_test
                                ? 'text-amber-400 border-amber-800/60'
                                : 'text-emerald-400 border-emerald-800/60'
                            }`}>
                              {s.is_test ? 'Test' : 'Live'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[11px] font-mono text-gray-500">{fmt(s.sent_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* ── Subscribers ── */}
          {(() => {
            const filtered = subscribers
              .filter(s => subFilter === 'all' ? true : subFilter === 'active' ? s.is_active : !s.is_active)
              .filter(s => s.email.toLowerCase().includes(subSearch.toLowerCase()));
            const totalActive   = subscribers.filter(s => s.is_active).length;
            const totalInactive = subscribers.filter(s => !s.is_active).length;

            return (
              <div className="mt-6 max-w-6xl">
                <div className="border border-gray-800/60">

                  {/* Header */}
                  <div className="border-b border-gray-800/60 px-5 py-3 flex flex-wrap items-center gap-3">
                    <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-gray-400 mr-auto">
                      Subscribers
                    </h2>
                    {/* Stats chips */}
                    <span className="text-[10px] font-mono text-emerald-400 border border-emerald-800/50 px-2 py-0.5">
                      {totalActive} active
                    </span>
                    <span className="text-[10px] font-mono text-gray-600 border border-gray-800 px-2 py-0.5">
                      {totalInactive} inactive
                    </span>
                  </div>

                  {/* Controls */}
                  <div className="border-b border-gray-800/60 px-5 py-3 flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[180px]">
                      <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        value={subSearch}
                        onChange={e => setSubSearch(e.target.value)}
                        placeholder="Search email…"
                        className="w-full bg-black/40 border border-gray-800 pl-8 pr-3 py-1.5 text-[11px] font-mono text-gray-300 placeholder-gray-700 focus:outline-none focus:border-sky-800"
                      />
                    </div>
                    {/* Filter tabs */}
                    <div className="flex items-center gap-1">
                      {[['active','Active'],['inactive','Inactive'],['all','All']].map(([val, label]) => (
                        <button key={val} onClick={() => setSubFilter(val)}
                          className={`text-[10px] font-mono uppercase tracking-wider px-3 py-1.5 border transition-colors ${
                            subFilter === val
                              ? 'border-sky-700/60 bg-sky-950/30 text-sky-300'
                              : 'border-gray-800 text-gray-600 hover:text-gray-400 hover:border-gray-700'
                          }`}>
                          {label}
                        </button>
                      ))}
                    </div>
                    <span className="text-[10px] font-mono text-gray-700 ml-auto">{filtered.length} shown</span>
                  </div>

                  {/* Table */}
                  {subsLoading ? (
                    <div className="px-5 py-8 text-center text-xs font-mono text-gray-600 uppercase tracking-widest animate-pulse">
                      Loading…
                    </div>
                  ) : filtered.length === 0 ? (
                    <div className="px-5 py-8 text-center text-xs font-mono text-gray-600 uppercase tracking-widest">
                      {subscribers.length === 0 ? 'No subscribers yet.' : 'No results.'}
                    </div>
                  ) : (
                    <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
                      <table className="w-full min-w-[480px]">
                        <thead className="sticky top-0 z-10">
                          <tr className="border-b border-gray-800/60 bg-[#0d1420]">
                            {['Email', 'Subscribed', 'Status'].map(h => (
                              <th key={h} className="px-4 py-2.5 text-[10px] font-mono text-gray-500 uppercase tracking-widest text-left">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.map((s, i) => (
                            <tr key={s.id}
                              className={`border-b border-gray-800/40 ${i % 2 === 0 ? 'bg-[#0a0e14]' : 'bg-black'} hover:bg-[#111827] transition-colors`}>
                              <td className="px-4 py-2.5 text-[12px] font-mono text-gray-300">{s.email}</td>
                              <td className="px-4 py-2.5 text-[11px] font-mono text-gray-600 whitespace-nowrap">{fmt(s.subscribed_at)}</td>
                              <td className="px-4 py-2.5">
                                <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 border ${
                                  s.is_active
                                    ? 'text-emerald-400 border-emerald-800/60'
                                    : 'text-gray-600 border-gray-800'
                                }`}>
                                  {s.is_active ? 'Active' : 'Unsubscribed'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

        </main>
      </div>
    </div>
  );
}
