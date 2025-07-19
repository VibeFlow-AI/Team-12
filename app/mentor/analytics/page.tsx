"use client";

import { BarChart3, TrendingUp, Users, Target } from "lucide-react";
import DonutChart from "@/components/dashboard/donut-chart";
import BarChart from "@/components/dashboard/bar-chart";

export default function MentorAnalyticsPage() {
  const mockData = {
    completed: 15,
    upcoming: 8,
    cancelled: 2,
    pending: 5
  };

  const monthlyData = [12, 19, 15, 25, 22, 18];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900">
          Analytics
        </h1>
        <p className="text-neutral-600 mt-2">
          Track your performance and growth
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Avg Rating</p>
              <p className="text-2xl font-bold text-neutral-900">4.8</p>
            </div>
            <Target className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Total Students</p>
              <p className="text-2xl font-bold text-neutral-900">24</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Success Rate</p>
              <p className="text-2xl font-bold text-neutral-900">94%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Response Time</p>
              <p className="text-2xl font-bold text-neutral-900">2h</p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Session Status Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Session Status Distribution</h3>
          <DonutChart data={mockData} />
        </div>

        {/* Monthly Trends */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Monthly Session Trends</h3>
          <BarChart data={monthlyData} labels={['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']} />
        </div>
      </div>
    </div>
  );
}