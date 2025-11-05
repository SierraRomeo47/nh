import React from 'react';
import { Task } from '../types/index';

interface TaskCardProps {
  task: Task;
  onStart?: (taskId: string) => void;
  onComplete?: (taskId: string) => void;
  showSparkline?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onStart, 
  onComplete, 
  showSparkline = true 
}) => {
  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-blue-600 text-white';
      case 'IN_PROGRESS': return 'bg-yellow-600 text-white';
      case 'COMPLETED': return 'bg-green-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };
  
  const getTypeIcon = (type: Task['type']) => {
    switch (type) {
      case 'SGM_ENABLE': return '⚡';
      case 'TRIM_OPTIMIZE': return '📐';
      case 'ECO_RPM': return '🎯';
      case 'SPEED_OPTIMIZE': return '🚢';
      case 'VFD_ENABLE': return '⚙️';
      default: return '📋';
    }
  };
  
  const generateMockSparkline = () => {
    // Generate simple mock sparkline data
    const points = 20;
    const data = [];
    for (let i = 0; i < points; i++) {
      // Simulate improvement over time
      const baseValue = 50;
      const improvement = (i / points) * Math.abs(task.expectedDeltaFuel) * 2;
      const noise = (Math.random() - 0.5) * 5;
      data.push(baseValue - improvement + noise);
    }
    return data;
  };
  
  const sparklineData = generateMockSparkline();
  const maxVal = Math.max(...sparklineData);
  const minVal = Math.min(...sparklineData);
  
  const createSparklinePath = () => {
    const width = 80;
    const height = 20;
    
    return sparklineData.map((value, index) => {
      const x = (index / (sparklineData.length - 1)) * width;
      const y = height - ((value - minVal) / (maxVal - minVal)) * height;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };
  
  return (
    <div className="bg-card rounded-lg p-6 border border-subtle hover:border-primary transition-colors duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{getTypeIcon(task.type)}</div>
          <div>
            <h3 className="font-semibold text-white text-sm">{task.title}</h3>
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
              {task.status.replace('_', ' ')}
            </span>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm font-bold text-primary">+{task.points} pts</div>
          {showSparkline && task.status !== 'AVAILABLE' && (
            <div className="mt-1">
              <svg width="80" height="20" className="opacity-60">
                <path
                  d={createSparklinePath()}
                  fill="none"
                  stroke="#FF6A00"
                  strokeWidth="1.5"
                  className="drop-shadow-sm"
                />
              </svg>
            </div>
          )}
        </div>
      </div>
      
      <p className="text-sm text-gray-300 mb-4">{task.description}</p>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-xs text-gray-400">Expected ΔFuel</div>
          <div className={`text-sm font-medium ${task.expectedDeltaFuel < 0 ? 'text-green-400' : 'text-red-400'}`}>
            {task.expectedDeltaFuel > 0 ? '+' : ''}{task.expectedDeltaFuel.toFixed(1)}t
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-400">Expected ΔCO₂</div>
          <div className={`text-sm font-medium ${task.expectedDeltaCo2 < 0 ? 'text-green-400' : 'text-red-400'}`}>
            {task.expectedDeltaCo2 > 0 ? '+' : ''}{task.expectedDeltaCo2.toFixed(1)}t
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">
          Created {new Date(task.createdAt).toLocaleDateString()}
        </div>
        
        <div className="flex space-x-2">
          {task.status === 'AVAILABLE' && onStart && (
            <button
              onClick={() => onStart(task.id)}
              className="px-3 py-1 bg-primary text-white text-xs font-medium rounded hover:bg-primary/80 transition-colors"
            >
              Start Task
            </button>
          )}
          
          {task.status === 'IN_PROGRESS' && onComplete && (
            <button
              onClick={() => onComplete(task.id)}
              className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors"
            >
              Complete
            </button>
          )}
          
          {task.status === 'COMPLETED' && (
            <div className="flex items-center space-x-1 text-green-400 text-xs">
              <span>✓</span>
              <span>Completed</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Risk checks indicator */}
      <div className="mt-3 pt-3 border-t border-subtle">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Safety Checks</span>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-green-400">Passed</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;

