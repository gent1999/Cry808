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
  const [searchConsoleStats, setSearchConsoleStats] = useState({
    performance: {
      clicks: 0,
      impressions: 0,
      ctr: 0,
      position: 0
    },
    topQueries: [],
    topPages: [],
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
        // Fetch search console data
        fetchSearchConsole(token);
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
        const analyticsResponse = await fetch(`${API_URL}/api/analytics/visitors?site=cry808`, {
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

    const fetchSearchConsole = async (token) => {
      try {
        // Fetch performance metrics
        const performanceResponse = await fetch(`${API_URL}/api/search-console/performance`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        // Fetch top queries
        const queriesResponse = await fetch(`${API_URL}/api/search-console/top-queries`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        // Fetch top pages
        const pagesResponse = await fetch(`${API_URL}/api/search-console/top-pages`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        let performance = { clicks: 0, impressions: 0, ctr: 0, position: 0 };
        let topQueries = [];
        let topPages = [];
        let error = null;

        if (performanceResponse.ok) {
          const perfData = await performanceResponse.json();
          performance = perfData.performance;
        } else {
          const errorData = await performanceResponse.json();
          error = errorData.message || 'Search Console not configured';
        }

        if (queriesResponse.ok) {
          const queriesData = await queriesResponse.json();
          topQueries = queriesData.queries || [];
        }

        if (pagesResponse.ok) {
          const pagesData = await pagesResponse.json();
          topPages = pagesData.pages || [];
        }

        setSearchConsoleStats({
          performance,
          topQueries,
          topPages,
          loading: false,
          error
        });
      } catch (err) {
        console.error('Error fetching Search Console data:', err);
        setSearchConsoleStats(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load Search Console data'
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

  const StatCell = ({ label, value, sub, accent }) => (
    <div className="bg-gray-900 border border-gray-700 px-4 py-3">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${accent || 'text-white'}`}>{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-0.5">{sub}</div>}
    </div>
  );

  const Btn = ({ onClick, children, color = 'gray' }) => {
    const colors = {
      gray:   'bg-gray-700 hover:bg-gray-600',
      blue:   'bg-blue-700 hover:bg-blue-600',
      purple: 'bg-purple-700 hover:bg-purple-600',
      green:  'bg-green-700 hover:bg-green-600',
      orange: 'bg-orange-700 hover:bg-orange-600',
      red:    'bg-red-700 hover:bg-red-600',
    };
    return (
      <button onClick={onClick} className={`${colors[color]} text-white text-sm px-4 py-2 transition-colors w-full text-left`}>
        {children}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <span className="font-bold text-white">Dashboard</span>
            <span className="text-gray-500 text-sm ml-3">{admin?.username} · {admin?.email}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate('/')} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-sm transition-colors">View Site</button>
            <button onClick={handleLogout} className="px-3 py-1.5 bg-red-700 hover:bg-red-600 text-sm transition-colors">Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {/* Content Stats */}
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1 px-1">Content</div>
          <div className="grid grid-cols-4 gap-px bg-gray-700">
            <StatCell label="Total Articles" value={stats.total} />
            <StatCell label="Published" value={stats.published} accent="text-green-400" />
            <StatCell label="Drafts" value={stats.drafts} />
            <StatCell label="Submissions" value={stats.submissions} accent="text-purple-400" />
          </div>
        </div>

        {/* Analytics */}
        <div>
          <div className="flex items-center justify-between mb-1 px-1">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Google Analytics</div>
            {analyticsStats.realtime > 0 && (
              <span className="flex items-center gap-1.5 text-xs text-green-400">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                {analyticsStats.realtime} online now
              </span>
            )}
          </div>
          {analyticsStats.loading ? (
            <div className="bg-gray-800 border border-gray-700 px-4 py-3 text-sm text-gray-500">Loading...</div>
          ) : analyticsStats.error ? (
            <div className="bg-gray-800 border border-gray-700 px-4 py-3 text-sm text-red-400">{analyticsStats.error}</div>
          ) : (
            <div className="grid grid-cols-4 gap-px bg-gray-700">
              <StatCell label="This Month" value={analyticsStats.current.toLocaleString()}
                sub={analyticsStats.change !== 0 ? `${analyticsStats.change > 0 ? '↑' : '↓'} ${Math.abs(analyticsStats.change)}% vs last month` : null}
                accent={analyticsStats.change > 0 ? 'text-green-400' : analyticsStats.change < 0 ? 'text-red-400' : 'text-white'} />
              <StatCell label="Last Month" value={analyticsStats.previous.toLocaleString()} />
              <StatCell label="All Time" value={analyticsStats.allTime.toLocaleString()} />
              <StatCell label="Avg. Monthly" value={analyticsStats.average.toLocaleString()} />
            </div>
          )}
        </div>

        {/* Search Console */}
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1 px-1">Search Console (28 days)</div>
          {searchConsoleStats.loading ? (
            <div className="bg-gray-800 border border-gray-700 px-4 py-3 text-sm text-gray-500">Loading...</div>
          ) : searchConsoleStats.error ? (
            <div className="bg-gray-800 border border-gray-700 px-4 py-3 text-sm text-red-400">{searchConsoleStats.error}</div>
          ) : (
            <div className="space-y-px">
              <div className="grid grid-cols-4 gap-px bg-gray-700">
                <StatCell label="Clicks" value={searchConsoleStats.performance.clicks.toLocaleString()} />
                <StatCell label="Impressions" value={searchConsoleStats.performance.impressions.toLocaleString()} />
                <StatCell label="CTR" value={`${searchConsoleStats.performance.ctr}%`} />
                <StatCell label="Avg. Position" value={searchConsoleStats.performance.position} />
              </div>

              <div className="grid grid-cols-2 gap-px bg-gray-700">
                {/* Top Keywords */}
                <div className="bg-gray-800">
                  <div className="px-3 py-2 border-b border-gray-700 text-xs text-gray-400 font-medium">Top Keywords</div>
                  {searchConsoleStats.topQueries.length > 0 ? (
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="px-3 py-1.5 text-left text-gray-500 font-normal">Query</th>
                          <th className="px-3 py-1.5 text-right text-gray-500 font-normal">Clicks</th>
                          <th className="px-3 py-1.5 text-right text-gray-500 font-normal">CTR</th>
                          <th className="px-3 py-1.5 text-right text-gray-500 font-normal">Pos</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700/50">
                        {searchConsoleStats.topQueries.slice(0, 5).map((q, i) => (
                          <tr key={i} className="hover:bg-gray-700/30">
                            <td className="px-3 py-1.5 text-white truncate max-w-[140px]">{q.query}</td>
                            <td className="px-3 py-1.5 text-right text-gray-300">{q.clicks}</td>
                            <td className="px-3 py-1.5 text-right text-gray-300">{q.ctr}%</td>
                            <td className="px-3 py-1.5 text-right text-gray-300">{q.position}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="px-3 py-4 text-xs text-gray-500 text-center">No data</div>
                  )}
                </div>

                {/* Top Pages */}
                <div className="bg-gray-800">
                  <div className="px-3 py-2 border-b border-gray-700 text-xs text-gray-400 font-medium">Top Pages</div>
                  {searchConsoleStats.topPages.length > 0 ? (
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="px-3 py-1.5 text-left text-gray-500 font-normal">Page</th>
                          <th className="px-3 py-1.5 text-right text-gray-500 font-normal">Clicks</th>
                          <th className="px-3 py-1.5 text-right text-gray-500 font-normal">Impr</th>
                          <th className="px-3 py-1.5 text-right text-gray-500 font-normal">CTR</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700/50">
                        {searchConsoleStats.topPages.slice(0, 5).map((p, i) => (
                          <tr key={i} className="hover:bg-gray-700/30">
                            <td className="px-3 py-1.5 text-gray-300 truncate max-w-[140px]">{p.page.replace(/^https?:\/\/[^/]+/, '') || '/'}</td>
                            <td className="px-3 py-1.5 text-right text-gray-300">{p.clicks}</td>
                            <td className="px-3 py-1.5 text-right text-gray-300">{p.impressions}</td>
                            <td className="px-3 py-1.5 text-right text-gray-300">{p.ctr}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="px-3 py-4 text-xs text-gray-500 text-center">No data</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-px bg-gray-700">
          <div className="bg-gray-800">
            <div className="px-3 py-2 border-b border-gray-700 text-xs text-gray-400 font-medium uppercase tracking-widest">Content</div>
            <div className="divide-y divide-gray-700/50">
              <Btn onClick={() => navigate('/admin/articles/create')} color="blue">+ New Article</Btn>
              <Btn onClick={() => navigate('/admin/articles')}>All Articles</Btn>
              <Btn onClick={() => navigate('/admin/submissions')} color="purple">Submissions {stats.submissions > 0 && `(${stats.submissions})`}</Btn>
            </div>
          </div>
          <div className="bg-gray-800">
            <div className="px-3 py-2 border-b border-gray-700 text-xs text-gray-400 font-medium uppercase tracking-widest">Config</div>
            <div className="divide-y divide-gray-700/50">
              <Btn onClick={() => navigate('/admin/settings')}>Ad Settings</Btn>
              <Btn onClick={() => navigate('/admin/indexer')} color="blue">Indexer Agent</Btn>
              <Btn onClick={() => navigate('/admin/spotify')} color="green">Spotify Manager</Btn>
              <Btn onClick={() => navigate('/admin/amazon-products')} color="orange">Amazon Products</Btn>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="border border-red-900 bg-gray-800">
          <div className="px-3 py-2 border-b border-red-900 text-xs text-red-500 font-medium uppercase tracking-widest">Danger Zone</div>
          <div className="px-4 py-3 flex items-center justify-between">
            <p className="text-xs text-gray-500">Permanently delete your admin account. Cannot be undone.</p>
            <button onClick={() => setShowDeleteModal(true)} className="px-3 py-1.5 bg-red-700 hover:bg-red-600 text-sm text-white transition-colors ml-4 flex-shrink-0">
              Delete Account
            </button>
          </div>
        </div>

      </main>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-800 border border-gray-700 p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-white mb-2">Delete Account?</h3>
            <p className="text-sm text-gray-400 mb-4">This will permanently delete your account and allow new admin registration. Cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={() => setShowDeleteModal(false)} disabled={deleteLoading} className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-sm transition-colors disabled:opacity-50">
                Cancel
              </button>
              <button onClick={handleDeleteAccount} disabled={deleteLoading} className="flex-1 py-2 bg-red-700 hover:bg-red-600 text-sm transition-colors disabled:opacity-50">
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
