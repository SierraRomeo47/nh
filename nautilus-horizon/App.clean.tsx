// Clean, working App - guaranteed to work

import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import ErrorBoundary from './components/ErrorBoundary';

// Simple, beautiful dashboard
const CleanDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-white">
      {/* Header */}
      <header className="bg-[#121212] border-b border-subtle p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">🚢 Nautilus Horizon</h1>
          <div className="flex items-center space-x-4">
            <div className="bg-card px-3 py-2 rounded-lg">
              <span className="text-text-secondary">EUA Price: </span>
              <span className="text-primary font-bold">€75.19</span>
            </div>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">R</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-[#121212] border-r border-subtle p-4 min-h-screen">
          <div className="space-y-2">
            <div className="text-text-muted text-xs uppercase tracking-wider mb-4">Navigation</div>
            <a href="#dashboard" className="flex items-center px-4 py-3 text-sm font-medium rounded-lg bg-primary text-white">
              📊 Dashboard
            </a>
            <a href="#voyages" className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-text-secondary hover:bg-subtle">
              🌍 Voyages
            </a>
            <a href="#compliance" className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-text-secondary hover:bg-subtle">
              📋 Compliance
            </a>
            <a href="#trading" className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-text-secondary hover:bg-subtle">
              💰 Trading
            </a>
            <a href="#fleet" className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-text-secondary hover:bg-subtle">
              🚢 Fleet
            </a>
          </div>
        </nav>

        {/* Dashboard Content */}
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-text-primary mb-2">Maritime Compliance Dashboard</h2>
            <p className="text-text-secondary">Welcome to your professional maritime compliance management system</p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Fleet Overview */}
            <div className="bg-card border border-subtle rounded-lg p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Fleet Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Active Vessels</span>
                  <span className="text-text-primary font-bold">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Compliant Vessels</span>
                  <span className="text-success font-bold">10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Non-Compliant</span>
                  <span className="text-error font-bold">2</span>
                </div>
              </div>
            </div>

            {/* EU ETS Status */}
            <div className="bg-card border border-subtle rounded-lg p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">EU ETS Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Total Exposure</span>
                  <span className="text-text-primary font-bold">2,739 tCO₂</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">EUA Price</span>
                  <span className="text-primary font-bold">€75.19</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Total Cost</span>
                  <span className="text-warning font-bold">€207,000</span>
                </div>
              </div>
            </div>

            {/* FuelEU Status */}
            <div className="bg-card border border-subtle rounded-lg p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">FuelEU Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Surplus Vessels</span>
                  <span className="text-success font-bold">2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Deficit Vessels</span>
                  <span className="text-error font-bold">5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Pooling Status</span>
                  <span className="text-info font-bold">Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-card border border-subtle rounded-lg p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 bg-subtle rounded-lg">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <div className="flex-1">
                  <div className="text-text-primary font-medium">MV Neptune - Fuel consumption logged</div>
                  <div className="text-text-secondary text-sm">45.2 tonnes MGO • 2 hours ago</div>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-3 bg-subtle rounded-lg">
                <div className="w-2 h-2 bg-warning rounded-full"></div>
                <div className="flex-1">
                  <div className="text-text-primary font-medium">EU ETS deadline approaching</div>
                  <div className="text-text-secondary text-sm">Surrender deadline in 15 days • 4 hours ago</div>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-3 bg-subtle rounded-lg">
                <div className="w-2 h-2 bg-info rounded-full"></div>
                <div className="flex-1">
                  <div className="text-text-primary font-medium">New RFQ posted</div>
                  <div className="text-text-secondary text-sm">500 tCO₂e surplus available • 6 hours ago</div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <UserProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<CleanDashboard />} />
          </Routes>
        </HashRouter>
      </UserProvider>
    </ErrorBoundary>
  );
};

export default App;


