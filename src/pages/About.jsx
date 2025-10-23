import React from 'react';
import Footer from '../components/Footer';

const About = () => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex-1">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black"></div>
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              About Cry808
            </h1>
            <div className="h-1 w-32 bg-gradient-to-r from-purple-500 to-pink-500"></div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Card 1 */}
            <div className="border border-white/10 rounded-lg p-8 hover:border-purple-500/50 transition-all duration-300 bg-white/5 backdrop-blur-sm">
              <p className="text-lg text-white/90 leading-relaxed">
                Cry808 is an emerging online platform dedicated to showcasing the <span className="text-purple-400 font-semibold">raw emotion</span>, <span className="text-purple-400 font-semibold">innovation</span>, and <span className="text-purple-400 font-semibold">underground pulse</span> of the new wave music scene. From PluggnB and Hyperpop to Alternative Rap and beyond, we bring attention to the artists shaping the next generation of sound.
              </p>
            </div>

            {/* Card 2 */}
            <div className="border border-white/10 rounded-lg p-8 hover:border-purple-500/50 transition-all duration-300 bg-white/5 backdrop-blur-sm">
              <p className="text-lg text-white/90 leading-relaxed">
                Founded with a passion for uncovering tomorrow's music, Cry808 exists to highlight creators who <span className="text-pink-400 font-semibold">push boundaries</span>. Whether they are redefining trap melodies, experimenting with dreamy synth textures, or blending rap with soulful vulnerability, we amplify the voices driving this cultural shift.
              </p>
            </div>

            {/* Card 3 */}
            <div className="border border-white/10 rounded-lg p-8 hover:border-purple-500/50 transition-all duration-300 bg-white/5 backdrop-blur-sm">
              <p className="text-lg text-white/90 leading-relaxed">
                At Cry808, we curate stories, music drops, and creative movements that capture the connection between <span className="text-purple-400 font-semibold">internet culture</span> and <span className="text-purple-400 font-semibold">artistry</span>. Our readers are not just fans. They are part of a digital community united by emotion, creativity, and a shared love for authentic expression.
              </p>
            </div>

            {/* Card 4 */}
            <div className="border border-white/10 rounded-lg p-8 hover:border-purple-500/50 transition-all duration-300 bg-white/5 backdrop-blur-sm">
              <p className="text-lg text-white/90 leading-relaxed">
                Cry808 is more than a blog. It is a <span className="text-pink-400 font-semibold">growing hub</span> for listeners, creators, and producers building the future of sound. As the culture evolves, we remain committed to documenting, supporting, and celebrating the artists who inspire change.
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="text-center p-6 border border-purple-500/30 rounded-lg bg-gradient-to-b from-purple-900/20 to-transparent">
              <div className="text-4xl font-bold text-purple-400 mb-2">New Wave</div>
              <div className="text-sm text-white/70">Music Scene</div>
            </div>
            <div className="text-center p-6 border border-pink-500/30 rounded-lg bg-gradient-to-b from-pink-900/20 to-transparent">
              <div className="text-4xl font-bold text-pink-400 mb-2">Community</div>
              <div className="text-sm text-white/70">Driven Platform</div>
            </div>
            <div className="text-center p-6 border border-purple-500/30 rounded-lg bg-gradient-to-b from-purple-900/20 to-transparent">
              <div className="text-4xl font-bold text-purple-400 mb-2">Future</div>
              <div className="text-sm text-white/70">Of Sound</div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default About;
