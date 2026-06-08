import React, { useState, useEffect, useRef } from "react";
import Footer from "../components/Footer";
import { stripMarkdown } from "../utils/markdownUtils";
import { generateArticleUrl } from "../utils/slugify";

const API_URL = import.meta.env.VITE_API_URL;

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [visibleCount, setVisibleCount] = useState(20);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`${API_URL}/api/articles`);
        if (!response.ok) throw new Error('Failed to fetch reviews');
        const data = await response.json();
        const reviewsOnly = data.articles
          .filter(a =>
            a.category === 'review' ||
            (Array.isArray(a.categories) && a.categories.includes('review'))
          )
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setReviews(reviewsOnly);
      } catch (err) {
        setError(err.message || 'Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  // Infinite scroll — reveal 20 at a time
  useEffect(() => {
    if (loading || reviews.length === 0) return;
    if (visibleCount >= reviews.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsLoadingMore(true);
          setVisibleCount((prev) => Math.min(prev + 20, reviews.length));
          setTimeout(() => setIsLoadingMore(false), 150);
        }
      },
      { rootMargin: '200px' }
    );

    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [reviews.length, loading, visibleCount]);

  const visibleReviews = reviews.slice(0, visibleCount);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col overflow-x-hidden">
      <div className="flex-1">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-amber-900/20 via-black to-black"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
              ⭐ Reviews
            </h1>
            <p className="text-white/50 text-sm mb-4">In-depth breakdowns of the latest projects</p>
            <div className="h-1 w-32 bg-gradient-to-r from-amber-500 to-yellow-400"></div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-white/70 text-lg">Loading reviews...</div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-400 text-lg">{error}</div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-white/70 text-lg">No reviews available yet.</div>
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                {visibleReviews.map((review) => (
                  <div
                    key={review.id}
                    onClick={() => window.location.href = generateArticleUrl(review.id, review.title)}
                    className="bg-white/5 border border-white/10 rounded-none overflow-hidden hover:bg-white/10 hover:border-amber-500/50 transition cursor-pointer group"
                  >
                    <div className="h-48 overflow-hidden relative bg-gradient-to-br from-amber-950/40 via-black to-gray-900">
                      {/* Fallback always sits behind the image */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl opacity-30">⭐</span>
                      </div>
                      {review.image_url && (
                        <img
                          src={review.image_url}
                          alt={review.title}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"></div>
                      <span className="absolute bottom-2 left-2 px-2 py-1 bg-amber-500 text-black text-[10px] font-bold uppercase tracking-wider">
                        ⭐ Review
                      </span>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide bg-amber-600/20 text-amber-300">
                          Review
                        </span>
                        <span className="text-[11px] text-white/50">{new Date(review.created_at).toLocaleDateString()}</span>
                      </div>

                      <h2 className="text-xl font-semibold mb-2 line-clamp-2">
                        {review.title}
                      </h2>

                      <p className="text-white/50 text-xs mb-3">
                        By {review.author}
                      </p>

                      <p className="text-white/70 text-sm line-clamp-3 mb-4">
                        {stripMarkdown(review.content).slice(0, 220)}...
                      </p>

                      {review.tags && review.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {review.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-amber-600/20 text-amber-300 text-xs rounded-none">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {visibleCount < reviews.length && (
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
      <Footer />
    </div>
  );
}
