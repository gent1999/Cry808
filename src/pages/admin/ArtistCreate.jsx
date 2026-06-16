import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../../assets/cry808_logo.png';

const API_URL = import.meta.env.VITE_API_URL;

const SideIcon = ({ path }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);

function SidePanel() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const active = (to) => pathname === to || (to !== '/admin/dashboard' && pathname.startsWith(to));

  const groups = [
    ['Content', [
      ['New Article',  'M12 5v14M5 12h14',      '/admin/articles/create'],
      ['All Articles', 'M5 6h14M5 12h14M5 18h9', '/admin/articles'],
      ['Artists',      'M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm-7 9a7 7 0 0 1 14 0', '/admin/artists'],
      ['Submissions',  'M4 13h4l2 3h4l2-3h4M5 5h14l1 8v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5l1-8Z', '/admin/submissions'],
    ]],
    ['Intelligence', [
      ['Cortex', 'M12 2a5 5 0 0 1 5 5c0 2.4-1.7 4.4-4 4.9V21h-2v-9.1C8.7 11.4 7 9.4 7 7a5 5 0 0 1 5-5Z', '/admin/cortex'],
    ]],
    ['Business & Config', [
      ['Finance Hub', 'M12 3v18M8 7h6a3 3 0 0 1 0 6h-4a3 3 0 0 0 0 6h6', '/admin/finance'],
      ['Ad Settings',  'M12 4v16M4 12h16M7 7l10 10M17 7 7 17', '/admin/settings'],
      ['Newsletter',   'M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z', '/admin/newsletter'],
      ['Spotify',      'M9 18V5l12-2v13M9 9l12-2', '/admin/spotify'],
    ]],
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-[264px] flex-col border-r border-white/[0.07] bg-[#0b1019]/95 px-4 py-5 shadow-[20px_0_80px_rgba(0,0,0,.34)] backdrop-blur-xl">
      <button onClick={() => navigate('/admin/dashboard')} className="mb-7 flex items-center gap-3 text-left">
        <span className="grid h-11 w-11 place-items-center overflow-hidden bg-transparent">
          <img src={logo} alt="Cry808" className="h-full w-full object-contain" />
        </span>
        <span>
          <span className="block text-[15px] font-semibold tracking-[.16em] text-white">CRY808</span>
          <span className="block text-[11px] font-medium text-slate-500">Content System</span>
        </span>
      </button>
      <nav className="flex-1 space-y-7 overflow-y-auto pr-1">
        {groups.map(([label, items]) => (
          <div key={label}>
            <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[.16em] text-slate-500/90">{label}</div>
            <div className="space-y-1.5">
              {items.map(([labelText, icon, to]) => {
                const isActive = active(to);
                return (
                  <button key={labelText} onClick={() => navigate(to)}
                    className={`group flex w-full items-center gap-3 border px-3 py-2.5 text-left text-sm transition duration-200 ${
                      isActive
                        ? 'border-sky-300/25 bg-sky-300/10 text-white'
                        : 'border-transparent text-slate-400 hover:border-white/[0.07] hover:bg-white/[0.04] hover:text-slate-100'
                    }`}
                  >
                    <span className={`grid h-8 w-8 place-items-center ${isActive ? 'bg-sky-500/20 text-sky-200' : 'bg-white/[0.04] text-slate-500 group-hover:text-slate-200'}`}>
                      <SideIcon path={icon} />
                    </span>
                    <span className="min-w-0 flex-1 font-medium">{labelText}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}

const inputCls = 'w-full bg-black/50 border border-gray-700/60 text-sm text-gray-200 px-3 py-2.5 focus:outline-none focus:border-sky-700/60 placeholder-gray-700 transition-colors';

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-[11px] font-mono font-semibold uppercase tracking-widest text-gray-400 mb-2">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-[10px] font-mono text-gray-600">{hint}</p>}
    </div>
  );
}

export default function ArtistCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [bio2, setBio2] = useState('');
  const [links, setLinks] = useState({ spotify_url: '', soundcloud_url: '', youtube_url: '', genius_url: '', apple_music_url: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState({ 1: null, 2: null, 3: null });
  const [galleryPreviews, setGalleryPreviews] = useState({ 1: null, 2: null, 3: null });

  function handleImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  }

  function handleGalleryImage(n, e) {
    const file = e.target.files[0];
    if (!file) return;
    setGalleryFiles(prev => ({ ...prev, [n]: file }));
    const reader = new FileReader();
    reader.onloadend = () => setGalleryPreviews(prev => ({ ...prev, [n]: reader.result }));
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) { setError('Name is required'); return; }
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) { navigate('/admin/login'); return; }

      const fd = new FormData();
      fd.append('name', name.trim());
      fd.append('bio', bio.trim());
      fd.append('bio2', bio2.trim());
      if (imageFile) fd.append('profile_image', imageFile);
      if (galleryFiles[1]) fd.append('gallery_image_1', galleryFiles[1]);
      if (galleryFiles[2]) fd.append('gallery_image_2', galleryFiles[2]);
      if (galleryFiles[3]) fd.append('gallery_image_3', galleryFiles[3]);
      Object.entries(links).forEach(([k, v]) => fd.append(k, v.trim()));

      const res = await fetch(`${API_URL}/api/artists`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create artist');
      navigate('/admin/artists');
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#070b12] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(59,130,246,.16),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(139,92,246,.14),transparent_30%)]" />
      <SidePanel />

      <div className="relative ml-[264px] min-h-screen">
        <header className="sticky top-0 z-20 border-b border-white/[0.07] bg-[#070b12]/82 px-8 py-3 backdrop-blur-xl">
          <div className="flex h-8 items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <button onClick={() => navigate('/admin/dashboard')} className="hover:text-white transition">Dashboard</button>
              <span className="text-slate-600">/</span>
              <button onClick={() => navigate('/admin/artists')} className="hover:text-white transition">Artists</button>
              <span className="text-slate-600">/</span>
              <span className="text-white font-medium">New Profile</span>
            </div>
          </div>
        </header>

        <main className="px-8 py-8 max-w-2xl">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-white">New Artist Profile</h1>
            <p className="mt-1 text-sm text-slate-500">Add a bio and photo for an artist featured on Cry808.</p>
          </div>

          {error && (
            <div className="mb-6 border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Field label="Artist Name *" hint="Must match the 'Author' field used on their articles exactly.">
              <input
                className={inputCls}
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Drake"
                required
              />
            </Field>

            <Field label="Bio" hint="Short paragraph shown in the artist hero header.">
              <textarea
                className={`${inputCls} resize-none`}
                rows={4}
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Write a short bio for this artist…"
              />
            </Field>

            <Field label="Bio 2" hint="Extended text shown below the articles section on the public page.">
              <textarea
                className={`${inputCls} resize-none`}
                rows={6}
                value={bio2}
                onChange={e => setBio2(e.target.value)}
                placeholder="More detail, background info, career highlights…"
              />
            </Field>

            <Field label="Platform Links" hint="Paste full URLs. Leave blank to hide. Appear as icons on the artist page.">
              <div className="space-y-2">
                {[
                  { key: 'spotify_url',     label: 'Spotify',      placeholder: 'https://open.spotify.com/artist/…' },
                  { key: 'soundcloud_url',  label: 'SoundCloud',   placeholder: 'https://soundcloud.com/…' },
                  { key: 'youtube_url',     label: 'YouTube',      placeholder: 'https://youtube.com/@…' },
                  { key: 'genius_url',      label: 'Genius',       placeholder: 'https://genius.com/artists/…' },
                  { key: 'apple_music_url', label: 'Apple Music',  placeholder: 'https://music.apple.com/…' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="w-24 flex-shrink-0 text-[11px] font-mono text-gray-500">{label}</span>
                    <input
                      className={inputCls}
                      value={links[key]}
                      onChange={e => setLinks(prev => ({ ...prev, [key]: e.target.value }))}
                      placeholder={placeholder}
                      type="url"
                    />
                  </div>
                ))}
              </div>
            </Field>

            <Field label="Profile Photo" hint="Main photo shown in the hero. Square recommended. Max 5MB.">
              <div className="flex items-start gap-4">
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden border border-white/[0.08] bg-white/[0.04]">
                  {imagePreview
                    ? <img src={imagePreview} alt="preview" className="h-full w-full object-cover" />
                    : <div className="flex h-full w-full items-center justify-center text-slate-600 text-3xl">🎤</div>
                  }
                </div>
                <div className="flex-1">
                  <label className="cursor-pointer inline-block border border-white/[0.12] bg-white/[0.04] px-4 py-2 text-sm text-slate-300 hover:bg-white/[0.08] transition">
                    {imageFile ? imageFile.name : 'Choose photo…'}
                    <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
                  </label>
                </div>
              </div>
            </Field>

            <Field label="Gallery Photos" hint="3 photos shown in a row below the hero. Square recommended.">
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map(n => (
                  <div key={n}>
                    <div className="aspect-square overflow-hidden border border-white/[0.08] bg-white/[0.04] mb-2">
                      {galleryPreviews[n]
                        ? <img src={galleryPreviews[n]} alt={`gallery ${n}`} className="h-full w-full object-cover" />
                        : <div className="flex h-full w-full items-center justify-center text-slate-600 text-2xl">+</div>
                      }
                    </div>
                    <label className="cursor-pointer block w-full text-center border border-white/[0.10] bg-white/[0.03] py-1.5 text-xs text-slate-500 hover:bg-white/[0.07] transition">
                      {galleryFiles[n] ? '✓ Chosen' : `Photo ${n}`}
                      <input type="file" accept="image/*" onChange={e => handleGalleryImage(n, e)} className="hidden" />
                    </label>
                  </div>
                ))}
              </div>
            </Field>

            <div className="flex items-center gap-4 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-sm font-medium px-6 py-2.5 transition"
              >
                {loading ? 'Saving…' : 'Create Profile'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/artists')}
                className="text-sm text-slate-500 hover:text-slate-300 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
