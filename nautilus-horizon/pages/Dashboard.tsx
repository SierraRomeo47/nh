
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { UserRole } from '../contexts/UserContext';
import Card from '../components/Card';
import Gauge from '../components/Gauge';
import TccMeter from '../components/TccMeter';
import EuaTicker from '../components/EuaTicker';
import LeagueTable from '../components/LeagueTable';
import ComprehensiveDashboard from '../components/ComprehensiveDashboard';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { InformationCircleIcon, ChevronUpIcon, ChevronDownIcon } from '../components/common/Icons';
import { fetchVoyages, mockLeagueStandings } from '../services/mockApi';
import { Voyage, TccData } from '../types/index';
import { generateMarketAnalysis } from '../services/geminiService';
import { logger } from '../services/logger';

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
      logger.error(
        'Failed to fetch market data',
        error as Error,
        {
          component: 'Dashboard',
          action: 'fetchMarketData',
        }
      );
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
        logger.error(
          'Failed to load dashboard data',
          error as Error,
          {
            component: 'Dashboard',
            action: 'loadData',
            userRole: user?.role,
          }
        );
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
  const displayVoyages = isVesselSpecific ? (getVesselSpecificData(voyages, 'voyages') || []) : (Array.isArray(voyages) ? voyages : []);
  
  const surplusVoyage = displayVoyages.find(v => (v.fueleu?.compliance_balance_gco2e || 0) > 0);
  const deficitVoyage = displayVoyages.find(v => (v.fueleu?.compliance_balance_gco2e || 0) < 0);
  
  // Calculate TCC (fleet-wide for managers, vessel-specific for crew)
  const fleetTcc: TccData = React.useMemo(() => {
    if (!displayVoyages || displayVoyages.length === 0) return tccData;
    
    try {
      const totalFuelCost = displayVoyages.reduce((sum, v) => {
        const fuelByType = v.imo_dcs?.fuel_by_type_t || {};
        const fuelTons = Object.values(fuelByType).reduce((a: number, b: number) => (a || 0) + (b || 0), 0);
        return sum + (fuelTons * 600); // Assume €600/tonne
      }, 0);
      
      const totalEtsCost = displayVoyages.reduce((sum, v) => {
        const exposure = v.eu_ets?.eua_exposure_tco2 || 0;
        return sum + (exposure * euaPrice);
      }, 0);
      
      const totalFuelEuCost = displayVoyages.reduce((sum, v) => {
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
      logger.error('Error calculating TCC', error as Error, { component: 'Dashboard' });
      return tccData;
    }
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

  // Use comprehensive dashboard for all roles
  return <ComprehensiveDashboard />;
};

export default Dashboard;
