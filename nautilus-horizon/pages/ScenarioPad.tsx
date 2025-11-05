import React, { useState, useCallback, useEffect, useRef } from 'react';
import Card from '../components/Card';
import { ScenarioParams, ScenarioResult, VesselDetails, FuelSelection, MultiFuelSelection } from '../types/index';
import { generateScenarioSummary } from '../services/geminiService';
import { ArrowPathIcon } from '../components/common/Icons';
import { FUEL_TYPES, FuelEmissionFactors } from '../data/fuelTypes';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getMaritimeRoute, getMaritimeRouteByCoordinates, calculateRouteDistance, PORTS, Waypoint } from '../services/maritimeRouting';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import PortSearch from '../components/PortSearch';
import { Port } from '../services/portService';
import { getVessels, Vessel } from '../services/vesselService';

const initialParams: ScenarioParams = {
  speedKnots: 14.0,
  sgmEfficiency: 8.0, // % fuel reduction (IMO MEPC 76/15/Add.2)
  vfdEfficiency: 5.0, // % fuel reduction (IMO MEPC 76/15/Add.2)
  whrEfficiency: 6.0, // % fuel reduction (IMO MEPC 76/15/Add.2)
  weatherMargin: 5,
  originPort: '',
  destinationPort: '',
  distanceNauticalMiles: 0,
  portConsumptionPerDay: 8.0,
  seaConsumptionPerDay: 45.0,
  daysAtSea: 0,
  daysInPort: 2,
  fuelPrice: 550,
  euaPrice: 75.43,
  carbonFactor: 3.14,
  fuelSelections: [],
};

const Slider: React.FC<{label: string, value: number, min: number, max: number, step: number, unit: string, onChange: (value: number) => void}> = 
  ({label, value, min, max, step, unit, onChange}) => (
  <div>
    <label className="flex justify-between text-sm font-medium text-gray-300">
      <span>{label}</span>
      <span className="font-semibold text-primary">{Number(value || 0).toFixed(1)} {unit}</span>
    </label>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={Number(value) || min}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-2 bg-subtle rounded-lg appearance-none cursor-pointer range-lg accent-primary"
    />
  </div>
);

const NumberInput: React.FC<{label: string, value: number, unit: string, onChange: (value: number) => void, min?: number, step?: number}> = 
  ({label, value, unit, onChange, min, step}) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-2">
      {label}
    </label>
    <div className="flex items-center">
      <input
        type="number"
        min={min || 0}
        step={step || 1}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="flex-1 p-2 bg-background border border-subtle rounded-l-lg text-text-primary focus:border-primary focus:outline-none"
      />
      <span className="px-3 py-2 bg-subtle border border-l-0 border-subtle rounded-r-lg text-gray-300">
        {unit}
      </span>
    </div>
  </div>
);

const Toggle: React.FC<{label: string, enabled: boolean, onChange: (enabled: boolean) => void}> =
 ({label, enabled, onChange}) => (
  <div className="flex items-center justify-between">
    <span className="text-sm font-medium text-gray-300">{label}</span>
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${enabled ? 'bg-primary' : 'bg-subtle'}`}
    >
      <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  </div>
);

const CostRow: React.FC<{label: string, value: number, unit: string, isSavings?: boolean, isBold?: boolean }> = 
({label, value, unit, isSavings = false, isBold = false}) => {
    // Savings/credits show in green with "- " prefix
    // Costs show in red (or white if zero)
    const colorClass = isSavings 
      ? 'text-green-500' 
      : value > 0 
        ? 'text-accent-a' 
        : 'text-gray-300';
    
    const fontClass = isBold ? 'font-bold text-lg' : 'font-semibold';

    return (
        <div className="flex justify-between py-2 border-b border-subtle">
            <span className={`${isBold ? 'font-semibold' : ''} text-gray-400`}>{label}</span>
            <span className={`${fontClass} ${colorClass}`}>
                {isSavings && value !== 0 ? '- ' : ''}{Math.abs(value).toLocaleString('en-US', {maximumFractionDigits: 2})} {unit}
            </span>
        </div>
    )
};

const ScenarioPad: React.FC = () => {
  const { toasts, showToast, hideToast } = useToast();
  const [params, setParams] = useState<ScenarioParams>(initialParams);
  const [result, setResult] = useState<ScenarioResult | null>(null);
  const [summary, setSummary] = useState('');
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [availableVessels, setAvailableVessels] = useState<any[]>([]);
  const [showEmissionFactors, setShowEmissionFactors] = useState(false);
  const [selectedFuelDetails, setSelectedFuelDetails] = useState<FuelEmissionFactors | null>(null);
  const [selectedOriginPort, setSelectedOriginPort] = useState<Port | null>(null);
  const [selectedDestPort, setSelectedDestPort] = useState<Port | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [showRouteOnMap, setShowRouteOnMap] = useState(false);

  useEffect(() => {
    // Load vessels from API (currently using fallback mock data)
    const loadVessels = async () => {
      const vessels = await getVessels();
      setAvailableVessels(vessels);
    
    // Set default vessel with proper speed limits
      if (vessels.length > 0) {
        const firstVessel = vessels[0];
        const minSpeed = firstVessel.min_speed_knots || 12;
        const maxSpeed = firstVessel.max_speed_knots || 16;
        const portConsumption = firstVessel.port_consumption || 8.0;
        const seaConsumption = firstVessel.sea_consumption || 45.0;
      
      setParams(prev => ({
        ...prev,
        vessel: {
            imo: firstVessel.imo,
            name: firstVessel.name,
            ship_type: firstVessel.segment || firstVessel.ship_type,
            min_speed_knots: minSpeed,
            max_speed_knots: maxSpeed,
          },
          speedKnots: minSpeed, // Default to LOWER end of speed range
          portConsumptionPerDay: portConsumption,
          seaConsumptionPerDay: seaConsumption,
        }));
        
        console.log(`✅ Default vessel loaded: ${firstVessel.name}, Speed set to: ${minSpeed} knots (min of ${minSpeed}-${maxSpeed} range)`);
      }
    };
    
    loadVessels();

    // Set default fuel
    const defaultFuel = FUEL_TYPES.find(f => f.fuelType.includes('VLSFO')) || FUEL_TYPES[0];
    setSelectedFuelDetails(defaultFuel);
    setParams(prev => ({
      ...prev,
      fuelSelection: {
        fuelType: defaultFuel.fuelType,
        redII_wtw_gco2e_mj: defaultFuel.redII_wtw_gco2e_mj,
        ets_ttw_gco2e_mj: defaultFuel.ets_ttw_gco2e_mj,
        fueleu_wtw_gco2e_mj: defaultFuel.fueleu_wtw_gco2e_mj,
        imo_dcs_ttw_co2e_mj: defaultFuel.imo_dcs_ttw_co2e_mj,
      },
      carbonFactor: defaultFuel.imo_dcs_ttw_co2e_mj, // IMO DCS emission factor
    }));
  }, []);

  // Auto-calculate distance and days at sea when both ports are selected
  // Note: This updates the FIELDS but does NOT show the route on map (that only happens on "Run Scenario")
  useEffect(() => {
    const calculateDistanceAndDays = async () => {
      if (selectedOriginPort && selectedDestPort && !isCalculatingRoute) {
        setIsCalculatingRoute(true);
        try {
          // Use the maritime routing service with actual coordinates from database
          const originLat = parseFloat(selectedOriginPort.latitude);
          const originLng = parseFloat(selectedOriginPort.longitude);
          const destLat = parseFloat(selectedDestPort.latitude);
          const destLng = parseFloat(selectedDestPort.longitude);
          
          console.log(`🧮 Calculating distance from ${selectedOriginPort.name} to ${selectedDestPort.name}...`);
          
          const route = await getMaritimeRouteByCoordinates(
            originLat,
            originLng,
            destLat,
            destLng
          );
          
          // Calculate distance from the route
          const distance = calculateRouteDistance(route);
          
          // Calculate days at sea based on distance and speed (only if speed is valid)
          let daysAtSea = 0;
          if (params.speedKnots && params.speedKnots > 0) {
            daysAtSea = Math.ceil(distance / (params.speedKnots * 24));
            console.log(`✅ Auto-calculated: Distance=${distance.toFixed(0)} NM, Days at Sea=${daysAtSea} (at ${params.speedKnots} knots)`);
          } else {
            console.warn(`⚠️ Cannot calculate days at sea: speed is ${params.speedKnots || 'not set'}`);
          }
          
          // Update params with calculated values
          setParams(prev => ({
            ...prev,
            distanceNauticalMiles: Math.round(distance),
            daysAtSea: daysAtSea,
          }));
        } catch (error) {
          console.error('Error calculating route:', error);
        } finally {
          setIsCalculatingRoute(false);
        }
      }
    };

    calculateDistanceAndDays();
  }, [selectedOriginPort, selectedDestPort, params.speedKnots]);

  const handleParamChange = <K extends keyof ScenarioParams,>(key: K, value: ScenarioParams[K]) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const getVesselSpeedLimits = (vesselType: string) => {
    // Define realistic speed ranges for different vessel types
    const speedRanges: Record<string, { min: number; max: number }> = {
      'MR Tanker': { min: 12, max: 16 },
      'LR1 Tanker': { min: 13, max: 17 },
      'Container Ship': { min: 18, max: 25 },
      'VLCC': { min: 11, max: 15 },
      'Dry Bulk Carrier': { min: 12, max: 16 },
      'Ro-Ro Vessel': { min: 18, max: 23 },
    };
    return speedRanges[vesselType] || { min: 12, max: 16 };
  };

  const handleVesselChange = (vesselId: string) => {
    const vessel = availableVessels.find(v => v.id === vesselId);
    if (vessel) {
      // Use actual vessel speed data from database, or fallback to type-based limits
      const hasSpeedData = vessel.min_speed_knots && vessel.max_speed_knots;
      const speedLimits = hasSpeedData 
        ? { min: vessel.min_speed_knots!, max: vessel.max_speed_knots! }
        : getVesselSpeedLimits(vessel.segment || vessel.ship_type);
      
      // Use actual consumption data from database if available
      const portConsumption = vessel.port_consumption || 8.0;
      const seaConsumption = vessel.sea_consumption || 45.0;
      
      // ALWAYS set speed to the minimum speed of the vessel's range
      const defaultSpeed = speedLimits.min;
      
      setParams(prev => ({
        ...prev,
        vessel: {
          imo: vessel.imo,
          name: vessel.name,
          ship_type: vessel.segment || vessel.ship_type,
          min_speed_knots: speedLimits.min,
          max_speed_knots: speedLimits.max,
        },
        // ALWAYS set speed to minimum when vessel changes
        speedKnots: defaultSpeed,
        // Update consumption values from database
        portConsumptionPerDay: portConsumption,
        seaConsumptionPerDay: seaConsumption,
      }));
      
      console.log(`✅ Vessel changed to: ${vessel.name}, Speed set to: ${defaultSpeed} knots (Range: ${speedLimits.min}-${speedLimits.max} knots)`);
    }
  };

  const handleFuelChange = (fuelType: string) => {
    const fuelDetails = FUEL_TYPES.find(f => f.fuelType === fuelType);
    if (fuelDetails) {
      setSelectedFuelDetails(fuelDetails);
      setParams(prev => ({
        ...prev,
        fuelSelection: {
          fuelType: fuelDetails.fuelType,
          redII_wtw_gco2e_mj: fuelDetails.redII_wtw_gco2e_mj,
          ets_ttw_gco2e_mj: fuelDetails.ets_ttw_gco2e_mj,
          fueleu_wtw_gco2e_mj: fuelDetails.fueleu_wtw_gco2e_mj,
          imo_dcs_ttw_co2e_mj: fuelDetails.imo_dcs_ttw_co2e_mj,
        },
        carbonFactor: fuelDetails.imo_dcs_ttw_co2e_mj, // Use IMO DCS as base conversion
      }));
    }
  };

  const handleEmissionFactorChange = (key: keyof FuelSelection, value: number) => {
    if (!params.fuelSelection) return;
    setParams(prev => ({
      ...prev,
      fuelSelection: {
        ...prev.fuelSelection,
        [key]: value,
      }
    }));
  };

  const calculateSpeedLimits = () => {
    if (!params.vessel) return { min: 12, max: 16 };
    const min = params.vessel.min_speed_knots || 12;
    const max = params.vessel.max_speed_knots || 16;
    return { min, max };
  };

  const runScenario = useCallback(async () => {
    // Validate required inputs
    if (!params.speedKnots || params.speedKnots <= 0) {
      showToast('Please select a vessel and ensure speed is set correctly.', 'warning');
      return;
    }
    
    if (!params.distanceNauticalMiles || params.distanceNauticalMiles <= 0) {
      showToast('Please select origin and destination ports to calculate distance.', 'warning');
      return;
    }
    
    if (!params.vessel) {
      showToast('Please select a vessel.', 'warning');
      return;
    }
    
    // Show the route on map when scenario is run
    setShowRouteOnMap(true);
    
    // Get speed limits from vessel data
    const speedLimits = {
      min: params.vessel.min_speed_knots || 12,
      max: params.vessel.max_speed_knots || 16
    };
    
    console.log('🔍 Calculation Debug:', {
      vessel: params.vessel.name,
      speedKnots: params.speedKnots,
      speedLimits: speedLimits,
      seaConsumption: params.seaConsumptionPerDay,
      portConsumption: params.portConsumptionPerDay,
      distance: params.distanceNauticalMiles,
      daysAtSea: params.daysAtSea
    });
    
    // Calculate actual route distance using maritime routing
    let calculatedDistance = params.distanceNauticalMiles;
    try {
      // Use actual coordinates if available, otherwise fall back to port names
      if (selectedOriginPort && selectedDestPort) {
        const route = await getMaritimeRouteByCoordinates(
          parseFloat(selectedOriginPort.latitude),
          parseFloat(selectedOriginPort.longitude),
          parseFloat(selectedDestPort.latitude),
          parseFloat(selectedDestPort.longitude)
        );
        if (route && route.length > 0) {
          calculatedDistance = calculateRouteDistance(route);
          console.log(`✅ Route calculated: ${calculatedDistance.toFixed(0)} NM`);
        }
      } else if (params.originPort && params.destinationPort) {
        const route = await getMaritimeRoute(params.originPort, params.destinationPort);
        if (route && route.length > 0) {
          calculatedDistance = calculateRouteDistance(route);
        }
      }
    } catch (error) {
      console.warn('⚠️ Using manual distance input', error);
    }
    
    // Calculate voyage distance and duration with high precision
    const distanceNm = Number(calculatedDistance) || 0;
    const speedKnots = Number(params.speedKnots) || 13.0;
    const calculatedDaysAtSea = distanceNm / (speedKnots * 24);
    const daysAtSea = (params.daysAtSea && params.daysAtSea > 0) ? Number(params.daysAtSea) : calculatedDaysAtSea;
    const daysInPort = Number(params.daysInPort) || 2;
  
    // Calculate baseline fuel consumption (SAME speed as scenario for fair comparison)
    const minSpeed = Number(speedLimits.min) || 12;
    const maxSpeed = Number(speedLimits.max) || 16;
    const baselineSpeed = speedKnots; // Use SAME speed as scenario for fair comparison
    const seaConsumptionPerDay = Number(params.seaConsumptionPerDay) || 45.0;
    const portConsumptionPerDay = Number(params.portConsumptionPerDay) || 8.0;
    
    const baselineSeaConsumption = seaConsumptionPerDay * daysAtSea;
    const baselinePortConsumption = portConsumptionPerDay * daysInPort;
    
    console.log('⛽ Baseline Consumption:', {
      daysAtSea: daysAtSea.toFixed(2),
      daysInPort: daysInPort,
      baselineSpeed: baselineSpeed.toFixed(2),
      seaConsumptionPerDay: seaConsumptionPerDay,
      portConsumptionPerDay: portConsumptionPerDay,
      baselineSeaConsumption: baselineSeaConsumption.toFixed(2),
      baselinePortConsumption: baselinePortConsumption.toFixed(2)
    });

    // Apply speed effects (cubic relationship: fuel consumption ∝ speed^3)
    // Reference: https://www.researchgate.net/publication/228797400
    const speedRatio = speedKnots / baselineSpeed;
    const speedFactor = Math.pow(speedRatio, 3);
    const adjustedSeaConsumption = baselineSeaConsumption * speedFactor;
    
    // Defensive check for NaN
    if (isNaN(adjustedSeaConsumption) || isNaN(daysAtSea) || isNaN(baselineSpeed)) {
      console.error('❌ Calculation Error - NaN detected:', {
        adjustedSeaConsumption,
        daysAtSea,
        baselineSpeed,
        speedKnots,
        speedRatio,
        speedFactor,
        seaConsumptionPerDay
      });
      showToast('Calculation error detected. Please refresh the page and try again.', 'error');
      return;
    }
    
    console.log('🚀 Speed Effects:', {
      currentSpeed: params.speedKnots,
      baselineSpeed: baselineSpeed.toFixed(2),
      speedRatio: speedRatio.toFixed(4),
      speedFactor: speedFactor.toFixed(4),
      adjustedSeaConsumption: adjustedSeaConsumption.toFixed(2)
    });
    
    // Calculate technology impacts (user-editable efficiency percentages)
    // Source: IMO MEPC 76/15/Add.2 Annex 1 (baseline values: SGM 8%, VFD 5%, WHR 6%)
    const sgmEfficiency = Number(params.sgmEfficiency) || 0;
    const vfdEfficiency = Number(params.vfdEfficiency) || 0;
    const whrEfficiency = Number(params.whrEfficiency) || 0;
    
    const sgmImpact = sgmEfficiency > 0 ? -(sgmEfficiency / 100) * adjustedSeaConsumption : 0;
    const vfdImpact = vfdEfficiency > 0 ? -(vfdEfficiency / 100) * adjustedSeaConsumption : 0;
    const whrImpact = whrEfficiency > 0 ? -(whrEfficiency / 100) * adjustedSeaConsumption : 0;
    
    console.log('🔧 Technology Impacts:', {
      sgm: sgmEfficiency > 0 ? `${sgmImpact.toFixed(2)} t (${sgmEfficiency.toFixed(1)}% reduction)` : 'OFF',
      vfd: vfdEfficiency > 0 ? `${vfdImpact.toFixed(2)} t (${vfdEfficiency.toFixed(1)}% reduction)` : 'OFF',
      whr: whrEfficiency > 0 ? `${whrImpact.toFixed(2)} t (${whrEfficiency.toFixed(1)}% reduction)` : 'OFF'
    });
    
    // Calculate baseline energy requirement (VLSFO baseline)
    const baselineTotalFuel = baselineSeaConsumption + baselinePortConsumption;
    const baselineLCV = 42.7; // MJ/kg for VLSFO (industry standard)
    const baselineTotalEnergyMJ = baselineTotalFuel * 1000 * baselineLCV;
    
    // Apply technology efficiency savings to ENERGY requirement
    const totalEfficiencySavingsPercent = (Math.abs(sgmImpact) + Math.abs(vfdImpact) + Math.abs(whrImpact)) / adjustedSeaConsumption;
    const scenarioTotalEnergyMJ = baselineTotalEnergyMJ * (1 - totalEfficiencySavingsPercent);
    
    // Calculate actual fuel mass based on LCV-adjusted fuel mix
    let scenarioTotalFuel = 0;
    let totalFuelMJ = 0;
    
    if (params.fuelSelections && params.fuelSelections.length > 0) {
      // Multi-fuel scenario: calculate mass for each fuel based on its LCV
      params.fuelSelections.forEach(fuelSel => {
        const fuelDetails = FUEL_TYPES.find(f => f.fuelType === fuelSel.fuelType);
        const fuelLCV = Number(fuelDetails?.lower_calorific_value_mj_kg) || baselineLCV;
        const energyForThisFuel = (fuelSel.percentage / 100) * scenarioTotalEnergyMJ;
        const massForThisFuel = energyForThisFuel / (fuelLCV * 1000);
        scenarioTotalFuel += massForThisFuel;
      });
      totalFuelMJ = scenarioTotalEnergyMJ; // Total energy is same regardless of fuel type
    } else {
      // Single fuel (legacy): use baseline LCV
      scenarioTotalFuel = scenarioTotalEnergyMJ / (baselineLCV * 1000);
      totalFuelMJ = scenarioTotalEnergyMJ;
    }
    
    const deltaFuelT = scenarioTotalFuel - baselineTotalFuel;
    const baselineFuelMJ = baselineTotalEnergyMJ;
    
    console.log('⚖️ Fuel Summary:', {
      baselineEnergy: baselineTotalEnergyMJ.toFixed(0) + ' MJ',
      scenarioEnergy: scenarioTotalEnergyMJ.toFixed(0) + ' MJ',
      scenarioTotalFuel: scenarioTotalFuel.toFixed(2) + ' t',
      baselineTotalFuel: baselineTotalFuel.toFixed(2) + ' t',
      deltaFuelT: deltaFuelT.toFixed(2) + ' t'
    });
    
    // Calculate weighted average emission factors from fuel mix
    let weightedImoDcsFactor = 77.4; // Default VLSFO
    let weightedEtsFactor = 77.4;
    let weightedFueleuFactor = 91.0;
    
    if (params.fuelSelections && params.fuelSelections.length > 0) {
      weightedImoDcsFactor = params.fuelSelections.reduce((sum, fuelSel) => {
        const factor = Number(fuelSel.imo_dcs_ttw_co2e_mj) || 77.4;
        return sum + (factor * fuelSel.percentage / 100);
      }, 0);
      
      weightedEtsFactor = params.fuelSelections.reduce((sum, fuelSel) => {
        const factor = Number(fuelSel.ets_ttw_gco2e_mj) || 77.4;
        return sum + (factor * fuelSel.percentage / 100);
      }, 0);
      
      weightedFueleuFactor = params.fuelSelections.reduce((sum, fuelSel) => {
        const factor = Number(fuelSel.fueleu_wtw_gco2e_mj) || 91.0;
        return sum + (factor * fuelSel.percentage / 100);
      }, 0);
    }
    
    // Calculate CO2 emissions (IMO DCS 2025 factors) - ENERGY-BASED
    // Source: MEPC.308(73) - 2025 IMO DCS Guidelines
    const totalCo2T = (totalFuelMJ * weightedImoDcsFactor) / 1000000; // MJ * gCO2e/MJ / 1000000 = tCO2e
    const baselineCo2T = (baselineFuelMJ * weightedImoDcsFactor) / 1000000;
    const deltaCo2T = totalCo2T - baselineCo2T;
    
    // Calculate EU ETS costs (2025 regulations)
    // Source: EU Regulation 2023/957 - Full implementation from 2026, phased 2024-2025
    // IMPORTANT: Biofuels and e-fuels are EXEMPT from EU ETS (considered carbon-neutral)
    const etsCoverageRatio = 0.75; // Assume 75% average coverage for 2025
    
    // Calculate ETS-eligible energy (only FOSSIL fuels)
    let etsEligibleEnergyMJ = 0;
    if (params.fuelSelections && params.fuelSelections.length > 0) {
      params.fuelSelections.forEach(fuelSel => {
        const fuelDetails = FUEL_TYPES.find(f => f.fuelType === fuelSel.fuelType);
        const fuelCategory = fuelDetails?.fuelCategory || 'FOSSIL';
        
        // Only FOSSIL and ALTERNATIVE fuels are subject to ETS
        if (fuelCategory === 'FOSSIL' || fuelCategory === 'ALTERNATIVE' || fuelCategory === 'HYBRID') {
          const energyForThisFuel = (fuelSel.percentage / 100) * scenarioTotalEnergyMJ;
          etsEligibleEnergyMJ += energyForThisFuel;
        }
      });
    } else {
      // Legacy single fuel - assume fossil
      etsEligibleEnergyMJ = totalFuelMJ;
    }
    
    const etsEmissionsT = (etsEligibleEnergyMJ * weightedEtsFactor) / 1000000;
    const etsEmissionsCovered = etsEmissionsT * etsCoverageRatio;
    const euaPrice2025 = Number(params.euaPrice) || 75.43; // €/tCO2e (2025 projected price)
    const etsCostEur = etsEmissionsCovered * euaPrice2025;
    
    console.log('💶 ETS Calculation:', {
      totalEnergy: scenarioTotalEnergyMJ.toFixed(0) + ' MJ',
      etsEligibleEnergy: etsEligibleEnergyMJ.toFixed(0) + ' MJ',
      exemptEnergy: (scenarioTotalEnergyMJ - etsEligibleEnergyMJ).toFixed(0) + ' MJ (Bio/E-fuels)',
      etsCost: '€' + etsCostEur.toLocaleString('en-US', {maximumFractionDigits: 0})
    });
    
    // Baseline is always fossil (VLSFO)
    const baselineEtsEmissionsT = (baselineFuelMJ * 77.4) / 1000000;
    const baselineEtsCovered = baselineEtsEmissionsT * etsCoverageRatio;
    const baselineEtsCostEur = baselineEtsCovered * euaPrice2025;
    const deltaEtsEur = etsCostEur - baselineEtsCostEur;
    
    // Calculate FuelEU Maritime costs (2025 regulations)
    // Source: EU Regulation 2023/1805 - FuelEU Maritime Article 9
    // 2025 GHG intensity limit: 2% reduction from 2020 baseline (91.16 gCO2e/MJ)
    const fueleuIntensityLimit2025 = 89.34; // gCO2e/MJ (2% reduction from 91.16)
    
    // Baseline uses VLSFO (default fuel) for comparison
    const baselineFueleuWtwFactor = 91.0; // VLSFO WTW factor
    
    // Calculate WTW emissions in grams (using weighted factors)
    const scenarioWtwEmissionsG = totalFuelMJ * weightedFueleuFactor; // gCO2e
    const baselineWtwEmissionsG = baselineFuelMJ * baselineFueleuWtwFactor; // gCO2e
    
    // Calculate GHG intensity (gCO2e/MJ)
    const scenarioGhgIntensity = weightedFueleuFactor;
    const baselineGhgIntensity = baselineFueleuWtwFactor;
    
    // Calculate compliance deficit/surplus in gCO2e
    const scenarioDeficitG = scenarioWtwEmissionsG - (totalFuelMJ * fueleuIntensityLimit2025);
    const baselineDeficitG = baselineWtwEmissionsG - (baselineFuelMJ * fueleuIntensityLimit2025);
    
    // FuelEU penalty/credit: €2400 per tonne of CO2e deficit/surplus (2025 rate)
    // Source: FuelEU Maritime Article 20
    // Positive deficit = penalty, Negative deficit (surplus) = credit
    const penaltyPerTonneCO2e = 2400; // €/tCO2e for 2025
    
    // Calculate scenario penalty/credit (including surplus as negative cost)
    const scenarioPenaltyEur = (scenarioDeficitG / 1000000) * penaltyPerTonneCO2e;
    const baselinePenaltyEur = (baselineDeficitG / 1000000) * penaltyPerTonneCO2e;
    
    // Delta FuelEU Credit/Penalty = baseline - scenario (FLIPPED for intuitive display)
    // Positive value = credit/benefit (you earn money), Negative value = penalty (you pay)
    // This makes positive = good (cleaner than baseline), negative = bad (dirtier than baseline)
    const deltaFuelEUEur = baselinePenaltyEur - scenarioPenaltyEur;
    
    console.log('🌍 FuelEU Maritime Calculation:', {
      fuelType: selectedFuelDetails?.fuelType || 'VLSFO',
      scenarioIntensity: scenarioGhgIntensity.toFixed(2) + ' gCO2e/MJ',
      baselineIntensity: baselineGhgIntensity.toFixed(2) + ' gCO2e/MJ',
      limit2025: fueleuIntensityLimit2025.toFixed(2) + ' gCO2e/MJ',
      scenarioDeficit: (scenarioDeficitG / 1000000).toFixed(3) + ' tCO2e',
      baselineDeficit: (baselineDeficitG / 1000000).toFixed(3) + ' tCO2e',
      scenarioPenalty: scenarioPenaltyEur.toFixed(2) + ' €',
      baselinePenalty: baselinePenaltyEur.toFixed(2) + ' €',
      deltaFuelEU: deltaFuelEUEur.toFixed(2) + ' €'
    });
    
    // ===== CALCULATE ACTUAL COSTS (NOT DELTAS) =====
    
    const fuelPrice = Number(params.fuelPrice) || 550;
    
    // 1. FUEL COST (actual cost for this scenario)
    const fuelCostEur = scenarioTotalFuel * fuelPrice;
    
    // 2. Calculate efficiency savings (in tonnes of fuel)
    const efficiencySavingsT = Math.abs(sgmImpact + vfdImpact + whrImpact);
    const efficiencySavingsEur = efficiencySavingsT * fuelPrice;
    
    // 3. FuelEU PENALTY/SURPLUS
    // scenarioPenaltyEur can be:
    //   - Positive = penalty (you pay)
    //   - Negative = surplus (you earn credits/save money)
    const fuelEuPenaltyEur = scenarioPenaltyEur; // Keep actual value (can be negative for surplus)
    const fuelEuSurplusEur = scenarioPenaltyEur < 0 ? Math.abs(scenarioPenaltyEur) : 0; // For display
    
    // 5. TOTAL VOYAGE COST
    // Penalty adds to cost, Surplus reduces cost
    const totalVoyageCostEur = fuelCostEur + etsCostEur + fuelEuPenaltyEur - efficiencySavingsEur;

    console.log('💰 Voyage Cost Breakdown:', {
      distance: distanceNm.toFixed(0) + ' NM',
      duration: (daysAtSea + daysInPort).toFixed(1) + ' days',
      totalFuel: scenarioTotalFuel.toFixed(2) + ' t',
      totalCO2: totalCo2T.toFixed(2) + ' t',
      fuelCost: '€' + fuelCostEur.toLocaleString('en-US', {maximumFractionDigits: 0}),
      etsCost: '€' + etsCostEur.toLocaleString('en-US', {maximumFractionDigits: 0}),
      fuelEuPenalty: '€' + fuelEuPenaltyEur.toLocaleString('en-US', {maximumFractionDigits: 0}),
      efficiencySavings: '€' + efficiencySavingsEur.toLocaleString('en-US', {maximumFractionDigits: 0}),
      totalCost: '€' + totalVoyageCostEur.toLocaleString('en-US', {maximumFractionDigits: 0})
    });

    // Final validation to ensure no NaN values
    const safeNumber = (val: number) => (isNaN(val) || !isFinite(val)) ? 0 : Number(val);

    setResult({ 
      fuelConsumedT: safeNumber(scenarioTotalFuel),
      co2EmissionsT: safeNumber(totalCo2T),
      fuelCostEur: safeNumber(fuelCostEur),
      etsCostEur: safeNumber(etsCostEur),
      fuelEuPenaltyEur: safeNumber(fuelEuPenaltyEur),
      efficiencySavingsEur: safeNumber(efficiencySavingsEur),
      totalVoyageCostEur: safeNumber(totalVoyageCostEur),
      voyageDistanceNm: safeNumber(distanceNm),
      voyageDurationDays: safeNumber(daysAtSea + daysInPort)
    });
    
    console.log('✅ Result set successfully:', {
      totalFuelConsumed: safeNumber(scenarioTotalFuel),
      voyageDistanceNm: safeNumber(distanceNm),
      voyageDurationDays: safeNumber(daysAtSea + daysInPort)
    });
    setSummary('');
  }, [params, selectedFuelDetails, selectedOriginPort, selectedDestPort, calculateSpeedLimits, showToast]);

  const handleGenerateSummary = async () => {
    if (!result) return;
    setIsLoadingSummary(true);
    setSummary('');
    try {
        const generatedSummary = await generateScenarioSummary(params, result);
        setSummary(generatedSummary);
    } catch (error) {
        console.error("Error generating summary:", error);
        setSummary("An error occurred while generating the summary. Please check your API key and try again.");
    } finally {
        setIsLoadingSummary(false);
    }
  };

  const speedLimits = calculateSpeedLimits();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
      <Card title="Vessel & Voyage Setup" className="xl:col-span-1">
        <div className="space-y-6">
          {/* Vessel Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Vessel
            </label>
            <select
              value={params.vessel?.imo || ''}
              onChange={(e) => {
                const vessel = availableVessels.find(v => v.imo === e.target.value);
                if (vessel) handleVesselChange(vessel.id);
              }}
              className="w-full p-3 bg-background border border-subtle rounded-lg text-text-primary focus:border-primary focus:outline-none"
            >
              {availableVessels.map(v => (
                <option key={v.id} value={v.imo}>
                  {v.name} (IMO: {v.imo})
                </option>
              ))}
            </select>
            {params.vessel && (
              <p className="mt-2 text-xs text-gray-400">
                {params.vessel.ship_type} • Speed Range: {speedLimits.min}-{speedLimits.max} knots
              </p>
            )}
          </div>

          {/* Origin Port - Searchable */}
          <PortSearch
            label="Origin Port"
              value={params.originPort || ''}
            onChange={(portName, port) => {
              handleParamChange('originPort', portName);
              if (port) {
                console.log('Origin port selected:', port);
                setSelectedOriginPort(port);
              }
            }}
            placeholder="Search ports... (e.g., Rotterdam)"
          />

          {/* Destination Port - Searchable */}
          <PortSearch
            label="Destination Port"
              value={params.destinationPort || ''}
            onChange={(portName, port) => {
              handleParamChange('destinationPort', portName);
              if (port) {
                console.log('Destination port selected:', port);
                setSelectedDestPort(port);
              }
            }}
            placeholder="Search ports... (e.g., New York)"
          />

          {/* Distance */}
          <NumberInput
            label="Distance"
            value={params.distanceNauticalMiles || 0}
            unit="NM"
            onChange={(value) => handleParamChange('distanceNauticalMiles', value)}
            min={0}
          />

          {/* Days at Sea */}
          <NumberInput
            label="Days at Sea"
            value={params.daysAtSea || 0}
            unit="days"
            onChange={(value) => handleParamChange('daysAtSea', value)}
            min={0}
            step={0.5}
          />

          {/* Days in Port */}
          <NumberInput
            label="Days in Port"
            value={params.daysInPort || 0}
            unit="days"
            onChange={(value) => handleParamChange('daysInPort', value)}
            min={0}
          />
        </div>
      </Card>
      
      <Card title="Fuel Selection" className="xl:col-span-1">
        <div className="space-y-6">
          {/* Multi-Fuel Selection */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-300">
                Fuel Mix Configuration
              </label>
              <button
                onClick={() => {
                  const defaultFuel = FUEL_TYPES.find(f => f.fuelType.includes('VLSFO')) || FUEL_TYPES[0];
                  const newFuel: MultiFuelSelection = {
                    fuelType: defaultFuel.fuelType,
                    redII_wtw_gco2e_mj: defaultFuel.redII_wtw_gco2e_mj,
                    ets_ttw_gco2e_mj: defaultFuel.ets_ttw_gco2e_mj,
                    fueleu_wtw_gco2e_mj: defaultFuel.fueleu_wtw_gco2e_mj,
                    imo_dcs_ttw_co2e_mj: defaultFuel.imo_dcs_ttw_co2e_mj,
                    percentage: 0
                  };
                  setParams(prev => ({
                    ...prev,
                    fuelSelections: [...(prev.fuelSelections || []), newFuel]
                  }));
                }}
                className="px-3 py-1 bg-primary hover:bg-orange-700 text-white text-xs font-medium rounded transition"
              >
                + Add Fuel
              </button>
            </div>

            {/* Display current fuel selections */}
            {params.fuelSelections && params.fuelSelections.length > 0 ? (
              <div className="space-y-3">
                {/* Calculate total fuel for the voyage from parameters - ENERGY-BASED */}
                {(() => {
                  // Calculate total fuel based on voyage parameters
                  const daysAtSea = Number(params.daysAtSea) || 0;
                  const daysInPort = Number(params.daysInPort) || 0;
                  const seaConsumption = Number(params.seaConsumptionPerDay) || 0;
                  const portConsumption = Number(params.portConsumptionPerDay) || 0;
                  const baselineFuelMass = (daysAtSea * seaConsumption) + (daysInPort * portConsumption);
                  
                  // Calculate total ENERGY requirement (baseline fuel is calibrated for VLSFO)
                  const baselineLCV = 42.7; // MJ/kg for VLSFO (industry standard baseline)
                  const totalEnergyMJ = baselineFuelMass * 1000 * baselineLCV; // Convert tonnes to kg, then to MJ
                  
                  const totalPercentage = params.fuelSelections.reduce((sum, f) => sum + f.percentage, 0);
                  
                  return (
                    <>
                      {params.fuelSelections.map((fuel, index) => {
                        // Get LCV for this specific fuel
                        const fuelDetails = FUEL_TYPES.find(f => f.fuelType === fuel.fuelType);
                        const fuelLCV = Number(fuelDetails?.lower_calorific_value_mj_kg) || baselineLCV;
                        
                        // Calculate mass needed to provide the required energy percentage
                        // Energy for this fuel = (percentage / 100) * totalEnergyMJ
                        // Mass (tonnes) = Energy / (LCV * 1000)
                        const energyForThisFuel = (fuel.percentage / 100) * totalEnergyMJ;
                        const consumptionTonnes = energyForThisFuel / (fuelLCV * 1000);
                        
                        return (
                          <div key={index} className="p-3 bg-subtle/30 rounded-lg space-y-3">
                            <div className="flex items-center justify-between">
                              <select
                                value={fuel.fuelType}
                                onChange={(e) => {
                                  const fuelDetails = FUEL_TYPES.find(f => f.fuelType === e.target.value);
                                  if (fuelDetails) {
                                    const updated = [...(params.fuelSelections || [])];
                                    updated[index] = {
                                      ...updated[index],
                                      fuelType: fuelDetails.fuelType,
                                      redII_wtw_gco2e_mj: fuelDetails.redII_wtw_gco2e_mj,
                                      ets_ttw_gco2e_mj: fuelDetails.ets_ttw_gco2e_mj,
                                      fueleu_wtw_gco2e_mj: fuelDetails.fueleu_wtw_gco2e_mj,
                                      imo_dcs_ttw_co2e_mj: fuelDetails.imo_dcs_ttw_co2e_mj,
                                    };
                                    setParams(prev => ({ ...prev, fuelSelections: updated }));
                                  }
                                }}
                                className="flex-1 p-2 bg-background border border-subtle rounded text-text-primary text-sm focus:border-primary focus:outline-none"
                              >
                                {FUEL_TYPES.map(ft => (
                                  <option key={ft.fuelType} value={ft.fuelType}>
                                    {ft.fuelType}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => {
                                  const updated = params.fuelSelections?.filter((_, i) => i !== index) || [];
                                  setParams(prev => ({ ...prev, fuelSelections: updated }));
                                }}
                                className="ml-2 px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition"
                              >
                                ✕
                              </button>
                            </div>
                            
                            {/* Consumption Value Input */}
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs text-gray-400 mb-1 block">
                                  Consumption: {consumptionTonnes.toFixed(2)} t
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.1"
                                  value={consumptionTonnes.toFixed(2)}
                                  onChange={(e) => {
                                    const newConsumption = parseFloat(e.target.value) || 0;
                                    
                                    // Convert mass to energy, then to percentage
                                    const energyFromNewConsumption = newConsumption * 1000 * fuelLCV; // kg * MJ/kg = MJ
                                    const newPercentage = totalEnergyMJ > 0 ? (energyFromNewConsumption / totalEnergyMJ) * 100 : 0;
                                    
                                    // Prevent total from exceeding 100%
                                    const otherPercentages = params.fuelSelections
                                      ?.filter((_, i) => i !== index)
                                      .reduce((sum, f) => sum + f.percentage, 0) || 0;
                                    
                                    const cappedPercentage = Math.min(newPercentage, 100 - otherPercentages);
                                    
                                    const updated = [...(params.fuelSelections || [])];
                                    updated[index] = { ...updated[index], percentage: cappedPercentage };
                                    setParams(prev => ({ ...prev, fuelSelections: updated }));
                                  }}
                                  className="w-full p-2 bg-background border border-subtle rounded text-text-primary text-sm focus:border-primary focus:outline-none"
                                  placeholder="0.00"
                                />
                              </div>
                              
                              <div>
                                <label className="text-xs text-gray-400 mb-1 block">
                                  Percentage: {fuel.percentage.toFixed(1)}%
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.1"
                                  value={fuel.percentage.toFixed(1)}
                                  onChange={(e) => {
                                    const newPercentage = parseFloat(e.target.value) || 0;
                                    
                                    // Prevent total from exceeding 100%
                                    const otherPercentages = params.fuelSelections
                                      ?.filter((_, i) => i !== index)
                                      .reduce((sum, f) => sum + f.percentage, 0) || 0;
                                    
                                    const cappedPercentage = Math.min(newPercentage, 100 - otherPercentages);
                                    
                                    const updated = [...(params.fuelSelections || [])];
                                    updated[index] = { ...updated[index], percentage: cappedPercentage };
                                    setParams(prev => ({ ...prev, fuelSelections: updated }));
                                  }}
                                  className="w-full p-2 bg-background border border-subtle rounded text-text-primary text-sm focus:border-primary focus:outline-none"
                                  placeholder="0.0"
                                />
                              </div>
                            </div>
                            
                            {/* Slider for visual adjustment */}
                            <input
                              type="range"
                              min="0"
                              max="100"
                              step="0.1"
                              value={fuel.percentage}
                              onChange={(e) => {
                                const newPercentage = parseFloat(e.target.value);
                                
                                // Prevent total from exceeding 100%
                                const otherPercentages = params.fuelSelections
                                  ?.filter((_, i) => i !== index)
                                  .reduce((sum, f) => sum + f.percentage, 0) || 0;
                                
                                const cappedPercentage = Math.min(newPercentage, 100 - otherPercentages);
                                
                                const updated = [...(params.fuelSelections || [])];
                                updated[index] = { ...updated[index], percentage: cappedPercentage };
                                setParams(prev => ({ ...prev, fuelSelections: updated }));
                              }}
                              className="w-full h-2 bg-subtle rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                            
                            {(() => {
                              const fuelInfo = FUEL_TYPES.find(f => f.fuelType === fuel.fuelType);
                              return fuelInfo ? (
                                <div className="flex justify-between items-center">
                                  <p className="text-xs text-gray-500">
                                    {fuelInfo.fuelCategory} • LCV: {fuelInfo.lower_calorific_value_mj_kg} MJ/kg
                                  </p>
                                  <button
                                    onClick={() => {
                                      // TODO: Implement individual fuel emission factor editing
                                      console.log('Edit emission factors for:', fuel.fuelType);
                                    }}
                                    className="px-2 py-1 bg-card border border-subtle text-text-primary text-xs rounded hover:bg-subtle transition"
                                  >
                                    ✎ Edit Factors
                                  </button>
                                </div>
                              ) : null;
                            })()}
                          </div>
                        );
                      })}
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400">
                          Total: {totalPercentage.toFixed(1)}%
                          {totalPercentage > 100 && (
                            <span className="text-red-500 ml-2">⚠ Exceeds 100%!</span>
                          )}
                          {totalPercentage < 100 && totalPercentage > 0 && (
                            <span className="text-orange-500 ml-2">⚠ Should equal 100%</span>
                          )}
                          {totalPercentage === 100 && (
                            <span className="text-green-500 ml-2">✓ Valid</span>
                          )}
                        </span>
                        {baselineFuelMass > 0 && (
                          <span className="text-gray-500">
                            Total Fuel: {(() => {
                              // Calculate actual total fuel mass (sum of all LCV-adjusted fuels)
                              const actualTotalMass = params.fuelSelections.reduce((sum, fuel) => {
                                const fuelDetails = FUEL_TYPES.find(f => f.fuelType === fuel.fuelType);
                                const fuelLCV = Number(fuelDetails?.lower_calorific_value_mj_kg) || baselineLCV;
                                const energyForThisFuel = (fuel.percentage / 100) * totalEnergyMJ;
                                const mass = energyForThisFuel / (fuelLCV * 1000);
                                return sum + mass;
                              }, 0);
                              return actualTotalMass.toFixed(2);
                            })()} t
                          </span>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No fuels added. Click "+ Add Fuel" to start.</p>
            )}
          </div>

          {/* Legacy single fuel selection (fallback) */}
          {(!params.fuelSelections || params.fuelSelections.length === 0) && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
                Primary Fuel Type
            </label>
            <select
              value={params.fuelSelection?.fuelType || ''}
              onChange={(e) => handleFuelChange(e.target.value)}
              className="w-full p-3 bg-background border border-subtle rounded-lg text-text-primary focus:border-primary focus:outline-none"
            >
              {FUEL_TYPES.map(fuel => (
                <option key={fuel.fuelType} value={fuel.fuelType}>
                  {fuel.fuelType} ({fuel.fuelCategory})
                </option>
              ))}
            </select>
            {selectedFuelDetails && (
              <p className="mt-2 text-xs text-gray-400">
                Category: {selectedFuelDetails.fuelCategory} • 
                LCV: {selectedFuelDetails.lower_calorific_value_mj_kg} MJ/kg
              </p>
            )}
          </div>
          )}

          {/* Toggle Emission Factors Editor */}
          <button
            onClick={() => setShowEmissionFactors(!showEmissionFactors)}
            className="w-full bg-subtle hover:bg-gray-700 text-text-primary font-medium py-2 px-4 rounded-lg transition text-sm"
          >
            {showEmissionFactors ? '▼' : '▶'} Edit Emission Factors
          </button>

          {/* Editable Emission Factors */}
          {showEmissionFactors && params.fuelSelection && (
            <div className="space-y-4 p-4 bg-subtle/30 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-300 mb-3">Emission Factors (gCO₂e/MJ)</h4>
              
              <NumberInput
                label="EU RED II (Well-to-Wake)"
                value={params.fuelSelection.redII_wtw_gco2e_mj || 0}
                unit="g/MJ"
                onChange={(value) => handleEmissionFactorChange('redII_wtw_gco2e_mj', value)}
                min={0}
                step={0.1}
              />
              
              <NumberInput
                label="EU ETS (Tank-to-Wake)"
                value={params.fuelSelection.ets_ttw_gco2e_mj || 0}
                unit="g/MJ"
                onChange={(value) => handleEmissionFactorChange('ets_ttw_gco2e_mj', value)}
                min={0}
                step={0.1}
              />
              
              <NumberInput
                label="FuelEU (Well-to-Wake)"
                value={params.fuelSelection.fueleu_wtw_gco2e_mj || 0}
                unit="g/MJ"
                onChange={(value) => handleEmissionFactorChange('fueleu_wtw_gco2e_mj', value)}
                min={0}
                step={0.1}
              />
              
              <NumberInput
                label="IMO DCS (Tank-to-Wake)"
                value={params.fuelSelection.imo_dcs_ttw_co2e_mj || 0}
                unit="g/MJ"
                onChange={(value) => handleEmissionFactorChange('imo_dcs_ttw_co2e_mj', value)}
                min={0}
                step={0.1}
              />
            </div>
          )}
        </div>
      </Card>
      
      <Card title="Vessel Speed & Consumption" className="xl:col-span-1">
        <div className="space-y-6">
          {/* Vessel Speed */}
          <Slider 
            label="Vessel Speed" 
            value={params.speedKnots} 
            min={0.1} 
            max={speedLimits.max} 
            step={0.1} 
            unit="knots" 
            onChange={(v) => handleParamChange('speedKnots', v)} 
          />

          {/* Port Consumption */}
          <NumberInput
            label="Port Consumption"
            value={params.portConsumptionPerDay || 0}
            unit="t/day"
            onChange={(value) => handleParamChange('portConsumptionPerDay', value)}
            min={0}
            step={0.5}
          />

          {/* Sea Consumption */}
          <NumberInput
            label="Sea Consumption"
            value={params.seaConsumptionPerDay || 0}
            unit="t/day"
            onChange={(value) => handleParamChange('seaConsumptionPerDay', value)}
            min={0}
            step={0.5}
          />

          {/* Weather Margin */}
          <Slider 
            label="Weather Margin" 
            value={params.weatherMargin} 
            min={1} 
            max={50} 
            step={1} 
            unit="%" 
            onChange={(v) => handleParamChange('weatherMargin', v)} 
          />

          {/* Energy Efficiency Technologies */}
          <div className="pt-4 border-t border-subtle">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Energy Efficiency Technologies</h3>
            <p className="text-xs text-gray-500 mb-3">
              Enter % fuel reduction for each technology (0 = disabled)
            </p>
            <div className="space-y-3">
              {/* Shaft Generator Motor (SGM) */}
              <div>
                <label className="text-sm text-gray-400 mb-1 block">
                  Shaft Generator Motor (SGM)
                  <span className="text-gray-600 text-xs ml-2">(IMO baseline: 8%)</span>
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.1"
                    value={params.sgmEfficiency || 0}
                    onChange={(e) => handleParamChange('sgmEfficiency', parseFloat(e.target.value) || 0)}
                    className="flex-1 p-2 bg-background border border-subtle rounded text-text-primary text-sm focus:border-primary focus:outline-none"
                    placeholder="0.0"
                  />
                  <span className="text-sm text-gray-400 w-8">%</span>
                </div>
              </div>

              {/* Variable Frequency Drive (VFD) */}
              <div>
                <label className="text-sm text-gray-400 mb-1 block">
                  Variable Frequency Drive (VFD)
                  <span className="text-gray-600 text-xs ml-2">(IMO baseline: 5%)</span>
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.1"
                    value={params.vfdEfficiency || 0}
                    onChange={(e) => handleParamChange('vfdEfficiency', parseFloat(e.target.value) || 0)}
                    className="flex-1 p-2 bg-background border border-subtle rounded text-text-primary text-sm focus:border-primary focus:outline-none"
                    placeholder="0.0"
                  />
                  <span className="text-sm text-gray-400 w-8">%</span>
                </div>
              </div>

              {/* Waste Heat Recovery (WHR) */}
              <div>
                <label className="text-sm text-gray-400 mb-1 block">
                  Waste Heat Recovery (WHR)
                  <span className="text-gray-600 text-xs ml-2">(IMO baseline: 6%)</span>
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.1"
                    value={params.whrEfficiency || 0}
                    onChange={(e) => handleParamChange('whrEfficiency', parseFloat(e.target.value) || 0)}
                    className="flex-1 p-2 bg-background border border-subtle rounded text-text-primary text-sm focus:border-primary focus:outline-none"
                    placeholder="0.0"
                  />
                  <span className="text-sm text-gray-400 w-8">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Market Prices */}
          <div className="pt-4 border-t border-subtle">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Market Prices</h3>
            <div className="space-y-4">
              <NumberInput
                label="Fuel Price"
                value={params.fuelPrice || 0}
                unit="€/t"
                onChange={(value) => handleParamChange('fuelPrice', value)}
                min={0}
              />
              <NumberInput
                label="EUA Price"
                value={params.euaPrice || 0}
                unit="€/t CO₂"
                onChange={(value) => handleParamChange('euaPrice', value)}
                min={0}
              />
            </div>
          </div>

          <button 
            onClick={runScenario} 
            className="w-full bg-primary hover:bg-orange-700 text-white font-bold py-3 rounded-lg transition text-lg"
          >
            Run Scenario
          </button>
        </div>
      </Card>

      <Card title="Impact & AI Summary" className="xl:col-span-2">
        <div className="space-y-8">
          {/* Voyage Cost Breakdown */}
          <div>
            <h3 className="text-lg font-semibold text-gray-300 mb-4">Voyage Cost Breakdown</h3>
            {result ? (
              <div className="space-y-2">
                {/* Voyage Summary */}
                <div className="mb-4 p-3 bg-subtle/20 rounded">
                  <div className="text-sm text-gray-400 space-y-1">
                    <div>Distance: <span className="text-white font-semibold">{result.voyageDistanceNm.toLocaleString()} NM</span></div>
                    <div>Duration: <span className="text-white font-semibold">{result.voyageDurationDays?.toFixed(1)} days</span></div>
                    <div>Total Fuel: <span className="text-white font-semibold">{result.fuelConsumedT?.toFixed(2)} t</span></div>
                    <div>CO₂ Emissions: <span className="text-white font-semibold">{result.co2EmissionsT?.toFixed(2)} t</span></div>
                </div>
                  </div>

                {/* Cost Breakdown */}
                <CostRow label="Fuel Cost" value={result.fuelCostEur} unit="€" />
                <CostRow label="ETS Cost" value={result.etsCostEur} unit="€" />
                {/* FuelEU Penalty or Surplus */}
                {result.fuelEuPenaltyEur !== 0 && (
                  <CostRow 
                    label={result.fuelEuPenaltyEur > 0 ? "FuelEU Penalty" : "FuelEU Surplus"} 
                    value={result.fuelEuPenaltyEur > 0 ? result.fuelEuPenaltyEur : -result.fuelEuPenaltyEur} 
                    unit="€" 
                    isSavings={result.fuelEuPenaltyEur < 0}
                  />
                )}
                {result.efficiencySavingsEur > 0 && (
                  <CostRow label="Efficiency Savings" value={result.efficiencySavingsEur} unit="€" isSavings />
                )}
                
                {/* Total */}
                <div className="pt-4 border-t-2 border-subtle">
                  <CostRow label="TOTAL VOYAGE COST" value={result.totalVoyageCostEur} unit="€" isBold />
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-10">Adjust parameters and click "Run Scenario" to see costs.</p>
            )}
          </div>
          
          {/* AI-Generated Summary */}
          <div>
            <h3 className="text-lg font-semibold text-gray-300 mb-4">AI-Generated Summary</h3>
            {result && (
              <button
                onClick={handleGenerateSummary}
                disabled={isLoadingSummary}
                className="w-full bg-subtle hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition mb-4 flex items-center justify-center disabled:opacity-50"
              >
                {isLoadingSummary ? (
                  <>
                    <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : 'Generate Summary'}
              </button>
            )}
            {summary ? (
              <div 
                className="bg-background border border-subtle rounded-lg p-4 max-h-96 overflow-y-auto"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'var(--border-color) var(--bg-subtle)'
                }}
              >
                <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: summary.replace(/```html\n?/g, '').replace(/```\n?/g, '') }} />
              </div>
            ) : (
              <p className="text-center text-gray-500 italic py-4">
                {isLoadingSummary ? 'The AI is thinking...' : 'Generate a summary to see AI-powered insights here.'}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Voyage Route Visualization with Real Map */}
      <Card title="Voyage Route Visualization" className="xl:col-span-3">
        <div className="w-full h-[600px] rounded-lg overflow-hidden">
          <VoyageMap 
            key={`${params.originPort || 'Rotterdam'}-${params.destinationPort || 'New York'}-${showRouteOnMap}`}
            originPort={params.originPort || 'Rotterdam'} 
            destinationPort={params.destinationPort || 'New York'}
            showRoute={showRouteOnMap}
            originCoords={selectedOriginPort ? { 
              lat: parseFloat(selectedOriginPort.latitude), 
              lng: parseFloat(selectedOriginPort.longitude) 
            } : undefined}
            destCoords={selectedDestPort ? { 
              lat: parseFloat(selectedDestPort.latitude), 
              lng: parseFloat(selectedDestPort.longitude) 
            } : undefined}
          />
        </div>
        <div className="mt-4 flex justify-between text-sm">
          <div>
            <span className="text-gray-400">Origin:</span>{' '}
            <span className="text-orange-500 font-semibold">{params.originPort || 'Rotterdam'}</span>
          </div>
          <div>
            <span className="text-gray-400">Destination:</span>{' '}
            <span className="text-orange-500 font-semibold">{params.destinationPort || 'New York'}</span>
          </div>
          <div>
            <span className="text-gray-400">Sailing Speed:</span>{' '}
            <span className="text-green-500 font-semibold">{Number(params.speedKnots || 0).toFixed(1)} knots</span>
          </div>
          <div>
            <span className="text-gray-400">ETA:</span>{' '}
            <span className="text-blue-500 font-semibold">{params.daysAtSea || 10} days</span>
          </div>
        </div>
      </Card>
      
      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => hideToast(toast.id)}
        />
      ))}
    </div>
  );
}

// Map bounds fitting component
const FitBounds: React.FC<{ bounds: L.LatLngBoundsExpression }> = ({ bounds }) => {
  const map = useMap();
  
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  
  return null;
};

// Voyage Map Component
const VoyageMap: React.FC<{ 
  originPort: string; 
  destinationPort: string; 
  showRoute?: boolean;
  originCoords?: { lat: number; lng: number };
  destCoords?: { lat: number; lng: number };
}> = ({ originPort, destinationPort, showRoute = false, originCoords, destCoords }) => {
  const [routePoints, setRoutePoints] = useState<Waypoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [routingMethod, setRoutingMethod] = useState<'SeaRoute' | 'OpenCPN' | 'Direct'>('Direct');

  useEffect(() => {
    // Only load route if showRoute is true
    if (!showRoute) {
      setRoutePoints([]);
      setIsLoading(false);
      return;
    }

    const loadRoute = async () => {
      setIsLoading(true);
      try {
        // Use actual coordinates if provided, otherwise fall back to PORTS lookup
        let route: Waypoint[];
        if (originCoords && destCoords) {
          route = await getMaritimeRouteByCoordinates(
            originCoords.lat,
            originCoords.lng,
            destCoords.lat,
            destCoords.lng
          );
        } else {
          route = await getMaritimeRoute(originPort, destinationPort);
        }
        
        setRoutePoints(route);
        
        // Determine which method was used based on the route that was just calculated
        if (route.length > 10) {
          setRoutingMethod('SeaRoute');
        } else if (route.length > 2) {
          setRoutingMethod('OpenCPN');
        } else {
          setRoutingMethod('Direct');
        }
      } catch (error) {
        console.error('Route loading error:', error);
        // Fallback to simple route
        const origin = originCoords || PORTS[originPort] || PORTS['Rotterdam'];
        const dest = destCoords || PORTS[destinationPort] || PORTS['New York'];
        setRoutePoints([
          { lat: origin.lat, lng: origin.lng },
          { lat: dest.lat, lng: dest.lng }
        ]);
        setRoutingMethod('Direct');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadRoute();
  }, [showRoute, originPort, destinationPort, originCoords, destCoords]);

  // Use provided coordinates or fall back to PORTS lookup
  const origin = originCoords || PORTS[originPort] || PORTS['Rotterdam'];
  const dest = destCoords || PORTS[destinationPort] || PORTS['New York'];

  // Convert to Leaflet format
  const waypointsLatLng: L.LatLngExpression[] = routePoints.map(p => [p.lat, p.lng]);

  // Calculate bounds for the map
  const bounds = routePoints.length > 0 ? L.latLngBounds(waypointsLatLng) : L.latLngBounds([[origin.lat, origin.lng], [dest.lat, dest.lng]]);
  
  // Calculate route distance
  const totalDistance = routePoints.length > 0 ? calculateRouteDistance(routePoints) : 0;

  // Icons
  const portIcon = L.divIcon({
    className: 'port-marker',
    html: '<div style="width: 12px; height: 12px; background: #10B981; border-radius: 50%; border: 2px solid white;"></div>',
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });

  const shipIcon = L.divIcon({
    className: 'ship-marker',
    html: '<div style="width: 14px; height: 14px; background: #F97316; border-radius: 50%; border: 2px solid white;"></div>',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });

  const midpoint = routePoints.length > 0 ? Math.floor(routePoints.length / 2) : 0;
  const shipPosition: L.LatLngExpression = routePoints.length > 0 
    ? [routePoints[midpoint].lat, routePoints[midpoint].lng]
    : [origin.lat, origin.lng];

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
          background: 'rgba(0,0,0,0.8)',
          padding: '20px',
          borderRadius: '8px',
          color: 'white'
        }}>
          <div className="flex items-center gap-3">
            <ArrowPathIcon className="h-6 w-6 animate-spin" />
            <span>Calculating maritime route...</span>
          </div>
        </div>
      )}
      
      {/* Routing method indicator */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 1000,
        background: 'rgba(0,0,0,0.8)',
        padding: '8px 12px',
        borderRadius: '6px',
        color: 'white',
        fontSize: '12px'
      }}>
        <div className="flex items-center gap-2">
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: routingMethod === 'SeaRoute' ? '#10B981' : routingMethod === 'OpenCPN' ? '#F59E0B' : '#6B7280'
          }} />
          <span>
            {routingMethod === 'SeaRoute' ? '🌊 SeaRoute API' : 
             routingMethod === 'OpenCPN' ? '⚓ OpenCPN Routing' : 
             '📍 Direct Line'}
          </span>
        </div>
        {totalDistance > 0 && (
          <div className="mt-1 text-xs text-gray-300">
            Distance: {totalDistance.toFixed(0)} NM
          </div>
        )}
      </div>

      <MapContainer 
        center={[45, -20]} 
        zoom={4} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        minZoom={2}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <FitBounds bounds={bounds} />
        
        {waypointsLatLng.length > 0 && (
          <Polyline
            positions={waypointsLatLng}
            pathOptions={{
              color: '#F97316',
              weight: 3,
              opacity: 0.8,
              dashArray: '10, 5',
            }}
          />
        )}

        <Marker position={[origin.lat, origin.lng]} icon={portIcon}>
          <Popup>
            <strong>{origin.label}</strong><br />
            Origin Port
          </Popup>
        </Marker>

        {routePoints.length > 0 && (
          <Marker position={shipPosition} icon={shipIcon}>
            <Popup>
              <strong>Vessel Position</strong><br />
              En route to {dest.label}
            </Popup>
          </Marker>
        )}

        <Marker position={[dest.lat, dest.lng]} icon={portIcon}>
          <Popup>
            <strong>{dest.label}</strong><br />
            Destination Port
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default ScenarioPad;
