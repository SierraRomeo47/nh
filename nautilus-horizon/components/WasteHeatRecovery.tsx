// Waste Heat Recovery System Component for Marine Engineers

import React, { useState, useEffect } from 'react';
import Card from './Card';
import Gauge from './Gauge';
import { WASTE_HEAT_RECOVERY_SYSTEMS, WasteHeatRecoverySystem } from '../services/regulationsService';

interface WHRData {
  systemType: string;
  efficiency: number;
  fuelSavings: number;
  co2Reduction: number;
  energyRecovered: number;
  operatingHours: number;
  exhaustTemperature: number;
  steamPressure: number;
  maintenanceStatus: 'operational' | 'maintenance_required' | 'offline';
  nextMaintenance: string;
}

const WasteHeatRecovery: React.FC = () => {
  const [whrData, setWhrData] = useState<WHRData>({
    systemType: 'economizer',
    efficiency: 75,
    fuelSavings: 8,
    co2Reduction: 12,
    energyRecovered: 2450,
    operatingHours: 720,
    exhaustTemperature: 285,
    steamPressure: 8.5,
    maintenanceStatus: 'operational',
    nextMaintenance: '2024-03-15'
  });

  const [selectedSystem, setSelectedSystem] = useState<WasteHeatRecoverySystem | null>(null);
  const [showSystemDetails, setShowSystemDetails] = useState(false);

  useEffect(() => {
    // Find the current system type
    const currentSystem = WASTE_HEAT_RECOVERY_SYSTEMS.find(
      system => system.type === whrData.systemType
    );
    setSelectedSystem(currentSystem || null);
  }, [whrData.systemType]);

  const handleMaintenanceUpdate = () => {
    setWHRData(prev => ({
      ...prev,
      maintenanceStatus: 'operational',
      nextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-success';
      case 'maintenance_required': return 'text-warning';
      case 'offline': return 'text-error';
      default: return 'text-text-secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational': return '✅';
      case 'maintenance_required': return '⚠️';
      case 'offline': return '❌';
      default: return '❓';
    }
  };

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-text-primary">Waste Heat Recovery System</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-text-secondary">Status:</span>
            <span className={`font-medium ${getStatusColor(whrData.maintenanceStatus)}`}>
              {getStatusIcon(whrData.maintenanceStatus)} {whrData.maintenanceStatus.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary mb-2">
              {whrData.efficiency}%
            </div>
            <div className="text-sm text-text-secondary">System Efficiency</div>
            <div className="text-xs text-text-muted mt-1">Current performance</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-success mb-2">
              {whrData.fuelSavings}%
            </div>
            <div className="text-sm text-text-secondary">Fuel Savings</div>
            <div className="text-xs text-text-muted mt-1">vs. baseline</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-info mb-2">
              {whrData.co2Reduction}%
            </div>
            <div className="text-sm text-text-secondary">CO₂ Reduction</div>
            <div className="text-xs text-text-muted mt-1">emissions saved</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-warning mb-2">
              {whrData.energyRecovered.toLocaleString()} kWh
            </div>
            <div className="text-sm text-text-secondary">Energy Recovered</div>
            <div className="text-xs text-text-muted mt-1">this month</div>
          </div>
        </div>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h4 className="text-md font-semibold text-text-primary mb-4">Performance Gauges</h4>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Efficiency</span>
              <div className="w-24">
                <Gauge
                  value={whrData.efficiency}
                  max={100}
                  size="sm"
                  color="primary"
                  showValue={true}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Fuel Savings</span>
              <div className="w-24">
                <Gauge
                  value={whrData.fuelSavings}
                  max={20}
                  size="sm"
                  color="success"
                  showValue={true}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">CO₂ Reduction</span>
              <div className="w-24">
                <Gauge
                  value={whrData.co2Reduction}
                  max={25}
                  size="sm"
                  color="info"
                  showValue={true}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h4 className="text-md font-semibold text-text-primary mb-4">Operating Parameters</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Exhaust Temperature</span>
              <span className="font-semibold text-text-primary">{whrData.exhaustTemperature}°C</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Steam Pressure</span>
              <span className="font-semibold text-text-primary">{whrData.steamPressure} bar</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Operating Hours</span>
              <span className="font-semibold text-text-primary">{whrData.operatingHours.toLocaleString()} hrs</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Next Maintenance</span>
              <span className="font-semibold text-warning">{whrData.nextMaintenance}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* System Configuration */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-semibold text-text-primary">System Configuration</h4>
          <button
            onClick={() => setShowSystemDetails(!showSystemDetails)}
            className="px-3 py-1 bg-primary/20 text-primary rounded-lg hover:bg-primary/40 transition-colors text-sm"
          >
            {showSystemDetails ? 'Hide Details' : 'Show Details'}
          </button>
        </div>

        {selectedSystem && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-text-secondary">System Type:</span>
                <span className="ml-2 font-semibold text-text-primary">{selectedSystem.name}</span>
              </div>
              <div>
                <span className="text-text-secondary">Installation Cost:</span>
                <span className="ml-2 font-semibold text-text-primary">€{selectedSystem.installationCost.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-text-secondary">Payback Period:</span>
                <span className="ml-2 font-semibold text-text-primary">{selectedSystem.paybackPeriod} months</span>
              </div>
              <div>
                <span className="text-text-secondary">Expected Efficiency:</span>
                <span className="ml-2 font-semibold text-text-primary">{selectedSystem.efficiency}%</span>
              </div>
            </div>

            {showSystemDetails && (
              <div className="mt-6 pt-4 border-t border-subtle">
                <h5 className="font-semibold text-text-primary mb-3">Maintenance Requirements</h5>
                <ul className="space-y-2">
                  {selectedSystem.maintenanceRequirements.map((req, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm text-text-secondary">
                      <span className="text-primary mt-1">•</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>

                <h5 className="font-semibold text-text-primary mb-3 mt-4">Regulatory Compliance</h5>
                <ul className="space-y-2">
                  {selectedSystem.regulatoryCompliance.map((comp, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm text-text-secondary">
                      <span className="text-success mt-1">✓</span>
                      <span>{comp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Maintenance Actions */}
      <Card>
        <h4 className="text-md font-semibold text-text-primary mb-4">Maintenance Actions</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handleMaintenanceUpdate}
            className="p-4 bg-primary/20 text-primary rounded-lg hover:bg-primary/40 transition-colors"
          >
            <div className="font-medium">Complete Maintenance</div>
            <div className="text-sm opacity-80">Mark maintenance as completed</div>
          </button>
          
          <button className="p-4 bg-card border border-subtle text-text-primary rounded-lg hover:bg-subtle transition-colors">
            <div className="font-medium">Schedule Maintenance</div>
            <div className="text-sm text-text-secondary">Plan next maintenance cycle</div>
          </button>
          
          <button className="p-4 bg-card border border-subtle text-text-primary rounded-lg hover:bg-subtle transition-colors">
            <div className="font-medium">Performance Report</div>
            <div className="text-sm text-text-secondary">Generate efficiency report</div>
          </button>
        </div>
      </Card>

      {/* Compliance Status */}
      <Card>
        <h4 className="text-md font-semibold text-text-primary mb-4">Compliance Status</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-success/20 border border-success/30 rounded-lg">
            <div>
              <div className="font-medium text-success">IMO GHG Strategy</div>
              <div className="text-sm text-text-secondary">WHR system contributes to emission reduction targets</div>
            </div>
            <div className="text-2xl">✅</div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-success/20 border border-success/30 rounded-lg">
            <div>
              <div className="font-medium text-success">SEEMP Implementation</div>
              <div className="text-sm text-text-secondary">Energy efficiency measures documented</div>
            </div>
            <div className="text-2xl">✅</div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-warning/20 border border-warning/30 rounded-lg">
            <div>
              <div className="font-medium text-warning">Maintenance Schedule</div>
              <div className="text-sm text-text-secondary">Next maintenance due in 15 days</div>
            </div>
            <div className="text-2xl">⚠️</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default WasteHeatRecovery;
