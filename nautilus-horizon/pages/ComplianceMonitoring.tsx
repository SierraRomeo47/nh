import React from 'react';
import Card from '../components/Card';

const ComplianceMonitoring: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          Compliance Monitoring
        </h1>
        <p className="text-text-secondary">
          Monitor regulatory compliance status across your fleet and manage compliance requirements.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-4">EU ETS Compliance</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-success/20 border border-success/30 rounded-lg">
              <div>
                <div className="font-medium text-success">Compliant Vessels</div>
                <div className="text-sm text-text-secondary">10/12 vessels</div>
              </div>
              <div className="text-2xl">✅</div>
            </div>
            <div className="flex justify-between items-center p-3 bg-warning/20 border border-warning/30 rounded-lg">
              <div>
                <div className="font-medium text-warning">Pending Verification</div>
                <div className="text-sm text-text-secondary">2 vessels</div>
              </div>
              <div className="text-2xl">⚠️</div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Total EUA Exposure</span>
              <span className="font-semibold text-text-primary">2,739 tCO₂</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-4">FuelEU Compliance</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-success/20 border border-success/30 rounded-lg">
              <div>
                <div className="font-medium text-success">Surplus Vessels</div>
                <div className="text-sm text-text-secondary">2 vessels</div>
              </div>
              <div className="text-2xl">✅</div>
            </div>
            <div className="flex justify-between items-center p-3 bg-error/20 border border-error/30 rounded-lg">
              <div>
                <div className="font-medium text-error">Deficit Vessels</div>
                <div className="text-sm text-text-secondary">5 vessels</div>
              </div>
              <div className="text-2xl">❌</div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Net Fleet Balance</span>
              <span className="font-semibold text-error">-5.2M gCO₂e</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Regulatory Deadlines</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-error/20 border border-error/30 rounded-lg">
              <div>
                <div className="font-semibold text-error">EU ETS Surrender</div>
                <div className="text-sm text-text-secondary">Due: March 31, 2024</div>
              </div>
              <div className="text-2xl font-bold text-error">15 days</div>
            </div>
            <div className="flex justify-between items-center p-3 bg-warning/20 border border-warning/30 rounded-lg">
              <div>
                <div className="font-semibold text-warning">FuelEU Reporting</div>
                <div className="text-sm text-text-secondary">Due: April 30, 2024</div>
              </div>
              <div className="text-2xl font-bold text-warning">45 days</div>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Compliance Alerts</h3>
        <div className="space-y-3">
          <div className="flex items-start p-4 bg-error/20 border border-error/30 rounded-lg">
            <div className="text-2xl mr-3">🚨</div>
            <div>
              <div className="font-semibold text-error">Critical: EU ETS Deadline Approaching</div>
              <div className="text-sm text-text-secondary">EU ETS surrender due in 15 days. Ensure all allowances are available.</div>
            </div>
          </div>
          <div className="flex items-start p-4 bg-warning/20 border border-warning/30 rounded-lg">
            <div className="text-2xl mr-3">⚠️</div>
            <div>
              <div className="font-semibold text-warning">FuelEU Deficit Alert</div>
              <div className="text-sm text-text-secondary">5 vessels have FuelEU deficits. Consider pooling or banking options.</div>
            </div>
          </div>
          <div className="flex items-start p-4 bg-info/20 border border-info/30 rounded-lg">
            <div className="text-2xl mr-3">ℹ️</div>
            <div>
              <div className="font-semibold text-info">Verification Required</div>
              <div className="text-sm text-text-secondary">Fuel consumption data for 2 vessels needs verification.</div>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors">
            <div className="font-medium">Create RFQ</div>
            <div className="text-sm opacity-80">Create pooling RFQ for deficit vessels</div>
          </button>
          <button className="px-4 py-3 bg-card border border-subtle text-text-primary rounded-lg hover:bg-subtle transition-colors">
            <div className="font-medium">Verify Data</div>
            <div className="text-sm text-text-secondary">Review and verify fuel consumption data</div>
          </button>
          <button className="px-4 py-3 bg-card border border-subtle text-text-primary rounded-lg hover:bg-subtle transition-colors">
            <div className="font-medium">Generate Report</div>
            <div className="text-sm text-text-secondary">Create compliance status report</div>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default ComplianceMonitoring;