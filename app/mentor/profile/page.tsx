"use client";

import { useSession } from "next-auth/react";
import { User, Edit, Camera, Award, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MentorProfilePage() {
  const { data: session } = useSession();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900">
          Profile
        </h1>
        <p className="text-neutral-600 mt-2">
          Manage your mentor profile and settings
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">
                    {session?.user?.name ? getInitials(session.user.name) : "M"}
                  </span>
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-black rounded-full flex items-center justify-center text-white hover:bg-neutral-800 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              
              <h3 className="text-xl font-semibold text-neutral-900 mt-4">
                {session?.user?.name || "Mentor Name"}
              </h3>
              <p className="text-neutral-600">{session?.user?.email}</p>
              
              <div className="flex items-center justify-center space-x-4 mt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-neutral-900">4.8</p>
                  <p className="text-sm text-neutral-600">Rating</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-neutral-900">24</p>
                  <p className="text-sm text-neutral-600">Students</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-neutral-900">156</p>
                  <p className="text-sm text-neutral-600">Sessions</p>
                </div>
              </div>
              
              <Button className="w-full mt-6 bg-black hover:bg-neutral-800 text-white">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
            <h4 className="text-lg font-semibold text-neutral-900 mb-4">Basic Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Full Name</label>
                <p className="text-neutral-900">{session?.user?.name || "Not set"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
                <p className="text-neutral-900">{session?.user?.email || "Not set"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Specialization</label>
                <p className="text-neutral-900">Mathematics, Physics</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Experience</label>
                <p className="text-neutral-900">5+ years</p>
              </div>
            </div>
          </div>

          {/* Subjects */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
            <h4 className="text-lg font-semibold text-neutral-900 mb-4">Teaching Subjects</h4>
            <div className="flex flex-wrap gap-2">
              {['Mathematics', 'Physics', 'Chemistry', 'Statistics'].map((subject) => (
                <span key={subject} className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-sm">
                  {subject}
                </span>
              ))}
            </div>
          </div>

          {/* Bio */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
            <h4 className="text-lg font-semibold text-neutral-900 mb-4">Bio</h4>
            <p className="text-neutral-700">
              Experienced educator with a passion for helping students excel in STEM subjects. 
              I specialize in making complex concepts easy to understand through practical examples 
              and interactive learning methods.
            </p>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
            <h4 className="text-lg font-semibold text-neutral-900 mb-4">Achievements</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Award className="w-5 h-5 text-yellow-500" />
                <span className="text-neutral-700">Top Rated Mentor 2024</span>
              </div>
              <div className="flex items-center space-x-3">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-neutral-700">100+ Successful Sessions</span>
              </div>
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-blue-500" />
                <span className="text-neutral-700">Student Choice Award</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}