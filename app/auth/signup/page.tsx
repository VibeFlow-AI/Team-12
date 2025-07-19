"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [selectedRole, setSelectedRole] = useState<"mentor" | "student" | null>(null);

  useEffect(() => {
    // Redirect to dashboard if already authenticated
    if (session) {
      router.push("/samples");
    }
  }, [session, router]);

  const handleRoleSelection = (role: "mentor" | "student") => {
    setSelectedRole(role);
    router.push(`/auth/register?role=${role}`);
  };

  // Show loading while checking auth status
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  // Don't render if authenticated (will redirect)
  if (session) {
    return null;
  }

  return (
    <div className="font-sans antialiased bg-neutral-100 subtle-pattern min-h-screen">

      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            <Link href="/" className="flex items-center group">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-black rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
                <span className="text-white font-bold text-lg md:text-xl">E</span>
              </div>
            </Link>
            
            <div className="hidden md:flex items-center space-x-8 lg:space-x-12">
              <Link href="/" className="text-gray-900 hover:text-gray-600 px-3 py-2 text-sm lg:text-base font-medium">
                Home
              </Link>
              <Link href="#" className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm lg:text-base font-medium">
                About
              </Link>
            </div>
            
            <Link 
              href="/auth/signin"
              className="bg-black text-white px-4 py-2 md:px-6 md:py-3 rounded-lg text-sm md:text-base font-medium shadow-lg hover:bg-gray-800 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="w-full max-w-6xl mx-auto">
          {/* Decorative Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="animate-float absolute top-20 left-10 w-2 h-2 bg-gray-300 rounded-full opacity-40"></div>
            <div className="animate-float-delay-2 absolute top-40 right-20 w-3 h-3 bg-gray-400 rounded-full opacity-30"></div>
            <div className="animate-float-delay-4 absolute bottom-40 left-20 w-1.5 h-1.5 bg-gray-300 rounded-full opacity-50"></div>
            <div className="animate-float-delay-3 absolute bottom-20 right-10 w-2.5 h-2.5 bg-gray-400 rounded-full opacity-35"></div>
          </div>
          
          {/* Content Container */}
          <div className="relative z-10 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-8 md:mb-12 lg:mb-16 tracking-tight">
              Get Started
            </h1>
            
            {/* Cards Container */}
            <div className="grid md:grid-cols-2 gap-6 md:gap-8 lg:gap-12 max-w-4xl mx-auto">
              {/* Mentor Card */}
              <div 
                className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl lg:rounded-3xl p-6 md:p-8 lg:p-10 shadow-lg cursor-pointer transition-all duration-300 ease-out hover:bg-white/95 hover:-translate-y-2 hover:shadow-2xl hover:border-black/10"
                onClick={() => handleRoleSelection("mentor")}
              >
                <div className="space-y-6 md:space-y-8">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
                    Sign Up as a Mentor
                  </h2>
                  
                  <p className="text-gray-600 text-sm md:text-base lg:text-lg leading-relaxed">
                    Share your expertise and guide the next generation of learners. Make a meaningful impact while building your professional network.
                  </p>
                  
                  <button className="btn-primary w-full text-white px-6 py-3 md:py-4 rounded-xl md:rounded-2xl text-sm md:text-base lg:text-lg font-semibold shadow-lg">
                    Continue as a Mentor
                  </button>
                </div>
              </div>
              
              {/* Student Card */}
              <div 
                className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl lg:rounded-3xl p-6 md:p-8 lg:p-10 shadow-lg cursor-pointer transition-all duration-300 ease-out hover:bg-white/95 hover:-translate-y-2 hover:shadow-2xl hover:border-black/10"
                onClick={() => handleRoleSelection("student")}
              >
                <div className="space-y-6 md:space-y-8">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
                    </svg>
                  </div>
                  
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
                    Sign Up as a Student
                  </h2>
                  
                  <p className="text-gray-600 text-sm md:text-base lg:text-lg leading-relaxed">
                    Connect with experienced mentors who will guide you through your academic journey and help you achieve your goals.
                  </p>
                  
                  <button className="btn-primary w-full text-white px-6 py-3 md:py-4 rounded-xl md:rounded-2xl text-sm md:text-base lg:text-lg font-semibold shadow-lg">
                    Continue as a Student
                  </button>
                </div>
              </div>
            </div>
            
            {/* Additional Info */}
            <div className="mt-8 md:mt-12 lg:mt-16 text-center">
              <p className="text-gray-500 text-xs md:text-sm lg:text-base">
                Already have an account?{" "}
                <Link href="/auth/signin" className="text-gray-900 hover:text-gray-600 font-medium underline underline-offset-2 transition-colors">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}