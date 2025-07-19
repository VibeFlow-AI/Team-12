"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Search,
  LayoutDashboard,
  Calendar,
  BookmarkIcon,
  MessageSquare,
  Settings,
  User,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

const navigationItems = [
  {
    name: "Discover",
    href: "/dashboard/discover",
    icon: Search,
    description: "Find mentors"
  },
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Overview"
  },
  {
    name: "Sessions",
    href: "/dashboard/sessions",
    icon: Calendar,
    description: "Booked sessions"
  },
  {
    name: "Bookmarks",
    href: "/dashboard/bookmarks",
    icon: BookmarkIcon,
    description: "Saved mentors"
  },
  {
    name: "Messages",
    href: "/dashboard/messages",
    icon: MessageSquare,
    description: "Chat with mentors"
  },
  {
    name: "Profile",
    href: "/dashboard/profile",
    icon: User,
    description: "Your profile"
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    description: "Preferences"
  }
];

const bottomItems = [
  {
    name: "Help",
    href: "/dashboard/help",
    icon: HelpCircle,
    description: "Support"
  }
];

export default function Sidebar({ className }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isActive = (href: string) => {
    if (href === "/dashboard/discover" && pathname === "/samples") return true;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <aside 
      className={cn(
        "group/sidebar bg-white border-r border-neutral-200 transition-all duration-300 ease-in-out flex flex-col relative z-10",
        isExpanded ? "w-64" : "w-16 lg:w-20",
        className
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Header */}
      <div className="p-4 border-b border-neutral-100">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">E</span>
          </div>
          <div className={cn(
            "ml-3 transition-all duration-300",
            isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"
          )}>
            <h2 className="font-bold text-neutral-900 text-lg whitespace-nowrap">EduVibe</h2>
            <p className="text-neutral-500 text-xs whitespace-nowrap">Student Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.name}
              href={item.href === "/dashboard/discover" ? "/samples" : item.href}
              className={cn(
                "flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                "hover:bg-neutral-50 hover:translate-x-1",
                active && "bg-neutral-100 shadow-sm",
                active && "before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-black before:rounded-r-full"
              )}
            >
              <Icon 
                className={cn(
                  "w-5 h-5 flex-shrink-0 transition-colors duration-200",
                  active ? "text-black" : "text-neutral-500 group-hover:text-neutral-700"
                )}
              />
              <div className={cn(
                "ml-3 transition-all duration-300",
                isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"
              )}>
                <span className={cn(
                  "font-medium text-sm whitespace-nowrap transition-colors duration-200",
                  active ? "text-black" : "text-neutral-700"
                )}>
                  {item.name}
                </span>
                <p className="text-neutral-500 text-xs whitespace-nowrap">
                  {item.description}
                </p>
              </div>

              {/* Tooltip for collapsed state */}
              {!isExpanded && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-black text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-2 border-t border-neutral-100 space-y-1">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                "hover:bg-neutral-50 hover:translate-x-1",
                active && "bg-neutral-100 shadow-sm"
              )}
            >
              <Icon 
                className={cn(
                  "w-5 h-5 flex-shrink-0 transition-colors duration-200",
                  active ? "text-black" : "text-neutral-500 group-hover:text-neutral-700"
                )}
              />
              <div className={cn(
                "ml-3 transition-all duration-300",
                isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"
              )}>
                <span className={cn(
                  "font-medium text-sm whitespace-nowrap transition-colors duration-200",
                  active ? "text-black" : "text-neutral-700"
                )}>
                  {item.name}
                </span>
              </div>

              {!isExpanded && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-black text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}

        {/* User Profile */}
        <div className="pt-2 mt-2 border-t border-neutral-100">
          <div className="flex items-center px-3 py-2.5 rounded-xl hover:bg-neutral-50 transition-all duration-200 group cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xs">
                {session?.user?.name ? getInitials(session.user.name) : "U"}
              </span>
            </div>
            <div className={cn(
              "ml-3 transition-all duration-300",
              isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"
            )}>
              <span className="font-medium text-sm text-neutral-700 whitespace-nowrap block">
                {session?.user?.name || "User"}
              </span>
              <span className="text-neutral-500 text-xs whitespace-nowrap block capitalize">
                {session?.user?.role || "Student"}
              </span>
            </div>

            {!isExpanded && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-black text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                {session?.user?.name || "User Profile"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expand/Collapse Button */}
      <div className="absolute -right-3 top-8 bg-white border border-neutral-200 rounded-full p-1 shadow-md opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-5 h-5 flex items-center justify-center text-neutral-500 hover:text-neutral-700 transition-colors duration-200"
        >
          {isExpanded ? (
            <ChevronLeft className="w-3 h-3" />
          ) : (
            <ChevronRight className="w-3 h-3" />
          )}
        </button>
      </div>
    </aside>
  );
}