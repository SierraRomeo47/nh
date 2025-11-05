import React from 'react';
import { TccData } from '../types/index';

interface TccMeterProps {
  data: TccData;
  size?: 'sm' | 'md' | 'lg';
  showBreakdown?: boolean;
}

const TccMeter: React.FC<TccMeterProps> = ({ 
  data, 
  size = 'md', 
  showBreakdown = true 
}) => {
  const { fuelCost, etsCost, fuelEUCost, total } = data;
  
  // Calculate percentages for the visual breakdown
  const fuelPct = total > 0 ? (fuelCost / total) * 100 : 0;
  const etsPct = total > 0 ? (etsCost / total) * 100 : 0;
  const fuelEUPct = total > 0 ? (fuelEUCost / total) * 100 : 0;
  
  const sizeClasses = {
    sm: { container: 'w-32 h-32', text: 'text-sm', title: 'text-xs' },
    md: { container: 'w-40 h-40', text: 'text-base', title: 'text-sm' },
    lg: { container: 'w-48 h-48', text: 'text-lg', title: 'text-base' }
  };
  
  const classes = sizeClasses[size];
  
  // Determine color based on total cost
  const getTotalColor = (total: number) => {
    if (total < 50000) return 'text-green-400';
    if (total < 100000) return 'text-yellow-400';
    return 'text-red-400';
  };
  
  return (
    <div className="bg-card rounded-lg p-6 border border-subtle">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Total Compliance Cost</h3>
        <div className="text-xs text-gray-400">TCC Meter</div>
      </div>
      
      <div className="flex items-center justify-center mb-6">
        <div className={`relative ${classes.container}`}>
          {/* Circular progress ring */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background ring */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#374151"
              strokeWidth="8"
            />
            
            {/* Fuel cost segment */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#FF6A00"
              strokeWidth="8"
              strokeDasharray={`${fuelPct * 2.51} ${251.2 - fuelPct * 2.51}`}
              strokeDashoffset="0"
              className="transition-all duration-1000 ease-out"
            />
            
            {/* ETS cost segment */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#D90429"
              strokeWidth="8"
              strokeDasharray={`${etsPct * 2.51} ${251.2 - etsPct * 2.51}`}
              strokeDashoffset={`-${fuelPct * 2.51}`}
              className="transition-all duration-1000 ease-out delay-200"
            />
            
            {/* FuelEU cost segment */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="8"
              strokeDasharray={`${fuelEUPct * 2.51} ${251.2 - fuelEUPct * 2.51}`}
              strokeDashoffset={`-${(fuelPct + etsPct) * 2.51}`}
              className="transition-all duration-1000 ease-out delay-400"
            />
          </svg>
          
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={`font-bold ${getTotalColor(total)} ${classes.text}`}>
              €{(total / 1000).toFixed(0)}K
            </div>
            <div className={`text-gray-400 ${classes.title}`}>TCC</div>
          </div>
        </div>
      </div>
      
      {showBreakdown && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <span className="text-sm text-gray-300">Fuel Cost</span>
            </div>
            <span className="text-sm font-medium text-white">
              €{(fuelCost / 1000).toFixed(1)}K
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-accent-red"></div>
              <span className="text-sm text-gray-300">ETS Cost</span>
            </div>
            <span className="text-sm font-medium text-white">
              €{(etsCost / 1000).toFixed(1)}K
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-white"></div>
              <span className="text-sm text-gray-300">FuelEU Cost</span>
            </div>
            <span className="text-sm font-medium text-white">
              €{(fuelEUCost / 1000).toFixed(1)}K
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TccMeter;

