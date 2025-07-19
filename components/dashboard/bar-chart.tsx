"use client";

import { useEffect, useRef } from "react";

interface BarChartProps {
  data: number[];
  labels?: string[];
}

export default function BarChart({ data, labels }: BarChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const months = labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
  const maxValue = Math.max(...data, 1);
  
  return (
    <div className="relative h-48">
      {/* Y-axis */}
      <div className="absolute left-0 top-0 h-full w-8 flex flex-col justify-between text-xs text-neutral-500">
        <span>{maxValue}</span>
        <span>{Math.floor(maxValue / 2)}</span>
        <span>0</span>
      </div>
      
      {/* Chart area */}
      <div className="ml-12 h-full relative">
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {[0, 1, 2].map((i) => (
            <div key={i} className="border-t border-neutral-200" />
          ))}
        </div>
        
        {/* Bars */}
        <div className="relative h-full flex items-end justify-around px-4">
          {data.map((value, index) => {
            const height = (value / maxValue) * 100;
            return (
              <div
                key={index}
                className="relative flex flex-col items-center"
                style={{ width: `${100 / data.length}%` }}
              >
                <div 
                  className="w-8 bg-neutral-400 rounded-t hover:bg-neutral-500 transition-all duration-300 cursor-pointer"
                  style={{ 
                    height: `${height}%`,
                    animation: `scaleY 1s ease-out ${0.5 + index * 0.2}s both`,
                    transformOrigin: 'bottom'
                  }}
                  title={`${months[index]}: ${value} sessions`}
                />
                <span className="text-xs text-neutral-600 mt-2">{months[index]}</span>
              </div>
            );
          })}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes scaleY {
          from { transform: scaleY(0); }
          to { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}