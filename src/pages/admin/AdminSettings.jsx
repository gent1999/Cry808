import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from '../../assets/cry808_logo.png';

const API_URL = import.meta.env.VITE_API_URL;

// ── SVG icon helper ───────────────────────────────────────────────────────────
const SideIcon = ({ path }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);

// ── Side Panel ────────────────────────────────────────────────────────────────
function ContentSidePanel() {
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
                  <button
                    key={labelText}
                    onClick={() => navigate(to)}
                    className={`group flex w-full items-center gap-3 border px-3 py-2.5 text-left text-sm transition duration-200 ${
                      isActive
                        ? 'border-sky-300/25 bg-sky-300/10 text-white shadow-[0_16px_44px_rgba(14,165,233,.12)]'
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

// ── Tabs ──────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'toggles', label: 'Ad Toggles' },
  { id: 'referral', label: 'Referral Ads' },
  { id: 'spotify', label: 'Spotify' },
  { id: 'amazon', label: 'Amazon Products' },
];

// ── Empty form states ─────────────────────────────────────────────────────────
const EMPTY_AD = { title: '', link_url: '', display_order: '0' };
const EMPTY_PRODUCT = {
  name: '', description: '', affiliate_link: '',
  is_active: true, display_order: 0,
  is_mobile_featured: false, show_on_home: true, show_on_article: true,
};

// ── Main component ────────────────────────────────────────────────────────────
export default function AdminSettings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('toggles');
  const token = () => localStorage.getItem('adminToken');
  const hdrs  = () => ({ Authorization: `Bearer ${token()}` });

  // ── TOGGLES state ──────────────────────────────────────────────────────────
  const [settings, setSettings] = useState({
    adsterra_enabled: false,
    adsterra_home_desktop_enabled: true,
    adsterra_home_mobile_enabled: true,
    hilltop_enabled: true,
    monetag_enabled: false,
    beatport_banner_enabled: false,
    beatport_home_desktop_enabled: false,
    beatport_home_mobile_enabled: false,
    beatport_article_desktop_enabled: false,
    beatport_article_bottom_enabled: false,
    amazon_home_enabled: true,
    amazon_article_enabled: true,
    adsterra_order: '1',
    beatport_sidebar_order: '2',
    spotify_order: '3',
    amazon_order: '4',
    hilltop_article_order: '1',
    amazon_article_order: '2',
    spotify_article_order: '3',
  });
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsSaving, setSettingsSaving]   = useState(false);
  const [settingsMsg,    setSettingsMsg]       = useState('');

  // ── REFERRAL ADS state ─────────────────────────────────────────────────────
  const [ads,         setAds]         = useState([]);
  const [adsLoading,  setAdsLoading]  = useState(false);
  const [adsLoaded,   setAdsLoaded]   = useState(false);
  const [adsSaving,   setAdsSaving]   = useState(false);
  const [adsDeleting, setAdsDeleting] = useState(null);
  const [adsToggling, setAdsToggling] = useState(null);
  const [adsError,    setAdsError]    = useState('');
  const [adsSuccess,  setAdsSuccess]  = useState('');
  const [adForm,      setAdForm]      = useState(EMPTY_AD);
  const [adEditId,    setAdEditId]    = useState(null);
  const [adPreview,   setAdPreview]   = useState(null);
  const [adImageFile, setAdImageFile] = useState(null);
  const adFileRef = useRef();

  // ── SPOTIFY state ──────────────────────────────────────────────────────────
  const [embeds,        setEmbeds]        = useState([]);
  const [embedsLoading, setEmbedsLoading] = useState(false);
  const [embedsLoaded,  setEmbedsLoaded]  = useState(false);
  const [embedsMsg,     setEmbedsMsg]     = useState({ text: '', type: '' });
  const [spotifyUrl,    setSpotifyUrl]    = useState('');
  const [pageType,      setPageType]      = useState('home');

  // ── AMAZON PRODUCTS state ──────────────────────────────────────────────────
  const [products,           setProducts]           = useState([]);
  const [productsLoading,    setProductsLoading]    = useState(false);
  const [productsLoaded,     setProductsLoaded]     = useState(false);
  const [productsError,      setProductsError]      = useState('');
  const [showProductModal,   setShowProductModal]   = useState(false);
  const [editingProduct,     setEditingProduct]     = useState(null);
  const [productImageFile,   setProductImageFile]   = useState(null);
  const [productImagePreview,setProductImagePreview]= useState(null);
  const [productForm,        setProductForm]        = useState(EMPTY_PRODUCT);

  // ── Auth check + initial settings load ────────────────────────────────────
  useEffect(() => {
    if (!token()) { navigate('/admin/login'); return; }
    loadSettings();
  }, []);

  // ── Lazy-load per tab ──────────────────────────────────────────────────────
  useEffect(() => {
    if (activeTab === 'referral' && !adsLoaded)      loadAds();
    if (activeTab === 'spotify'  && !embedsLoaded)   loadEmbeds();
    if (activeTab === 'amazon'   && !productsLoaded) loadProducts();
  }, [activeTab]);

  // ══════════════════════════════════════════════════════════════════════════
  // SETTINGS handlers
  // ══════════════════════════════════════════════════════════════════════════
  const loadSettings = async () => {
    setSettingsLoading(true);
    try {
      const r = await fetch(`${API_URL}/api/admin/settings`, { headers: hdrs() });
      if (!r.ok) throw new Error('Failed to fetch settings');
      const data = await r.json();
      const converted = {};
      Object.entries(data.settings).forEach(([k, v]) => {
        converted[k] = (v === 'true' || v === 'false') ? v === 'true' : v;
      });
      setSettings(converted);
    } catch (e) { console.error(e); }
    setSettingsLoading(false);
  };

  const handleSettingsToggle = (key) => setSettings(s => ({ ...s, [key]: !s[key] }));
  const handleSettingsInput  = (key, val) => setSettings(s => ({ ...s, [key]: val }));

  const handleSettingsSave = async () => {
    setSettingsSaving(true);
    setSettingsMsg('');
    try {
      const converted = {};
      Object.entries(settings).forEach(([k, v]) => {
        converted[k] = typeof v === 'boolean' ? v.toString() : v;
      });
      const r = await fetch(`${API_URL}/api/admin/settings`, {
        method: 'PUT',
        headers: { ...hdrs(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: converted }),
      });
      if (!r.ok) throw new Error('Failed to save settings');
      setSettingsMsg('Settings saved!');
      setTimeout(() => setSettingsMsg(''), 3000);
    } catch (e) { setSettingsMsg('Error: ' + e.message); }
    setSettingsSaving(false);
  };

  // ══════════════════════════════════════════════════════════════════════════
  // REFERRAL ADS handlers
  // ══════════════════════════════════════════════════════════════════════════
  const adFlash = (msg, type = 'success') => {
    if (type === 'success') { setAdsSuccess(msg); setTimeout(() => setAdsSuccess(''), 4000); }
    else                    { setAdsError(msg);   setTimeout(() => setAdsError(''),   5000); }
  };

  const loadAds = async () => {
    setAdsLoading(true);
    try {
      const r = await fetch(`${API_URL}/api/referral-ads/all`, { headers: hdrs() });
      const d = await r.json();
      setAds(d.ads || []);
      setAdsLoaded(true);
    } catch (e) { adFlash(e.message, 'error'); }
    setAdsLoading(false);
  };

  const handleAdFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAdImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAdPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const openAdEdit = (ad) => {
    setAdEditId(ad.id);
    setAdForm({ title: ad.title || '', link_url: ad.link_url, display_order: String(ad.display_order ?? 0) });
    setAdPreview(ad.image_url);
    setAdImageFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelAdEdit = () => {
    setAdEditId(null);
    setAdForm(EMPTY_AD);
    setAdPreview(null);
    setAdImageFile(null);
    if (adFileRef.current) adFileRef.current.value = '';
  };

  const handleAdSave = async (e) => {
    e.preventDefault();
    if (!adForm.link_url.trim()) return adFlash('Link URL is required', 'error');
    if (!adEditId && !adImageFile) return adFlash('Please upload an image', 'error');
    setAdsSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', adForm.title);
      fd.append('link_url', adForm.link_url);
      fd.append('display_order', adForm.display_order || '0');
      if (adImageFile) fd.append('image', adImageFile);
      const url    = adEditId ? `${API_URL}/api/referral-ads/${adEditId}` : `${API_URL}/api/referral-ads`;
      const method = adEditId ? 'PUT' : 'POST';
      const r = await fetch(url, { method, headers: hdrs(), body: fd });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || 'Save failed');
      adFlash(adEditId ? 'Ad updated!' : 'Ad created!');
      cancelAdEdit();
      loadAds();
    } catch (e) { adFlash(e.message, 'error'); }
    setAdsSaving(false);
  };

  const handleAdToggle = async (ad) => {
    setAdsToggling(ad.id);
    try {
      const fd = new FormData();
      fd.append('is_active', String(!ad.is_active));
      const r = await fetch(`${API_URL}/api/referral-ads/${ad.id}`, { method: 'PUT', headers: hdrs(), body: fd });
      if (!r.ok) throw new Error('Toggle failed');
      setAds(prev => prev.map(a => a.id === ad.id ? { ...a, is_active: !ad.is_active } : a));
    } catch (e) { adFlash(e.message, 'error'); }
    setAdsToggling(null);
  };

  const handleAdDelete = async (id) => {
    if (!confirm('Delete this ad? This cannot be undone.')) return;
    setAdsDeleting(id);
    try {
      const r = await fetch(`${API_URL}/api/referral-ads/${id}`, { method: 'DELETE', headers: hdrs() });
      if (!r.ok) throw new Error('Delete failed');
      setAds(prev => prev.filter(a => a.id !== id));
      adFlash('Ad deleted');
    } catch (e) { adFlash(e.message, 'error'); }
    setAdsDeleting(null);
  };

  // ══════════════════════════════════════════════════════════════════════════
  // SPOTIFY handlers
  // ══════════════════════════════════════════════════════════════════════════
  const embedFlash = (text, type) => {
    setEmbedsMsg({ text, type });
    setTimeout(() => setEmbedsMsg({ text: '', type: '' }), 3000);
  };

  const loadEmbeds = async () => {
    setEmbedsLoading(true);
    try {
      const r = await fetch(`${API_URL}/api/spotify-embeds/all`, { headers: hdrs() });
      const d = await r.json();
      setEmbeds(d.embeds || []);
      setEmbedsLoaded(true);
    } catch (e) { embedFlash('Failed to fetch embeds', 'error'); }
    setEmbedsLoading(false);
  };

  const handleEmbedSubmit = async (e) => {
    e.preventDefault();
    if (!spotifyUrl) return embedFlash('Please enter a Spotify URL', 'error');
    try {
      const r = await fetch(`${API_URL}/api/spotify-embeds`, {
        method: 'POST',
        headers: { ...hdrs(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ spotify_url: spotifyUrl, page_type: pageType }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || 'Error saving embed');
      embedFlash(d.message, 'success');
      loadEmbeds();
      setSpotifyUrl('');
      setPageType('home');
    } catch (e) { embedFlash(e.message, 'error'); }
  };

  const handleEmbedDelete = async (id) => {
    if (!confirm('Delete this Spotify embed?')) return;
    try {
      const r = await fetch(`${API_URL}/api/spotify-embeds/${id}`, { method: 'DELETE', headers: hdrs() });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || 'Error deleting embed');
      embedFlash(d.message, 'success');
      loadEmbeds();
    } catch (e) { embedFlash(e.message, 'error'); }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // AMAZON PRODUCTS handlers
  // ══════════════════════════════════════════════════════════════════════════
  const loadProducts = async () => {
    setProductsLoading(true);
    try {
      const r = await fetch(`${API_URL}/api/amazon-products/admin`, { headers: hdrs() });
      if (!r.ok) throw new Error('Failed to fetch products');
      const d = await r.json();
      setProducts(d.products || []);
      setProductsLoaded(true);
    } catch (e) { setProductsError(e.message); }
    setProductsLoading(false);
  };

  const handleProductImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProductImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setProductImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const openProductModal = (product = null) => {
    setEditingProduct(product);
    setProductForm(product ? {
      name: product.name,
      description: product.description || '',
      affiliate_link: product.affiliate_link,
      is_active: product.is_active,
      display_order: product.display_order,
      is_mobile_featured: product.is_mobile_featured || false,
      show_on_home: product.show_on_home !== false,
      show_on_article: product.show_on_article !== false,
    } : EMPTY_PRODUCT);
    setProductImagePreview(product?.image_url || null);
    setProductImageFile(null);
    setShowProductModal(true);
  };

  const closeProductModal = () => {
    setShowProductModal(false);
    setEditingProduct(null);
    setProductImageFile(null);
    setProductImagePreview(null);
    setProductForm(EMPTY_PRODUCT);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      Object.entries(productForm).forEach(([k, v]) => fd.append(k, v));
      if (productImageFile) fd.append('image', productImageFile);
      const url    = editingProduct
        ? `${API_URL}/api/amazon-products/admin/${editingProduct.id}`
        : `${API_URL}/api/amazon-products/admin`;
      const method = editingProduct ? 'PUT' : 'POST';
      const r = await fetch(url, { method, headers: hdrs(), body: fd });
      if (!r.ok) throw new Error('Failed to save product');
      closeProductModal();
      loadProducts();
    } catch (e) { alert(e.message); }
  };

  const handleProductDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      const r = await fetch(`${API_URL}/api/amazon-products/admin/${id}`, { method: 'DELETE', headers: hdrs() });
      if (!r.ok) throw new Error('Failed to delete product');
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (e) { alert(e.message); }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // Sub-components (defined in scope so they close over handlers)
  // ══════════════════════════════════════════════════════════════════════════
  const Toggle = ({ settingKey }) => (
    <button
      onClick={() => handleSettingsToggle(settingKey)}
      className={`relative inline-flex h-5 w-9 items-center flex-shrink-0 transition-colors ${
        settings[settingKey] ? 'bg-emerald-600' : 'bg-gray-700'
      }`}
    >
      <span className={`inline-block h-3.5 w-3.5 transform bg-white transition-transform ${
        settings[settingKey] ? 'translate-x-4' : 'translate-x-0.5'
      }`} />
    </button>
  );

  const AdTable = ({ title, rows }) => (
    <section className="border border-gray-800/60">
      <div className="border-b border-gray-800/60 px-5 py-3">
        <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-sky-300">{title}</h2>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800/60">
            <th className="px-5 py-2 text-[10px] font-mono font-semibold text-gray-600 uppercase tracking-wider text-left w-1/2">Placement</th>
            <th className="px-5 py-2 text-[10px] font-mono font-semibold text-gray-600 uppercase tracking-wider text-left">Size</th>
            <th className="px-5 py-2 text-[10px] font-mono font-semibold text-gray-600 uppercase tracking-wider text-right">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/40">
          {rows.map(({ label, size, settingKey }) => (
            <tr key={settingKey} className="hover:bg-[#111827] transition-colors">
              <td className="px-5 py-3 text-gray-200 text-sm">{label}</td>
              <td className="px-5 py-3 text-gray-600 text-xs font-mono">{size}</td>
              <td className="px-5 py-3">
                <div className="flex items-center justify-end gap-2">
                  <span className={`text-[10px] font-mono uppercase tracking-wide ${settings[settingKey] ? 'text-emerald-400' : 'text-gray-600'}`}>
                    {settings[settingKey] ? 'On' : 'Off'}
                  </span>
                  <Toggle settingKey={settingKey} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );

  const OrderTable = ({ title, rows }) => (
    <section className="border border-gray-800/60">
      <div className="border-b border-gray-800/60 px-5 py-3">
        <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-gray-500">{title}</h2>
      </div>
      <div className="divide-y divide-gray-800/40">
        {rows.map(({ label, settingKey }) => (
          <div key={settingKey} className="flex items-center justify-between px-5 py-2.5 hover:bg-[#111827] transition-colors">
            <span className="text-sm text-gray-300">{label}</span>
            <input
              type="number" min="1" max="10"
              value={settings[settingKey] || ''}
              onChange={(e) => handleSettingsInput(settingKey, e.target.value)}
              className="w-12 px-2 py-1 bg-black/50 border border-gray-700/60 text-white text-center text-sm font-mono focus:outline-none focus:border-sky-700/60"
            />
          </div>
        ))}
      </div>
    </section>
  );

  // ── Loading ────────────────────────────────────────────────────────────────
  if (settingsLoading) {
    return (
      <div className="admin-command-center content-command-center min-h-screen bg-[#070b12] text-white flex items-center justify-center">
        <span className="text-xs font-mono text-gray-600 uppercase tracking-widest animate-pulse">Loading…</span>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="admin-command-center content-command-center min-h-screen bg-[#070b12] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(59,130,246,.16),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(139,92,246,.14),transparent_30%),linear-gradient(180deg,#070b12_0%,#0a0f1a_48%,#070b12_100%)]" />
      <ContentSidePanel />

      <div className="relative ml-[264px] min-h-screen flex flex-col">

        {/* ── Sticky Header ── */}
        <header className="sticky top-0 z-20 border-b border-white/[0.07] bg-[#070b12]/82 px-8 py-3 backdrop-blur-xl">
          <div className="flex h-8 items-center">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="text-xs text-slate-500 hover:text-slate-200 uppercase tracking-[.16em] font-semibold transition-colors"
              >
                ← Dashboard
              </button>
              <span className="text-gray-700">│</span>
              <span className="text-xs text-sky-300 font-bold uppercase tracking-[.18em]">Ad Settings</span>
            </div>
          </div>
        </header>

        {/* ── Tab Bar ── */}
        <div className="border-b border-white/[0.07] px-8 bg-[#070b12]/60">
          <div className="flex">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 text-[11px] font-mono font-bold uppercase tracking-[.14em] border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-sky-400 text-sky-300'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab Panels ── */}
        <main className="flex-1 px-8 py-7">

          {/* ═══════════════════ AD TOGGLES ═══════════════════ */}
          {activeTab === 'toggles' && (
            <div className="max-w-2xl space-y-5">

              <AdTable title="Adsterra" rows={[
                { label: 'Home — Desktop Sidebar', size: '300×250', settingKey: 'adsterra_home_desktop_enabled' },
                { label: 'Home — Mobile Banner',   size: '320×50',  settingKey: 'adsterra_home_mobile_enabled' },
                { label: 'Home — Social Bar',      size: 'Sticky',  settingKey: 'adsterra_enabled' },
              ]} />

              <AdTable title="Hilltop" rows={[
                { label: 'Article — Desktop Sidebar', size: '300×250', settingKey: 'hilltop_enabled' },
              ]} />

              <AdTable title="Beatport / Loopcloud" rows={[
                { label: 'Home — Desktop Sidebar',  size: '300×250',  settingKey: 'beatport_home_desktop_enabled' },
                { label: 'Home — Mobile Banner',    size: '300×50',   settingKey: 'beatport_home_mobile_enabled' },
                { label: 'Article — Top Banner',    size: '1916×260', settingKey: 'beatport_article_desktop_enabled' },
                { label: 'Article — Bottom Banner', size: '970×90',   settingKey: 'beatport_article_bottom_enabled' },
              ]} />

              <AdTable title="Amazon" rows={[
                { label: 'Home — Sidebar Widget',    size: 'Product cards', settingKey: 'amazon_home_enabled' },
                { label: 'Article — Sidebar Widget', size: 'Product cards', settingKey: 'amazon_article_enabled' },
              ]} />

              <div className="grid grid-cols-2 gap-5">
                <OrderTable title="Home Sidebar Order" rows={[
                  { label: 'Adsterra', settingKey: 'adsterra_order' },
                  { label: 'Beatport', settingKey: 'beatport_sidebar_order' },
                  { label: 'Spotify',  settingKey: 'spotify_order' },
                  { label: 'Amazon',   settingKey: 'amazon_order' },
                ]} />
                <OrderTable title="Article Sidebar Order" rows={[
                  { label: 'Hilltop', settingKey: 'hilltop_article_order' },
                  { label: 'Amazon',  settingKey: 'amazon_article_order' },
                  { label: 'Spotify', settingKey: 'spotify_article_order' },
                ]} />
              </div>

              <button
                onClick={handleSettingsSave}
                disabled={settingsSaving}
                className="w-full py-2.5 border border-sky-700/60 text-sky-300 hover:bg-sky-950/30 text-[11px] font-mono uppercase tracking-wider transition-colors disabled:opacity-40"
              >
                {settingsSaving ? 'Saving…' : 'Save Settings'}
              </button>

              {settingsMsg && (
                <div className={`px-4 py-2.5 text-xs font-mono border ${
                  settingsMsg.includes('Error')
                    ? 'border-red-800/60 bg-red-950/20 text-red-400'
                    : 'border-emerald-800/60 bg-emerald-950/20 text-emerald-400'
                }`}>
                  {settingsMsg}
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════ REFERRAL ADS ═══════════════════ */}
          {activeTab === 'referral' && (
            <div className="max-w-4xl space-y-6">

              {adsError   && <div className="border border-red-800/60 bg-red-950/20 px-4 py-2.5 text-xs font-mono text-red-400 uppercase tracking-wider">{adsError}</div>}
              {adsSuccess && <div className="border border-emerald-800/60 bg-emerald-950/20 px-4 py-2.5 text-xs font-mono text-emerald-400 uppercase tracking-wider">{adsSuccess}</div>}

              {/* Create / Edit Form */}
              <section className="border border-gray-800/60 bg-[#0a0e14]">
                <div className="border-b border-gray-800/60 px-5 py-3">
                  <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-sky-300">
                    {adEditId ? '✎ Edit Ad' : '+ New Referral Ad'}
                  </h2>
                </div>
                <form onSubmit={handleAdSave} className="p-5 space-y-4">

                  {/* Image upload */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-2">
                      Ad Image <span className="text-red-400">*</span> (square recommended)
                    </label>
                    <div className="flex items-start gap-4">
                      <div
                        onClick={() => adFileRef.current?.click()}
                        className="w-24 h-24 flex-shrink-0 border border-gray-700/60 cursor-pointer hover:border-sky-700/60 transition-colors flex items-center justify-center overflow-hidden bg-black/40"
                      >
                        {adPreview
                          ? <img src={adPreview} alt="preview" className="w-full h-full object-cover" />
                          : <span className="text-[10px] font-mono text-gray-600 text-center px-2">Click to upload</span>
                        }
                      </div>
                      <div className="flex-1 space-y-2">
                        <input ref={adFileRef} type="file" accept="image/*" onChange={handleAdFile} className="hidden" />
                        <button type="button" onClick={() => adFileRef.current?.click()}
                          className="text-[10px] font-mono uppercase tracking-wider border border-gray-700/60 text-gray-400 hover:border-sky-700/60 hover:text-sky-300 px-3 py-1.5 transition-colors">
                          {adPreview ? 'Change Image' : 'Upload Image'}
                        </button>
                        <p className="text-[10px] font-mono text-gray-600">Square images work best (e.g. 300×300). Max 5 MB.</p>
                      </div>
                    </div>
                  </div>

                  {/* Link URL */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1.5">
                      Destination URL <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="url"
                      value={adForm.link_url}
                      onChange={e => setAdForm(f => ({ ...f, link_url: e.target.value }))}
                      placeholder="https://example.com/landing-page"
                      className="w-full bg-black/50 border border-gray-700/60 text-sm text-gray-200 font-mono px-3 py-2 focus:outline-none focus:border-sky-700/60 placeholder-gray-700"
                    />
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1.5">
                      Caption / Title <span className="text-gray-600">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={adForm.title}
                      onChange={e => setAdForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="Short description shown under the ad"
                      className="w-full bg-black/50 border border-gray-700/60 text-sm text-gray-200 font-mono px-3 py-2 focus:outline-none focus:border-sky-700/60 placeholder-gray-700"
                    />
                  </div>

                  {/* Display Order */}
                  <div className="w-32">
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1.5">Display Order</label>
                    <input
                      type="number" min="0"
                      value={adForm.display_order}
                      onChange={e => setAdForm(f => ({ ...f, display_order: e.target.value }))}
                      className="w-full bg-black/50 border border-gray-700/60 text-sm text-gray-200 font-mono px-3 py-2 focus:outline-none focus:border-sky-700/60"
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button type="submit" disabled={adsSaving}
                      className="text-[10px] font-mono px-4 py-2 border border-sky-700/60 text-sky-300 hover:bg-sky-950/30 uppercase tracking-wider transition-colors disabled:opacity-40">
                      {adsSaving ? 'Saving…' : adEditId ? 'Update Ad' : 'Create Ad'}
                    </button>
                    {adEditId && (
                      <button type="button" onClick={cancelAdEdit}
                        className="text-[10px] font-mono px-4 py-2 border border-gray-700/50 text-gray-500 hover:border-gray-500 hover:text-gray-300 uppercase tracking-wider transition-colors">
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </section>

              {/* Ads List */}
              <section className="border border-gray-800/60">
                <div className="border-b border-gray-800/60 px-5 py-3 flex items-center justify-between">
                  <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-gray-400">All Referral Ads</h2>
                  <span className="text-[10px] font-mono text-gray-600">{ads.length} total</span>
                </div>
                {adsLoading ? (
                  <div className="px-5 py-10 text-center text-xs font-mono text-gray-600 uppercase tracking-widest animate-pulse">Loading…</div>
                ) : ads.length === 0 ? (
                  <div className="px-5 py-10 text-center text-xs font-mono text-gray-600 uppercase tracking-widest">No referral ads yet — create one above.</div>
                ) : (
                  <div className="divide-y divide-gray-800/40">
                    {ads.map(ad => (
                      <div key={ad.id} className="flex items-center gap-4 px-5 py-4 hover:bg-[#111827] transition-colors">
                        <img src={ad.image_url} alt={ad.title || 'Ad'} className="w-16 h-16 object-cover flex-shrink-0 border border-gray-800/60" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-gray-200 truncate">
                            {ad.title || <span className="text-gray-600 italic">No caption</span>}
                          </div>
                          <a href={ad.link_url} target="_blank" rel="noopener noreferrer"
                            className="text-[11px] font-mono text-blue-400 hover:text-blue-300 truncate block mt-0.5">
                            {ad.link_url}
                          </a>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 border ${
                              ad.is_active ? 'text-emerald-400 border-emerald-800/60' : 'text-gray-600 border-gray-700/40'
                            }`}>
                              {ad.is_active ? 'Active' : 'Hidden'}
                            </span>
                            <span className="text-[10px] font-mono text-gray-600">Order: {ad.display_order}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button onClick={() => handleAdToggle(ad)} disabled={adsToggling === ad.id}
                            className={`text-[10px] font-mono px-2.5 py-1.5 border uppercase tracking-wide transition-colors disabled:opacity-40 ${
                              ad.is_active
                                ? 'border-emerald-800/60 text-emerald-400 hover:bg-emerald-950/20'
                                : 'border-gray-700/50 text-gray-600 hover:border-emerald-800/40 hover:text-emerald-500'
                            }`}>
                            {adsToggling === ad.id ? '…' : ad.is_active ? 'Hide' : 'Show'}
                          </button>
                          <button onClick={() => openAdEdit(ad)}
                            className="text-[10px] font-mono px-2.5 py-1.5 border border-gray-700/50 text-gray-400 hover:border-sky-700/60 hover:text-sky-300 uppercase tracking-wide transition-colors">
                            Edit
                          </button>
                          <button onClick={() => handleAdDelete(ad.id)} disabled={adsDeleting === ad.id}
                            className="text-[10px] font-mono px-2.5 py-1.5 border border-gray-700/50 text-gray-500 hover:border-red-800/60 hover:text-red-400 uppercase tracking-wide transition-colors disabled:opacity-40">
                            {adsDeleting === ad.id ? '…' : 'Del'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ═══════════════════ SPOTIFY ═══════════════════ */}
          {activeTab === 'spotify' && (
            <div className="max-w-3xl space-y-6">

              {embedsMsg.text && (
                <div className={`border px-4 py-2.5 text-xs font-mono uppercase tracking-wider ${
                  embedsMsg.type === 'success'
                    ? 'border-emerald-800/60 bg-emerald-950/20 text-emerald-400'
                    : 'border-red-800/60 bg-red-950/20 text-red-400'
                }`}>
                  {embedsMsg.text}
                </div>
              )}

              {/* Add Form */}
              <section className="border border-gray-800/60 bg-[#0a0e14]">
                <div className="border-b border-gray-800/60 px-5 py-3">
                  <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-sky-300">+ Add Spotify Embed</h2>
                </div>
                <form onSubmit={handleEmbedSubmit} className="p-5 space-y-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1.5">Page Type</label>
                    <select
                      value={pageType}
                      onChange={e => setPageType(e.target.value)}
                      className="w-full bg-black/50 border border-gray-700/60 text-sm text-gray-200 px-3 py-2 focus:outline-none focus:border-sky-700/60"
                    >
                      <option value="home">Home Page</option>
                      <option value="article">Article Page</option>
                    </select>
                    <p className="text-[10px] font-mono text-gray-600 mt-1.5">Which page this embed will appear on</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1.5">Spotify Link</label>
                    <input
                      type="text"
                      value={spotifyUrl}
                      onChange={e => setSpotifyUrl(e.target.value)}
                      placeholder="https://open.spotify.com/playlist/..."
                      className="w-full bg-black/50 border border-gray-700/60 text-sm text-gray-200 font-mono px-3 py-2 focus:outline-none focus:border-sky-700/60 placeholder-gray-700"
                    />
                    <p className="text-[10px] font-mono text-gray-600 mt-1.5">Paste any Spotify link (playlist, album, track, or artist)</p>
                  </div>
                  <button type="submit"
                    className="text-[10px] font-mono px-4 py-2 border border-sky-700/60 text-sky-300 hover:bg-sky-950/30 uppercase tracking-wider transition-colors">
                    Add to Sidebar
                  </button>
                </form>
              </section>

              {/* Embeds List */}
              <section className="border border-gray-800/60">
                <div className="border-b border-gray-800/60 px-5 py-3 flex items-center justify-between">
                  <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-gray-400">Existing Embeds</h2>
                  <span className="text-[10px] font-mono text-gray-600">{embeds.length} total</span>
                </div>
                {embedsLoading ? (
                  <div className="px-5 py-10 text-center text-xs font-mono text-gray-600 uppercase tracking-widest animate-pulse">Loading…</div>
                ) : embeds.length === 0 ? (
                  <div className="px-5 py-10 text-center text-xs font-mono text-gray-600 uppercase tracking-widest">No embeds yet — add one above.</div>
                ) : (
                  <div className="divide-y divide-gray-800/40">
                    {embeds.map(embed => (
                      <div key={embed.id} className="flex items-start justify-between gap-4 px-5 py-4 hover:bg-[#111827] transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-sm font-semibold text-gray-200">{embed.title}</span>
                            <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 border ${
                              embed.is_active ? 'text-emerald-400 border-emerald-800/60' : 'text-gray-600 border-gray-700/40'
                            }`}>{embed.is_active ? 'Active' : 'Inactive'}</span>
                            <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 border border-purple-800/60 text-purple-400">{embed.embed_type}</span>
                            <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 border border-blue-800/60 text-blue-400">
                              {embed.page_type === 'article' ? 'Article' : 'Home'}
                            </span>
                            <span className="text-[10px] font-mono text-gray-600">Order: {embed.display_order}</span>
                          </div>
                          <p className="text-[11px] font-mono text-gray-500 truncate">{embed.spotify_url}</p>
                        </div>
                        <button onClick={() => handleEmbedDelete(embed.id)}
                          className="text-[10px] font-mono px-2.5 py-1.5 border border-gray-700/50 text-gray-500 hover:border-red-800/60 hover:text-red-400 uppercase tracking-wide transition-colors flex-shrink-0">
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ═══════════════════ AMAZON PRODUCTS ═══════════════════ */}
          {activeTab === 'amazon' && (
            <div className="max-w-5xl space-y-6">

              {productsError && (
                <div className="border border-red-800/60 bg-red-950/20 px-4 py-2.5 text-xs font-mono text-red-400 uppercase tracking-wider">{productsError}</div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-gray-600 uppercase tracking-wider">{products.length} products</span>
                <button
                  onClick={() => openProductModal()}
                  className="text-[10px] font-mono px-4 py-2 border border-sky-700/60 text-sky-300 hover:bg-sky-950/30 uppercase tracking-wider transition-colors"
                >
                  + Add Product
                </button>
              </div>

              {productsLoading ? (
                <div className="py-16 text-center text-xs font-mono text-gray-600 uppercase tracking-widest animate-pulse">Loading…</div>
              ) : products.length === 0 ? (
                <div className="py-16 text-center text-xs font-mono text-gray-600 uppercase tracking-widest">No products yet — add your first Amazon affiliate product.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map(product => (
                    <div key={product.id} className="border border-gray-800/60 bg-[#0a0e14] overflow-hidden">
                      {product.image_url && (
                        <div className="h-40 bg-white/5 flex items-center justify-center border-b border-gray-800/60">
                          <img src={product.image_url} alt={product.name} className="h-full w-full object-contain" />
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="text-sm font-semibold text-gray-200 leading-tight">{product.name}</h3>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 border ${
                              product.is_active ? 'text-emerald-400 border-emerald-800/60' : 'text-gray-600 border-gray-700/40'
                            }`}>{product.is_active ? 'Active' : 'Off'}</span>
                            {product.is_mobile_featured && (
                              <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 border border-orange-800/60 text-orange-400">📱 Mobile</span>
                            )}
                          </div>
                        </div>
                        {product.description && <p className="text-xs text-gray-500 mb-2 line-clamp-2">{product.description}</p>}
                        <p className="text-[10px] font-mono text-gray-600 mb-3">Order: {product.display_order}</p>
                        <div className="flex gap-2">
                          <button onClick={() => openProductModal(product)}
                            className="flex-1 text-[10px] font-mono py-1.5 border border-gray-700/50 text-gray-400 hover:border-sky-700/60 hover:text-sky-300 uppercase tracking-wide transition-colors">
                            Edit
                          </button>
                          <button onClick={() => handleProductDelete(product.id)}
                            className="flex-1 text-[10px] font-mono py-1.5 border border-gray-700/50 text-gray-500 hover:border-red-800/60 hover:text-red-400 uppercase tracking-wide transition-colors">
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* ── Amazon Product Modal ── */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
          <div className="bg-[#0b1019] border border-gray-800/60 p-7 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-sky-300 mb-6">
              {editingProduct ? '✎ Edit Product' : '+ New Amazon Product'}
            </h2>
            <form onSubmit={handleProductSubmit} className="space-y-4">

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1.5">
                  Product Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-black/50 border border-gray-700/60 text-sm text-gray-200 px-3 py-2 focus:outline-none focus:border-sky-700/60"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1.5">Description</label>
                <textarea
                  value={productForm.description}
                  onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full bg-black/50 border border-gray-700/60 text-sm text-gray-200 px-3 py-2 focus:outline-none focus:border-sky-700/60 resize-none"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1.5">
                  Amazon Affiliate Link <span className="text-red-400">*</span>
                </label>
                <input
                  type="url"
                  value={productForm.affiliate_link}
                  onChange={e => setProductForm(f => ({ ...f, affiliate_link: e.target.value }))}
                  placeholder="https://amzn.to/..."
                  className="w-full bg-black/50 border border-gray-700/60 text-sm text-gray-200 font-mono px-3 py-2 focus:outline-none focus:border-sky-700/60 placeholder-gray-700"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1.5">Product Image</label>
                <input
                  type="file" accept="image/*" onChange={handleProductImageChange}
                  className="w-full text-sm text-gray-400 file:mr-4 file:py-1.5 file:px-3 file:border file:border-gray-700/60 file:bg-black/50 file:text-gray-400 file:text-xs file:font-mono file:cursor-pointer"
                />
                {productImagePreview && (
                  <div className="mt-3 border border-gray-800/60 bg-white/5 p-3 flex items-center justify-center">
                    <img src={productImagePreview} alt="Preview" className="max-h-36 object-contain" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1.5">Display Order</label>
                  <input
                    type="number"
                    value={productForm.display_order}
                    onChange={e => setProductForm(f => ({ ...f, display_order: parseInt(e.target.value) }))}
                    className="w-full bg-black/50 border border-gray-700/60 text-sm text-gray-200 px-3 py-2 focus:outline-none focus:border-sky-700/60"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1.5">Status</label>
                  <select
                    value={productForm.is_active}
                    onChange={e => setProductForm(f => ({ ...f, is_active: e.target.value === 'true' }))}
                    className="w-full bg-black/50 border border-gray-700/60 text-sm text-gray-200 px-3 py-2 focus:outline-none focus:border-sky-700/60"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Mobile Featured */}
              <div className="border border-orange-800/40 bg-orange-950/10 px-4 py-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.is_mobile_featured}
                    onChange={e => setProductForm(f => ({ ...f, is_mobile_featured: e.target.checked }))}
                    className="w-4 h-4"
                  />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-orange-400">📱 Set as Mobile Homepage Ad</span>
                </label>
                <p className="text-[10px] font-mono text-gray-500 mt-1.5 ml-6">Replaces the 300×50 banner on mobile. Only one product featured at a time.</p>
              </div>

              {/* Page Selection */}
              <div className="border border-purple-800/40 bg-purple-950/10 px-4 py-3">
                <div className="text-[10px] font-mono uppercase tracking-widest text-purple-400 mb-2">Show On Pages</div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={productForm.show_on_home}
                      onChange={e => setProductForm(f => ({ ...f, show_on_home: e.target.checked }))} className="w-4 h-4" />
                    <span className="text-xs text-gray-300 font-mono">Home Page</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={productForm.show_on_article}
                      onChange={e => setProductForm(f => ({ ...f, show_on_article: e.target.checked }))} className="w-4 h-4" />
                    <span className="text-xs text-gray-300 font-mono">Article Pages</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeProductModal}
                  className="flex-1 text-[10px] font-mono py-2.5 border border-gray-700/50 text-gray-500 hover:border-gray-500 hover:text-gray-300 uppercase tracking-wider transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 text-[10px] font-mono py-2.5 border border-sky-700/60 text-sky-300 hover:bg-sky-950/30 uppercase tracking-wider transition-colors">
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
