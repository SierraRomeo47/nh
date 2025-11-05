import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import TaskCard from '../components/TaskCard';
import { Task, Recommendation, EnergySavingsMetrics } from '../types/index';
import { 
  mockTasks, 
  fetchRecommendations, 
  applyRecommendation, 
  getRoleSpecificTasks, 
  fetchEnergySavingsMetrics,
  getEnvironmentalImpact 
} from '../services/mockApi';
import { useUser } from '../contexts/UserContext';

const CrewTasks: React.FC = () => {
  const { user } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentShip] = useState('1'); // Mock current ship ID
  const [efficiencyScore, setEfficiencyScore] = useState(78);
  const [todayFuelSaved, setTodayFuelSaved] = useState(2.3);
  const [todayCo2Saved, setTodayCo2Saved] = useState(7.1);
  const [weeklyRank, setWeeklyRank] = useState(3);
  const [energyMetrics, setEnergyMetrics] = useState<EnergySavingsMetrics | null>(null);
  const [environmentalImpact, setEnvironmentalImpact] = useState({
    totalCo2Saved: 0,
    totalFuelSaved: 0,
    environmentalScore: 0
  });

  useEffect(() => {
    const loadTasks = async () => {
      try {
        if (!user) return;
        
        // Load role-specific tasks
        const roleTasks = await getRoleSpecificTasks(currentShip, user.role);
        setTasks(roleTasks);
        
        // Load energy savings metrics
        const metrics = await fetchEnergySavingsMetrics(currentShip, user.id);
        if (metrics.length > 0) {
          setEnergyMetrics(metrics[0]);
        }
        
        // Load environmental impact data
        const impact = await getEnvironmentalImpact(currentShip);
        setEnvironmentalImpact(impact);
        
      } catch (error) {
        console.error('Failed to load tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [currentShip, user]);

  const handleStartTask = async (taskId: string) => {
    try {
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, status: 'IN_PROGRESS' as const }
            : task
        )
      );
    } catch (error) {
      console.error('Failed to start task:', error);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      // Apply the recommendation (mock)
      await applyRecommendation(task.id, 'crew-user-1');

      // Update task status and add some points/savings
      setTasks(prevTasks => 
        prevTasks.map(t => 
          t.id === taskId 
            ? { ...t, status: 'COMPLETED' as const, completedAt: new Date().toISOString() }
            : t
        )
      );

      // Update daily stats
      setTodayFuelSaved(prev => prev + Math.abs(task.expectedDeltaFuel));
      setTodayCo2Saved(prev => prev + Math.abs(task.expectedDeltaCo2));
      setEfficiencyScore(prev => Math.min(100, prev + 2));
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  const availableTasks = tasks.filter(t => t.status === 'AVAILABLE');
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS');
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED');
  
  // Calculate role-specific metrics
  const energyTasks = tasks.filter(t => t.category === 'ENERGY_SAVING');
  const environmentalTasks = tasks.filter(t => t.category === 'ENVIRONMENTAL');
  const completedEnergyTasks = energyTasks.filter(t => t.status === 'COMPLETED');
  const completedEnvironmentalTasks = environmentalTasks.filter(t => t.status === 'COMPLETED');
  
  const getRoleDisplayName = () => {
    if (!user) return 'Crew Member';
    switch (user.role) {
      case 'CAPTAIN': return 'Captain';
      case 'ENGINEER': return 'Marine Engineer';
      case 'CHIEF_ENGINEER': return 'Chief Engineer';
      case 'OFFICER': return 'Deck Officer';
      case 'CREW': return 'Crew Member';
      case 'OPERATIONS_SUPERINTENDENT': return 'Operations Superintendent';
      default: return 'Marine Professional';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Role-specific Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          {getRoleDisplayName()} Tasks & Energy Savings
        </h1>
        <p className="text-gray-400">
          Complete energy-saving tasks to improve vessel efficiency and earn points in the crew league.
        </p>
      </div>

      {/* Enhanced Daily Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">
              {efficiencyScore}
            </div>
            <div className="text-sm text-gray-400">Efficiency Score</div>
            <div className="text-xs text-gray-500 mt-1">0-100 scale</div>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {environmentalImpact.totalFuelSaved.toFixed(1)}t
            </div>
            <div className="text-sm text-gray-400">Total Fuel Saved</div>
            <div className="text-xs text-gray-500 mt-1">All time</div>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {environmentalImpact.totalCo2Saved.toFixed(1)}t
            </div>
            <div className="text-sm text-gray-400">CO₂ Saved</div>
            <div className="text-xs text-gray-500 mt-1">Environmental impact</div>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">
              #{weeklyRank}
            </div>
            <div className="text-sm text-gray-400">Weekly League Rank</div>
            <div className="text-xs text-gray-500 mt-1">of 7 vessels</div>
          </div>
        </Card>
      </div>

      {/* Role-specific Energy Metrics */}
      {energyMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400 mb-2">
                {energyMetrics.tasksCompleted}
              </div>
              <div className="text-sm text-gray-400">Tasks Completed</div>
              <div className="text-xs text-gray-500 mt-1">This week</div>
            </div>
          </Card>
          
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400 mb-2">
                {energyMetrics.pointsEarned}
              </div>
              <div className="text-sm text-gray-400">Points Earned</div>
              <div className="text-xs text-gray-500 mt-1">League points</div>
            </div>
          </Card>
          
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400 mb-2">
                {energyMetrics.badgesEarned.length}
              </div>
              <div className="text-sm text-gray-400">Badges Earned</div>
              <div className="text-xs text-gray-500 mt-1">Achievements</div>
            </div>
          </Card>
        </div>
      )}

      {/* Task Categories Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-white mb-4">Energy Saving Tasks</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Available</span>
              <span className="text-white font-semibold">{energyTasks.filter(t => t.status === 'AVAILABLE').length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">In Progress</span>
              <span className="text-blue-400 font-semibold">{energyTasks.filter(t => t.status === 'IN_PROGRESS').length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Completed</span>
              <span className="text-green-400 font-semibold">{completedEnergyTasks.length}</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-white mb-4">Environmental Tasks</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Available</span>
              <span className="text-white font-semibold">{environmentalTasks.filter(t => t.status === 'AVAILABLE').length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">In Progress</span>
              <span className="text-blue-400 font-semibold">{environmentalTasks.filter(t => t.status === 'IN_PROGRESS').length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Completed</span>
              <span className="text-green-400 font-semibold">{completedEnvironmentalTasks.length}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* In Progress Tasks */}
      {inProgressTasks.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">In Progress Tasks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inProgressTasks.map(task => (
              <Card key={task.id} className="relative">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-blue-400 bg-blue-400/20 px-2 py-1 rounded">
                      {task.category}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      task.priority === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                      task.priority === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                      task.priority === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {task.estimatedDuration}min
                  </div>
                </div>
                
                <h3 className="font-semibold text-white mb-2">{task.title}</h3>
                <p className="text-sm text-gray-400 mb-4">{task.description}</p>
                
                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm">
                    <div className="text-green-400">+{task.points} pts</div>
                    <div className="text-gray-500">Fuel: {task.expectedDeltaFuel.toFixed(1)}t</div>
                  </div>
                  <div className="text-sm text-gray-500">
                    CO₂: {task.expectedDeltaCo2.toFixed(1)}t
                  </div>
                </div>
                
                <button
                  onClick={() => handleCompleteTask(task.id)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Complete Task
                </button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Available Tasks */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Available Tasks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableTasks.map(task => (
            <Card key={task.id} className="relative">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-primary bg-primary/20 px-2 py-1 rounded">
                    {task.category}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    task.priority === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                    task.priority === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                    task.priority === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {task.priority}
                  </span>
                </div>
                <div className="text-sm text-gray-400">
                  {task.estimatedDuration}min
                </div>
              </div>
              
              <h3 className="font-semibold text-white mb-2">{task.title}</h3>
              <p className="text-sm text-gray-400 mb-4">{task.description}</p>
              
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm">
                  <div className="text-primary">+{task.points} pts</div>
                  <div className="text-gray-500">Fuel: {task.expectedDeltaFuel.toFixed(1)}t</div>
                </div>
                <div className="text-sm text-gray-500">
                  CO₂: {task.expectedDeltaCo2.toFixed(1)}t
                </div>
              </div>
              
              <button
                onClick={() => handleStartTask(task.id)}
                className="w-full bg-primary hover:bg-primary/80 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Start Task
              </button>
            </Card>
          ))}
        </div>
      </div>

      {/* Recently Completed */}
      {completedTasks.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Recently Completed</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedTasks.slice(0, 6).map(task => (
              <Card key={task.id} className="relative border-green-500/30">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-green-400 bg-green-400/20 px-2 py-1 rounded">
                      {task.category}
                    </span>
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                      COMPLETED
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {task.estimatedDuration}min
                  </div>
                </div>
                
                <h3 className="font-semibold text-white mb-2">{task.title}</h3>
                <p className="text-sm text-gray-400 mb-4">{task.description}</p>
                
                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm">
                    <div className="text-green-400">+{task.points} pts earned</div>
                    <div className="text-gray-500">Fuel: {task.expectedDeltaFuel.toFixed(1)}t saved</div>
                  </div>
                  <div className="text-sm text-gray-500">
                    CO₂: {task.expectedDeltaCo2.toFixed(1)}t saved
                  </div>
                </div>
                
                <div className="text-xs text-green-400">
                  Completed: {task.completedAt ? new Date(task.completedAt).toLocaleString() : 'Recently'}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Safety Notice */}
      <Card>
        <div className="flex items-start space-x-3">
          <div className="text-2xl">⚠️</div>
          <div>
            <h3 className="font-semibold text-white mb-2">Safety First</h3>
            <p className="text-sm text-gray-400">
              All efficiency recommendations have passed safety checks. Always prioritize vessel safety 
              and crew wellbeing over efficiency gains. Report any concerns to the bridge immediately.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CrewTasks;

