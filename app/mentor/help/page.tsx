"use client";

import { HelpCircle, MessageSquare, Book, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MentorHelpPage() {
  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900">
          Help & Support
        </h1>
        <p className="text-neutral-600 mt-2">
          Get assistance and find answers to your questions
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Quick Help */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Quick Help</h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 hover:bg-neutral-50 rounded-lg cursor-pointer">
                <Book className="w-5 h-5 text-neutral-600 mt-0.5" />
                <div>
                  <p className="font-medium text-neutral-900">Getting Started Guide</p>
                  <p className="text-sm text-neutral-600">Learn the basics of being a mentor</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 hover:bg-neutral-50 rounded-lg cursor-pointer">
                <MessageSquare className="w-5 h-5 text-neutral-600 mt-0.5" />
                <div>
                  <p className="font-medium text-neutral-900">Session Management</p>
                  <p className="text-sm text-neutral-600">How to manage your sessions effectively</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 hover:bg-neutral-50 rounded-lg cursor-pointer">
                <HelpCircle className="w-5 h-5 text-neutral-600 mt-0.5" />
                <div>
                  <p className="font-medium text-neutral-900">Payment & Earnings</p>
                  <p className="text-sm text-neutral-600">Understanding your payment structure</p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQs */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Frequently Asked Questions</h3>
            
            <div className="space-y-3">
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer p-2 hover:bg-neutral-50 rounded">
                  <span className="font-medium text-neutral-900">How do I set my availability?</span>
                  <HelpCircle className="w-4 h-4 text-neutral-600 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="text-sm text-neutral-600 mt-2 pl-2">
                  You can set your availability in the Calendar section. Choose your preferred time slots and days.
                </p>
              </details>

              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer p-2 hover:bg-neutral-50 rounded">
                  <span className="font-medium text-neutral-900">When do I get paid?</span>
                  <HelpCircle className="w-4 h-4 text-neutral-600 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="text-sm text-neutral-600 mt-2 pl-2">
                  Payments are processed weekly every Friday for completed sessions from the previous week.
                </p>
              </details>

              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer p-2 hover:bg-neutral-50 rounded">
                  <span className="font-medium text-neutral-900">How do I handle difficult students?</span>
                  <HelpCircle className="w-4 h-4 text-neutral-600 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="text-sm text-neutral-600 mt-2 pl-2">
                  Our support team is here to help. Contact us immediately if you encounter any issues.
                </p>
              </details>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Contact Support</h3>
            
            <div className="space-y-4">
              <Button className="w-full justify-start bg-black hover:bg-neutral-800 text-white">
                <MessageSquare className="w-4 h-4 mr-2" />
                Live Chat
              </Button>

              <Button variant="outline" className="w-full justify-start">
                <Mail className="w-4 h-4 mr-2" />
                Email Support
              </Button>

              <Button variant="outline" className="w-full justify-start">
                <Phone className="w-4 h-4 mr-2" />
                Call Support
              </Button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Support Hours</h4>
              <p className="text-sm text-blue-800">
                Monday - Friday: 9:00 AM - 6:00 PM<br />
                Weekend: 10:00 AM - 4:00 PM
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200 mt-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">System Status</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-neutral-700">Platform Status</span>
                <span className="text-green-600 font-medium">All Systems Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-700">Payment System</span>
                <span className="text-green-600 font-medium">Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-700">Video Calling</span>
                <span className="text-green-600 font-medium">Operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}