"use client";

interface NavigationProps {
  onGetStarted: () => void;
  isAuthenticated?: boolean;
}

export default function Navigation({ onGetStarted, isAuthenticated }: NavigationProps) {
  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-8 h-8 bg-black rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a href="#" className="text-gray-900 hover:text-gray-600 px-3 py-2 text-sm font-medium transition-colors">
                Home
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">
                Sessions
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">
                About
              </a>
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={onGetStarted}
              className="bg-black text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              {isAuthenticated ? "Go to Dashboard" : "Get Started"}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}