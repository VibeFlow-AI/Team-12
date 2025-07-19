"use client";

import { useEffect, useState } from "react";
import SessionCard from "@/components/welcome/session-card";

interface Session {
  id: number;
  instructor: string;
  location: string;
  initials: string;
  initialsColor: string;
  subjects: string[];
  description: string;
  duration: string;
  language: string;
}

export default function SessionHighlights() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [limit, setLimit] = useState(3);
  const [loading, setLoading] = useState(false);

  const fetchSessions = async (limit: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/highlight?limit=${limit}`);
      if (!res.ok) throw new Error("Failed to fetch sessions");
      const data = await res.json();
      setSessions(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions(limit);
  }, [limit]);

  const toggleLoadMore = () => {
    if (limit === 3) setLimit(6);
    else setLimit(3);
  };

  return (
    <section
      className="py-8 sm:py-12 lg:py-16 relative overflow-hidden"
      id="session-highlights"
    >
      {/* Gradient Background Circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-gradient-radial from-green-300/40 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-0 -right-32 w-80 h-80 bg-gradient-radial from-blue-300/40 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-48 w-72 h-72 bg-gradient-radial from-purple-300/40 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12 max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-medium text-gray-900 mb-4 sm:mb-6">
            Session Highlights – Trending Now
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed">
            Join the sessions students are raving about. These expert-led,
            high-impact sessions are designed to help you unlock your full
            potential whether you're polishing your resume, mapping out your
            career path, or getting ready to ace technical interviews.
          </p>
        </div>

        {/* Session Cards */}
        <div className="w-full flex justify-center mb-8 sm:mb-10">
          <div className="w-full max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sessions.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          </div>
        </div>

        {/* Load More Button */}
        <div className="text-center">
          <button
            type="button"
            onClick={toggleLoadMore}
            disabled={loading}
            className="px-8 py-2 border border-gray-300 rounded hover:bg-white/50 bg-transparent disabled:opacity-50"
          >
            {loading
              ? "Loading..."
              : limit === 3
                ? "Load More Sessions"
                : "Show Less"}
          </button>
        </div>
      </div>
    </section>
  );
}
