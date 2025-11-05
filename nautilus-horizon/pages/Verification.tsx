import React from 'react';
import Card from '../components/Card';

const Verification: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          Verification Center
        </h1>
        <p className="text-text-secondary">
          Verify fuel consumption data, compliance reports, and regulatory submissions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Verification Status</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Pending</span>
              <span className="font-semibold text-warning">5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">In Review</span>
              <span className="font-semibold text-primary">3</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Verified</span>
              <span className="font-semibold text-success">18</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Rejected</span>
              <span className="font-semibold text-error">2</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Compliance Reports</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">EU ETS Reports</span>
              <span className="font-semibold text-success">12/12</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">FuelEU Reports</span>
              <span className="font-semibold text-warning">10/12</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">IMO DCS Reports</span>
              <span className="font-semibold text-success">12/12</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Verification Rate</span>
              <span className="font-semibold text-success">94.2%</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <div className="text-sm">
                <div className="text-text-primary">MV Aurora Spirit verified</div>
                <div className="text-text-secondary">2 hours ago</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-warning rounded-full"></div>
              <div className="text-sm">
                <div className="text-text-primary">MV Baltic Star needs review</div>
                <div className="text-text-secondary">4 hours ago</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-error rounded-full"></div>
              <div className="text-sm">
                <div className="text-text-primary">MV Coral Wave rejected</div>
                <div className="text-text-secondary">1 day ago</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Pending Verifications</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-card border border-subtle rounded-lg">
            <div>
              <div className="font-medium text-text-primary">MV Baltic Star - FuelEU Report</div>
              <div className="text-sm text-text-secondary">Q4 2024 • Submitted 2 days ago</div>
            </div>
            <div className="flex space-x-2">
              <span className="px-2 py-1 bg-warning text-white rounded text-xs">Pending</span>
              <button className="px-3 py-1 bg-primary text-white rounded text-sm hover:bg-primary/80 transition-colors">
                Review
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-card border border-subtle rounded-lg">
            <div>
              <div className="font-medium text-text-primary">MV Delta Horizon - EU ETS Report</div>
              <div className="text-sm text-text-secondary">Q4 2024 • Submitted 1 day ago</div>
            </div>
            <div className="flex space-x-2">
              <span className="px-2 py-1 bg-primary text-white rounded text-xs">In Review</span>
              <button className="px-3 py-1 bg-card border border-subtle text-text-primary rounded text-sm hover:bg-subtle transition-colors">
                View
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-card border border-subtle rounded-lg">
            <div>
              <div className="font-medium text-text-primary">MV Eastern Crest - IMO DCS Report</div>
              <div className="text-sm text-text-secondary">2024 • Submitted 3 days ago</div>
            </div>
            <div className="flex space-x-2">
              <span className="px-2 py-1 bg-warning text-white rounded text-xs">Pending</span>
              <button className="px-3 py-1 bg-primary text-white rounded text-sm hover:bg-primary/80 transition-colors">
                Review
              </button>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors">
            <div className="font-medium">Verify Report</div>
            <div className="text-sm opacity-80">Verify submitted report</div>
          </button>
          <button className="px-4 py-3 bg-card border border-subtle text-text-primary rounded-lg hover:bg-subtle transition-colors">
            <div className="font-medium">Generate Report</div>
            <div className="text-sm text-text-secondary">Create verification report</div>
          </button>
          <button className="px-4 py-3 bg-card border border-subtle text-text-primary rounded-lg hover:bg-subtle transition-colors">
            <div className="font-medium">Audit Trail</div>
            <div className="text-sm text-text-secondary">View verification history</div>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Verification;