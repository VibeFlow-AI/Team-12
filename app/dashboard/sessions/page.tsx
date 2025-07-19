"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  User,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  X
} from "lucide-react";
import { toast } from "sonner";

interface BookingSession {
  id: string;
  sessionDate: string;
  sessionTime: string;
  duration: string;
  subject: string;
  message: string;
  status: string;
  bankSlipUrl?: string;
  paymentStatus?: string;
  createdAt: string;
  mentor: {
    name: string;
    email: string;
  };
}

interface SessionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: BookingSession | null;
}

function SessionDetailsModal({ isOpen, onClose, session }: SessionDetailsModalProps) {
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'text-green-600';
      case 'pending': return 'text-amber-600';
      case 'cancelled': return 'text-red-600';
      default: return 'text-neutral-600';
    }
  };

  const getPaymentStatusColor = (paymentStatus?: string) => {
    switch (paymentStatus) {
      case 'verified': return 'text-green-600';
      case 'pending_verification': return 'text-amber-600';
      case 'rejected': return 'text-red-600';
      default: return 'text-neutral-600';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md mx-4">
        <div className="bg-white rounded-2xl p-8 shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-neutral-900">Session Details</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Content */}
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-neutral-600">Mentor:</span>
              <span className="font-medium">{session.mentor.name}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-neutral-600">Date:</span>
              <span className="font-medium">
                {new Date(session.sessionDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-neutral-600">Time:</span>
              <span className="font-medium">{session.sessionTime}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-neutral-600">Duration:</span>
              <span className="font-medium">{session.duration}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-neutral-600">Subject:</span>
              <span className="font-medium">{session.subject}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-neutral-600">Status:</span>
              <span className={cn("font-medium capitalize", getStatusColor(session.status))}>
                {session.status}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-neutral-600">Payment:</span>
              <span className={cn("font-medium capitalize", getPaymentStatusColor(session.paymentStatus || ''))}>
                {session.paymentStatus ? session.paymentStatus.replace('_', ' ') : 'Not specified'}
              </span>
            </div>
            
            {session.message && (
              <div className="pt-4 border-t">
                <span className="text-neutral-600 block mb-2">Message:</span>
                <p className="text-neutral-900 text-sm bg-neutral-50 p-3 rounded-lg">
                  {session.message}
                </p>
              </div>
            )}
          </div>
          
          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Close
            </Button>
            
            {session.status === 'confirmed' && (
              <Button className="flex-1 bg-black hover:bg-neutral-800 text-white">
                Join Session
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookedSessionsPage() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<BookingSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<BookingSession | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      fetchBookings();
    }
  }, [session]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/bookings');
      
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      
      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load your sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return <CheckCircle className="w-3 h-3 text-green-600" />;
      case 'pending':
        return <AlertCircle className="w-3 h-3 text-amber-600" />;
      case 'cancelled':
        return <XCircle className="w-3 h-3 text-red-600" />;
      default:
        return <AlertCircle className="w-3 h-3 text-neutral-400" />;
    }
  };

  const getProgressPercentage = (session: BookingSession) => {
    const now = new Date();
    const sessionDate = new Date(session.sessionDate);
    const createdDate = new Date(session.createdAt);
    
    // Calculate progress based on time until session
    const totalTime = sessionDate.getTime() - createdDate.getTime();
    const elapsedTime = now.getTime() - createdDate.getTime();
    
    if (session.status === 'completed') return 100;
    if (session.status === 'cancelled') return 0;
    if (now > sessionDate) return 100;
    
    const progress = Math.max(0, Math.min(90, (elapsedTime / totalTime) * 100));
    return progress;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const openSessionDetails = (session: BookingSession) => {
    setSelectedSession(session);
    setIsModalOpen(true);
  };

  const closeSessionDetails = () => {
    setIsModalOpen(false);
    setSelectedSession(null);
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900">
            Booked Sessions
          </h1>
        </div>
        
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-neutral-200 rounded-2xl p-6 animate-pulse">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-neutral-300 rounded-full mr-6"></div>
                <div className="flex-1">
                  <div className="h-5 bg-neutral-300 rounded w-48 mb-2"></div>
                  <div className="h-4 bg-neutral-300 rounded w-32 mb-4"></div>
                  <div className="h-1 bg-neutral-300 rounded mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-neutral-300 rounded"></div>
                    <div className="h-3 bg-neutral-300 rounded w-4/5"></div>
                    <div className="h-3 bg-neutral-300 rounded w-3/4"></div>
                  </div>
                </div>
                <div className="ml-6">
                  <div className="h-10 bg-neutral-300 rounded w-32"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900">
            Booked Sessions
          </h1>
        </div>
        
        <div className="text-center py-16">
          <Calendar className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-700 mb-2">No sessions booked</h3>
          <p className="text-neutral-500 mb-6">You haven&apos;t booked any sessions yet. Start by exploring available mentors.</p>
          <Button asChild className="bg-black hover:bg-neutral-800 text-white px-6 py-3">
            <Link href="/samples">
              Discover Mentors
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900">
          Booked Sessions
        </h1>
        <p className="text-neutral-600 mt-2">
          Manage and track your upcoming mentoring sessions
        </p>
      </div>

      {/* Sessions List */}
      <div className="space-y-6">
        {bookings.map((booking, index) => {
          const progress = getProgressPercentage(booking);
          
          return (
            <div 
              key={booking.id}
              className="bg-neutral-200 hover:bg-neutral-300 rounded-2xl p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => openSessionDetails(booking)}
            >
              {/* Status Indicator */}
              <div className="absolute top-4 right-4">
                {getStatusIcon(booking.status)}
              </div>
              
              <div className="flex items-center">
                {/* Session Avatar */}
                <div className="w-12 h-12 bg-neutral-400 hover:bg-neutral-500 rounded-full flex items-center justify-center mr-6 flex-shrink-0 transition-all duration-300">
                  <span className="text-white font-bold text-lg">
                    {getInitials(booking.mentor.name)}
                  </span>
                </div>
                
                {/* Session Content */}
                <div className="flex-1 min-w-0">
                  {/* Session Info */}
                  <div className="mb-4">
                    <h3 className="font-semibold text-neutral-900 text-lg mb-1">
                      {booking.subject} with {booking.mentor.name}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-neutral-600">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(booking.sessionDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {booking.sessionTime}
                      </span>
                      <span className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {booking.duration}
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-neutral-600 mb-1">
                      <span>Session Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-neutral-300 h-1 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-neutral-500 transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Additional Info */}
                  <div className="space-y-1 text-sm text-neutral-600">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className={cn("font-medium capitalize", 
                        booking.status === 'confirmed' ? 'text-green-600' :
                        booking.status === 'pending' ? 'text-amber-600' :
                        'text-red-600'
                      )}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment:</span>
                      <span className={cn("font-medium capitalize",
                        booking.paymentStatus === 'verified' ? 'text-green-600' :
                        booking.paymentStatus === 'pending_verification' ? 'text-amber-600' :
                        booking.paymentStatus === 'rejected' ? 'text-red-600' :
                        'text-neutral-600'
                      )}>
                        {booking.paymentStatus ? booking.paymentStatus.replace('_', ' ') : 'Not specified'}
                      </span>
                    </div>
                    {booking.message && (
                      <div className="pt-2">
                        <span className="text-neutral-500">Note: </span>
                        <span className="text-neutral-700">{booking.message.slice(0, 80)}{booking.message.length > 80 ? '...' : ''}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Action Button */}
                <div className="ml-6 flex-shrink-0">
                  <Button
                    variant="outline"
                    className="bg-neutral-400 hover:bg-neutral-500 text-white border-0 flex items-center space-x-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      openSessionDetails(booking);
                    }}
                  >
                    <span>View Details</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Session Details Modal */}
      <SessionDetailsModal
        isOpen={isModalOpen}
        onClose={closeSessionDetails}
        session={selectedSession}
      />
    </div>
  );
}