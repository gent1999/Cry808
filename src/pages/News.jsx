import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import { stripMarkdown } from "../utils/markdownUtils";
import { generateArticleUrl } from "../utils/slugify";

const API_URL = import.meta.env.VITE_API_URL;

export default function News() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [visibleCount, setVisibleCount] = useState(20);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch(`${API_URL}/api/articles`);

        if (!response.ok) {
          throw new Error('Failed to fetch articles');
        }

        const data = await response.json();
        const sortedArticles = data.articles.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        // Hide interviews and guides from News
        const filtered = sortedArticles.filter(article =>
          article.category !== 'interview' &&
          article.category !== 'guide' &&
          article.category !== 'guides' &&
          !article.is_evergreen
        );
        setArticles(filtered);
      } catch (err) {
        setError(err.message || 'Failed to load articles');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  // Incrementally reveal 20 articles at a time as you scroll
  useEffect(() => {
    if (loading || articles.length === 0) return;
    const hasMore = visibleCount < articles.length;
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsLoadingMore(true);
          setVisibleCount((prev) => Math.min(prev + 20, articles.length));
          setTimeout(() => setIsLoadingMore(false), 150); // brief flash so users see we're loading more
        }
      },
      { rootMargin: '200px' }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [articles.length, loading, visibleCount]);

  const visibleArticles = articles.slice(0, visibleCount);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col overflow-x-hidden">
      <div className="flex-1">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              All News
            </h1>
            <div className="h-1 w-32 bg-gradient-to-r from-purple-500 to-pink-500"></div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex-1">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-white/70 text-lg">Loading articles...</div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-400 text-lg">{error}</div>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-white/70 text-lg">No articles available yet.</div>
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                {visibleArticles.map((article) => (
                  <div
                    key={article.id}
                    onClick={() => window.location.href = generateArticleUrl(article.id, article.title)}
                    className="bg-white/5 border border-white/10 rounded-none overflow-hidden hover:bg-white/10 hover:border-purple-500/50 transition cursor-pointer group"
                  >
                    {/* Article Image */}
                    {article.image_url && (
                      <div className="h-48 overflow-hidden relative">
                        <img
                          src={article.image_url}
                          alt={article.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"></div>
                      </div>
                    )}

                    {/* Article Content */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-2 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                          article.category === 'interview'
                            ? 'bg-pink-600/20 text-pink-300'
                            : 'bg-purple-600/20 text-purple-300'
                        }`}>
                          {article.category === 'interview' ? 'Interview' : 'Article'}
                        </span>
                        <span className="text-[11px] text-white/50">{new Date(article.created_at).toLocaleDateString()}</span>
                      </div>

                      <h2 className="text-xl font-semibold mb-2 line-clamp-2">
                        {article.title}
                      </h2>

                      <p className="text-white/50 text-xs mb-3">
                        By {article.author}
                      </p>

                      <p className="text-white/70 text-sm line-clamp-3 mb-4">
                        {stripMarkdown(article.content).slice(0, 220)}...
                      </p>

                      {/* Tags */}
                      {article.tags && article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {article.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-purple-600/20 text-purple-300 text-xs rounded-none"
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

              {/* Infinite scroll sentinel */}
              {visibleCount < articles.length && (
                <div
                  ref={loadMoreRef}
                  className="flex justify-center items-center py-6 text-white/50 text-sm"
                >
                  {isLoadingMore ? 'Loading more...' : 'Scroll to load more'}
                </div>
              )}
            </>
          )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
