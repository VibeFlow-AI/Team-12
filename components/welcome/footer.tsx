"use client"; // Mark as client component for Framer Motion

import Link from "next/link";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="py-8 sm:py-12 lg:py-16 text-gray-700 relative z-10"
    >
      {/* Glass Effect Background */}
      <div className="absolute inset-0 bg-white/30 backdrop-blur-lg border-t border-white/20 shadow-lg"></div>

      <div className="relative z-20 w-full px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8">
          {/* Logo/Brand Name */}
          <div className="text-lg font-bold text-gray-900">EduVibe</div>

          {/* Navigation Links */}
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm sm:text-base">
            <Link href="#" className="hover:text-gray-900 transition-colors">
              About Us
            </Link>
            <Link href="#" className="hover:text-gray-900 transition-colors">
              Services
            </Link>
            <Link href="#" className="hover:text-gray-900 transition-colors">
              Mentors
            </Link>
            <Link href="#" className="hover:text-gray-900 transition-colors">
              Students
            </Link>
            <Link href="#" className="hover:text-gray-900 transition-colors">
              Contact
            </Link>
          </nav>

          {/* Copyright */}
          <div className="text-sm text-center md:text-right">
            &copy; {new Date().getFullYear()} EduVibe. All rights reserved.
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
