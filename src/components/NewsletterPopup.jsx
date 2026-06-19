import React, { useState, useEffect, useRef } from 'react';

const API_URL = import.meta.env.VITE_API_URL;
const STORAGE_KEY_SUBSCRIBED = 'nl_subscribed';
const STORAGE_KEY_DISMISSED  = 'nl_dismissed_until';
const DISMISS_DAYS = 7;

export default function NewsletterPopup() {
  const [visible, setVisible]   = useState(false);
  const [email, setEmail]       = useState('');
  const [status, setStatus]     = useState('idle'); // idle | loading | success | error
  const [errMsg, setErrMsg]     = useState('');
  const triggered = useRef(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY_SUBSCRIBED)) return;
    const dismissedUntil = localStorage.getItem(STORAGE_KEY_DISMISSED);
    if (dismissedUntil && Date.now() < Number(dismissedUntil)) return;

    const show = () => {
      if (!triggered.current) {
        triggered.current = true;
        setVisible(true);
      }
    };

    // Timer trigger — 20 seconds
    const timer = setTimeout(show, 20000);

    // Scroll trigger — 50% page height
    const onScroll = () => {
      const scrolled = window.scrollY + window.innerHeight;
      const total    = document.documentElement.scrollHeight;
      if (scrolled / total >= 0.5) show();
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const dismiss = () => {
    const until = Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000;
    localStorage.setItem(STORAGE_KEY_DISMISSED, String(until));
    setVisible(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    setErrMsg('');
    try {
      const res = await fetch(`${API_URL}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrMsg(data.errors?.[0]?.msg || data.message || 'Something went wrong.');
        setStatus('error');
        return;
      }
      setStatus('success');
      localStorage.setItem(STORAGE_KEY_SUBSCRIBED, '1');
      setTimeout(() => setVisible(false), 2800);
    } catch {
      setErrMsg('Network error. Please try again.');
      setStatus('error');
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)' }}>
      <div
        className="relative w-full max-w-md"
        style={{
          background: 'linear-gradient(135deg, #0d0d0d 0%, #110820 60%, #0a0a0a 100%)',
          border: '1px solid rgba(139,92,246,0.25)',
          boxShadow: '0 0 60px rgba(109,40,217,0.18), 0 0 0 1px rgba(255,255,255,0.04)',
        }}
      >
        {/* Top accent line */}
        <div style={{ height: '2px', background: 'linear-gradient(90deg, #7c3aed, #a855f7, #7c3aed)' }} />

        <div className="p-8 sm:p-10">
          {/* Close */}
          <button
            onClick={dismiss}
            className="absolute top-4 right-4 text-white/30 hover:text-white/70 transition-colors text-xl leading-none"
            aria-label="Close"
          >
            ✕
          </button>

          {status === 'success' ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-4">🎧</div>
              <h3 className="text-xl font-black text-white tracking-wide mb-2">YOU'RE IN</h3>
              <p className="text-white/50 text-sm">Welcome to the loop. Check your inbox.</p>
            </div>
          ) : (
            <>
              {/* Label */}
              <p className="text-purple-400 text-xs font-bold tracking-[0.2em] uppercase mb-4">Newsletter</p>

              {/* Headline */}
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none mb-4 uppercase">
                Don't Miss<br />The Next Wave
              </h2>

              {/* Body */}
              <p className="text-white/45 text-sm leading-relaxed mb-8">
                Underground artists, interviews, and hidden gems straight to your inbox.
              </p>

              {/* Form */}
              <form onSubmit={submit} className="flex flex-col gap-3">
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  disabled={status === 'loading'}
                  className="w-full px-4 py-3 text-sm text-white placeholder-white/25 outline-none disabled:opacity-50"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(139,92,246,0.3)',
                  }}
                />

                {errMsg && <p className="text-red-400 text-xs">{errMsg}</p>}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full py-3 text-sm font-bold tracking-[0.12em] uppercase text-white transition-opacity disabled:opacity-60 hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
                >
                  {status === 'loading' ? 'Joining…' : 'Join The Loop'}
                </button>
              </form>

              <p className="text-white/20 text-xs text-center mt-5">No spam. Unsubscribe anytime.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
