"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { formatDate, formatDateLong } from "@/lib/date-utils";
import ClientOnly from "@/components/client-only";
import DonutChart from "@/components/dashboard/donut-chart";
import BarChart from "@/components/dashboard/bar-chart";
import {
  Calendar,
  Clock,
  User,
  PlayCircle,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  X,
  Bell
} from "lucide-react";
import { toast } from "sonner";

interface SessionData {
  id: string;
  studentName: string;
  subject: string;
  sessionDate: string;
  sessionTime: string;
  duration: string;
  status: string;
  paymentStatus?: string;
}

interface Analytics {
  totalSessions: number;
  completedSessions: number;
  upcomingSessions: number;
  cancelledSessions: number;
  pendingSessions: number;
  monthlySessionsData: number[];
  totalEarnings: number;
  totalHours: number;
}

interface SessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: SessionData | null;
  onConfirm: () => void;
}

function SessionStartModal({ isOpen, onClose, session, onConfirm }: SessionModalProps) {
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !session) return null;

  const handleStart = async () => {
    setIsStarting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      onConfirm();
      toast.success("Session started! Opening video call interface...");
    } catch (error) {
      toast.error("Failed to start session");
    } finally {
      setIsStarting(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-300"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md mx-4">
        <div className="bg-white rounded-2xl p-8 shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300">
          <div className="text-center">
            <h3 className="text-xl font-bold text-neutral-900 mb-4">Start Session</h3>
            
            <div className="space-y-3 text-left">
              <div className="flex justify-between">
                <span className="text-neutral-600">Student:</span>
                <span className="font-medium">{session.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Subject:</span>
                <span className="font-medium">{session.subject}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Duration:</span>
                <span className="font-medium">{session.duration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Time:</span>
                <span className="font-medium">
                  <ClientOnly fallback={<span className="animate-pulse">Loading...</span>}>
                    {formatDate(session.sessionDate)} at {session.sessionTime}
                  </ClientOnly>
                </span>
              </div>
            </div>
            
            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isStarting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleStart}
                disabled={isStarting}
                className="flex-1 bg-black hover:bg-neutral-800 text-white"
              >
                {isStarting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Starting...
                  </>
                ) : (
                  "Start Now"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MentorDashboard() {
  const { data: session } = useSession();
  const [upcomingSessions, setUpcomingSessions] = useState<SessionData[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<SessionData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (session?.user?.role !== "mentor") {
      redirect("/dashboard");
    }
  }, [session]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch mentor's sessions
      const response = await fetch('/api/bookings');
      if (!response.ok) throw new Error('Failed to fetch sessions');
      
      const data = await response.json();
      const sessions = data.bookings || [];
      
      // Filter upcoming sessions
      const upcoming = sessions.filter((s: any) => 
        s.status === 'confirmed' && new Date(s.sessionDate) >= new Date()
      );
      
      // Calculate analytics
      const completed = sessions.filter((s: any) => s.status === 'completed').length;
      const cancelled = sessions.filter((s: any) => s.status === 'cancelled').length;
      const pending = sessions.filter((s: any) => s.status === 'pending').length;
      
      // Mock monthly data for bar chart
      const monthlyData = [40, 80, 60, 100, 120];
      
      setAnalytics({
        totalSessions: sessions.length,
        completedSessions: completed,
        upcomingSessions: upcoming.length,
        cancelledSessions: cancelled,
        pendingSessions: pending,
        monthlySessionsData: monthlyData,
        totalEarnings: completed * 50, // Mock calculation
        totalHours: sessions.reduce((acc: number, s: any) => {
          const duration = parseInt(s.duration) || 1;
          return acc + duration;
        }, 0)
      });
      
      // Map sessions to proper format
      const formattedSessions: SessionData[] = upcoming.map((s: any) => ({
        id: s.id,
        studentName: s.student?.name || 'Unknown Student',
        subject: s.subject,
        sessionDate: s.sessionDate,
        sessionTime: s.sessionTime,
        duration: s.duration,
        status: s.status,
        paymentStatus: s.paymentStatus
      }));
      
      setUpcomingSessions(formattedSessions);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleStartSession = (session: SessionData) => {
    setSelectedSession(session);
    setIsModalOpen(true);
  };

  const handleConfirmStart = () => {
    // Here you would implement the actual session start logic
    // For now, we'll just show a success message
    console.log('Starting session:', selectedSession);
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 rounded w-1/3 mb-8"></div>
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            <div className="h-64 bg-neutral-200 rounded-2xl"></div>
            <div className="h-64 bg-neutral-200 rounded-2xl"></div>
          </div>
          <div className="h-96 bg-neutral-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900">
          Mentor Dashboard
        </h1>
        <p className="text-neutral-600 mt-2">
          Welcome back, {session?.user?.name}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Total Sessions</p>
              <p className="text-2xl font-bold text-neutral-900">{analytics?.totalSessions || 0}</p>
            </div>
            <Calendar className="w-8 h-8 text-neutral-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Completed</p>
              <p className="text-2xl font-bold text-neutral-900">{analytics?.completedSessions || 0}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Total Hours</p>
              <p className="text-2xl font-bold text-neutral-900">{analytics?.totalHours || 0}</p>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Earnings</p>
              <p className="text-2xl font-bold text-neutral-900">${analytics?.totalEarnings || 0}</p>
            </div>
            <span className="text-2xl">💰</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Donut Chart */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20 animate-scale-in">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Session Overview</h3>
          <DonutChart data={{
            completed: analytics?.completedSessions || 0,
            upcoming: analytics?.upcomingSessions || 0,
            cancelled: analytics?.cancelledSessions || 0,
            pending: analytics?.pendingSessions || 0
          }} />
        </div>

        {/* Bar Chart */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20 animate-scale-in" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Monthly Sessions</h3>
          <BarChart data={analytics?.monthlySessionsData || []} />
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20 animate-scale-in" style={{ animationDelay: '0.4s' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-neutral-900">All Upcoming Sessions</h2>
          <div className="relative">
            <Bell className="w-6 h-6 text-neutral-600 cursor-pointer hover:text-neutral-900 transition-colors" />
            {upcomingSessions.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {upcomingSessions.length}
              </span>
            )}
          </div>
        </div>

        {/* Sessions List */}
        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {upcomingSessions.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-500">No upcoming sessions</p>
            </div>
          ) : (
            upcomingSessions.map((session) => (
              <div 
                key={session.id}
                className="bg-white/95 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between hover:bg-white hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              >
                <div className="flex items-center space-x-4">
                  {/* Student Avatar */}
                  <div className="w-12 h-12 bg-neutral-400 hover:bg-neutral-500 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300">
                    <span className="text-white font-bold text-lg">
                      {getInitials(session.studentName)}
                    </span>
                  </div>
                  
                  {/* Session Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-neutral-900">
                      {session.studentName} - {session.subject}
                    </h4>
                    <p className="text-sm text-neutral-600">
                      <ClientOnly fallback={<span className="animate-pulse">Loading...</span>}>
                        {formatDate(session.sessionDate)} at {session.sessionTime} - {session.duration}
                      </ClientOnly>
                    </p>
                  </div>
                </div>
                
                {/* Action Button */}
                <Button
                  onClick={() => handleStartSession(session)}
                  className="bg-neutral-400 hover:bg-neutral-500 text-white"
                >
                  Start Session
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Session Start Modal */}
      <SessionStartModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSession(null);
        }}
        session={selectedSession}
        onConfirm={handleConfirmStart}
      />
    </div>
  );
}