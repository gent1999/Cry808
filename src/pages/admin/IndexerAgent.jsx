import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

const STATUS_COLOR = {
  idle:        'text-gray-400',
  running:     'text-yellow-400',
  success:     'text-green-400',
  failed:      'text-red-400',
  needs_login: 'text-orange-400',
};

const QUEUE_COLOR = {
  pending:    'text-gray-400',
  running:    'text-yellow-400',
  indexed:    'text-green-400',
  failed:     'text-red-400',
  needs_login:'text-orange-400',
};

export default function IndexerAgent() {
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');

  const [status, setStatus] = useState(null);
  const [queue, setQueue] = useState([]);
  const [urlInput, setUrlInput] = useState('');
  const [busy, setBusy] = useState('');   // which button is loading
  const [msg, setMsg] = useState(null);   // { text, ok }

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const fetchStatus = useCallback(async () => {
    try {
      const r = await fetch(`${API_URL}/api/indexer/status`, { headers });
      if (r.ok) setStatus(await r.json());
    } catch {}
  }, []);

  const fetchQueue = useCallback(async () => {
    try {
      const r = await fetch(`${API_URL}/api/indexer/queue`, { headers });
      if (r.ok) {
        const d = await r.json();
        setQueue(d.queue || []);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!token) { navigate('/admin/login'); return; }
    fetchStatus();
    fetchQueue();
  }, []);

  // Poll while running
  useEffect(() => {
    if (status?.status !== 'running') return;
    const id = setInterval(() => { fetchStatus(); fetchQueue(); }, 3000);
    return () => clearInterval(id);
  }, [status?.status]);

  async function call(endpoint, body) {
    setBusy(endpoint);
    setMsg(null);
    try {
      const r = await fetch(`${API_URL}/api/indexer/${endpoint}`, {
        method: 'POST',
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
      const d = await r.json();
      setMsg({ text: d.message || JSON.stringify(d), ok: r.ok });
      fetchStatus();
      fetchQueue();
    } catch (e) {
      setMsg({ text: e.message, ok: false });
    } finally {
      setBusy('');
    }
  }

  const fmt = (iso) => iso ? new Date(iso).toLocaleString() : '—';

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin/dashboard')} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-sm transition-colors">
              ← Dashboard
            </button>
            <span className="font-bold">Indexer Agent</span>
            {status && (
              <span className={`text-sm font-medium ${STATUS_COLOR[status.status] || 'text-gray-400'}`}>
                ● {status.status}
              </span>
            )}
          </div>
          <button onClick={() => { fetchStatus(); fetchQueue(); }} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-sm transition-colors">
            Refresh
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {/* Status Grid */}
        {status && (
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1 px-1">Agent Status</div>
            <div className="grid grid-cols-4 gap-px bg-gray-700">
              {[
                { label: 'Status',    value: status.status,     accent: STATUS_COLOR[status.status] },
                { label: 'Queue',     value: `${status.queueCount} pending` },
                { label: 'Last Run',  value: fmt(status.lastRun) },
                { label: 'Last URL',  value: status.lastUrl || '—' },
              ].map(({ label, value, accent }) => (
                <div key={label} className="bg-gray-900 border border-gray-700 px-4 py-3">
                  <div className="text-xs text-gray-500 mb-1">{label}</div>
                  <div className={`text-sm font-medium truncate ${accent || 'text-white'}`}>{value}</div>
                </div>
              ))}
            </div>
            {status.lastMessage && (
              <div className="bg-gray-900 border border-gray-700 border-t-0 px-4 py-2 text-xs text-gray-400">
                {status.lastMessage}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1 px-1">Actions</div>
          <div className="grid grid-cols-2 gap-px bg-gray-700">

            {/* Left — session + queue */}
            <div className="bg-gray-800">
              <div className="px-3 py-2 border-b border-gray-700 text-xs text-gray-400 font-medium uppercase tracking-widest">Session & Queue</div>
              <div className="divide-y divide-gray-700/50 p-3 space-y-2">
                <button
                  onClick={() => call('test-session')}
                  disabled={!!busy}
                  className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-sm transition-colors disabled:opacity-50"
                >
                  {busy === 'test-session' ? 'Testing...' : 'Test Session'}
                </button>
                <button
                  onClick={() => call('save-session')}
                  disabled={!!busy}
                  className="w-full py-2 bg-orange-700 hover:bg-orange-600 text-sm transition-colors disabled:opacity-50"
                >
                  {busy === 'save-session' ? 'Browser open — log in then wait...' : 'Save Session (opens browser)'}
                </button>
                <button
                  onClick={() => call('run')}
                  disabled={!!busy || status?.status === 'running'}
                  className="w-full py-2 bg-purple-700 hover:bg-purple-600 text-sm transition-colors disabled:opacity-50"
                >
                  {busy === 'run' ? 'Starting...' : 'Process Queue'}
                </button>
              </div>
            </div>

            {/* Right — manual URL */}
            <div className="bg-gray-800">
              <div className="px-3 py-2 border-b border-gray-700 text-xs text-gray-400 font-medium uppercase tracking-widest">Manual Index URL</div>
              <div className="p-3 space-y-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  placeholder="https://cry808.com/article/123-title"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => urlInput && call('enqueue', { url: urlInput })}
                    disabled={!!busy || !urlInput}
                    className="py-2 bg-gray-700 hover:bg-gray-600 text-sm transition-colors disabled:opacity-50"
                  >
                    {busy === 'enqueue' ? 'Adding...' : 'Add to Queue'}
                  </button>
                  <button
                    onClick={() => urlInput && call('run-url', { url: urlInput })}
                    disabled={!!busy || !urlInput}
                    className="py-2 bg-blue-700 hover:bg-blue-600 text-sm transition-colors disabled:opacity-50"
                  >
                    {busy === 'run-url' ? 'Indexing...' : 'Index Now'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        {msg && (
          <div className={`px-4 py-3 text-sm border ${msg.ok ? 'border-green-700 bg-green-500/10 text-green-300' : 'border-red-700 bg-red-500/10 text-red-300'}`}>
            {msg.text}
          </div>
        )}

        {/* Queue Table */}
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1 px-1">Queue (last 50)</div>
          <div className="border border-gray-700">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-800 border-b border-gray-700">
                  <th className="px-3 py-2 text-left text-gray-400 font-normal">URL</th>
                  <th className="px-3 py-2 text-left text-gray-400 font-normal w-24">Status</th>
                  <th className="px-3 py-2 text-left text-gray-400 font-normal w-8">Try</th>
                  <th className="px-3 py-2 text-left text-gray-400 font-normal w-36">Created</th>
                  <th className="px-3 py-2 text-left text-gray-400 font-normal w-36">Completed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/40 bg-gray-900">
                {queue.length === 0 ? (
                  <tr><td colSpan={5} className="px-3 py-6 text-center text-gray-600">Queue is empty</td></tr>
                ) : queue.map(item => (
                  <tr key={item.id} className="hover:bg-gray-800/50">
                    <td className="px-3 py-2 text-gray-300 max-w-xs">
                      <div className="truncate" title={item.url}>{item.url.replace('https://cry808.com', '')}</div>
                      {item.error_message && (
                        <div className="text-red-400 text-xs truncate" title={item.error_message}>{item.error_message}</div>
                      )}
                    </td>
                    <td className={`px-3 py-2 font-medium ${QUEUE_COLOR[item.status] || 'text-gray-400'}`}>{item.status}</td>
                    <td className="px-3 py-2 text-gray-500">{item.attempts}</td>
                    <td className="px-3 py-2 text-gray-500">{fmt(item.created_at)}</td>
                    <td className="px-3 py-2 text-gray-500">{fmt(item.completed_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
