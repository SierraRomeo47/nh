
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { UserRole } from '../contexts/UserContext';
import Card from '../components/Card';
import Gauge from '../components/Gauge';
import TccMeter from '../components/TccMeter';
import EuaTicker from '../components/EuaTicker';
import LeagueTable from '../components/LeagueTable';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { InformationCircleIcon, ChevronUpIcon, ChevronDownIcon } from '../components/common/Icons';
import { fetchVoyages, mockLeagueStandings } from '../services/mockApi';
import { Voyage, TccData } from '../types/index';
import { generateMarketAnalysis } from '../services/geminiService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const tccData = {
  fuelCost: 1_250_000,
  etsCost: 350_000,
  fuelEUCost: 85_000,
  total: 1_685_000,
};

const pieData = [
  { name: 'Fuel Cost', value: tccData.fuelCost },
  { name: 'ETS Allowances', value: tccData.etsCost },
  { name: 'FuelEU Settlement', value: tccData.fuelEUCost },
];

const COLORS = ['#0ea5e9', '#FF6A00', '#D90429']; // Blue, Orange, Red

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, getVesselSpecificData, getShipName, dashboardConfig } = useUser();
  const [voyages, setVoyages] = useState<Voyage[]>([]);
  const [loading, setLoading] = useState(true);
  const [euaPrice, setEuaPrice] = useState(76.0);
  const [lastEuaPrice, setLastEuaPrice] = useState(76.0);
  const [euaSource, setEuaSource] = useState('');
  const [futuresPrice, setFuturesPrice] = useState(78.15);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [marketAnalysis, setMarketAnalysis] = useState('');
  const [analyzingMarket, setAnalyzingMarket] = useState(false);
  const [, forceUpdate] = React.useState({});

  const fetchMarketData = async () => {
    try {
      // Fetch current EUA price
      const euaResponse = await fetch(`${API_BASE_URL}/trading/api/market/eua`);
      const euaData = await euaResponse.json();
      
      if (euaData.code === 'SUCCESS') {
        setLastEuaPrice(euaPrice);
        setEuaPrice(parseFloat(euaData.data.price));
        setEuaSource(euaData.data.source);
        
        // Calculate futures price (typically 2-3% premium)
        const premium = 1.025;
        setFuturesPrice(parseFloat(euaData.data.price) * premium);
      }

      // Fetch historical data for chart
      const historyResponse = await fetch(`${API_BASE_URL}/trading/api/market/history?dataType=EUA&days=30`);
      const historyData = await historyResponse.json();
      
      if (historyData.code === 'SUCCESS') {
        const chartData = historyData.data.slice(-30).map((item: any) => ({
          date: new Date(item.timestamp).toLocaleDateString(),
          price: parseFloat(item.price)
        }));
        setHistoricalData(chartData);
      }
    } catch (error) {
      console.error('Failed to fetch market data:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const voyageData = await fetchVoyages();
        setVoyages(voyageData);
        
        // Initial market data fetch
        await fetchMarketData();
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Update market data every 30 seconds
    const priceInterval = setInterval(fetchMarketData, 30000);

    return () => clearInterval(priceInterval);
  }, []);

  // Listen for custom event to trigger re-render when settings are saved
  useEffect(() => {
    const handleSettingsChange = () => {
      forceUpdate({});
    };

    window.addEventListener('userSettingsChanged', handleSettingsChange);
    return () => window.removeEventListener('userSettingsChanged', handleSettingsChange);
  }, []);

  // Filter voyages based on user role and vessel assignment
  const isVesselSpecific = user && [UserRole.CREW, UserRole.ENGINEER, UserRole.CAPTAIN, UserRole.CHIEF_ENGINEER].includes(user.role);
  const displayVoyages = isVesselSpecific ? getVesselSpecificData(voyages, 'voyages') : voyages;
  
  const surplusVoyage = displayVoyages.find(v => v.fueleu.compliance_balance_gco2e > 0);
  const deficitVoyage = displayVoyages.find(v => v.fueleu.compliance_balance_gco2e < 0);
  
  // Calculate TCC (fleet-wide for managers, vessel-specific for crew)
  const fleetTcc: TccData = React.useMemo(() => {
    if (displayVoyages.length === 0) return tccData;
    
    const totalFuelCost = displayVoyages.reduce((sum, v) => {
      const fuelTons = Object.values(v.imo_dcs.fuel_by_type_t).reduce((a, b) => a + b, 0);
      return sum + (fuelTons * 600); // Assume €600/tonne
    }, 0);
    
    const totalEtsCost = displayVoyages.reduce((sum, v) => {
      return sum + (v.eu_ets.eua_exposure_tco2 * euaPrice);
    }, 0);
    
    const totalFuelEuCost = displayVoyages.reduce((sum, v) => {
      const deficit = Math.max(0, -v.fueleu.compliance_balance_gco2e);
      return sum + (deficit / 1e6 * 60); // €60 penalty per tonne
    }, 0);
    
    return {
      fuelCost: totalFuelCost,
      etsCost: totalEtsCost,
      fuelEUCost: totalFuelEuCost,
      total: totalFuelCost + totalEtsCost + totalFuelEuCost
    };
  }, [displayVoyages, euaPrice]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getRoleWelcomeContent = () => {
    if (!user) return { title: 'Dashboard', subtitle: 'Welcome to Nautilus Horizon' };
    
    switch (user.role) {
      case UserRole.CREW:
        return {
          title: `Welcome back, ${user.firstName}!`,
          subtitle: "Here's your daily tasks and performance metrics."
        };
      case UserRole.OFFICER:
        return {
          title: `Officer Dashboard - ${user.firstName}`,
          subtitle: "Monitor your vessel's operations and crew performance."
        };
      case UserRole.ENGINEER:
        return {
          title: `Engineer Dashboard - ${user.firstName}`,
          subtitle: "Track engine performance and maintenance schedules."
        };
      case UserRole.MANAGER:
        return {
          title: `Manager Dashboard - ${user.firstName}`,
          subtitle: "Overview of fleet operations and financial performance."
        };
      case UserRole.COMPLIANCE_OFFICER:
        return {
          title: `Compliance Dashboard - ${user.firstName}`,
          subtitle: "Monitor compliance status and regulatory requirements."
        };
      case UserRole.TRADER:
        return {
          title: `Trading Dashboard - ${user.firstName}`,
          subtitle: "Manage RFQ board and trading opportunities."
        };
      case UserRole.ADMIN:
        return {
          title: `Admin Dashboard - ${user.firstName}`,
          subtitle: "System overview and administrative functions."
        };
      default:
        return {
          title: 'Dashboard',
          subtitle: 'Welcome to Nautilus Horizon'
        };
    }
  };

  const welcomeContent = getRoleWelcomeContent();

  // Get layout styling based on user preferences
  const getGridClasses = () => {
    if (!dashboardConfig) return 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6';
    
    const layout = dashboardConfig.layout || 'grid';
    const columns = dashboardConfig.columns || 3;
    
    switch (layout) {
      case 'list':
        return 'flex flex-col space-y-6';
      case 'compact':
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4';
      case 'grid':
      default:
        switch (columns) {
          case 1: return 'grid grid-cols-1 gap-6';
          case 2: return 'grid grid-cols-1 lg:grid-cols-2 gap-6';
          case 3: return 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6';
          case 4: return 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6';
          default: return 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6';
        }
    }
  };

  return (
    <div className="space-y-8">
      {/* Role-based Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          {welcomeContent.title}
        </h1>
        <p className="text-text-secondary">
          {welcomeContent.subtitle}
        </p>
      </div>

      {/* EUA Ticker - Synchronized with Header */}
      <EuaTicker className="mb-6" price={euaPrice} source={euaSource} />
      
      <div className={getGridClasses()}>
        {/* TCC Meter */}
        <TccMeter data={fleetTcc} size="lg" />
        
        {/* Fleet/Vessel Overview */}
        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            {isVesselSpecific ? `${getShipName()} Overview` : 'Fleet Overview'}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-text-primary">{displayVoyages.length}</div>
              <div className="text-sm text-text-secondary">Active Voyages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                {displayVoyages.filter(v => v.fueleu.compliance_balance_gco2e > 0).length}
              </div>
              <div className="text-sm text-text-secondary">FuelEU Surplus</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-error">
                {displayVoyages.filter(v => v.fueleu.compliance_balance_gco2e < 0).length}
              </div>
              <div className="text-sm text-text-secondary">FuelEU Deficit</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {displayVoyages.reduce((sum, v) => sum + v.eu_ets.eua_exposure_tco2, 0).toFixed(0)}
              </div>
              <div className="text-sm text-text-secondary">Total EUA Exposure</div>
            </div>
          </div>
        </Card>
        
        {/* Quick Actions */}
        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            {isVesselSpecific ? `Quick Actions - ${getShipName()}` : 'Quick Actions'}
          </h3>
          <div className="space-y-3">
            {/* Show RFQ actions only for managers and traders */}
            {!isVesselSpecific && (
              <button
                onClick={() => navigate('/rfq-board')}
                className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors text-left"
              >
                <div className="font-medium">Create Pooling RFQ</div>
                <div className="text-sm opacity-80">Trade FuelEU compliance units</div>
              </button>
            )}
            
            {/* Vessel-specific actions for crew */}
            {isVesselSpecific && user?.role === UserRole.CREW && (
              <button
                onClick={() => navigate('/fuel-logging')}
                className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors text-left"
              >
                <div className="font-medium">Log Fuel Consumption</div>
                <div className="text-sm opacity-80">Record daily fuel usage</div>
              </button>
            )}
            
            {/* Engineer-specific actions */}
            {isVesselSpecific && user?.role === UserRole.ENGINEER && (
              <button
                onClick={() => navigate('/engine-status')}
                className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors text-left"
              >
                <div className="font-medium">Engine Status Check</div>
                <div className="text-sm opacity-80">Monitor engine performance</div>
              </button>
            )}
            
            <button
              onClick={() => navigate('/scenario-pad')}
              className="w-full px-4 py-3 bg-card border border-subtle text-text-primary rounded-lg hover:bg-subtle transition-colors text-left"
            >
              <div className="font-medium">Scenario Analysis</div>
              <div className="text-sm text-text-secondary">Model voyage optimizations</div>
            </button>
            <button
              onClick={() => navigate('/voyages')}
              className="w-full px-4 py-3 bg-card border border-subtle text-text-primary rounded-lg hover:bg-subtle transition-colors text-left"
            >
              <div className="font-medium">Voyage Details</div>
              <div className="text-sm text-text-secondary">Review compliance data</div>
            </button>
          </div>
        </Card>
      </div>

      <Card title="Compliance Alerts & Eligibility">
        <div className="space-y-4">
          {surplusVoyage && (
            <div className="flex items-start p-4 bg-blue-900/30 border border-blue-700 rounded-lg">
              <InformationCircleIcon className="h-6 w-6 text-blue-400 mr-3 mt-1 shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-300">FuelEU Pooling Opportunity</h3>
                <p className="text-sm text-blue-400">
                  Ship '{surplusVoyage.ship_name}' has a projected FuelEU surplus of {(surplusVoyage.fueleu.compliance_balance_gco2e).toLocaleString()} gCO₂e for {surplusVoyage.eu_ets.reported_year}. You are eligible to create a pooling RFQ to trade this surplus.
                </p>
                <button onClick={() => navigate('/rfq-board')} className="mt-2 text-sm bg-primary text-white font-semibold py-1 px-3 rounded-md hover:bg-orange-700 transition">Create RFQ</button>
              </div>
            </div>
          )}
          {deficitVoyage && (
            <div className="flex items-start p-4 bg-yellow-900/30 border border-yellow-700 rounded-lg">
              <InformationCircleIcon className="h-6 w-6 text-yellow-400 mr-3 mt-1 shrink-0" />
              <div>
                <h3 className="font-semibold text-yellow-300">FuelEU Borrowing Advisory</h3>
                <p className="text-sm text-yellow-400">
                  Ship '{deficitVoyage.ship_name}' is projected to have a FuelEU deficit. Borrowing up to 2% is available, but this will restrict borrowing eligibility for the next period.
                </p>
                <button onClick={() => navigate('/scenario-pad')} className="mt-2 text-sm bg-primary text-white font-semibold py-1 px-3 rounded-md hover:bg-orange-700 transition">Analyze Options</button>
              </div>
            </div>
          )}
           <div className="flex items-start p-4 bg-green-900/30 border border-green-700 rounded-lg">
            <InformationCircleIcon className="h-6 w-6 text-green-400 mr-3 mt-1 shrink-0" />
            <div>
              <h3 className="font-semibold text-green-300">ETS Hedging Status</h3>
              <p className="text-sm text-green-400">
                Current fleet exposure is 75% hedged against market volatility for the upcoming quarter. Average price secured is €71.50/tCO₂.
              </p>
              <button onClick={() => navigate('/voyages')} className="mt-2 text-sm bg-primary text-white font-semibold py-1 px-3 rounded-md hover:bg-orange-700 transition">Review Voyages</button>
            </div>
          </div>
        </div>
      </Card>

      {/* Fleet Competition Section - Only for Managers */}
      {!isVesselSpecific && [UserRole.MANAGER, UserRole.TECHNICAL_SUPERINTENDENT, UserRole.FLEET_SUPERINTENDENT].includes(user?.role) && (
        <Card title="Fleet Performance Competition">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-subtle p-4 rounded-lg">
              <h4 className="font-semibold text-text-primary mb-2">Top Performer</h4>
              <div className="text-center">
                <div className="text-2xl font-bold text-success">MV Neptune</div>
                <div className="text-sm text-text-secondary">95.2% Efficiency</div>
                <div className="text-xs text-success">+1250 pts</div>
              </div>
            </div>
            <div className="bg-subtle p-4 rounded-lg">
              <h4 className="font-semibold text-text-primary mb-2">Most Improved</h4>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">MV Poseidon</div>
                <div className="text-sm text-text-secondary">+8.3% vs last month</div>
                <div className="text-xs text-primary">+320 pts</div>
              </div>
            </div>
            <div className="bg-subtle p-4 rounded-lg">
              <h4 className="font-semibold text-text-primary mb-2">Fuel Efficiency</h4>
              <div className="text-center">
                <div className="text-2xl font-bold text-info">MV Triton</div>
                <div className="text-sm text-text-secondary">42.1 t/day average</div>
                <div className="text-xs text-info">-12% fuel use</div>
              </div>
            </div>
          </div>
        </Card>
      )}

    </div>
  );
};

export default Dashboard;
