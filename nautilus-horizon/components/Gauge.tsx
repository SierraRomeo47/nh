
import React from 'react';

interface GaugeProps {
  value: number;
  maxValue: number;
  label: string;
  unit: string;
  size?: number;
  strokeWidth?: number;
}

const Gauge: React.FC<GaugeProps> = ({
  value,
  maxValue,
  label,
  unit,
  size = 200,
  strokeWidth = 20,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(value / maxValue, 0), 1);
  const offset = circumference * (1 - progress);

  const getStrokeColor = () => {
    if (progress > 0.8) return 'stroke-accent-a'; // Red
    if (progress > 0.5) return 'stroke-yellow-500';
    return 'stroke-primary'; // Orange
  };
  
  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          className="stroke-subtle"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          className={`transition-all duration-500 ease-in-out ${getStrokeColor()}`}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold text-accent-b">
          {value.toLocaleString('en-US', { maximumFractionDigits: 0 })}
        </span>
        <span className="text-sm text-gray-400">{unit}</span>
        <span className="text-md font-semibold text-accent-b mt-1">{label}</span>
      </div>
    </div>
  );
};

export default Gauge;
