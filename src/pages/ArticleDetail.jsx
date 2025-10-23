import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import AdSidebar from '../components/AdSidebar';

const API_URL = import.meta.env.VITE_API_URL;

const ArticleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [moreArticles, setMoreArticles] = useState([]);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-xl">Loading article...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
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

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="relative">
        {/* Share Sidebar - Fixed to far left */}
        <div className="hidden lg:flex fixed left-8 top-1/3 flex-col items-center gap-4 z-50">
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

        {/* Main Content with Ad Sidebar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex gap-8 justify-center">
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

        {/* Spotify Embed */}
        {article.spotify_url && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Listen on Spotify</h2>
            <div className="rounded-lg overflow-hidden">
              <iframe
                src={article.spotify_url.replace('open.spotify.com', 'open.spotify.com/embed')}
                width="100%"
                height="352"
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

        {/* Back Button Section */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
          >
            Back to Home
          </button>
        </div>
          </div>

          {/* Ad Sidebar */}
          <AdSidebar />
        </div>
      </div>

      {/* More Articles Section */}
      {moreArticles.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-white/10">
          <h2 className="text-3xl font-bold mb-8">More Articles</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {moreArticles.map((article) => (
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
                  <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                    {article.title}
                  </h3>

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
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ArticleDetail;
