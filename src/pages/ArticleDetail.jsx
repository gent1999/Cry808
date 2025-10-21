import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

const ArticleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

    fetchArticle();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading article...</div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
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
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
          <div className="text-white/90 leading-relaxed whitespace-pre-wrap">
            {article.content}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;
