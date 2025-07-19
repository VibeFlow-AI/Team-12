"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  Calendar, 
  MessageSquare,
  Edit,
  Save,
  X,
  User
} from "lucide-react";
import { toast } from "sonner";

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    comment: string;
    wouldRecommend: boolean;
    skills?: string[];
    mentorResponse?: string;
    mentorResponseDate?: string;
    createdAt: string;
    student: {
      name: string;
      avatar?: string;
    };
    mentor: {
      name: string;
      avatar?: string;
    };
    session: {
      subject: string;
      duration: string;
      sessionDate: string;
    };
  };
  currentUserId?: string;
  currentUserRole?: "student" | "mentor" | "admin";
  onUpdate?: (reviewId: string, updates: any) => void;
  onDelete?: (reviewId: string) => void;
  showSession?: boolean;
}

export default function ReviewCard({
  review,
  currentUserId,
  currentUserRole,
  onUpdate,
  onDelete,
  showSession = true
}: ReviewCardProps) {
  const [isEditingResponse, setIsEditingResponse] = useState(false);
  const [mentorResponse, setMentorResponse] = useState(review.mentorResponse || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-300"
        }`}
      />
    ));
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSaveResponse = async () => {
    if (!mentorResponse.trim()) {
      toast.error("Please enter a response");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/reviews/${review.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mentorResponse: mentorResponse.trim()
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save response");
      }

      toast.success("Response saved successfully");
      setIsEditingResponse(false);
      
      if (onUpdate) {
        onUpdate(review.id, {
          mentorResponse: mentorResponse.trim(),
          mentorResponseDate: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Error saving response:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save response");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canEditResponse = currentUserRole === "mentor" && currentUserId;
  const canDeleteReview = (currentUserRole === "student" && currentUserId) || currentUserRole === "admin";

  return (
    <Card className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            {review.student.avatar ? (
              <img 
                src={review.student.avatar} 
                alt={review.student.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <span className="text-blue-600 font-semibold text-sm">
                {getInitials(review.student.name)}
              </span>
            )}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{review.student.name}</h4>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                {renderStars(review.rating)}
              </div>
              <span className="text-sm text-gray-500">
                {formatDate(review.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {review.wouldRecommend ? (
            <div className="flex items-center space-x-1 text-green-600">
              <ThumbsUp className="w-4 h-4" />
              <span className="text-sm font-medium">Recommends</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1 text-red-600">
              <ThumbsDown className="w-4 h-4" />
              <span className="text-sm font-medium">Doesn&apos;t recommend</span>
            </div>
          )}
        </div>
      </div>

      {/* Session Info */}
      {showSession && (
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <User className="w-4 h-4" />
              <span>With {review.mentor.name}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageSquare className="w-4 h-4" />
              <span>{review.session.subject}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(review.session.sessionDate)}</span>
            </div>
            <span>{review.session.duration}</span>
          </div>
        </div>
      )}

      {/* Review Comment */}
      <div>
        <p className="text-gray-700 leading-relaxed">{review.comment}</p>
      </div>

      {/* Skills Tags */}
      {review.skills && review.skills.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-600 mb-2">Skills covered:</p>
          <div className="flex flex-wrap gap-2">
            {review.skills.map((skill, index) => (
              <Badge 
                key={index} 
                variant="secondary"
                className="text-xs bg-blue-100 text-blue-700"
              >
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Mentor Response Section */}
      <div className="border-t pt-4">
        {review.mentorResponse ? (
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-xs">
                    {getInitials(review.mentor.name)}
                  </span>
                </div>
                <span className="font-medium text-blue-900">{review.mentor.name}</span>
                <span className="text-xs text-blue-600">responded</span>
                {review.mentorResponseDate && (
                  <span className="text-xs text-blue-500">
                    {formatDate(review.mentorResponseDate)}
                  </span>
                )}
              </div>
              {canEditResponse && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingResponse(true)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
              )}
            </div>
            
            {isEditingResponse ? (
              <div className="space-y-3">
                <Textarea
                  value={mentorResponse}
                  onChange={(e) => setMentorResponse(e.target.value)}
                  placeholder="Write your response..."
                  className="min-h-[80px]"
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditingResponse(false);
                      setMentorResponse(review.mentorResponse || "");
                    }}
                  >
                    <X className="w-3 h-3 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveResponse}
                    disabled={isSubmitting}
                  >
                    <Save className="w-3 h-3 mr-1" />
                    {isSubmitting ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-blue-800">{review.mentorResponse}</p>
            )}
          </div>
        ) : canEditResponse ? (
          <div>
            {isEditingResponse ? (
              <div className="space-y-3">
                <Textarea
                  value={mentorResponse}
                  onChange={(e) => setMentorResponse(e.target.value)}
                  placeholder="Write a response to this review..."
                  className="min-h-[80px]"
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditingResponse(false);
                      setMentorResponse("");
                    }}
                  >
                    <X className="w-3 h-3 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveResponse}
                    disabled={isSubmitting}
                  >
                    <Save className="w-3 h-3 mr-1" />
                    {isSubmitting ? "Posting..." : "Post Response"}
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingResponse(true)}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <MessageSquare className="w-3 h-3 mr-1" />
                Respond to review
              </Button>
            )}
          </div>
        ) : null}
      </div>

      {/* Actions */}
      {canDeleteReview && onDelete && (
        <div className="flex justify-end pt-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(review.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Delete Review
          </Button>
        </div>
      )}
    </Card>
  );
}