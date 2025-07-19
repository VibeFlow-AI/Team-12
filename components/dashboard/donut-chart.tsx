"use client";

import { useEffect, useRef } from "react";

interface DonutChartProps {
  data: {
    completed: number;
    upcoming: number;
    cancelled: number;
    pending: number;
  };
}

export default function DonutChart({ data }: DonutChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 85;
    const lineWidth = 30;
    
    // Calculate total and percentages
    const total = data.completed + data.upcoming + data.cancelled + data.pending;
    if (total === 0) {
      // Draw empty state
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = '#f3f4f6';
      ctx.lineWidth = lineWidth;
      ctx.stroke();
      return;
    }
    
    const segments = [
      { value: data.completed, color: '#a3a3a3', label: 'Completed' },
      { value: data.upcoming, color: '#d4d4d4', label: 'Upcoming' },
      { value: data.cancelled, color: '#e5e5e5', label: 'Cancelled' },
      { value: data.pending, color: '#f5f5f5', label: 'Pending' }
    ];
    
    // Draw segments
    let currentAngle = -Math.PI / 2; // Start at top
    
    segments.forEach((segment, index) => {
      if (segment.value === 0) return;
      
      const segmentAngle = (segment.value / total) * 2 * Math.PI;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + segmentAngle);
      ctx.strokeStyle = segment.color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.stroke();
      
      currentAngle += segmentAngle;
    });
    
  }, [data]);
  
  const total = data.completed + data.upcoming + data.cancelled + data.pending;
  const segments = [
    { value: data.completed, color: '#a3a3a3', label: 'Completed Sessions' },
    { value: data.upcoming, color: '#d4d4d4', label: 'Upcoming' },
    { value: data.cancelled, color: '#e5e5e5', label: 'Cancelled' },
    { value: data.pending, color: '#f5f5f5', label: 'Pending' }
  ].filter(s => s.value > 0);
  
  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        <canvas 
          ref={canvasRef}
          width={200} 
          height={200}
          className="animate-draw"
        />
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-3xl font-bold text-neutral-900">{total}</p>
            <p className="text-sm text-neutral-600">Total</p>
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="ml-8 space-y-3">
        {segments.map((segment, index) => (
          <div 
            key={index}
            className="flex items-center space-x-3 cursor-pointer hover:scale-105 transition-transform"
          >
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: segment.color }}
            />
            <div className="text-sm text-neutral-700">
              <span className="font-medium">{segment.label}</span>
              <span className="text-neutral-500 ml-2">({segment.value})</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}