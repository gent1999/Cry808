import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

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
    <div className="ml-52 min-h-screen bg-black text-white">

      {/* ── Command Bar ──────────────────────────────────────────────────────── */}
      <header className="bg-[#080b10] border-b border-gray-800/60 sticky top-0 z-20">
        <div className="px-5 h-11 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin/dashboard')}
              className="text-[10px] font-mono text-gray-600 hover:text-gray-300 uppercase tracking-wider transition-colors">
              ← Dashboard
            </button>
            <span className="text-gray-700">│</span>
            <span className="text-[11px] font-mono text-violet-400 font-bold uppercase tracking-widest">Cortex</span>
            <span className="text-[10px] font-mono text-gray-500">Intelligence Hub</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={loadData}
              className="text-[10px] font-mono text-gray-500 hover:text-gray-200 uppercase tracking-wider border border-gray-800 hover:border-gray-600 px-2.5 py-1 transition-colors">
              ↻ Refresh
            </button>
            <button
              onClick={handleRun}
              disabled={running}
              className="text-[10px] font-mono text-violet-300 border border-violet-800/60 hover:bg-violet-950/30 hover:border-violet-600 px-3 py-1 uppercase tracking-wider transition-colors disabled:opacity-40 disabled:cursor-wait"
            >
              {running ? '⟳ Queuing...' : '⚡ Run Cortex Scan'}
            </button>
          </div>
        </div>
      </header>

      <main className="px-5 py-5 space-y-5">

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
  );
}
