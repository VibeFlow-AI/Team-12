"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  BookmarkIcon, 
  Clock, 
  Globe, 
  Star,
  MessageSquare,
  Calendar
} from "lucide-react";
import { toast } from "sonner";

interface MentorCardProps {
  mentor: {
    id: string;
    name: string;
    location: string;
    subjects: string[];
    bio: string;
    duration: string;
    languages: string[];
    rating?: number;
    totalSessions?: number;
    avatarColor: {
      from: string;
      to: string;
    };
    company?: string;
    role?: string;
    experience?: string;
    availability?: string[];
  };
  onBook: (mentor: any) => void;
  onBookmark: (mentorId: string) => void;
  isBookmarked?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const subjectColors = [
  "bg-blue-100 text-blue-800",
  "bg-green-100 text-green-800", 
  "bg-purple-100 text-purple-800",
  "bg-orange-100 text-orange-800",
  "bg-yellow-100 text-yellow-800",
  "bg-red-100 text-red-800",
  "bg-pink-100 text-pink-800",
  "bg-indigo-100 text-indigo-800",
  "bg-teal-100 text-teal-800"
];

export default function MentorCard({ 
  mentor, 
  onBook, 
  onBookmark, 
  isBookmarked = false,
  className,
  style
}: MentorCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [bookmarked, setBookmarked] = useState(isBookmarked);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleBookSession = () => {
    onBook(mentor);
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    onBookmark(mentor.id);
    toast.success(bookmarked ? "Mentor removed from bookmarks" : "Mentor bookmarked!");
  };

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden transition-all duration-500 hover:shadow-xl hover:-translate-y-2",
        "bg-white/90 backdrop-blur-sm border border-white/20 hover:border-black/10",
        "animate-in fade-in-50 slide-in-from-bottom-8 duration-700",
        className
      )}
      style={style}
    >
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300"
              style={{
                background: `linear-gradient(135deg, ${mentor.avatarColor.from}, ${mentor.avatarColor.to})`
              }}
            >
              {getInitials(mentor.name)}
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 text-lg group-hover:text-black transition-colors">
                {mentor.name}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-neutral-500">
                <Globe className="w-3 h-3" />
                <span>{mentor.location}</span>
                {mentor.rating && (
                  <>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span>{mentor.rating}</span>
                      {mentor.totalSessions && (
                        <span className="text-neutral-400">({mentor.totalSessions})</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleBookmark}
            className={cn(
              "p-2 rounded-lg border transition-all duration-300 hover:scale-110",
              bookmarked 
                ? "border-red-200 bg-red-50 text-red-500" 
                : "border-neutral-300 hover:border-neutral-400 text-neutral-500 hover:text-neutral-700"
            )}
          >
            <BookmarkIcon className={cn("w-4 h-4", bookmarked && "fill-current")} />
          </button>
        </div>

        {/* Professional Info */}
        {(mentor.company || mentor.role) && (
          <div className="mb-4 p-3 bg-neutral-50 rounded-lg">
            <div className="flex items-center space-x-2 text-sm">
              {mentor.role && (
                <span className="font-medium text-neutral-700">{mentor.role}</span>
              )}
              {mentor.company && mentor.role && <span className="text-neutral-400">at</span>}
              {mentor.company && (
                <span className="text-neutral-600">{mentor.company}</span>
              )}
            </div>
            {mentor.experience && (
              <div className="text-xs text-neutral-500 mt-1">
                {mentor.experience} experience
              </div>
            )}
          </div>
        )}

        {/* Subject Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {mentor.subjects.map((subject, index) => (
            <Badge
              key={subject}
              variant="secondary"
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 hover:scale-105",
                subjectColors[index % subjectColors.length]
              )}
            >
              {subject}
            </Badge>
          ))}
        </div>

        {/* Bio */}
        <p className="text-neutral-600 text-sm mb-6 leading-relaxed line-clamp-3">
          {mentor.bio}
        </p>

        {/* Details */}
        <div className="space-y-2 mb-6 text-xs">
          <div className="flex items-center space-x-2 text-neutral-600">
            <Clock className="w-3 h-3" />
            <span><strong>Duration:</strong> {mentor.duration}</span>
          </div>
          <div className="flex items-center space-x-2 text-neutral-600">
            <MessageSquare className="w-3 h-3" />
            <span><strong>Languages:</strong> {mentor.languages.join(", ")}</span>
          </div>
          {mentor.availability && (
            <div className="flex items-center space-x-2 text-neutral-600">
              <Calendar className="w-3 h-3" />
              <span><strong>Available:</strong> {mentor.availability.join(", ")}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleBookSession}
            className={cn(
              "flex-1 bg-black hover:bg-neutral-800 text-white font-medium transition-all duration-300",
              "hover:shadow-lg hover:-translate-y-0.5"
            )}
          >
            Book a session
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50 transition-all duration-300"
          >
            <MessageSquare className="w-4 h-4" />
          </Button>
        </div>

        {/* Hover Effect Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      </CardContent>
    </Card>
  );
}