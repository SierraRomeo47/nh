// Role-Based Dashboard Component

import React from 'react';
import { useUser } from '../contexts/UserContext';
import { UserRole } from '../contexts/UserContext';
import { WidgetType, Permission } from '../types/user';
import Card from './Card';
import Gauge from './Gauge';
import TccMeter from './TccMeter';
import EuaTicker from './EuaTicker';
import LeagueTable from './LeagueTable';
import TaskCard from './TaskCard';
import LoadingSpinner from './LoadingSpinner';
import WasteHeatRecovery from './WasteHeatRecovery';

// Mock data for different widgets
const mockFleetData = {
  activeVoyages: 7,
  fuelEuSurplus: 2,
  fuelEuDeficit: 5,
  totalEuaExposure: 2739
};

const mockTccData = {
  fuelCost: 619400,
  etsCost: 207000,
  fuelEUCost: 1200,
  total: 827600
};

const mockTasks = [
  { id: '1', title: 'Check fuel levels', description: 'Verify fuel tank levels before departure', status: 'pending', priority: 'high' },
  { id: '2', title: 'Engine maintenance', description: 'Routine engine inspection and maintenance', status: 'in_progress', priority: 'medium' },
  { id: '3', title: 'Safety drill', description: 'Conduct monthly safety drill with crew', status: 'completed', priority: 'low' }
];

const mockLeagueData = [
  { rank: 1, name: 'MV Neptune', points: 1250, efficiency: 95 },
  { rank: 2, name: 'MV Poseidon', points: 1180, efficiency: 92 },
  { rank: 3, name: 'MV Triton', points: 1100, efficiency: 89 }
];

const RoleBasedDashboard: React.FC = () => {
  const { user, dashboardConfig, hasPermission, getVesselSpecificData, getShipName } = useUser();

  if (!user || !dashboardConfig) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  const renderWidget = (widget: any) => {
    switch (widget.type) {
      case WidgetType.FLEET_OVERVIEW:
        const isVesselSpecific = [UserRole.CREW, UserRole.ENGINEER, UserRole.CAPTAIN, UserRole.CHIEF_ENGINEER].includes(user.role);
        const title = isVesselSpecific ? `${getShipName()} Overview` : 'Fleet Overview';
        
        return (
          <Card key={widget.id}>
            <h3 className="text-lg font-semibold text-text-primary mb-4">{title}</h3>
            <div className="grid grid-cols-2 gap-4">
              {isVesselSpecific ? (
                <>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-text-primary">1</div>
                    <div className="text-sm text-text-secondary">Active Voyages</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success">Good</div>
                    <div className="text-sm text-text-secondary">Vessel Status</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">45.2</div>
                    <div className="text-sm text-text-secondary">Fuel (t/day)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-info">94.2%</div>
                    <div className="text-sm text-text-secondary">Efficiency</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-text-primary">{mockFleetData.activeVoyages}</div>
                    <div className="text-sm text-text-secondary">Active Voyages</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success">{mockFleetData.fuelEuSurplus}</div>
                    <div className="text-sm text-text-secondary">FuelEU Surplus</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-error">{mockFleetData.fuelEuDeficit}</div>
                    <div className="text-sm text-text-secondary">FuelEU Deficit</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{mockFleetData.totalEuaExposure}</div>
                    <div className="text-sm text-text-secondary">Total EUA Exposure</div>
                  </div>
                </>
              )}
            </div>
          </Card>
        );

      case WidgetType.TCC_METER:
        return (
          <Card key={widget.id}>
            <TccMeter data={mockTccData} size="lg" />
          </Card>
        );

      case WidgetType.EUA_PRICE:
        return (
          <Card key={widget.id}>
            <EuaTicker className="mb-6" />
          </Card>
        );

      case WidgetType.MY_TASKS:
        const isCrewMember = user.role === UserRole.CREW;
        const taskTitle = isCrewMember ? `My Tasks - ${getShipName()}` : 'Energy Efficiency Tasks';
        
        // Filter tasks based on user role and vessel
        const vesselSpecificTasks = isCrewMember ? mockTasks.filter(task => 
          task.title.includes('fuel') || task.title.includes('safety') || task.title.includes('maintenance')
        ) : mockTasks;
        
        return (
          <Card key={widget.id}>
            <h3 className="text-lg font-semibold text-text-primary mb-4">{taskTitle}</h3>
            <div className="space-y-3">
              {vesselSpecificTasks.slice(0, 3).map(task => (
                <div key={task.id} className="p-3 bg-subtle/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      task.category === 'ENERGY_SAVING' ? 'bg-blue-500/20 text-blue-400' :
                      task.category === 'ENVIRONMENTAL' ? 'bg-green-500/20 text-green-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {task.category || 'OPERATIONAL'}
                    </span>
                    {!isCrewMember && <span className="text-sm text-primary">+{task.points || 50} pts</span>}
                  </div>
                  <div className="font-medium text-white mb-1">{task.title}</div>
                  <div className="text-sm text-text-secondary">{task.description}</div>
                  {!isCrewMember && (
                    <div className="flex justify-between items-center mt-2 text-xs">
                      <span className="text-green-400">Fuel: {task.expectedDeltaFuel?.toFixed(1) || '0.5'}t</span>
                      <span className="text-blue-400">CO₂: {task.expectedDeltaCo2?.toFixed(1) || '1.2'}t</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <a href="/crew/tasks" className="text-primary hover:text-primary/80 text-sm">
                View All Tasks →
              </a>
            </div>
          </Card>
        );

      case WidgetType.CREW_LEAGUE:
        const showFleetCompetition = [UserRole.MANAGER, UserRole.TECHNICAL_SUPERINTENDENT, UserRole.FLEET_SUPERINTENDENT].includes(user.role);
        const leagueTitle = showFleetCompetition ? 'Fleet Performance Ranking' : 'Vessel Performance';
        
        return (
          <Card key={widget.id}>
            <h3 className="text-lg font-semibold text-text-primary mb-4">{leagueTitle}</h3>
            <div className="space-y-3">
              {showFleetCompetition ? (
                // Show fleet-wide competition for managers
                mockLeagueData.slice(0, 3).map((ship, index) => (
                  <div key={ship.name} className="flex items-center justify-between p-3 bg-subtle/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-lg">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </div>
                      <div>
                        <div className="font-medium text-white">{ship.name}</div>
                        <div className="text-sm text-text-secondary">
                          Efficiency: {ship.efficiency}%
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary">{ship.points} pts</div>
                      <div className="text-xs text-text-secondary">Weekly</div>
                    </div>
                  </div>
                ))
              ) : (
                // Show vessel-specific performance for crew
                <div className="p-3 bg-subtle/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">{getShipName()}</div>
                      <div className="text-sm text-text-secondary">Current Performance</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-success">Good</div>
                      <div className="text-xs text-text-secondary">Status</div>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-semibold text-primary">94.2%</div>
                      <div className="text-xs text-text-secondary">Efficiency</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-success">A</div>
                      <div className="text-xs text-text-secondary">CII Rating</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4 text-center">
              <a href="/crew/league" className="text-primary hover:text-primary/80 text-sm">
                {showFleetCompetition ? 'View Fleet Ranking →' : 'View Performance →'}
              </a>
            </div>
          </Card>
        );

      case WidgetType.COMPLIANCE_STATUS:
        return (
          <Card key={widget.id}>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Compliance Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-success/20 border border-success/30 rounded-lg">
                <div>
                  <div className="font-medium text-success">EU ETS Compliance</div>
                  <div className="text-sm text-text-secondary">All vessels compliant</div>
                </div>
                <div className="text-2xl">✅</div>
              </div>
              <div className="flex items-center justify-between p-3 bg-warning/20 border border-warning/30 rounded-lg">
                <div>
                  <div className="font-medium text-warning">FuelEU Status</div>
                  <div className="text-sm text-text-secondary">2 vessels need attention</div>
                </div>
                <div className="text-2xl">⚠️</div>
              </div>
            </div>
          </Card>
        );

      case WidgetType.FINANCIAL_SUMMARY:
        return (
          <Card key={widget.id}>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Financial Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Total Fuel Costs</span>
                <span className="font-semibold text-text-primary">€619.4K</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">ETS Costs</span>
                <span className="font-semibold text-text-primary">€207.0K</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">FuelEU Costs</span>
                <span className="font-semibold text-text-primary">€1.2K</span>
              </div>
              <div className="border-t border-subtle pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-text-primary">Total TCC</span>
                  <span className="font-bold text-primary text-xl">€827.6K</span>
                </div>
              </div>
            </div>
          </Card>
        );

      case WidgetType.COMPLIANCE_ALERTS:
        return (
          <Card key={widget.id}>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Compliance Alerts</h3>
            <div className="space-y-3">
              <div className="p-3 bg-error/20 border border-error/30 rounded-lg">
                <div className="font-medium text-error">Deadline Approaching</div>
                <div className="text-sm text-text-secondary">EU ETS surrender due in 15 days</div>
              </div>
              <div className="p-3 bg-warning/20 border border-warning/30 rounded-lg">
                <div className="font-medium text-warning">Verification Required</div>
                <div className="text-sm text-text-secondary">Fuel consumption data needs verification</div>
              </div>
            </div>
          </Card>
        );

      case WidgetType.RFQ_BOARD:
        return (
          <Card key={widget.id}>
            <h3 className="text-lg font-semibold text-text-primary mb-4">RFQ Board</h3>
            <div className="space-y-3">
              <div className="p-3 bg-card border border-subtle rounded-lg">
                <div className="font-medium text-text-primary">FuelEU Surplus Available</div>
                <div className="text-sm text-text-secondary">500 tCO2e available for pooling</div>
                <div className="text-xs text-text-muted mt-1">Expires: 2024-02-15</div>
              </div>
              <div className="p-3 bg-card border border-subtle rounded-lg">
                <div className="font-medium text-text-primary">Seeking FuelEU Deficit</div>
                <div className="text-sm text-text-secondary">200 tCO2e needed for compliance</div>
                <div className="text-xs text-text-muted mt-1">Expires: 2024-02-20</div>
              </div>
            </div>
          </Card>
        );

      case WidgetType.ENGINE_STATUS:
        return (
          <Card key={widget.id}>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Engine Status</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Main Engine</span>
                <span className="font-semibold text-success">Operational</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Auxiliary Engine</span>
                <span className="font-semibold text-success">Operational</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Fuel Consumption</span>
                <span className="font-semibold text-text-primary">45.2 t/day</span>
              </div>
            </div>
          </Card>
        );

      case WidgetType.FUEL_CONSUMPTION:
        return (
          <Card key={widget.id}>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Fuel Consumption</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Today</span>
                <span className="font-semibold text-text-primary">45.2 tonnes</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">This Week</span>
                <span className="font-semibold text-text-primary">316.4 tonnes</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Efficiency</span>
                <span className="font-semibold text-success">+2.3%</span>
              </div>
            </div>
          </Card>
        );

      case WidgetType.WASTE_HEAT_RECOVERY:
        return (
          <Card key={widget.id}>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white mb-2">Waste Heat Recovery</h3>
              <WasteHeatRecovery />
            </div>
            <div className="mt-4 p-3 bg-primary/10 rounded-lg">
              <div className="text-sm text-primary font-medium mb-2">Energy Savings Tasks</div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">WHR Optimization</span>
                  <span className="text-green-400">+45 pts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Shaft Generator Motor</span>
                  <span className="text-green-400">+50 pts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Environmental Checks</span>
                  <span className="text-green-400">+10 pts</span>
                </div>
              </div>
            </div>
          </Card>
        );

      case WidgetType.EMISSIONS_MONITORING:
        return (
          <Card key={widget.id}>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Emissions Monitoring</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">CO₂ Emissions (Today)</span>
                <span className="font-semibold text-text-primary">12.4 tonnes</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">SOx Emissions</span>
                <span className="font-semibold text-text-primary">0.8 kg</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">NOx Emissions</span>
                <span className="font-semibold text-text-primary">45.2 kg</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">CII Rating</span>
                <span className="font-semibold text-success">A</span>
              </div>
            </div>
          </Card>
        );

      case WidgetType.REGULATIONS_COMPLIANCE:
        return (
          <Card key={widget.id}>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Regulations Compliance</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-success/20 border border-success/30 rounded-lg">
                <div>
                  <div className="font-medium text-success">IMO 2024 GHG Strategy</div>
                  <div className="text-sm text-text-secondary">Compliant</div>
                </div>
                <div className="text-2xl">✅</div>
              </div>
              <div className="flex items-center justify-between p-3 bg-success/20 border border-success/30 rounded-lg">
                <div>
                  <div className="font-medium text-success">EU ETS Maritime</div>
                  <div className="text-sm text-text-secondary">Up to date</div>
                </div>
                <div className="text-2xl">✅</div>
              </div>
              <div className="flex items-center justify-between p-3 bg-warning/20 border border-warning/30 rounded-lg">
                <div>
                  <div className="font-medium text-warning">FuelEU Maritime</div>
                  <div className="text-sm text-text-secondary">Pending implementation</div>
                </div>
                <div className="text-2xl">⚠️</div>
              </div>
            </div>
          </Card>
        );

      case WidgetType.TECHNICAL_PERFORMANCE:
        return (
          <Card key={widget.id}>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Technical Performance</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Propulsion Efficiency</span>
                <span className="font-semibold text-success">94.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Engine Load</span>
                <span className="font-semibold text-text-primary">78%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Hull Condition</span>
                <span className="font-semibold text-success">Good</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Propeller Efficiency</span>
                <span className="font-semibold text-success">92.8%</span>
              </div>
            </div>
          </Card>
        );

      case WidgetType.SAFETY_METRICS:
        return (
          <Card key={widget.id}>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Safety Metrics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Safety Score</span>
                <span className="font-semibold text-success">98/100</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Incidents (30 days)</span>
                <span className="font-semibold text-success">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Safety Drills</span>
                <span className="font-semibold text-text-primary">2 completed</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Certification Status</span>
                <span className="font-semibold text-success">Valid</span>
              </div>
            </div>
          </Card>
        );

      case WidgetType.MARINE_WEATHER:
        return (
          <Card key={widget.id}>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Weather Conditions</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Wind Speed</span>
                <span className="font-semibold text-text-primary">15 knots</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Wave Height</span>
                <span className="font-semibold text-text-primary">2.1m</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Visibility</span>
                <span className="font-semibold text-success">Good</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Sea State</span>
                <span className="font-semibold text-text-primary">Moderate</span>
              </div>
            </div>
          </Card>
        );

      case WidgetType.NAVIGATION_STATUS:
        return (
          <Card key={widget.id}>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Navigation Status</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">GPS Status</span>
                <span className="font-semibold text-success">Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">AIS Status</span>
                <span className="font-semibold text-success">Transmitting</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Current Speed</span>
                <span className="font-semibold text-text-primary">14.2 knots</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Course</span>
                <span className="font-semibold text-text-primary">045°</span>
              </div>
            </div>
          </Card>
        );

      case WidgetType.CARGO_MANAGEMENT:
        return (
          <Card key={widget.id}>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Cargo Management</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Cargo Load</span>
                <span className="font-semibold text-text-primary">85%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Stability</span>
                <span className="font-semibold text-success">Within limits</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Ballast Status</span>
                <span className="font-semibold text-text-primary">Optimal</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Trim</span>
                <span className="font-semibold text-success">Good</span>
              </div>
            </div>
          </Card>
        );

      case WidgetType.ACTIVE_VOYAGES:
        return (
          <Card key={widget.id}>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Active Voyages</h3>
            <div className="space-y-3">
              <div className="p-3 bg-subtle/30 rounded-lg">
                <div className="font-medium text-text-primary mb-1">Rotterdam → Singapore</div>
                <div className="text-sm text-text-secondary">ETA: Feb 15, 2024 • 6,500 nm</div>
                <div className="text-xs text-text-muted mt-1">Progress: 65%</div>
              </div>
              <div className="p-3 bg-subtle/30 rounded-lg">
                <div className="font-medium text-text-primary mb-1">Hong Kong → Los Angeles</div>
                <div className="text-sm text-text-secondary">ETA: Feb 28, 2024 • 8,200 nm</div>
                <div className="text-xs text-text-muted mt-1">Scheduled</div>
              </div>
            </div>
          </Card>
        );

      case WidgetType.FUEL_COSTS:
        return (
          <Card key={widget.id}>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Fuel Costs</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">This Month</span>
                <span className="font-semibold text-text-primary">€45.8K</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Last Month</span>
                <span className="font-semibold text-text-primary">€52.3K</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Year to Date</span>
                <span className="font-semibold text-text-primary">€285.4K</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Trend</span>
                <span className="font-semibold text-success">-12.4%</span>
              </div>
            </div>
          </Card>
        );

      case WidgetType.EFFICIENCY_METRICS:
        return (
          <Card key={widget.id}>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Efficiency Metrics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Overall Efficiency</span>
                <span className="font-semibold text-success">94.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Fuel per NM</span>
                <span className="font-semibold text-text-primary">3.2 t/nm</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">CO₂ per NM</span>
                <span className="font-semibold text-text-primary">10.1 kg/nm</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Improvement</span>
                <span className="font-semibold text-success">+3.5%</span>
              </div>
            </div>
          </Card>
        );

      case WidgetType.MAINTENANCE_ALERTS:
        return (
          <Card key={widget.id}>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Maintenance Alerts</h3>
            <div className="space-y-3">
              <div className="p-3 bg-warning/20 border border-warning/30 rounded-lg">
                <div className="font-medium text-warning">Engine Inspection Due</div>
                <div className="text-sm text-text-secondary">Due in 5 days</div>
              </div>
              <div className="p-3 bg-info/20 border border-info/30 rounded-lg">
                <div className="font-medium text-info">Safety Equipment Check</div>
                <div className="text-sm text-text-secondary">Due in 12 days</div>
              </div>
              <div className="p-3 bg-success/20 border border-success/30 rounded-lg">
                <div className="font-medium text-success">Quarterly Survey</div>
                <div className="text-sm text-text-secondary">Scheduled for next month</div>
              </div>
            </div>
          </Card>
        );

      case WidgetType.VERIFICATION_STATUS:
        return (
          <Card key={widget.id}>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Verification Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-success/20 border border-success/30 rounded-lg">
                <div>
                  <div className="font-medium text-success">EU ETS Verified</div>
                  <div className="text-sm text-text-secondary">Last verified: Jan 30, 2024</div>
                </div>
                <div className="text-2xl">✅</div>
              </div>
              <div className="flex items-center justify-between p-3 bg-warning/20 border border-warning/30 rounded-lg">
                <div>
                  <div className="font-medium text-warning">MRV Pending</div>
                  <div className="text-sm text-text-secondary">Due by: Feb 28, 2024</div>
                </div>
                <div className="text-2xl">⏳</div>
              </div>
            </div>
          </Card>
        );

      case WidgetType.REGULATORY_DEADLINES:
        return (
          <Card key={widget.id}>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Regulatory Deadlines</h3>
            <div className="space-y-3">
              <div className="p-3 bg-error/20 border border-error/30 rounded-lg">
                <div className="font-medium text-error">EU ETS Surrender</div>
                <div className="text-sm text-text-secondary">Due: Feb 15, 2024 (15 days)</div>
              </div>
              <div className="p-3 bg-warning/20 border border-warning/30 rounded-lg">
                <div className="font-medium text-warning">FuelEU Report</div>
                <div className="text-sm text-text-secondary">Due: Mar 1, 2024 (29 days)</div>
              </div>
              <div className="p-3 bg-info/20 border border-info/30 rounded-lg">
                <div className="font-medium text-info">MRV Annual Report</div>
                <div className="text-sm text-text-secondary">Due: Apr 30, 2024 (89 days)</div>
              </div>
            </div>
          </Card>
        );

      case WidgetType.TRADING_OPPORTUNITIES:
        return (
          <Card key={widget.id}>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Trading Opportunities</h3>
            <div className="space-y-3">
              <div className="p-3 bg-card border border-subtle rounded-lg">
                <div className="font-medium text-text-primary">EUA Purchase Opportunity</div>
                <div className="text-sm text-text-secondary">Best price: €76.50</div>
                <div className="text-xs text-text-muted mt-1">3 active offers</div>
              </div>
              <div className="p-3 bg-card border border-subtle rounded-lg">
                <div className="font-medium text-text-primary">FuelEU Pool Request</div>
                <div className="text-sm text-text-secondary">500 tCO2e available</div>
                <div className="text-xs text-text-muted mt-1">Expires: Feb 20, 2024</div>
              </div>
            </div>
          </Card>
        );

      case WidgetType.MARKET_DATA:
        return (
          <Card key={widget.id}>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Market Data</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">EUA Price</span>
                <span className="font-semibold text-text-primary">€75.19</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Fuel Cost (MGO)</span>
                <span className="font-semibold text-text-primary">$725/MT</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Market Trend</span>
                <span className="font-semibold text-success">↑ +2.3%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Last Update</span>
                <span className="font-semibold text-text-primary">2 min ago</span>
              </div>
            </div>
          </Card>
        );

      case WidgetType.PERFORMANCE_METRICS:
        return (
          <Card key={widget.id}>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Performance Metrics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Performance Score</span>
                <span className="font-semibold text-success">92/100</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Task Completion</span>
                <span className="font-semibold text-success">95%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">This Week Points</span>
                <span className="font-semibold text-primary">+420 pts</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Rank</span>
                <span className="font-semibold text-primary">#3 / 12</span>
              </div>
            </div>
          </Card>
        );

      case WidgetType.SCHEDULE:
        return (
          <Card key={widget.id}>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Schedule</h3>
            <div className="space-y-3">
              <div className="p-3 bg-subtle/30 rounded-lg">
                <div className="font-medium text-text-primary mb-1">Watch Duty</div>
                <div className="text-sm text-text-secondary">14:00 - 18:00 (Today)</div>
              </div>
              <div className="p-3 bg-subtle/30 rounded-lg">
                <div className="font-medium text-text-primary mb-1">Safety Drill</div>
                <div className="text-sm text-text-secondary">Tomorrow 10:00</div>
              </div>
              <div className="p-3 bg-subtle/30 rounded-lg">
                <div className="font-medium text-text-primary mb-1">Rest Period</div>
                <div className="text-sm text-text-secondary">Feb 5, 2024</div>
              </div>
            </div>
          </Card>
        );

      default:
        return (
          <Card key={widget.id}>
            <h3 className="text-lg font-semibold text-text-primary mb-4">{widget.title}</h3>
            <div className="text-text-secondary">Widget content for {widget.type}</div>
          </Card>
        );
    }
  };

  const getGridCols = () => {
    switch (dashboardConfig.columns) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-1 lg:grid-cols-2';
      case 3: return 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3';
      case 4: return 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4';
      default: return 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3';
    }
  };

  const getLayoutStyle = () => {
    const layout = dashboardConfig.layout || 'grid';
    switch (layout) {
      case 'list':
        return 'flex flex-col space-y-6';
      case 'compact':
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4';
      case 'grid':
      default:
        return `grid ${getGridCols()} gap-6`;
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          {[UserRole.CREW, UserRole.ENGINEER, UserRole.CAPTAIN, UserRole.CHIEF_ENGINEER].includes(user.role) 
            ? `Welcome back, ${user.firstName}! - ${getShipName()}`
            : `Welcome back, ${user.firstName}!`
          }
        </h1>
        <p className="text-text-secondary">
          {user.role === UserRole.CREW && `Here's your daily tasks and vessel performance metrics for ${getShipName()}.`}
          {user.role === UserRole.OFFICER && `Monitor ${getShipName()}'s operations and crew performance.`}
          {user.role === UserRole.ENGINEER && `Track ${getShipName()}'s engine performance and maintenance schedules.`}
          {user.role === UserRole.CAPTAIN && `Overview of ${getShipName()}'s operations and crew management.`}
          {user.role === UserRole.CHIEF_ENGINEER && `Monitor ${getShipName()}'s technical systems and crew performance.`}
          {user.role === UserRole.MANAGER && "Overview of fleet operations and financial performance."}
          {user.role === UserRole.COMPLIANCE_OFFICER && "Monitor compliance status and regulatory requirements."}
          {user.role === UserRole.TRADER && "Manage RFQ board and trading opportunities."}
          {user.role === UserRole.ADMIN && "System overview and administrative functions."}
        </p>
      </div>

      {/* Role-specific quick actions */}
      {user.role === UserRole.CREW && hasPermission(Permission.VIEW_CREW_TASKS) && (
        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Quick Actions - {getShipName()}</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 bg-primary/20 text-primary rounded-lg hover:bg-primary/40 transition-colors">
              <div className="font-medium">Fuel Log Entry</div>
              <div className="text-sm opacity-80">Log current fuel consumption</div>
            </button>
            <button className="p-4 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/40 transition-colors">
              <div className="font-medium">Safety Check</div>
              <div className="text-sm opacity-80">Complete safety inspection</div>
            </button>
          </div>
        </Card>
      )}

      {/* Engineer-specific actions */}
      {user.role === UserRole.ENGINEER && hasPermission(Permission.MANAGE_WHR_SYSTEMS) && (
        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Engineering Quick Actions - {getShipName()}</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 bg-primary/20 text-primary rounded-lg hover:bg-primary/40 transition-colors">
              <div className="font-medium">Engine Status</div>
              <div className="text-sm opacity-80">Check main engine performance</div>
            </button>
            <button className="p-4 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/40 transition-colors">
              <div className="font-medium">Fuel Log</div>
              <div className="text-sm opacity-80">Update fuel consumption data</div>
            </button>
          </div>
        </Card>
      )}

      {/* Captain-specific actions */}
      {(user.role === UserRole.CAPTAIN || user.role === UserRole.OFFICER) && hasPermission(Permission.VIEW_VOYAGES) && (
        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Navigation Quick Actions - {getShipName()}</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 bg-primary/20 text-primary rounded-lg hover:bg-primary/40 transition-colors">
              <div className="font-medium">Voyage Status</div>
              <div className="text-sm opacity-80">Check current voyage progress</div>
            </button>
            <button className="p-4 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/40 transition-colors">
              <div className="font-medium">Crew Tasks</div>
              <div className="text-sm opacity-80">Assign crew responsibilities</div>
            </button>
          </div>
        </Card>
      )}

      {/* Dashboard Widgets */}
      <div className={getLayoutStyle()}>
        {dashboardConfig.widgets
          .filter(widget => {
            if (!widget.isVisible) return false;
            
            // Hide RFQ board from crew members and vessel-specific roles
            if (widget.type === WidgetType.RFQ_BOARD) {
              const hideFromRoles = [UserRole.CREW, UserRole.ENGINEER, UserRole.CAPTAIN, UserRole.CHIEF_ENGINEER];
              return !hideFromRoles.includes(user.role);
            }
            
            return true;
          })
          .map(widget => renderWidget(widget))
        }
      </div>

      {/* Role-specific additional content */}
      {user.role === UserRole.COMPLIANCE_OFFICER && (
        <Card title="Regulatory Deadlines">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-error/20 border border-error/30 rounded-lg">
              <div>
                <div className="font-semibold text-error">EU ETS Surrender</div>
                <div className="text-sm text-text-secondary">Deadline: March 31, 2024</div>
              </div>
              <div className="text-2xl font-bold text-error">15 days</div>
            </div>
            <div className="flex items-center justify-between p-4 bg-warning/20 border border-warning/30 rounded-lg">
              <div>
                <div className="font-semibold text-warning">FuelEU Reporting</div>
                <div className="text-sm text-text-secondary">Deadline: April 30, 2024</div>
              </div>
              <div className="text-2xl font-bold text-warning">45 days</div>
            </div>
          </div>
        </Card>
      )}

      {user.role === UserRole.MANAGER && (
        <Card title="Fleet Performance Summary">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-success">95.2%</div>
              <div className="text-sm text-text-secondary">Fleet Efficiency</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">€2.1M</div>
              <div className="text-sm text-text-secondary">Monthly Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-info">12</div>
              <div className="text-sm text-text-secondary">Active Vessels</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default RoleBasedDashboard;
