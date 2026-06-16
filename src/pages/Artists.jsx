import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Footer from '../components/Footer';

const API_URL = import.meta.env.VITE_API_URL;

export default function Artists() {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/artists`)
      .then(r => r.json())
      .then(d => setArtists(d.artists || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Helmet>
        <title>Artists — Cry808</title>
        <meta name="description" content="Browse artist profiles on Cry808 — interviews, reviews, and features." />
      </Helmet>

      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <div className="relative border-b border-white/[0.06] bg-[#08080f]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,.1),transparent_50%)] pointer-events-none" />
          <div className="relative mx-auto max-w-6xl px-6 py-14">
            <div className="text-[11px] font-mono uppercase tracking-[.2em] text-purple-400 mb-3">Cry808</div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
              Artists
            </h1>
            <p className="mt-3 text-slate-500 text-sm max-w-md">
              Artists featured across interviews, reviews, and articles on Cry808.
            </p>
          </div>
        </div>

        {/* Grid */}
        <div className="mx-auto max-w-6xl px-6 py-12">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="mx-auto mb-3 h-28 w-28 bg-white/[0.05]" />
                  <div className="h-3 bg-white/[0.05] rounded mx-auto w-20" />
                </div>
              ))}
            </div>
          ) : artists.length === 0 ? (
            <div className="text-center py-24 text-slate-600">No artist profiles yet.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {artists.map(artist => (
                <Link
                  key={artist.id}
                  to={`/artist/${artist.slug}`}
                  className="group text-center"
                >
                  <div className="mx-auto mb-3 h-28 w-28 overflow-hidden border-2 border-purple-500/20 group-hover:border-purple-500/60 transition-all duration-300 bg-white/[0.04]">
                    {artist.profile_image_url
                      ? <img src={artist.profile_image_url} alt={artist.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      : <div className="flex h-full w-full items-center justify-center text-4xl">🎤</div>
                    }
                  </div>
                  <div className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">
                    {artist.name}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
}
