import React from 'react';
import WasteHeatRecovery from '../components/WasteHeatRecovery';

const WasteHeatRecoveryPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          Waste Heat Recovery Systems
        </h1>
        <p className="text-text-secondary">
          Monitor and manage waste heat recovery systems to improve energy efficiency and reduce emissions.
        </p>
      </div>

      <WasteHeatRecovery />
    </div>
  );
};

export default WasteHeatRecoveryPage;
