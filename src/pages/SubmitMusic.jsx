import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import Footer from "../components/Footer";

const API_URL = import.meta.env.VITE_API_URL;
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Payment form component
function CheckoutForm({ formData, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      setMessage(error.message);
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Payment successful, save submission
      try {
        const response = await fetch(`${API_URL}/api/submissions/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            payment_id: paymentIntent.id,
          }),
        });

        if (response.ok) {
          onSuccess();
        } else {
          setMessage('Payment successful but failed to save submission. Please contact support.');
        }
      } catch (err) {
        setMessage('Payment successful but failed to save submission. Please contact support.');
      }
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      {message && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isProcessing ? '💳 Processing...' : `💳 Pay $${formData.submission_type === 'featured' ? '7' : '5'} & Submit`}
      </button>
    </form>
  );
}

export default function SubmitMusic() {
  const [step, setStep] = useState(1); // 1: Pricing, 2: Form, 3: Payment, 4: Success
  const [formData, setFormData] = useState({
    artist_name: '',
    email: '',
    content: '',
    youtube_url: '',
    spotify_url: '',
    submission_type: '' // 'regular' or 'featured'
  });
  const [clientSecret, setClientSecret] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.artist_name.trim()) {
      newErrors.artist_name = 'Artist name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.trim().length < 300) {
      newErrors.content = 'Content must be at least 300 characters';
    } else if (formData.content.trim().length > 800) {
      newErrors.content = 'Content must not exceed 800 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProceedToPayment = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Create payment intent
      const response = await fetch(`${API_URL}/api/submissions/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setClientSecret(data.clientSecret);
        setStep(3);
      } else {
        alert('Failed to initialize payment. Please try again.');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setStep(4);
  };

  const handleSelectPlan = (type) => {
    setFormData(prev => ({ ...prev, submission_type: type }));
    setStep(2);
  };

  if (step === 4) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-2xl w-full text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              {formData.submission_type === 'featured' ? '🏆 Featured ' : '📰 '}Submission Received!
            </h1>
            <p className="text-white/80 text-lg mb-8">
              Thank you for your {formData.submission_type === 'featured' ? 'featured ' : ''}submission! We'll review your music and get back to you soon at <strong>{formData.email}</strong>
            </p>
            {formData.submission_type === 'featured' && (
              <div className="mb-8 p-4 bg-purple-900/40 border border-purple-500/30 rounded-lg">
                <p className="text-white/80 text-sm">
                  🌟 Your article will be featured on the homepage hero section for maximum visibility!
                </p>
              </div>
            )}
            <button
              onClick={() => window.location.href = '/'}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg"
            >
              Back to Home
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex-1">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Submit Your Music
            </h1>
            <div className="h-1 w-32 bg-gradient-to-r from-purple-500 to-pink-500"></div>
            <p className="text-white/70 mt-4 text-lg">
              Get your music featured on Cry808 for just $5
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Step 1: Pricing Selection */}
          {step === 1 && (
            <>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Choose Your Package</h2>
                <p className="text-white/70">Select the best option for your music promotion</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-12">
                {/* Regular Article */}
                <div className="bg-white/5 border border-white/20 rounded-2xl p-8 hover:border-purple-500/50 transition-all">
                  <div className="text-center mb-6">
                    <div className="text-5xl mb-4">📰</div>
                    <h3 className="text-2xl font-bold mb-2">Regular Article</h3>
                    <div className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      $5
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8 text-white/80">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Full article with your content
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Spotify embed integration
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      YouTube embed integration
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Listed in article grid
                    </li>
                  </ul>

                  <button
                    onClick={() => handleSelectPlan('regular')}
                    className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold rounded-lg transition-all"
                  >
                    Select Regular
                  </button>
                </div>

                {/* Featured Article */}
                <div className="bg-gradient-to-b from-purple-900/40 to-pink-900/40 border-2 border-purple-500/50 rounded-2xl p-8 relative hover:border-purple-400 transition-all">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                    ⭐ POPULAR
                  </div>

                  <div className="text-center mb-6">
                    <div className="text-5xl mb-4">🏆</div>
                    <h3 className="text-2xl font-bold mb-2">Featured Article</h3>
                    <div className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      $7
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8 text-white/80">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <strong>Hero placement on homepage</strong>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Full article with your content
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Spotify embed integration
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      YouTube embed integration
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <strong>Maximum visibility & promotion</strong>
                    </li>
                  </ul>

                  <button
                    onClick={() => handleSelectPlan('featured')}
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg"
                  >
                    Select Featured
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Step 2: Form */}
          {step === 2 && (
            <>
              {/* Selected Plan Banner */}
              <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-500/30 rounded-2xl p-6 mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-1">
                      {formData.submission_type === 'featured' ? '🏆 Featured Article' : '📰 Regular Article'}
                    </h3>
                    <p className="text-white/70">
                      {formData.submission_type === 'featured'
                        ? 'Hero placement + full promotion for $7'
                        : 'Full article with embeds for $5'}
                    </p>
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="text-purple-400 hover:text-purple-300 text-sm underline"
                  >
                    Change Plan
                  </button>
                </div>
              </div>

              {/* Submission Form */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
                <h2 className="text-2xl font-bold mb-6">Submission Details</h2>

                <div className="space-y-6">
                  {/* Artist Name */}
                  <div>
                    <label className="block text-white/90 font-semibold mb-2">
                      Artist Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="artist_name"
                      value={formData.artist_name}
                      onChange={handleInputChange}
                      placeholder="Your artist name"
                      className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    {errors.artist_name && <p className="mt-2 text-red-400 text-sm">{errors.artist_name}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-white/90 font-semibold mb-2">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    {errors.email && <p className="mt-2 text-red-400 text-sm">{errors.email}</p>}
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-white/90 font-semibold mb-2">
                      Article Content <span className="text-red-400">*</span>
                    </label>
                    <p className="text-white/60 text-sm mb-2">
                      Write about your music, tell your story, describe the sound (300-800 words)
                    </p>
                    <textarea
                      name="content"
                      value={formData.content}
                      onChange={handleInputChange}
                      placeholder="Tell us about your music..."
                      rows="8"
                      className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    ></textarea>
                    <div className="flex justify-between items-center mt-2">
                      {errors.content && <p className="text-red-400 text-sm">{errors.content}</p>}
                      <p className={`text-sm ml-auto ${
                        formData.content.length < 300 ? 'text-white/40' :
                        formData.content.length > 800 ? 'text-red-400' :
                        'text-green-400'
                      }`}>
                        {formData.content.length} / 800 characters
                      </p>
                    </div>
                  </div>

                  {/* YouTube URL */}
                  <div>
                    <label className="block text-white/90 font-semibold mb-2">
                      YouTube Link
                    </label>
                    <input
                      type="url"
                      name="youtube_url"
                      value={formData.youtube_url}
                      onChange={handleInputChange}
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {/* Spotify URL */}
                  <div>
                    <label className="block text-white/90 font-semibold mb-2">
                      Spotify Link
                    </label>
                    <input
                      type="url"
                      name="spotify_url"
                      value={formData.spotify_url}
                      onChange={handleInputChange}
                      placeholder="https://open.spotify.com/track/..."
                      className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <button
                    onClick={handleProceedToPayment}
                    disabled={isLoading}
                    className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? 'Processing...' : 'Proceed to Payment →'}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Step 3: Payment */}
          {step === 3 && clientSecret && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
              <div className="mb-6">
                <button
                  onClick={() => setStep(2)}
                  className="text-white/70 hover:text-white flex items-center gap-2 mb-4"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Form
                </button>
                <h2 className="text-2xl font-bold mb-2">Complete Payment</h2>
                <p className="text-white/70">
                  Secure payment powered by Stripe
                </p>
              </div>

              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm formData={formData} onSuccess={handlePaymentSuccess} />
              </Elements>
            </div>
          )}

          {/* Disclaimer */}
          <section className="mb-12">
            <div className="bg-white/5 border border-white/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-3">📋 Important Notice</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Your $5 payment guarantees that your submission will be reviewed by our editorial team. We carefully curate content that aligns with our platform's vision. All submissions receive consideration, and we'll notify you of our decision via email within 5-7 business days. Payment is non-refundable, regardless of publication decision.
              </p>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
