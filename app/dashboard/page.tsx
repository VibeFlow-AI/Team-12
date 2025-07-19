"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Calendar,
  Search,
  BookOpen,
  TrendingUp,
  Clock,
  CheckCircle
} from "lucide-react";

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900">
          Welcome back, {session?.user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-neutral-600 mt-2">
          Ready to continue your learning journey?
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* AI-Powered Mentor Discovery */}
        <Link 
          href="/samples"
          className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Search className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="font-semibold text-neutral-900">AI-Powered Discovery</h3>
              <p className="text-sm text-neutral-600">Find mentors tailored to your goals</p>
            </div>
          </div>
          <p className="text-neutral-500 text-sm">
            Our AI analyzes your learning profile to recommend the perfect mentors for you.
          </p>
        </Link>

        {/* View Sessions */}
        <Link 
          href="/dashboard/sessions"
          className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="font-semibold text-neutral-900">Your Sessions</h3>
              <p className="text-sm text-neutral-600">Manage booked sessions</p>
            </div>
          </div>
          <p className="text-neutral-500 text-sm">
            View and manage all your upcoming mentoring sessions.
          </p>
        </Link>

        {/* Learning Progress */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="font-semibold text-neutral-900">Progress</h3>
              <p className="text-sm text-neutral-600">Track your learning</p>
            </div>
          </div>
          <p className="text-neutral-500 text-sm">
            Monitor your learning journey and achievements.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Total Sessions</p>
              <p className="text-2xl font-bold text-neutral-900">0</p>
            </div>
            <BookOpen className="w-8 h-8 text-neutral-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Completed</p>
              <p className="text-2xl font-bold text-neutral-900">0</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Hours Learned</p>
              <p className="text-2xl font-bold text-neutral-900">0</p>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Mentors</p>
              <p className="text-2xl font-bold text-neutral-900">0</p>
            </div>
            <Search className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Get Started Section */}
      <div className="bg-gradient-to-r from-neutral-900 to-neutral-700 rounded-2xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-2">Ready to start your AI-powered learning journey?</h2>
        <p className="text-neutral-300 mb-6">
          Connect with expertly matched mentors using our AI recommendation engine based on your learning profile.
        </p>
        <div className="flex gap-4">
          <Button asChild className="bg-white text-neutral-900 hover:bg-neutral-100">
            <Link href="/samples">
              Get AI Recommendations
            </Link>
          </Button>
          <Button variant="outline" asChild className="border-white text-white hover:bg-white hover:text-neutral-900">
            <Link href="/dashboard/sessions">
              View Sessions
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}