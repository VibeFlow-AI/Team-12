"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

interface NavigationProps {
  onGetStarted: () => void;
  isAuthenticated?: boolean;
}

export default function Navigation({
  onGetStarted,
  isAuthenticated,
}: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const buttonHref = isAuthenticated ? "/dashboard" : "/auth/signin";
  const buttonText = isAuthenticated ? "Go to Dashboard" : "Get Started";

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8">
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 rounded-b-2xl shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 rounded-md flex items-center justify-center">
                  <Image
                    src="/logo/logo.png"
                    alt="Logo"
                    width={32}
                    height={32}
                    className="w-6 h-6"
                  />
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="flex items-center space-x-8">
                <a
                  href="#"
                  className="text-gray-900 hover:text-gray-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Home
                </a>
                <a
                  href="#session-highlights"
                  className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Sessions
                </a>
                <a
                  href="#about"
                  className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
                >
                  About
                </a>
              </div>
            </div>

            {/* Desktop Get Started Button */}
            <div className="hidden md:flex items-center">
              <Link
                href={buttonHref}
                className="bg-black text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                {buttonText}
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                className="text-gray-500 hover:text-gray-900 p-2 rounded-md transition-colors"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <div className="flex flex-col space-y-3">
                <a
                  href="#"
                  className="text-gray-900 hover:text-gray-600 px-3 py-2 text-sm font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </a>
                <a
                  href="#session-highlights"
                  className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sessions
                </a>
                <a
                  href="#about"
                  className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </a>
                <div className="pt-2">
                  <Link
                    href={buttonHref}
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-center bg-black text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    {buttonText}
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}
