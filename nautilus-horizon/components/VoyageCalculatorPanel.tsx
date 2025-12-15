import React, { useState, useEffect } from 'react';

interface VoyageCalculatorPanelProps {
  onClose?: () => void;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

const VoyageCalculatorPanel: React.FC<VoyageCalculatorPanelProps> = ({
  onClose,
  isMinimized = false,
  onToggleMinimize
}) => {
  // Vessel & Voyage Inputs
  const [distance, setDistance] = useState(8500);
  const [speed, setSpeed] = useState(14);
  const [cargoQty, setCargoQty] = useState(50000);
  const [freightRate, setFreightRate] = useState(0);
  
  // Consumption Rates
  const [ladenConsumption, setLadenConsumption] = useState(35);
  const [ballastConsumption, setBallastConsumption] = useState(30);
  const [portConsumption, setPortConsumption] = useState(3);
  
  // Bunker Prices
  const [ifoPrice, setIfoPrice] = useState(550);
  
  // Port & Canal Costs
  const [loadPortCost, setLoadPortCost] = useState(25000);
  const [dischargePortCost, setDischargePortCost] = useState(30000);
  const [canalDues, setCanalDues] = useState(0);
  
  // Loading/Discharge Rates
  const [loadRate, setLoadRate] = useState(15000);
  const [dischargeRate, setDischargeRate] = useState(12000);
  
  // Calculated Results
  const [results, setResults] = useState({
    seaDaysLaden: 0,
    seaDaysBallast: 0,
    loadDays: 0,
    dischargeDays: 0,
    totalDays: 0,
    bunkerCost: 0,
    totalPortCosts: 0,
    grossRevenue: 0,
    netRevenue: 0,
    tcePerDay: 0
  });

  useEffect(() => {
    calculate();
  }, [distance, speed, cargoQty, freightRate, ladenConsumption, ballastConsumption, 
      portConsumption, ifoPrice, loadPortCost, dischargePortCost, canalDues, 
      loadRate, dischargeRate]);

  const calculate = () => {
    // Timing
    const seaDaysLaden = distance / (speed * 24);
    const seaDaysBallast = (distance * 0.3) / (speed * 24);
    const loadDays = cargoQty / loadRate;
    const dischargeDays = cargoQty / dischargeRate;
    const totalDays = seaDaysLaden + seaDaysBallast + loadDays + dischargeDays;
    
    // Bunker Cost
    const ladenBunker = seaDaysLaden * ladenConsumption;
    const ballastBunker = seaDaysBallast * ballastConsumption;
    const portBunker = (loadDays + dischargeDays) * portConsumption;
    const totalBunker = ladenBunker + ballastBunker + portBunker;
    const bunkerCost = totalBunker * ifoPrice;
    
    // Port Costs
    const totalPortCosts = loadPortCost + dischargePortCost + canalDues;
    
    // Revenue
    const grossRevenue = cargoQty * freightRate;
    const commission = grossRevenue * 0.025; // 2.5%
    const netRevenue = grossRevenue - bunkerCost - totalPortCosts - commission;
    const tcePerDay = totalDays > 0 ? netRevenue / totalDays : 0;
    
    setResults({
      seaDaysLaden: Math.round(seaDaysLaden * 10) / 10,
      seaDaysBallast: Math.round(seaDaysBallast * 10) / 10,
      loadDays: Math.round(loadDays * 10) / 10,
      dischargeDays: Math.round(dischargeDays * 10) / 10,
      totalDays: Math.round(totalDays * 10) / 10,
      bunkerCost: Math.round(bunkerCost),
      totalPortCosts: Math.round(totalPortCosts),
      grossRevenue: Math.round(grossRevenue),
      netRevenue: Math.round(netRevenue),
      tcePerDay: Math.round(tcePerDay)
    });
  };

  if (isMinimized) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '280px',
        width: '280px',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px 12px 0 0',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 1000,
        cursor: 'pointer'
      }}
      onClick={onToggleMinimize}>
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#3B82F6',
          borderRadius: '12px 12px 0 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>🧮</span>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: 'white' }}>
                Voyage Calculator
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>
                TCE: ${results.tcePerDay.toLocaleString()}/day
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const InputField = ({ label, value, onChange, unit, step = "1" }: any) => (
    <div style={{ marginBottom: '10px' }}>
      <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
        {label}
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <input
          type="number"
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          style={{
            flex: 1,
            padding: '6px 8px',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            fontSize: '12px',
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-primary)'
          }}
        />
        {unit && <span style={{ fontSize: '10px', color: 'var(--text-muted)', minWidth: '40px' }}>{unit}</span>}
      </div>
    </div>
  );

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '280px',
      width: '350px',
      height: '85vh',
      backgroundColor: 'var(--bg-primary)',
      border: '1px solid var(--border-color)',
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 16px',
        backgroundColor: '#3B82F6',
        borderRadius: '12px 12px 0 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <div style={{ fontSize: '15px', fontWeight: '700', color: 'white' }}>
            🧮 Voyage Calculator
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.9)', marginTop: '2px' }}>
            Quick TCE Estimation
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={onToggleMinimize}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              width: '26px',
              height: '26px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            −
          </button>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                width: '26px',
                height: '26px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {/* Voyage Parameters */}
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '10px', borderBottom: '2px solid #3B82F6', paddingBottom: '4px' }}>
            Voyage Parameters
          </h4>
          <InputField label="Distance" value={distance} onChange={setDistance} unit="NM" />
          <InputField label="Speed" value={speed} onChange={setSpeed} unit="knots" step="0.5" />
          <InputField label="Cargo Qty" value={cargoQty} onChange={setCargoQty} unit="MT" />
          <InputField label="Freight Rate" value={freightRate} onChange={setFreightRate} unit="$/MT" step="0.01" />
        </div>

        {/* Consumption */}
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '10px', borderBottom: '2px solid #10B981', paddingBottom: '4px' }}>
            Consumption
          </h4>
          <InputField label="Laden" value={ladenConsumption} onChange={setLadenConsumption} unit="t/day" step="0.5" />
          <InputField label="Ballast" value={ballastConsumption} onChange={setBallastConsumption} unit="t/day" step="0.5" />
          <InputField label="Port" value={portConsumption} onChange={setPortConsumption} unit="t/day" step="0.5" />
        </div>

        {/* Costs */}
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '10px', borderBottom: '2px solid #F59E0B', paddingBottom: '4px' }}>
            Costs
          </h4>
          <InputField label="IFO Price" value={ifoPrice} onChange={setIfoPrice} unit="$/ton" step="10" />
          <InputField label="Load Port" value={loadPortCost} onChange={setLoadPortCost} unit="$" step="1000" />
          <InputField label="Discharge Port" value={dischargePortCost} onChange={setDischargePortCost} unit="$" step="1000" />
          <InputField label="Canal Dues" value={canalDues} onChange={setCanalDues} unit="$" step="1000" />
        </div>

        {/* Loading/Discharge */}
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '10px', borderBottom: '2px solid #8B5CF6', paddingBottom: '4px' }}>
            Loading/Discharge
          </h4>
          <InputField label="Load Rate" value={loadRate} onChange={setLoadRate} unit="t/day" step="1000" />
          <InputField label="Discharge Rate" value={dischargeRate} onChange={setDischargeRate} unit="t/day" step="1000" />
        </div>
      </div>

      {/* Results Panel */}
      <div style={{
        padding: '16px',
        backgroundColor: 'var(--bg-subtle)',
        borderTop: '1px solid var(--border-color)'
      }}>
        <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px' }}>
          📊 Results
        </h4>
        
        {/* Timing */}
        <div style={{ marginBottom: '12px', padding: '10px', backgroundColor: 'var(--bg-card)', borderRadius: '8px' }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>
            VOYAGE DURATION
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '11px' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Laden: </span>
              <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{results.seaDaysLaden}d</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Ballast: </span>
              <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{results.seaDaysBallast}d</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Loading: </span>
              <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{results.loadDays}d</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Discharge: </span>
              <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{results.dischargeDays}d</span>
            </div>
          </div>
          <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>TOTAL: </span>
            <span style={{ fontSize: '18px', fontWeight: '700', color: '#3B82F6' }}>{results.totalDays}</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}> days</span>
          </div>
        </div>

        {/* Economics */}
        <div style={{ padding: '10px', backgroundColor: 'var(--bg-card)', borderRadius: '8px', marginBottom: '12px' }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>
            ECONOMICS
          </div>
          <div style={{ fontSize: '11px', marginBottom: '4px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Revenue: </span>
            <span style={{ fontWeight: '600', color: '#10B981' }}>${results.grossRevenue.toLocaleString()}</span>
          </div>
          <div style={{ fontSize: '11px', marginBottom: '4px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Bunkers: </span>
            <span style={{ fontWeight: '600', color: '#EF4444' }}>-${results.bunkerCost.toLocaleString()}</span>
          </div>
          <div style={{ fontSize: '11px', marginBottom: '4px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Ports: </span>
            <span style={{ fontWeight: '600', color: '#EF4444' }}>-${results.totalPortCosts.toLocaleString()}</span>
          </div>
          <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>NET REVENUE</div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: results.netRevenue > 0 ? '#10B981' : '#EF4444' }}>
              ${results.netRevenue.toLocaleString()}
            </div>
          </div>
        </div>

        {/* TCE Result */}
        <div style={{ 
          padding: '12px', 
          backgroundColor: results.tcePerDay > 15000 ? '#D1FAE5' : results.tcePerDay > 0 ? '#FEF3C7' : '#FEE2E2',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '10px', fontWeight: '700', color: results.tcePerDay > 15000 ? '#065F46' : results.tcePerDay > 0 ? '#92400E' : '#991B1B', marginBottom: '4px' }}>
            TIME CHARTER EQUIVALENT
          </div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: results.tcePerDay > 15000 ? '#059669' : results.tcePerDay > 0 ? '#D97706' : '#DC2626' }}>
            ${results.tcePerDay.toLocaleString()}
          </div>
          <div style={{ fontSize: '10px', fontWeight: '600', color: results.tcePerDay > 15000 ? '#065F46' : results.tcePerDay > 0 ? '#92400E' : '#991B1B', marginTop: '2px' }}>
            per day
          </div>
          {results.tcePerDay > 15000 && (
            <div style={{ fontSize: '10px', color: '#065F46', marginTop: '6px' }}>
              ⭐ Excellent TCE!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoyageCalculatorPanel;

