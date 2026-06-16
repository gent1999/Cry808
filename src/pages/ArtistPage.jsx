import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Footer from '../components/Footer';
import HilltopAdSidebar from '../components/HilltopAdSidebar';
import HilltopMobileBanner from '../components/HilltopMobileBanner';
import AmazonWidget from '../components/AmazonWidget';
import SpotifyEmbed from '../components/SpotifyEmbed';
import BeatportArticleBanner from '../components/BeatportArticleBanner';
import { HILLTOP_ENABLED } from '../config/ads';
import { generateArticleUrl } from '../utils/slugify';

const API_URL = import.meta.env.VITE_API_URL;

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function ArtistPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [artist, setArtist] = useState(null);
  const [articles, setArticles] = useState([]);
  const [moreArticles, setMoreArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [adSettings, setAdSettings] = useState({});
  const [email, setEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    Promise.all([
      fetch(`${API_URL}/api/artists/${slug}`),
      fetch(`${API_URL}/api/articles`),
    ])
      .then(async ([artistRes, articlesRes]) => {
        if (artistRes.status === 404) { setNotFound(true); return; }
        const artistData = await artistRes.json();
        const articlesData = await articlesRes.json();
        setArtist(artistData.artist);
        setArticles(artistData.articles || []);
        const linked = new Set((artistData.articles || []).map(a => a.id));
        const others = (articlesData.articles || []).filter(a => !linked.has(a.id));
        setMoreArticles(others.sort(() => 0.5 - Math.random()).slice(0, 8));
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    fetch(`${API_URL}/api/settings/public`)
      .then(r => r.json())
      .then(data => {
        if (!data.settings) return;
        const converted = {};
        Object.entries(data.settings).forEach(([k, v]) => {
          converted[k] = v === 'true' ? true : v === 'false' ? false : v;
        });
        setAdSettings(converted);
      })
      .catch(() => {});
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-slate-500 text-sm">Loading…</div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <div className="text-slate-500 text-lg">Artist not found.</div>
        <button onClick={() => navigate('/')} className="text-sm text-purple-400 hover:text-purple-300 transition">← Back to home</button>
      </div>
    );
  }

  const sidebarComponents = [
    { order: parseInt(adSettings.hilltop_article_order || '1'), key: 'hilltop', component: HILLTOP_ENABLED && <HilltopAdSidebar key="hilltop" /> },
    { order: parseInt(adSettings.amazon_article_order   || '2'), key: 'amazon',  component: adSettings.amazon_article_enabled !== false && adSettings.amazon_article_enabled !== 'false' ? <AmazonWidget key="amazon" page="article" /> : null },
    { order: parseInt(adSettings.spotify_article_order  || '3'), key: 'spotify', component: <SpotifyEmbed key="spotify" pageType="article" /> },
  ];

  return (
    <>
      <Helmet>
        <title>{artist.name} — Cry808</title>
        <meta name="description" content={artist.bio ? artist.bio.slice(0, 160) : `Read all ${artist.name} articles on Cry808.`} />
      </Helmet>

      <div className="min-h-screen bg-black text-white overflow-x-hidden">

        {/* Share sidebar — far left, 2xl+ */}
        <div className="hidden 2xl:flex fixed left-8 top-1/3 flex-col items-center gap-4 z-50">
          {[
            { title: 'Copy link', onClick: () => navigator.clipboard.writeText(window.location.href), icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /> },
          ].map((btn, i) => (
            <button key={i} onClick={btn.onClick}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all text-white/70 hover:text-white"
              title={btn.title}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">{btn.icon}</svg>
            </button>
          ))}
        </div>

        {/* Top banner */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-16 xl:px-24 pt-12">
          <BeatportArticleBanner className="mb-6" />
        </div>

        {/* Three-column layout */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-16 xl:px-24 pb-12 flex gap-6 items-start">

          {/* Left panel — Newsletter + Submit Music */}
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
            <button onClick={() => navigate(-1)}
              className="mb-6 flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            {/* Mobile ad */}
            <div className="xl:hidden mb-6">
              {HILLTOP_ENABLED && <HilltopMobileBanner />}
            </div>

            {/* Artist hero */}
            <div className="relative mb-10 overflow-hidden" style={{ minHeight: '420px' }}>
              {artist.profile_image_url ? (
                <>
                  <img
                    src={artist.profile_image_url}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ filter: 'blur(32px)', transform: 'scale(1.18)' }}
                  />
                  <div className="absolute inset-0 bg-black/55" />
                </>
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,.3),transparent_65%)] bg-[#08080f]" />
              )}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(139,92,246,.18),transparent_50%)] pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent" />

              <div className="relative flex flex-col sm:flex-row items-end gap-8 px-6 pt-10 pb-14">
                <div className="w-56 h-56 sm:w-72 sm:h-72 flex-shrink-0 overflow-hidden border-2 border-white/25 bg-[#0d0d1a] shadow-[0_32px_100px_rgba(0,0,0,.9)]">
                  {artist.profile_image_url
                    ? <img src={artist.profile_image_url} alt={artist.name} className="h-full w-full object-cover" />
                    : <div className="flex h-full w-full items-center justify-center text-8xl">🎤</div>
                  }
                </div>
                <div className="sm:text-left pb-1">
                  <div className="text-[11px] font-mono uppercase tracking-[.2em] text-purple-400 mb-2">Artist</div>
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white drop-shadow-[0_2px_16px_rgba(0,0,0,1)]">{artist.name}</h1>
                  {artist.bio && (
                    <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70 drop-shadow-[0_1px_6px_rgba(0,0,0,1)]">{artist.bio}</p>
                  )}
                  <div className="mt-3 text-xs text-white/40">
                    {articles.length} {articles.length === 1 ? 'article' : 'articles'}
                  </div>
                </div>
              </div>
            </div>

            {/* Articles */}
            <div className="mb-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-purple-400 mb-1">Features</p>
              <h2 className="text-xl font-bold text-white">Articles featuring {artist.name}</h2>
            </div>

            {articles.length === 0 ? (
              <p className="text-white/30 text-sm py-8">No articles linked yet.</p>
            ) : (
              <div className="space-y-3">
                {/* Featured first article */}
                <div
                  onClick={() => window.location.href = generateArticleUrl(articles[0].id, articles[0].title)}
                  className="group relative overflow-hidden cursor-pointer"
                  style={{ height: '280px' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-950/60 to-black" />
                  {articles[0].image_url && (
                    <img
                      src={articles[0].image_url}
                      alt={articles[0].title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    {articles[0].categories?.length > 0 && (
                      <span className="inline-block text-[10px] font-mono uppercase tracking-widest text-purple-400 border border-purple-500/30 px-2 py-0.5 mb-2">
                        {articles[0].categories[0]}
                      </span>
                    )}
                    <h3 className="text-xl font-bold text-white leading-snug group-hover:text-purple-200 transition line-clamp-2">
                      {articles[0].title}
                    </h3>
                    <p className="mt-1 text-xs text-white/40">{formatDate(articles[0].created_at)}</p>
                  </div>
                </div>

                {/* Remaining articles grid */}
                {articles.length > 1 && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {articles.slice(1).map(article => (
                      <div
                        key={article.id}
                        onClick={() => window.location.href = generateArticleUrl(article.id, article.title)}
                        className="group relative overflow-hidden cursor-pointer"
                        style={{ height: '200px' }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/60 to-black" />
                        {article.image_url && (
                          <img
                            src={article.image_url}
                            alt={article.title}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          {article.categories?.length > 0 && (
                            <span className="inline-block text-[10px] font-mono uppercase tracking-widest text-purple-400/70 mb-1">
                              {article.categories[0]}
                            </span>
                          )}
                          <h3 className="text-sm font-semibold text-white leading-snug group-hover:text-purple-200 transition line-clamp-2">
                            {article.title}
                          </h3>
                          <p className="mt-0.5 text-[11px] text-white/35">{formatDate(article.created_at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="hidden xl:block w-80 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {sidebarComponents
                .sort((a, b) => a.order - b.order)
                .map(item => item.component)
                .filter(Boolean)}

              {moreArticles.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">More to Read</span>
                    <div className="flex-1 h-px bg-white/[0.06]" />
                  </div>
                  <div className="space-y-2">
                    {moreArticles.slice(0, 4).map(a => (
                      <div
                        key={a.id}
                        onClick={() => window.location.href = generateArticleUrl(a.id, a.title)}
                        className="cursor-pointer group hover:bg-white/[0.04] border border-transparent hover:border-white/10 transition-all overflow-hidden"
                      >
                        <div className="relative w-full h-36 overflow-hidden bg-gradient-to-br from-gray-900 via-purple-950/30 to-gray-900">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-3xl opacity-20">{a.category === 'interview' ? '🎤' : '🎵'}</span>
                          </div>
                          {a.image_url && (
                            <img src={a.image_url} alt={a.title}
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={e => { e.currentTarget.style.display = 'none'; }}
                            />
                          )}
                        </div>
                        <div className="px-3 py-2.5">
                          <h4 className="text-sm font-semibold text-white/90 leading-snug line-clamp-2 group-hover:text-white transition-colors">{a.title}</h4>
                          <p className="mt-1 text-xs text-white/35">{a.author}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        <Footer />
      </div>
    </>
  );
}
