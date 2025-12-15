import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { UserRole } from '../contexts/UserContext';
import Card from './Card';
import Gauge from './Gauge';
import TccMeter from './TccMeter';
import EuaTicker from './EuaTicker';
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  InformationCircleIcon,
  ChevronUpIcon
} from './common/Icons';
import { fetchVoyages } from '../services/mockApi';
import { Voyage } from '../types/index';
import { logger } from '../services/logger';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

interface ComprehensiveDashboardProps {
  className?: string;
}

const ComprehensiveDashboard: React.FC<ComprehensiveDashboardProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const { user, getVesselSpecificData, getShipName } = useUser();
  const [voyages, setVoyages] = useState<Voyage[]>([]);
  const [loading, setLoading] = useState(true);
  const [euaPrice, setEuaPrice] = useState(82.0);
  const [euaSource, setEuaSource] = useState('EEX FREE');
  const [futuresPrice, setFuturesPrice] = useState(84.15);
  const [historicalEuaData, setHistoricalEuaData] = useState<any[]>([]);
  const [charterRate, setCharterRate] = useState(105000);
  const [machineryHealth, setMachineryHealth] = useState(82);
  const [totalUsers, setTotalUsers] = useState(45); // Default values for admin dashboard
  const [activeUsers, setActiveUsers] = useState(32);
  const [systemHealth, setSystemHealth] = useState(98);

  // Calculate displayVoyages early (before early return) to use in useMemo
  const displayVoyagesForMemo = (() => {
    try {
      if (user) {
        const isVesselSpecific = [UserRole.CREW, UserRole.ENGINEER, UserRole.CAPTAIN, UserRole.CHIEF_ENGINEER].includes(user.role);
        if (isVesselSpecific && getVesselSpecificData) {
          const vesselData = getVesselSpecificData(voyages, 'voyages');
          return Array.isArray(vesselData) ? vesselData : [];
        } else {
          return Array.isArray(voyages) ? voyages : [];
        }
      } else {
        return Array.isArray(voyages) ? voyages : [];
      }
    } catch (error) {
      return [];
    }
  })();

  // Calculate TCC for admin view (moved BEFORE early return to avoid hooks violation)
  const adminTcc = useMemo(() => {
    if (!displayVoyagesForMemo || displayVoyagesForMemo.length === 0) {
      return { fuelCost: 0, etsCost: 0, fuelEUCost: 0, total: 0 };
    }
    
    try {
      const totalFuelCost = displayVoyagesForMemo.reduce((sum, v) => {
        const fuelByType = v.imo_dcs?.fuel_by_type_t || {};
        const fuelTons = Object.values(fuelByType).reduce((a: number, b: number) => (a || 0) + (b || 0), 0);
        return sum + (fuelTons * 600); // Assume €600/tonne
      }, 0);
      
      const totalEtsCost = displayVoyagesForMemo.reduce((sum, v) => {
        const exposure = v.eu_ets?.eua_exposure_tco2 || 0;
        return sum + (exposure * euaPrice);
      }, 0);
      
      const totalFuelEuCost = displayVoyagesForMemo.reduce((sum, v) => {
        const balance = v.fueleu?.compliance_balance_gco2e || 0;
        const deficit = Math.max(0, -balance);
        return sum + (deficit / 1e6 * 60); // €60 penalty per tonne
      }, 0);
      
      return {
        fuelCost: totalFuelCost,
        etsCost: totalEtsCost,
        fuelEUCost: totalFuelEuCost,
        total: totalFuelCost + totalEtsCost + totalFuelEuCost
      };
    } catch (error) {
      logger.error('Error calculating admin TCC', error as Error, { component: 'ComprehensiveDashboard' });
      return { fuelCost: 0, etsCost: 0, fuelEUCost: 0, total: 0 };
    }
  }, [displayVoyagesForMemo, euaPrice]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const voyageData = await fetchVoyages();
        setVoyages(voyageData);
        
        // Fetch EUA price
        const euaResponse = await fetch(`${API_BASE_URL}/trading/api/market/eua`);
        if (euaResponse.ok) {
          const euaData = await euaResponse.json();
          if (euaData.code === 'SUCCESS') {
            setEuaPrice(parseFloat(euaData.data.price));
            setEuaSource(euaData.data.source || 'EEX FREE');
            setFuturesPrice(parseFloat(euaData.data.price) * 1.025);
          }
        }

        // Generate historical EUA data
        const history = [];
        for (let i = 30; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          history.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            price: 75 + Math.random() * 10 + (i * 0.1)
          });
        }
        setHistoricalEuaData(history);

        // Fetch user statistics for admin (with graceful fallback)
        if (user?.role === UserRole.ADMIN) {
          try {
            const usersResponse = await fetch(`${API_BASE_URL}/auth/api/users`, {
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
            });
            
            if (usersResponse.ok) {
              const usersData = await usersResponse.json();
              if (usersData.code === 'SUCCESS' && usersData.data) {
                const users = Array.isArray(usersData.data) ? usersData.data : [];
                setTotalUsers(users.length);
                setActiveUsers(users.filter((u: any) => u.is_active !== false && u.is_active !== null).length);
              }
            } else if (usersResponse.status === 401) {
              // Authentication required - use mock data for now
              // Silently handle 401 - this is expected for unauthenticated requests
              setTotalUsers(45);
              setActiveUsers(32);
            } else {
              // Other error - use defaults (silently)
              setTotalUsers(45);
              setActiveUsers(32);
            }
          } catch (err) {
            // Network or other error - use mock data
            logger.debug('Failed to fetch user stats, using mock data', err as Error, {
              component: 'ComprehensiveDashboard',
              action: 'fetchUserStats',
            });
            setTotalUsers(45);
            setActiveUsers(32);
          }
        }
      } catch (error) {
        logger.error(
          'Failed to load dashboard data',
          error as Error,
          {
            component: 'ComprehensiveDashboard',
            action: 'loadData',
            userRole: user?.role,
          }
        );
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadData();
      const interval = setInterval(loadData, 30000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Safely get display voyages with fallbacks
  let displayVoyages: Voyage[] = [];
  try {
    if (user) {
      const isVesselSpecific = [UserRole.CREW, UserRole.ENGINEER, UserRole.CAPTAIN, UserRole.CHIEF_ENGINEER].includes(user.role);
      if (isVesselSpecific && getVesselSpecificData) {
        const vesselData = getVesselSpecificData(voyages, 'voyages');
        displayVoyages = Array.isArray(vesselData) ? vesselData : [];
      } else {
        displayVoyages = Array.isArray(voyages) ? voyages : [];
      }
    } else {
      displayVoyages = Array.isArray(voyages) ? voyages : [];
    }
  } catch (error) {
    logger.error('Error processing voyages data', error as Error, { component: 'ComprehensiveDashboard' });
    displayVoyages = [];
  }
  
  const currentVessel = (displayVoyages && displayVoyages.length > 0) ? displayVoyages[0] : null;

  // Safe wrapper for getShipName
  const safeGetShipName = () => {
    try {
      return getShipName ? getShipName() : (currentVessel?.ship_name || 'Fleet');
    } catch (error) {
      logger.error('Error getting ship name', error as Error, { component: 'ComprehensiveDashboard' });
      return currentVessel?.ship_name || 'Fleet';
    }
  };

  // Calculate metrics - for admin, use all voyages; for others, use filtered voyages
  const voyagesForMetrics = user?.role === UserRole.ADMIN ? voyages : displayVoyagesForMemo;
  const totalEmissions = (voyagesForMetrics || []).reduce((sum, v) => sum + ((v.eu_ets?.eua_exposure_tco2 || 0)), 0);
  const totalEuaCost = totalEmissions * euaPrice;
  const carbonAdjustedTce = 155420; // Mock data
  const avgEuaPrice = 62.16;
  const carbonHedgeCoverage = 63.8;
  const avgHedgePrice = 71.0;

  // Performance vs Peer Group data (radar chart)
  const peerGroupData = [
    { subject: 'Fuel Efficiency', A: 85, B: 90, fullMark: 100 },
    { subject: 'EUA/1000nm', A: 75, B: 80, fullMark: 100 },
    { subject: 'EUA/Cargo', A: 70, B: 75, fullMark: 100 },
    { subject: 'EUA/Bunkering', A: 80, B: 85, fullMark: 100 },
    { subject: 'TCE/Day', A: 88, B: 92, fullMark: 100 },
  ];

  // ETS Footprint table data
  const etsFootprintData = [
    { voyage: 'TCE', leg: 'Leg 1', departurePort: 'Rotterdam', arrivalPort: 'Singapore', euas: 62.16, euaCost: 452000, tce: 156090, change: '-15.00%' },
    { voyage: 'TCE 1', leg: 'Leg 2', departurePort: 'Singapore', arrivalPort: 'Shanghai', euas: 58.32, euaCost: 423000, tce: 148500, change: '-12.50%' },
    { voyage: 'TCE 2', leg: 'Leg 3', departurePort: 'Shanghai', arrivalPort: 'Los Angeles', euas: 65.44, euaCost: 475000, tce: 162300, change: '-18.20%' },
  ];

  // Daily action items based on role
  const getActionItems = () => {
    if (!user) {
      return [{ text: 'Loading...', priority: 'low' }];
    }
    
    switch (user.role) {
      case UserRole.ADMIN:
        return [
          { text: 'System backup scheduled for tonight - Verify storage space', priority: 'high' },
          { text: '3 new user registrations pending approval', priority: 'high' },
          { text: 'Database maintenance window - Schedule for low-traffic period', priority: 'medium' },
          { text: 'Review system logs for errors and warnings', priority: 'medium' },
          { text: 'Update system documentation with latest changes', priority: 'low' },
        ];
      case UserRole.MANAGER:
      case UserRole.FLEET_SUPERINTENDENT:
        return [
          { text: 'Slow-steaming window available - Re-price carbon clause in next charter', priority: 'high' },
          { text: 'Route selection alert - Consider alternative route to reduce EUA exposure', priority: 'medium' },
          { text: 'Carbon hedge coverage review - 63.8% coverage needs adjustment', priority: 'medium' },
        ];
      case UserRole.COMPLIANCE_OFFICER:
        return [
          { text: 'EU ETS verification due in 15 days - Prepare documentation', priority: 'high' },
          { text: 'MRV report submission deadline approaching', priority: 'high' },
          { text: 'Review FuelEU compliance balance for Q1', priority: 'medium' },
        ];
      case UserRole.TRADER:
        return [
          { text: 'New RFQ opportunity - 500 tCO₂ surplus available for pooling', priority: 'high' },
          { text: 'EUA futures price trending up - Consider hedging strategy', priority: 'medium' },
          { text: 'Charter market analysis - LNG rates at $105k/day', priority: 'low' },
        ];
      case UserRole.CAPTAIN:
      case UserRole.OFFICER:
        return [
          { text: 'Weather routing optimization available - Save 2.5% fuel', priority: 'medium' },
          { text: 'Port arrival window - ETA confirmation required', priority: 'high' },
          { text: 'Crew safety drill scheduled for tomorrow', priority: 'medium' },
        ];
      case UserRole.ENGINEER:
      case UserRole.CHIEF_ENGINEER:
        return [
          { text: 'Engine maintenance due - Schedule drydock inspection', priority: 'high' },
          { text: 'WHR system efficiency at 82% - Optimization opportunity', priority: 'medium' },
          { text: 'Fuel quality check required before next bunkering', priority: 'medium' },
        ];
      default:
        return [
          { text: 'Review daily tasks and assignments', priority: 'medium' },
        ];
    }
  };

  const actionItems = getActionItems() || [];

  // Render role-specific dashboard content
  const renderRoleSpecificContent = () => {
    if (!user) {
      return renderDefaultDashboard();
    }
    
    switch (user.role) {
      case UserRole.ADMIN:
        return renderAdminDashboard();
      case UserRole.MANAGER:
      case UserRole.FLEET_SUPERINTENDENT:
      case UserRole.OPERATIONS_SUPERINTENDENT:
        return renderManagerDashboard();
      case UserRole.COMPLIANCE_OFFICER:
        return renderComplianceDashboard();
      case UserRole.TRADER:
        return renderTraderDashboard();
      case UserRole.CAPTAIN:
      case UserRole.OFFICER:
        return renderCaptainDashboard();
      case UserRole.ENGINEER:
      case UserRole.CHIEF_ENGINEER:
      case UserRole.TECHNICAL_SUPERINTENDENT:
        return renderEngineerDashboard();
      case UserRole.CREW:
        return renderCrewDashboard();
      default:
        return renderDefaultDashboard();
    }
  };

  const renderAdminDashboard = () => {
    // Calculate admin-specific metrics
    // For admin, count unique vessels from all voyages (not filtered)
    const uniqueVesselIds = new Set<string>();
    const uniqueVesselNames = new Set<string>();
    
    if (voyages && voyages.length > 0) {
      voyages.forEach(v => {
        if (v.ship_id) uniqueVesselIds.add(v.ship_id);
        if (v.ship_name) uniqueVesselNames.add(v.ship_name);
      });
    }
    
    // Fleet size is the count of unique vessels (by ID or name)
    const totalVessels = Math.max(uniqueVesselIds.size, uniqueVesselNames.size);
    
    // Active voyages count (all voyages for admin)
    const activeVoyagesCount = voyages?.length || 0;
    
    const apiResponseTime = 145; // ms
    const errorRate = 0.02; // 0.02%
    const storageUsed = 68; // GB
    const storageTotal = 100; // GB
    
    // Use state values (will have defaults if API fails)
    const displayTotalUsers = totalUsers > 0 ? totalUsers : 45;
    const displayActiveUsers = activeUsers > 0 ? activeUsers : 32;

    return (
      <div className="space-y-6">
        {/* Top Row: System Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* System Health */}
          <Card>
            <h3 className="text-sm font-semibold text-text-secondary mb-2">System Health</h3>
            <div className="flex items-center justify-center mb-2">
              <Gauge value={systemHealth} maxValue={100} label="Health" unit="%" size={120} />
            </div>
            <p className="text-xs text-center text-text-secondary">All systems operational</p>
          </Card>

          {/* Active Users */}
          <Card>
            <h3 className="text-sm font-semibold text-text-secondary mb-2">Active Users</h3>
            <div className="text-3xl font-bold text-success mb-1">{displayActiveUsers}</div>
            <p className="text-xs text-text-secondary mb-2">of {displayTotalUsers} total users</p>
            <div className="w-full bg-subtle rounded-full h-2">
              <div className="bg-success h-2 rounded-full" style={{ width: `${displayTotalUsers > 0 ? (displayActiveUsers / displayTotalUsers) * 100 : 0}%` }}></div>
            </div>
          </Card>

          {/* Total Vessels */}
          <Card>
            <h3 className="text-sm font-semibold text-text-secondary mb-2">Fleet Size</h3>
            <div className="text-3xl font-bold text-primary mb-1">{totalVessels || 0}</div>
            <p className="text-xs text-text-secondary">Unique vessels in system</p>
          </Card>

          {/* API Performance */}
          <Card>
            <h3 className="text-sm font-semibold text-text-secondary mb-2">API Performance</h3>
            <div className="text-3xl font-bold text-info mb-1">{apiResponseTime}ms</div>
            <p className="text-xs text-text-secondary mb-2">Avg response time</p>
            <div className="text-xs">
              <span className="text-error">Error rate: {errorRate}%</span>
            </div>
          </Card>
        </div>

        {/* Second Row: EU-ETS & Market Data */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* EU-Carbon Price */}
          <Card>
            <h3 className="text-sm font-semibold text-text-secondary mb-2">EU-Carbon Price (EUA)</h3>
            <div className="text-3xl font-bold text-success mb-2">{euaPrice.toFixed(1)} €/t</div>
            <ResponsiveContainer width="100%" height={60}>
              <LineChart data={historicalEuaData.slice(-7)}>
                <Line type="monotone" dataKey="price" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-xs text-text-secondary mt-2">Source: {euaSource}</p>
          </Card>

          {/* Total Emissions */}
          <Card>
            <h3 className="text-sm font-semibold text-text-secondary mb-2">Total Emissions</h3>
            <div className="text-3xl font-bold text-warning mb-1">{totalEmissions.toFixed(0)} tCO₂</div>
            <p className="text-xs text-text-secondary">Fleet-wide exposure</p>
          </Card>

          {/* EUA Cost */}
          <Card>
            <h3 className="text-sm font-semibold text-text-secondary mb-2">EUA Cost</h3>
            <div className="text-3xl font-bold text-error mb-1">€{(totalEuaCost / 1000).toFixed(1)}k</div>
            <p className="text-xs text-text-secondary">Total cost at current price</p>
          </Card>

          {/* Active Voyages */}
          <Card>
            <h3 className="text-sm font-semibold text-text-secondary mb-2">Active Voyages</h3>
            <div className="text-3xl font-bold text-primary mb-1">{activeVoyagesCount}</div>
            <p className="text-xs text-text-secondary">Currently in progress</p>
          </Card>
        </div>

        {/* Third Row: Fleet Overview & Compliance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fleet Overview Table */}
          <Card>
            <h3 className="text-sm font-semibold text-text-secondary mb-4">Fleet Overview</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-subtle rounded-lg">
                <span className="text-text-secondary">Total Vessels</span>
                <span className="text-text-primary font-bold">{totalVessels || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-subtle rounded-lg">
                <span className="text-text-secondary">Active Voyages</span>
                <span className="text-text-primary font-bold">{activeVoyagesCount}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-subtle rounded-lg">
                <span className="text-text-secondary">FuelEU Surplus</span>
                <span className="text-success font-bold">
                  {(displayVoyages || []).filter(v => (v.fueleu?.compliance_balance_gco2e || 0) > 0).length}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-subtle rounded-lg">
                <span className="text-text-secondary">FuelEU Deficit</span>
                <span className="text-error font-bold">
                  {(displayVoyages || []).filter(v => (v.fueleu?.compliance_balance_gco2e || 0) < 0).length}
                </span>
              </div>
            </div>
          </Card>

          {/* Compliance Status */}
          <Card>
            <h3 className="text-sm font-semibold text-text-secondary mb-4">Compliance Status</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-text-secondary">EU ETS Compliance</span>
                  <span className="text-success font-medium">92%</span>
                </div>
                <div className="w-full bg-subtle rounded-full h-2">
                  <div className="bg-success h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-text-secondary">FuelEU Compliance</span>
                  <span className="text-warning font-medium">85%</span>
                </div>
                <div className="w-full bg-subtle rounded-full h-2">
                  <div className="bg-warning h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div className="pt-2 border-t border-subtle">
                <div className="text-xs text-text-secondary">
                  <div className="flex justify-between mb-1">
                    <span>Verifications Pending:</span>
                    <span className="text-warning">3</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Deadlines Approaching:</span>
                    <span className="text-error">2</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Fourth Row: TCC Meter & System Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* TCC Meter */}
          <Card className="lg:col-span-1">
            <h3 className="text-sm font-semibold text-text-secondary mb-4">Total Cost of Compliance</h3>
            <TccMeter data={adminTcc} size="md" />
          </Card>

          {/* Storage Usage */}
          <Card>
            <h3 className="text-sm font-semibold text-text-secondary mb-2">Storage Usage</h3>
            <div className="text-3xl font-bold text-text-primary mb-1">{storageUsed} GB</div>
            <p className="text-xs text-text-secondary mb-2">of {storageTotal} GB used</p>
            <div className="w-full bg-subtle rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: `${(storageUsed / storageTotal) * 100}%` }}></div>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card>
            <h3 className="text-sm font-semibold text-text-secondary mb-4">Recent Activity</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between p-2 bg-subtle rounded">
                <span className="text-text-secondary">New user registered</span>
                <span className="text-text-secondary text-xs">2m ago</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-subtle rounded">
                <span className="text-text-secondary">Voyage completed</span>
                <span className="text-text-secondary text-xs">15m ago</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-subtle rounded">
                <span className="text-text-secondary">RFQ created</span>
                <span className="text-text-secondary text-xs">1h ago</span>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card>
            <h3 className="text-sm font-semibold text-text-secondary mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/user-management')}
                className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors text-left text-sm"
              >
                Manage Users
              </button>
              <button
                onClick={() => navigate('/system-settings')}
                className="w-full px-4 py-2 bg-card border border-subtle text-text-primary rounded-lg hover:bg-subtle transition-colors text-left text-sm"
              >
                System Settings
              </button>
              <button
                onClick={() => navigate('/fleet-management')}
                className="w-full px-4 py-2 bg-card border border-subtle text-text-primary rounded-lg hover:bg-subtle transition-colors text-left text-sm"
              >
                Fleet Management
              </button>
            </div>
          </Card>
        </div>

        {/* Fifth Row: Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* EUA Price Trend */}
          <Card>
            <h3 className="text-sm font-semibold text-text-secondary mb-4">EUA Price Trend (30 Days)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={historicalEuaData.slice(-30)}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="date" stroke="var(--text-secondary)" tick={{ fontSize: 10 }} />
                <YAxis stroke="var(--text-secondary)" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="price" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Voyage Status Distribution */}
          <Card>
            <h3 className="text-sm font-semibold text-text-secondary mb-4">Voyage Status Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Active', value: displayVoyages?.length || 0 },
                    { name: 'Completed', value: Math.max(0, 10 - (displayVoyages?.length || 0)) },
                    { name: 'Planned', value: 5 },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[0, 1, 2].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#10b981', '#0ea5e9', '#FF6A00'][index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Sixth Row: Daily Actions */}
        <Card>
          <h3 className="text-sm font-semibold text-text-secondary mb-4">System Administrator Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {actionItems.map((item, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border cursor-pointer hover:bg-subtle transition-colors ${
                  item.priority === 'high' ? 'border-error/50 bg-error/10' :
                  item.priority === 'medium' ? 'border-warning/50 bg-warning/10' :
                  'border-info/50 bg-info/10'
                }`}
              >
                <div className="flex items-start">
                  <span className="text-primary mr-2 mt-1">→</span>
                  <p className="text-sm text-text-primary">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  };

  const renderManagerDashboard = () => (
    <div className="space-y-6">
      {/* Top Row: Vessel Info, Market Data, EUA Price, Machinery Health */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Vessel Information */}
        {currentVessel && (
          <Card className="lg:col-span-1">
            <div className="text-center">
              <div className="w-24 h-24 bg-primary/20 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-4xl">🚢</span>
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2">{safeGetShipName()}</h3>
              <p className="text-sm text-text-secondary mb-4">LNG Carrier</p>
              <div className="space-y-2 text-left text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">IMO:</span>
                  <span className="text-text-primary font-medium">{currentVessel.imo_number || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Flag:</span>
                  <span className="text-text-primary font-medium">Singapore</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">DWT:</span>
                  <span className="text-text-primary font-medium">161,638 t</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Engine:</span>
                  <span className="text-text-primary font-medium">ME-GI</span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Live LNG Charter Market */}
        <Card>
          <h3 className="text-sm font-semibold text-text-secondary mb-2">Live LNG Charter Market</h3>
          <p className="text-xs text-text-secondary mb-1">174k m³ ME-GI</p>
          <div className="text-3xl font-bold text-primary mb-2">${charterRate.toLocaleString()}/day</div>
          <ResponsiveContainer width="100%" height={60}>
            <LineChart data={historicalEuaData.slice(-7)}>
              <Line type="monotone" dataKey="price" stroke="#0ea5e9" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-text-secondary mt-2">Last update: {new Date().toLocaleTimeString()} UTC</p>
        </Card>

        {/* EU-Carbon Price */}
        <Card>
          <h3 className="text-sm font-semibold text-text-secondary mb-2">EU-Carbon Price (EUA)</h3>
          <div className="text-3xl font-bold text-success mb-2">{euaPrice.toFixed(1)} €/t</div>
          <ResponsiveContainer width="100%" height={60}>
            <LineChart data={historicalEuaData.slice(-7)}>
              <Line type="monotone" dataKey="price" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex justify-between text-xs mt-2">
            <span className="text-text-secondary">Futures: {futuresPrice.toFixed(2)} €/t</span>
            <span className="text-success">+2.3%</span>
          </div>
        </Card>

        {/* Machinery Health */}
        <Card>
          <h3 className="text-sm font-semibold text-text-secondary mb-4">Machinery Health</h3>
          <div className="flex items-center justify-center">
            <Gauge value={machineryHealth} maxValue={100} label="Health" unit="%" size={120} />
          </div>
          <p className="text-xs text-center text-text-secondary mt-2">Minor maintenance alert</p>
        </Card>
      </div>

      {/* Second Row: Carbon-Adjusted TCE, Emissions Data, Risk Level */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Carbon-Adjusted TCE */}
        <Card>
          <h3 className="text-sm font-semibold text-text-secondary mb-2">Carbon-Adjusted TCE Since 2024</h3>
          <div className="text-3xl font-bold text-primary mb-4">€{carbonAdjustedTce.toLocaleString()}</div>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={historicalEuaData.slice(-30)}>
              <Area type="monotone" dataKey="price" stroke="#FF6A00" fill="#FF6A00" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Avg EUA Price:</span>
              <span className="text-text-primary font-medium">€{avgEuaPrice.toFixed(2)}/t</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">EUAs Required:</span>
              <span className="text-text-primary font-medium">{totalEmissions.toFixed(0)} t</span>
            </div>
          </div>
        </Card>

        {/* Emissions Data */}
        <Card>
          <h3 className="text-sm font-semibold text-text-secondary mb-4">Since 2024 Emissions</h3>
          <div className="space-y-4">
            <div>
              <div className="text-2xl font-bold text-text-primary mb-1">1,291 tCO₂</div>
              <div className="text-sm text-text-secondary">Total CO₂ Emissions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-warning mb-1">{totalEmissions.toFixed(0)} t</div>
              <div className="text-sm text-text-secondary">EUAs Required</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-error mb-1">€{(totalEuaCost / 1000).toFixed(1)}k</div>
              <div className="text-sm text-text-secondary">EUA Cost</div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-text-secondary">Compliance Progress</span>
                <span className="text-text-primary font-medium">71%</span>
              </div>
              <div className="w-full bg-subtle rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '71%' }}></div>
              </div>
            </div>
          </div>
        </Card>

        {/* EU-ETS Risk Level & Carbon Hedge Coverage */}
        <Card>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-text-secondary mb-2">EU-ETS Risk Level</h3>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-warning">MEDIUM</span>
                <ChevronUpIcon className="h-5 w-5 text-text-secondary" />
              </div>
              <p className="text-xs text-text-secondary mt-2">Moderate exposure to price volatility</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-secondary mb-2">Carbon Hedge Coverage</h3>
              <div className="text-2xl font-bold text-success mb-1">{carbonHedgeCoverage}%</div>
              <p className="text-xs text-text-secondary mb-2">Locked EUAs for 2026 emissions</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Carbon Hedge Price:</span>
                  <span className="text-text-primary font-medium">€{avgHedgePrice}/t</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Avg Hedge Price:</span>
                  <span className="text-text-primary font-medium">€{avgHedgePrice}/t</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Third Row: ETS Footprint Table, Performance vs Peer Group, Daily Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ETS Footprint Table */}
        <Card className="lg:col-span-1">
          <h3 className="text-sm font-semibold text-text-secondary mb-4">ETS Footprint - {safeGetShipName()}</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="border-b border-subtle">
                  <th className="text-left py-2 text-text-secondary">Voyage</th>
                  <th className="text-left py-2 text-text-secondary">Port</th>
                  <th className="text-right py-2 text-text-secondary">EUAs</th>
                  <th className="text-right py-2 text-text-secondary">Cost €</th>
                </tr>
              </thead>
              <tbody>
                {etsFootprintData.map((row, idx) => (
                  <tr key={idx} className="border-b border-subtle">
                    <td className="py-2 text-text-primary">{row.voyage}</td>
                    <td className="py-2 text-text-secondary">{row.departurePort} → {row.arrivalPort}</td>
                    <td className="py-2 text-right text-text-primary">{row.euas.toFixed(2)}t</td>
                    <td className="py-2 text-right text-text-primary">{(row.euaCost / 1000).toFixed(0)}k</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Performance vs Peer Group */}
        <Card className="lg:col-span-1">
          <h3 className="text-sm font-semibold text-text-secondary mb-4">Performance vs 174k m³ ME-GI Peer Group</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={peerGroupData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Radar name="Fleet" dataKey="A" stroke="#FF6A00" fill="#FF6A00" fillOpacity={0.6} />
              <Radar name="Peer Avg" dataKey="B" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.3} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
          <p className="text-xs text-center text-text-secondary mt-2">Carbon-adjusted TCE percentile: 75th</p>
        </Card>

        {/* Daily Playbox */}
        <Card className="lg:col-span-1">
          <h3 className="text-sm font-semibold text-text-secondary mb-4">Daily Playbox - {safeGetShipName()}</h3>
          <div className="space-y-3">
            {actionItems.map((item, idx) => (
              <div 
                key={idx} 
                className={`p-3 rounded-lg border cursor-pointer hover:bg-subtle transition-colors ${
                  item.priority === 'high' ? 'border-error/50 bg-error/10' :
                  item.priority === 'medium' ? 'border-warning/50 bg-warning/10' :
                  'border-info/50 bg-info/10'
                }`}
              >
                <div className="flex items-start">
                  <span className="text-primary mr-2 mt-1">→</span>
                  <p className="text-sm text-text-primary">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  const renderComplianceDashboard = () => (
    <div className="space-y-6">
      {/* Similar structure but focused on compliance metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card>
          <h3 className="text-sm font-semibold text-text-secondary mb-2">EU-Carbon Price (EUA)</h3>
          <div className="text-3xl font-bold text-success mb-2">{euaPrice.toFixed(1)} €/t</div>
          <p className="text-xs text-text-secondary">Source: {euaSource}</p>
        </Card>
        <Card>
          <h3 className="text-sm font-semibold text-text-secondary mb-2">Compliance Status</h3>
          <div className="text-3xl font-bold text-success mb-2">92%</div>
          <p className="text-xs text-text-secondary">On track for 2024</p>
        </Card>
        <Card>
          <h3 className="text-sm font-semibold text-text-secondary mb-2">Verification Status</h3>
          <div className="text-3xl font-bold text-warning mb-2">Pending</div>
          <p className="text-xs text-text-secondary">Due in 15 days</p>
        </Card>
        <Card>
          <h3 className="text-sm font-semibold text-text-secondary mb-2">Total EUA Exposure</h3>
          <div className="text-3xl font-bold text-text-primary mb-2">{totalEmissions.toFixed(0)} t</div>
          <p className="text-xs text-text-secondary">Fleet-wide</p>
        </Card>
      </div>
      {/* Add compliance-specific content */}
    </div>
  );

  const renderTraderDashboard = () => (
    <div className="space-y-6">
      {/* Trading-focused dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card>
          <h3 className="text-sm font-semibold text-text-secondary mb-2">EU-Carbon Price (EUA)</h3>
          <div className="text-3xl font-bold text-success mb-2">{euaPrice.toFixed(1)} €/t</div>
          <ResponsiveContainer width="100%" height={60}>
            <LineChart data={historicalEuaData.slice(-7)}>
              <Line type="monotone" dataKey="price" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <h3 className="text-sm font-semibold text-text-secondary mb-2">Futures Price</h3>
          <div className="text-3xl font-bold text-primary mb-2">{futuresPrice.toFixed(2)} €/t</div>
          <p className="text-xs text-success">+2.3% vs spot</p>
        </Card>
        <Card>
          <h3 className="text-sm font-semibold text-text-secondary mb-2">Active RFQs</h3>
          <div className="text-3xl font-bold text-text-primary mb-2">12</div>
          <p className="text-xs text-text-secondary">3 new today</p>
        </Card>
        <Card>
          <h3 className="text-sm font-semibold text-text-secondary mb-2">Portfolio Value</h3>
          <div className="text-3xl font-bold text-success mb-2">€2.4M</div>
          <p className="text-xs text-text-secondary">+5.2% this month</p>
        </Card>
      </div>
    </div>
  );

  const renderCaptainDashboard = () => (
    <div className="space-y-6">
      {/* Captain/Officer focused dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {currentVessel && (
          <Card>
            <h3 className="text-sm font-semibold text-text-secondary mb-2">{safeGetShipName()}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Current Port:</span>
                <span className="text-text-primary font-medium">Rotterdam</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Next Port:</span>
                <span className="text-text-primary font-medium">Singapore</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">ETA:</span>
                <span className="text-text-primary font-medium">2024-02-15</span>
              </div>
            </div>
          </Card>
        )}
        <Card>
          <h3 className="text-sm font-semibold text-text-secondary mb-2">Navigation Status</h3>
          <div className="text-3xl font-bold text-success mb-2">OK</div>
          <p className="text-xs text-text-secondary">All systems operational</p>
        </Card>
        <Card>
          <h3 className="text-sm font-semibold text-text-secondary mb-2">Weather Conditions</h3>
          <div className="text-3xl font-bold text-info mb-2">Fair</div>
          <p className="text-xs text-text-secondary">Favorable for routing</p>
        </Card>
      </div>
    </div>
  );

  const renderEngineerDashboard = () => (
    <div className="space-y-6">
      {/* Engineer focused dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <h3 className="text-sm font-semibold text-text-secondary mb-4">Machinery Health</h3>
          <div className="flex items-center justify-center">
            <Gauge value={machineryHealth} maxValue={100} label="Health" unit="%" size={150} />
          </div>
        </Card>
        <Card>
          <h3 className="text-sm font-semibold text-text-secondary mb-2">Fuel Consumption</h3>
          <div className="text-3xl font-bold text-text-primary mb-2">45.2 t/day</div>
          <p className="text-xs text-text-secondary">Average last 30 days</p>
        </Card>
        <Card>
          <h3 className="text-sm font-semibold text-text-secondary mb-2">WHR Efficiency</h3>
          <div className="text-3xl font-bold text-success mb-2">82%</div>
          <p className="text-xs text-text-secondary">Waste heat recovery</p>
        </Card>
      </div>
    </div>
  );

  const renderCrewDashboard = () => (
    <div className="space-y-6">
      {/* Crew focused dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-sm font-semibold text-text-secondary mb-2">My Tasks</h3>
          <div className="space-y-2">
            <div className="p-3 bg-subtle rounded-lg">
              <div className="font-medium text-text-primary">Fuel level check</div>
              <div className="text-xs text-text-secondary">Due today</div>
            </div>
          </div>
        </Card>
        <Card>
          <h3 className="text-sm font-semibold text-text-secondary mb-2">Performance</h3>
          <div className="text-3xl font-bold text-success mb-2">Good</div>
          <p className="text-xs text-text-secondary">Rank: 15/50</p>
        </Card>
      </div>
    </div>
  );

  const renderDefaultDashboard = () => (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Dashboard Overview</h3>
        <p className="text-text-secondary">Welcome to your dashboard</p>
      </Card>
    </div>
  );

  return (
    <div className={className}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          {!user ? 'Dashboard' :
            user.role === UserRole.ADMIN
            ? 'System Administrator Dashboard'
            : user.role === UserRole.MANAGER || user.role === UserRole.FLEET_SUPERINTENDENT 
            ? 'EU-ETS Dashboard' 
            : `${user.firstName || 'User'}'s Dashboard`}
        </h1>
        <p className="text-text-secondary">
          {!user ? 'Welcome to your dashboard' :
            user.role === UserRole.ADMIN
            ? 'Complete system overview, user management, and fleet administration'
            : user.role === UserRole.MANAGER || user.role === UserRole.FLEET_SUPERINTENDENT
            ? 'Comprehensive fleet emissions and compliance overview'
            : 'Your personalized dashboard overview'}
        </p>
      </div>

      {/* EUA Ticker - Show for Admin, Manager, Compliance, Trader */}
      {user && (user.role === UserRole.ADMIN || user.role === UserRole.MANAGER || user.role === UserRole.FLEET_SUPERINTENDENT || 
        user.role === UserRole.COMPLIANCE_OFFICER || user.role === UserRole.TRADER) && (
        <EuaTicker className="mb-6" price={euaPrice} source={euaSource} />
      )}

      {/* Role-specific content */}
      {renderRoleSpecificContent()}
    </div>
  );
};

export default ComprehensiveDashboard;

