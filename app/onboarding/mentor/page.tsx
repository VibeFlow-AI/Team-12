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

const EXPERIENCE_LEVELS = [
  { value: "1-3", label: "1-3 years" },
  { value: "3-5", label: "3-5 years" },
  { value: "5-10", label: "5-10 years" },
  { value: "10+", label: "10+ years" }
];

const EXPERTISE_AREAS = [
  "Web Development",
  "Mobile Development",
  "Data Science",
  "Machine Learning",
  "DevOps",
  "UI/UX Design",
  "Product Management",
  "System Design",
  "Database Design",
  "Cybersecurity"
];

const MENTORING_APPROACHES = [
  "Technical Skills",
  "Career Guidance",
  "Code Reviews",
  "Project Management",
  "Interview Preparation",
  "Leadership Development",
  "Soft Skills",
  "Industry Insights"
];

export default function MentorOnboarding() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    bio: "",
    experienceLevel: "",
    currentRole: "",
    company: "",
    expertiseAreas: [] as string[],
    mentoringApproaches: [] as string[],
    specializations: "",
    availabilityHours: "",
    timeZone: "",
    preferredSessionLength: "",
    maxStudents: "",
    linkedinProfile: "",
    portfolioWebsite: "",
    achievements: ""
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
        toast.success("Mentor profile created successfully!");
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

  const handleCheckboxChange = (field: 'expertiseAreas' | 'mentoringApproaches', value: string) => {
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
              Set up your mentor profile to start helping students achieve their goals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="bio">Professional Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Share your professional background, experience, and what you're passionate about mentoring..."
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currentRole">Current Role</Label>
                  <Input
                    id="currentRole"
                    placeholder="e.g., Senior Developer"
                    value={formData.currentRole}
                    onChange={(e) => setFormData({...formData, currentRole: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    placeholder="e.g., Tech Corp"
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="experienceLevel">Years of Experience</Label>
                <Select value={formData.experienceLevel} onValueChange={(value) => setFormData({...formData, experienceLevel: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPERIENCE_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Areas of Expertise</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {EXPERTISE_AREAS.map((area) => (
                    <div key={area} className="flex items-center space-x-2">
                      <Checkbox
                        id={area}
                        checked={formData.expertiseAreas.includes(area)}
                        onCheckedChange={() => handleCheckboxChange('expertiseAreas', area)}
                      />
                      <Label htmlFor={area} className="text-sm">{area}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Mentoring Approaches</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {MENTORING_APPROACHES.map((approach) => (
                    <div key={approach} className="flex items-center space-x-2">
                      <Checkbox
                        id={approach}
                        checked={formData.mentoringApproaches.includes(approach)}
                        onCheckedChange={() => handleCheckboxChange('mentoringApproaches', approach)}
                      />
                      <Label htmlFor={approach} className="text-sm">{approach}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="specializations">Specific Specializations</Label>
                <Textarea
                  id="specializations"
                  placeholder="Specific technologies, frameworks, or domains you specialize in..."
                  value={formData.specializations}
                  onChange={(e) => setFormData({...formData, specializations: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="availabilityHours">Weekly Hours Available</Label>
                  <Input
                    id="availabilityHours"
                    type="number"
                    placeholder="e.g., 10"
                    value={formData.availabilityHours}
                    onChange={(e) => setFormData({...formData, availabilityHours: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="preferredSessionLength">Session Length (min)</Label>
                  <Input
                    id="preferredSessionLength"
                    type="number"
                    placeholder="e.g., 60"
                    value={formData.preferredSessionLength}
                    onChange={(e) => setFormData({...formData, preferredSessionLength: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="maxStudents">Max Students</Label>
                  <Input
                    id="maxStudents"
                    type="number"
                    placeholder="e.g., 5"
                    value={formData.maxStudents}
                    onChange={(e) => setFormData({...formData, maxStudents: e.target.value})}
                  />
                </div>
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

              <div>
                <Label htmlFor="achievements">Key Achievements</Label>
                <Textarea
                  id="achievements"
                  placeholder="Notable projects, certifications, awards, or accomplishments..."
                  value={formData.achievements}
                  onChange={(e) => setFormData({...formData, achievements: e.target.value})}
                />
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
                  <Label htmlFor="portfolioWebsite">Portfolio/Website (optional)</Label>
                  <Input
                    id="portfolioWebsite"
                    placeholder="https://yourwebsite.com"
                    value={formData.portfolioWebsite}
                    onChange={(e) => setFormData({...formData, portfolioWebsite: e.target.value})}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating Profile..." : "Complete Mentor Setup"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}