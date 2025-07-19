"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Subject {
  text: string;
  bgColor: string;
  textColor: string;
}

interface Mentor {
  initials: string;
  name: string;
  color: string;
  subjects: Subject[];
  duration: string;
  languages: string;
  description: string;
}

export default function HighlightsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetch("/api/highlights")
      .then((res) => res.json())
      .then((data: Mentor[]) => setMentors(data));
  }, []);

  const visibleMentors = showAll ? mentors : mentors.slice(0, 1);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Mentor Highlights</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {visibleMentors.map((mentor, index) => (
          <div key={index} className="bg-white shadow-lg rounded-xl p-5">
            <div className="flex items-center gap-4 mb-4">
              <div
                className={`w-12 h-12 flex items-center justify-center text-white font-bold rounded-full ${mentor.color}`}
              >
                {mentor.initials}
              </div>
              <div>
                <p className="text-lg font-semibold">{mentor.name}</p>
                <p className="text-sm text-gray-500">
                  {mentor.duration} · {mentor.languages}
                </p>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-3">{mentor.description}</p>

            <div className="flex flex-wrap gap-2">
              {mentor.subjects.map((subject, i) => (
                <span
                  key={i}
                  className={`text-xs font-medium px-2.5 py-0.5 rounded ${subject.bgColor} ${subject.textColor}`}
                >
                  {subject.text}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* External Button Section */}
      <div className="mt-8 flex justify-center">
        <Link
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setShowAll(!showAll);
          }}
          className="text-blue-600 hover:underline font-medium text-sm"
        >
          {showAll ? "Show Less" : "Load More"}
        </Link>
      </div>
    </div>
  );
}
