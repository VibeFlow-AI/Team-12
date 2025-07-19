"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Bell, MessageSquare } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-neutral-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          <div className="flex items-center">
            <Link href="/" className="flex items-center group">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-black rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
                <span className="text-white font-bold text-lg md:text-xl">E</span>
              </div>
              <span className="ml-3 text-xl md:text-2xl font-bold text-neutral-900 hidden sm:block">
                EduVibe
              </span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            
            {/* Messages */}
            <button className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors">
              <MessageSquare className="w-5 h-5" />
            </button>
            
            {/* User Profile */}
            <div className="flex items-center space-x-3">
              {session?.user && (
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-sm font-medium text-neutral-900">
                    {session.user.name}
                  </span>
                  <span className="text-xs text-neutral-500 capitalize">
                    {session.user.role}
                  </span>
                </div>
              )}
              
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {session?.user?.name ? getInitials(session.user.name) : "U"}
                </span>
              </div>
            </div>
            
            <button
              onClick={() => signOut({ callbackUrl: window.location.origin })}
              className="bg-black hover:bg-neutral-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}