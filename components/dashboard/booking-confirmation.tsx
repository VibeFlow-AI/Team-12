"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, Calendar, Clock, User, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookingConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  bookingDetails: {
    mentorName: string;
    date: string;
    time: string;
    subject: string;
    duration: string;
  } | null;
}

export default function BookingConfirmation({ 
  isOpen, 
  onClose, 
  bookingDetails 
}: BookingConfirmationProps) {
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

  if (!isOpen || !bookingDetails) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md mx-4">
        <div className="bg-white rounded-2xl shadow-2xl border border-white/20 p-8 text-center animate-in zoom-in-95 duration-300">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-green-600" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">
            Booking Confirmed!
          </h2>
          
          <p className="text-neutral-600 mb-8">
            Your session has been successfully booked. The mentor will confirm shortly.
          </p>

          {/* Booking Details */}
          <div className="bg-neutral-50 rounded-lg p-6 mb-8 text-left">
            <h3 className="font-semibold text-neutral-900 mb-4">Session Details</h3>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <User className="w-4 h-4 text-neutral-500" />
                <span className="text-sm text-neutral-700">{bookingDetails.mentorName}</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <Calendar className="w-4 h-4 text-neutral-500" />
                <span className="text-sm text-neutral-700">{bookingDetails.date}</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <Clock className="w-4 h-4 text-neutral-500" />
                <span className="text-sm text-neutral-700">
                  {bookingDetails.time} ({bookingDetails.duration})
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                <BookOpen className="w-4 h-4 text-neutral-500" />
                <span className="text-sm text-neutral-700">{bookingDetails.subject}</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <Button 
            onClick={onClose}
            className="w-full bg-black hover:bg-neutral-800 text-white"
          >
            Got it!
          </Button>
        </div>
      </div>
    </div>
  );
}