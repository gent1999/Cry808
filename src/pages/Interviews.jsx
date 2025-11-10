import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import AdSidebar from "../components/AdSidebar";
import AdsterraNative from "../components/AdsterraNative";
import AdsterraMobileBanner from "../components/AdsterraMobileBanner";
import AdsterraSmartlink from "../components/AdsterraSmartlink";
import { ADS_ENABLED } from "../config/ads";
import { stripMarkdown } from "../utils/markdownUtils";
import { generateArticleUrl } from "../utils/slugify";

const API_URL = import.meta.env.VITE_API_URL;

export default function Interviews() {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const response = await fetch(`${API_URL}/api/articles`);

        if (!response.ok) {
          throw new Error('Failed to fetch interviews');
        }

        const data = await response.json();
        // Filter only interviews and sort by date
        const interviewsOnly = data.articles
          .filter(article => article.category === 'interview')
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setInterviews(interviewsOnly);
      } catch (err) {
        setError(err.message || 'Failed to load interviews');
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex-1">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Interviews
            </h1>
            <div className="h-1 w-32 bg-gradient-to-r from-purple-500 to-pink-500"></div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8 justify-center">
          <div className="flex-1">
          {/* Mobile Banner Ad - Top of Interviews Page */}
          {ADS_ENABLED && <AdsterraMobileBanner className="mb-8" />}

          {loading ? (
            <div className="text-center py-12">
              <div className="text-white/70 text-lg">Loading interviews...</div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-400 text-lg">{error}</div>
            </div>
          ) : interviews.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-white/70 text-lg">No interviews available yet.</div>
            </div>
          ) : (
            <>
              {/* Render interviews in chunks of 6, with full-width native banner between chunks */}
              {Array.from({ length: Math.ceil(interviews.length / 6) }).map((_, chunkIndex) => {
                const startIdx = chunkIndex * 6;
                const endIdx = Math.min(startIdx + 6, interviews.length);
                const chunk = interviews.slice(startIdx, endIdx);

                return (
                  <React.Fragment key={`chunk-${chunkIndex}`}>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                      {chunk.map((interview, indexInChunk) => {
                        const globalIndex = startIdx + indexInChunk;
                        return (
                          <React.Fragment key={interview.id}>
                            <div
                              onClick={() => navigate(generateArticleUrl(interview.id, interview.title))}
                              className="bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:bg-white/10 transition cursor-pointer"
                            >
                              {/* Interview Image */}
                              {interview.image_url && (
                                <div className="h-48 overflow-hidden">
                                  <img
                                    src={interview.image_url}
                                    alt={interview.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}

                              {/* Interview Content */}
                              <div className="p-6">
                                <h2 className="text-xl font-semibold mb-2 line-clamp-2">
                                  {interview.title}
                                </h2>

                                <p className="text-white/50 text-xs mb-3">
                                  By {interview.author} • {new Date(interview.created_at).toLocaleDateString()}
                                </p>

                                <p className="text-white/70 text-sm line-clamp-3 mb-4">
                                  {stripMarkdown(interview.content)}
                                </p>

                                {/* Tags */}
                                {interview.tags && interview.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {interview.tags.slice(0, 3).map((tag, index) => (
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

                            {/* Insert smartlink card every 9 interviews */}
                            {ADS_ENABLED && (globalIndex + 1) % 9 === 0 && globalIndex !== interviews.length - 1 && (
                              <div className="col-span-1">
                                <AdsterraSmartlink
                                  type="card"
                                  text="Exclusive Artist Interviews"
                                />
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>

                    {/* Native Banner - Full Width after every 6 interviews */}
                    {ADS_ENABLED && endIdx < interviews.length && (
                      <div className="mb-8">
                        <AdsterraNative showLabel={true} />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </>
          )}
          </div>

          {/* Ad Sidebar */}
          {ADS_ENABLED && <AdSidebar />}
        </div>
      </div>
      <Footer />
    </div>
  );
}
