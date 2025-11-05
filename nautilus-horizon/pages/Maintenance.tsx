import React from 'react';
import Card from '../components/Card';

const Maintenance: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          Maintenance Management
        </h1>
        <p className="text-text-secondary">
          Track maintenance schedules, work orders, and equipment status across the fleet.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Maintenance Status</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Scheduled</span>
              <span className="font-semibold text-warning">8</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">In Progress</span>
              <span className="font-semibold text-primary">3</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Completed</span>
              <span className="font-semibold text-success">12</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Overdue</span>
              <span className="font-semibold text-error">2</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Equipment Health</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Main Engine</span>
              <span className="font-semibold text-success">Excellent</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Auxiliary Engine</span>
              <span className="font-semibold text-success">Good</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Navigation System</span>
              <span className="font-semibold text-warning">Needs Attention</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Safety Equipment</span>
              <span className="font-semibold text-success">Excellent</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Upcoming Maintenance</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Oil Change</span>
              <span className="font-semibold text-warning">120 hours</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Filter Replacement</span>
              <span className="font-semibold text-text-primary">240 hours</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Inspection</span>
              <span className="font-semibold text-text-primary">500 hours</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Overhaul</span>
              <span className="font-semibold text-text-primary">2,000 hours</span>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Active Work Orders</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-card border border-subtle rounded-lg">
            <div>
              <div className="font-medium text-text-primary">Main Engine Oil Change</div>
              <div className="text-sm text-text-secondary">MV Aurora Spirit • Due in 120 hours</div>
            </div>
            <div className="flex space-x-2">
              <span className="px-2 py-1 bg-warning text-white rounded text-xs">Scheduled</span>
              <button className="px-3 py-1 bg-primary text-white rounded text-sm hover:bg-primary/80 transition-colors">
                Start
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-card border border-subtle rounded-lg">
            <div>
              <div className="font-medium text-text-primary">Navigation System Calibration</div>
              <div className="text-sm text-text-secondary">MV Baltic Star • In Progress</div>
            </div>
            <div className="flex space-x-2">
              <span className="px-2 py-1 bg-primary text-white rounded text-xs">In Progress</span>
              <button className="px-3 py-1 bg-card border border-subtle text-text-primary rounded text-sm hover:bg-subtle transition-colors">
                Update
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-card border border-subtle rounded-lg">
            <div>
              <div className="font-medium text-text-primary">Safety Equipment Inspection</div>
              <div className="text-sm text-text-secondary">MV Coral Wave • Overdue by 2 days</div>
            </div>
            <div className="flex space-x-2">
              <span className="px-2 py-1 bg-error text-white rounded text-xs">Overdue</span>
              <button className="px-3 py-1 bg-primary text-white rounded text-sm hover:bg-primary/80 transition-colors">
                Reschedule
              </button>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors">
            <div className="font-medium">Create Work Order</div>
            <div className="text-sm opacity-80">Schedule new maintenance task</div>
          </button>
          <button className="px-4 py-3 bg-card border border-subtle text-text-primary rounded-lg hover:bg-subtle transition-colors">
            <div className="font-medium">Equipment Report</div>
            <div className="text-sm text-text-secondary">Generate equipment status report</div>
          </button>
          <button className="px-4 py-3 bg-card border border-subtle text-text-primary rounded-lg hover:bg-subtle transition-colors">
            <div className="font-medium">Schedule Maintenance</div>
            <div className="text-sm text-text-secondary">Plan upcoming maintenance</div>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Maintenance;