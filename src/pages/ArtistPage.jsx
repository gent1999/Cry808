import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const API_URL = import.meta.env.VITE_API_URL;

function toSlug(name = '') {
  return name.toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-{2,}/g, '-');
}

function generateArticleUrl(id, title = '') {
  const slug = title.toLowerCase().trim()
    .replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/-{2,}/g, '-');
  return `/article/${id}-${slug}`;
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function ArtistPage() {
  const { slug } = useParams();
  const [artist, setArtist] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    fetch(`${API_URL}/api/artists/${slug}`)
      .then(r => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then(data => {
        if (!data) return;
        setArtist(data.artist);
        setArticles(data.articles || []);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-slate-600 text-sm">Loading…</div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <div className="text-slate-500 text-lg">Artist profile not found.</div>
        <Link to="/" className="text-sm text-purple-400 hover:text-purple-300 transition">← Back to home</Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{artist.name} — Cry808</title>
        <meta name="description" content={artist.bio ? artist.bio.slice(0, 160) : `Read all ${artist.name} articles on Cry808.`} />
      </Helmet>

      <div className="min-h-screen bg-black text-white">
        {/* Hero / profile header */}
        <div className="relative border-b border-white/[0.06] bg-[#08080f]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_0%,rgba(139,92,246,.12),transparent_50%)] pointer-events-none" />
          <div className="relative mx-auto max-w-4xl px-6 py-16 flex flex-col sm:flex-row items-center sm:items-end gap-8">
            {/* Avatar */}
            <div className="h-32 w-32 flex-shrink-0 overflow-hidden border border-white/[0.08] bg-white/[0.04] shadow-[0_20px_60px_rgba(0,0,0,.6)]">
              {artist.profile_image_url
                ? <img src={artist.profile_image_url} alt={artist.name} className="h-full w-full object-cover" />
                : <div className="flex h-full w-full items-center justify-center text-5xl">🎤</div>
              }
            </div>

            {/* Name + bio */}
            <div className="text-center sm:text-left">
              <div className="text-[11px] font-mono uppercase tracking-[.2em] text-purple-400 mb-2">Artist</div>
              <h1 className="text-4xl font-bold tracking-tight text-white">{artist.name}</h1>
              {artist.bio && (
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-400">{artist.bio}</p>
              )}
              <div className="mt-4 text-xs text-slate-600">
                {articles.length} {articles.length === 1 ? 'article' : 'articles'} on Cry808
              </div>
            </div>
          </div>
        </div>

        {/* Articles grid */}
        <div className="mx-auto max-w-4xl px-6 py-12">
          <h2 className="text-[11px] font-mono uppercase tracking-[.2em] text-slate-500 mb-6">
            Articles by {artist.name}
          </h2>

          {articles.length === 0 ? (
            <p className="text-slate-600 text-sm">No articles found yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {articles.map(article => (
                <Link
                  key={article.id}
                  to={generateArticleUrl(article.id, article.title)}
                  className="group flex gap-4 border border-white/[0.06] bg-white/[0.02] p-4 hover:bg-white/[0.04] hover:border-purple-500/20 transition"
                >
                  {/* Thumbnail */}
                  <div className="h-16 w-20 flex-shrink-0 overflow-hidden bg-white/[0.04]">
                    {article.image_url
                      ? <img src={article.image_url} alt={article.title} className="h-full w-full object-cover" />
                      : <div className="flex h-full w-full items-center justify-center text-2xl">🎵</div>
                    }
                  </div>

                  {/* Text */}
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-white leading-snug group-hover:text-purple-200 transition line-clamp-2">
                      {article.title}
                    </div>
                    <div className="mt-1 text-[11px] text-slate-600">{formatDate(article.created_at)}</div>
                    {article.categories?.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {article.categories.slice(0, 2).map(c => (
                          <span key={c} className="text-[10px] font-mono uppercase tracking-widest text-purple-400/60 border border-purple-500/20 px-1.5 py-0.5">
                            {c}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
