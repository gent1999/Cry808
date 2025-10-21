import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function Home() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLatestArticles = async () => {
      try {
        const response = await fetch(`${API_URL}/api/articles`);

        if (!response.ok) {
          throw new Error('Failed to fetch articles');
        }

        const data = await response.json();
        // Get the latest 3 articles (sorted by created_at descending)
        const latestArticles = data.articles
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 3);

        setArticles(latestArticles);
      } catch (err) {
        setError(err.message || 'Failed to load articles');
      } finally {
        setLoading(false);
      }
    };

    fetchLatestArticles();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8">Latest Hip-Hop News</h1>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-white/70 text-lg">Loading latest articles...</div>
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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
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
        )}
      </div>
    </div>
  );
}
