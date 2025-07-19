"use client";

import { MessageSquare, Send, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MentorMessagesPage() {
  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900">
          Messages
        </h1>
        <p className="text-neutral-600 mt-2">
          Communicate with your students
        </p>
      </div>

      {/* Messages placeholder */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-neutral-200">
        <div className="text-center py-16">
          <MessageSquare className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-700 mb-2">Messaging System Coming Soon</h3>
          <p className="text-neutral-500 mb-6">
            Direct messaging with students will be available soon.
          </p>
          <Button className="bg-black hover:bg-neutral-800 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Start Conversation
          </Button>
        </div>
      </div>
    </div>
  );
}