"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/date-utils";
import ClientOnly from "@/components/client-only";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Search,
  Download,
  Eye,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";

interface MentorSession {
  id: string;
  studentName: string;
  studentEmail: string;
  subject: string;
  sessionDate: string;
  sessionTime: string;
  duration: string;
  status: string;
  paymentStatus?: string;
  bankSlipUrl?: string;
  message?: string;
  createdAt: string;
}

export default function MentorSessionsPage() {
  const { data: session } = useSession();
  const [sessions, setSessions] = useState<MentorSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<MentorSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    filterSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessions, filter, searchQuery]);

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/bookings');
      
      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }
      
      const data = await response.json();
      const mentorSessions: MentorSession[] = data.bookings.map((booking: any) => ({
        id: booking.id,
        studentName: booking.student?.name || 'Unknown',
        studentEmail: booking.student?.email || '',
        subject: booking.subject,
        sessionDate: booking.sessionDate,
        sessionTime: booking.sessionTime,
        duration: booking.duration,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        bankSlipUrl: booking.bankSlipUrl,
        message: booking.message,
        createdAt: booking.createdAt
      }));
      
      setSessions(mentorSessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const filterSessions = () => {
    let filtered = [...sessions];
    
    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(s => s.status === filter);
    }
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(s => 
        s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.studentEmail.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime());
    
    setFilteredSessions(filtered);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-neutral-400" />;
    }
  };

  const getPaymentStatusBadge = (paymentStatus?: string) => {
    switch (paymentStatus) {
      case 'verified':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Verified</span>;
      case 'pending_verification':
        return <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-700">Pending</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">Rejected</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-neutral-100 text-neutral-700">N/A</span>;
    }
  };

  const handleApproveSession = async (sessionId: string) => {
    try {
      // TODO: Implement session approval API
      toast.success("Session approved successfully");
      fetchSessions();
    } catch (error) {
      toast.error("Failed to approve session");
    }
  };

  const handleRejectSession = async (sessionId: string) => {
    try {
      // TODO: Implement session rejection API
      toast.success("Session rejected");
      fetchSessions();
    } catch (error) {
      toast.error("Failed to reject session");
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

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 rounded w-1/3 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-neutral-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900">
          Session Management
        </h1>
        <p className="text-neutral-600 mt-2">
          Manage and track all your mentoring sessions
        </p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-200 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by student name, email, or subject..."
                className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map((status) => (
              <Button
                key={status}
                variant={filter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(status)}
                className={cn(
                  filter === status && "bg-black hover:bg-neutral-800 text-white"
                )}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                {status !== 'all' && (
                  <span className="ml-2 text-xs">
                    ({sessions.filter(s => s.status === status).length})
                  </span>
                )}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {filteredSessions.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <Calendar className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-500">No sessions found</p>
          </div>
        ) : (
          filteredSessions.map((session) => (
            <div
              key={session.id}
              className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  {/* Student Avatar */}
                  <div className="w-12 h-12 bg-neutral-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">
                      {getInitials(session.studentName)}
                    </span>
                  </div>

                  {/* Session Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-neutral-900 text-lg">
                          {session.subject} with {session.studentName}
                        </h3>
                        <p className="text-sm text-neutral-600">{session.studentEmail}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(session.status)}
                        <span className={cn(
                          "font-medium capitalize",
                          session.status === 'confirmed' ? 'text-green-600' :
                          session.status === 'pending' ? 'text-amber-600' :
                          session.status === 'cancelled' ? 'text-red-600' :
                          session.status === 'completed' ? 'text-blue-600' :
                          'text-neutral-600'
                        )}>
                          {session.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6 text-sm text-neutral-600 mb-3">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <ClientOnly fallback={<span className="animate-pulse">Loading...</span>}>
                          {formatDate(session.sessionDate)}
                        </ClientOnly>
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {session.sessionTime}
                      </span>
                      <span className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {session.duration}
                      </span>
                    </div>

                    {/* Payment Status */}
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-neutral-600">Payment:</span>
                      {getPaymentStatusBadge(session.paymentStatus)}
                      {session.bankSlipUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(session.bankSlipUrl, '_blank')}
                          className="flex items-center space-x-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View Slip</span>
                        </Button>
                      )}
                    </div>

                    {/* Message */}
                    {session.message && (
                      <div className="mt-3 p-3 bg-neutral-50 rounded-lg">
                        <p className="text-sm text-neutral-700">
                          <span className="font-medium">Note:</span> {session.message}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 ml-4">
                  {session.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleApproveSession(session.id)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectSession(session.id)}
                        className="border-red-600 text-red-600 hover:bg-red-50"
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {session.status === 'confirmed' && new Date(session.sessionDate) > new Date() && (
                    <Button
                      size="sm"
                      className="bg-neutral-400 hover:bg-neutral-500 text-white"
                    >
                      Start Session
                    </Button>
                  )}
                  {session.status === 'completed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center space-x-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>Report</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredSessions.length > 10 && (
        <div className="mt-8 flex justify-center">
          <Button variant="outline" className="flex items-center space-x-2">
            <span>Load More</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}