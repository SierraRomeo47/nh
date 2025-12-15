// Fuel Logging Page for Crew Members

import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import Card from '../components/Card';
import OVDImport from '../components/OVDImport';
import OVDExport from '../components/OVDExport';
import SyncStatus from '../components/SyncStatus';
import SyncConfigModal from '../components/modals/SyncConfigModal';
import NoonReportForm from '../components/NoonReportForm';
import BunkerReportForm from '../components/BunkerReportForm';
import SOFReportForm from '../components/SOFReportForm';
// Using string literals for fuel types since they're not in the simplified context

// Roles allowed to access OVD features
const OVD_ALLOWED_ROLES = [
  'ENGINEER',
  'CHIEF_ENGINEER',
  'OPERATIONS_SUPERINTENDENT',
  'TECHNICAL_SUPERINTENDENT',
  'COMPLIANCE_OFFICER',
  'ADMIN'
];

const FuelLogging: React.FC = () => {
  const { user } = useUser();
  const [showSyncConfigModal, setShowSyncConfigModal] = useState(false);
  const [activeOVDTab, setActiveOVDTab] = useState<'import' | 'export' | 'status'>('import');
  const [activeReportTab, setActiveReportTab] = useState<'noon' | 'bunker' | 'sof'>('noon');
  
  // Check if user has OVD access
  const hasOVDAccess = user?.role && OVD_ALLOWED_ROLES.includes(user.role);
  
  // Engineers and officers can submit reports
  const canSubmitReports = user?.role && [
    'ENGINEER', 'CHIEF_ENGINEER', 'OFFICER', 'CAPTAIN',
    'OPERATIONS_SUPERINTENDENT', 'TECHNICAL_SUPERINTENDENT', 'ADMIN'
  ].includes(user.role);
  const [formData, setFormData] = useState({
    fuelType: 'MGO',
    fuelCategory: 'FOSSIL',
    consumptionTonnes: '',
    consumptionDate: new Date().toISOString().split('T')[0],
    fuelSupplier: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would normally submit to your API
    console.log('Fuel logging data:', formData);
    alert('Fuel consumption logged successfully!');
  };

  const recentLogs = [
    {
      id: '1',
      date: '2024-01-15',
      fuelType: 'MGO',
      consumption: 45.2,
      supplier: 'Shell Marine',
      status: 'Submitted'
    },
    {
      id: '2',
      date: '2024-01-14',
      fuelType: 'MGO',
      consumption: 42.8,
      supplier: 'BP Marine',
      status: 'Verified'
    },
    {
      id: '3',
      date: '2024-01-13',
      fuelType: 'MDO',
      consumption: 38.5,
      supplier: 'ExxonMobil',
      status: 'Verified'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-text-primary">Fuel Logging</h1>
        <div className="text-text-secondary">
          Logged in as: {user?.firstName} {user?.lastName} - {user?.position}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fuel Logging Form */}
        <Card>
          <h2 className="text-xl font-semibold text-text-primary mb-6">Log Fuel Consumption</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Fuel Type
              </label>
              <select
                value={formData.fuelType}
                onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="MGO">MGO (Marine Gas Oil)</option>
                <option value="MDO">MDO (Marine Diesel Oil)</option>
                <option value="HFO">HFO (Heavy Fuel Oil)</option>
                <option value="LNG">LNG (Liquefied Natural Gas)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Consumption (Tonnes)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.consumptionTonnes}
                onChange={(e) => setFormData({ ...formData, consumptionTonnes: e.target.value })}
                className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter fuel consumption in tonnes"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Consumption Date
              </label>
              <input
                type="date"
                value={formData.consumptionDate}
                onChange={(e) => setFormData({ ...formData, consumptionDate: e.target.value })}
                className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Fuel Supplier
              </label>
              <input
                type="text"
                value={formData.fuelSupplier}
                onChange={(e) => setFormData({ ...formData, fuelSupplier: e.target.value })}
                className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter fuel supplier name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
                placeholder="Additional notes or observations"
              />
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors font-medium"
            >
              Log Fuel Consumption
            </button>
          </form>
        </Card>

        {/* Recent Logs */}
        <Card>
          <h2 className="text-xl font-semibold text-text-primary mb-6">Recent Fuel Logs</h2>
          <div className="space-y-4">
            {recentLogs.map((log) => (
              <div key={log.id} className="p-4 bg-card border border-subtle rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-text-primary">
                    {log.fuelType} - {log.consumption} tonnes
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    log.status === 'Verified' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
                  }`}>
                    {log.status}
                  </span>
                </div>
                <div className="text-sm text-text-secondary">
                  Date: {log.date} | Supplier: {log.supplier}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Fuel Consumption Chart */}
      <Card>
        <h2 className="text-xl font-semibold text-text-primary mb-6">Weekly Fuel Consumption</h2>
        <div className="h-64 flex items-center justify-center bg-card border border-subtle rounded-lg">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <div className="text-text-secondary">Fuel consumption chart would appear here</div>
            <div className="text-sm text-text-muted mt-2">
              Shows daily fuel consumption trends for the past week
            </div>
          </div>
        </div>
      </Card>
      
      {/* OVD Import/Export Section - Only for authorized roles */}
      {hasOVDAccess && (
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-text-primary">
                  DNV Integration
                </h2>
                <p className="text-sm text-text-secondary mt-1">
                  Import and export operational vessel data
                </p>
              </div>
              {(user?.role === 'ADMIN' || user?.role === 'OPERATIONS_SUPERINTENDENT' || user?.role === 'TECHNICAL_SUPERINTENDENT') && (
                <button
                  onClick={() => setShowSyncConfigModal(true)}
                  className="px-4 py-2 bg-card border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors text-sm font-medium"
                >
                  ⚙️ Configure Auto-Sync
                </button>
              )}
            </div>
            
            {/* Tab Navigation */}
            <div className="flex space-x-2 border-b border-subtle">
              <button
                onClick={() => setActiveOVDTab('import')}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeOVDTab === 'import'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                📥 Import
              </button>
              <button
                onClick={() => setActiveOVDTab('export')}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeOVDTab === 'export'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                📤 Export
              </button>
              <button
                onClick={() => setActiveOVDTab('status')}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeOVDTab === 'status'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                📊 Sync Status
              </button>
            </div>
            
            {/* Tab Content */}
            <div className="pt-4">
              {activeOVDTab === 'import' && <OVDImport />}
              {activeOVDTab === 'export' && <OVDExport />}
              {activeOVDTab === 'status' && <SyncStatus />}
            </div>
          </div>
        </Card>
      )}
      
      {/* Access Denied Message for non-authorized roles */}
      {!hasOVDAccess && user && (
        <Card>
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🔒</div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              DNV Integration Access Restricted
            </h3>
            <p className="text-sm text-text-secondary">
              DNV import/export features are available to Engineers, Chief Engineers,<br/>
              Operations Superintendents, Technical Superintendents, Compliance Officers, and Administrators.
            </p>
            <p className="text-xs text-text-muted mt-2">
              Your current role: {user.role}
            </p>
          </div>
        </Card>
      )}
      
      {/* Vessel Reporting System - DNV Standards */}
      {canSubmitReports && (
        <Card>
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-text-primary">
                📋 Vessel Reports (DNV Standards)
              </h2>
              <p className="text-sm text-text-secondary mt-1">
                Submit daily noon reports, bunker reports, and statement of facts
              </p>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex space-x-2 border-b border-subtle">
              <button
                onClick={() => setActiveReportTab('noon')}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeReportTab === 'noon'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                📍 Noon Report
              </button>
              <button
                onClick={() => setActiveReportTab('bunker')}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeReportTab === 'bunker'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                ⛽ Bunker Report
              </button>
              <button
                onClick={() => setActiveReportTab('sof')}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeReportTab === 'sof'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                📄 SOF Report
              </button>
            </div>
            
            {/* Tab Content */}
            <div className="pt-4">
              {activeReportTab === 'noon' && <NoonReportForm />}
              {activeReportTab === 'bunker' && <BunkerReportForm />}
              {activeReportTab === 'sof' && <SOFReportForm />}
            </div>
          </div>
        </Card>
      )}
      
      {/* Sync Configuration Modal */}
      <SyncConfigModal
        isOpen={showSyncConfigModal}
        onClose={() => setShowSyncConfigModal(false)}
        onSuccess={() => {
          setShowSyncConfigModal(false);
          // Optionally refresh sync status
        }}
      />
    </div>
  );
};

export default FuelLogging;
