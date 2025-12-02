import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    drafts: 0,
    submissions: 0
  });
  const [analyticsStats, setAnalyticsStats] = useState({
    current: 0,
    previous: 0,
    allTime: 0,
    average: 0,
    change: 0,
    realtime: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    const verifyAdmin = async () => {
      const token = localStorage.getItem('adminToken');
      const adminInfo = localStorage.getItem('adminInfo');

      if (!token || !adminInfo) {
        navigate('/admin/login');
        return;
      }

      try {
        // Verify token with backend
        const response = await fetch(`${API_URL}/api/admin/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Session expired');
        }

        const data = await response.json();
        setAdmin(JSON.parse(adminInfo));

        // Fetch article stats
        const articlesResponse = await fetch(`${API_URL}/api/articles`);
        const submissionsResponse = await fetch(`${API_URL}/api/submissions`);

        let articleStats = { total: 0, published: 0, drafts: 0 };
        let submissionsCount = 0;

        if (articlesResponse.ok) {
          const articlesData = await articlesResponse.json();
          articleStats = {
            total: articlesData.count,
            published: articlesData.count, // For now, all articles are published
            drafts: 0 // No draft functionality yet
          };
        }

        if (submissionsResponse.ok) {
          const submissionsData = await submissionsResponse.json();
          submissionsCount = submissionsData.count;
        }

        setStats({
          ...articleStats,
          submissions: submissionsCount
        });

        // Fetch analytics data
        fetchAnalytics(token);
      } catch (err) {
        setError('Session expired. Please login again.');
        setTimeout(() => {
          handleLogout();
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    const fetchAnalytics = async (token) => {
      try {
        const analyticsResponse = await fetch(`${API_URL}/api/analytics/visitors`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (analyticsResponse.ok) {
          const analyticsData = await analyticsResponse.json();
          setAnalyticsStats({
            ...analyticsData.visitors,
            loading: false,
            error: null
          });
        } else {
          const errorData = await analyticsResponse.json();
          setAnalyticsStats(prev => ({
            ...prev,
            loading: false,
            error: errorData.message || errorData.error || 'Analytics not configured'
          }));
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setAnalyticsStats(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load analytics'
        }));
      }
    };

    verifyAdmin();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    navigate('/admin/login');
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/auth/delete-account`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      // Clear localStorage and redirect to login
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminInfo');
      navigate('/admin/login');
    } catch (err) {
      setError('Failed to delete account');
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                View Site
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-xl p-8 mb-8 border border-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Welcome back, {admin?.username}! 👋
              </h2>
              <p className="text-purple-100 text-sm">
                {admin?.email}
              </p>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-full p-4">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Article Stats */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">📝</span>
            Content Statistics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Articles</p>
                  <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
                </div>
                <div className="bg-blue-500/20 p-3 rounded-full">
                  <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Published</p>
                  <p className="text-3xl font-bold text-white mt-1">{stats.published}</p>
                </div>
                <div className="bg-green-500/20 p-3 rounded-full">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Drafts</p>
                  <p className="text-3xl font-bold text-white mt-1">{stats.drafts}</p>
                </div>
                <div className="bg-purple-500/20 p-3 rounded-full">
                  <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
              </div>
            </div>

            <div
              onClick={() => navigate('/admin/submissions')}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700 cursor-pointer hover:border-purple-500 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Submissions</p>
                  <p className="text-3xl font-bold text-white mt-1">{stats.submissions}</p>
                </div>
                <div className="bg-purple-500/20 p-3 rounded-full">
                  <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Stats from Google Analytics */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-2xl">📊</span>
              Google Analytics
            </h3>
            {analyticsStats.realtime > 0 && (
              <span className="flex items-center gap-2 text-sm text-green-400 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                {analyticsStats.realtime} online now
              </span>
            )}
          </div>

          {analyticsStats.loading ? (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <p className="text-gray-400 text-center">Loading analytics...</p>
            </div>
          ) : analyticsStats.error ? (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <p className="text-red-400 text-sm">{analyticsStats.error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* This Month Visitors */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-gray-400 text-sm">This Month</p>
                    <p className="text-3xl font-bold text-white mt-1">{analyticsStats.current.toLocaleString()}</p>
                    {analyticsStats.change !== 0 && (
                      <p className={`text-xs mt-2 ${analyticsStats.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {analyticsStats.change > 0 ? '↑' : '↓'} {Math.abs(analyticsStats.change)}% vs last month
                      </p>
                    )}
                  </div>
                  <div className="bg-blue-500/20 p-3 rounded-full">
                    <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Last Month Visitors */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Last Month</p>
                    <p className="text-3xl font-bold text-white mt-1">{analyticsStats.previous.toLocaleString()}</p>
                  </div>
                  <div className="bg-purple-500/20 p-3 rounded-full">
                    <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* All Time Visitors */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">All Time</p>
                    <p className="text-3xl font-bold text-white mt-1">{analyticsStats.allTime.toLocaleString()}</p>
                  </div>
                  <div className="bg-orange-500/20 p-3 rounded-full">
                    <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Average Monthly Visitors */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Avg. Monthly</p>
                    <p className="text-3xl font-bold text-white mt-1">{analyticsStats.average.toLocaleString()}</p>
                  </div>
                  <div className="bg-green-500/20 p-3 rounded-full">
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            Quick Actions
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Content Management */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>📄</span>
                Content Management
              </h4>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/admin/articles/create')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create New Article
                </button>
                <button
                  onClick={() => navigate('/admin/articles')}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  View All Articles
                </button>
                <button
                  onClick={() => navigate('/admin/submissions')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                  View Submissions
                </button>
              </div>
            </div>

            {/* Configuration */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>⚙️</span>
                Configuration
              </h4>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/admin/spotify')}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                  Spotify Manager
                </button>
                <button
                  onClick={() => navigate('/admin/amazon-products')}
                  className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595l.315-.14c.138-.06.234-.1.293-.13.226-.088.39-.046.525.13.12.174.09.336-.12.48-.256.19-.6.41-1.006.654-1.244.743-2.64 1.316-4.185 1.726-1.548.41-3.14.615-4.777.615-2.425 0-4.802-.515-7.13-1.545-2.33-1.03-4.17-2.44-5.53-4.237-.06-.08-.09-.144-.09-.194 0-.08.05-.138.15-.174zm23.95 1.06c-.18-.23-.48-.23-.94 0-.28.14-.628.34-1.046.6-.42.26-.97.56-1.66.91-.69.35-1.49.64-2.4.87-.91.23-1.91.34-3 .34-1.66 0-3.22-.36-4.69-1.08-1.47-.72-2.7-1.74-3.69-3.06-.11-.14-.16-.25-.16-.31 0-.09.06-.15.18-.18.13-.03.3.03.51.18.21.15.49.38.84.69.35.31.77.64 1.26.98.49.34 1.05.64 1.68.89.63.25 1.33.44 2.1.56.77.12 1.58.18 2.43.18 1.54 0 3-.24 4.38-.72 1.38-.48 2.54-1.15 3.48-2.01.1-.09.19-.14.26-.14.06 0 .1.05.14.14.03.1.03.19-.01.27z"/>
                  </svg>
                  Amazon Products
                </button>
                <button
                  onClick={() => navigate('/admin/settings')}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Ad Settings
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-gray-800 rounded-lg shadow-xl p-6 border border-red-500/30">
          <h3 className="text-xl font-bold text-red-400 mb-2 flex items-center gap-2">
            <span className="text-2xl">⚠️</span>
            Danger Zone
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            Permanently delete your admin account. This action cannot be undone and will allow new admin registration.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Account
          </button>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full border border-gray-700">
            <h3 className="text-2xl font-bold text-white mb-4">Delete Account?</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete your admin account? This action cannot be undone and will:
            </p>
            <ul className="text-gray-400 mb-6 space-y-2 list-disc list-inside">
              <li>Permanently delete your account</li>
              <li>Log you out immediately</li>
              <li>Allow new admin registration</li>
            </ul>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {deleteLoading ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
