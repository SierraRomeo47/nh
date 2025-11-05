import React from 'react';
import Card from '../components/Card';

const RegulatoryDeadlines: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          Regulatory Deadlines
        </h1>
        <p className="text-text-secondary">
          Track and manage regulatory deadlines, submissions, and compliance requirements.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Upcoming Deadlines</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">This Week</span>
              <span className="font-semibold text-error">2</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">This Month</span>
              <span className="font-semibold text-warning">5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Next Quarter</span>
              <span className="font-semibold text-text-primary">8</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Overdue</span>
              <span className="font-semibold text-error">1</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Compliance Status</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">EU ETS</span>
              <span className="font-semibold text-warning">85%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">FuelEU</span>
              <span className="font-semibold text-success">92%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">IMO DCS</span>
              <span className="font-semibold text-success">100%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Overall</span>
              <span className="font-semibold text-success">94%</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Recent Submissions</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <div className="text-sm">
                <div className="text-text-primary">EU ETS Q4 2024</div>
                <div className="text-text-secondary">Submitted 2 days ago</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <div className="text-sm">
                <div className="text-text-primary">FuelEU Annual Report</div>
                <div className="text-text-secondary">Submitted 1 week ago</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-warning rounded-full"></div>
              <div className="text-sm">
                <div className="text-text-primary">IMO DCS 2024</div>
                <div className="text-text-secondary">Due in 3 days</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Critical Deadlines</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-error/20 border border-error/30 rounded-lg">
            <div>
              <div className="font-semibold text-error">EU ETS Surrender Deadline</div>
              <div className="text-sm text-text-secondary">March 31, 2024 • 15 days remaining</div>
            </div>
            <div className="text-2xl font-bold text-error">15 days</div>
          </div>
          <div className="flex items-center justify-between p-4 bg-warning/20 border border-warning/30 rounded-lg">
            <div>
              <div className="font-semibold text-warning">FuelEU Annual Report</div>
              <div className="text-sm text-text-secondary">April 30, 2024 • 45 days remaining</div>
            </div>
            <div className="text-2xl font-bold text-warning">45 days</div>
          </div>
          <div className="flex items-center justify-between p-4 bg-info/20 border border-info/30 rounded-lg">
            <div>
              <div className="font-semibold text-info">IMO DCS Annual Report</div>
              <div className="text-sm text-text-secondary">May 31, 2024 • 76 days remaining</div>
            </div>
            <div className="text-2xl font-bold text-info">76 days</div>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-text-primary mb-4">All Deadlines</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-card border border-subtle rounded-lg">
            <div>
              <div className="font-medium text-text-primary">EU ETS Surrender</div>
              <div className="text-sm text-text-secondary">March 31, 2024 • All vessels</div>
            </div>
            <div className="flex space-x-2">
              <span className="px-2 py-1 bg-error text-white rounded text-xs">Critical</span>
              <button className="px-3 py-1 bg-primary text-white rounded text-sm hover:bg-primary/80 transition-colors">
                Prepare
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-card border border-subtle rounded-lg">
            <div>
              <div className="font-medium text-text-primary">FuelEU Annual Report</div>
              <div className="text-sm text-text-secondary">April 30, 2024 • All vessels</div>
            </div>
            <div className="flex space-x-2">
              <span className="px-2 py-1 bg-warning text-white rounded text-xs">Upcoming</span>
              <button className="px-3 py-1 bg-card border border-subtle text-text-primary rounded text-sm hover:bg-subtle transition-colors">
                Start
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-card border border-subtle rounded-lg">
            <div>
              <div className="font-medium text-text-primary">IMO DCS Annual Report</div>
              <div className="text-sm text-text-secondary">May 31, 2024 • All vessels</div>
            </div>
            <div className="flex space-x-2">
              <span className="px-2 py-1 bg-info text-white rounded text-xs">Scheduled</span>
              <button className="px-3 py-1 bg-card border border-subtle text-text-primary rounded text-sm hover:bg-subtle transition-colors">
                Plan
              </button>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors">
            <div className="font-medium">Prepare Submission</div>
            <div className="text-sm opacity-80">Start preparing regulatory submission</div>
          </button>
          <button className="px-4 py-3 bg-card border border-subtle text-text-primary rounded-lg hover:bg-subtle transition-colors">
            <div className="font-medium">Set Reminder</div>
            <div className="text-sm text-text-secondary">Set deadline reminder</div>
          </button>
          <button className="px-4 py-3 bg-card border border-subtle text-text-primary rounded-lg hover:bg-subtle transition-colors">
            <div className="font-medium">Deadline Report</div>
            <div className="text-sm text-text-secondary">Generate deadline report</div>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default RegulatoryDeadlines;