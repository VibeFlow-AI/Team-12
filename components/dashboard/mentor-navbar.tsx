"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Home,
  User,
  LogOut,
  Bell,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";

export default function MentorNavbar() {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-neutral-200 sticky top-0 z-50 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
            
            <Link href="/mentor/dashboard" className="flex items-center group">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-black rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
                <span className="text-white font-bold text-lg md:text-xl">E</span>
              </div>
              <span className="ml-3 text-xl font-bold text-neutral-900 hidden md:block">
                EduVibe
              </span>
            </Link>
          </div>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8 lg:space-x-12">
            <Link 
              href="/mentor/dashboard" 
              className="nav-link text-neutral-900 hover:text-neutral-600 px-3 py-2 text-sm lg:text-base font-medium relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-black after:transition-all hover:after:w-full"
            >
              Dashboard
            </Link>
            <Link 
              href="/mentor/sessions" 
              className="nav-link text-neutral-500 hover:text-neutral-900 px-3 py-2 text-sm lg:text-base font-medium relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-black after:transition-all hover:after:w-full"
            >
              Sessions
            </Link>
            <Link 
              href="/mentor/profile" 
              className="nav-link text-neutral-500 hover:text-neutral-900 px-3 py-2 text-sm lg:text-base font-medium relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-black after:transition-all hover:after:w-full"
            >
              Profile
            </Link>
          </div>
          
          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative p-2 hover:bg-neutral-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-neutral-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-neutral-900">
                  {session?.user?.name}
                </p>
                <p className="text-xs text-neutral-500">Mentor</p>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-neutral-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              href="/mentor/dashboard"
              className="block px-3 py-2 rounded-md text-base font-medium text-neutral-900 hover:bg-neutral-100"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/mentor/sessions"
              className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:bg-neutral-100"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Sessions
            </Link>
            <Link
              href="/mentor/profile"
              className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:bg-neutral-100"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Profile
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}