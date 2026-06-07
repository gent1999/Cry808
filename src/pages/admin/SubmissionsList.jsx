import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../../assets/cry808_logo.png';

const API_URL = import.meta.env.VITE_API_URL;

// ── Side panel ────────────────────────────────────────────────────────────────
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
      ['New Article',   'M12 5v14M5 12h14',       '/admin/articles/create'],
      ['All Articles',  'M5 6h14M5 12h14M5 18h9',  '/admin/articles'],
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

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtPrice  = cents => `$${(cents / 100).toFixed(2)}`;
const fmtDate   = d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
const fmtFull   = d => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

const statusStyle = {
  pending:  'text-amber-400 border-amber-700/60',
  approved: 'text-emerald-400 border-emerald-700/60',
  rejected: 'text-red-400 border-red-800/60',
};

const typeStyle = {
  featured: 'text-yellow-400 border-yellow-700/60',
  regular:  'text-sky-400 border-sky-800/60',
};

// ── Main component ─────────────────────────────────────────────────────────────
const SubmissionsList = () => {
  const navigate = useNavigate();
  const [submissions,       setSubmissions]       = useState([]);
  const [loading,           setLoading]           = useState(true);
  const [error,             setError]             = useState('');
  const [successMessage,    setSuccessMessage]    = useState('');
  const [selectedSubmission,setSelectedSubmission]= useState(null);
  const [publishingId,      setPublishingId]      = useState(null);
  const [filterStatus,      setFilterStatus]      = useState('all');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) { navigate('/admin/login'); return; }

    fetch(`${API_URL}/api/submissions`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => {
        if (r.status === 401) { navigate('/admin/login'); return null; }
        if (!r.ok) throw new Error('Failed to fetch submissions');
        return r.json();
      })
      .then(d => d && setSubmissions(d.submissions))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [navigate]);

  const handlePublish = async (id) => {
    if (!window.confirm('Publish this submission as an article?')) return;
    setPublishingId(id);
    setError('');
    try {
      const token = localStorage.getItem('adminToken');
      const r = await fetch(`${API_URL}/api/submissions/${id}/publish`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` },
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || 'Failed to publish');
      setSubmissions(prev => prev.map(s => s.id === id ? { ...s, submission_status: 'approved' } : s));
      if (selectedSubmission?.id === id) setSelectedSubmission(s => ({ ...s, submission_status: 'approved' }));
      setSuccessMessage(`"${d.article.title}" published!`);
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setPublishingId(null);
    }
  };

  const handleStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('adminToken');
      const r = await fetch(`${API_URL}/api/submissions/${id}/status`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || 'Failed to update status');
      setSubmissions(prev => prev.map(s => s.id === id ? { ...s, submission_status: status } : s));
      if (selectedSubmission?.id === id) setSelectedSubmission(s => ({ ...s, submission_status: status }));
      setSuccessMessage('Status updated.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const pending  = submissions.filter(s => s.submission_status === 'pending').length;
  const approved = submissions.filter(s => s.submission_status === 'approved').length;

  const filtered = filterStatus === 'all'
    ? submissions
    : submissions.filter(s => s.submission_status === filterStatus);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b12] flex items-center justify-center">
        <span className="text-xs font-mono text-gray-600 uppercase tracking-widest animate-pulse">Loading…</span>
      </div>
    );
  }

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
              <span className="text-xs text-sky-300 font-bold uppercase tracking-[.18em]">Submissions</span>
            </div>
            <div className="flex items-center gap-2">
              {pending > 0 && (
                <span className="text-[10px] font-mono text-amber-400 border border-amber-800/60 px-2.5 py-1">
                  {pending} pending
                </span>
              )}
              <span className="text-[10px] font-mono text-gray-500 border border-gray-800 px-2.5 py-1">
                {submissions.length} total
              </span>
            </div>
          </div>
        </header>

        <main className="px-8 py-7">

          {/* Notifications */}
          {error && (
            <div className="mb-5 border border-red-800/60 bg-red-950/20 px-4 py-2.5 text-xs font-mono text-red-400 uppercase tracking-wider">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="mb-5 border border-emerald-800/60 bg-emerald-950/20 px-4 py-2.5 text-xs font-mono text-emerald-400 uppercase tracking-wider">
              ✓ {successMessage}
            </div>
          )}

          {/* ── Filter tabs ── */}
          <div className="flex items-center gap-1 mb-5">
            {[['all','All'], ['pending','Pending'], ['approved','Published'], ['rejected','Rejected']].map(([val, label]) => (
              <button key={val} onClick={() => setFilterStatus(val)}
                className={`text-[10px] font-mono uppercase tracking-wider px-3 py-1.5 border transition-colors ${
                  filterStatus === val
                    ? 'border-sky-700/60 bg-sky-950/30 text-sky-300'
                    : 'border-gray-800 text-gray-600 hover:text-gray-400 hover:border-gray-700'
                }`}>
                {label}
              </button>
            ))}
          </div>

          {/* ── Empty state ── */}
          {filtered.length === 0 ? (
            <div className="border border-gray-800/60 bg-[#0a0e14] px-6 py-16 text-center">
              <p className="text-xs font-mono text-gray-600 uppercase tracking-widest">
                {submissions.length === 0 ? 'No submissions yet.' : 'No submissions match this filter.'}
              </p>
            </div>
          ) : (
            /* ── Table ── */
            <div className="border border-gray-800/60">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-gray-800/60 bg-[#0d1420]">
                      {['Artist / Track', 'Type', 'Amount', 'Status', 'Submitted', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-2.5 text-[10px] font-mono text-gray-500 uppercase tracking-widest text-left whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s, i) => (
                      <tr key={s.id}
                        className={`border-b border-gray-800/40 ${i % 2 === 0 ? 'bg-[#0a0e14]' : 'bg-black'} hover:bg-[#111827] transition-colors`}>

                        {/* Artist / track */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {s.image_url ? (
                              <img src={s.image_url} alt="" className="w-9 h-9 object-cover border border-gray-800 flex-shrink-0" />
                            ) : (
                              <div className="w-9 h-9 bg-gray-900 border border-gray-800 flex-shrink-0 flex items-center justify-center">
                                <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                </svg>
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="text-sm text-gray-200 font-medium truncate max-w-[180px]">{s.artist_name}</div>
                              {s.title && <div className="text-[11px] text-gray-600 font-mono truncate max-w-[180px]">"{s.title}"</div>}
                            </div>
                          </div>
                        </td>

                        {/* Type */}
                        <td className="px-4 py-3">
                          <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 border ${typeStyle[s.submission_type] || typeStyle.regular}`}>
                            {s.submission_type === 'featured' ? '🏆 Featured' : '📰 Regular'}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="px-4 py-3 text-sm font-mono text-emerald-400">{fmtPrice(s.payment_amount)}</td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 border ${statusStyle[s.submission_status] || 'text-gray-500 border-gray-800'}`}>
                            {s.submission_status}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3 text-[11px] font-mono text-gray-600 whitespace-nowrap">{fmtDate(s.created_at)}</td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => setSelectedSubmission(s)}
                              className="text-[10px] font-mono px-2.5 py-1.5 border border-gray-700/60 text-gray-400 hover:border-sky-700/60 hover:text-sky-300 transition-colors whitespace-nowrap">
                              Details
                            </button>
                            {s.submission_status === 'pending' && (
                              <>
                                <button onClick={() => handlePublish(s.id)} disabled={publishingId === s.id}
                                  className="text-[10px] font-mono px-2.5 py-1.5 border border-emerald-700/60 text-emerald-400 hover:bg-emerald-950/30 transition-colors disabled:opacity-40 whitespace-nowrap">
                                  {publishingId === s.id ? '…' : '✓ Publish'}
                                </button>
                                <button onClick={() => handleStatus(s.id, 'rejected')}
                                  className="text-[10px] font-mono px-2.5 py-1.5 border border-red-800/60 text-red-400 hover:bg-red-950/20 transition-colors whitespace-nowrap">
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── Detail modal ── */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-8 overflow-y-auto"
          onClick={e => e.target === e.currentTarget && setSelectedSubmission(null)}>
          <div className="w-full max-w-2xl border border-gray-800/80 bg-[#0b1019] my-auto">

            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-gray-800/60 px-6 py-4 sticky top-0 bg-[#0b1019] z-10">
              <div>
                <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mb-0.5">Submission Details</p>
                <h2 className="text-base font-semibold text-white">{selectedSubmission.artist_name}</h2>
              </div>
              <button onClick={() => setSelectedSubmission(null)}
                className="text-gray-600 hover:text-gray-300 transition-colors p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">

              {/* Status chips */}
              <div className="flex flex-wrap gap-2">
                <span className={`text-[9px] font-mono font-bold uppercase px-2 py-1 border ${typeStyle[selectedSubmission.submission_type] || typeStyle.regular}`}>
                  {selectedSubmission.submission_type === 'featured' ? '🏆 Featured' : '📰 Regular'}
                </span>
                <span className={`text-[9px] font-mono font-bold uppercase px-2 py-1 border ${statusStyle[selectedSubmission.submission_status] || 'text-gray-500 border-gray-800'}`}>
                  {selectedSubmission.submission_status}
                </span>
                <span className="text-[9px] font-mono font-bold uppercase px-2 py-1 border text-emerald-400 border-emerald-700/60">
                  {fmtPrice(selectedSubmission.payment_amount)} paid
                </span>
              </div>

              {/* Contact */}
              <div className="border border-gray-800/60 bg-[#0a0e14] p-4 space-y-2">
                <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mb-2">Contact</p>
                <p className="text-sm text-gray-300"><span className="text-gray-600">Artist: </span>{selectedSubmission.artist_name}</p>
                <p className="text-sm text-gray-300">
                  <span className="text-gray-600">Email: </span>
                  <a href={`mailto:${selectedSubmission.email}`} className="text-sky-400 hover:underline">{selectedSubmission.email}</a>
                </p>
              </div>

              {/* Title */}
              {selectedSubmission.title && (
                <div className="border border-gray-800/60 bg-[#0a0e14] p-4">
                  <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mb-2">Article Title</p>
                  <p className="text-base font-semibold text-white">"{selectedSubmission.title}"</p>
                </div>
              )}

              {/* Cover image */}
              {selectedSubmission.image_url && (
                <div>
                  <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mb-2">Cover Image</p>
                  <img src={selectedSubmission.image_url} alt="cover" className="w-full max-h-64 object-contain border border-gray-800/60" />
                  <a href={selectedSubmission.image_url} target="_blank" rel="noopener noreferrer"
                    className="inline-block mt-2 text-[10px] font-mono text-sky-500 hover:underline">
                    View full size ↗
                  </a>
                </div>
              )}

              {/* Content */}
              {selectedSubmission.content && (
                <div className="border border-gray-800/60 bg-[#0a0e14] p-4">
                  <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mb-2">Content</p>
                  <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{selectedSubmission.content}</p>
                </div>
              )}

              {/* Document */}
              {selectedSubmission.document_url && (
                <a href={selectedSubmission.document_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 border border-gray-800/60 bg-[#0a0e14] hover:border-sky-800/60 p-4 transition-colors">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div>
                    <p className="text-xs font-mono font-semibold text-gray-300">Download Document</p>
                    <p className="text-[10px] font-mono text-gray-600">Artist uploaded a document</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-600 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </a>
              )}

              {/* Music links */}
              {(selectedSubmission.youtube_url || selectedSubmission.spotify_url) && (
                <div className="space-y-2">
                  <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">Music Links</p>
                  {selectedSubmission.youtube_url && (
                    <a href={selectedSubmission.youtube_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 border border-gray-800/60 bg-[#0a0e14] hover:border-red-800/60 p-3 transition-colors">
                      <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      <span className="text-[11px] font-mono text-gray-400 truncate">{selectedSubmission.youtube_url}</span>
                    </a>
                  )}
                  {selectedSubmission.spotify_url && (
                    <a href={selectedSubmission.spotify_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 border border-gray-800/60 bg-[#0a0e14] hover:border-green-800/60 p-3 transition-colors">
                      <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                      </svg>
                      <span className="text-[11px] font-mono text-gray-400 truncate">{selectedSubmission.spotify_url}</span>
                    </a>
                  )}
                </div>
              )}

              {/* Payment */}
              <div className="border border-gray-800/60 bg-[#0a0e14] p-4">
                <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mb-3">Payment</p>
                <div className="space-y-2 text-[11px] font-mono">
                  {[
                    ['Amount',  <span className="text-emerald-400 font-bold">{fmtPrice(selectedSubmission.payment_amount)}</span>],
                    ['ID',      <span className="text-gray-400 break-all">{selectedSubmission.payment_id}</span>],
                    ['Status',  <span className="text-emerald-400">{selectedSubmission.payment_status}</span>],
                    ['Date',    <span className="text-gray-400">{fmtFull(selectedSubmission.created_at)}</span>],
                  ].map(([label, val]) => (
                    <div key={label} className="flex items-start justify-between gap-4">
                      <span className="text-gray-600 flex-shrink-0">{label}</span>
                      {val}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="border-t border-gray-800/60 px-6 py-4 flex items-center gap-3 sticky bottom-0 bg-[#0b1019]">
              {selectedSubmission.submission_status === 'pending' && (
                <>
                  <button onClick={() => handlePublish(selectedSubmission.id)} disabled={publishingId === selectedSubmission.id}
                    className="text-[11px] font-mono px-5 py-2.5 border border-emerald-700/60 text-emerald-400 hover:bg-emerald-950/30 uppercase tracking-wider transition-colors disabled:opacity-40">
                    {publishingId === selectedSubmission.id ? 'Publishing…' : '✓ Publish as Article'}
                  </button>
                  <button onClick={() => handleStatus(selectedSubmission.id, 'rejected')}
                    className="text-[11px] font-mono px-5 py-2.5 border border-red-800/60 text-red-400 hover:bg-red-950/20 uppercase tracking-wider transition-colors">
                    Reject
                  </button>
                </>
              )}
              <button onClick={() => setSelectedSubmission(null)}
                className="text-[11px] font-mono px-5 py-2.5 border border-gray-700/60 text-gray-500 hover:text-gray-300 hover:border-gray-600 uppercase tracking-wider transition-colors ml-auto">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionsList;
