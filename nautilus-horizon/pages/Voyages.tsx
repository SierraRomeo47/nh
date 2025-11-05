import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Card from '../components/Card';
import { fetchVoyages } from '../services/mockApi';
import { Voyage } from '../types/index';

const BalanceCell: React.FC<{ value: number }> = ({ value }) => {
    const isPositive = value > 0;
    const colorClass = isPositive ? 'text-green-400' : 'text-accent-a';
    const formattedValue = (value / 1e6).toFixed(2); // Convert to millions
    
    return (
        <div className={`font-mono text-right ${colorClass}`}>
            {isPositive ? '+' : ''}{formattedValue}M
        </div>
    )
};

const ExposureCell: React.FC<{ voyage: Voyage; maxExposure: number }> = ({ voyage, maxExposure }) => {
    if (!voyage.eu_ets) {
        return <div className="text-right">—</div>;
    }
    
    const { eua_exposure_tco2, covered_share_pct } = voyage.eu_ets;
    const barValue = Math.max(0, eua_exposure_tco2 || 0);
    const percentage = maxExposure > 0 ? (barValue / maxExposure) * 100 : 0;
    const barColor = covered_share_pct === 100 ? 'bg-primary' : 'bg-orange-500';

    return (
        <div className="text-right">
            <span className="font-mono">{(eua_exposure_tco2 || 0).toLocaleString('en-US', {maximumFractionDigits: 1})}</span>
            <div className="w-full max-w-[100px] ml-auto mt-1 bg-subtle rounded-full h-1.5" title={`Scale max: ${maxExposure.toLocaleString()} tCO₂`}>
                <div
                    className={`${barColor} h-1.5 rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                    title={`${(eua_exposure_tco2 || 0).toLocaleString()} tCO₂ (${covered_share_pct || 0}% Share)`}
                ></div>
            </div>
        </div>
    );
};

// VoyageTable component
interface VoyageTableProps {
  voyages: Voyage[];
  section: string;
  maxExposure: number;
  onVoyageSelect: (voyageId: string) => void;
}

const VoyageTable: React.FC<VoyageTableProps> = ({ voyages, section, maxExposure, onVoyageSelect }) => {
  const getTableColumns = () => {
    const baseColumns = [
      { key: 'ship_name', label: 'Ship Name' },
      { key: 'imo', label: 'IMO' },
      { key: 'legs', label: 'Voyage Legs' }
    ];
    
    switch (section) {
      case 'imo-dcs':
        return [
          ...baseColumns,
          { key: 'fuel_total', label: 'Total Fuel (t)' },
          { key: 'transport_work', label: 'Transport Work (tnm)' },
          { key: 'submission', label: 'Submission Status' }
        ];
      case 'eu-ets':
        return [
          ...baseColumns,
          { key: 'coverage', label: 'EU ETS Share' },
          { key: 'exposure', label: 'EUA Exposure (tCO₂)' },
          { key: 'deadline', label: 'Surrender Deadline' }
        ];
      case 'fueleu':
        return [
          ...baseColumns,
          { key: 'energy', label: 'Energy in Scope (GJ)' },
          { key: 'intensity', label: 'GHG Intensity' },
          { key: 'balance', label: 'Compliance Balance' },
          { key: 'pooling', label: 'Pooling Status' }
        ];
      default:
        return [
          ...baseColumns,
          { key: 'coverage', label: 'EU ETS Share' },
          { key: 'exposure', label: 'EUA Exposure (tCO₂)' },
          { key: 'balance', label: 'FuelEU Balance (gCO₂e)' }
        ];
    }
  };
  
  const renderCellValue = (voyage: Voyage, columnKey: string) => {
    switch (columnKey) {
      case 'ship_name':
        return (
          <button
            onClick={() => onVoyageSelect(voyage.voyage_id)}
            className="font-medium text-primary hover:text-primary/80 text-left"
          >
            {voyage.ship_name || '—'}
          </button>
        );
      case 'imo':
        return voyage.imo || '—';
      case 'legs':
        return voyage.legs && voyage.legs.length > 0 ? voyage.legs.join(', ') : '—';
      case 'fuel_total':
        const totalFuel = voyage.imo_dcs?.fuel_by_type_t ? Object.values(voyage.imo_dcs.fuel_by_type_t).reduce((a, b) => a + b, 0) : 0;
        return `${totalFuel.toFixed(1)}t`;
      case 'transport_work':
        return voyage.imo_dcs?.transport_work_tnm ? `${(voyage.imo_dcs.transport_work_tnm / 1e9).toFixed(2)}B` : '—';
      case 'submission':
        return <span className="text-yellow-400">Pending</span>;
      case 'coverage':
        return voyage.eu_ets?.covered_share_pct !== undefined ? `${voyage.eu_ets.covered_share_pct}%` : '—';
      case 'exposure':
        return <ExposureCell voyage={voyage} maxExposure={maxExposure} />;
      case 'deadline':
        return voyage.eu_ets?.surrender_deadline_iso ? new Date(voyage.eu_ets.surrender_deadline_iso).toLocaleDateString() : '—';
      case 'energy':
        return voyage.fueleu?.energy_in_scope_gj ? `${(voyage.fueleu.energy_in_scope_gj / 1000).toFixed(1)}K GJ` : '—';
      case 'intensity':
        return voyage.fueleu?.ghg_intensity_gco2e_per_mj ? `${voyage.fueleu.ghg_intensity_gco2e_per_mj.toFixed(1)} gCO₂e/MJ` : '—';
      case 'balance':
        return <BalanceCell value={voyage.fueleu?.compliance_balance_gco2e || 0} />;
      case 'pooling':
        const status = voyage.fueleu?.pooling_status?.replace(/_/g, ' ') || 'N/A';
        const statusColor = status.includes('surplus') ? 'text-green-400' : 
                           status.includes('deficit') ? 'text-red-400' : 'text-gray-400';
        return <span className={statusColor}>{status}</span>;
      default:
        return '—';
    }
  };
  
  const columns = getTableColumns();
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm text-left text-gray-400">
        <thead className="text-xs text-gray-300 uppercase bg-card border-b border-subtle">
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col" className="px-6 py-3">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {voyages.map((voyage) => (
            <tr key={voyage.voyage_id} className="bg-card border-b border-subtle hover:bg-subtle/50 transition-colors">
              {columns.map((column) => (
                <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                  {renderCellValue(voyage, column.key)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// VoyageDetailView component
interface VoyageDetailViewProps {
  voyage: Voyage;
  section: string;
}

const VoyageDetailView: React.FC<VoyageDetailViewProps> = ({ voyage, section }) => {
  const renderSectionContent = () => {
    switch (section) {
      case 'imo-dcs':
        return <ImoDcsView voyage={voyage} />;
      case 'eu-ets':
        return <EuEtsView voyage={voyage} />;
      case 'fueleu':
        return <FuelEuView voyage={voyage} />;
      default:
        return <VoyageSummaryView voyage={voyage} />;
    }
  };
  
  return (
    <div className="space-y-6">
      {renderSectionContent()}
    </div>
  );
};

// Section-specific detail views
const VoyageSummaryView: React.FC<{ voyage: Voyage }> = ({ voyage }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <Card>
      <h4 className="text-lg font-semibold text-white mb-4">Voyage Overview</h4>
      <div className="space-y-3">
        <div>
          <span className="text-gray-400">Voyage ID:</span>
          <span className="ml-2 text-white font-mono">{voyage.voyage_id}</span>
        </div>
        <div>
          <span className="text-gray-400">Ship:</span>
          <span className="ml-2 text-white">{voyage.ship_name}</span>
        </div>
        <div>
          <span className="text-gray-400">IMO:</span>
          <span className="ml-2 text-white">{voyage.imo}</span>
        </div>
        <div>
          <span className="text-gray-400">Route:</span>
          <div className="ml-2 text-white">{voyage.legs && voyage.legs.length > 0 ? voyage.legs.join(' → ') : 'No route data'}</div>
        </div>
      </div>
    </Card>
    
    <Card>
      <h4 className="text-lg font-semibold text-white mb-4">EU ETS</h4>
      <div className="space-y-3">
        <div>
          <span className="text-gray-400">Coverage:</span>
          <span className="ml-2 text-white">{voyage.eu_ets.covered_share_pct}%</span>
        </div>
        <div>
          <span className="text-gray-400">Exposure:</span>
          <span className="ml-2 text-white">{voyage.eu_ets.eua_exposure_tco2.toFixed(1)} tCO₂</span>
        </div>
        <div>
          <span className="text-gray-400">Deadline:</span>
          <span className="ml-2 text-white">{new Date(voyage.eu_ets.surrender_deadline_iso).toLocaleDateString()}</span>
        </div>
      </div>
    </Card>
    
    <Card>
      <h4 className="text-lg font-semibold text-white mb-4">FuelEU Maritime</h4>
      <div className="space-y-3">
        <div>
          <span className="text-gray-400">Energy in Scope:</span>
          <span className="ml-2 text-white">{(voyage.fueleu.energy_in_scope_gj / 1000).toFixed(1)}K GJ</span>
        </div>
        <div>
          <span className="text-gray-400">GHG Intensity:</span>
          <span className="ml-2 text-white">{voyage.fueleu.ghg_intensity_gco2e_per_mj.toFixed(1)} gCO₂e/MJ</span>
        </div>
        <div>
          <span className="text-gray-400">Compliance Balance:</span>
          <span className={`ml-2 ${voyage.fueleu.compliance_balance_gco2e >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {(voyage.fueleu.compliance_balance_gco2e / 1e6).toFixed(2)}M gCO₂e
          </span>
        </div>
      </div>
    </Card>
  </div>
);

const ImoDcsView: React.FC<{ voyage: Voyage }> = ({ voyage }) => (
  <Card>
    <h4 className="text-lg font-semibold text-white mb-4">IMO DCS Reporting</h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h5 className="font-medium text-gray-300 mb-3">Fuel Consumption by Type</h5>
        <div className="space-y-2">
          {Object.entries(voyage.imo_dcs.fuel_by_type_t).map(([fuelType, amount]) => (
            <div key={fuelType} className="flex justify-between">
              <span className="text-gray-400">{fuelType}:</span>
              <span className="text-white">{amount.toFixed(1)} t</span>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h5 className="font-medium text-gray-300 mb-3">Transport Work</h5>
        <div className="text-2xl font-bold text-white mb-2">
          {(voyage.imo_dcs.transport_work_tnm / 1e9).toFixed(2)}B tnm
        </div>
        
        <h5 className="font-medium text-gray-300 mb-3 mt-6">Submission Timeline</h5>
        <p className="text-sm text-gray-400">{voyage.imo_dcs.submission_timeline}</p>
      </div>
    </div>
  </Card>
);

const EuEtsView: React.FC<{ voyage: Voyage }> = ({ voyage }) => (
  <Card>
    <h4 className="text-lg font-semibold text-white mb-4">EU ETS Compliance</h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h5 className="font-medium text-gray-300 mb-3">Coverage Details</h5>
        <div className="space-y-3">
          <div>
            <span className="text-gray-400">Covered Share:</span>
            <span className="ml-2 text-white text-xl font-bold">{voyage.eu_ets.covered_share_pct}%</span>
          </div>
          <div>
            <span className="text-gray-400">Reporting Year:</span>
            <span className="ml-2 text-white">{voyage.eu_ets.reported_year}</span>
          </div>
          <div>
            <span className="text-gray-400">Surrender Deadline:</span>
            <span className="ml-2 text-white">{new Date(voyage.eu_ets.surrender_deadline_iso).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      
      <div>
        <h5 className="font-medium text-gray-300 mb-3">EUA Exposure</h5>
        <div className="text-3xl font-bold text-primary mb-2">
          {voyage.eu_ets.eua_exposure_tco2.toFixed(1)} tCO₂
        </div>
        <p className="text-sm text-gray-400">
          Estimated allowances required based on verified CO₂ emissions and coverage percentage
        </p>
      </div>
    </div>
  </Card>
);

const FuelEuView: React.FC<{ voyage: Voyage }> = ({ voyage }) => (
  <Card>
    <h4 className="text-lg font-semibold text-white mb-4">FuelEU Maritime Compliance</h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h5 className="font-medium text-gray-300 mb-3">Energy & Intensity</h5>
        <div className="space-y-3">
          <div>
            <span className="text-gray-400">Energy in Scope:</span>
            <span className="ml-2 text-white">{(voyage.fueleu.energy_in_scope_gj / 1000).toFixed(1)}K GJ</span>
          </div>
          <div>
            <span className="text-gray-400">GHG Intensity:</span>
            <span className="ml-2 text-white">{voyage.fueleu.ghg_intensity_gco2e_per_mj.toFixed(1)} gCO₂e/MJ</span>
          </div>
          <div>
            <span className="text-gray-400">Pooling Status:</span>
            <span className="ml-2 text-white">{voyage.fueleu.pooling_status.replace(/_/g, ' ')}</span>
          </div>
        </div>
      </div>
      
      <div>
        <h5 className="font-medium text-gray-300 mb-3">Compliance Balance</h5>
        <div className={`text-3xl font-bold mb-2 ${
          voyage.fueleu.compliance_balance_gco2e >= 0 ? 'text-green-400' : 'text-red-400'
        }`}>
          {voyage.fueleu.compliance_balance_gco2e >= 0 ? '+' : ''}{(voyage.fueleu.compliance_balance_gco2e / 1e6).toFixed(2)}M gCO₂e
        </div>
        <p className="text-sm text-gray-400">
          {voyage.fueleu.compliance_balance_gco2e >= 0 
            ? 'Surplus available for banking or pooling'
            : 'Deficit requiring penalty payment or pooling'
          }
        </p>
      </div>
    </div>
  </Card>
);

const Voyages: React.FC = () => {
  const [voyages, setVoyages] = useState<Voyage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Current filters
  const currentSection = searchParams.get('section') || 'summary';
  const currentShip = searchParams.get('ship') || '';
  const currentVoyage = searchParams.get('voyage') || '';
  
  // Navigation sections
  const sections = [
    { id: 'summary', name: 'Summary', icon: '📊' },
    { id: 'imo-dcs', name: 'IMO DCS', icon: '📋' },
    { id: 'eu-ets', name: 'EU ETS', icon: '🏭' },
    { id: 'fueleu', name: 'FuelEU', icon: '⚡' }
  ];
  
  useEffect(() => {
    const loadVoyages = async () => {
      try {
        const data = await fetchVoyages();
        setVoyages(data);
      } catch (error) {
        console.error('Failed to load voyages:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadVoyages();
  }, []);
  
  const maxExposure = React.useMemo(() => {
    if (!voyages || voyages.length === 0) return 1;
    const max = Math.max(...voyages.map(v => v.eu_ets.eua_exposure_tco2));
    return Math.ceil(max / 100) * 100;
  }, [voyages]);
  
  const uniqueShips = React.useMemo(() => {
    return Array.from(new Set(voyages.map(v => v.ship_name))).sort();
  }, [voyages]);
  
  const filteredVoyages = React.useMemo(() => {
    let filtered = voyages;
    
    if (currentShip) {
      filtered = filtered.filter(v => v.ship_name === currentShip);
    }
    
    if (currentVoyage) {
      filtered = filtered.filter(v => v.voyage_id === currentVoyage);
    }
    
    return filtered;
  }, [voyages, currentShip, currentVoyage]);
  
  const handleSectionChange = (sectionId: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('section', sectionId);
    setSearchParams(newParams);
  };
  
  const handleShipFilter = (shipName: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (shipName) {
      newParams.set('ship', shipName);
    } else {
      newParams.delete('ship');
    }
    newParams.delete('voyage'); // Reset voyage filter when changing ship
    setSearchParams(newParams);
  };
  
  const handleVoyageSelect = (voyageId: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('voyage', voyageId);
    setSearchParams(newParams);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Render detailed voyage view if specific voyage is selected
  if (currentVoyage) {
    const voyage = voyages.find(v => v.voyage_id === currentVoyage);
    if (!voyage) {
      return <div className="text-center text-red-400">Voyage not found</div>;
    }
    
    return (
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm">
          <button 
            onClick={() => handleVoyageSelect('')}
            className="text-primary hover:text-primary/80"
          >
            ← Back to Voyages
          </button>
          <span className="text-gray-400">/</span>
          <span className="text-white">{voyage.ship_name}</span>
          <span className="text-gray-400">/</span>
          <span className="text-gray-300">{voyage.voyage_id}</span>
        </div>
        
        {/* Section Navigation */}
        <div className="flex space-x-1 bg-card rounded-lg p-1 border border-subtle">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => handleSectionChange(section.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                currentSection === section.id
                  ? 'bg-primary text-white'
                  : 'text-gray-400 hover:text-white hover:bg-subtle'
              }`}
            >
              <span>{section.icon}</span>
              <span>{section.name}</span>
            </button>
          ))}
        </div>
        
        {/* Voyage Detail Content */}
        <VoyageDetailView voyage={voyage} section={currentSection} />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Filter by Ship
          </label>
          <select
            value={currentShip}
            onChange={(e) => handleShipFilter(e.target.value)}
            className="px-3 py-2 bg-card border border-subtle rounded-md text-white focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">All Ships</option>
            {uniqueShips.map((ship) => (
              <option key={ship} value={ship}>{ship}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <span>Showing {filteredVoyages.length} of {voyages.length} voyages</span>
        </div>
      </div>
      
      {/* Section Navigation */}
      <div className="flex space-x-1 bg-card rounded-lg p-1 border border-subtle">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => handleSectionChange(section.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              currentSection === section.id
                ? 'bg-primary text-white'
                : 'text-gray-400 hover:text-white hover:bg-subtle'
            }`}
          >
            <span>{section.icon}</span>
            <span>{section.name}</span>
          </button>
        ))}
      </div>
      
      {/* Voyages Table */}
      <Card>
        <VoyageTable 
          voyages={filteredVoyages}
          section={currentSection}
          maxExposure={maxExposure}
          onVoyageSelect={handleVoyageSelect}
        />
      </Card>
    </div>
  );
};

export default Voyages;