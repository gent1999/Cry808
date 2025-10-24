import React from "react";
import Footer from "../components/Footer";

export default function SubmitMusic() {
  const contactEmail = "network.sapient@gmail.com";

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
              Get your music featured on Cry808 - Share your latest tracks, albums, and music videos with our audience
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Email Submission CTA */}
          <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-500/30 rounded-2xl p-8 md:p-12 mb-12">
            <div className="text-center">
              <div className="text-6xl mb-6">🎵</div>
              <h2 className="text-3xl font-bold mb-4">Ready to Share Your Sound?</h2>
              <p className="text-white/80 text-lg mb-6">
                Email your submission to get featured on Cry808
              </p>
              <a
                href={`mailto:${contactEmail}?subject=Music Submission`}
                className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg text-lg"
              >
                📧 Email Your Submission
              </a>
              <p className="text-white/60 mt-4 text-sm">
                Send to: <span className="text-purple-400 font-medium">{contactEmail}</span>
              </p>
            </div>
          </div>

          {/* Submission Guidelines */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-6">Submission Guidelines</h2>

            <div className="space-y-6">
              {/* What to Include */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-purple-400 mb-4 flex items-center">
                  <span className="text-2xl mr-3">✅</span>
                  Required Information in Your Email
                </h3>
                <ul className="space-y-3 text-white/80">
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-3">1.</span>
                    <span><strong className="text-white">Artist Name:</strong> Your name or artist name as you want it credited</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-3">2.</span>
                    <span><strong className="text-white">Article/Interview Content:</strong> Write about your music, tell your story, describe the sound, explain the inspiration, and include any relevant background (300-800 words).</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-3">3.</span>
                    <span><strong className="text-white">YouTube Link:</strong> Direct link to your music video or audio on YouTube (1 song/album)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-3">4.</span>
                    <span><strong className="text-white">Spotify Link:</strong> Direct link to your track, album, or artist profile on Spotify (1 song/album)</span>
                  </li>
                </ul>
                <div className="mt-4 p-4 bg-purple-600/20 border border-purple-500/30 rounded-lg">
                  <p className="text-white/90 text-sm">
                    <strong>💡 Tip:</strong> Use the subject line "Music Submission - [Your Artist Name]" to help us process your submission faster.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Disclaimer */}
          <section className="mb-12">
            <div className="bg-white/5 border border-white/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-3">📋 Important Notice</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Submitting your music does not guarantee a review or feature on Cry808. We receive a high volume of submissions and carefully curate content that aligns with our editorial vision. If your music isn't featured, it's not a reflection of quality - it simply means it may not be the right fit at this time. We appreciate all artists who share their work with us and encourage you to keep creating.
              </p>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
