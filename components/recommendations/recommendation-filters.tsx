"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
  Filter, 
  X, 
  Search,
  BookOpen,
  DollarSign,
  Star,
  MapPin,
  Globe,
  TrendingUp
} from 'lucide-react';
import { RecommendationFilters } from '@/lib/recommendation-service';

interface RecommendationFiltersProps {
  onFiltersChange: (filters: RecommendationFilters) => void;
  popularSubjects?: string[];
  isLoading?: boolean;
  className?: string;
}

const EXPERIENCE_LEVELS = [
  'Beginner',
  'Intermediate', 
  'Advanced',
  'Expert'
];

const LANGUAGES = [
  'English',
  'Spanish',
  'French',
  'German',
  'Italian',
  'Portuguese',
  'Chinese',
  'Japanese',
  'Korean',
  'Arabic',
  'Hindi',
  'Russian'
];

export function RecommendationFiltersComponent({ 
  onFiltersChange, 
  popularSubjects = [],
  isLoading = false,
  className 
}: RecommendationFiltersProps) {
  const [filters, setFilters] = useState<RecommendationFilters>({});
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [customSubject, setCustomSubject] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubjectAdd = (subject: string) => {
    if (!selectedSubjects.includes(subject)) {
      const newSubjects = [...selectedSubjects, subject];
      setSelectedSubjects(newSubjects);
      updateFilters({ ...filters, subjects: newSubjects });
    }
  };

  const handleSubjectRemove = (subject: string) => {
    const newSubjects = selectedSubjects.filter(s => s !== subject);
    setSelectedSubjects(newSubjects);
    updateFilters({ 
      ...filters, 
      subjects: newSubjects.length > 0 ? newSubjects : undefined 
    });
  };

  const handleCustomSubjectAdd = () => {
    if (customSubject.trim() && !selectedSubjects.includes(customSubject.trim())) {
      handleSubjectAdd(customSubject.trim());
      setCustomSubject('');
    }
  };

  const handleLanguageToggle = (language: string) => {
    const newLanguages = selectedLanguages.includes(language)
      ? selectedLanguages.filter(l => l !== language)
      : [...selectedLanguages, language];
    
    setSelectedLanguages(newLanguages);
    updateFilters({ 
      ...filters, 
      language: newLanguages.length > 0 ? newLanguages : undefined 
    });
  };

  const handleExperienceLevelChange = (level: string) => {
    updateFilters({ 
      ...filters, 
      experienceLevel: level === 'all' ? undefined : level as any
    });
  };

  const handlePriceRangeChange = (values: number[]) => {
    const [min, max] = values;
    setPriceRange([min, max]);
    updateFilters({ 
      ...filters, 
      priceRange: { min, max }
    });
  };

  const handleRatingChange = (rating: string) => {
    updateFilters({ 
      ...filters, 
      rating: rating === 'all' ? undefined : parseFloat(rating)
    });
  };

  const handleLocationChange = (location: string) => {
    updateFilters({ 
      ...filters, 
      location: location.trim() || undefined
    });
  };

  const updateFilters = (newFilters: RecommendationFilters) => {
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    const emptyFilters: RecommendationFilters = {};
    setFilters(emptyFilters);
    setSelectedSubjects([]);
    setSelectedLanguages([]);
    setPriceRange([0, 100]);
    setCustomSubject('');
    onFiltersChange(emptyFilters);
  };

  const hasActiveFilters = () => {
    return selectedSubjects.length > 0 || 
           selectedLanguages.length > 0 ||
           filters.experienceLevel ||
           filters.rating ||
           filters.location ||
           (filters.priceRange && (filters.priceRange.min > 0 || filters.priceRange.max < 100));
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Filter className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Filter Mentors
              </h3>
              <p className="text-sm text-gray-600">
                Find mentors that match your preferences
              </p>
            </div>
          </div>

          {hasActiveFilters() && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearAllFilters}
              className="text-gray-600"
            >
              <X className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>

        {/* Subjects */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-gray-500" />
            <Label className="text-sm font-medium">Subjects</Label>
          </div>

          {/* Popular Subjects */}
          {popularSubjects.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-xs text-gray-600">Popular subjects</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {popularSubjects.slice(0, 8).map((subject) => (
                  <Button
                    key={subject}
                    variant={selectedSubjects.includes(subject) ? "default" : "outline"}
                    size="sm"
                    onClick={() => 
                      selectedSubjects.includes(subject) 
                        ? handleSubjectRemove(subject)
                        : handleSubjectAdd(subject)
                    }
                    className="text-xs h-7"
                  >
                    {subject}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Custom Subject Input */}
          <div className="flex space-x-2">
            <div className="flex-1">
              <Input
                placeholder="Add custom subject..."
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCustomSubjectAdd()}
                className="text-sm"
              />
            </div>
            <Button 
              size="sm" 
              onClick={handleCustomSubjectAdd}
              disabled={!customSubject.trim()}
            >
              Add
            </Button>
          </div>

          {/* Selected Subjects */}
          {selectedSubjects.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedSubjects.map((subject) => (
                <Badge 
                  key={subject} 
                  variant="secondary" 
                  className="flex items-center space-x-1"
                >
                  <span>{subject}</span>
                  <button
                    onClick={() => handleSubjectRemove(subject)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Experience Level */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Experience Level</Label>
          <Select onValueChange={handleExperienceLevelChange}>
            <SelectTrigger>
              <SelectValue placeholder="Any experience level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any experience level</SelectItem>
              {EXPERIENCE_LEVELS.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-gray-500" />
            <Label className="text-sm font-medium">
              Price Range: ${priceRange[0]} - ${priceRange[1]}/hour
            </Label>
          </div>
          <Slider
            value={priceRange}
            onValueChange={handlePriceRangeChange}
            max={200}
            min={0}
            step={5}
            className="w-full"
          />
        </div>

        {/* Minimum Rating */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Star className="w-4 h-4 text-gray-500" />
            <Label className="text-sm font-medium">Minimum Rating</Label>
          </div>
          <Select onValueChange={handleRatingChange}>
            <SelectTrigger>
              <SelectValue placeholder="Any rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any rating</SelectItem>
              <SelectItem value="4.5">4.5+ stars</SelectItem>
              <SelectItem value="4.0">4.0+ stars</SelectItem>
              <SelectItem value="3.5">3.5+ stars</SelectItem>
              <SelectItem value="3.0">3.0+ stars</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Advanced Filters Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full text-gray-600"
        >
          {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
        </Button>

        {/* Advanced Filters */}
        {showAdvanced && (
          <>
            <Separator />

            {/* Location */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <Label className="text-sm font-medium">Location</Label>
              </div>
              <Input
                placeholder="Enter city or region..."
                onChange={(e) => handleLocationChange(e.target.value)}
                className="text-sm"
              />
            </div>

            {/* Languages */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-gray-500" />
                <Label className="text-sm font-medium">Languages</Label>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {LANGUAGES.map((language) => (
                  <Button
                    key={language}
                    variant={selectedLanguages.includes(language) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleLanguageToggle(language)}
                    className="text-xs h-7 justify-start"
                  >
                    {language}
                  </Button>
                ))}
              </div>
              {selectedLanguages.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedLanguages.map((language) => (
                    <Badge key={language} variant="secondary" className="text-xs">
                      {language}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Apply Button */}
        <Button 
          className="w-full" 
          disabled={isLoading}
          onClick={() => onFiltersChange(filters)}
        >
          <Search className="w-4 h-4 mr-2" />
          {isLoading ? 'Searching...' : 'Find Mentors'}
        </Button>
      </div>
    </Card>
  );
}