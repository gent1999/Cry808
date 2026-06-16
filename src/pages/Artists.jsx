import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Footer from '../components/Footer';
import BeatportArticleBanner from '../components/BeatportArticleBanner';

const API_URL = import.meta.env.VITE_API_URL;

export default function Artists() {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/artists`)
      .then(r => r.json())
      .then(d => setArtists(d.artists || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setNewsletterStatus('');
    try {
      const res = await fetch(`${API_URL}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) { setNewsletterStatus('success'); setEmail(''); }
      else setNewsletterStatus('error');
    } catch { setNewsletterStatus('error'); }
    finally {
      setIsSubmitting(false);
      setTimeout(() => setNewsletterStatus(''), 5000);
    }
  };

  return (
    <>
      <Helmet>
        <title>Artists — Cry808</title>
        <meta name="description" content="Browse artist profiles on Cry808 — interviews, reviews, and features." />
      </Helmet>

      <div className="min-h-screen bg-black text-white overflow-x-hidden">

        {/* Top banner */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-16 xl:px-24 pt-12">
          <BeatportArticleBanner className="mb-6" />
        </div>

        {/* Three-column layout */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-16 xl:px-24 pb-16 flex gap-6 items-start">

          {/* Left panel */}
          <div className="hidden lg:block w-52 flex-shrink-0">
            <div className="sticky top-20">
              <div className="bg-gradient-to-b from-purple-950/60 to-black border border-purple-500/20 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-b border-purple-500/20 px-4 py-3">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-purple-400 mb-0.5">Newsletter</p>
                  <h3 className="text-sm font-bold text-white leading-snug">Stay in the Loop</h3>
                </div>
                <div className="px-4 py-4">
                  <p className="text-white/45 text-[11px] leading-relaxed mb-3">
                    Underground drops &amp; interviews, straight to your inbox.
                  </p>
                  <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      disabled={isSubmitting}
                      className="w-full px-3 py-2 bg-black/60 border border-white/10 text-white text-xs placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-colors disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-semibold transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? 'Subscribing…' : 'Subscribe Free'}
                    </button>
                  </form>
                  {newsletterStatus === 'success' && <p className="mt-2 text-green-400 text-[10px]">You're subscribed! 🎉</p>}
                  {newsletterStatus === 'error'   && <p className="mt-2 text-red-400 text-[10px]">Something went wrong. Try again.</p>}
                  <div className="mt-3 pt-3 border-t border-white/[0.06]">
                    <p className="text-white/25 text-[9px] uppercase tracking-widest mb-2">Find us on</p>
                    <a href="https://instagram.com/pluggpress" target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-pink-900/30 border border-white/10 hover:border-pink-500/40 transition-all"
                    >
                      <svg className="w-3.5 h-3.5 flex-shrink-0 text-pink-400" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                      <span className="text-white/50 text-[11px]">@pluggpress</span>
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-3 bg-gradient-to-b from-purple-950/40 to-black border border-purple-500/20 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-b border-purple-500/20 px-4 py-3">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-purple-400 mb-0.5">Submit Music</p>
                  <h3 className="text-sm font-bold text-white leading-snug">Are You a 1of1?</h3>
                </div>
                <div className="px-4 py-4">
                  <p className="text-white/45 text-[11px] leading-relaxed mb-3">
                    We cover the underground. Got something real? We want to hear it.
                  </p>
                  <a href="/submit-music"
                    className="block w-full py-2 text-center bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-semibold transition-all"
                  >
                    Submit Your Music 🎵
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="min-w-0 flex-1">
            <div className="mb-8">
              <div className="text-[11px] font-mono uppercase tracking-[.2em] text-purple-400 mb-2">Cry808</div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
                Artists
              </h1>
              <p className="mt-2 text-white/40 text-sm">Artists featured across interviews, reviews, and articles on Cry808.</p>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="animate-pulse text-center">
                    <div className="mx-auto mb-3 h-28 w-28 bg-white/[0.05]" />
                    <div className="h-3 bg-white/[0.05] rounded mx-auto w-20" />
                  </div>
                ))}
              </div>
            ) : artists.length === 0 ? (
              <div className="text-center py-24 text-white/20">No artist profiles yet.</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {artists.map(artist => (
                  <Link key={artist.id} to={`/artist/${artist.slug}`} className="group text-center">
                    <div className="mx-auto mb-3 h-28 w-28 overflow-hidden border-2 border-purple-500/20 group-hover:border-purple-500/60 transition-all duration-300 bg-white/[0.04]">
                      {artist.profile_image_url
                        ? <img src={artist.profile_image_url} alt={artist.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        : <div className="flex h-full w-full items-center justify-center text-4xl">🎤</div>
                      }
                    </div>
                    <div className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">{artist.name}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right sidebar placeholder — keeps layout consistent on xl+ */}
          <div className="hidden xl:block w-80 flex-shrink-0" />

        </div>

        <Footer />
      </div>
    </>
  );
}
