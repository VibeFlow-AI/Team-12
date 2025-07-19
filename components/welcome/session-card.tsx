"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bookmark } from "lucide-react";

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

interface SessionCardProps {
  session: Session;
}

export default function SessionCard({ session }: SessionCardProps) {
  return (
    <div className="relative">
      {/* Main Card */}
      <Card className="bg-gray-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 pb-20 relative overflow-hidden">
        <CardContent className="p-6">
          {/* Instructor Info */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`w-12 h-12 ${session.initialsColor} rounded-lg flex items-center justify-center`}
            >
              <span className="text-white font-bold text-lg">
                {session.initials}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {session.instructor}
              </h3>
              <p className="text-sm text-gray-600">{session.location}</p>
            </div>
          </div>

          {/* Subject Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {session.subjects.map((subject, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full font-medium"
              >
                {subject}
              </span>
            ))}
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            {session.description}
          </p>

          {/* Session Details */}
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700">Duration:</span>
              <span className="text-gray-600">{session.duration}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700">
                Preferred Language:
              </span>
              <span className="text-gray-600">{session.language}</span>
            </div>
          </div>
        </CardContent>

        {/* Curved Cutout */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gray-50">
          <svg
            className="absolute top-0 left-0 w-full h-8"
            viewBox="0 0 400 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 32V16C50 0 100 0 150 8C200 16 250 16 300 8C350 0 400 0 400 16V32H0Z"
              fill="white"
            />
          </svg>
        </div>
      </Card>

      {/* Action Buttons - Outside the card */}
      <div className="absolute bottom-0 left-0 right-0 p-4 rounded-b-2xl shadow-lg">
        <div className="flex items-center gap-3">
          <Button className="flex-1 bg-gray-900 hover:bg-gray-800 text-white">
            Book a session
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="border-gray-300 hover:bg-gray-50 bg-transparent"
          >
            <Bookmark className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
