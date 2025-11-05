import React from 'react';
import Card from '../components/Card';

const FuelConsumption: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          Fuel Consumption
        </h1>
        <p className="text-text-secondary">
          Monitor fuel consumption, efficiency metrics, and environmental impact across your fleet.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Current Consumption</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Today</span>
              <span className="font-semibold text-text-primary">45.2 tonnes</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">This Week</span>
              <span className="font-semibold text-text-primary">316.4 tonnes</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">This Month</span>
              <span className="font-semibold text-text-primary">1,247.8 tonnes</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Average Daily</span>
              <span className="font-semibold text-text-primary">41.6 tonnes</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Efficiency Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">SFOC</span>
              <span className="font-semibold text-text-primary">185 g/kWh</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Efficiency</span>
              <span className="font-semibold text-success">94.2%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">CO₂ Intensity</span>
              <span className="font-semibold text-text-primary">3.11 tCO₂/1000nm</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Energy Efficiency</span>
              <span className="font-semibold text-success">+2.3%</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Environmental Impact</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">CO₂ Emissions</span>
              <span className="font-semibold text-text-primary">142.3 tCO₂</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">NOₓ Emissions</span>
              <span className="font-semibold text-text-primary">2.1 tonnes</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">SOₓ Emissions</span>
              <span className="font-semibold text-text-primary">0.8 tonnes</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">PM Emissions</span>
              <span className="font-semibold text-text-primary">0.3 tonnes</span>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Fuel Consumption by Vessel</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-card border border-subtle rounded-lg">
            <div>
              <div className="font-medium text-text-primary">MV Aurora Spirit</div>
              <div className="text-sm text-text-secondary">Singapore → Rotterdam • 2,847 nm</div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-text-primary">1,247.8 tonnes</div>
              <div className="text-sm text-text-secondary">3.11 tCO₂/1000nm</div>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-card border border-subtle rounded-lg">
            <div>
              <div className="font-medium text-text-primary">MV Baltic Star</div>
              <div className="text-sm text-text-secondary">Rotterdam → Singapore • 2,847 nm</div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-text-primary">1,198.3 tonnes</div>
              <div className="text-sm text-text-secondary">2.98 tCO₂/1000nm</div>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-card border border-subtle rounded-lg">
            <div>
              <div className="font-medium text-text-primary">MV Coral Wave</div>
              <div className="text-sm text-text-secondary">Port of Loading • 0 nm</div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-text-primary">45.2 tonnes</div>
              <div className="text-sm text-text-secondary">In port</div>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Fuel Efficiency Alerts</h3>
        <div className="space-y-3">
          <div className="flex items-start p-4 bg-success/20 border border-success/30 rounded-lg">
            <div className="text-2xl mr-3">✅</div>
            <div>
              <div className="font-semibold text-success">Efficiency Target Met</div>
              <div className="text-sm text-text-secondary">MV Aurora Spirit achieved 94.2% efficiency, exceeding target of 92%</div>
            </div>
          </div>
          <div className="flex items-start p-4 bg-warning/20 border border-warning/30 rounded-lg">
            <div className="text-2xl mr-3">⚠️</div>
            <div>
              <div className="font-semibold text-warning">Efficiency Below Target</div>
              <div className="text-sm text-text-secondary">MV Delta Horizon efficiency at 89.1%, below target of 92%</div>
            </div>
          </div>
          <div className="flex items-start p-4 bg-info/20 border border-info/30 rounded-lg">
            <div className="text-2xl mr-3">ℹ️</div>
            <div>
              <div className="font-semibold text-info">Optimization Opportunity</div>
              <div className="text-sm text-text-secondary">Consider trim adjustment on MV Eastern Crest for 2.3% efficiency gain</div>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors">
            <div className="font-medium">Log Fuel Reading</div>
            <div className="text-sm opacity-80">Record current fuel consumption</div>
          </button>
          <button className="px-4 py-3 bg-card border border-subtle text-text-primary rounded-lg hover:bg-subtle transition-colors">
            <div className="font-medium">Efficiency Report</div>
            <div className="text-sm text-text-secondary">Generate efficiency report</div>
          </button>
          <button className="px-4 py-3 bg-card border border-subtle text-text-primary rounded-lg hover:bg-subtle transition-colors">
            <div className="font-medium">Optimization Tips</div>
            <div className="text-sm text-text-secondary">View efficiency recommendations</div>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default FuelConsumption;