import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

const SubmissionsList = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await fetch(`${API_URL}/api/submissions`);

        if (!response.ok) {
          throw new Error('Failed to fetch submissions');
        }

        const data = await response.json();
        setSubmissions(data.submissions);
      } catch (err) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  const formatPrice = (cents) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSubmissionTypeLabel = (type) => {
    return type === 'featured' ? '🏆 Featured Article' : '📰 Regular Article';
  };

  const getSubmissionTypeColor = (type) => {
    return type === 'featured' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500' : 'bg-blue-500/20 text-blue-400 border-blue-500';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'approved':
        return 'bg-green-500/20 text-green-400';
      case 'rejected':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading submissions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Music Submissions</h1>
              <p className="text-gray-400 text-sm mt-1">
                {submissions.length} total submission{submissions.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex gap-3">
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

        {submissions.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-12 text-center border border-gray-700">
            <svg className="mx-auto h-12 w-12 text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            <h3 className="text-lg font-medium text-white mb-2">No submissions yet</h3>
            <p className="text-gray-400">Submissions will appear here once artists submit their music.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {submissions.map((submission) => (
              <div
                key={submission.id}
                className="bg-gray-800 rounded-lg border border-gray-700 hover:border-purple-500 transition-colors overflow-hidden"
              >
                <div className="p-6">
                  {/* Header Row */}
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        {submission.artist_name}
                      </h3>
                      {submission.title && (
                        <p className="text-purple-400 font-semibold mb-2">
                          "{submission.title}"
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSubmissionTypeColor(submission.submission_type)}`}>
                          {getSubmissionTypeLabel(submission.submission_type)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(submission.submission_status)}`}>
                          Status: {submission.submission_status.charAt(0).toUpperCase() + submission.submission_status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-400 mb-1">
                        {formatPrice(submission.payment_amount)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatDate(submission.created_at)}
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="mb-4 p-4 bg-black/30 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-300">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <a href={`mailto:${submission.email}`} className="hover:text-purple-400 transition-colors">
                        {submission.email}
                      </a>
                    </div>
                  </div>

                  {/* Image */}
                  {submission.image_url && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-white mb-2">Cover Image</h4>
                      <div className="relative rounded-lg overflow-hidden border border-gray-700">
                        <img
                          src={submission.image_url}
                          alt={`${submission.artist_name} cover`}
                          className="w-full h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(submission.image_url, '_blank')}
                        />
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  {submission.content && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-white mb-2">Submission Content</h4>
                      <div className="p-4 bg-black/30 rounded-lg">
                        <p className="text-gray-300 whitespace-pre-wrap">{submission.content}</p>
                      </div>
                    </div>
                  )}

                  {/* Document */}
                  {submission.document_url && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-white mb-2">Submitted Document</h4>
                      <a
                        href={submission.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600 text-blue-400 rounded-lg transition-colors"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div className="flex-1">
                          <div className="font-semibold">Download Document</div>
                          <div className="text-sm text-blue-300">Click to download submitted content file</div>
                        </div>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </a>
                    </div>
                  )}

                  {/* Links */}
                  {(submission.youtube_url || submission.spotify_url) && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-white mb-2">Links</h4>
                      <div className="flex flex-wrap gap-3">
                        {submission.youtube_url && (
                          <a
                            href={submission.youtube_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                            </svg>
                            YouTube
                          </a>
                        )}
                        {submission.spotify_url && (
                          <a
                            href={submission.spotify_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                            </svg>
                            Spotify
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Payment Info */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-white mb-2">Payment Details</h4>
                    <div className="p-4 bg-black/30 rounded-lg space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Payment ID:</span>
                        <span className="text-gray-300 font-mono">{submission.payment_id}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Payment Status:</span>
                        <span className="text-green-400 font-semibold">{submission.payment_status}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedSubmission(submission)}
                      className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      View Full Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4 overflow-y-auto py-8">
          <div className="bg-gray-800 rounded-lg max-w-4xl w-full border border-gray-700 my-8">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-700 flex items-center justify-between sticky top-0 bg-gray-800 z-10">
              <h2 className="text-2xl font-bold text-white">
                Submission Details - {selectedSubmission.artist_name}
              </h2>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Type and Status */}
              <div className="flex flex-wrap gap-3">
                <span className={`px-4 py-2 rounded-lg text-sm font-semibold border ${getSubmissionTypeColor(selectedSubmission.submission_type)}`}>
                  {getSubmissionTypeLabel(selectedSubmission.submission_type)}
                </span>
                <span className={`px-4 py-2 rounded-lg text-sm font-semibold ${getStatusColor(selectedSubmission.submission_status)}`}>
                  Status: {selectedSubmission.submission_status.charAt(0).toUpperCase() + selectedSubmission.submission_status.slice(1)}
                </span>
                <span className="px-4 py-2 rounded-lg text-sm font-semibold bg-green-500/20 text-green-400">
                  {formatPrice(selectedSubmission.payment_amount)} Paid
                </span>
              </div>

              {/* Contact */}
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Contact Information</h3>
                <div className="p-4 bg-black/30 rounded-lg">
                  <p className="text-gray-300 mb-2">
                    <span className="text-gray-400">Artist:</span> <strong>{selectedSubmission.artist_name}</strong>
                  </p>
                  <p className="text-gray-300">
                    <span className="text-gray-400">Email:</span>{' '}
                    <a href={`mailto:${selectedSubmission.email}`} className="text-purple-400 hover:underline">
                      {selectedSubmission.email}
                    </a>
                  </p>
                </div>
              </div>

              {/* Title */}
              {selectedSubmission.title && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Article Title</h3>
                  <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                    <p className="text-purple-300 text-xl font-bold">
                      {selectedSubmission.title}
                    </p>
                  </div>
                </div>
              )}

              {/* Image */}
              {selectedSubmission.image_url && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Cover Image</h3>
                  <div className="rounded-lg overflow-hidden border border-gray-700">
                    <img
                      src={selectedSubmission.image_url}
                      alt={`${selectedSubmission.artist_name} cover`}
                      className="w-full object-contain max-h-96"
                    />
                  </div>
                  <a
                    href={selectedSubmission.image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-purple-400 hover:underline text-sm"
                  >
                    View full size →
                  </a>
                </div>
              )}

              {/* Content */}
              {selectedSubmission.content && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Submission Content</h3>
                  <div className="p-4 bg-black/30 rounded-lg">
                    <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {selectedSubmission.content}
                    </p>
                  </div>
                </div>
              )}

              {/* Document */}
              {selectedSubmission.document_url && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Submitted Document</h3>
                  <a
                    href={selectedSubmission.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600 text-blue-400 rounded-lg transition-colors"
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div className="flex-1">
                      <div className="font-semibold text-lg">Download Document</div>
                      <div className="text-sm text-blue-300">Artist uploaded a document file with their content</div>
                    </div>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </a>
                </div>
              )}

              {/* Links */}
              {(selectedSubmission.youtube_url || selectedSubmission.spotify_url) && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Music Links</h3>
                  <div className="space-y-2">
                    {selectedSubmission.youtube_url && (
                      <a
                        href={selectedSubmission.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-red-600/20 hover:bg-red-600/30 border border-red-600 text-red-400 rounded-lg transition-colors"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                        <div className="flex-1">
                          <div className="font-semibold">YouTube</div>
                          <div className="text-sm text-red-300 truncate">{selectedSubmission.youtube_url}</div>
                        </div>
                      </a>
                    )}
                    {selectedSubmission.spotify_url && (
                      <a
                        href={selectedSubmission.spotify_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-green-600/20 hover:bg-green-600/30 border border-green-600 text-green-400 rounded-lg transition-colors"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                        </svg>
                        <div className="flex-1">
                          <div className="font-semibold">Spotify</div>
                          <div className="text-sm text-green-300 truncate">{selectedSubmission.spotify_url}</div>
                        </div>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Payment Info */}
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Payment Information</h3>
                <div className="p-4 bg-black/30 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Amount:</span>
                    <span className="text-green-400 font-bold">{formatPrice(selectedSubmission.payment_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Payment ID:</span>
                    <span className="text-gray-300 font-mono text-sm">{selectedSubmission.payment_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Payment Status:</span>
                    <span className="text-green-400 font-semibold">{selectedSubmission.payment_status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Submitted:</span>
                    <span className="text-gray-300">{formatDate(selectedSubmission.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-700 flex gap-3 sticky bottom-0 bg-gray-800">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionsList;
