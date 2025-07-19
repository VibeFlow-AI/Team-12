"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BookingConfirmation from "./booking-confirmation";
import { cn } from "@/lib/utils";
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Calendar as CalendarIcon,
  User,
  MessageSquare,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentor: {
    id: string;
    name: string;
    subjects: string[];
    duration: string;
    avatarColor: {
      from: string;
      to: string;
    };
  } | null;
  onConfirm: (bookingData: any) => Promise<void>;
}

const timeSlots = [
  "09:00", "10:00", "11:00", "12:00", 
  "13:00", "14:00", "15:00", "16:00", 
  "17:00", "18:00", "19:00", "20:00"
];

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function BookingModal({ isOpen, onClose, mentor, onConfirm }: BookingModalProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Confirmation modal state
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);

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

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const days = [];
    
    // Previous month's trailing days
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: prevMonth.getDate() - i,
        isCurrentMonth: false,
        isToday: false,
        isPast: true
      });
    }
    
    // Current month's days
    const today = new Date();
    for (let date = 1; date <= daysInMonth; date++) {
      const day = new Date(year, month, date);
      const isToday = day.toDateString() === today.toDateString();
      const isPast = day < today && !isToday;
      
      days.push({
        date,
        isCurrentMonth: true,
        isToday,
        isPast,
        fullDate: day
      });
    }
    
    // Next month's leading days
    const remainingDays = 42 - days.length;
    for (let date = 1; date <= remainingDays; date++) {
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        isPast: false
      });
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const selectDate = (day: any) => {
    if (!day.isCurrentMonth || day.isPast) return;
    
    const selected = new Date(currentDate.getFullYear(), currentDate.getMonth(), day.date);
    setSelectedDate(selected);
    
    // Add subtle animation feedback
    const calendarElement = document.querySelector(`[data-date="${day.date}"]`);
    if (calendarElement) {
      calendarElement.classList.add('animate-pulse');
      setTimeout(() => {
        calendarElement.classList.remove('animate-pulse');
      }, 300);
    }
  };

  const formatSelectedDate = () => {
    if (!selectedDate) return "";
    return selectedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !subject.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      const bookingData = {
        mentorId: mentor?.id,
        sessionDate: selectedDate.toISOString(),
        sessionTime: selectedTime,
        subject: subject.trim(),
        message: message.trim(),
        duration: mentor?.duration || "1 hour"
      };

      await onConfirm(bookingData);
      
      // Show confirmation modal
      setBookingDetails({
        mentorName: mentor.name,
        date: formatSelectedDate(),
        time: selectedTime,
        subject: subject,
        duration: mentor.duration
      });
      setShowConfirmation(true);
      
      // Reset form
      setSelectedDate(null);
      setSelectedTime("");
      setSubject("");
      setMessage("");
    } catch (error) {
      console.error("Booking error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !mentor) return null;

  const calendarDays = generateCalendarDays();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-100">
            <div className="flex items-center space-x-4">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                style={{
                  background: `linear-gradient(135deg, ${mentor.avatarColor.from}, ${mentor.avatarColor.to})`
                }}
              >
                {getInitials(mentor.name)}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-neutral-900">
                  Book a session with {mentor.name}
                </h2>
                <p className="text-neutral-600">
                  Choose your preferred date and time
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Calendar Section */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
                  <CalendarIcon className="w-5 h-5 mr-2" />
                  Choose a date
                </h3>
                
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  <h4 className="text-lg font-semibold text-neutral-900">
                    {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h4>
                  
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 mb-6">
                  {/* Day Headers */}
                  {daysOfWeek.map(day => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-neutral-500">
                      {day}
                    </div>
                  ))}
                  
                  {/* Calendar Days */}
                  {calendarDays.map((day, index) => (
                    <button
                      key={index}
                      data-date={day.date}
                      onClick={() => selectDate(day)}
                      disabled={!day.isCurrentMonth || day.isPast}
                      className={cn(
                        "aspect-square p-2 text-sm font-medium rounded-lg transition-all duration-200",
                        "hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-black/20",
                        "hover:scale-105 active:scale-95",
                        {
                          "text-neutral-300 cursor-not-allowed": !day.isCurrentMonth || day.isPast,
                          "text-neutral-900": day.isCurrentMonth && !day.isPast,
                          "bg-blue-50 text-blue-600 font-semibold": day.isToday,
                          "bg-black text-white shadow-lg": selectedDate && day.fullDate && 
                            selectedDate.toDateString() === day.fullDate.toDateString()
                        }
                      )}
                    >
                      {day.date}
                    </button>
                  ))}
                </div>

                {/* Selected Date Display */}
                {selectedDate && (
                  <div className="p-4 bg-neutral-50 rounded-lg">
                    <p className="text-sm text-neutral-600">Selected date:</p>
                    <p className="font-semibold text-neutral-900">{formatSelectedDate()}</p>
                  </div>
                )}
              </div>

              {/* Time and Details Section */}
              <div className="space-y-6">
                {/* Time Selection */}
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Choose a time
                  </h3>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {timeSlots.map(time => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={cn(
                          "p-3 text-sm font-medium rounded-lg border-2 transition-all duration-200",
                          "hover:border-neutral-400 hover:bg-neutral-50",
                          selectedTime === time
                            ? "bg-black text-white border-black"
                            : "bg-white text-neutral-900 border-neutral-200"
                        )}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Session Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-neutral-900 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Session details
                  </h3>
                  
                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <Select value={subject} onValueChange={setSubject}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {mentor.subjects.map(subj => (
                          <SelectItem key={subj} value={subj}>
                            {subj}
                          </SelectItem>
                        ))}
                        <SelectItem value="General">General Mentoring</SelectItem>
                        <SelectItem value="Career">Career Guidance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="message">Message to mentor (optional)</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell your mentor what you'd like to focus on in this session..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Session Summary</h4>
                    <div className="space-y-1 text-sm text-blue-800">
                      <p><strong>Duration:</strong> {mentor.duration}</p>
                      <p><strong>Subject:</strong> {subject || "Not selected"}</p>
                      <p><strong>Date:</strong> {selectedDate ? formatSelectedDate() : "Not selected"}</p>
                      <p><strong>Time:</strong> {selectedTime || "Not selected"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-neutral-100">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              
              <Button
                onClick={handleSubmit}
                disabled={!selectedDate || !selectedTime || !subject.trim() || isLoading}
                className="bg-black hover:bg-neutral-800 text-white flex items-center space-x-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{isLoading ? "Booking..." : "Confirm Booking"}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Booking Confirmation Modal */}
      <BookingConfirmation
        isOpen={showConfirmation}
        onClose={() => {
          setShowConfirmation(false);
          onClose();
        }}
        bookingDetails={bookingDetails}
      />
    </div>
  );
}