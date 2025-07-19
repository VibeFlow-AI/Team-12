"use client";

import SessionCard from "@/components/welcome/session-card";

const sessionsData = [
  {
    id: 1,
    instructor: "Rahul Lavan",
    location: "Colombo",
    initials: "RL",
    initialsColor: "bg-blue-500",
    subjects: ["Science", "Physics", "Biology"],
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled",
    duration: "30 mins - 1 hour",
    language: "English, Tamil",
  },
  {
    id: 2,
    instructor: "Chathum Rahal",
    location: "Galle",
    initials: "CR",
    initialsColor: "bg-orange-500",
    subjects: ["Mathematics", "History", "English"],
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled",
    duration: "1 hour",
    language: "English",
  },
  {
    id: 3,
    instructor: "Malsha Fernando",
    location: "Colombo",
    initials: "MI",
    initialsColor: "bg-pink-500",
    subjects: ["Chemistry", "Art", "Commerce"],
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled",
    duration: "1 hour",
    language: "Sinhala",
  },
];

export default function SessionHighlights() {
  return (
    <section className="py-8 sm:py-12 lg:py-16 relative overflow-hidden">
      {/* Gradient Background Circles - From Sides */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-gradient-radial from-green-300/40 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-0 -right-32 w-80 h-80 bg-gradient-radial from-blue-300/40 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-48 w-72 h-72 bg-gradient-radial from-purple-300/40 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12 max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
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
              {sessionsData.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          </div>
        </div>

        {/* Load More Button */}
        <div className="text-center">
          <button
            type="button"
            className="px-8 py-2 border border-gray-300 rounded hover:bg-white/50 bg-transparent"
          >
            Load More Sessions
          </button>
        </div>
      </div>
    </section>
  );
}
