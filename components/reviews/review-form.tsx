"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  Plus,
  X,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

interface ReviewFormProps {
  sessionId: string;
  sessionDetails: {
    mentorName: string;
    subject: string;
    date: string;
    duration: string;
  };
  onSubmit: (reviewData: any) => void;
  onCancel: () => void;
}

const commonSkills = [
  "Problem Solving",
  "Technical Skills",
  "Communication",
  "Time Management",
  "Leadership",
  "Critical Thinking",
  "Creativity",
  "Teamwork",
  "Presentation",
  "Research",
  "Project Management",
  "Data Analysis"
];

export default function ReviewForm({
  sessionId,
  sessionDetails,
  onSubmit,
  onCancel
}: ReviewFormProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStarClick = (value: number) => {
    setRating(value);
  };

  const handleStarHover = (value: number) => {
    setHoveredRating(value);
  };

  const handleStarLeave = () => {
    setHoveredRating(0);
  };

  const addCustomSkill = () => {
    const skill = customSkill.trim();
    if (skill && !selectedSkills.includes(skill)) {
      setSelectedSkills([...selectedSkills, skill]);
      setCustomSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSelectedSkills(selectedSkills.filter(skill => skill !== skillToRemove));
  };

  const addCommonSkill = (skill: string) => {
    if (!selectedSkills.includes(skill)) {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (!comment.trim()) {
      toast.error("Please write a comment");
      return;
    }

    if (wouldRecommend === null) {
      toast.error("Please indicate if you would recommend this mentor");
      return;
    }

    setIsSubmitting(true);

    try {
      const reviewData = {
        sessionId,
        rating,
        comment: comment.trim(),
        wouldRecommend,
        skills: selectedSkills
      };

      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit review");
      }

      const result = await response.json();
      toast.success("Review submitted successfully!");
      onSubmit(result);

    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error(error instanceof Error ? error.message : "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return "Poor";
      case 2: return "Fair";
      case 3: return "Good";
      case 4: return "Very Good";
      case 5: return "Excellent";
      default: return "";
    }
  };

  const displayRating = hoveredRating || rating;

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Rate Your Session
          </h2>
          <p className="text-gray-600">
            Share your experience to help other students and support your mentor
          </p>
        </div>

        {/* Session Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Session Details</h3>
          <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
            <div>
              <span className="font-medium">Mentor:</span> {sessionDetails.mentorName}
            </div>
            <div>
              <span className="font-medium">Subject:</span> {sessionDetails.subject}
            </div>
            <div>
              <span className="font-medium">Date:</span> {sessionDetails.date}
            </div>
            <div>
              <span className="font-medium">Duration:</span> {sessionDetails.duration}
            </div>
          </div>
        </div>

        {/* Rating */}
        <div>
          <Label className="text-base font-semibold mb-3 block">
            Overall Rating *
          </Label>
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              {Array.from({ length: 5 }, (_, index) => {
                const starValue = index + 1;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleStarClick(starValue)}
                    onMouseEnter={() => handleStarHover(starValue)}
                    onMouseLeave={handleStarLeave}
                    className="transition-all duration-150 hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        starValue <= displayRating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300 hover:text-yellow-200"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            {displayRating > 0 && (
              <span className="text-lg font-medium text-gray-700">
                {getRatingText(displayRating)}
              </span>
            )}
          </div>
        </div>

        {/* Comment */}
        <div>
          <Label htmlFor="comment" className="text-base font-semibold mb-3 block">
            Your Review *
          </Label>
          <Textarea
            id="comment"
            placeholder="Share your experience... What did you learn? How was the mentor's teaching style? Would you recommend them to other students?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <p className="text-sm text-gray-500 mt-1">
            {comment.length}/500 characters
          </p>
        </div>

        {/* Recommendation */}
        <div>
          <Label className="text-base font-semibold mb-3 block">
            Would you recommend this mentor? *
          </Label>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setWouldRecommend(true)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all ${
                wouldRecommend === true
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-gray-200 hover:border-green-300 text-gray-600"
              }`}
            >
              <ThumbsUp className="w-5 h-5" />
              <span className="font-medium">Yes, I recommend</span>
            </button>
            <button
              type="button"
              onClick={() => setWouldRecommend(false)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all ${
                wouldRecommend === false
                  ? "border-red-500 bg-red-50 text-red-700"
                  : "border-gray-200 hover:border-red-300 text-gray-600"
              }`}
            >
              <ThumbsDown className="w-5 h-5" />
              <span className="font-medium">No, I don&apos;t recommend</span>
            </button>
          </div>
        </div>

        {/* Skills */}
        <div>
          <Label className="text-base font-semibold mb-3 block">
            Skills Covered (Optional)
          </Label>
          
          {/* Selected Skills */}
          {selectedSkills.length > 0 && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-2">
                {selectedSkills.map((skill, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center space-x-1 bg-blue-100 text-blue-700"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-1 hover:text-blue-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Common Skills */}
          <div className="mb-3">
            <p className="text-sm text-gray-600 mb-2">Select from common skills:</p>
            <div className="flex flex-wrap gap-2">
              {commonSkills
                .filter(skill => !selectedSkills.includes(skill))
                .map((skill, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => addCommonSkill(skill)}
                    className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <Plus className="w-3 h-3 inline mr-1" />
                    {skill}
                  </button>
                ))}
            </div>
          </div>

          {/* Custom Skill Input */}
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Add a custom skill..."
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCustomSkill();
                }
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={50}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCustomSkill}
              disabled={!customSkill.trim()}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0 || !comment.trim() || wouldRecommend === null}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              "Submit Review"
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}