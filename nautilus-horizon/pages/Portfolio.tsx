import React from 'react';
import Card from '../components/Card';

const Portfolio: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          Trading Portfolio
        </h1>
        <p className="text-text-secondary">
          Manage your EU ETS allowances, FuelEU compliance units, and trading positions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Portfolio Value</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Total Value</span>
              <span className="font-semibold text-success">€211,000</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Daily P&L</span>
              <span className="font-semibold text-success">+€2,340</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Monthly P&L</span>
              <span className="font-semibold text-success">+€15,670</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Return %</span>
              <span className="font-semibold text-success">+8.2%</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Holdings</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">EUA Holdings</span>
              <span className="font-semibold text-text-primary">1,895 tCO₂</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">EUA Value</span>
              <span className="font-semibold text-text-primary">€145,000</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">FuelEU Units</span>
              <span className="font-semibold text-text-primary">1.1M gCO₂e</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">FuelEU Value</span>
              <span className="font-semibold text-text-primary">€66,000</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Exposure</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">EU ETS Exposure</span>
              <span className="font-semibold text-warning">2,739 tCO₂</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">FuelEU Deficit</span>
              <span className="font-semibold text-error">-5.2M gCO₂e</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Hedged %</span>
              <span className="font-semibold text-success">68%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Risk Level</span>
              <span className="font-semibold text-warning">Medium</span>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Recent Transactions</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-card border border-subtle rounded-lg">
            <div>
              <div className="font-medium text-text-primary">EUA Purchase</div>
              <div className="text-sm text-text-secondary">Bought 500 tCO₂ at €75.20 • 2 hours ago</div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-success">+€37,600</div>
              <div className="text-sm text-text-secondary">+€625 P&L</div>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-card border border-subtle rounded-lg">
            <div>
              <div className="font-medium text-text-primary">FuelEU Pool Sale</div>
              <div className="text-sm text-text-secondary">Sold 200K gCO₂e at €0.045/g • 1 day ago</div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-success">+€9,000</div>
              <div className="text-sm text-text-secondary">+€1,200 P&L</div>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-card border border-subtle rounded-lg">
            <div>
              <div className="font-medium text-text-primary">EUA Hedge</div>
              <div className="text-sm text-text-secondary">Hedged 1,000 tCO₂ at €74.80 • 3 days ago</div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-success">+€74,800</div>
              <div className="text-sm text-text-secondary">+€1,650 P&L</div>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Portfolio Allocation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">EU ETS Allowances</span>
              <span className="font-semibold text-text-primary">68.7%</span>
            </div>
            <div className="w-full bg-subtle rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: '68.7%' }}></div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">FuelEU Units</span>
              <span className="font-semibold text-text-primary">31.3%</span>
            </div>
            <div className="w-full bg-subtle rounded-full h-2">
              <div className="bg-success h-2 rounded-full" style={{ width: '31.3%' }}></div>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors">
            <div className="font-medium">Buy EUAs</div>
            <div className="text-sm opacity-80">Purchase EU ETS allowances</div>
          </button>
          <button className="px-4 py-3 bg-card border border-subtle text-text-primary rounded-lg hover:bg-subtle transition-colors">
            <div className="font-medium">Hedge Position</div>
            <div className="text-sm text-text-secondary">Hedge exposure</div>
          </button>
          <button className="px-4 py-3 bg-card border border-subtle text-text-primary rounded-lg hover:bg-subtle transition-colors">
            <div className="font-medium">Portfolio Report</div>
            <div className="text-sm text-text-secondary">Generate portfolio report</div>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Portfolio;