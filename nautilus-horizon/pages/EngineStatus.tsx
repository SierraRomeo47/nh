import React from 'react';
import Card from '../components/Card';

const EngineStatus: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          Engine Status
        </h1>
        <p className="text-text-secondary">
          Monitor engine performance, fuel consumption, and maintenance status.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Main Engine</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Status</span>
              <span className="font-semibold text-success">Operational</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">RPM</span>
              <span className="font-semibold text-text-primary">85</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Load</span>
              <span className="font-semibold text-text-primary">78%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Fuel Rate</span>
              <span className="font-semibold text-text-primary">28.5 t/day</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">SFOC</span>
              <span className="font-semibold text-text-primary">185 g/kWh</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Auxiliary Engine</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Status</span>
              <span className="font-semibold text-success">Operational</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Load</span>
              <span className="font-semibold text-text-primary">35%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Fuel Rate</span>
              <span className="font-semibold text-text-primary">8.2 t/day</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Running Hours</span>
              <span className="font-semibold text-text-primary">2,847</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Efficiency</span>
              <span className="font-semibold text-success">94.2%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Speed</span>
              <span className="font-semibold text-text-primary">13.2 knots</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Trim</span>
              <span className="font-semibold text-text-primary">-0.1m</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Sea State</span>
              <span className="font-semibold text-text-primary">Moderate</span>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Engine Alerts</h3>
        <div className="space-y-3">
          <div className="flex items-start p-4 bg-warning/20 border border-warning/30 rounded-lg">
            <div className="text-2xl mr-3">⚠️</div>
            <div>
              <div className="font-semibold text-warning">Maintenance Due</div>
              <div className="text-sm text-text-secondary">Main engine oil change due in 120 hours</div>
            </div>
          </div>
          <div className="flex items-start p-4 bg-info/20 border border-info/30 rounded-lg">
            <div className="text-2xl mr-3">ℹ️</div>
            <div>
              <div className="font-semibold text-info">Performance Optimization</div>
              <div className="text-sm text-text-secondary">Consider adjusting trim for better efficiency</div>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors">
            <div className="font-medium">Log Engine Reading</div>
            <div className="text-sm opacity-80">Record current engine parameters</div>
          </button>
          <button className="px-4 py-3 bg-card border border-subtle text-text-primary rounded-lg hover:bg-subtle transition-colors">
            <div className="font-medium">Schedule Maintenance</div>
            <div className="text-sm text-text-secondary">Book maintenance appointment</div>
          </button>
          <button className="px-4 py-3 bg-card border border-subtle text-text-primary rounded-lg hover:bg-subtle transition-colors">
            <div className="font-medium">Generate Report</div>
            <div className="text-sm text-text-secondary">Create engine performance report</div>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default EngineStatus;