"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const SKILL_LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" }
];

const LEARNING_GOALS = [
  "Career Change",
  "Skill Enhancement",
  "Academic Support", 
  "Personal Development",
  "Project Guidance",
  "Interview Preparation"
];

const PREFERRED_MENTORSHIP = [
  "One-on-One Sessions",
  "Group Mentoring",
  "Project-Based Learning",
  "Code Reviews",
  "Career Guidance",
  "Technical Interviews"
];

export default function StudentOnboarding() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    bio: "",
    currentLevel: "",
    learningGoals: [] as string[],
    preferredMentorship: [] as string[],
    technicalInterests: "",
    availabilityHours: "",
    timeZone: "",
    linkedinProfile: "",
    githubProfile: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboardingData: formData })
      });

      if (response.ok) {
        toast.success("Onboarding completed successfully!");
        await update();
        router.push("/samples");
        router.refresh();
      } else {
        toast.error("Failed to complete onboarding");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckboxChange = (field: 'learningGoals' | 'preferredMentorship', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value) 
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Welcome, {session?.user?.name}!</CardTitle>
            <CardDescription>
              Let's set up your student profile to connect you with the best mentors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="bio">Tell us about yourself</Label>
                <Textarea
                  id="bio"
                  placeholder="Brief introduction about your background and what you're looking to achieve..."
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="currentLevel">Current Skill Level</Label>
                <Select value={formData.currentLevel} onValueChange={(value) => setFormData({...formData, currentLevel: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your current level" />
                  </SelectTrigger>
                  <SelectContent>
                    {SKILL_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Learning Goals</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {LEARNING_GOALS.map((goal) => (
                    <div key={goal} className="flex items-center space-x-2">
                      <Checkbox
                        id={goal}
                        checked={formData.learningGoals.includes(goal)}
                        onCheckedChange={() => handleCheckboxChange('learningGoals', goal)}
                      />
                      <Label htmlFor={goal} className="text-sm">{goal}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Preferred Mentorship Style</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {PREFERRED_MENTORSHIP.map((style) => (
                    <div key={style} className="flex items-center space-x-2">
                      <Checkbox
                        id={style}
                        checked={formData.preferredMentorship.includes(style)}
                        onCheckedChange={() => handleCheckboxChange('preferredMentorship', style)}
                      />
                      <Label htmlFor={style} className="text-sm">{style}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="technicalInterests">Technical Interests</Label>
                <Textarea
                  id="technicalInterests"
                  placeholder="Programming languages, frameworks, technologies you're interested in..."
                  value={formData.technicalInterests}
                  onChange={(e) => setFormData({...formData, technicalInterests: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="availabilityHours">Weekly Availability (hours)</Label>
                  <Input
                    id="availabilityHours"
                    type="number"
                    placeholder="e.g., 5"
                    value={formData.availabilityHours}
                    onChange={(e) => setFormData({...formData, availabilityHours: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="timeZone">Time Zone</Label>
                  <Input
                    id="timeZone"
                    placeholder="e.g., EST, PST, GMT"
                    value={formData.timeZone}
                    onChange={(e) => setFormData({...formData, timeZone: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="linkedinProfile">LinkedIn Profile (optional)</Label>
                  <Input
                    id="linkedinProfile"
                    placeholder="https://linkedin.com/in/..."
                    value={formData.linkedinProfile}
                    onChange={(e) => setFormData({...formData, linkedinProfile: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="githubProfile">GitHub Profile (optional)</Label>
                  <Input
                    id="githubProfile"
                    placeholder="https://github.com/..."
                    value={formData.githubProfile}
                    onChange={(e) => setFormData({...formData, githubProfile: e.target.value})}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Completing Setup..." : "Complete Onboarding"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}