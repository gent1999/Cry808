import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Footer from '../components/Footer';
import HilltopAdSidebar from '../components/HilltopAdSidebar';
import HilltopMobileBanner from '../components/HilltopMobileBanner';
import HilltopPopUnder from '../components/HilltopPopUnder';
import AmazonWidget from '../components/AmazonWidget';
import SpotifyEmbed from '../components/SpotifyEmbed';
import BeatportArticleBanner from '../components/BeatportArticleBanner';
import BeatportArticleTopBanner from '../components/BeatportArticleTopBanner';
import { HILLTOP_ENABLED } from '../config/ads';
import { stripMarkdown } from '../utils/markdownUtils';
import { generateArticleUrl } from '../utils/slugify';

const API_URL = import.meta.env.VITE_API_URL;

const ArticleDetail = () => {
  const { id: urlId } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [moreArticles, setMoreArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adSettings, setAdSettings] = useState({});
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [email, setEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract numeric ID from URL (e.g., "123-drake-new-album" -> "123")
  const id = urlId.split('-')[0];

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(`${API_URL}/api/articles/${id}`);

        if (!response.ok) {
          throw new Error('Article not found');
        }

        const data = await response.json();
        setArticle(data.article);
      } catch (err) {
        setError(err.message || 'Failed to load article');
      } finally {
        setLoading(false);
      }
    };

    const fetchMoreArticles = async () => {
      try {
        const response = await fetch(`${API_URL}/api/articles`);
        if (response.ok) {
          const data = await response.json();
          // Filter out current article and get 3 random articles
          const otherArticles = data.articles.filter(article => article.id !== parseInt(id));
          const shuffled = otherArticles.sort(() => 0.5 - Math.random());
          setMoreArticles(shuffled.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to fetch more articles:', err);
      }
    };

    fetchArticle();
    fetchMoreArticles();
  }, [id]);

  // Load ad settings from API
  useEffect(() => {
    const loadAdSettings = async () => {
      try {
        const response = await fetch(`${API_URL}/api/settings/public`);
        const data = await response.json();
        if (data.settings) {
          // Convert string 'true'/'false' to boolean
          const convertedSettings = {};
          Object.entries(data.settings).forEach(([key, value]) => {
            if (value === 'true' || value === 'false') {
              convertedSettings[key] = value === 'true';
            } else {
              convertedSettings[key] = value;
            }
          });
          setAdSettings(convertedSettings);
        }
      } catch (error) {
        console.error('Failed to load ad settings:', error);
      }
    };

    loadAdSettings();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col overflow-x-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-xl">Loading article...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col overflow-x-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-400 text-xl mb-4">{error || 'Article not found'}</div>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  const handleEmailShare = () => {
    window.location.href = `mailto:?subject=${encodeURIComponent(article.title)}&body=${encodeURIComponent(window.location.href)}`;
  };

  const handleTweet = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(article.title)}`, '_blank');
  };

  const openLightbox = (imageUrl) => {
    setLightboxImage(imageUrl);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setLightboxImage(null);
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (response.ok) {
        setNewsletterStatus('success');
        setEmail('');
      } else {
        setNewsletterStatus('error');
      }
    } catch {
      setNewsletterStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate description from article content
  const articleDescription = article ? stripMarkdown(article.content).substring(0, 160) + '...' : '';
  const articleUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="min-h-screen bg-black text-white flex flex-col overflow-x-hidden">
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{article.title} | Cry808</title>
        <meta name="description" content={articleDescription} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={articleUrl} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={articleDescription} />
        {article.image_url && <meta property="og:image" content={article.image_url} />}
        <meta property="og:site_name" content="Cry808" />
        <meta property="article:published_time" content={article.created_at} />
        <meta property="article:author" content={article.author} />
        {article.tags && article.tags.map((tag, index) => (
          <meta key={index} property="article:tag" content={tag} />
        ))}

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={articleUrl} />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={articleDescription} />
        {article.image_url && <meta name="twitter:image" content={article.image_url} />}
      </Helmet>

      <div className="relative">
        {/* Share Sidebar - Fixed to far left */}
        <div className="hidden 2xl:flex fixed left-8 top-1/3 flex-col items-center gap-4 z-50">
          <button
            onClick={handleCopyLink}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all text-white/70 hover:text-white"
            title="Copy link"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </button>
          <button
            onClick={handleEmailShare}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all text-white/70 hover:text-white"
            title="Share via email"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </button>
          <button
            onClick={handleTweet}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all text-white/70 hover:text-white"
            title="Share on Twitter"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </button>
          <button
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all text-white/70 hover:text-white"
            title="More options"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>

        {/* Desktop Loopcloud Banner - Above Article and Sidebar */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-16 xl:px-24 pt-12">
          <BeatportArticleBanner className="mb-6" />
        </div>

        {/* Main Content with Ad Sidebar */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-16 xl:px-24 pb-12 flex gap-6 items-start">

          {/* Left Panel — Newsletter + Submit Music + Lyrics */}
          <div className="hidden lg:block w-52 flex-shrink-0">
            <div className="sticky top-20 max-h-[calc(100vh-5.5rem)] overflow-y-auto scrollbar-hide">
              {/* Newsletter */}
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
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      disabled={isSubmitting}
                      className="w-full px-3 py-2 bg-black/60 border border-white/10 text-white text-xs placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-colors disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Subscribing…' : 'Subscribe Free'}
                    </button>
                  </form>
                  {newsletterStatus === 'success' && (
                    <p className="mt-2 text-green-400 text-[10px]">You&apos;re subscribed! 🎉</p>
                  )}
                  {newsletterStatus === 'error' && (
                    <p className="mt-2 text-red-400 text-[10px]">Something went wrong. Try again.</p>
                  )}
                  <div className="mt-3 pt-3 border-t border-white/[0.06]">
                    <p className="text-white/25 text-[9px] uppercase tracking-widest mb-2">Find us on</p>
                    <a
                      href="https://instagram.com/pluggpress"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-pink-900/30 border border-white/10 hover:border-pink-500/40 transition-all"
                    >
                      <svg className="w-3.5 h-3.5 flex-shrink-0 text-pink-400" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                      <span className="text-white/50 text-[11px]">@pluggpress</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Submit Music */}
              <div className="mt-3 bg-gradient-to-b from-purple-950/40 to-black border border-purple-500/20 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-b border-purple-500/20 px-4 py-3">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-purple-400 mb-0.5">Submit Music</p>
                  <h3 className="text-sm font-bold text-white leading-snug">Are You a 1of1?</h3>
                </div>
                <div className="px-4 py-4">
                  <p className="text-white/45 text-[11px] leading-relaxed mb-3">
                    We cover the underground. Got something real? We want to hear it.
                  </p>
                  <a
                    href="/submit-music"
                    className="block w-full py-2 text-center bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-semibold transition-all"
                  >
                    Submit Your Music 🎵
                  </a>
                </div>
              </div>

              {/* Lyrics — shown below Submit Music when article has them */}
              {article.lyrics && (
                <div className="mt-3 bg-gradient-to-b from-gray-900/80 to-black border border-white/10 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-white/[0.04] border-b border-white/10">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-yellow-400">Lyrics</p>
                    {article.genius_url && (
                      <a
                        href={article.genius_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/30 hover:text-yellow-400 transition-colors"
                        title="Open on Genius"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>
                  <div className="px-3 py-3 max-h-[420px] overflow-y-auto scrollbar-hide">
                    <pre className="text-white/70 text-[10px] leading-relaxed font-sans whitespace-pre-wrap break-words">
                      {article.lyrics}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="max-w-4xl flex-1">
            {/* Back Button */}
            <button
              onClick={() => navigate('/')}
              className="mb-6 flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </button>

            {/* Mobile Banner Ad - Top of Article */}
            <div className="xl:hidden mb-6">
              {HILLTOP_ENABLED && <HilltopMobileBanner />}
            </div>

        {/* Article Image */}
        {article.image_url && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full h-96 object-cover"
            />
          </div>
        )}

        {/* Article Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{article.title}</h1>

          <div className="flex items-center gap-4 text-white/50 text-sm mb-6">
            <span>By {article.author}</span>
            <span>•</span>
            <span>{new Date(article.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-purple-600/20 text-purple-400 text-sm rounded-full border border-purple-600/30"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Article Content */}
        <div className="prose prose-invert prose-lg max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ node, ...props }) => (
                <a
                  {...props}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 underline"
                />
              ),
              h1: ({ node, ...props }) => (
                <h1 {...props} className="text-3xl font-bold mt-8 mb-4 text-white" />
              ),
              h2: ({ node, ...props }) => (
                <h2 {...props} className="text-2xl font-bold mt-6 mb-3 text-white" />
              ),
              h3: ({ node, ...props }) => (
                <h3 {...props} className="text-xl font-bold mt-4 mb-2 text-white" />
              ),
              p: ({ node, ...props }) => (
                <p {...props} className="text-white/90 leading-relaxed mb-4" />
              ),
              ul: ({ node, ...props }) => (
                <ul {...props} className="list-disc list-inside mb-4 text-white/90" />
              ),
              ol: ({ node, ...props }) => (
                <ol {...props} className="list-decimal list-inside mb-4 text-white/90" />
              ),
              blockquote: ({ node, ...props }) => (
                <blockquote {...props} className="border-l-4 border-purple-500 pl-4 italic text-white/80 my-4" />
              ),
              code: ({ node, inline, ...props }) => (
                inline ?
                  <code {...props} className="bg-gray-800 px-1 py-0.5 rounded text-purple-300" /> :
                  <code {...props} className="block bg-gray-800 p-4 rounded text-purple-300 overflow-x-auto" />
              ),
            }}
          >
            {article.content}
          </ReactMarkdown>
        </div>

        {/* Spotify Embed */}
        {article.spotify_url && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Listen on Spotify</h2>
            <div className="rounded-lg overflow-hidden">
              <iframe
                src={article.spotify_url.replace(/open\.spotify\.com\/(intl-[a-z-]+\/)?/, 'open.spotify.com/embed/')}
                width="100%"
                height={/\/(album|playlist|show|episode)\//i.test(article.spotify_url) ? '500' : '152'}
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="rounded-lg"
              ></iframe>
            </div>
          </div>
        )}

        {/* YouTube Embed */}
        {article.youtube_url && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Watch on YouTube</h2>
            <div className="rounded-lg overflow-hidden aspect-video">
              <iframe
                src={article.youtube_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                width="100%"
                height="100%"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
                className="rounded-lg"
              ></iframe>
            </div>
          </div>
        )}

        {/* SoundCloud Embed */}
        {article.soundcloud_url && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Listen on SoundCloud</h2>
            <div className="rounded-lg overflow-hidden">
              <iframe
                width="100%"
                height="166"
                scrolling="no"
                frameBorder="no"
                allow="autoplay"
                src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(article.soundcloud_url)}&color=%23a855f7&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true`}
                loading="lazy"
                className="rounded-lg"
              ></iframe>
            </div>
          </div>
        )}

        {/* Additional Images Gallery */}
        {(article.additional_image_1 || article.additional_image_2 || article.additional_image_3) && (
          <div className="mt-8">
            <div className="flex justify-center">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
                {article.additional_image_1 && (
                  <div
                    className="rounded-lg overflow-hidden cursor-pointer transform transition-all hover:scale-105 hover:shadow-xl bg-gray-900 flex items-center justify-center h-64"
                    onClick={() => openLightbox(article.additional_image_1)}
                  >
                    <img
                      src={article.additional_image_1}
                      alt="Additional content 1"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                )}
                {article.additional_image_2 && (
                  <div
                    className="rounded-lg overflow-hidden cursor-pointer transform transition-all hover:scale-105 hover:shadow-xl bg-gray-900 flex items-center justify-center h-64"
                    onClick={() => openLightbox(article.additional_image_2)}
                  >
                    <img
                      src={article.additional_image_2}
                      alt="Additional content 2"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                )}
                {article.additional_image_3 && (
                  <div
                    className="rounded-lg overflow-hidden cursor-pointer transform transition-all hover:scale-105 hover:shadow-xl bg-gray-900 flex items-center justify-center h-64"
                    onClick={() => openLightbox(article.additional_image_3)}
                  >
                    <img
                      src={article.additional_image_3}
                      alt="Additional content 3"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Desktop Loopcloud Banner - Before Back Button */}
        <BeatportArticleTopBanner className="mt-8" />

        {/* Back Button Section */}
        <div className="mt-8 pt-8 border-t border-white/10">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
          >
            Back to Home
          </button>
        </div>
          </div>

          {/* Sidebar */}
          <div className="hidden xl:block w-80 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {(() => {
                // Build array of sidebar components with their order
                const sidebarComponents = [
                  {
                    order: parseInt(adSettings.hilltop_article_order || '1'),
                    key: 'hilltop',
                    component: HILLTOP_ENABLED && <HilltopAdSidebar key="hilltop" />
                  },
                  {
                    order: parseInt(adSettings.amazon_article_order || '2'),
                    key: 'amazon',
                    component: <AmazonWidget key="amazon" page="article" />
                  },
                  {
                    order: parseInt(adSettings.spotify_article_order || '3'),
                    key: 'spotify',
                    component: <SpotifyEmbed key="spotify" pageType="article" />
                  }
                ];

                // Sort by order and render
                return sidebarComponents
                  .sort((a, b) => a.order - b.order)
                  .map(item => item.component)
                  .filter(Boolean);
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* More Articles Section */}
      {moreArticles.length > 0 && (
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-16 xl:px-24 py-16 border-t border-white/10">
          <h2 className="text-3xl font-bold mb-8">More Articles</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {moreArticles.map((article) => (
              <div
                key={article.id}
                onClick={() => window.location.href = generateArticleUrl(article.id, article.title)}
                className="bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:bg-white/10 transition cursor-pointer"
              >
                {/* Article Image */}
                {article.image_url && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={article.image_url}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Article Content */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                    {article.title}
                  </h3>

                  <p className="text-white/50 text-xs mb-3">
                    By {article.author} • {new Date(article.created_at).toLocaleDateString()}
                  </p>

                  <p className="text-white/70 text-sm line-clamp-3 mb-4">
                    {stripMarkdown(article.content)}
                  </p>

                  {/* Tags */}
                  {article.tags && article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {article.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-purple-600/20 text-purple-400 text-xs rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Footer />
      {HILLTOP_ENABLED && <HilltopPopUnder />}

      {/* Image Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white/70 hover:text-white text-4xl font-light transition-colors"
            aria-label="Close"
          >
            ×
          </button>
          <div className="relative max-w-7xl max-h-[90vh] flex items-center justify-center">
            <img
              src={lightboxImage}
              alt="Expanded view"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleDetail;
