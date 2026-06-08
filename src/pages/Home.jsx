import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import SpotifyEmbed from "../components/SpotifyEmbed";
import AdsterraNative from "../components/AdsterraNative";
import AdsterraMobileBanner from "../components/AdsterraMobileBanner";
import AmazonWidget from "../components/AmazonWidget";
import BeatportBanner from "../components/BeatportBanner";
import BeatportMobileBanner from "../components/BeatportMobileBanner";
import { stripMarkdown } from "../utils/markdownUtils";
import { generateArticleUrl } from "../utils/slugify";
import ReferralAdWidget from "../components/ReferralAdWidget";
import SpotifyPlaylistSection from "../components/SpotifyPlaylistSection";

const API_URL = import.meta.env.VITE_API_URL;

export default function Home() {
  const navigate = useNavigate();
  const [heroArticles, setHeroArticles] = useState([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [heroAutoPaused, setHeroAutoPaused] = useState(false);
  const [originals, setOriginals] = useState([]);
  const [evergreenGuides, setEvergreenGuides] = useState([]);
  const [mixedContent, setMixedContent] = useState([]);
  const [interviewsSpotlight, setInterviewsSpotlight] = useState([]);
  const [reviewArticles, setReviewArticles] = useState([]);
  const [onTheRadar, setOnTheRadar] = useState([]);
  const [trendingTags, setTrendingTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adSettings, setAdSettings] = useState({ adsterra_enabled: false });
  const [currentGuideIndex, setCurrentGuideIndex] = useState(0);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        // Single fetch — /api/articles already includes is_featured on every article
        const response = await fetch(`${API_URL}/api/articles`);

        if (!response.ok) {
          throw new Error('Failed to fetch articles');
        }

        const data = await response.json();
        const sortedArticles = data.articles.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        // Build carousel from all featured articles (sorted newest-featured first)
        const featuredList = sortedArticles.filter(a => a.is_featured === true);
        // Fall back to the single latest article if nothing is explicitly featured
        const heroList = featuredList.length > 0 ? featuredList : sortedArticles.slice(0, 1);
        setHeroArticles(heroList);

        // Exclude carousel articles from all grids below
        const featuredIds = new Set(heroList.map(a => a.id));
        const filteredArticles = sortedArticles.filter(article => !featuredIds.has(article.id));

        // Separate evergreen guides
        const evergreenOnly = filteredArticles.filter(article => article.is_evergreen === true);
        setEvergreenGuides(evergreenOnly);

        // Separate originals from regular articles (excluding evergreen)
        const originalsOnly = filteredArticles.filter(article => article.is_original === true && !article.is_evergreen);
        const regularArticles = filteredArticles.filter(article => !article.is_original && !article.is_evergreen);

        // Limit originals to 6 (2 rows of 3 articles each)
        setOriginals(originalsOnly.slice(0, 6));

        // Limit regular articles to 6 (2 rows of 3 articles each)
        setMixedContent(regularArticles.slice(0, 6));

        // Interviews spotlight (up to 8)
        const interviewArticles = sortedArticles.filter(
          a => !featuredIds.has(a.id) &&
               (a.category === 'interview' || (Array.isArray(a.categories) && a.categories.includes('interview')))
        );
        setInterviewsSpotlight(interviewArticles.slice(0, 8));

        // Reviews section (up to 8)
        const reviewsList = sortedArticles.filter(
          a => !featuredIds.has(a.id) &&
               (a.category === 'review' || (Array.isArray(a.categories) && a.categories.includes('review')))
        );
        setReviewArticles(reviewsList.slice(0, 8));

        // On the Radar - latest non-evergreen drops (up to 10)
        const radarItems = filteredArticles.filter(a => !a.is_evergreen).slice(0, 10);
        setOnTheRadar(radarItems);

        // Extract and count tags for trending section
        const tagCounts = {};
        sortedArticles.forEach(article => {
          if (article.tags && Array.isArray(article.tags)) {
            article.tags.forEach(tag => {
              tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
          }
        });

        // Sort tags by count and get top 6
        const sortedTags = Object.entries(tagCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([tag]) => tag);

        setTrendingTags(sortedTags);


      } catch (err) {
        setError(err.message || 'Failed to load articles');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  // Auto-advance hero carousel
  useEffect(() => {
    if (heroArticles.length <= 1 || heroAutoPaused) return;
    const timer = setInterval(() => {
      setCurrentHeroIndex(i => (i + 1) % heroArticles.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroArticles.length, heroAutoPaused]);

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
          console.log('📊 Ad settings loaded:', convertedSettings);
          console.log('📱 Adsterra enabled:', convertedSettings.adsterra_enabled);
        }
      } catch (error) {
        console.error('Failed to load ad settings:', error);
      }
    };

    loadAdSettings();
  }, []);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setNewsletterStatus('');

    try {
      const response = await fetch(`${API_URL}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setNewsletterStatus('success');
        setEmail('');
      } else {
        setNewsletterStatus('error');
        setError(data.message || 'Failed to subscribe');
      }
    } catch (err) {
      setNewsletterStatus('error');
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setNewsletterStatus(''), 5000);
    }
  };

  // Skeleton loader component
  const SkeletonCard = () => (
    <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden animate-pulse">
      <div className="h-48 bg-white/10"></div>
      <div className="p-6">
        <div className="h-4 bg-white/10 rounded w-20 mb-3"></div>
        <div className="h-6 bg-white/10 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-white/10 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-white/10 rounded w-full mb-2"></div>
        <div className="h-4 bg-white/10 rounded w-5/6"></div>
      </div>
    </div>
  );

  const SkeletonHero = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
      <div className="relative h-[280px] md:h-[450px] rounded-none bg-white/5 animate-pulse overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
        <div className="relative h-full flex items-end p-4 md:p-12">
          <div className="max-w-3xl w-full">
            <div className="h-6 md:h-8 bg-white/10 rounded-full w-32 mb-2 md:mb-3"></div>
            <div className="h-8 md:h-10 bg-white/10 rounded w-3/4 mb-2 md:mb-3"></div>
            <div className="h-4 md:h-6 bg-white/10 rounded w-1/2 mb-3 md:mb-4"></div>
            <div className="h-8 md:h-12 bg-white/10 rounded w-32 md:w-40"></div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white flex flex-col overflow-x-hidden">
      <div className="flex-1">
        {loading ? (
          <>
            {/* Skeleton Hero */}
            <SkeletonHero />

            {/* Skeleton Tags */}
            <div className="border-y border-white/10 bg-white/5">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-6">
                <div className="flex gap-2 md:gap-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-7 md:h-10 w-20 md:w-24 bg-white/10 rounded-full animate-pulse"></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Skeleton Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex gap-8 justify-center">
              <div className="flex-1">
                <div className="h-10 bg-white/10 rounded w-48 mb-8 animate-pulse"></div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-400 text-lg">{error}</div>
          </div>
        ) : heroArticles.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-white/70 text-lg">No content available yet.</div>
          </div>
        ) : (
          <>
            {/* ─── HERO CAROUSEL ────────────────────────────────────────── */}
            <div
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8"
              onMouseEnter={() => setHeroAutoPaused(true)}
              onMouseLeave={() => setHeroAutoPaused(false)}
            >
              <div className="relative h-[280px] md:h-[450px] overflow-hidden">

                {/* Slides */}
                {heroArticles.map((article, index) => (
                  <div
                    key={article.id}
                    className={`absolute inset-0 transition-opacity duration-700 ${
                      index === currentHeroIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                    }`}
                    onClick={() => window.location.href = generateArticleUrl(article.id, article.title)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Background image */}
                    {article.image_url && (
                      <img
                        src={article.image_url}
                        alt={article.title}
                        className={`w-full h-full object-cover transition-transform duration-700 ${
                          index === currentHeroIndex ? 'scale-105' : 'scale-100'
                        }`}
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/20"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 to-pink-900/30 mix-blend-multiply"></div>

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-12">
                      <div className="max-w-3xl">
                        <h1 className="text-2xl md:text-5xl font-bold mb-2 md:mb-3 leading-tight text-white drop-shadow-lg">
                          {article.title}
                        </h1>
                        <p className="text-white/90 text-xs md:text-base mb-3 md:mb-4 drop-shadow-md">
                          By {article.author} • {new Date(article.created_at).toLocaleDateString()}
                        </p>
                        <p className="hidden md:block text-white/80 text-base mb-5 line-clamp-2 drop-shadow-md">
                          {stripMarkdown(article.content).substring(0, 200).trim()}...
                        </p>
                        <button className="px-4 py-2 md:px-8 md:py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs md:text-base font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg">
                          Read Full Story
                        </button>
                      </div>
                    </div>

                    {/* Category badge */}
                    <div className="absolute top-3 right-3 md:top-4 md:right-4 z-20">
                      <span className="inline-block px-2 py-1 md:px-3 md:py-1.5 bg-purple-600/90 backdrop-blur-sm text-white text-xs md:text-sm font-semibold rounded-full uppercase tracking-wider shadow-lg">
                        {(article.categories || [article.category]).includes('interview') ? '🎤 Interview'
                          : (article.categories || [article.category]).includes('review') ? '⭐ Review'
                          : '📰 Latest'}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Prev / Next arrows — only when multiple slides */}
                {heroArticles.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); setCurrentHeroIndex(i => (i - 1 + heroArticles.length) % heroArticles.length); }}
                      className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-11 md:h-11 bg-black/50 hover:bg-black/80 border border-white/20 hover:border-white/50 flex items-center justify-center transition-all"
                      aria-label="Previous"
                    >
                      <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setCurrentHeroIndex(i => (i + 1) % heroArticles.length); }}
                      className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-11 md:h-11 bg-black/50 hover:bg-black/80 border border-white/20 hover:border-white/50 flex items-center justify-center transition-all"
                      aria-label="Next"
                    >
                      <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}

                {/* Dot indicators */}
                {heroArticles.length > 1 && (
                  <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                    {heroArticles.map((_, i) => (
                      <button
                        key={i}
                        onClick={(e) => { e.stopPropagation(); setCurrentHeroIndex(i); }}
                        className={`transition-all duration-300 rounded-none ${
                          i === currentHeroIndex
                            ? 'w-6 h-1.5 bg-white'
                            : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
                        }`}
                        aria-label={`Go to slide ${i + 1}`}
                      />
                    ))}
                  </div>
                )}

                {/* Progress bar — auto-advance indicator */}
                {heroArticles.length > 1 && !heroAutoPaused && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 z-20 overflow-hidden">
                    <div
                      key={currentHeroIndex}
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      style={{ animation: 'heroProgress 6s linear forwards' }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* ─── LIVE TICKER + TRENDING TAGS (unified bar) ───────────── */}
            {(originals.length > 0 || mixedContent.length > 0 || trendingTags.length > 0) && (
              <div className="border-b border-white/10 bg-black">
                {/* Row 1 — ticker */}
                {(originals.length > 0 || mixedContent.length > 0) && (
                  <div className="flex items-stretch border-b border-white/[0.06] overflow-hidden">
                    <div className="flex-shrink-0 w-[72px] md:w-[108px] bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center self-stretch">
                      <span className="text-white text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                        LIVE
                      </span>
                    </div>
                    <div className="overflow-hidden flex-1 flex items-center">
                      <div className="animate-ticker inline-flex gap-12 whitespace-nowrap py-2.5 md:py-3">
                        {[...originals, ...mixedContent, ...interviewsSpotlight, ...originals, ...mixedContent, ...interviewsSpotlight]
                          .slice(0, 20)
                          .map((item, i) => (
                            <span
                              key={i}
                              onClick={() => window.location.href = generateArticleUrl(item.id, item.title)}
                              className="text-white/55 hover:text-white text-xs md:text-sm cursor-pointer transition-colors inline-flex items-center gap-2"
                            >
                              <span className="text-purple-400/70">◆</span>
                              {item.title}
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Row 2 — trending tags */}
                {trendingTags.length > 0 && (
                  <div className="flex items-stretch">
                    <div className="flex-shrink-0 w-[72px] md:w-[108px] bg-white/[0.04] border-r border-white/[0.06] flex items-center justify-center self-stretch">
                      <span className="text-white/40 text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap flex items-center gap-1.5">
                        <span className="text-base leading-none">🔥</span>
                        <span className="hidden md:inline">Trending</span>
                      </span>
                    </div>
                    <div className="flex-1 px-3 md:px-5 py-2.5 md:py-3 overflow-x-auto scrollbar-hide">
                      <div className="flex items-center gap-2 md:gap-2.5 whitespace-nowrap">
                        {trendingTags.map((tag, index) => (
                          <button
                            key={index}
                            className="flex-shrink-0 px-3 py-1 md:px-3.5 md:py-1.5 bg-white/[0.06] hover:bg-purple-600/25 border border-white/10 hover:border-purple-500/40 text-white/70 hover:text-white text-[11px] md:text-xs font-medium transition-all duration-200"
                          >
                            # {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

{/* Submit Music CTA - Mobile Only */}
            <div className="md:hidden border-b border-white/10 bg-gradient-to-r from-purple-900/20 to-pink-900/20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                <button
                  onClick={() => window.location.href = '/submit-music'}
                  className="w-full px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg text-center"
                >
                  🎵 Submit Your Music
                </button>
              </div>
            </div>

            {/* Mobile Ad - Adsterra Banner */}
            {adSettings.adsterra_home_mobile_enabled && <AdsterraMobileBanner className="py-4" />}

            {/* Mobile Ad - Beatport/Loopcloud */}
            <BeatportMobileBanner className="py-4" />

            {/* ─── 3-PANEL CONTAINED LAYOUT ───────────────────────────────── */}
            {/* LEFT = newsletter, CENTER = articles, RIGHT = ads/sidebar     */}
            <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-16 xl:px-24">
              <div className="flex gap-4 xl:gap-6 items-start pt-4 pb-8">

              {/* ── LEFT: Newsletter ───────────────────────────────────────── */}
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
                        <div className="mt-2 p-2 bg-green-500/15 border border-green-500/30 text-green-400 text-[11px]">
                          🎉 You're in!
                        </div>
                      )}
                      {newsletterStatus === 'error' && (
                        <div className="mt-2 p-2 bg-red-500/15 border border-red-500/30 text-red-400 text-[11px]">
                          {error}
                        </div>
                      )}
                      <div className="mt-3 pt-3 border-t border-white/[0.06]">
                        <p className="text-white/25 text-[9px] uppercase tracking-widest mb-2">Find us on</p>
                        <a href="https://instagram.com/pluggpress" target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-pink-900/30 border border-white/10 hover:border-pink-500/40 transition-all">
                          <svg className="w-3.5 h-3.5 text-pink-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                          <span className="text-white/50 text-[11px]">@pluggpress</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* ── Submit Music card ── */}
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

                  {/* ── Referral Ads ── */}
                  <ReferralAdWidget />

                </div>
              </div>

              {/* ── CENTER: All article content ────────────────────────────── */}
              <div className="flex-1 min-w-0">

                {/* ── 1of1 Originals ── */}
                {originals.length > 0 && (
                  <div className="mb-10">
                    <div className="mb-5">
                      <h2 className="text-2xl md:text-3xl font-bold mb-1.5 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
                        1of1 Originals
                      </h2>
                      <div className="h-0.5 w-16 bg-gradient-to-r from-yellow-500 to-orange-500"></div>
                    </div>
                    <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
                      {originals.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => window.location.href = generateArticleUrl(item.id, item.title)}
                          className="bg-white/5 border border-white/10 rounded-none overflow-hidden hover:bg-white/10 hover:border-yellow-500/50 transition-all duration-300 cursor-pointer group"
                        >
                          <div className="h-36 overflow-hidden relative bg-gradient-to-br from-gray-900 via-purple-950/40 to-gray-900">
                            {/* Fallback — always behind, revealed when img fails or is absent */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                              <span className="text-2xl opacity-40">
                                {item.category === 'interview' ? '🎤' : '🎵'}
                              </span>
                              <span className="text-white/20 text-[9px] uppercase tracking-widest font-medium">
                                {item.category || 'article'}
                              </span>
                            </div>
                            {item.image_url && (
                              <img
                                src={item.image_url}
                                alt={item.title}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                              />
                            )}
                          </div>
                          <div className="p-3">
                            <span className={`inline-block px-1.5 py-0.5 text-[10px] font-semibold rounded mb-1.5 ${
                              item.category === 'interview'
                                ? 'bg-pink-600/20 text-pink-400'
                                : 'bg-yellow-600/20 text-yellow-400'
                            }`}>
                              {item.category === 'interview' ? 'Interview' : 'Original'}
                            </span>
                            <h3 className="text-sm font-semibold mb-1 line-clamp-2 leading-snug">{item.title}</h3>
                            <p className="text-white/40 text-[10px] mb-2">
                              {item.author} · {new Date(item.created_at).toLocaleDateString()}
                            </p>
                            <p className="text-white/60 text-xs line-clamp-2">
                              {stripMarkdown(item.content)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── [NEW] INTERVIEWS SPOTLIGHT ─────────────────────────── */}
                {interviewsSpotlight.length > 0 && (
                  <div className="mb-10">
                    <div className="mb-6 flex items-end justify-between">
                      <div>
                        <h2 className="text-2xl md:text-3xl font-bold mb-1 bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
                          Artist Spotlights
                        </h2>
                        <p className="text-white/40 text-xs mb-3">In conversation with underground hip-hop's finest</p>
                        <div className="h-1 w-20 bg-gradient-to-r from-pink-500 to-rose-500"></div>
                      </div>
                      <a
                        href="/interviews"
                        className="text-pink-400 hover:text-pink-300 text-sm font-medium transition-colors whitespace-nowrap"
                      >
                        View All →
                      </a>
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                      {interviewsSpotlight.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => window.location.href = generateArticleUrl(item.id, item.title)}
                          className="flex-shrink-0 w-56 md:w-64 bg-white/5 border border-pink-500/20 overflow-hidden hover:border-pink-500/60 hover:bg-white/10 transition-all duration-300 cursor-pointer group"
                        >
                          {item.image_url ? (
                            <div className="h-44 overflow-hidden relative">
                              <img
                                src={item.image_url}
                                alt={item.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                              <div className="absolute inset-0 bg-gradient-to-r from-pink-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                              <span className="absolute bottom-2 left-2 px-2 py-1 bg-pink-600 text-white text-[10px] font-bold uppercase tracking-wider">
                                🎤 Interview
                              </span>
                            </div>
                          ) : (
                            <div className="h-44 bg-gradient-to-br from-pink-900/30 to-rose-900/20 flex items-center justify-center">
                              <span className="text-5xl">🎤</span>
                            </div>
                          )}
                          <div className="p-4">
                            <h3 className="text-sm font-semibold line-clamp-2 mb-2 group-hover:text-pink-300 transition-colors">
                              {item.title}
                            </h3>
                            <p className="text-white/40 text-xs">
                              By {item.author} • {new Date(item.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Reviews ─────────────────────────────────────────────── */}
                {reviewArticles.length > 0 && (
                  <div className="mb-10">
                    <div className="mb-6 flex items-end justify-between">
                      <div>
                        <h2 className="text-2xl md:text-3xl font-bold mb-1 bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                          ⭐ Reviews
                        </h2>
                        <p className="text-white/40 text-xs mb-3">In-depth breakdowns of the latest projects</p>
                        <div className="h-1 w-20 bg-gradient-to-r from-amber-500 to-yellow-400"></div>
                      </div>
                      <a
                        href="/reviews"
                        className="text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors whitespace-nowrap"
                      >
                        View All →
                      </a>
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                      {reviewArticles.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => window.location.href = generateArticleUrl(item.id, item.title)}
                          className="flex-shrink-0 w-56 md:w-64 bg-white/5 border border-amber-500/20 overflow-hidden hover:border-amber-500/60 hover:bg-white/10 transition-all duration-300 cursor-pointer group"
                        >
                          {item.image_url ? (
                            <div className="h-44 overflow-hidden relative">
                              <img
                                src={item.image_url}
                                alt={item.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                              <div className="absolute inset-0 bg-gradient-to-r from-amber-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                              <span className="absolute bottom-2 left-2 px-2 py-1 bg-amber-500 text-black text-[10px] font-bold uppercase tracking-wider">
                                ⭐ Review
                              </span>
                            </div>
                          ) : (
                            <div className="h-44 bg-gradient-to-br from-amber-900/30 to-yellow-900/20 flex items-center justify-center">
                              <span className="text-5xl">⭐</span>
                            </div>
                          )}
                          <div className="p-4">
                            <h3 className="text-sm font-semibold line-clamp-2 mb-2 group-hover:text-amber-300 transition-colors">
                              {item.title}
                            </h3>
                            <p className="text-white/40 text-xs">
                              By {item.author} • {new Date(item.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Evergreen Guides ────────────────────────────────────── */}
                {evergreenGuides.length > 0 && (
                  <>
                    <div className="mb-6">
                      <h2 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-green-400 via-emerald-400 to-green-400 bg-clip-text text-transparent">
                        Essential Guides
                      </h2>
                      <p className="text-white/60 text-xs mb-3">Everything you need to know about making it in underground hip hop</p>
                      <div className="h-1 w-20 bg-gradient-to-r from-green-500 to-emerald-500"></div>
                    </div>

                    <div className="relative mb-10">
                      {evergreenGuides.length > 4 && currentGuideIndex > 0 && (
                        <button
                          onClick={() => setCurrentGuideIndex(currentGuideIndex - 4)}
                          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-green-500 hover:bg-green-400 text-black p-3 transition-all duration-300 hover:scale-110"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                      )}
                      {evergreenGuides.length > 4 && currentGuideIndex + 4 < evergreenGuides.length && (
                        <button
                          onClick={() => setCurrentGuideIndex(currentGuideIndex + 4)}
                          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-green-500 hover:bg-green-400 text-black p-3 transition-all duration-300 hover:scale-110"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 transition-all duration-500 ease-in-out">
                        {evergreenGuides.map((item, index) => {
                          const isVisible = index >= currentGuideIndex && index < currentGuideIndex + 4;
                          const visibleIndex = index - currentGuideIndex;
                          return (
                            <div
                              key={item.id}
                              onClick={() => window.location.href = generateArticleUrl(item.id, item.title)}
                              className={`bg-white/5 border border-green-500/30 overflow-hidden hover:bg-white/10 hover:border-green-400/70 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/20 ${isVisible ? 'animate-fadeInUp' : 'hidden'}`}
                              style={{ animationDelay: isVisible ? `${visibleIndex * 100}ms` : '0ms' }}
                            >
                              {item.image_url && (
                                <div className="h-32 overflow-hidden relative">
                                  <img
                                    src={item.image_url}
                                    alt={item.title}
                                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                  />
                                  <div className="absolute top-2 right-2 bg-green-500 text-black px-2 py-1 text-xs font-bold flex items-center gap-1">
                                    <span>🌲</span>
                                  </div>
                                </div>
                              )}
                              <div className="p-3">
                                <h3 className="text-sm font-semibold mb-2 line-clamp-2 leading-snug">
                                  {item.title}
                                </h3>
                                <p className="text-white/70 text-xs mb-2 line-clamp-1">
                                  {stripMarkdown(item.content).split('.')[0]}.
                                </p>
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {item.tags && item.tags.slice(0, 3).map((tag, idx) => (
                                    <span key={idx} className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                                <p className="text-white/50 text-xs">
                                  {new Date(item.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

{/* ── Promotional Banner ──────────────────────────────────── */}
                <div className="mb-8">
                  <a href="/submit-music" className="block">
                    <img
                      src="/promo_banner_1_.png"
                      alt="Promotional Banner"
                      className="w-full rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                    />
                  </a>
                </div>

                {/* ── Latest Stories ──────────────────────────────────────── */}
                <div className="mb-5">
                  <h2 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Latest Stories
                  </h2>
                  <div className="h-1 w-24 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                </div>

                {mixedContent.length > 0 ? (
                  <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 mb-10">
                    {mixedContent.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => window.location.href = generateArticleUrl(item.id, item.title)}
                        className="bg-white/5 border border-white/10 rounded-none overflow-hidden hover:bg-white/10 hover:border-purple-500/50 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20"
                      >
                        <div className="h-40 overflow-hidden relative bg-gradient-to-br from-gray-900 via-purple-950/40 to-gray-900">
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                            <span className="text-2xl opacity-40">
                              {item.category === 'interview' ? '🎤' : '🎵'}
                            </span>
                            <span className="text-white/20 text-[9px] uppercase tracking-widest font-medium">
                              {item.category || 'article'}
                            </span>
                          </div>
                          {item.image_url && (
                            <img
                              src={item.image_url}
                              alt={item.title}
                              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          )}
                        </div>
                        <div className="p-6">
                          <div className="mb-2">
                            <span className={`px-2 py-1 text-xs font-semibold rounded ${
                              item.category === 'interview'
                                ? 'bg-pink-600/20 text-pink-400'
                                : 'bg-purple-600/20 text-purple-400'
                            }`}>
                              {item.category === 'interview' ? 'Interview' : 'Article'}
                            </span>
                          </div>
                          <h3 className="text-xl font-semibold mb-2 line-clamp-2">{item.title}</h3>
                          <p className="text-white/50 text-xs mb-3">
                            By {item.author} • {new Date(item.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-white/70 text-sm line-clamp-3 mb-4">
                            {stripMarkdown(item.content)}
                          </p>
                          {item.tags && item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {item.tags.slice(0, 2).map((tag, index) => (
                                <span key={index} className="px-2 py-1 bg-white/10 text-white/70 text-xs rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-white/50 mb-16">
                    No more stories available.
                  </div>
                )}

                {/* ── [NEW] ON THE RADAR ──────────────────────────────────── */}
                {onTheRadar.length > 0 && (
                  <div className="mb-10">
                    <div className="mb-6 flex items-end justify-between">
                      <div>
                        <h2 className="text-2xl md:text-3xl font-bold mb-1 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                          📡 On The Radar
                        </h2>
                        <p className="text-white/40 text-xs mb-3">Fresh drops hitting your feed right now</p>
                        <div className="h-1 w-20 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
                      </div>
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                      {onTheRadar.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => window.location.href = generateArticleUrl(item.id, item.title)}
                          className="flex-shrink-0 w-44 md:w-52 cursor-pointer group"
                        >
                          {item.image_url ? (
                            <div className="h-32 md:h-36 overflow-hidden relative mb-3 border border-cyan-500/20 group-hover:border-cyan-500/60 transition-all">
                              <img
                                src={item.image_url}
                                alt={item.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                              <div className="absolute inset-0 bg-cyan-500/0 group-hover:bg-cyan-500/10 transition-all"></div>
                            </div>
                          ) : (
                            <div className="h-32 md:h-36 bg-white/5 border border-cyan-500/20 group-hover:border-cyan-500/60 mb-3 flex items-center justify-center transition-all">
                              <span className="text-4xl">🎵</span>
                            </div>
                          )}
                          <h3 className="text-xs font-semibold line-clamp-2 text-white/80 group-hover:text-white transition-colors leading-snug">
                            {item.title}
                          </h3>
                          <p className="text-white/30 text-[10px] mt-1">
                            {new Date(item.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── NETWORK PLAYLISTS ───────────────────────────────────── */}
                <SpotifyPlaylistSection />

                {/* ── [NEW] SUBMIT MUSIC FULL CTA ─────────────────────────── */}
                <div className="mb-10 relative overflow-hidden border border-purple-500/30">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-black to-pink-950"></div>
                  <div
                    className="absolute inset-0 opacity-40"
                    style={{
                      backgroundImage:
                        'radial-gradient(circle at 15% 50%, rgba(168,85,247,0.4) 0%, transparent 50%), radial-gradient(circle at 85% 50%, rgba(236,72,153,0.4) 0%, transparent 50%)',
                    }}
                  ></div>
                  {/* Decorative grid lines */}
                  <div
                    className="absolute inset-0 opacity-5"
                    style={{
                      backgroundImage:
                        'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
                      backgroundSize: '40px 40px',
                    }}
                  ></div>

                  <div className="relative z-10 p-8 md:p-14 text-center">
                    <div className="text-5xl md:text-7xl mb-5">🎵</div>
                    <h2 className="text-3xl md:text-5xl font-black mb-4 bg-gradient-to-r from-purple-300 via-white to-pink-300 bg-clip-text text-transparent leading-tight">
                      Are You a 1of1?
                    </h2>
                    <p className="text-white/60 text-base md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
                      Submit your music, project, or story to Cry808. We cover the underground —{' '}
                      <span className="text-white/90">if you've got something real, we want to hear it.</span>
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <a
                        href="/submit-music"
                        className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-base md:text-lg rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-purple-500/30"
                      >
                        Submit Your Music
                      </a>
                      <a
                        href="/about"
                        className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/50 text-white font-bold text-base md:text-lg rounded-lg transition-all"
                      >
                        Learn About Us
                      </a>
                    </div>
                  </div>
                </div>

                {/* ── Newsletter CTA — hidden on lg+ (left panel handles it) ── */}
                <div className="lg:hidden bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-500/30 rounded-2xl p-8 md:p-12 backdrop-blur-sm mb-10">
                  <div className="max-w-2xl mx-auto text-center">
                    <h3 className="text-3xl md:text-4xl font-bold mb-4">Stay in the Loop</h3>
                    <p className="text-white/70 text-lg mb-8">
                      Get the latest hip-hop news, exclusive interviews, and album reviews delivered straight to your inbox.
                    </p>

                    <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 justify-center">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                        disabled={isSubmitting}
                        className="flex-1 max-w-md px-6 py-4 bg-black/50 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                      />
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {isSubmitting ? 'Subscribing...' : 'Subscribe Now'}
                      </button>
                    </form>

                    {newsletterStatus === 'success' && (
                      <div className="mt-4 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400">
                        🎉 Successfully subscribed! Check your inbox for updates.
                      </div>
                    )}
                    {newsletterStatus === 'error' && (
                      <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
                        {error}
                      </div>
                    )}
                  </div>
                </div>

                {/* ── [NEW] COMMUNITY / SOCIAL ────────────────────────────── */}
                <div className="border border-white/10 bg-white/3 p-8 md:p-10 mb-4">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold mb-2">Join the Community</h2>
                    <p className="text-white/40 text-sm">Stay connected with the underground — follow us everywhere</p>
                  </div>

                  <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                    {/* Instagram */}
                    <a
                      href="https://instagram.com/pluggpress"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-5 py-4 bg-white/5 hover:bg-gradient-to-br hover:from-purple-900/40 hover:to-pink-900/40 border border-white/10 hover:border-pink-500/40 transition-all group"
                    >
                      <svg className="w-6 h-6 text-pink-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                      <div>
                        <div className="text-white font-semibold text-sm group-hover:text-pink-300 transition-colors">Instagram</div>
                        <div className="text-white/40 text-xs">@pluggpress</div>
                      </div>
                    </a>

                    {/* Submit Music CTA card */}
                    <a
                      href="/submit-music"
                      className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-purple-900/40 to-pink-900/40 hover:from-purple-800/50 hover:to-pink-800/50 border border-purple-500/30 hover:border-purple-400/60 transition-all group"
                    >
                      <span className="text-2xl flex-shrink-0">🎵</span>
                      <div>
                        <div className="text-white font-semibold text-sm group-hover:text-purple-300 transition-colors">Submit Music</div>
                        <div className="text-white/40 text-xs">Get featured on Cry808</div>
                      </div>
                    </a>
                  </div>
                </div>

              </div>

              {/* ── RIGHT: Ads/Spotify ─────────────────────────────────────── */}
              <div className="hidden xl:block w-80 flex-shrink-0">
                <div className="sticky top-24 space-y-6">
                  {(() => {
                    const sidebarComponents = [
                      {
                        order: parseInt(adSettings.adsterra_order || '1'),
                        key: 'adsterra',
                        component: adSettings.adsterra_home_desktop_enabled && <AdsterraNative key="adsterra" />
                      },
                      {
                        order: parseInt(adSettings.beatport_sidebar_order || '2'),
                        key: 'beatport',
                        component: <BeatportBanner key="beatport" />
                      },
                      {
                        order: parseInt(adSettings.spotify_order || '3'),
                        key: 'spotify',
                        component: <SpotifyEmbed key="spotify" pageType="home" />
                      },
                      {
                        order: parseInt(adSettings.amazon_order || '4'),
                        key: 'amazon',
                        component: adSettings.amazon_home_enabled !== false && adSettings.amazon_home_enabled !== 'false'
                          ? <AmazonWidget key="amazon" page="home" />
                          : null
                      }
                    ];

                    return sidebarComponents
                      .sort((a, b) => a.order - b.order)
                      .map(item => item.component)
                      .filter(Boolean);
                  })()}
                </div>
              </div>

              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
