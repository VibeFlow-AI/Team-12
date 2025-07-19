"use client";

import { DollarSign, TrendingUp, Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MentorEarningsPage() {
  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900">
          Earnings
        </h1>
        <p className="text-neutral-600 mt-2">
          Track your income and payment history
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Total Earnings</p>
              <p className="text-2xl font-bold text-neutral-900">$0</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">This Month</p>
              <p className="text-2xl font-bold text-neutral-900">$0</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Pending</p>
              <p className="text-2xl font-bold text-neutral-900">$0</p>
            </div>
            <TrendingUp className="w-8 h-8 text-amber-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Hourly Rate</p>
              <p className="text-2xl font-bold text-neutral-900">$50</p>
            </div>
            <span className="text-2xl">⏰</span>
          </div>
        </div>
      </div>

      {/* Earnings placeholder */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-neutral-200">
        <div className="text-center py-16">
          <DollarSign className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-700 mb-2">Earnings History Coming Soon</h3>
          <p className="text-neutral-500 mb-6">
            Detailed payment history and analytics will be available soon.
          </p>
          <Button className="bg-black hover:bg-neutral-800 text-white">
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </Button>
        </div>
      </div>
    </div>
  );
}