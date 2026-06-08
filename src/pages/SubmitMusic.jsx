import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import Footer from "../components/Footer";

const API_URL = import.meta.env.VITE_API_URL;
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
const PRICE = { priority: 5, genius: 10 };

// ── Stripe checkout form ───────────────────────────────────────────────────────
function CheckoutForm({ form, service, onSuccess }) {
  const stripe    = useStripe();
  const elements  = useElements();
  const [processing, setProcessing] = useState(false);
  const [msg,        setMsg]        = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true); setMsg(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (error) { setMsg(error.message); setProcessing(false); return; }

    if (paymentIntent?.status === 'succeeded') {
      try {
        const fd = new FormData();
        fd.append('artist_name',    form.artist_name);
        fd.append('email',          form.email);
        fd.append('title',          service === 'genius' ? form.song_title : form.title);
        fd.append('content',        service === 'genius' ? form.genius_lyrics : form.description);
        fd.append('submission_type', service);
        fd.append('payment_id',     paymentIntent.id);
        if (form.youtube_url)     fd.append('youtube_url',     form.youtube_url);
        if (form.spotify_url)     fd.append('spotify_url',     form.spotify_url);
        if (form.soundcloud_url)  fd.append('soundcloud_url',  form.soundcloud_url);
        if (form.apple_music_url) fd.append('apple_music_url', form.apple_music_url);
        if (form.instagram_url)   fd.append('instagram_url',   form.instagram_url);
        if (form.genre)           fd.append('genre',           form.genre);
        if (form.image)           fd.append('image',           form.image);
        if (service === 'genius') {
          fd.append('genius_song_url', form.genius_song_url);
          fd.append('genius_lyrics',   form.genius_lyrics);
        }

        const r = await fetch(`${API_URL}/api/submissions/submit`, { method: 'POST', body: fd });
        if (r.ok) onSuccess();
        else setMsg('Payment succeeded but save failed — please contact support.');
      } catch {
        setMsg('Payment succeeded but save failed — please contact support.');
      }
    }
    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {msg && <div className="p-4 bg-red-500/20 border border-red-500/40 text-red-400 text-sm">{msg}</div>}
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold transition-all transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
      >
        {processing ? '💳 Processing…' : `💳 Pay $${PRICE[service]} & Submit`}
      </button>
    </form>
  );
}

// ── Shared styles ──────────────────────────────────────────────────────────────
const inputCls = "w-full px-4 py-3 bg-black/50 border border-white/15 text-white placeholder-white/25 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/20 transition-colors text-sm";
const labelCls = "block text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-2";

const Check = () => (
  <svg className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

// ── Main page ──────────────────────────────────────────────────────────────────
export default function SubmitMusic() {
  const [step, setStep]       = useState(1); // 1 select | 2 form | 3 payment | 4 success
  const [service, setService] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [isLoading,    setIsLoading]    = useState(false);
  const [errors,       setErrors]       = useState({});
  const [imagePreview, setImagePreview] = useState(null);

  const [form, setForm] = useState({
    // shared
    artist_name: '', email: '',
    // article fields
    title: '', description: '', genre: '', instagram_url: '',
    youtube_url: '', spotify_url: '', soundcloud_url: '', apple_music_url: '',
    image: null,
    // genius fields
    song_title: '', genius_song_url: '', genius_lyrics: '',
  });

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    if (errors[k]) setErrors(p => ({ ...p, [k]: undefined }));
  };
  const handle = (e) => set(e.target.name, e.target.value);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setErrors(p => ({ ...p, image: 'Max 5MB' })); return; }
    if (!file.type.startsWith('image/')) { setErrors(p => ({ ...p, image: 'Images only' })); return; }
    set('image', file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validateArticle = () => {
    const e = {};
    if (!form.artist_name.trim()) e.artist_name = 'Required';
    if (!form.email.trim()) e.email = 'Required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.title.trim()) e.title = 'Required';
    if (!form.description.trim()) e.description = 'Required';
    else if (form.description.trim().length < 50) e.description = 'At least 50 characters';
    if (!form.youtube_url && !form.spotify_url && !form.soundcloud_url && !form.apple_music_url)
      e.links = 'At least one streaming link required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const validateGenius = () => {
    const e = {};
    if (!form.artist_name.trim()) e.artist_name = 'Required';
    if (!form.email.trim()) e.email = 'Required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.song_title.trim()) e.song_title = 'Required';
    if (!form.genius_song_url.trim()) e.genius_song_url = 'Required';
    if (!form.genius_lyrics.trim()) e.genius_lyrics = 'Required';
    else if (form.genius_lyrics.trim().length < 100) e.genius_lyrics = 'At least 100 characters';
    setErrors(e);
    return !Object.keys(e).length;
  };

  // ── Free submit (no Stripe) ───────────────────────────────────────────────
  const handleFreeSubmit = async () => {
    if (!validateArticle()) return;
    setIsLoading(true);
    try {
      const fd = new FormData();
      fd.append('artist_name',    form.artist_name);
      fd.append('email',          form.email);
      fd.append('title',          form.title);
      fd.append('content',        form.description);
      fd.append('submission_type', 'free');
      if (form.youtube_url)     fd.append('youtube_url',     form.youtube_url);
      if (form.spotify_url)     fd.append('spotify_url',     form.spotify_url);
      if (form.soundcloud_url)  fd.append('soundcloud_url',  form.soundcloud_url);
      if (form.apple_music_url) fd.append('apple_music_url', form.apple_music_url);
      if (form.instagram_url)   fd.append('instagram_url',   form.instagram_url);
      if (form.genre)           fd.append('genre',           form.genre);
      if (form.image)           fd.append('image',           form.image);

      const r = await fetch(`${API_URL}/api/submissions/free-submit`, { method: 'POST', body: fd });
      if (r.ok) setStep(4);
      else { const d = await r.json(); alert(d.message || 'Failed to submit. Please try again.'); }
    } catch { alert('Network error. Please try again.'); }
    setIsLoading(false);
  };

  // ── Paid submit: create intent → step 3 ──────────────────────────────────
  const handleProceedToPayment = async () => {
    const valid = service === 'genius' ? validateGenius() : validateArticle();
    if (!valid) return;
    setIsLoading(true);
    try {
      const r = await fetch(`${API_URL}/api/submissions/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artist_name: form.artist_name,
          email: form.email,
          content: service === 'genius' ? form.genius_lyrics : form.description,
          submission_type: service,
        }),
      });
      const d = await r.json();
      if (r.ok) { setClientSecret(d.clientSecret); setStep(3); }
      else alert('Failed to initialize payment. Please try again.');
    } catch { alert('Network error. Please try again.'); }
    setIsLoading(false);
  };

  // ── Step 4: Success ───────────────────────────────────────────────────────
  if (step === 4) {
    const msgs = {
      free:     { icon: '📬', title: 'Submission Received!',           body: "We'll review your music and write your article. Expect to hear from us within 5–7 days." },
      priority: { icon: '⚡', title: 'Priority Submission Received!',  body: "You're at the top of the queue. Expect to hear from us within 1–2 days." },
      genius:   { icon: '📝', title: 'Lyrics Submission Received!',    body: "We'll post your lyrics to Genius.com within 2–3 business days." },
    };
    const m = msgs[service] || msgs.free;
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <div className="flex-1 flex items-center justify-center px-4 py-20">
          <div className="max-w-md w-full text-center">
            <div className="text-7xl mb-6">{m.icon}</div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              {m.title}
            </h1>
            <p className="text-white/60 text-sm leading-relaxed mb-2">{m.body}</p>
            <p className="text-white/35 text-xs mb-10">
              Confirmation sent to <span className="text-white/60">{form.email}</span>
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold transition-all transform hover:scale-105"
            >
              ← Back to Cry808
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex-1">

        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black" />
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Submit Your Music
            </h1>
            <div className="h-1 w-32 bg-gradient-to-r from-purple-500 to-pink-500" />
            <p className="text-white/50 mt-4 text-sm max-w-lg">
              Get covered on Cry808 — underground hip-hop's home base.
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

          {/* Step indicator (only shown once you've selected a service) */}
          {step > 1 && (
            <div className="flex items-center gap-2 mb-8">
              {[['1', 'Service'], ['2', 'Details'], ...(service !== 'free' ? [['3', 'Payment']] : [])].map(([n, label], i, arr) => (
                <React.Fragment key={n}>
                  <div className={`flex items-center gap-2 ${parseInt(n) <= step ? 'text-white' : 'text-white/25'}`}>
                    <div className={`w-7 h-7 flex items-center justify-center text-xs font-bold border ${parseInt(n) <= step ? 'border-purple-500 bg-purple-500/20 text-purple-300' : 'border-white/15 text-white/25'}`}>
                      {n}
                    </div>
                    <span className="text-xs font-medium hidden sm:block">{label}</span>
                  </div>
                  {i < arr.length - 1 && <div className="w-8 h-px bg-white/10" />}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* ═══════════ STEP 1: SERVICE SELECTION ═══════════ */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold mb-2">Choose Your Package</h2>
              <p className="text-white/40 text-sm mb-8">All submissions are reviewed by our editorial team</p>

              <div className="grid md:grid-cols-3 gap-5">

                {/* ── Free ── */}
                <div className="border border-white/10 bg-white/[0.02] p-7 hover:border-white/25 transition-all flex flex-col">
                  <div className="text-4xl mb-4">📬</div>
                  <h3 className="text-xl font-bold mb-1">Free Submission</h3>
                  <div className="text-3xl font-black text-white mb-1">$0</div>
                  <p className="text-white/35 text-xs mb-5">Standard review queue</p>
                  <ul className="space-y-2.5 mb-7 text-sm flex-1">
                    {[
                      'Coverage article on Cry808',
                      'All streaming links embedded',
                      'Editorial written by our team',
                      '5–7 day turnaround',
                    ].map(f => (
                      <li key={f} className="flex items-start gap-2.5 text-white/50"><Check />{f}</li>
                    ))}
                  </ul>
                  <button
                    onClick={() => { setService('free'); setStep(2); }}
                    className="w-full py-3 border border-white/20 hover:border-white/50 text-white/60 hover:text-white font-medium transition-all text-sm"
                  >
                    Submit Free →
                  </button>
                </div>

                {/* ── Skip the Line ── */}
                <div className="border-2 border-purple-500/60 bg-gradient-to-b from-purple-950/40 to-black p-7 relative hover:border-purple-400 transition-all flex flex-col">
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap">
                    ⭐ Popular
                  </div>
                  <div className="text-4xl mb-4">⚡</div>
                  <h3 className="text-xl font-bold mb-1">Skip the Line</h3>
                  <div className="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-1">$5</div>
                  <p className="text-white/35 text-xs mb-5">Priority review queue</p>
                  <ul className="space-y-2.5 mb-7 text-sm flex-1">
                    {[
                      'Everything in Free',
                      'Jump to the top of the queue',
                      '1–2 day turnaround',
                      'Direct email update on status',
                    ].map(f => (
                      <li key={f} className="flex items-start gap-2.5 text-white/65"><Check />{f}</li>
                    ))}
                  </ul>
                  <button
                    onClick={() => { setService('priority'); setStep(2); }}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold transition-all transform hover:scale-[1.02] shadow-lg shadow-purple-500/20 text-sm"
                  >
                    Skip the Line — $5 →
                  </button>
                </div>

                {/* ── Genius Lyrics ── */}
                <div className="border border-yellow-500/30 bg-gradient-to-b from-yellow-950/15 to-black p-7 hover:border-yellow-400/50 transition-all flex flex-col">
                  <div className="text-4xl mb-4">📝</div>
                  <h3 className="text-xl font-bold mb-1">Genius Lyrics</h3>
                  <div className="text-3xl font-black text-yellow-400 mb-1">$10</div>
                  <p className="text-white/35 text-xs mb-5">We post your lyrics to Genius.com</p>
                  <ul className="space-y-2.5 mb-7 text-sm flex-1">
                    {[
                      'Lyrics posted to Genius.com',
                      'Song becomes searchable online',
                      'Credited to your artist page',
                      'Permanent lyrics presence',
                      '2–3 day delivery',
                    ].map(f => (
                      <li key={f} className="flex items-start gap-2.5 text-white/55"><Check />{f}</li>
                    ))}
                  </ul>
                  <button
                    onClick={() => { setService('genius'); setStep(2); }}
                    className="w-full py-3 border border-yellow-500/40 hover:border-yellow-400 hover:bg-yellow-500/10 text-yellow-400 hover:text-yellow-300 font-medium transition-all text-sm"
                  >
                    Get Lyrics Posted — $10 →
                  </button>
                </div>

              </div>

              {/* Fine print */}
              <div className="mt-10 px-5 py-4 border border-white/[0.07] bg-white/[0.02]">
                <p className="text-white/30 text-xs leading-relaxed">
                  <span className="text-white/50 font-semibold">📋 Important: </span>
                  Cry808 editors write all articles — your submission serves as a creative brief. We reserve the right to decline any submission that doesn't align with our platform. Paid submissions are non-refundable regardless of outcome. For Genius Lyrics, your artist name must exist on Genius.com or we'll create an entry for the song.
                </p>
              </div>
            </div>
          )}

          {/* ═══════════ STEP 2: FORM ═══════════ */}
          {step === 2 && (
            <div className="max-w-2xl">

              {/* Service banner */}
              <div className={`flex items-center justify-between px-5 py-3.5 mb-7 border ${
                service === 'genius'   ? 'border-yellow-500/25 bg-yellow-950/10' :
                service === 'priority' ? 'border-purple-500/25 bg-purple-950/10' :
                                         'border-white/10 bg-white/[0.02]'
              }`}>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-white">
                    {service === 'free' ? '📬 Free Submission' : service === 'priority' ? '⚡ Skip the Line' : '📝 Genius Lyrics'}
                  </span>
                  <span className={`text-sm font-bold ${service === 'genius' ? 'text-yellow-400' : service === 'priority' ? 'text-purple-400' : 'text-white/35'}`}>
                    {service === 'free' ? 'Free' : service === 'priority' ? '$5' : '$10'}
                  </span>
                </div>
                <button onClick={() => { setStep(1); setErrors({}); }} className="text-xs text-white/30 hover:text-white/60 underline transition-colors">
                  Change
                </button>
              </div>

              {/* ── Article form (free / priority) ── */}
              {service !== 'genius' && (
                <div className="space-y-5">

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className={labelCls}>Artist Name <span className="text-red-400">*</span></label>
                      <input name="artist_name" value={form.artist_name} onChange={handle}
                        placeholder="Your artist name" className={inputCls} />
                      {errors.artist_name && <p className="text-red-400 text-xs mt-1.5">{errors.artist_name}</p>}
                    </div>
                    <div>
                      <label className={labelCls}>Email <span className="text-red-400">*</span></label>
                      <input name="email" type="email" value={form.email} onChange={handle}
                        placeholder="your@email.com" className={inputCls} />
                      {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email}</p>}
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Song / Project Title <span className="text-red-400">*</span></label>
                    <input name="title" value={form.title} onChange={handle}
                      placeholder="Name of your song, EP, or album" className={inputCls} />
                    {errors.title && <p className="text-red-400 text-xs mt-1.5">{errors.title}</p>}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className={labelCls}>Genre <span className="text-white/30 normal-case font-normal">(optional)</span></label>
                      <input name="genre" value={form.genre} onChange={handle}
                        placeholder="e.g. Pluggnb, Drill, Trap" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Instagram <span className="text-white/30 normal-case font-normal">(optional)</span></label>
                      <input name="instagram_url" value={form.instagram_url} onChange={handle}
                        placeholder="@yourhandle" className={inputCls} />
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>About Your Sound <span className="text-red-400">*</span></label>
                    <textarea name="description" value={form.description} onChange={handle}
                      placeholder="Tell us about your music, your style, your story. What makes you stand out? What's the vibe? (min 50 chars)"
                      rows={4} className={`${inputCls} resize-none`} />
                    <div className="flex justify-between items-center mt-1.5">
                      {errors.description
                        ? <p className="text-red-400 text-xs">{errors.description}</p>
                        : <span className="text-[10px] text-white/25">min 50 chars</span>}
                      <span className={`text-[10px] font-mono ${form.description.length >= 50 ? 'text-green-400' : 'text-white/25'}`}>
                        {form.description.length}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Streaming Links <span className="text-red-400">*</span> <span className="text-white/30 normal-case font-normal">(at least one)</span></label>
                    {errors.links && <p className="text-red-400 text-xs mb-2">{errors.links}</p>}
                    <div className="space-y-2.5">
                      {[
                        ['spotify_url',     '🎵', 'Spotify',     'https://open.spotify.com/track/...'],
                        ['youtube_url',     '▶️', 'YouTube',     'https://youtube.com/watch?v=...'],
                        ['apple_music_url', '🍎', 'Apple Music', 'https://music.apple.com/...'],
                        ['soundcloud_url',  '☁️', 'SoundCloud',  'https://soundcloud.com/...'],
                      ].map(([key, emoji, label, ph]) => (
                        <div key={key} className="flex items-center gap-3">
                          <span className="text-base w-7 flex-shrink-0 text-center select-none">{emoji}</span>
                          <input name={key} type="url" value={form[key]} onChange={handle}
                            placeholder={`${label} — ${ph}`}
                            className="flex-1 px-3 py-2.5 bg-black/50 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50 text-xs transition-colors" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Cover Art <span className="text-white/30 normal-case font-normal">(optional · max 5MB)</span></label>
                    {imagePreview ? (
                      <div className="relative">
                        <img src={imagePreview} alt="Preview" className="w-full h-44 object-cover border border-white/10" />
                        <button type="button"
                          onClick={() => { set('image', null); setImagePreview(null); }}
                          className="absolute top-2 right-2 bg-black/70 hover:bg-red-900/80 text-white w-7 h-7 flex items-center justify-center text-xs border border-white/20 transition-colors">
                          ✕
                        </button>
                      </div>
                    ) : (
                      <input type="file" accept="image/*" onChange={handleImage}
                        className={`${inputCls} file:mr-3 file:py-1 file:px-3 file:border file:border-white/20 file:bg-white/[0.06] file:text-white/50 file:text-xs file:cursor-pointer`} />
                    )}
                    {errors.image && <p className="text-red-400 text-xs mt-1.5">{errors.image}</p>}
                  </div>

                  {service === 'free' ? (
                    <button onClick={handleFreeSubmit} disabled={isLoading}
                      className="w-full py-4 border border-white/25 hover:border-white/50 hover:bg-white/[0.03] text-white font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm tracking-wide">
                      {isLoading ? 'Submitting…' : '📬 Submit Free →'}
                    </button>
                  ) : (
                    <button onClick={handleProceedToPayment} disabled={isLoading}
                      className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold transition-all transform hover:scale-[1.01] shadow-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none text-sm">
                      {isLoading ? 'Processing…' : 'Continue to Payment — $5 →'}
                    </button>
                  )}
                </div>
              )}

              {/* ── Genius Lyrics form ── */}
              {service === 'genius' && (
                <div className="space-y-5">

                  <div className="px-4 py-3.5 border border-yellow-500/20 bg-yellow-950/10 text-xs text-yellow-200/55 leading-relaxed">
                    📝 We'll post your lyrics to Genius.com on your behalf. Use section labels like [Verse 1], [Chorus], [Bridge] to format your lyrics. Your artist page on Genius must exist, or we'll create an entry for this song.
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className={labelCls}>Artist Name <span className="text-red-400">*</span></label>
                      <input name="artist_name" value={form.artist_name} onChange={handle}
                        placeholder="Exactly as on Genius.com" className={inputCls} />
                      {errors.artist_name && <p className="text-red-400 text-xs mt-1.5">{errors.artist_name}</p>}
                    </div>
                    <div>
                      <label className={labelCls}>Email <span className="text-red-400">*</span></label>
                      <input name="email" type="email" value={form.email} onChange={handle}
                        placeholder="your@email.com" className={inputCls} />
                      {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email}</p>}
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Song Title <span className="text-red-400">*</span></label>
                    <input name="song_title" value={form.song_title} onChange={handle}
                      placeholder="Exact title as it should appear on Genius" className={inputCls} />
                    {errors.song_title && <p className="text-red-400 text-xs mt-1.5">{errors.song_title}</p>}
                  </div>

                  <div>
                    <label className={labelCls}>Song Link <span className="text-red-400">*</span></label>
                    <input name="genius_song_url" type="url" value={form.genius_song_url} onChange={handle}
                      placeholder="Spotify, Apple Music, YouTube, or existing Genius URL" className={inputCls} />
                    <p className="text-[10px] text-white/25 mt-1.5">A link to your song so we can identify it</p>
                    {errors.genius_song_url && <p className="text-red-400 text-xs mt-1.5">{errors.genius_song_url}</p>}
                  </div>

                  <div>
                    <label className={labelCls}>Lyrics <span className="text-red-400">*</span></label>
                    <textarea name="genius_lyrics" value={form.genius_lyrics} onChange={handle}
                      placeholder={"[Verse 1]\nYour lyrics here...\n\n[Chorus]\nChorus lyrics here...\n\n[Verse 2]\n..."}
                      rows={18} className={`${inputCls} resize-y font-mono text-xs leading-relaxed`} />
                    <div className="flex justify-between items-center mt-1.5">
                      {errors.genius_lyrics
                        ? <p className="text-red-400 text-xs">{errors.genius_lyrics}</p>
                        : <p className="text-[10px] text-white/25">Format with [Verse 1], [Chorus], [Bridge] labels</p>}
                      <span className={`text-[10px] font-mono ${form.genius_lyrics.length >= 100 ? 'text-green-400' : 'text-white/25'}`}>
                        {form.genius_lyrics.length}
                      </span>
                    </div>
                  </div>

                  <button onClick={handleProceedToPayment} disabled={isLoading}
                    className="w-full py-4 border border-yellow-500/40 hover:border-yellow-400 hover:bg-yellow-500/10 text-yellow-400 hover:text-yellow-300 font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm">
                    {isLoading ? 'Processing…' : 'Continue to Payment — $10 →'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ═══════════ STEP 3: PAYMENT ═══════════ */}
          {step === 3 && clientSecret && (
            <div className="max-w-md">
              <button onClick={() => setStep(2)}
                className="flex items-center gap-2 text-white/35 hover:text-white/65 text-sm mb-6 transition-colors">
                ← Back to Details
              </button>

              <div className="border border-white/10 bg-white/[0.02] p-7">
                {/* Order summary */}
                <div className="flex items-center justify-between pb-5 mb-5 border-b border-white/[0.07]">
                  <div>
                    <p className="text-sm font-bold text-white">
                      {service === 'priority' ? '⚡ Skip the Line' : '📝 Genius Lyrics'}
                    </p>
                    <p className="text-white/30 text-xs mt-0.5">Secure payment via Stripe</p>
                  </div>
                  <span className="text-2xl font-black text-white">${PRICE[service]}</span>
                </div>

                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm form={form} service={service} onSuccess={() => setStep(4)} />
                </Elements>
              </div>
            </div>
          )}

        </div>
      </div>
      <Footer />
    </div>
  );
}
