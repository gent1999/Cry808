import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import AdSidebar from "../components/AdSidebar";
import AdsterraMobileBanner from "../components/AdsterraMobileBanner";
import AdsterraSmartlink from "../components/AdsterraSmartlink";
import AdsterraNative from "../components/AdsterraNative";
import HilltopAdSidebar from "../components/HilltopAdSidebar";
import HilltopMultiBanner from "../components/HilltopMultiBanner";
import HilltopInPagePush from "../components/HilltopInPagePush";
import HilltopPopUnder from "../components/HilltopPopUnder";
import HilltopSmartlink from "../components/HilltopSmartlink";
import { ADSTERRA_ENABLED, HILLTOP_ENABLED } from "../config/ads";
import { stripMarkdown } from "../utils/markdownUtils";
import { generateArticleUrl } from "../utils/slugify";

const API_URL = import.meta.env.VITE_API_URL;

export default function Home() {
  const navigate = useNavigate();
  const [heroArticle, setHeroArticle] = useState(null);
  const [originals, setOriginals] = useState([]);
  const [mixedContent, setMixedContent] = useState([]);
  const [trendingTags, setTrendingTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stats, setStats] = useState({ articles: 0, interviews: 0, subscribers: 0 });
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        // Fetch featured article
        const featuredResponse = await fetch(`${API_URL}/api/articles/featured/article`);
        const featuredData = await featuredResponse.json();

        // Set featured article as hero
        setHeroArticle(featuredData.article);

        // Fetch all articles
        const response = await fetch(`${API_URL}/api/articles`);

        if (!response.ok) {
          throw new Error('Failed to fetch articles');
        }

        const data = await response.json();
        const sortedArticles = data.articles.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        // Filter out the featured article from the grid
        const filteredArticles = sortedArticles.filter(article => article.id !== featuredData.article?.id);

        // Separate originals from regular articles
        const originalsOnly = filteredArticles.filter(article => article.is_original === true);
        const regularArticles = filteredArticles.filter(article => !article.is_original);

        // Limit originals to 5 (for 2 rows with 6th spot being ad)
        setOriginals(originalsOnly.slice(0, 5));

        // Limit regular articles to 5 (for 2 rows with 6th spot being ad)
        setMixedContent(regularArticles.slice(0, 5));

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

        // Calculate stats
        const articlesCount = sortedArticles.filter(a => a.category !== 'interview').length;
        const interviewsCount = sortedArticles.filter(a => a.category === 'interview').length;

        // Fetch subscriber count
        try {
          const subsResponse = await fetch(`${API_URL}/api/newsletter/subscribers`);
          const subsData = await subsResponse.json();
          setStats({
            articles: articlesCount,
            interviews: interviewsCount,
            subscribers: subsData.active_count || 0
          });
        } catch {
          setStats({
            articles: articlesCount,
            interviews: interviewsCount,
            subscribers: 0
          });
        }
      } catch (err) {
        setError(err.message || 'Failed to load articles');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
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
      // Clear status after 5 seconds
      setTimeout(() => setNewsletterStatus(''), 5000);
    }
  };

  // Animated counter component
  const AnimatedCounter = ({ end, duration = 2000, label, icon }) => {
    const [count, setCount] = useState(0);
    const countRef = React.useRef(null);

    useEffect(() => {
      if (!hasAnimated) return;

      let startTime;
      const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        setCount(Math.floor(progress * end));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }, [end, duration, hasAnimated]);

    useEffect(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && !hasAnimated) {
            setHasAnimated(true);
          }
        },
        { threshold: 0.5 }
      );

      if (countRef.current) {
        observer.observe(countRef.current);
      }

      return () => observer.disconnect();
    }, []);

    return (
      <div ref={countRef} className="text-center">
        <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          {icon} {count.toLocaleString()}+
        </div>
        <div className="text-white/60 text-sm md:text-base uppercase tracking-wider">
          {label}
        </div>
      </div>
    );
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="relative h-[400px] md:h-[450px] rounded-2xl bg-white/5 animate-pulse overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
        <div className="relative h-full flex items-end p-6 md:p-12">
          <div className="max-w-3xl w-full">
            <div className="h-8 bg-white/10 rounded-full w-32 mb-3"></div>
            <div className="h-10 bg-white/10 rounded w-3/4 mb-3"></div>
            <div className="h-6 bg-white/10 rounded w-1/2 mb-4"></div>
            <div className="h-12 bg-white/10 rounded w-40"></div>
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
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex gap-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-10 w-24 bg-white/10 rounded-full animate-pulse"></div>
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
              {ADSTERRA_ENABLED && <AdSidebar />}
              {HILLTOP_ENABLED && <HilltopAdSidebar />}
            </div>
          </>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-400 text-lg">{error}</div>
          </div>
        ) : !heroArticle ? (
          <div className="text-center py-12">
            <div className="text-white/70 text-lg">No content available yet.</div>
          </div>
        ) : (
          <>
            {/* Hero Article with Overlay */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="relative group cursor-pointer" onClick={() => window.location.href = generateArticleUrl(heroArticle.id, heroArticle.title)}>
                <div className="relative h-[400px] md:h-[450px] rounded-2xl overflow-hidden">
                  {/* Background Image with Gradient Overlay */}
                  <div className="absolute inset-0">
                    {heroArticle.image_url && (
                      <img
                        src={heroArticle.image_url}
                        alt={heroArticle.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/20"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 to-pink-900/30 mix-blend-multiply"></div>
                  </div>

                  {/* Hero Content */}
                  <div className="relative h-full flex flex-col justify-end p-6 md:p-12">
                    <div className="max-w-3xl">
                      {/* Title */}
                      <h1 className="text-3xl md:text-5xl font-bold mb-3 leading-tight text-white drop-shadow-lg">
                        {heroArticle.title}
                      </h1>

                      {/* Meta */}
                      <p className="text-white/90 text-sm md:text-base mb-4 drop-shadow-md">
                        By {heroArticle.author} • {new Date(heroArticle.created_at).toLocaleDateString()}
                      </p>

                      {/* Excerpt - Hidden on mobile, shown on larger screens */}
                      <p className="hidden md:block text-white/80 text-base mb-5 line-clamp-2 drop-shadow-md">
                        {stripMarkdown(heroArticle.content).substring(0, 200).trim()}...
                      </p>

                      {/* Read More Button */}
                      <button className="px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm md:text-base font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg">
                        Read Full Story
                      </button>
                    </div>
                  </div>
                </div>

                {/* Category Badge - Outside image container */}
                <div className="absolute top-4 right-10 md:right-16">
                  <span className="inline-block px-3 py-1.5 bg-purple-600/90 backdrop-blur-sm text-white text-xs md:text-sm font-semibold rounded-full uppercase tracking-wider shadow-lg">
                    {heroArticle.category === 'interview' ? '🎤 Interview' : '📰 Latest'}
                  </span>
                </div>
              </div>
            </div>

            {/* Trending Tags Section */}
            {trendingTags.length > 0 && (
              <div className="border-b border-white/10 bg-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="text-white/50 font-semibold uppercase text-sm tracking-wider">
                      🔥 Trending:
                    </span>
                    <div className="flex flex-wrap gap-3">
                      {trendingTags.map((tag, index) => (
                        <button
                          key={index}
                          className="px-4 py-2 bg-white/10 hover:bg-purple-600/30 border border-white/20 hover:border-purple-500/50 text-white text-sm rounded-full transition-all"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Music CTA - Mobile Only */}
            <div className="md:hidden border-b border-white/10 bg-gradient-to-r from-purple-900/20 to-pink-900/20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <button
                  onClick={() => window.location.href = '/submit-music'}
                  className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg text-center"
                >
                  🎵 Submit Your Music
                </button>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex gap-8 justify-center">
              <div className="flex-1">
                {/* Mobile Banner Ad - Top of Main Content */}
                <div className="xl:hidden mb-8">
                  {HILLTOP_ENABLED && <HilltopMultiBanner />}
                </div>

                {/* 1of1 Originals Section */}
                {originals.length > 0 && (
                  <>
                    <div className="mb-8">
                      <h2 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
                        1of1 Originals
                      </h2>
                      <div className="h-1 w-24 bg-gradient-to-r from-yellow-500 to-orange-500"></div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-16">
                      {originals.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => window.location.href = generateArticleUrl(item.id, item.title)}
                          className="bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:bg-white/10 hover:border-yellow-500/50 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-xl hover:shadow-yellow-500/20"
                        >
                          {/* Image */}
                          {item.image_url && (
                            <div className="h-48 overflow-hidden">
                              <img
                                src={item.image_url}
                                alt={item.title}
                                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                              />
                            </div>
                          )}

                          {/* Content */}
                          <div className="p-6">
                            {/* Category Badge */}
                            <div className="mb-2">
                              <span className={`px-2 py-1 text-xs font-semibold rounded ${
                                item.category === 'interview'
                                  ? 'bg-pink-600/20 text-pink-400'
                                  : 'bg-yellow-600/20 text-yellow-400'
                              }`}>
                                {item.category === 'interview' ? 'Interview' : 'Original'}
                              </span>
                            </div>

                            <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                              {item.title}
                            </h3>

                            <p className="text-white/50 text-xs mb-3">
                              By {item.author} • {new Date(item.created_at).toLocaleDateString()}
                            </p>

                            <p className="text-white/70 text-sm line-clamp-3 mb-4">
                              {stripMarkdown(item.content)}
                            </p>

                            {/* Tags */}
                            {item.tags && item.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {item.tags.slice(0, 2).map((tag, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-white/10 text-white/70 text-xs rounded"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Sponsored Content Ad - 6th spot (2 rows max) */}
                      {HILLTOP_ENABLED && (
                        <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden flex items-center justify-center p-6">
                          <HilltopSmartlink
                            type="card"
                            text="Sponsored Content"
                            className="h-full w-full"
                          />
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Latest Stories Header */}
                <div className="mb-8">
                  <h2 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Latest Stories
                  </h2>
                  <div className="h-1 w-24 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                </div>

                {/* Mixed Grid */}
                {mixedContent.length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-16">
                    {mixedContent.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => window.location.href = generateArticleUrl(item.id, item.title)}
                        className="bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:bg-white/10 hover:border-purple-500/50 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20"
                      >
                        {/* Image */}
                        {item.image_url && (
                          <div className="h-48 overflow-hidden">
                            <img
                              src={item.image_url}
                              alt={item.title}
                              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                            />
                          </div>
                        )}

                        {/* Content */}
                        <div className="p-6">
                          {/* Category Badge */}
                          <div className="mb-2">
                            <span className={`px-2 py-1 text-xs font-semibold rounded ${
                              item.category === 'interview'
                                ? 'bg-pink-600/20 text-pink-400'
                                : 'bg-purple-600/20 text-purple-400'
                            }`}>
                              {item.category === 'interview' ? 'Interview' : 'Article'}
                            </span>
                          </div>

                          <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                            {item.title}
                          </h3>

                          <p className="text-white/50 text-xs mb-3">
                            By {item.author} • {new Date(item.created_at).toLocaleDateString()}
                          </p>

                          <p className="text-white/70 text-sm line-clamp-3 mb-4">
                            {stripMarkdown(item.content)}
                          </p>

                          {/* Tags */}
                          {item.tags && item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {item.tags.slice(0, 2).map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-white/10 text-white/70 text-xs rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Sponsored Content Ad - 6th spot (2 rows max) */}
                    {HILLTOP_ENABLED && (
                      <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden flex items-center justify-center p-6">
                        <HilltopSmartlink
                          type="card"
                          text="Sponsored Content"
                          className="h-full w-full"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-white/50">
                    No more stories available.
                  </div>
                )}

                {/* Native Banner - Full Width before Newsletter */}
                {ADSTERRA_ENABLED && (
                  <div className="mb-8">
                    <AdsterraNative showLabel={true} />
                  </div>
                )}

                {/* Newsletter CTA */}
                <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-500/30 rounded-2xl p-8 md:p-12 backdrop-blur-sm">
                  <div className="max-w-2xl mx-auto text-center">
                    <h3 className="text-3xl md:text-4xl font-bold mb-4">
                      Stay in the Loop
                    </h3>
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

                    {/* Status Messages */}
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
              </div>

              {/* Ad Sidebar */}
              {ADSTERRA_ENABLED && <AdSidebar />}
              {HILLTOP_ENABLED && <HilltopAdSidebar />}
            </div>
          </>
        )}
      </div>
      <Footer />
      {HILLTOP_ENABLED && <HilltopInPagePush />}
      {HILLTOP_ENABLED && <HilltopPopUnder />}
    </div>
  );
}
