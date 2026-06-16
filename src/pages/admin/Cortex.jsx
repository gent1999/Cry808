import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from '../../assets/cry808_logo.png';

const API_URL = import.meta.env.VITE_API_URL;

const fmtDate = d => d ? new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
const fmtAgo  = d => {
  if (!d) return '—';
  const mins = Math.round((Date.now() - new Date(d)) / 60000);
  if (mins < 2)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const h = Math.round(mins / 60);
  if (h < 24)   return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
};

const PRIORITY_STYLES = {
  critical: 'bg-red-900/40 text-red-300 border-red-800/60',
  high:     'bg-orange-900/30 text-orange-300 border-orange-800/50',
  medium:   'bg-blue-900/30 text-blue-300 border-blue-800/50',
  low:      'bg-gray-800/60 text-gray-400 border-gray-700/50',
};

const STATUS_STYLES = {
  open:      'text-sky-400 border-sky-800/60',
  approved:  'text-emerald-400 border-emerald-800/60',
  rejected:  'text-red-400 border-red-800/60',
  archived:  'text-gray-500 border-gray-700/50',
  completed: 'text-emerald-400 border-emerald-800/60',
};

function PriorityBadge({ p }) {
  return (
    <span className={`text-[9px] font-mono font-bold uppercase tracking-widest border px-2 py-0.5 ${PRIORITY_STYLES[p] || PRIORITY_STYLES.medium}`}>
      {p}
    </span>
  );
}

function ConfidenceBar({ score }) {
  if (!score) return null;
  const color = score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-gray-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-[10px] font-mono text-gray-400 w-8 text-right">{score}%</span>
    </div>
  );
}

function IdeaCard({ idea, onAction, acting }) {
  const meta = idea.metadata || {};
  const isOpen = idea.status === 'open';

  return (
    <div className={`bg-[#0a0e14] border flex flex-col transition-colors ${
      idea.status === 'approved' ? 'border-emerald-800/40' :
      idea.status === 'rejected' ? 'border-red-900/30 opacity-60' :
      idea.priority === 'critical' ? 'border-red-800/50' :
      idea.priority === 'high' ? 'border-orange-800/40' :
      'border-gray-800/60'
    }`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-800/50">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-[13px] font-semibold text-gray-100 leading-snug flex-1">{idea.title}</h3>
          <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
            <PriorityBadge p={idea.priority} />
            <span className={`text-[9px] font-mono uppercase tracking-widest border px-2 py-0.5 ${STATUS_STYLES[idea.status] || 'text-gray-500 border-gray-700'}`}>
              {idea.status}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {meta.category && (
            <span className="text-[10px] font-mono text-violet-400 border border-violet-800/40 px-2 py-0.5">{meta.category}</span>
          )}
          <span className="text-[10px] font-mono text-gray-500">by {idea.agent || 'cortex'}</span>
          {idea.article_title && (
            <span className="text-[10px] font-mono text-gray-500">→ {idea.article_title.slice(0, 40)}</span>
          )}
          <span className="text-[10px] font-mono text-gray-600 ml-auto">{fmtAgo(idea.created_at)}</span>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-3 flex-1 space-y-3">
        {idea.content && (
          <p className="text-sm text-gray-300 leading-relaxed">{idea.content}</p>
        )}

        {idea.confidence_score && (
          <div>
            <div className="text-[9px] font-mono text-gray-600 uppercase tracking-widest mb-1">Confidence</div>
            <ConfidenceBar score={idea.confidence_score} />
          </div>
        )}

        {meta.suggested_action && (
          <div className="bg-[#0d1520] border border-blue-900/30 px-3 py-2">
            <div className="text-[9px] font-mono text-blue-500 uppercase tracking-widest mb-1">Suggested Action</div>
            <p className="text-xs text-blue-200/80 leading-relaxed">{meta.suggested_action}</p>
          </div>
        )}

        {meta.supporting_data && Object.keys(meta.supporting_data).length > 0 && (
          <div>
            <div className="text-[9px] font-mono text-gray-600 uppercase tracking-widest mb-1.5">Signals</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(meta.supporting_data)
                .filter(([k, v]) => typeof v !== 'object' && v !== null && v !== undefined)
                .slice(0, 5)
                .map(([k, v]) => (
                  <span key={k} className="text-[10px] font-mono text-gray-400 bg-gray-800/60 border border-gray-700/40 px-2 py-0.5">
                    {k}: <span className="text-gray-200">{String(v)}</span>
                  </span>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {isOpen && (
        <div className="flex border-t border-gray-800/50">
          <button
            onClick={() => onAction(idea.id, 'approve')}
            disabled={!!acting}
            className="flex-1 py-2.5 text-[10px] font-mono text-emerald-400 hover:bg-emerald-950/20 border-r border-gray-800/50 uppercase tracking-wide transition-colors disabled:opacity-40"
          >
            {acting === `${idea.id}-approve` ? '...' : '✓ Approve'}
          </button>
          <button
            onClick={() => onAction(idea.id, 'reject')}
            disabled={!!acting}
            className="flex-1 py-2.5 text-[10px] font-mono text-red-400 hover:bg-red-950/20 border-r border-gray-800/50 uppercase tracking-wide transition-colors disabled:opacity-40"
          >
            {acting === `${idea.id}-reject` ? '...' : '✗ Reject'}
          </button>
          <button
            onClick={() => onAction(idea.id, 'archive')}
            disabled={!!acting}
            className="flex-1 py-2.5 text-[10px] font-mono text-gray-500 hover:text-gray-300 hover:bg-gray-800/30 uppercase tracking-wide transition-colors disabled:opacity-40"
          >
            {acting === `${idea.id}-archive` ? '...' : '⊘ Archive'}
          </button>
        </div>
      )}
      {idea.status === 'approved' && (
        <div className="flex border-t border-gray-800/50">
          <button
            onClick={() => onAction(idea.id, 'complete')}
            disabled={!!acting}
            className="flex-1 py-2.5 text-[10px] font-mono text-emerald-500 hover:bg-emerald-950/20 border-r border-gray-800/50 uppercase tracking-wide transition-colors disabled:opacity-40"
          >
            {acting === `${idea.id}-complete` ? '...' : '● Mark Done'}
          </button>
          <button
            onClick={() => onAction(idea.id, 'archive')}
            disabled={!!acting}
            className="flex-1 py-2.5 text-[10px] font-mono text-gray-500 hover:text-gray-300 uppercase tracking-wide transition-colors disabled:opacity-40"
          >
            Archive
          </button>
        </div>
      )}
    </div>
  );
}

// ── Side Panel ────────────────────────────────────────────────────────────────
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
      ['New Article',  'M12 5v14M5 12h14',       '/admin/articles/create'],
      ['All Articles', 'M5 6h14M5 12h14M5 18h9',  '/admin/articles'],
      ['Artists',      'M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm-7 9a7 7 0 0 1 14 0', '/admin/artists'],
      ['Submissions',  'M4 13h4l2 3h4l2-3h4M5 5h14l1 8v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5l1-8Z', '/admin/submissions'],
    ]],
    ['Intelligence', [
      ['Cortex', 'M12 2a5 5 0 0 1 5 5c0 2.4-1.7 4.4-4 4.9V21h-2v-9.1C8.7 11.4 7 9.4 7 7a5 5 0 0 1 5-5Z', '/admin/cortex'],
    ]],
    ['Business & Config', [
      ['Finance Hub', 'M12 3v18M8 7h6a3 3 0 0 1 0 6h-4a3 3 0 0 0 0 6h6', '/admin/finance'],
      ['Ad Settings',  'M12 4v16M4 12h16M7 7l10 10M17 7 7 17',            '/admin/settings'],
      ['Newsletter',   'M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z', '/admin/newsletter'],
      ['Spotify',      'M9 18V5l12-2v13M9 9l12-2',                                                                                             '/admin/spotify'],
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

// ── Main component ────────────────────────────────────────────────────────────
export default function Cortex() {
  const navigate = useNavigate();
  const [ideas,     setIdeas]     = useState([]);
  const [summary,   setSummary]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [running,   setRunning]   = useState(false);
  const [acting,    setActing]    = useState(null);
  const [error,     setError]     = useState('');
  const [runMsg,    setRunMsg]    = useState('');

  // Filters
  const [filterStatus,   setFilterStatus]   = useState('open');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [search,         setSearch]         = useState('');

  const token = () => localStorage.getItem('adminToken');
  const hdrs  = () => ({ Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ type: 'idea', limit: '100' });
      if (filterStatus)   params.set('status',   filterStatus);
      if (filterPriority) params.set('priority',  filterPriority);

      const [ideasRes, summaryRes] = await Promise.all([
        fetch(`${API_URL}/api/ideas?${params}`, { headers: hdrs() }),
        fetch(`${API_URL}/api/cortex/summary`,  { headers: hdrs() }),
      ]);

      if (ideasRes.status === 401 || summaryRes.status === 401) {
        navigate('/admin/login'); return;
      }

      const [id, sum] = await Promise.all([ideasRes.json(), summaryRes.json()]);
      setIdeas(id.ideas || []);
      setSummary(sum);
    } catch (e) { setError(e.message); }
    setLoading(false);
  }, [filterStatus, filterPriority, navigate]);

  useEffect(() => {
    if (!token()) { navigate('/admin/login'); return; }
    loadData();
  }, [loadData]);

  const handleAction = async (id, action) => {
    setActing(`${id}-${action}`);
    try {
      const r = await fetch(`${API_URL}/api/ideas/${id}/${action}`, { method: 'PATCH', headers: hdrs() });
      if (!r.ok) throw new Error('Action failed');
      setIdeas(prev => prev.map(i => i.id === id ? { ...i, status: { approve: 'approved', reject: 'rejected', archive: 'archived', complete: 'completed' }[action] } : i));
    } catch (e) { setError(e.message); }
    setActing(null);
  };

  const handleRun = async () => {
    setRunning(true);
    setRunMsg('');
    setError('');
    try {
      const r = await fetch(`${API_URL}/api/cortex/run`, { method: 'POST', headers: hdrs() });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || 'Run failed');
      setRunMsg(d.message || 'Cortex run queued. New ideas will appear shortly.');
      setTimeout(() => loadData(), 4000);
    } catch (e) { setError(e.message); }
    setRunning(false);
  };

  const filtered = ideas.filter(i => {
    const meta = i.metadata || {};
    if (filterCategory && meta.category !== filterCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!i.title.toLowerCase().includes(q) && !(i.content || '').toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const categories = [...new Set(ideas.map(i => i.metadata?.category).filter(Boolean))];
  const stats = summary?.stats || {};

  return (
    <div className="admin-command-center content-command-center min-h-screen bg-[#070b12] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(59,130,246,.16),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(139,92,246,.14),transparent_30%),linear-gradient(180deg,#070b12_0%,#0a0f1a_48%,#070b12_100%)]" />
      <ContentSidePanel />

      <div className="relative ml-[264px] min-h-screen flex flex-col">

        {/* ── Sticky Header ── */}
        <header className="sticky top-0 z-20 border-b border-white/[0.07] bg-[#070b12]/82 px-8 py-3 backdrop-blur-xl">
          <div className="flex h-8 items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/admin/dashboard')}
                className="text-xs text-slate-500 hover:text-slate-200 uppercase tracking-[.16em] font-semibold transition-colors">
                ← Dashboard
              </button>
              <span className="text-gray-700">│</span>
              <span className="text-xs text-sky-300 font-bold uppercase tracking-[.18em]">Cortex</span>
              <span className="text-[10px] font-mono text-gray-500 hidden sm:block">Intelligence Hub</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={loadData}
                className="text-[10px] font-mono text-gray-500 hover:text-gray-200 uppercase tracking-wider border border-gray-800/60 hover:border-gray-600 px-2.5 py-1.5 transition-colors">
                ↻ Refresh
              </button>
              <button
                onClick={handleRun}
                disabled={running}
                className="text-[10px] font-mono text-violet-300 border border-violet-800/60 hover:bg-violet-950/30 hover:border-violet-600 px-3 py-1.5 uppercase tracking-wider transition-colors disabled:opacity-40 disabled:cursor-wait"
              >
                {running ? '⟳ Queuing...' : '⚡ Run Cortex Scan'}
              </button>
            </div>
          </div>
        </header>

      <main className="px-8 py-6 space-y-5">

        {error && (
          <div className="border border-red-800/60 bg-red-950/20 px-4 py-2.5 text-xs font-mono text-red-400 uppercase tracking-wider">
            {error}
          </div>
        )}
        {runMsg && (
          <div className="border border-violet-800/40 bg-violet-950/20 px-4 py-2.5 text-xs font-mono text-violet-300">
            {runMsg}
          </div>
        )}

        {/* ── Status + Stats row ────────────────────────────────────────────── */}
        <div className="grid grid-cols-5 gap-px bg-gray-800/30">
          {[
            { label: 'Open Ideas',     value: stats.open_ideas     || '—', accent: 'text-sky-300',     border: 'border-l-sky-700' },
            { label: 'High Priority',  value: stats.high_priority  || '—', accent: 'text-orange-300',  border: 'border-l-orange-700' },
            { label: 'Approved',       value: stats.approved_ideas || '—', accent: 'text-emerald-400', border: 'border-l-emerald-700' },
            { label: 'Events (24h)',   value: stats.events_24h     || '—', accent: 'text-gray-300',    border: 'border-l-gray-600' },
            {
              label: 'Last Run',
              value: summary?.lastRun ? fmtAgo(summary.lastRun.created_at) : '—',
              sub:   summary?.lastRun?.status,
              accent: summary?.lastRun?.status === 'failed' ? 'text-red-400' : 'text-violet-400',
              border: 'border-l-violet-700',
            },
          ].map(({ label, value, accent, border, sub }) => (
            <div key={label} className={`bg-[#0a0e14] border border-gray-800/60 border-l-2 ${border} px-3.5 py-3`}>
              <div className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1.5">{label}</div>
              <div className={`text-xl font-bold font-mono ${accent}`}>{loading ? '—' : value}</div>
              {sub && <div className="text-[10px] font-mono text-gray-600 mt-1">{sub}</div>}
            </div>
          ))}
        </div>

        {/* ── Filters ──────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search ideas..."
            className="bg-[#0a0e14] border border-gray-700/60 text-sm text-gray-200 font-mono px-3 py-2 focus:outline-none focus:border-violet-700/60 placeholder-gray-600 w-52"
          />
          {[['open','Open'],['approved','Approved'],['rejected','Rejected'],['archived','Archived'],['','All']].map(([v, l]) => (
            <button key={v} onClick={() => setFilterStatus(v)}
              className={`text-[11px] font-mono uppercase tracking-wider border px-3 py-2 transition-colors ${
                filterStatus === v ? 'border-violet-700/60 text-violet-300 bg-violet-950/20' : 'border-gray-700/60 text-gray-500 hover:border-gray-600 hover:text-gray-300'
              }`}>{l}</button>
          ))}
          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
            className="bg-[#0a0e14] border border-gray-700/60 text-xs text-gray-300 font-mono px-3 py-2 focus:outline-none cursor-pointer">
            <option value="">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          {categories.length > 0 && (
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
              className="bg-[#0a0e14] border border-gray-700/60 text-xs text-gray-300 font-mono px-3 py-2 focus:outline-none cursor-pointer">
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
          <span className="text-xs font-mono text-gray-500 ml-auto">{filtered.length} ideas</span>
        </div>

        {/* ── Idea Cards ────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-[#0a0e14] border border-gray-800/60 h-48 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-[#0a0e14] border border-gray-800/60 px-6 py-16 text-center">
            <div className="text-gray-600 text-xs font-mono uppercase tracking-widest mb-2">No ideas found</div>
            {filterStatus === 'open' && (
              <button onClick={handleRun} disabled={running}
                className="text-violet-400 text-xs font-mono hover:underline disabled:opacity-40">
                Run Cortex scan to generate ideas →
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
            {filtered.map(idea => (
              <IdeaCard key={idea.id} idea={idea} onAction={handleAction} acting={acting} />
            ))}
          </div>
        )}
      </main>
      </div>
    </div>
  );
}
