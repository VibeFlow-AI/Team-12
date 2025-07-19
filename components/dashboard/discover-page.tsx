"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MentorCard from "./mentor-card";
import BookingModal from "./booking-modal";
import { cn } from "@/lib/utils";
import { Search, Filter, SlidersHorizontal, Grid3x3, List } from "lucide-react";
import { toast } from "sonner";

interface Mentor {
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
  matchScore?: number;
  matchReasons?: string[];
}

// Mock data - replace with actual API call
const mockMentors: Mentor[] = [
  {
    id: "1",
    name: "Rahul Lavan",
    location: "Colombo",
    subjects: ["Science", "Physics", "Biology"],
    bio: "Experienced science educator with over 8 years of teaching experience. Passionate about making complex concepts accessible and engaging for students. Specialized in advanced physics and molecular biology.",
    duration: "30 mins - 1 hour",
    languages: ["English", "Tamil"],
    rating: 4.9,
    totalSessions: 127,
    avatarColor: { from: "#3b82f6", to: "#1d4ed8" },
    company: "University of Colombo",
    role: "Research Assistant",
    experience: "8+ years",
    availability: ["Mon-Fri", "Evenings"]
  },
  {
    id: "2", 
    name: "Chathurn Rahal",
    location: "Galle",
    subjects: ["Mathematics", "History", "English"],
    bio: "Mathematics professor and history enthusiast with a passion for interdisciplinary learning. Helps students excel in analytical thinking and critical reasoning across multiple subjects.",
    duration: "1 hour",
    languages: ["English"],
    rating: 4.8,
    totalSessions: 89,
    avatarColor: { from: "#f97316", to: "#ea580c" },
    company: "Galle International School",
    role: "Senior Teacher",
    experience: "12+ years",
    availability: ["Weekends", "Afternoons"]
  },
  {
    id: "3",
    name: "Maisha Fernando", 
    location: "Colombo",
    subjects: ["Chemistry", "Art", "Commerce"],
    bio: "Creative educator combining artistic expression with scientific rigor. Specializes in organic chemistry and business studies with innovative teaching methodologies.",
    duration: "1 hour",
    languages: ["Sinhala"],
    rating: 4.7,
    totalSessions: 156,
    avatarColor: { from: "#ec4899", to: "#db2777" },
    company: "Royal College",
    role: "Head of Science",
    experience: "10+ years", 
    availability: ["Mon-Thu", "Mornings"]
  },
  {
    id: "4",
    name: "Amal Perera",
    location: "Kandy",
    subjects: ["Computer Science", "Mathematics", "Engineering"],
    bio: "Software engineer turned educator with expertise in programming, algorithms, and engineering mathematics. Helps students transition from theory to practical applications.",
    duration: "45 mins - 1.5 hours",
    languages: ["English", "Sinhala"],
    rating: 5.0,
    totalSessions: 203,
    avatarColor: { from: "#10b981", to: "#059669" },
    company: "Tech Solutions Ltd",
    role: "Senior Developer",
    experience: "15+ years",
    availability: ["Weekends", "Evenings"]
  }
];

const durationOptions = [
  "All Durations",
  "30 minutes", 
  "45 minutes",
  "1 hour",
  "1.5 hours",
  "2+ hours"
];

const subjectOptions = [
  "All Subjects",
  "Mathematics",
  "Science", 
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "History",
  "Art",
  "Commerce",
  "Computer Science",
  "Engineering"
];

const locationOptions = [
  "All Locations",
  "Colombo",
  "Galle", 
  "Kandy",
  "Jaffna",
  "Negombo"
];

export default function DiscoverPage() {
  const { data: session } = useSession();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [filteredMentors, setFilteredMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarkedMentors, setBookmarkedMentors] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("All Durations");
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [showFilters, setShowFilters] = useState(false);
  
  // Booking modal state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);

  // Fetch AI-powered recommendations from API
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        // First try to get AI-powered recommendations
        const recommendationsResponse = await fetch("/api/recommendations");
        if (recommendationsResponse.ok) {
          const recommendationsData = await recommendationsResponse.json();
          if (recommendationsData.success && recommendationsData.recommendations) {
            // Convert AI recommendations to mentor format
            const aiMentors = recommendationsData.recommendations.map((rec: any) => ({
              id: rec._id,
              name: rec.name,
              location: rec.location || "Not specified",
              subjects: rec.subjects,
              bio: rec.bio || "Experienced educator",
              duration: "30 mins - 1 hour", // Default duration
              languages: rec.languages,
              rating: rec.rating,
              totalSessions: rec.totalSessions,
              avatarColor: { 
                from: "#3b82f6", 
                to: "#1d4ed8" 
              }, // Default color
              company: "Educational Institution",
              role: "Mentor",
              experience: rec.experienceLevel,
              availability: rec.availability?.map((avail: any) => avail.day) || [],
              matchScore: rec.matchScore,
              matchReasons: rec.matchReasons
            }));
            setMentors(aiMentors);
            return;
          }
        }

        // Fallback to regular mentors API
        const mentorsResponse = await fetch("/api/mentors");
        if (mentorsResponse.ok) {
          const mentorsData = await mentorsResponse.json();
          setMentors(mentorsData.mentors || mockMentors);
        } else {
          // Final fallback to mock data
          setMentors(mockMentors);
        }
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
        // Fallback to mock data
        setMentors(mockMentors);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.role === "student") {
      fetchRecommendations();
    } else {
      setLoading(false);
    }
  }, [session]);

  // Apply filters and potentially refetch AI recommendations
  useEffect(() => {
    const applyFiltersAndFetch = async () => {
      // Build recommendation filters
      const filters: any = {};
      
      if (selectedSubject !== "All Subjects") {
        filters.subjects = [selectedSubject];
      }
      
      if (selectedLocation !== "All Locations") {
        filters.location = selectedLocation;
      }

      // If we have active AI filters, refetch recommendations
      const hasAIFilters = selectedSubject !== "All Subjects" || selectedLocation !== "All Locations";
      
      if (hasAIFilters && session?.user?.role === "student") {
        try {
          const queryParams = new URLSearchParams();
          
          if (filters.subjects) {
            queryParams.set('subjects', filters.subjects.join(','));
          }
          if (filters.location) {
            queryParams.set('location', filters.location);
          }
          
          const response = await fetch(`/api/recommendations?${queryParams.toString()}`);
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.recommendations) {
              const aiMentors = data.recommendations.map((rec: any) => ({
                id: rec._id,
                name: rec.name,
                location: rec.location || "Not specified",
                subjects: rec.subjects,
                bio: rec.bio || "Experienced educator",
                duration: "30 mins - 1 hour",
                languages: rec.languages,
                rating: rec.rating,
                totalSessions: rec.totalSessions,
                avatarColor: { from: "#3b82f6", to: "#1d4ed8" },
                company: "Educational Institution",
                role: "Mentor",
                experience: rec.experienceLevel,
                availability: rec.availability?.map((avail: any) => avail.day) || [],
                matchScore: rec.matchScore,
                matchReasons: rec.matchReasons
              }));
              setMentors(aiMentors);
            }
          }
        } catch (error) {
          console.error("Failed to refetch recommendations:", error);
        }
      }

      // Apply local filters
      let filtered = mentors;

      // Search filter
      if (searchQuery) {
        filtered = filtered.filter(mentor => 
          mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          mentor.subjects.some(subject => 
            subject.toLowerCase().includes(searchQuery.toLowerCase())
          ) ||
          mentor.location.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Duration filter (local only)
      if (selectedDuration !== "All Durations") {
        filtered = filtered.filter(mentor => 
          mentor.duration.toLowerCase().includes(selectedDuration.toLowerCase())
        );
      }

      setFilteredMentors(filtered);
    };

    applyFiltersAndFetch();
  }, [searchQuery, selectedDuration, selectedSubject, selectedLocation, mentors, session]);

  const handleBookSession = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setIsBookingModalOpen(true);
  };

  const handleConfirmBooking = async (bookingData: any) => {
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData)
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to book session");
      }
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("An error occurred while booking the session");
      throw error;
    }
  };

  const handleBookmark = (mentorId: string) => {
    const newBookmarks = new Set(bookmarkedMentors);
    if (bookmarkedMentors.has(mentorId)) {
      newBookmarks.delete(mentorId);
    } else {
      newBookmarks.add(mentorId);
    }
    setBookmarkedMentors(newBookmarks);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedDuration("All Durations");
    setSelectedSubject("All Subjects");
    setSelectedLocation("All Locations");
  };

  const hasActiveFilters = searchQuery || 
    selectedDuration !== "All Durations" || 
    selectedSubject !== "All Subjects" || 
    selectedLocation !== "All Locations";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-2">
            Discover Mentors
          </h1>
          <p className="text-neutral-600 text-lg">
            Find the perfect mentor to guide your learning journey
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex items-center border border-neutral-200 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2 rounded transition-colors duration-200",
                viewMode === "grid" ? "bg-black text-white" : "text-neutral-500 hover:text-neutral-700"
              )}
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2 rounded transition-colors duration-200",
                viewMode === "list" ? "bg-black text-white" : "text-neutral-500 hover:text-neutral-700"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Filter Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "border-neutral-300 hover:border-neutral-400",
              showFilters && "bg-neutral-50"
            )}
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full"></span>
            )}
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
        <Input
          placeholder="Search mentors, subjects, or locations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4 py-3 text-lg border-neutral-300 focus:border-black focus:ring-black"
        />
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white border border-neutral-200 rounded-lg p-6 space-y-4 animate-in slide-in-from-top-5 duration-300">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Duration
              </label>
              <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {durationOptions.map(option => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Subject
              </label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {subjectOptions.map(option => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Location
              </label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {locationOptions.map(option => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex justify-end">
              <Button variant="outline" onClick={clearFilters}>
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-neutral-600">
          {filteredMentors.length} mentor{filteredMentors.length !== 1 ? 's' : ''} found
          {hasActiveFilters && ` (${mentors.length} total)`}
        </p>
        
        <Select defaultValue="recommended">
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recommended">Recommended</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="sessions">Most Sessions</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-neutral-200 rounded-full mr-4"></div>
                <div>
                  <div className="h-4 bg-neutral-200 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-neutral-200 rounded w-20"></div>
                </div>
              </div>
              <div className="flex gap-2 mb-4">
                <div className="h-6 bg-neutral-200 rounded-full w-16"></div>
                <div className="h-6 bg-neutral-200 rounded-full w-20"></div>
                <div className="h-6 bg-neutral-200 rounded-full w-18"></div>
              </div>
              <div className="space-y-2 mb-6">
                <div className="h-3 bg-neutral-200 rounded w-full"></div>
                <div className="h-3 bg-neutral-200 rounded w-3/4"></div>
                <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
              </div>
              <div className="h-10 bg-neutral-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : filteredMentors.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center">
            <Search className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">
            No mentors found
          </h3>
          <p className="text-neutral-600 mb-4">
            Try adjusting your search criteria or filters
          </p>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className={cn(
          "grid gap-6",
          viewMode === "grid" ? "md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
        )}>
          {filteredMentors.map((mentor, index) => (
            <MentorCard
              key={mentor.id}
              mentor={mentor}
              onBook={handleBookSession}
              onBookmark={handleBookmark}
              isBookmarked={bookmarkedMentors.has(mentor.id)}
              className={cn(
                viewMode === "list" && "flex-row",
                "animate-in fade-in-50 slide-in-from-bottom-8 duration-700"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            />
          ))}
        </div>
      )}

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        mentor={selectedMentor}
        onConfirm={handleConfirmBooking}
      />
    </div>
  );
}