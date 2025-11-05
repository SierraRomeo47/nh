// Fuel Logging Page for Crew Members

import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import Card from '../components/Card';
// Using string literals for fuel types since they're not in the simplified context

const FuelLogging: React.FC = () => {
  const { user } = useUser();
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
    </div>
  );
};

export default FuelLogging;
