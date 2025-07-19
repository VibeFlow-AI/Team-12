"use client";

interface HeroSectionProps {
  onGetStarted: () => void;
}

export default function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <section className="gradient-bg min-h-screen flex items-center relative overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Empowering Students<br />
              with Personalized<br />
              Mentorship
              <span className="inline-block ml-2">
                <svg className="w-12 h-12 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                </svg>
              </span>
            </h1>
            <p className="text-lg text-gray-600 max-w-md leading-relaxed">
              EduVibe connects students with experienced mentors to guide them through their academic journey.
            </p>
            <button
              onClick={onGetStarted}
              className="bg-black text-white px-8 py-4 rounded-lg text-base font-medium hover:bg-gray-800 transition-colors shadow-lg"
            >
              Get Started
            </button>
          </div>

          {/* Right Content - Mentor Bubbles */}
          <div className="relative h-96 lg:h-[500px]">
            {/* Main central bubble */}
            <div className="absolute top-20 left-8 transition-all duration-300 ease-out hover:scale-105 animate-float">
              <div className="w-32 h-32 rounded-full overflow-hidden shadow-xl border-4 border-white">
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">JD</span>
                </div>
              </div>
            </div>

            {/* Top right bubble */}
            <div className="absolute top-0 right-12 transition-all duration-300 ease-out hover:scale-105 animate-float-delay-2">
              <div className="w-20 h-20 rounded-full overflow-hidden shadow-lg border-2 border-white">
                <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-lg font-bold">SA</span>
                </div>
              </div>
            </div>

            {/* Large right bubble */}
            <div className="absolute top-16 right-0 transition-all duration-300 ease-out hover:scale-105 animate-float-delay-4">
              <div className="w-28 h-28 rounded-full overflow-hidden shadow-xl border-4 border-white">
                <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                  <span className="text-white text-xl font-bold">MK</span>
                </div>
              </div>
            </div>

            {/* Bottom left large bubble */}
            <div className="absolute bottom-20 left-0 transition-all duration-300 ease-out hover:scale-105 animate-float">
              <div className="w-36 h-36 rounded-full overflow-hidden shadow-xl border-4 border-white">
                <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">AR</span>
                </div>
              </div>
            </div>

            {/* Center right bubble */}
            <div className="absolute top-32 right-8 transition-all duration-300 ease-out hover:scale-105 animate-float-delay-3">
              <div className="w-24 h-24 rounded-full overflow-hidden shadow-lg border-2 border-white">
                <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center">
                  <span className="text-white text-lg font-bold">TC</span>
                </div>
              </div>
            </div>

            {/* Bottom right bubble */}
            <div className="absolute bottom-8 right-4 transition-all duration-300 ease-out hover:scale-105 animate-float-delay-2">
              <div className="w-20 h-20 rounded-full overflow-hidden shadow-lg border-2 border-white">
                <div className="w-full h-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
                  <span className="text-white text-lg font-bold">DM</span>
                </div>
              </div>
            </div>

            {/* Small bottom bubble */}
            <div className="absolute bottom-4 left-20 transition-all duration-300 ease-out hover:scale-105 animate-float-delay-4">
              <div className="w-16 h-16 rounded-full overflow-hidden shadow-lg border-2 border-white">
                <div className="w-full h-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">LW</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}