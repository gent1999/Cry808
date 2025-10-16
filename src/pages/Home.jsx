import React from "react";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8">Latest Hip-Hop News</h1>

        {/* Placeholder content */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition">
            <h2 className="text-xl font-semibold mb-2">Article Title</h2>
            <p className="text-white/70 text-sm">Article preview text goes here...</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition">
            <h2 className="text-xl font-semibold mb-2">Article Title</h2>
            <p className="text-white/70 text-sm">Article preview text goes here...</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition">
            <h2 className="text-xl font-semibold mb-2">Article Title</h2>
            <p className="text-white/70 text-sm">Article preview text goes here...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
