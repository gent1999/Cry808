import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

const ArticlesList = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [expandedAnalytics, setExpandedAnalytics] = useState(null); // ID of article with expanded analytics
  const [analyticsData, setAnalyticsData] = useState({}); // Store analytics for each article
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch(`${API_URL}/api/articles`);

        if (!response.ok) {
          throw new Error('Failed to fetch articles');
        }

        const data = await response.json();
        setArticles(data.articles);
      } catch (err) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this article?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/articles/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete article');
      }

      // Remove article from state
      setArticles(articles.filter(article => article.id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete article');
    }
  };

  const handleToggleFeatured = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('adminToken');

      // If currently featured, unset it. Otherwise, set it as featured
      const method = currentStatus ? 'DELETE' : 'PUT';
      const response = await fetch(`${API_URL}/api/featured/${id}`, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to update featured status');
      }

      // Update articles state - unset all others and set the new one
      setArticles(articles.map(article => ({
        ...article,
        is_featured: currentStatus ? false : article.id === id
      })));
    } catch (err) {
      setError(err.message || 'Failed to update featured status');
    }
  };

  const handleToggleAnalytics = async (articleId, articleTitle) => {
    // If clicking the same article, collapse it
    if (expandedAnalytics === articleId) {
      setExpandedAnalytics(null);
      return;
    }

    // If we already have the data, just expand it
    if (analyticsData[articleId]) {
      setExpandedAnalytics(articleId);
      return;
    }

    // Fetch analytics data
    setLoadingAnalytics(true);
    setExpandedAnalytics(articleId);

    try {
      const token = localStorage.getItem('adminToken');

      // Debug logging
      console.log('Token exists:', !!token);
      console.log('Token length:', token?.length);

      const slug = articleTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      console.log('Fetching analytics for slug:', slug);

      const [analyticsRes, seoRes] = await Promise.all([
        fetch(`${API_URL}/api/analytics/article/${slug}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/search-console/article/${slug}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      // Log response statuses
      console.log('Analytics response status:', analyticsRes.status);
      console.log('SEO response status:', seoRes.status);

      const analyticsJson = analyticsRes.ok ? await analyticsRes.json() : null;
      const seoJson = seoRes.ok ? await seoRes.json() : null;

      // Show error if requests failed
      if (!analyticsRes.ok || !seoRes.ok) {
        console.error('Analytics request failed:', analyticsRes.status, analyticsRes.statusText);
        console.error('SEO request failed:', seoRes.status, seoRes.statusText);

        if (analyticsRes.status === 401 || seoRes.status === 401) {
          setError('Authentication failed. Please log in again.');
        }
      }

      setAnalyticsData(prev => ({
        ...prev,
        [articleId]: {
          analytics: analyticsJson?.analytics,
          seo: seoJson?.seo
        }
      }));
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError('Failed to fetch analytics data: ' + err.message);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading articles...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">All Articles</h1>
            <div className="flex gap-3">
              {/* View Toggle Button */}
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors flex items-center gap-2"
                title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
              >
                {viewMode === 'grid' ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    List View
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Grid View
                  </>
                )}
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                View Site
              </button>
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded text-red-400">
            {error}
          </div>
        )}

        {articles.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-12 text-center border border-gray-700">
            <svg className="mx-auto h-12 w-12 text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-white mb-2">No articles yet</h3>
            <p className="text-gray-400 mb-6">Get started by creating your first article.</p>
            <button
              onClick={() => navigate('/admin/articles/create')}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-md transition-colors"
            >
              Create Article
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <div
                key={article.id}
                className={`bg-gray-800 rounded-lg overflow-hidden border transition-colors ${
                  article.is_featured
                    ? 'border-yellow-500 shadow-lg shadow-yellow-500/20'
                    : 'border-gray-700 hover:border-purple-500'
                }`}
              >
                {/* Clickable Article Preview */}
                <div
                  onClick={() => navigate(`/article/${article.id}`)}
                  className="cursor-pointer relative"
                >
                  {/* Featured Badge */}
                  {article.is_featured && (
                    <div className="absolute top-2 right-2 z-10 bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      FEATURED
                    </div>
                  )}
                  {/* Image Preview */}
                  {article.image_url ? (
                    <div className="h-48 overflow-hidden bg-gray-700">
                      <img
                        src={article.image_url}
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-purple-900 to-gray-800 flex items-center justify-center">
                      <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                      {article.title}
                    </h3>

                    <p className="text-gray-400 text-sm mb-4">
                      By {article.author} • {new Date(article.created_at).toLocaleDateString()}
                    </p>

                    <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                      {article.content}
                    </p>

                    {/* Tags */}
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {article.tags.map((tag, index) => (
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

                {/* Actions */}
                <div className="p-6 pt-0 space-y-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFeatured(article.id, article.is_featured);
                    }}
                    className={`w-full px-4 py-2 text-white text-sm font-semibold rounded-md transition-colors ${
                      article.is_featured
                        ? 'bg-yellow-600 hover:bg-yellow-700'
                        : 'bg-gray-600 hover:bg-gray-700'
                    }`}
                  >
                    {article.is_featured ? '⭐ Remove Featured' : '☆ Set as Featured'}
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin/articles/edit/${article.id}`);
                      }}
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-md transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(article.id);
                      }}
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-md transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // List View
          <div className="space-y-4">
            {articles.map((article) => (
              <div
                key={article.id}
                className={`rounded-lg border transition-colors overflow-hidden ${
                  article.is_featured
                    ? 'bg-gray-800 border-yellow-500 shadow-lg shadow-yellow-500/20'
                    : 'bg-gray-800 border-gray-700 hover:border-purple-500'
                }`}
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Clickable Article Preview */}
                  <div
                    onClick={() => navigate(`/article/${article.id}`)}
                    className="cursor-pointer flex flex-col sm:flex-row flex-1 relative"
                  >
                    {/* Featured Badge */}
                    {article.is_featured && (
                      <div className="absolute top-2 right-2 z-10 bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        FEATURED
                      </div>
                    )}
                    {/* Image Preview */}
                    {article.image_url ? (
                      <div className="sm:w-64 h-48 sm:h-auto overflow-hidden bg-gray-700 flex-shrink-0">
                        <img
                          src={article.image_url}
                          alt={article.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="sm:w-64 h-48 sm:h-auto bg-gradient-to-br from-purple-900 to-gray-800 flex items-center justify-center flex-shrink-0">
                        <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 p-6">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-2">
                          {article.title}
                        </h3>

                        <p className="text-gray-400 text-sm mb-3">
                          By {article.author} • {new Date(article.created_at).toLocaleDateString()}
                        </p>

                        <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                          {article.content}
                        </p>

                        {/* Tags */}
                        {article.tags && article.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {article.tags.map((tag, index) => (
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

                  {/* Actions */}
                  <div className="flex gap-2 p-6 pt-0 sm:pt-6 sm:flex-col sm:justify-center sm:w-auto border-t sm:border-t-0 sm:border-l border-gray-700">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleAnalytics(article.id, article.title);
                      }}
                      className="flex-1 sm:flex-initial px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-md transition-colors flex items-center justify-center gap-2"
                      title="View Analytics"
                    >
                      📊
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFeatured(article.id, article.is_featured);
                      }}
                      className={`flex-1 sm:flex-initial px-6 py-2 text-white text-sm font-semibold rounded-md transition-colors ${
                        article.is_featured
                          ? 'bg-yellow-600 hover:bg-yellow-700'
                          : 'bg-gray-600 hover:bg-gray-700'
                      }`}
                    >
                      {article.is_featured ? '⭐' : '☆'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin/articles/edit/${article.id}`);
                      }}
                      className="flex-1 sm:flex-initial px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-md transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(article.id);
                      }}
                      className="flex-1 sm:flex-initial px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-md transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Analytics Panel */}
                {expandedAnalytics === article.id && (
                  <div className="border-t border-gray-700 p-6 bg-gray-900/50">
                    {loadingAnalytics ? (
                      <div className="text-center text-white/70 py-8">
                        <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent rounded-full mb-2"></div>
                        <p>Loading analytics...</p>
                      </div>
                    ) : analyticsData[article.id] ? (
                      <div>
                        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                          📊 Performance Metrics (Last 28 Days)
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Google Analytics */}
                          {analyticsData[article.id].analytics && (
                            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                              <h5 className="text-sm font-semibold text-white/90 mb-3 flex items-center gap-2">
                                📈 Traffic Analytics
                              </h5>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-white/70">Page Views:</span>
                                  <span className="font-bold text-white">{analyticsData[article.id].analytics.pageViews.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-white/70">Unique Visitors:</span>
                                  <span className="font-bold text-white">{analyticsData[article.id].analytics.uniqueVisitors.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-white/70">Avg. Time:</span>
                                  <span className="font-bold text-white">{Math.floor(analyticsData[article.id].analytics.avgTimeOnPage / 60)}m {analyticsData[article.id].analytics.avgTimeOnPage % 60}s</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-white/70">Bounce Rate:</span>
                                  <span className="font-bold text-white">{analyticsData[article.id].analytics.bounceRate}%</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Google Search Console */}
                          {analyticsData[article.id].seo && (
                            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                              <h5 className="text-sm font-semibold text-white/90 mb-3 flex items-center gap-2">
                                🔍 SEO Performance
                              </h5>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-white/70">Clicks:</span>
                                  <span className="font-bold text-white">{analyticsData[article.id].seo.clicks.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-white/70">Impressions:</span>
                                  <span className="font-bold text-white">{analyticsData[article.id].seo.impressions.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-white/70">CTR:</span>
                                  <span className="font-bold text-white">{analyticsData[article.id].seo.ctr}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-white/70">Avg. Position:</span>
                                  <span className="font-bold text-white">#{analyticsData[article.id].seo.position}</span>
                                </div>
                              </div>

                              {/* Top Keywords */}
                              {analyticsData[article.id].seo.topQueries && analyticsData[article.id].seo.topQueries.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-700">
                                  <h6 className="text-xs font-semibold text-white/80 mb-2">Top Keywords:</h6>
                                  <div className="space-y-1.5">
                                    {analyticsData[article.id].seo.topQueries.map((query, index) => (
                                      <div key={index} className="flex justify-between items-center text-xs">
                                        <span className="text-white/70 truncate flex-1">{query.query}</span>
                                        <span className="text-white font-semibold ml-2">{query.clicks}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-white/70 py-4">
                        No analytics data available for this article
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ArticlesList;
