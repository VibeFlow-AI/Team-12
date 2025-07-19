"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { MentorCard } from '@/components/recommendations/mentor-card';
import { RecommendationFiltersComponent } from '@/components/recommendations/recommendation-filters';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  Search,
  Filter,
  TrendingUp,
  Loader2,
  RefreshCw,
  BookOpen,
  MessageSquare,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { MentorRecommendation, RecommendationFilters } from '@/lib/recommendation-service';

export default function RecommendationsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [recommendations, setRecommendations] = useState<MentorRecommendation[]>([]);
  const [popularSubjects, setPopularSubjects] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<RecommendationFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  // Redirect if not a student
  useEffect(() => {
    if (session && session.user?.role !== 'student') {
      router.push('/dashboard');
      return;
    }
  }, [session, router]);

  // Load initial data
  useEffect(() => {
    if (session?.user?.role === 'student') {
      loadInitialRecommendations();
      loadPopularSubjects();
    }
  }, [session]);

  const loadInitialRecommendations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/recommendations?limit=12');
      
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to load recommendations');
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
      toast.error('Failed to load recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPopularSubjects = async () => {
    try {
      const response = await fetch('/api/recommendations/popular-subjects?limit=10');
      if (response.ok) {
        const data = await response.json();
        setPopularSubjects(data.subjects || []);
      }
    } catch (error) {
      console.error('Error loading popular subjects:', error);
    }
  };

  const handleFiltersChange = async (filters: RecommendationFilters) => {
    try {
      setIsFilterLoading(true);
      setCurrentFilters(filters);

      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...filters,
          limit: 12
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
        
        if (data.recommendations?.length === 0) {
          toast.info('No mentors found matching your criteria. Try adjusting your filters.');
        } else {
          toast.success(`Found ${data.recommendations?.length} recommended mentors`);
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to filter recommendations');
      }
    } catch (error) {
      console.error('Error filtering recommendations:', error);
      toast.error('Failed to apply filters');
    } finally {
      setIsFilterLoading(false);
    }
  };

  const handleBookSession = (mentorId: string) => {
    router.push(`/dashboard/booking/${mentorId}`);
  };

  const handleSendMessage = (mentorId: string) => {
    router.push(`/dashboard/messages/${mentorId}`);
  };

  const handleViewProfile = (mentorId: string) => {
    router.push(`/dashboard/mentor/${mentorId}`);
  };

  const handleRefresh = () => {
    setCurrentFilters({});
    loadInitialRecommendations();
  };

  // Don't render anything if not a student
  if (session && session.user?.role !== 'student') {
    return null;
  }

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-8">
      {/* Page Header */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Recommended Mentors
            </h1>
            <p className="text-gray-600">
              Discover mentors perfectly matched to your learning goals and preferences
            </p>
          </div>
        </div>

        {/* Stats and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span>{recommendations.length} mentors found</span>
            </div>
            {Object.keys(currentFilters).length > 0 && (
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-blue-500" />
                <span>Filters applied</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        {showFilters && (
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <RecommendationFiltersComponent
                onFiltersChange={handleFiltersChange}
                popularSubjects={popularSubjects}
                isLoading={isFilterLoading}
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className={showFilters ? "lg:col-span-3" : "lg:col-span-4"}>
          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
                <p className="text-gray-600">Finding the best mentors for you...</p>
              </div>
            </div>
          ) : recommendations.length === 0 ? (
            /* Empty State */
            <Card className="p-12 text-center">
              <div className="space-y-4">
                <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  No mentors found
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  We couldn&apos;t find any mentors matching your current criteria. 
                  Try adjusting your filters or refreshing the recommendations.
                </p>
                <div className="flex justify-center space-x-4">
                  <Button onClick={handleRefresh} variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Recommendations
                  </Button>
                  <Button onClick={() => setCurrentFilters({})}>
                    Clear All Filters
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            /* Recommendations Grid */
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="p-4 bg-blue-50 border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <div>
                      <h4 className="font-medium text-blue-900">
                        Ready to start learning?
                      </h4>
                      <p className="text-sm text-blue-700">
                        Book a session with any mentor or send them a message to get started
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="text-blue-600 border-blue-300">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Browse All Mentors
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Mentors Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {recommendations.map((mentor) => (
                  <MentorCard
                    key={mentor._id}
                    mentor={mentor}
                    onBookSession={handleBookSession}
                    onSendMessage={handleSendMessage}
                    onViewProfile={handleViewProfile}
                    showMatchScore={true}
                  />
                ))}
              </div>

              {/* Load More */}
              {recommendations.length >= 12 && (
                <div className="text-center">
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => handleFiltersChange({ ...currentFilters })}
                    disabled={isFilterLoading}
                  >
                    {isFilterLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Loading more...
                      </>
                    ) : (
                      'Load More Mentors'
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}