// Complete working App with all features

import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { UserProvider, useUser, UserRole } from './contexts/UserContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import ComplianceMonitoring from './pages/ComplianceMonitoring';
import CrewLeague from './pages/CrewLeague';
import CrewTasks from './pages/CrewTasks';
import EngineStatus from './pages/EngineStatus';
import FleetManagement from './pages/FleetManagement';
import FuelConsumption from './pages/FuelConsumption';
import FuelLogging from './pages/FuelLogging';
import Maintenance from './pages/Maintenance';
import MarketData from './pages/MarketData';
import Portfolio from './pages/Portfolio';
import ProfileSettings from './pages/ProfileSettings';
import RegulatoryDeadlines from './pages/RegulatoryDeadlines';
import RfqBoard from './pages/RfqBoard';
import ScenarioPad from './pages/ScenarioPad';
import SystemSettings from './pages/SystemSettings';
import TradingOpportunities from './pages/TradingOpportunities';
import UserManagement from './pages/UserManagement';
import Verification from './pages/Verification';
import Voyages from './pages/Voyages';
import WasteHeatRecovery from './pages/WasteHeatRecovery';
import InsuranceQuotes from './pages/InsuranceQuotes';
import CharterMarket from './pages/CharterMarket';
import BrokerDesk from './pages/BrokerDesk';
import VoyageCalculator from './pages/VoyageCalculator';
import BunkerBargePerformance from './pages/BunkerBargePerformance';
import Login from './pages/Login';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import { Permission } from './types/user';

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <>{children}</>;
};

const Shell: React.FC = () => {
  const { user } = useUser();
  const loc = useLocation();
  const showChrome = !!user && loc.pathname !== '/login';

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'var(--bg-primary)', 
      color: 'var(--text-primary)', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {showChrome && <Header />}
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 80px)', height: 'calc(100vh - 80px)' }}>
        {showChrome && <Sidebar />}
        <main style={{ flex: 1, padding: '24px', overflow: 'auto', backgroundColor: 'var(--bg-primary)', height: '100%' }}>
          <ErrorBoundary>
            <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          
          {/* Dashboard - All authenticated users */}
          <Route path="/dashboard" element={
            <RequireAuth>
              <ProtectedRoute requiredPermission={Permission.VIEW_DASHBOARD}>
                <Dashboard />
              </ProtectedRoute>
            </RequireAuth>
          } />
          
          {/* Crew Routes */}
          <Route path="/crew/tasks" element={
            <RequireAuth>
              <ProtectedRoute requiredPermission={Permission.VIEW_CREW_TASKS}>
                <CrewTasks />
              </ProtectedRoute>
            </RequireAuth>
          } />
          <Route path="/crew/league" element={
            <RequireAuth>
              <ProtectedRoute requiredPermission={Permission.VIEW_LEAGUE}>
                <CrewLeague />
              </ProtectedRoute>
            </RequireAuth>
          } />
          
          {/* Voyage Management Routes */}
          <Route path="/voyages" element={
            <RequireAuth>
              <ProtectedRoute requiredPermission={Permission.VIEW_VOYAGES}>
                <Voyages />
              </ProtectedRoute>
            </RequireAuth>
          } />
          
          {/* Engineer Routes */}
          <Route path="/engine-status" element={
            <RequireAuth>
              <ProtectedRoute requiredPermission={Permission.VIEW_ENGINE_STATUS}>
                <EngineStatus />
              </ProtectedRoute>
            </RequireAuth>
          } />
          <Route path="/maintenance" element={
            <RequireAuth>
              <ProtectedRoute requiredPermission={Permission.MANAGE_MAINTENANCE}>
                <Maintenance />
              </ProtectedRoute>
            </RequireAuth>
          } />
          <Route path="/waste-heat-recovery" element={
            <RequireAuth>
              <ProtectedRoute requiredPermission={Permission.MANAGE_WHR_SYSTEMS}>
                <WasteHeatRecovery />
              </ProtectedRoute>
            </RequireAuth>
          } />
          
          {/* Fleet Management Routes */}
          <Route path="/fleet-management" element={
            <RequireAuth>
              <ProtectedRoute requiredPermission={Permission.VIEW_FLEET_OVERVIEW}>
                <FleetManagement />
              </ProtectedRoute>
            </RequireAuth>
          } />
          <Route path="/rfq-board" element={
            <RequireAuth>
              <ProtectedRoute requiredPermission={Permission.VIEW_RFQ_BOARD}>
                <RfqBoard />
              </ProtectedRoute>
            </RequireAuth>
          } />
          <Route path="/scenario-pad" element={
            <RequireAuth>
              <ProtectedRoute requiredPermission={Permission.VIEW_FINANCIAL_DATA}>
                <ScenarioPad />
              </ProtectedRoute>
            </RequireAuth>
          } />
          
          {/* Compliance Routes */}
          <Route path="/compliance-monitoring" element={
            <RequireAuth>
              <ProtectedRoute requiredPermission={Permission.VIEW_COMPLIANCE_DATA}>
                <ComplianceMonitoring />
              </ProtectedRoute>
            </RequireAuth>
          } />
          <Route path="/verification" element={
            <RequireAuth>
              <ProtectedRoute requiredPermission={Permission.VERIFY_FUEL_DATA}>
                <Verification />
              </ProtectedRoute>
            </RequireAuth>
          } />
          <Route path="/regulatory-deadlines" element={
            <RequireAuth>
              <ProtectedRoute requiredPermission={Permission.VIEW_COMPLIANCE_DATA}>
                <RegulatoryDeadlines />
              </ProtectedRoute>
            </RequireAuth>
          } />
          
          {/* Trading Routes */}
          <Route path="/trading-opportunities" element={
            <RequireAuth>
              <ProtectedRoute requiredPermission={Permission.RESPOND_TO_RFQ}>
                <TradingOpportunities />
              </ProtectedRoute>
            </RequireAuth>
          } />
          <Route path="/market-data" element={
            <RequireAuth>
              <ProtectedRoute requiredPermission={Permission.VIEW_FINANCIAL_DATA}>
                <MarketData />
              </ProtectedRoute>
            </RequireAuth>
          } />
          <Route path="/portfolio" element={
            <RequireAuth>
              <ProtectedRoute requiredPermission={Permission.MANAGE_RFQ}>
                <Portfolio />
              </ProtectedRoute>
            </RequireAuth>
          } />
          
          {/* Admin Routes */}
          <Route path="/user-management" element={
            <RequireAuth>
              <ProtectedRoute requiredPermission={Permission.MANAGE_USERS}>
                <UserManagement />
              </ProtectedRoute>
            </RequireAuth>
          } />
          <Route path="/system-settings" element={
            <RequireAuth>
              <ProtectedRoute requiredPermission={Permission.SYSTEM_ADMIN}>
                <SystemSettings />
              </ProtectedRoute>
            </RequireAuth>
          } />
          
          {/* Fuel Management Routes */}
          <Route path="/fuel-consumption" element={
            <RequireAuth>
              <ProtectedRoute requiredPermission={Permission.VIEW_FUEL_DATA}>
                <FuelConsumption />
              </ProtectedRoute>
            </RequireAuth>
          } />
          <Route path="/fuel-logging" element={
            <RequireAuth>
              <ProtectedRoute requiredPermission={Permission.ENTER_FUEL_CONSUMPTION}>
                <FuelLogging />
              </ProtectedRoute>
            </RequireAuth>
          } />
          <Route path="/bunker-barge-performance" element={
            <RequireAuth>
              <ProtectedRoute requiredPermission={Permission.VIEW_FUEL_DATA}>
                <BunkerBargePerformance />
              </ProtectedRoute>
            </RequireAuth>
          } />
          
          {/* Insurance Routes */}
          <Route path="/insurance/quotes" element={
            <RequireAuth>
              <ProtectedRoute requiredPermission={Permission.VIEW_INSURANCE_QUOTES}>
                <InsuranceQuotes />
              </ProtectedRoute>
            </RequireAuth>
          } />
          
          {/* Charter Market Routes */}
          <Route path="/charter-market" element={
            <RequireAuth>
              <ProtectedRoute requiredPermission={Permission.VIEW_CHARTER_MARKET}>
                <CharterMarket />
              </ProtectedRoute>
            </RequireAuth>
          } />
          
          {/* Broker Desk Routes */}
          <Route path="/broker-desk" element={
            <RequireAuth>
              <ProtectedRoute requiredPermission={Permission.VIEW_CHARTER_MARKET}>
                <BrokerDesk />
              </ProtectedRoute>
            </RequireAuth>
          } />
          
          {/* Voyage Calculator */}
          <Route path="/voyage-calculator" element={
            <RequireAuth>
              <ProtectedRoute requiredPermission={Permission.VIEW_VOYAGE_ESTIMATES}>
                <VoyageCalculator />
              </ProtectedRoute>
            </RequireAuth>
          } />
          
          {/* Profile Settings - All authenticated users */}
          <Route path="/profile-settings" element={
            <RequireAuth>
              <ProtectedRoute requiredPermission={Permission.EDIT_USER_PROFILE}>
                <ProfileSettings />
              </ProtectedRoute>
            </RequireAuth>
          } />
            </Routes>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <UserProvider>
        <HashRouter>
          <Shell />
      
      {/* Add CSS for pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
        </HashRouter>
      </UserProvider>
    </ErrorBoundary>
  );
};

export default App;


