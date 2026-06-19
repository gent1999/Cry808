import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;
const STORAGE_KEY = 'cookie_consent';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  // Only Accept writes to localStorage — X and Manage just hide for this session
  const dismiss = () => setVisible(false);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    setVisible(false);
    fetch(`${API_URL}/api/newsletter/cookie-consent`, { method: 'POST' }).catch(() => {});
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[9998] flex items-center gap-3 px-3 py-2 rounded-none max-w-sm"
      style={{
        background: 'rgba(8,8,12,0.88)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(139,92,246,0.12)',
      }}
    >
      <p className="text-white/35 text-[11px] leading-snug flex-1">
        We use cookies.{' '}
        <Link to="/privacy-policy" className="text-purple-400/70 hover:text-purple-300 underline underline-offset-2 transition-colors" onClick={dismiss}>
          Learn more
        </Link>
      </p>
      <button
        onClick={accept}
        className="shrink-0 px-3 py-1 text-[10px] font-bold tracking-wide uppercase text-white transition-opacity hover:opacity-80"
        style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
      >
        Accept
      </button>
      <button
        onClick={dismiss}
        aria-label="Close"
        className="shrink-0 text-white/20 hover:text-white/50 transition-colors text-sm leading-none"
      >
        ✕
      </button>
    </div>
  );
}
