// Working App with full functionality but simplified dashboard

import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Header';
import RoleBasedSidebar from './components/RoleBasedSidebar';
import SimpleDashboard from './components/SimpleDashboard';
import UserProfile from './components/UserProfile';
import Dashboard from './pages/Dashboard';
import RfqBoard from './pages/RfqBoard';
import ScenarioPad from './pages/ScenarioPad';
import Voyages from './pages/Voyages';
import CrewTasks from './pages/CrewTasks';
import CrewLeague from './pages/CrewLeague';
import FuelLogging from './pages/FuelLogging';
import EngineStatus from './pages/EngineStatus';
import FuelConsumption from './pages/FuelConsumption';
import Maintenance from './pages/Maintenance';
import ComplianceMonitoring from './pages/ComplianceMonitoring';
import Verification from './pages/Verification';
import RegulatoryDeadlines from './pages/RegulatoryDeadlines';
import TradingOpportunities from './pages/TradingOpportunities';
import MarketData from './pages/MarketData';
import Portfolio from './pages/Portfolio';
import FleetManagement from './pages/FleetManagement';
import UserManagement from './pages/UserManagement';
import SystemSettings from './pages/SystemSettings';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <UserProvider>
        <HashRouter>
          <div className="flex h-screen bg-background font-sans">
            <RoleBasedSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Header />
              <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-8">
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<SimpleDashboard />} />
                  <Route path="/profile" element={<UserProfile />} />
                  <Route path="/rfq-board" element={<RfqBoard />} />
                  <Route path="/scenario-pad" element={<ScenarioPad />} />
                  <Route path="/voyages" element={<Voyages />} />
                  <Route path="/crew/tasks" element={<CrewTasks />} />
                  <Route path="/crew/league" element={<CrewLeague />} />
                  {/* Role-specific routes */}
                  <Route path="/fuel-logging" element={<FuelLogging />} />
                  <Route path="/fuel-management" element={<FuelConsumption />} />
                  <Route path="/engine-status" element={<EngineStatus />} />
                  <Route path="/fuel-consumption" element={<FuelConsumption />} />
                  <Route path="/maintenance" element={<Maintenance />} />
                  <Route path="/fleet-management" element={<FleetManagement />} />
                  <Route path="/compliance-monitoring" element={<ComplianceMonitoring />} />
                  <Route path="/verification" element={<Verification />} />
                  <Route path="/regulatory-deadlines" element={<RegulatoryDeadlines />} />
                  <Route path="/trading-opportunities" element={<TradingOpportunities />} />
                  <Route path="/market-data" element={<MarketData />} />
                  <Route path="/portfolio" element={<Portfolio />} />
                  <Route path="/user-management" element={<UserManagement />} />
                  <Route path="/system-settings" element={<SystemSettings />} />
                </Routes>
              </main>
            </div>
          </div>
        </HashRouter>
      </UserProvider>
    </ErrorBoundary>
  );
};

export default App;
