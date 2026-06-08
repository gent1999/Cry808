import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import SimpleMDE from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';
import logo from '../../assets/cry808_logo.png';

const API_URL = import.meta.env.VITE_API_URL;

// ── Side Panel ────────────────────────────────────────────────────────────────
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
      ['New Article',  'M12 5v14M5 12h14',       '/admin/articles/create'],
      ['All Articles', 'M5 6h14M5 12h14M5 18h9',  '/admin/articles'],
      ['Submissions',  'M4 13h4l2 3h4l2-3h4M5 5h14l1 8v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5l1-8Z', '/admin/submissions'],
    ]],
    ['Intelligence', [
      ['Cortex', 'M12 2a5 5 0 0 1 5 5c0 2.4-1.7 4.4-4 4.9V21h-2v-9.1C8.7 11.4 7 9.4 7 7a5 5 0 0 1 5-5Z', '/admin/cortex'],
    ]],
    ['Business & Config', [
      ['Finance Hub', 'M12 3v18M8 7h6a3 3 0 0 1 0 6h-4a3 3 0 0 0 0 6h6', '/admin/finance'],
      ['Ad Settings',  'M12 4v16M4 12h16M7 7l10 10M17 7 7 17',            '/admin/settings'],
      ['Newsletter',   'M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z', '/admin/newsletter'],
      ['Spotify',      'M9 18V5l12-2v13M9 9l12-2',                                                                                             '/admin/spotify'],
    ]],
  ];

  return (
    <aside className="content-side-panel fixed inset-y-0 left-0 z-30 flex w-[264px] flex-col border-r border-white/[0.07] bg-[#0b1019]/95 px-4 py-5 shadow-[20px_0_80px_rgba(0,0,0,.34)] backdrop-blur-xl">
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

// ── Field wrapper ─────────────────────────────────────────────────────────────
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

const inputCls = 'w-full bg-black/50 border border-gray-700/60 text-sm text-gray-200 px-3 py-2.5 focus:outline-none focus:border-sky-700/60 placeholder-gray-700 transition-colors';

// ── Main component ────────────────────────────────────────────────────────────
const ArticleEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');

  const [formData, setFormData] = useState({
    title: '', author: '', content: '', tags: '',
    spotify_url: '', youtube_url: '', soundcloud_url: '', genius_url: '', lyrics: '',
    categories: ['article'],
    is_original: false,
    is_evergreen: false,
  });

  const [imageFile,     setImageFile]     = useState(null);
  const [imagePreview,  setImagePreview]  = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);

  const [additionalImage1,   setAdditionalImage1]   = useState(null);
  const [additionalImage2,   setAdditionalImage2]   = useState(null);
  const [additionalImage3,   setAdditionalImage3]   = useState(null);
  const [additionalPreview1, setAdditionalPreview1] = useState(null);
  const [additionalPreview2, setAdditionalPreview2] = useState(null);
  const [additionalPreview3, setAdditionalPreview3] = useState(null);
  const [existingAdditionalImage1, setExistingAdditionalImage1] = useState(null);
  const [existingAdditionalImage2, setExistingAdditionalImage2] = useState(null);
  const [existingAdditionalImage3, setExistingAdditionalImage3] = useState(null);
  const [removeAdditionalImage1, setRemoveAdditionalImage1] = useState(false);
  const [removeAdditionalImage2, setRemoveAdditionalImage2] = useState(false);
  const [removeAdditionalImage3, setRemoveAdditionalImage3] = useState(false);
  const [additionalInputKey1, setAdditionalInputKey1] = useState(0);
  const [additionalInputKey2, setAdditionalInputKey2] = useState(0);
  const [additionalInputKey3, setAdditionalInputKey3] = useState(0);

  const editorOptions = useMemo(() => ({
    spellChecker: false,
    placeholder: 'Write your article content here… (Markdown supported)',
    status: ['lines', 'words', 'cursor'],
    toolbar: [
      'bold', 'italic', 'heading', '|',
      'quote', 'unordered-list', 'ordered-list', '|',
      'link', 'image', '|',
      'preview', 'side-by-side', 'fullscreen', '|',
      'guide',
    ],
    autofocus: false,
    autosave: { enabled: true, uniqueId: `article-edit-${id}`, delay: 1000 },
  }), [id]);

  // ── Load article ────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(`${API_URL}/api/articles/${id}`);
        if (!response.ok) throw new Error('Article not found');
        const data = await response.json();
        const article = data.article;

        const loadedCategories =
          Array.isArray(article.categories) && article.categories.length > 0
            ? article.categories
            : article.category ? [article.category] : ['article'];

        setFormData({
          title:         article.title         || '',
          author:        article.author        || '',
          content:       article.content       || '',
          tags:          article.tags ? article.tags.join(', ') : '',
          spotify_url:   article.spotify_url   || '',
          youtube_url:   article.youtube_url   || '',
          soundcloud_url:article.soundcloud_url|| '',
          genius_url:    article.genius_url    || '',
          lyrics:        article.lyrics        || '',
          categories:    loadedCategories,
          is_original:   article.is_original   || false,
          is_evergreen:  article.is_evergreen  || false,
        });

        if (article.image_url) {
          setExistingImageUrl(article.image_url);
          setImagePreview(article.image_url);
        }
        if (article.additional_image_1) { setExistingAdditionalImage1(article.additional_image_1); setAdditionalPreview1(article.additional_image_1); }
        if (article.additional_image_2) { setExistingAdditionalImage2(article.additional_image_2); setAdditionalPreview2(article.additional_image_2); }
        if (article.additional_image_3) { setExistingAdditionalImage3(article.additional_image_3); setAdditionalPreview3(article.additional_image_3); }
      } catch (err) {
        setError(err.message || 'Failed to load article');
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData(prev => ({ ...prev, [e.target.name]: value }));
    setError('');
  };

  const handleCategoryToggle = (cat) => {
    setFormData(prev => {
      const current = prev.categories || [];
      const next = current.includes(cat) ? current.filter(c => c !== cat) : [...current, cat];
      if (next.length === 0) return prev;
      return { ...prev, categories: next, is_evergreen: next.includes('guides') ? true : prev.is_evergreen };
    });
    setError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleAdditionalImageChange = (e, n) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (n === 1) { setAdditionalImage1(file); setAdditionalPreview1(reader.result); setRemoveAdditionalImage1(false); }
      if (n === 2) { setAdditionalImage2(file); setAdditionalPreview2(reader.result); setRemoveAdditionalImage2(false); }
      if (n === 3) { setAdditionalImage3(file); setAdditionalPreview3(reader.result); setRemoveAdditionalImage3(false); }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAdditionalImage = (n) => {
    if (n === 1) { setAdditionalImage1(null); setAdditionalPreview1(null); setExistingAdditionalImage1(null); setRemoveAdditionalImage1(true); setAdditionalInputKey1(k => k + 1); }
    if (n === 2) { setAdditionalImage2(null); setAdditionalPreview2(null); setExistingAdditionalImage2(null); setRemoveAdditionalImage2(true); setAdditionalInputKey2(k => k + 1); }
    if (n === 3) { setAdditionalImage3(null); setAdditionalPreview3(null); setExistingAdditionalImage3(null); setRemoveAdditionalImage3(true); setAdditionalInputKey3(k => k + 1); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) { navigate('/admin/login'); return; }

      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
      const fd = new FormData();
      fd.append('title',   formData.title);
      fd.append('author',  formData.author);
      fd.append('content', formData.content);
      fd.append('tags',    JSON.stringify(tagsArray));

      if (formData.spotify_url)    fd.append('spotify_url',    formData.spotify_url);
      if (formData.youtube_url)    fd.append('youtube_url',    formData.youtube_url);
      if (formData.soundcloud_url) fd.append('soundcloud_url', formData.soundcloud_url);
      if (formData.genius_url)     fd.append('genius_url',     formData.genius_url);

      // Auto-fetch lyrics if Genius URL set but no lyrics
      let lyricsToSave = formData.lyrics;
      if (formData.genius_url && !formData.lyrics) {
        try {
          const r = await fetch(`${API_URL}/api/genius-lyrics?url=${encodeURIComponent(formData.genius_url)}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (r.ok) {
            const d = await r.json();
            if (d.lyrics) lyricsToSave = d.lyrics;
          }
        } catch (_) {}
      }
      if (lyricsToSave) fd.append('lyrics', lyricsToSave);

      fd.append('categories',  JSON.stringify(formData.categories || ['article']));
      fd.append('category',    (formData.categories || ['article'])[0]);
      fd.append('is_original', formData.is_original);
      fd.append('is_evergreen',formData.is_evergreen);

      if (imageFile)        fd.append('image',              imageFile);
      if (additionalImage1) fd.append('additional_image_1', additionalImage1);
      if (additionalImage2) fd.append('additional_image_2', additionalImage2);
      if (additionalImage3) fd.append('additional_image_3', additionalImage3);

      if (removeAdditionalImage1) fd.append('remove_additional_image_1', 'true');
      if (removeAdditionalImage2) fd.append('remove_additional_image_2', 'true');
      if (removeAdditionalImage3) fd.append('remove_additional_image_3', 'true');

      const response = await fetch(`${API_URL}/api/articles/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update article');

      navigate('/admin/articles');
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const categoryDefs = [
    { value: 'article',   label: 'Article',   emoji: '📰' },
    { value: 'interview', label: 'Interview',  emoji: '🎤' },
    { value: 'review',    label: 'Review',     emoji: '⭐' },
    { value: 'guides',    label: 'Guide',      emoji: '🌲' },
  ];

  const mediaFields = [
    { name: 'spotify_url',    label: 'Spotify Link',       placeholder: 'https://open.spotify.com/track/…' },
    { name: 'youtube_url',    label: 'YouTube Link',       placeholder: 'https://www.youtube.com/watch?v=…' },
    { name: 'soundcloud_url', label: 'SoundCloud Link',    placeholder: 'https://soundcloud.com/…' },
    { name: 'genius_url',     label: 'Genius Lyrics Link', placeholder: 'https://genius.com/…' },
  ];

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="admin-command-center content-command-center min-h-screen bg-[#070b12] text-white flex items-center justify-center">
        <SidePanel />
        <span className="ml-[264px] text-xs font-mono text-gray-600 uppercase tracking-widest animate-pulse">Loading article…</span>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="admin-command-center content-command-center min-h-screen bg-[#070b12] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(59,130,246,.16),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(139,92,246,.14),transparent_30%)]" />
      <SidePanel />

      <div className="relative ml-[264px] min-h-screen">

        {/* ── Header ── */}
        <header className="sticky top-0 z-20 border-b border-white/[0.07] bg-[#070b12]/82 px-8 py-3 backdrop-blur-xl">
          <div className="flex h-8 items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/admin/articles')}
                className="text-xs text-slate-500 hover:text-slate-200 uppercase tracking-[.16em] font-semibold transition-colors">
                ← All Articles
              </button>
              <span className="text-gray-700">│</span>
              <span className="text-xs text-sky-300 font-bold uppercase tracking-[.18em]">Edit Article</span>
            </div>
            <div className="flex items-center gap-2">
              <a href="https://cry808.com" target="_blank" rel="noopener noreferrer"
                className="text-[10px] font-mono uppercase tracking-wider border border-gray-800 text-gray-500 hover:text-gray-300 hover:border-gray-600 px-3 py-1.5 transition-colors">
                View Site ↗
              </a>
            </div>
          </div>
        </header>

        <main className="px-8 py-7">
          <form onSubmit={handleSubmit} className="max-w-3xl space-y-5">

            {/* Error */}
            {error && (
              <div className="border border-red-800/60 bg-red-950/20 px-4 py-2.5 text-xs font-mono text-red-400 uppercase tracking-wider">
                {error}
              </div>
            )}

            {/* ── 1. Basic Info ── */}
            <section className="border border-gray-800/60 bg-[#0a0e14]">
              <div className="border-b border-gray-800/60 px-5 py-3">
                <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-sky-300">1 — Basic Info</h2>
              </div>
              <div className="p-5 space-y-4">
                <Field label="Title *">
                  <input type="text" name="title" required value={formData.title} onChange={handleChange}
                    placeholder="Enter article title" className={inputCls} />
                </Field>
                <Field label="Author *">
                  <input type="text" name="author" required value={formData.author} onChange={handleChange}
                    placeholder="Enter author name" className={inputCls} />
                </Field>
              </div>
            </section>

            {/* ── 2. Categories & Flags ── */}
            <section className="border border-gray-800/60 bg-[#0a0e14]">
              <div className="border-b border-gray-800/60 px-5 py-3">
                <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-sky-300">2 — Categories & Flags</h2>
              </div>
              <div className="p-5 space-y-5">
                <Field label="Categories *" hint="Select all that apply. Guides auto-enables Evergreen.">
                  <div className="flex flex-wrap gap-2 mt-1">
                    {categoryDefs.map(({ value, label, emoji }) => {
                      const selected = (formData.categories || []).includes(value);
                      return (
                        <button key={value} type="button" onClick={() => handleCategoryToggle(value)}
                          className={`text-[11px] font-mono px-3 py-2 border transition-colors ${
                            selected
                              ? 'border-sky-600/60 bg-sky-950/40 text-sky-300'
                              : 'border-gray-700/60 text-gray-500 hover:border-gray-600 hover:text-gray-300'
                          }`}>
                          {emoji} {label}
                        </button>
                      );
                    })}
                  </div>
                </Field>

                <div className="flex flex-col gap-3">
                  {[
                    { name: 'is_original',  label: '1of1 Original',       desc: 'Appears in "1of1 Originals" instead of "Latest Stories"' },
                    { name: 'is_evergreen', label: '🌲 Evergreen Content', desc: 'Appears in "Essential Guides", optimised for SEO' },
                  ].map(({ name, label, desc }) => (
                    <label key={name} className="flex items-start gap-3 cursor-pointer group">
                      <div className="mt-0.5 w-4 h-4 border flex-shrink-0 flex items-center justify-center transition-colors group-hover:border-sky-700"
                        style={{ background: formData[name] ? 'rgb(3 105 161 / 0.3)' : 'transparent', borderColor: formData[name] ? 'rgb(14 165 233 / 0.6)' : 'rgb(75 85 99 / 0.6)' }}>
                        {formData[name] && (
                          <svg className="w-2.5 h-2.5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <input type="checkbox" name={name} checked={formData[name]} onChange={handleChange} className="sr-only" />
                      <div>
                        <span className="text-[11px] font-mono font-semibold text-gray-300">{label}</span>
                        <span className="block text-[10px] font-mono text-gray-600 mt-0.5">{desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </section>

            {/* ── 3. Cover Image ── */}
            <section className="border border-gray-800/60 bg-[#0a0e14]">
              <div className="border-b border-gray-800/60 px-5 py-3">
                <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-sky-300">3 — Cover Image</h2>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <label className="flex items-center gap-3 cursor-pointer w-fit">
                    <span className="text-[11px] font-mono px-3 py-2 border border-gray-700/60 text-gray-400 hover:border-sky-700/60 hover:text-sky-300 transition-colors">
                      {imageFile ? '✓ ' + imageFile.name : existingImageUrl ? 'Replace cover image' : 'Choose cover image'}
                    </span>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="sr-only" />
                  </label>
                  {existingImageUrl && !imageFile && (
                    <span className="text-[10px] font-mono text-gray-600">Leave blank to keep current</span>
                  )}
                </div>
                {imagePreview && (
                  <div>
                    <p className="text-[10px] font-mono text-gray-600 mb-2 uppercase tracking-widest">
                      {imageFile ? 'New cover preview' : 'Current cover'}
                    </p>
                    <img src={imagePreview} alt="Cover preview" className="max-h-52 border border-gray-700/60 object-cover" />
                  </div>
                )}

                {/* Additional images */}
                <div className="pt-3 border-t border-gray-800/40 space-y-4">
                  <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">Additional Images (up to 3)</p>
                  {[
                    [additionalImage1, additionalPreview1, existingAdditionalImage1, additionalInputKey1, 1],
                    [additionalImage2, additionalPreview2, existingAdditionalImage2, additionalInputKey2, 2],
                    [additionalImage3, additionalPreview3, existingAdditionalImage3, additionalInputKey3, 3],
                  ].map(([file, preview, existing, inputKey, n]) => (
                    <div key={n} className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <label className="cursor-pointer">
                          <span className="text-[10px] font-mono px-3 py-1.5 border border-gray-800 text-gray-600 hover:border-gray-700 hover:text-gray-400 transition-colors block">
                            {file ? '✓ ' + file.name : existing ? `Replace image ${n}` : `+ Image ${n}`}
                          </span>
                          <input key={inputKey} type="file" accept="image/*" onChange={e => handleAdditionalImageChange(e, n)} className="sr-only" />
                        </label>
                        {existing && !file && (
                          <span className="text-[10px] font-mono text-gray-600">keep or remove</span>
                        )}
                      </div>
                      {preview && (
                        <div className="flex items-start gap-3">
                          <img src={preview} alt={`Additional ${n}`} className="max-h-32 border border-gray-800/60 object-cover" />
                          <button type="button" onClick={() => handleRemoveAdditionalImage(n)}
                            className="text-[10px] font-mono px-2.5 py-1.5 border border-red-900/60 text-red-500 hover:bg-red-950/20 uppercase tracking-wide transition-colors">
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── 4. Tags ── */}
            <section className="border border-gray-800/60 bg-[#0a0e14]">
              <div className="border-b border-gray-800/60 px-5 py-3">
                <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-sky-300">4 — Tags</h2>
              </div>
              <div className="p-5">
                <Field label="Tags" hint="Separate multiple tags with commas">
                  <input type="text" name="tags" value={formData.tags} onChange={handleChange}
                    placeholder="hip-hop, trap, album-review" className={inputCls} />
                </Field>
              </div>
            </section>

            {/* ── 5. Media Links ── */}
            <section className="border border-gray-800/60 bg-[#0a0e14]">
              <div className="border-b border-gray-800/60 px-5 py-3">
                <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-sky-300">5 — Media Links</h2>
              </div>
              <div className="p-5 space-y-4">
                {mediaFields.map(({ name, label, placeholder }) => (
                  <Field key={name} label={label}>
                    <input type="url" name={name} value={formData[name]} onChange={handleChange}
                      placeholder={placeholder} className={inputCls} />
                  </Field>
                ))}
              </div>
            </section>

            {/* ── 6. Lyrics ── */}
            <section className="border border-gray-800/60 bg-[#0a0e14]">
              <div className="border-b border-gray-800/60 px-5 py-3">
                <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-sky-300">6 — Lyrics</h2>
              </div>
              <div className="p-5">
                <Field label="Lyrics" hint="Paste full lyrics — displayed in the article's left panel. Auto-fetched from Genius URL if left blank.">
                  <textarea name="lyrics" value={formData.lyrics} onChange={handleChange}
                    rows={14} placeholder="Paste lyrics here…"
                    className={inputCls + ' font-mono resize-y'} />
                </Field>
              </div>
            </section>

            {/* ── 7. Content ── */}
            <section className="border border-gray-800/60 bg-[#0a0e14]">
              <div className="border-b border-gray-800/60 px-5 py-3">
                <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-sky-300">7 — Content *</h2>
              </div>
              <div className="p-5">
                <div className="markdown-editor-wrapper">
                  <SimpleMDE
                    value={formData.content}
                    onChange={(value) => { setFormData(prev => ({ ...prev, content: value })); setError(''); }}
                    options={editorOptions}
                  />
                </div>
              </div>
            </section>

            {/* ── Actions ── */}
            <div className="flex gap-3 pb-8">
              <button type="button" onClick={() => navigate('/admin/articles')} disabled={submitting}
                className="px-5 py-2.5 border border-gray-700/60 text-gray-500 hover:border-gray-500 hover:text-gray-300 text-[11px] font-mono uppercase tracking-wider transition-colors disabled:opacity-40">
                Cancel
              </button>
              <button type="submit" disabled={submitting}
                className="flex-1 py-2.5 border border-sky-700/60 text-sky-300 hover:bg-sky-950/30 text-[11px] font-mono uppercase tracking-wider transition-colors disabled:opacity-40">
                {submitting ? 'Saving…' : 'Update Article'}
              </button>
            </div>

          </form>
        </main>
      </div>
    </div>
  );
};

export default ArticleEdit;
