// OVD Export Component - Export fuel data as Excel
import React, { useState, useEffect } from 'react';
import { exportOVDData, downloadFile } from '../services/ovdService';
import { OVDExportRequest } from '../types/ovd';

interface Vessel {
  id: string;
  name: string;
  imo_number: string;
  ship_type: string;
  fleet_name?: string;
}

interface Fleet {
  id: string;
  name: string;
  description: string;
}

interface OVDExportProps {
  voyageId?: string;
  defaultDateRange?: {
    startDate: string;
    endDate: string;
  };
}

const OVDExport: React.FC<OVDExportProps> = ({ voyageId, defaultDateRange }) => {
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  const [startDate, setStartDate] = useState(defaultDateRange?.startDate || thirtyDaysAgo);
  const [endDate, setEndDate] = useState(defaultDateRange?.endDate || today);
  const [selectedFleet, setSelectedFleet] = useState<string>('');
  const [selectedVessel, setSelectedVessel] = useState<string>('');
  const [fleets, setFleets] = useState<Fleet[]>([]);
  const [allVessels, setAllVessels] = useState<Vessel[]>([]);
  const [filteredVessels, setFilteredVessels] = useState<Vessel[]>([]);
  const [loadingFleets, setLoadingFleets] = useState(true);
  const [loadingVessels, setLoadingVessels] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Fetch fleets from database
  useEffect(() => {
    const fetchFleets = async () => {
      try {
        const response = await fetch('http://localhost:8080/vessels/api/fleets', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setFleets(data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch fleets:', err);
      } finally {
        setLoadingFleets(false);
      }
    };
    fetchFleets();
  }, []);
  
  // Fetch vessels from database
  useEffect(() => {
    const fetchVessels = async () => {
      try {
        const response = await fetch('http://localhost:8080/vessels/api/vessels', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setAllVessels(data.data || []);
          setFilteredVessels(data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch vessels:', err);
      } finally {
        setLoadingVessels(false);
      }
    };
    fetchVessels();
  }, []);
  
  // Filter vessels by selected fleet
  useEffect(() => {
    if (selectedFleet) {
      const filtered = allVessels.filter(v => v.fleet_name === selectedFleet);
      setFilteredVessels(filtered);
      setSelectedVessel(''); // Reset vessel selection when fleet changes
    } else {
      setFilteredVessels(allVessels);
    }
  }, [selectedFleet, allVessels]);
  
  const handleExport = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date must be before end date');
      return;
    }
    
    if (!selectedVessel) {
      setError('Please select a vessel');
      return;
    }
    
    setIsExporting(true);
    setError(null);
    setSuccess(false);
    
    try {
      const exportRequest: OVDExportRequest = {
        startDate,
        endDate,
        voyageId,
        shipId: selectedVessel
      };
      
      const blob = await exportOVDData(exportRequest);
      
      // Generate filename with vessel IMO
      const selectedVesselData = allVessels.find(v => v.id === selectedVessel);
      const imoNumber = selectedVesselData?.imo_number || 'VESSEL';
      const filename = `OVD_3.10.1_${imoNumber}_${startDate}_${endDate}_${today}.xlsx`;
      
      // Download file
      downloadFile(blob, filename);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleQuickRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };
  
  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {/* Fleet Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-secondary">
            Filter by Fleet (Optional)
          </label>
          <select
            value={selectedFleet}
            onChange={(e) => setSelectedFleet(e.target.value)}
            className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={loadingFleets}
          >
            <option value="">-- All Fleets --</option>
            {fleets.map((fleet) => (
              <option key={fleet.id} value={fleet.name}>
                {fleet.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Vessel Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-secondary">
            Select Vessel *
          </label>
          <select
            value={selectedVessel}
            onChange={(e) => setSelectedVessel(e.target.value)}
            className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={loadingVessels}
          >
            <option value="">-- Select a vessel --</option>
            {filteredVessels.map((vessel) => (
              <option key={vessel.id} value={vessel.id}>
                {vessel.name} • IMO: {vessel.imo_number} • {vessel.ship_type}
                {vessel.fleet_name && ` • ${vessel.fleet_name}`}
              </option>
            ))}
          </select>
          {selectedFleet && filteredVessels.length === 0 && (
            <p className="text-xs text-warning">No vessels in selected fleet</p>
          )}
          {filteredVessels.length === 0 && !loadingVessels && !selectedFleet && (
            <p className="text-xs text-warning">No vessels found in database</p>
          )}
          {selectedFleet && filteredVessels.length > 0 && (
            <p className="text-xs text-text-secondary">
              {filteredVessels.length} vessel{filteredVessels.length !== 1 ? 's' : ''} in {selectedFleet}
            </p>
          )}
        </div>
        
        {/* Date Range Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={today}
              className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              max={today}
              className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        
        {/* Quick Range Buttons */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-text-secondary self-center">Quick select:</span>
          <button
            onClick={() => handleQuickRange(7)}
            className="px-3 py-1 text-sm bg-card border border-subtle rounded hover:bg-subtle text-text-primary transition-colors"
          >
            Last 7 Days
          </button>
          <button
            onClick={() => handleQuickRange(30)}
            className="px-3 py-1 text-sm bg-card border border-subtle rounded hover:bg-subtle text-text-primary transition-colors"
          >
            Last 30 Days
          </button>
          <button
            onClick={() => handleQuickRange(90)}
            className="px-3 py-1 text-sm bg-card border border-subtle rounded hover:bg-subtle text-text-primary transition-colors"
          >
            Last 90 Days
          </button>
          <button
            onClick={() => {
              const start = new Date();
              start.setMonth(0, 1); // January 1st
              setStartDate(start.toISOString().split('T')[0]);
              setEndDate(today);
            }}
            className="px-3 py-1 text-sm bg-card border border-subtle rounded hover:bg-subtle text-text-primary transition-colors"
          >
            This Year
          </button>
        </div>
        
        {/* Export Info */}
        <div className="p-4 bg-card border border-subtle rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="text-2xl">ℹ️</div>
            <div className="text-sm text-text-secondary space-y-1">
              <p>The exported file will include:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Main engine fuel consumption (HFO, MGO, LNG, etc.)</li>
                <li>Auxiliary engine consumption</li>
                <li>Boiler and cargo heating consumption</li>
                <li>Shore-side electricity (OPS) usage</li>
                <li>Voyage and vessel information</li>
                <li>Bunker delivery note (BDN) references</li>
              </ul>
              <p className="mt-2 font-medium">
                File format: DNV OVD Excel (.xlsx)
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="p-4 bg-error/10 border border-error rounded-lg">
          <p className="text-error text-sm">{error}</p>
        </div>
      )}
      
      {/* Success Message */}
      {success && (
        <div className="p-4 bg-success/10 border border-success rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">✅</span>
            <p className="text-success text-sm font-medium">
              Export successful! File downloaded.
            </p>
          </div>
        </div>
      )}
      
      {/* Export Button */}
      <button
        onClick={handleExport}
        disabled={isExporting || !startDate || !endDate || !selectedVessel}
        className={`w-full px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
          !isExporting && startDate && endDate && selectedVessel
            ? 'bg-primary text-white hover:bg-primary/80'
            : 'bg-subtle text-text-muted cursor-not-allowed'
        }`}
      >
        {isExporting ? (
          <>
            <span className="animate-spin">⏳</span>
            <span>Exporting...</span>
          </>
        ) : (
          <>
            <span>📥</span>
            <span>Export OVD Data</span>
          </>
        )}
      </button>
    </div>
  );
};

export default OVDExport;

