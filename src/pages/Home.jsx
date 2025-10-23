import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

const API_URL = import.meta.env.VITE_API_URL;

export default function Home() {
  const navigate = useNavigate();
  const [latestArticles, setLatestArticles] = useState([]);
  const [moreArticles, setMoreArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch(`${API_URL}/api/articles`);

        if (!response.ok) {
          throw new Error('Failed to fetch articles');
        }

        const data = await response.json();
        const sortedArticles = data.articles.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        // Get the latest 3 articles for the top section
        setLatestArticles(sortedArticles.slice(0, 3));

        // Get the next articles (starting from 4th) for the "More Stories" section
        setMoreArticles(sortedArticles.slice(3));
      } catch (err) {
        setError(err.message || 'Failed to load articles');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex-1">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Latest Hip-Hop News
            </h1>
            <div className="h-1 w-32 bg-gradient-to-r from-purple-500 to-pink-500"></div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-white/70 text-lg">Loading latest articles...</div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-400 text-lg">{error}</div>
          </div>
        ) : latestArticles.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-white/70 text-lg">No articles available yet.</div>
          </div>
        ) : (
          <>
            {/* Latest Hip Hop News - Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-16">
              {latestArticles.map((article) => (
                <div
                  key={article.id}
                  onClick={() => navigate(`/article/${article.id}`)}
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
                    <h2 className="text-xl font-semibold mb-2 line-clamp-2">
                      {article.title}
                    </h2>

                    <p className="text-white/50 text-xs mb-3">
                      By {article.author} • {new Date(article.created_at).toLocaleDateString()}
                    </p>

                    <p className="text-white/70 text-sm line-clamp-3 mb-4">
                      {article.content}
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

            {/* More Stories - Vertical List */}
            {moreArticles.length > 0 && (
              <div className="border-t border-white/10 pt-12">
                <h2 className="text-3xl font-bold mb-8">More Stories</h2>
                <div className="space-y-6">
                  {moreArticles.map((article) => (
                    <div
                      key={article.id}
                      onClick={() => navigate(`/article/${article.id}`)}
                      className="bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:bg-white/10 transition cursor-pointer"
                    >
                      <div className="flex flex-col sm:flex-row">
                        {/* Article Image */}
                        {article.image_url && (
                          <div className="sm:w-64 h-48 sm:h-auto overflow-hidden flex-shrink-0">
                            <img
                              src={article.image_url}
                              alt={article.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        {/* Article Content */}
                        <div className="p-6 flex-1">
                          <h3 className="text-2xl font-bold mb-2 line-clamp-2">
                            {article.title}
                          </h3>

                          <p className="text-white/50 text-sm mb-3">
                            By {article.author} • {new Date(article.created_at).toLocaleDateString()}
                          </p>

                          <p className="text-white/70 text-sm line-clamp-3 mb-4">
                            {article.content}
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
                    </div>
                  ))}
                </div>
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
