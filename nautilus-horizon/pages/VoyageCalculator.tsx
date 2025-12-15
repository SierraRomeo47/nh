import React, { useState, useEffect } from 'react';
import { masterDataService, Vessel, Port } from '../services/masterDataService';
import { searouteService } from '../services/searouteService';

interface VesselData {
  name: string;
  imo: string;
  dwt: number;
  speed: number;
  ladenConsumption: number;
  ballastConsumption: number;
  portConsumption: number;
}

const VoyageCalculator: React.FC = () => {
  // Master Data
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [loadingVessels, setLoadingVessels] = useState(false);
  const [selectedVesselId, setSelectedVesselId] = useState('');
  const [vesselSearchTerm, setVesselSearchTerm] = useState('');
  const [showVesselDropdown, setShowVesselDropdown] = useState(false);

  // Port Search States
  const [loadPorts, setLoadPorts] = useState<Port[]>([]);
  const [dischargePorts, setDischargePorts] = useState<Port[]>([]);
  const [loadPortSearch, setLoadPortSearch] = useState('');
  const [dischargePortSearch, setDischargePortSearch] = useState('');
  const [showLoadPortDropdown, setShowLoadPortDropdown] = useState(false);
  const [showDischargePortDropdown, setShowDischargePortDropdown] = useState(false);
  const [loadingPorts, setLoadingPorts] = useState(false);

  // Vessel Details
  const [vessel, setVessel] = useState<VesselData>({
    name: '',
    imo: '',
    dwt: 52000,
    speed: 14,
    ladenConsumption: 35,
    ballastConsumption: 30,
    portConsumption: 3
  });

  // Route Details
  const [loadPort, setLoadPort] = useState('Rotterdam');
  const [loadPortCode, setLoadPortCode] = useState('NLRTM');
  const [dischargePort, setDischargePort] = useState('Singapore');
  const [dischargePortCode, setDischargePortCode] = useState('SGSIN');
  const [distance, setDistance] = useState(8500);
  const [ballastDistance, setBallastDistance] = useState(2550); // 30% of laden

  // Cargo Details
  const [cargoType, setCargoType] = useState('DRY_BULK');
  const [cargoQty, setCargoQty] = useState(50000);
  const [loadRate, setLoadRate] = useState(15000);
  const [dischargeRate, setDischargeRate] = useState(12000);
  const [stowageFactor, setStowageFactor] = useState(1.5); // m³/ton

  // Bunker Prices
  const [ifoPrice, setIfoPrice] = useState(550);
  const [mgoPrice, setMgoPrice] = useState(750);
  const [vlsfoPrice, setVlsfoPrice] = useState(600);

  // Port Costs
  const [loadPortCosts, setLoadPortCosts] = useState(25000);
  const [dischargePortCosts, setDischargePortCosts] = useState(30000);
  const [canalDues, setCanalDues] = useState(0);
  const [pilotage, setPilotage] = useState(8000);
  const [tugs, setTugs] = useState(5000);

  // Charter Terms
  const [freightRate, setFreightRate] = useState(0);
  const [freightBasis, setFreightBasis] = useState('PER_TON'); // PER_TON, LUMPSUM, WORLDSCALE
  const [demurrage, setDemurrage] = useState(15000); // USD per day
  const [despatch, setDespatch] = useState(7500); // USD per day
  const [commissionPct, setCommissionPct] = useState(2.5);
  const [addressCommissionPct, setAddressCommissionPct] = useState(1.25);
  const [brokerageCommissionPct, setBrokerageCommissionPct] = useState(1.25);

  // Laytime
  const [layDaysLoading, setLayDaysLoading] = useState(3);
  const [layDaysDischarge, setLayDaysDischarge] = useState(2);

  // Other Costs
  const [otherExpenses, setOtherExpenses] = useState(10000);
  const [insuranceCost, setInsuranceCost] = useState(5000);

  // Results
  const [results, setResults] = useState({
    // Timing
    seaDaysLaden: 0,
    seaDaysBallast: 0,
    loadDays: 0,
    dischargeDays: 0,
    totalDays: 0,
    // Bunker Consumption
    ladenBunker: 0,
    ballastBunker: 0,
    portBunker: 0,
    totalBunker: 0,
    // Costs
    bunkerCost: 0,
    portCosts: 0,
    totalCommission: 0,
    totalExpenses: 0,
    // Revenue
    grossFreight: 0,
    netFreight: 0,
    netRevenue: 0,
    // Profitability
    tcePerDay: 0,
    profitPerVoyage: 0,
    breakEvenRate: 0
  });

  useEffect(() => {
    loadVessels();
  }, []);

  useEffect(() => {
    calculateVoyage();
  }, [
    vessel, distance, ballastDistance, cargoQty, loadRate, dischargeRate,
    freightRate, ifoPrice, loadPortCosts, dischargePortCosts, canalDues,
    pilotage, tugs, commissionPct, addressCommissionPct, brokerageCommissionPct,
    otherExpenses, insuranceCost, demurrage, despatch, layDaysLoading, layDaysDischarge
  ]);

  const loadVessels = async () => {
    setLoadingVessels(true);
    try {
      const data = await masterDataService.getVessels();
      setVessels(data);
    } catch (error) {
      console.error('Error loading vessels:', error);
    } finally {
      setLoadingVessels(false);
    }
  };

  const handleVesselSelect = (selectedVessel: Vessel) => {
    setSelectedVesselId(selectedVessel.vessel_id);
    setVessel({
      name: selectedVessel.vessel_name,
      imo: selectedVessel.imo_number || '',
      dwt: selectedVessel.dwt || 52000,
      speed: selectedVessel.design_speed_knots || selectedVessel.service_speed_knots || 14,
      ladenConsumption: selectedVessel.sea_consumption_tonnes_day || 35,
      ballastConsumption: selectedVessel.sea_consumption_tonnes_day ? selectedVessel.sea_consumption_tonnes_day * 0.85 : 30,
      portConsumption: selectedVessel.port_consumption_tonnes_day || 3
    });
    setVesselSearchTerm(selectedVessel.vessel_name);
    setShowVesselDropdown(false);
  };

  const searchLoadPorts = async (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 2) {
      setLoadPorts([]);
      return;
    }
    
    setLoadingPorts(true);
    try {
      const ports = await masterDataService.getPorts(searchTerm);
      setLoadPorts(ports.slice(0, 10));
    } catch (error) {
      console.error('Error searching load ports:', error);
    } finally {
      setLoadingPorts(false);
    }
  };

  const searchDischargePorts = async (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 2) {
      setDischargePorts([]);
      return;
    }
    
    setLoadingPorts(true);
    try {
      const ports = await masterDataService.getPorts(searchTerm);
      setDischargePorts(ports.slice(0, 10));
    } catch (error) {
      console.error('Error searching discharge ports:', error);
    } finally {
      setLoadingPorts(false);
    }
  };

  const handleLoadPortSelect = async (port: Port) => {
    const portName = port.label || port.name || port.display_name;
    setLoadPort(portName);
    setLoadPortCode(port.port_code || '');
    setLoadPortSearch(portName);
    setShowLoadPortDropdown(false);
    
    // Auto-calculate distance if both ports are selected
    if (dischargePort && port.latitude && port.longitude) {
      await calculateRouteDistance(port, dischargePorts.find(p => (p.label || p.name) === dischargePort));
    }
  };

  const handleDischargePortSelect = async (port: Port) => {
    const portName = port.label || port.name || port.display_name;
    setDischargePort(portName);
    setDischargePortCode(port.port_code || '');
    setDischargePortSearch(portName);
    setShowDischargePortDropdown(false);
    
    // Auto-calculate distance if both ports are selected
    if (loadPort && port.latitude && port.longitude) {
      await calculateRouteDistance(loadPorts.find(p => (p.label || p.name) === loadPort), port);
    }
  };

  const calculateRouteDistance = async (fromPort: Port | undefined, toPort: Port | undefined) => {
    if (!fromPort || !toPort || !fromPort.latitude || !fromPort.longitude || !toPort.latitude || !toPort.longitude) {
      return;
    }

    try {
      const result = await searouteService.calculateDistance(
        parseFloat(fromPort.latitude),
        parseFloat(fromPort.longitude),
        parseFloat(toPort.latitude),
        parseFloat(toPort.longitude)
      );
      
      setDistance(result.distance);
      
      // Calculate ballast distance (30% of laden by default, or use same route)
      const ballast = searouteService.calculateBallastDistance(result.distance, 30);
      setBallastDistance(ballast);
      
      console.log(`Route calculated: ${fromPort.name} → ${toPort.name}: ${result.distance} NM (Ballast: ${ballast} NM)`);
    } catch (error) {
      console.error('Error calculating route distance:', error);
    }
  };

  // Debounced port search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loadPortSearch.length >= 2) {
        searchLoadPorts(loadPortSearch);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [loadPortSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (dischargePortSearch.length >= 2) {
        searchDischargePorts(dischargePortSearch);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [dischargePortSearch]);

  const calculateVoyage = () => {
    // === TIMING CALCULATIONS ===
    const seaDaysLaden = distance / (vessel.speed * 24);
    const seaDaysBallast = ballastDistance / (vessel.speed * 24);
    const loadDays = cargoQty / loadRate;
    const dischargeDays = cargoQty / dischargeRate;
    const totalDays = seaDaysLaden + seaDaysBallast + loadDays + dischargeDays;

    // === BUNKER CONSUMPTION ===
    const ladenBunker = seaDaysLaden * vessel.ladenConsumption;
    const ballastBunker = seaDaysBallast * vessel.ballastConsumption;
    const portBunker = (loadDays + dischargeDays) * vessel.portConsumption;
    const totalBunker = ladenBunker + ballastBunker + portBunker;

    // === COSTS ===
    const bunkerCost = totalBunker * ifoPrice;
    const portCosts = loadPortCosts + dischargePortCosts + canalDues + pilotage + tugs;
    const totalExpenses = bunkerCost + portCosts + otherExpenses + insuranceCost;

    // === REVENUE ===
    const grossFreight = freightBasis === 'LUMPSUM' ? freightRate : cargoQty * freightRate;
    
    // Commissions
    const totalCommissionPct = commissionPct + addressCommissionPct + brokerageCommissionPct;
    const totalCommission = grossFreight * (totalCommissionPct / 100);
    const netFreight = grossFreight - totalCommission;

    // === PROFITABILITY ===
    const netRevenue = netFreight - totalExpenses;
    const tcePerDay = totalDays > 0 ? netRevenue / totalDays : 0;
    const profitPerVoyage = netRevenue;
    
    // Break-even rate calculation
    const breakEvenRate = freightBasis === 'LUMPSUM' 
      ? (totalExpenses / (1 - totalCommissionPct / 100))
      : (totalExpenses / (1 - totalCommissionPct / 100)) / cargoQty;

    setResults({
      seaDaysLaden: Math.round(seaDaysLaden * 10) / 10,
      seaDaysBallast: Math.round(seaDaysBallast * 10) / 10,
      loadDays: Math.round(loadDays * 100) / 100,
      dischargeDays: Math.round(dischargeDays * 100) / 100,
      totalDays: Math.round(totalDays * 10) / 10,
      ladenBunker: Math.round(ladenBunker),
      ballastBunker: Math.round(ballastBunker),
      portBunker: Math.round(portBunker),
      totalBunker: Math.round(totalBunker),
      bunkerCost: Math.round(bunkerCost),
      portCosts: Math.round(portCosts),
      totalCommission: Math.round(totalCommission),
      totalExpenses: Math.round(totalExpenses),
      grossFreight: Math.round(grossFreight),
      netFreight: Math.round(netFreight),
      netRevenue: Math.round(netRevenue),
      tcePerDay: Math.round(tcePerDay),
      profitPerVoyage: Math.round(profitPerVoyage),
      breakEvenRate: Math.round(breakEvenRate * 100) / 100
    });
  };

  const InputSection = ({ title, color }: { title: string; color: string }) => (
    <div style={{ 
      fontSize: '14px', 
      fontWeight: '700', 
      color: 'var(--text-primary)', 
      marginBottom: '12px', 
      paddingBottom: '6px',
      borderBottom: `2px solid ${color}`,
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}>
      {title}
    </div>
  );

  const InputField = ({ label, value, onChange, unit, step = "1", width = "flex", readOnly = false, type = "number" }: any) => (
    <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
      <label style={{ 
        fontSize: '13px', 
        fontWeight: '500', 
        color: 'var(--text-muted)', 
        minWidth: '140px',
        textAlign: 'right'
      }}>
        {label}
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: width === 'flex' ? 1 : 'none' }}>
        <input
          type={type}
          step={step}
          value={value}
          onChange={readOnly ? undefined : (e) => onChange(typeof value === 'string' ? e.target.value : (parseFloat(e.target.value) || 0))}
          readOnly={readOnly}
          style={{
            padding: '8px 12px',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            fontSize: '13px',
            backgroundColor: readOnly ? 'var(--bg-subtle)' : 'var(--bg-card)',
            color: readOnly ? '#10B981' : 'var(--text-primary)',
            fontWeight: readOnly ? '600' : 'normal',
            width: width === 'flex' ? '100%' : '150px'
          }}
        />
        {unit && (
          <span style={{ 
            fontSize: '12px', 
            color: readOnly ? '#10B981' : 'var(--text-muted)', 
            minWidth: '60px',
            fontWeight: '600'
          }}>
            {unit}
          </span>
        )}
      </div>
    </div>
  );

  const ResultRow = ({ label, value, isTotal = false, color = 'var(--text-primary)' }: any) => (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      padding: '10px 0',
      borderBottom: isTotal ? '2px solid var(--border-color)' : '1px solid rgba(255,255,255,0.05)',
      fontSize: isTotal ? '15px' : '13px',
      fontWeight: isTotal ? '700' : '500'
    }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ color, fontWeight: isTotal ? '700' : '600' }}>{value}</span>
    </div>
  );

  return (
    <div style={{ 
      height: '100%', 
      display: 'flex', 
      gap: '24px',
      padding: '24px',
      overflow: 'hidden'
    }}>
      {/* LEFT COLUMN - Inputs */}
      <div style={{ 
        flex: '0 0 450px',
        overflowY: 'auto',
        paddingRight: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        {/* Header */}
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
            🧮 Voyage Calculator
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0', fontSize: '14px' }}>
            Comprehensive voyage estimation with industry-standard calculations
          </p>
        </div>

        {/* Vessel Details */}
        <div style={{ 
          padding: '20px', 
          backgroundColor: 'var(--bg-card)', 
          borderRadius: '12px', 
          border: '1px solid var(--border-color)',
          position: 'relative',
          zIndex: 10
        }}>
          <InputSection title="🚢 Vessel Details" color="#3B82F6" />
          
          {/* Vessel Selection Dropdown */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Select Vessel
            </label>
            <select
              value={selectedVesselId}
              onChange={(e) => {
                const selectedVessel = vessels.find(v => v.vessel_id === e.target.value);
                if (selectedVessel) {
                  handleVesselSelect(selectedVessel);
                } else {
                  // Clear selection
                  setSelectedVesselId('');
                  setVessel({
                    name: '',
                    imo: '',
                    dwt: 52000,
                    speed: 14,
                    ladenConsumption: 35,
                    ballastConsumption: 30,
                    portConsumption: 3
                  });
                }
              }}
              className="w-full px-4 py-2 bg-card border border-subtle rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-primary"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '14px',
                color: 'var(--text-primary)',
                width: '100%'
              }}
            >
              <option value="">-- Select a vessel from fleet --</option>
              {vessels.map(v => (
                <option key={v.vessel_id} value={v.vessel_id}>
                  {v.vessel_name} • IMO: {v.imo_number} • {v.dwt?.toLocaleString()} DWT • {v.vessel_type}
                </option>
              ))}
            </select>
            {selectedVesselId && (
              <p className="mt-2 text-xs text-green-500 flex items-center gap-1">
                <span>✓</span>
                <span>Vessel data loaded from master database</span>
              </p>
            )}
          </div>

          {/* Add New Vessel CTA */}
          <div className="mt-3 mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-[var(--text-secondary)] mb-2">
              Can't find your vessel in the fleet database?
            </p>
            <button
              type="button"
              onClick={() => {
                // Clear selection and allow manual entry
                setSelectedVesselId('');
                setVessel({
                  name: '',
                  imo: '',
                  dwt: 52000,
                  speed: 14,
                  ladenConsumption: 35,
                  ballastConsumption: 30,
                  portConsumption: 3
                });
              }}
              className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              style={{
                width: '100%',
                padding: '10px 16px',
                backgroundColor: '#3B82F6',
                color: 'white',
                fontWeight: '600',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3B82F6'}
            >
              <span>➕</span>
              <span>Add New Vessel to Database</span>
            </button>
          </div>
          
          <InputField 
            label="IMO Number" 
            value={vessel.imo} 
            onChange={(val: string) => setVessel({...vessel, imo: val})} 
            unit="" 
            type="text"
            readOnly={!!selectedVesselId}
          />
          <InputField 
            label="Vessel Name" 
            value={vessel.name} 
            onChange={(val: string) => setVessel({...vessel, name: val})} 
            unit={selectedVesselId ? "✓" : ""} 
            type="text"
            readOnly={!!selectedVesselId}
          />
          <InputField label="DWT" value={vessel.dwt} onChange={(val: number) => setVessel({...vessel, dwt: val})} unit="MT" />
          <InputField label="Speed" value={vessel.speed} onChange={(val: number) => setVessel({...vessel, speed: val})} unit="knots" step="0.5" />
        </div>

        {/* Route Details */}
        <div style={{ 
          padding: '20px', 
          backgroundColor: 'var(--bg-card)', 
          borderRadius: '12px', 
          border: '1px solid var(--border-color)' 
        }}>
          <InputSection title="🗺️ Route Details" color="#10B981" />
          
          {/* Load Port Search */}
          <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-muted)', minWidth: '140px', textAlign: 'right' }}>
              Load Port
            </label>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="text"
                value={loadPortSearch || loadPort}
                onChange={(e) => {
                  setLoadPortSearch(e.target.value);
                  setShowLoadPortDropdown(true);
                }}
                onFocus={() => setShowLoadPortDropdown(true)}
                placeholder="Search ports..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: loadPortCode ? '2px solid #10B981' : '1px solid var(--border-color)',
                  borderRadius: '6px',
                  fontSize: '13px',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-primary)'
                }}
              />
              {showLoadPortDropdown && loadPorts.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  maxHeight: '250px',
                  overflowY: 'auto',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  marginTop: '4px',
                  zIndex: 1000,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}>
                  {loadPorts.map(port => (
                    <div
                      key={port.id}
                      onClick={() => handleLoadPortSelect(port)}
                      style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid var(--border-color)' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-subtle)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card)'}
                    >
                      <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{port.label || port.display_name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {port.country} • {port.port_code} • {parseFloat(String(port.latitude || '0')).toFixed(2)}°, {parseFloat(String(port.longitude || '0')).toFixed(2)}°
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <InputField 
            label="Load Port Code" 
            value={loadPortCode} 
            onChange={() => {}} 
            unit={loadPortCode ? "✓" : ""} 
            readOnly={true}
            type="text"
          />
          
          {/* Discharge Port Search */}
          <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-muted)', minWidth: '140px', textAlign: 'right' }}>
              Discharge Port
            </label>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="text"
                value={dischargePortSearch || dischargePort}
                onChange={(e) => {
                  setDischargePortSearch(e.target.value);
                  setShowDischargePortDropdown(true);
                }}
                onFocus={() => setShowDischargePortDropdown(true)}
                placeholder="Search ports..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: dischargePortCode ? '2px solid #10B981' : '1px solid var(--border-color)',
                  borderRadius: '6px',
                  fontSize: '13px',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-primary)'
                }}
              />
              {showDischargePortDropdown && dischargePorts.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  maxHeight: '250px',
                  overflowY: 'auto',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  marginTop: '4px',
                  zIndex: 1000,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}>
                  {dischargePorts.map(port => (
                    <div
                      key={port.id}
                      onClick={() => handleDischargePortSelect(port)}
                      style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid var(--border-color)' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-subtle)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card)'}
                    >
                      <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{port.label || port.display_name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {port.country} • {port.port_code} • {parseFloat(String(port.latitude || '0')).toFixed(2)}°, {parseFloat(String(port.longitude || '0')).toFixed(2)}°
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <InputField 
            label="Discharge Port Code" 
            value={dischargePortCode} 
            onChange={() => {}} 
            unit={dischargePortCode ? "✓" : ""} 
            readOnly={true}
            type="text"
          />
          
          <InputField 
            label="Laden Distance" 
            value={distance} 
            onChange={setDistance} 
            unit="NM"
          />
          
          <InputField 
            label="Ballast Distance" 
            value={ballastDistance} 
            onChange={setBallastDistance} 
            unit="NM"
          />
        </div>

        {/* Cargo Details */}
        <div style={{ 
          padding: '20px', 
          backgroundColor: 'var(--bg-card)', 
          borderRadius: '12px', 
          border: '1px solid var(--border-color)' 
        }}>
          <InputSection title="📦 Cargo Details" color="#F59E0B" />
          <InputField label="Cargo Quantity" value={cargoQty} onChange={setCargoQty} unit="MT" />
          <InputField label="Loading Rate" value={loadRate} onChange={setLoadRate} unit="MT/day" />
          <InputField label="Discharge Rate" value={dischargeRate} onChange={setDischargeRate} unit="MT/day" />
          <InputField label="Stowage Factor" value={stowageFactor} onChange={setStowageFactor} unit="m³/ton" step="0.1" />
        </div>

        {/* Consumption Rates */}
        <div style={{ 
          padding: '20px', 
          backgroundColor: 'var(--bg-card)', 
          borderRadius: '12px', 
          border: '1px solid var(--border-color)' 
        }}>
          <InputSection title="⛽ Fuel Consumption" color="#8B5CF6" />
          <InputField label="Laden @ Sea" value={vessel.ladenConsumption} onChange={(val: number) => setVessel({...vessel, ladenConsumption: val})} unit="tons/day" step="0.5" />
          <InputField label="Ballast @ Sea" value={vessel.ballastConsumption} onChange={(val: number) => setVessel({...vessel, ballastConsumption: val})} unit="tons/day" step="0.5" />
          <InputField label="In Port" value={vessel.portConsumption} onChange={(val: number) => setVessel({...vessel, portConsumption: val})} unit="tons/day" step="0.5" />
        </div>

        {/* Bunker Prices */}
        <div style={{ 
          padding: '20px', 
          backgroundColor: 'var(--bg-card)', 
          borderRadius: '12px', 
          border: '1px solid var(--border-color)' 
        }}>
          <InputSection title="💰 Bunker Prices" color="#EF4444" />
          <InputField label="IFO 380" value={ifoPrice} onChange={setIfoPrice} unit="$/ton" step="10" />
          <InputField label="VLSFO" value={vlsfoPrice} onChange={setVlsfoPrice} unit="$/ton" step="10" />
          <InputField label="MGO" value={mgoPrice} onChange={setMgoPrice} unit="$/ton" step="10" />
        </div>

        {/* Port Costs */}
        <div style={{ 
          padding: '20px', 
          backgroundColor: 'var(--bg-card)', 
          borderRadius: '12px', 
          border: '1px solid var(--border-color)' 
        }}>
          <InputSection title="🏗️ Port Costs" color="#06B6D4" />
          <InputField label="Load Port Dues" value={loadPortCosts} onChange={setLoadPortCosts} unit="$" step="1000" />
          <InputField label="Discharge Port Dues" value={dischargePortCosts} onChange={setDischargePortCosts} unit="$" step="1000" />
          <InputField label="Canal Dues" value={canalDues} onChange={setCanalDues} unit="$" step="1000" />
          <InputField label="Pilotage" value={pilotage} onChange={setPilotage} unit="$" step="500" />
          <InputField label="Tugs" value={tugs} onChange={setTugs} unit="$" step="500" />
        </div>

        {/* Charter Terms */}
        <div style={{ 
          padding: '20px', 
          backgroundColor: 'var(--bg-card)', 
          borderRadius: '12px', 
          border: '1px solid var(--border-color)' 
        }}>
          <InputSection title="📋 Charter Terms & Freight" color="#FF6A00" />
          <InputField label="Freight Rate" value={freightRate} onChange={setFreightRate} unit="$/MT" step="0.01" />
          <InputField label="Demurrage" value={demurrage} onChange={setDemurrage} unit="$/day" step="1000" />
          <InputField label="Despatch" value={despatch} onChange={setDespatch} unit="$/day" step="500" />
          <InputField label="Total Commission" value={commissionPct} onChange={setCommissionPct} unit="%" step="0.25" />
          <InputField label="Address Commission" value={addressCommissionPct} onChange={setAddressCommissionPct} unit="%" step="0.25" />
          <InputField label="Brokerage" value={brokerageCommissionPct} onChange={setBrokerageCommissionPct} unit="%" step="0.25" />
        </div>

        {/* Other Costs */}
        <div style={{ 
          padding: '20px', 
          backgroundColor: 'var(--bg-card)', 
          borderRadius: '12px', 
          border: '1px solid var(--border-color)' 
        }}>
          <InputSection title="📊 Other Costs" color="#EC4899" />
          <InputField label="Insurance" value={insuranceCost} onChange={setInsuranceCost} unit="$" step="1000" />
          <InputField label="Other Expenses" value={otherExpenses} onChange={setOtherExpenses} unit="$" step="1000" />
        </div>
      </div>

      {/* RIGHT COLUMN - Results */}
      <div style={{ 
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {/* TCE Summary Card */}
        <div style={{
          padding: '32px',
          backgroundColor: results.tcePerDay > 15000 ? '#D1FAE5' : results.tcePerDay > 0 ? '#FEF3C7' : '#FEE2E2',
          borderRadius: '16px',
          border: `3px solid ${results.tcePerDay > 15000 ? '#10B981' : results.tcePerDay > 0 ? '#F59E0B' : '#EF4444'}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '14px', fontWeight: '700', color: results.tcePerDay > 15000 ? '#065F46' : results.tcePerDay > 0 ? '#92400E' : '#991B1B', marginBottom: '12px' }}>
            TIME CHARTER EQUIVALENT (TCE)
          </div>
          <div style={{ fontSize: '56px', fontWeight: '700', color: results.tcePerDay > 15000 ? '#059669' : results.tcePerDay > 0 ? '#D97706' : '#DC2626', lineHeight: '1' }}>
            ${results.tcePerDay.toLocaleString()}
          </div>
          <div style={{ fontSize: '16px', fontWeight: '600', color: results.tcePerDay > 15000 ? '#065F46' : results.tcePerDay > 0 ? '#92400E' : '#991B1B', marginTop: '8px' }}>
            per day
          </div>
          {results.tcePerDay > 15000 && (
            <div style={{ fontSize: '14px', color: '#065F46', marginTop: '16px', padding: '12px', backgroundColor: '#A7F3D0', borderRadius: '8px', fontWeight: '600' }}>
              ⭐ EXCELLENT TCE - Highly Profitable Voyage!
            </div>
          )}
          {results.tcePerDay > 0 && results.tcePerDay <= 15000 && (
            <div style={{ fontSize: '14px', color: '#92400E', marginTop: '16px', padding: '12px', backgroundColor: '#FDE68A', borderRadius: '8px', fontWeight: '600' }}>
              ⚠️ MODERATE TCE - Consider negotiating better freight rate
            </div>
          )}
          {results.tcePerDay <= 0 && (
            <div style={{ fontSize: '14px', color: '#991B1B', marginTop: '16px', padding: '12px', backgroundColor: '#FCA5A5', borderRadius: '8px', fontWeight: '600' }}>
              ❌ NEGATIVE TCE - This voyage will result in a loss
            </div>
          )}
        </div>

        {/* Voyage Duration */}
        <div style={{ 
          padding: '24px', 
          backgroundColor: 'var(--bg-card)', 
          borderRadius: '12px', 
          border: '1px solid var(--border-color)' 
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
            ⏱️ Voyage Duration
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div style={{ textAlign: 'center', padding: '16px', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>LADEN DAYS</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#3B82F6' }}>{results.seaDaysLaden}</div>
            </div>
            <div style={{ textAlign: 'center', padding: '16px', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>BALLAST DAYS</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#8B5CF6' }}>{results.seaDaysBallast}</div>
            </div>
            <div style={{ textAlign: 'center', padding: '16px', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>LOADING DAYS</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#10B981' }}>{results.loadDays}</div>
            </div>
            <div style={{ textAlign: 'center', padding: '16px', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>DISCHARGE DAYS</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#F59E0B' }}>{results.dischargeDays}</div>
            </div>
          </div>
          <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#3B82F6', borderRadius: '12px' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: 'white', marginBottom: '4px' }}>TOTAL VOYAGE DURATION</div>
            <div style={{ fontSize: '36px', fontWeight: '700', color: 'white' }}>{results.totalDays} days</div>
          </div>
        </div>

        {/* Bunker Consumption */}
        <div style={{ 
          padding: '24px', 
          backgroundColor: 'var(--bg-card)', 
          borderRadius: '12px', 
          border: '1px solid var(--border-color)' 
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
            ⛽ Bunker Consumption
          </h3>
          <ResultRow label="Laden Consumption" value={`${results.ladenBunker.toLocaleString()} tons`} />
          <ResultRow label="Ballast Consumption" value={`${results.ballastBunker.toLocaleString()} tons`} />
          <ResultRow label="Port Consumption" value={`${results.portBunker.toLocaleString()} tons`} />
          <ResultRow label="TOTAL BUNKERS" value={`${results.totalBunker.toLocaleString()} tons`} isTotal color="#8B5CF6" />
        </div>

        {/* Cost Breakdown */}
        <div style={{ 
          padding: '24px', 
          backgroundColor: 'var(--bg-card)', 
          borderRadius: '12px', 
          border: '1px solid var(--border-color)' 
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
            💵 Cost Breakdown
          </h3>
          <ResultRow label="Bunker Cost" value={`$${results.bunkerCost.toLocaleString()}`} color="#EF4444" />
          <ResultRow label="Port Costs" value={`$${results.portCosts.toLocaleString()}`} color="#EF4444" />
          <ResultRow label="Insurance" value={`$${insuranceCost.toLocaleString()}`} color="#EF4444" />
          <ResultRow label="Other Expenses" value={`$${otherExpenses.toLocaleString()}`} color="#EF4444" />
          <ResultRow label="TOTAL EXPENSES" value={`$${results.totalExpenses.toLocaleString()}`} isTotal color="#DC2626" />
        </div>

        {/* Revenue Breakdown */}
        <div style={{ 
          padding: '24px', 
          backgroundColor: 'var(--bg-card)', 
          borderRadius: '12px', 
          border: '1px solid var(--border-color)' 
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
            📈 Revenue Breakdown
          </h3>
          <ResultRow label="Gross Freight" value={`$${results.grossFreight.toLocaleString()}`} color="#10B981" />
          <ResultRow label="Commission (Total)" value={`-$${results.totalCommission.toLocaleString()}`} color="#EF4444" />
          <ResultRow label="Net Freight" value={`$${results.netFreight.toLocaleString()}`} color="#10B981" />
          <ResultRow label="Total Expenses" value={`-$${results.totalExpenses.toLocaleString()}`} color="#EF4444" />
          <ResultRow 
            label="NET REVENUE" 
            value={`$${results.netRevenue.toLocaleString()}`} 
            isTotal 
            color={results.netRevenue > 0 ? '#059669' : '#DC2626'} 
          />
        </div>

        {/* Profitability Analysis */}
        <div style={{ 
          padding: '24px', 
          backgroundColor: 'var(--bg-card)', 
          borderRadius: '12px', 
          border: '1px solid var(--border-color)' 
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
            📊 Profitability Analysis
          </h3>
          <ResultRow label="Profit per Voyage" value={`$${results.profitPerVoyage.toLocaleString()}`} color={results.profitPerVoyage > 0 ? '#10B981' : '#EF4444'} />
          <ResultRow label="TCE per Day" value={`$${results.tcePerDay.toLocaleString()}/day`} color={results.tcePerDay > 0 ? '#10B981' : '#EF4444'} />
          <ResultRow label="Break-Even Rate" value={`$${results.breakEvenRate}/MT`} color="#F59E0B" />
          <div style={{ marginTop: '16px', padding: '12px', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
              <strong>Break-Even Analysis:</strong> You need a minimum freight rate of ${results.breakEvenRate}/MT to cover all costs.
            </div>
            {freightRate > 0 && (
              <div style={{ fontSize: '12px', color: freightRate >= results.breakEvenRate ? '#059669' : '#DC2626', fontWeight: '600' }}>
                {freightRate >= results.breakEvenRate 
                  ? `✅ Current rate ($${freightRate}/MT) is ${((freightRate - results.breakEvenRate) / results.breakEvenRate * 100).toFixed(1)}% above break-even`
                  : `⚠️ Current rate ($${freightRate}/MT) is ${((results.breakEvenRate - freightRate) / results.breakEvenRate * 100).toFixed(1)}% below break-even`
                }
              </div>
            )}
          </div>
        </div>

        {/* Summary Table */}
        <div style={{ 
          padding: '24px', 
          backgroundColor: 'var(--bg-card)', 
          borderRadius: '12px', 
          border: '1px solid var(--border-color)',
          marginBottom: '24px'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
            📋 Voyage Summary
          </h3>
          <div style={{ fontSize: '13px' }}>
            <div style={{ marginBottom: '12px', padding: '12px', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px' }}>
              <strong style={{ color: 'var(--text-primary)' }}>Route:</strong> {loadPort} ({loadPortCode}) → {dischargePort} ({dischargePortCode})
            </div>
            <div style={{ marginBottom: '12px', padding: '12px', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px' }}>
              <strong style={{ color: 'var(--text-primary)' }}>Cargo:</strong> {cargoQty.toLocaleString()} MT {cargoType.replace('_', ' ')}
            </div>
            <div style={{ marginBottom: '12px', padding: '12px', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px' }}>
              <strong style={{ color: 'var(--text-primary)' }}>Vessel:</strong> {vessel.dwt.toLocaleString()} DWT @ {vessel.speed} knots
            </div>
            <div style={{ marginBottom: '12px', padding: '12px', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px' }}>
              <strong style={{ color: 'var(--text-primary)' }}>Duration:</strong> {results.totalDays} days ({results.seaDaysLaden}d laden + {results.seaDaysBallast}d ballast + {results.loadDays}d load + {results.dischargeDays}d discharge)
            </div>
            <div style={{ padding: '12px', backgroundColor: results.tcePerDay > 0 ? '#D1FAE5' : '#FEE2E2', borderRadius: '8px' }}>
              <strong style={{ color: results.tcePerDay > 0 ? '#065F46' : '#991B1B' }}>Result:</strong>
              <span style={{ color: results.tcePerDay > 0 ? '#065F46' : '#991B1B', marginLeft: '8px', fontWeight: '600' }}>
                {results.tcePerDay > 0 ? '✅ Profitable' : '❌ Loss-Making'} • 
                ${Math.abs(results.netRevenue).toLocaleString()} {results.netRevenue > 0 ? 'profit' : 'loss'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoyageCalculator;

