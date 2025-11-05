// Simple Dashboard Component as Fallback

import React from 'react';
import { useUser } from '../contexts/UserContext';
import { UserRole } from '../contexts/UserContext';
import Card from './Card';
import LoadingSpinner from './LoadingSpinner';

const SimpleDashboard: React.FC = () => {
  const { user } = useUser();

  if (!user) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  const getRoleWelcomeMessage = () => {
    switch (user.role) {
      case UserRole.CREW:
        return {
          title: "Welcome, Crew Member!",
          message: "Here's your daily overview and tasks.",
          features: ["View your tasks", "Track performance", "Log fuel consumption"]
        };
      case UserRole.OFFICER:
        return {
          title: "Welcome, Officer!",
          message: "Monitor vessel operations and crew performance.",
          features: ["Manage voyages", "Oversee crew tasks", "Monitor compliance"]
        };
      case UserRole.ENGINEER:
        return {
          title: "Welcome, Engineer!",
          message: "Track engine performance and maintenance schedules.",
          features: ["Monitor engine status", "Track fuel consumption", "Manage maintenance"]
        };
      case UserRole.MANAGER:
        return {
          title: "Welcome, Manager!",
          message: "Overview of fleet operations and financial performance.",
          features: ["Fleet management", "Financial oversight", "Compliance monitoring"]
        };
      case UserRole.COMPLIANCE_OFFICER:
        return {
          title: "Welcome, Compliance Officer!",
          message: "Monitor compliance status and regulatory requirements.",
          features: ["Compliance monitoring", "Verification management", "Deadline tracking"]
        };
      case UserRole.TRADER:
        return {
          title: "Welcome, Trader!",
          message: "Manage RFQ board and trading opportunities.",
          features: ["RFQ management", "Market analysis", "Trading opportunities"]
        };
      case UserRole.ADMIN:
        return {
          title: "Welcome, Administrator!",
          message: "System overview and administrative functions.",
          features: ["System management", "User administration", "Full system access"]
        };
      default:
        return {
          title: "Welcome!",
          message: "Your personalized dashboard.",
          features: ["Dashboard overview", "Role-specific features"]
        };
    }
  };

  const welcome = getRoleWelcomeMessage();

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          {welcome.title}
        </h1>
        <p className="text-text-secondary">
          {welcome.message}
        </p>
      </div>

      {/* Role-specific Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* User Info Card */}
        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Your Profile</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <img
                src={user.avatarUrl || `https://picsum.photos/seed/${user.id}/40/40`}
                alt={`${user.firstName} ${user.lastName}`}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <div className="font-medium text-text-primary">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-sm text-text-secondary">
                  {user.position || user.role}
                </div>
              </div>
            </div>
            {user.shipId && (
              <div className="text-sm text-text-secondary">
                <span className="font-medium">Ship:</span> {user.shipId}
              </div>
            )}
            <div className="text-sm text-text-secondary">
              <span className="font-medium">Role:</span> {user.role}
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {welcome.features.map((feature, index) => (
              <button
                key={index}
                className="w-full p-3 bg-card border border-subtle text-text-primary rounded-lg hover:bg-subtle transition-colors text-left"
              >
                <div className="font-medium">{feature}</div>
              </button>
            ))}
          </div>
        </Card>

        {/* System Status */}
        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Application</span>
              <span className="text-success">Online</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Database</span>
              <span className="text-success">Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Last Updated</span>
              <span className="text-text-primary">Just now</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Role-specific Content */}
      {user.role === UserRole.CREW && (
        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Today's Tasks</h3>
          <div className="space-y-3">
            <div className="p-3 bg-card border border-subtle rounded-lg">
              <div className="font-medium text-text-primary">Check fuel levels</div>
              <div className="text-sm text-text-secondary">Verify fuel tank levels before departure</div>
              <div className="text-xs text-text-muted mt-1">Due: Today</div>
            </div>
            <div className="p-3 bg-card border border-subtle rounded-lg">
              <div className="font-medium text-text-primary">Safety inspection</div>
              <div className="text-sm text-text-secondary">Conduct routine safety equipment check</div>
              <div className="text-xs text-text-muted mt-1">Due: Today</div>
            </div>
          </div>
        </Card>
      )}

      {user.role === UserRole.COMPLIANCE_OFFICER && (
        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Compliance Alerts</h3>
          <div className="space-y-3">
            <div className="p-3 bg-error/20 border border-error/30 rounded-lg">
              <div className="font-medium text-error">EU ETS Deadline</div>
              <div className="text-sm text-text-secondary">Surrender deadline approaching in 15 days</div>
            </div>
            <div className="p-3 bg-warning/20 border border-warning/30 rounded-lg">
              <div className="font-medium text-warning">Verification Required</div>
              <div className="text-sm text-text-secondary">Fuel consumption data needs verification</div>
            </div>
          </div>
        </Card>
      )}

      {user.role === UserRole.MANAGER && (
        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Fleet Overview</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-text-primary">12</div>
              <div className="text-sm text-text-secondary">Active Vessels</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">95.2%</div>
              <div className="text-sm text-text-secondary">Fleet Efficiency</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">€2.1M</div>
              <div className="text-sm text-text-secondary">Monthly Revenue</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SimpleDashboard;
