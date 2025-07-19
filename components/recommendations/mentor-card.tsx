"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Star, 
  Clock, 
  MapPin, 
  MessageCircle, 
  Calendar,
  DollarSign,
  Users,
  BookOpen,
  Globe,
  Zap
} from 'lucide-react';
import { MentorRecommendation } from '@/lib/recommendation-service';

interface MentorCardProps {
  mentor: MentorRecommendation;
  onBookSession?: (mentorId: string) => void;
  onSendMessage?: (mentorId: string) => void;
  onViewProfile?: (mentorId: string) => void;
  showMatchScore?: boolean;
  className?: string;
}

export function MentorCard({ 
  mentor, 
  onBookSession, 
  onSendMessage, 
  onViewProfile,
  showMatchScore = true,
  className 
}: MentorCardProps) {
  const initials = mentor.name
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleBookSession = () => {
    onBookSession?.(mentor._id);
  };

  const handleSendMessage = () => {
    onSendMessage?.(mentor._id);
  };

  const handleViewProfile = () => {
    onViewProfile?.(mentor._id);
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500 text-white';
    if (score >= 60) return 'bg-blue-500 text-white';
    if (score >= 40) return 'bg-yellow-500 text-white';
    return 'bg-gray-500 text-white';
  };

  return (
    <Card className={`relative overflow-hidden hover:shadow-lg transition-shadow duration-200 ${className}`}>
      {/* Match Score Badge */}
      {showMatchScore && (
        <div className="absolute top-4 right-4 z-10">
          <Badge className={`${getMatchScoreColor(mentor.matchScore)} font-semibold`}>
            {Math.round(mentor.matchScore)}% match
          </Badge>
        </div>
      )}

      <div className="p-6">
        {/* Mentor Header */}
        <div className="flex items-start space-x-4 mb-4">
          <Avatar className="w-16 h-16 ring-2 ring-white shadow-md">
            <AvatarImage 
              src={mentor.avatar} 
              alt={`${mentor.name}'s profile picture`}
              className="object-cover"
            />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {mentor.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {mentor.experienceLevel} Level Mentor
                </p>
              </div>
            </div>

            {/* Rating and Stats */}
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="font-medium">{mentor.rating.toFixed(1)}</span>
                <span>({mentor.totalReviews} reviews)</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{mentor.totalSessions} sessions</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        {mentor.bio && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {mentor.bio}
          </p>
        )}

        {/* Subjects */}
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <BookOpen className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Subjects</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {mentor.subjects.slice(0, 3).map((subject, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {subject}
              </Badge>
            ))}
            {mentor.subjects.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{mentor.subjects.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-green-500" />
            <span className="text-gray-600">${mentor.hourlyRate}/hour</span>
          </div>

          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <span className="text-gray-600">{mentor.responseTime}</span>
          </div>

          {mentor.location && (
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-red-500" />
              <span className="text-gray-600 truncate">{mentor.location}</span>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4 text-purple-500" />
            <span className="text-gray-600 truncate">
              {mentor.languages.slice(0, 2).join(', ')}
              {mentor.languages.length > 2 && ' +more'}
            </span>
          </div>
        </div>

        {/* Match Reasons */}
        {showMatchScore && mentor.matchReasons.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">Why this match?</span>
            </div>
            <div className="space-y-1">
              {mentor.matchReasons.slice(0, 2).map((reason, index) => (
                <p key={index} className="text-xs text-gray-600 flex items-center">
                  <span className="w-1 h-1 bg-green-500 rounded-full mr-2 flex-shrink-0"></span>
                  {reason}
                </p>
              ))}
              {mentor.matchReasons.length > 2 && (
                <p className="text-xs text-gray-500">
                  +{mentor.matchReasons.length - 2} more reasons
                </p>
              )}
            </div>
          </div>
        )}

        {/* Availability Preview */}
        {mentor.availability.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-gray-700">Available</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {mentor.availability.slice(0, 3).map((slot, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {slot.day} {slot.startTime}-{slot.endTime}
                </Badge>
              ))}
              {mentor.availability.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{mentor.availability.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button 
            onClick={handleBookSession}
            className="flex-1"
            size="sm"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Book Session
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleSendMessage}
            size="sm"
          >
            <MessageCircle className="w-4 h-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={handleViewProfile}
            size="sm"
          >
            View Profile
          </Button>
        </div>
      </div>
    </Card>
  );
}