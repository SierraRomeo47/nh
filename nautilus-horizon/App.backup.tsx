// Complete working App with all features

import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import RfqBoard from './pages/RfqBoard';
import ScenarioPad from './pages/ScenarioPad';
import Voyages from './pages/Voyages';
import CrewTasks from './pages/CrewTasks';
import CrewLeague from './pages/CrewLeague';
import FleetManagement from './pages/FleetManagement';
import FuelConsumption from './pages/FuelConsumption';
import EngineStatus from './pages/EngineStatus';
import Maintenance from './pages/Maintenance';
import ComplianceMonitoring from './pages/ComplianceMonitoring';
import Verification from './pages/Verification';
import RegulatoryDeadlines from './pages/RegulatoryDeadlines';
import TradingOpportunities from './pages/TradingOpportunities';
import MarketData from './pages/MarketData';
import Portfolio from './pages/Portfolio';
import UserManagement from './pages/UserManagement';
import SystemSettings from './pages/SystemSettings';
import WasteHeatRecovery from './pages/WasteHeatRecovery';
import ProfileSettings from './pages/ProfileSettings';

const App: React.FC = () => {
  return (
    <UserProvider>
      <HashRouter>
        <div className="min-h-screen bg-background text-text-primary font-sans">
          <Header />
          <div className="flex min-h-[calc(100vh-80px)]">
            <Sidebar />
            <main className="flex-1 p-8">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/rfq-board" element={<RfqBoard />} />
                <Route path="/scenario-pad" element={<ScenarioPad />} />
                <Route path="/voyages" element={<Voyages />} />
                
                {/* Crew Routes */}
                <Route path="/crew/tasks" element={<CrewTasks />} />
                <Route path="/crew/league" element={<CrewLeague />} />
                
                {/* Officer Routes */}
                <Route path="/fleet-management" element={<FleetManagement />} />
                <Route path="/fuel-consumption" element={<FuelConsumption />} />
                
                {/* Engineer Routes */}
                <Route path="/engine-status" element={<EngineStatus />} />
                <Route path="/waste-heat-recovery" element={<WasteHeatRecovery />} />
                <Route path="/maintenance" element={<Maintenance />} />
                <Route path="/emissions" element={<ComplianceMonitoring />} />
                
                {/* Captain Routes */}
                <Route path="/navigation" element={<Voyages />} />
                <Route path="/safety" element={<ComplianceMonitoring />} />
                <Route path="/compliance" element={<ComplianceMonitoring />} />
                
                {/* Compliance Officer Routes */}
                <Route path="/compliance-monitoring" element={<ComplianceMonitoring />} />
                <Route path="/regulations" element={<RegulatoryDeadlines />} />
                <Route path="/verification" element={<Verification />} />
                <Route path="/regulatory-deadlines" element={<RegulatoryDeadlines />} />
                
                {/* Trader Routes */}
                <Route path="/trading-opportunities" element={<TradingOpportunities />} />
                <Route path="/market-data" element={<MarketData />} />
                <Route path="/portfolio" element={<Portfolio />} />
                
                {/* Technical Superintendent Routes */}
                <Route path="/technical-performance" element={<EngineStatus />} />
                
                {/* Admin Routes */}
                <Route path="/user-management" element={<UserManagement />} />
                <Route path="/system-settings" element={<SystemSettings />} />
                
                {/* Profile and Settings */}
                <Route path="/profile-settings" element={<ProfileSettings />} />
              </Routes>
            </main>
          </div>
        </div>
      </HashRouter>
    </UserProvider>
  );
};

export default App;
