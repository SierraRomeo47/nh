import React, { useState, useEffect } from 'react';
import { RFQ, VoyageEstimate, CargoType } from '../types/charter';

interface VoyageEstimatorProps {
  rfq: RFQ;
  onComplete: (estimate: VoyageEstimate) => void;
  onClose: () => void;
}

const VoyageEstimator: React.FC<VoyageEstimatorProps> = ({ rfq, onComplete, onClose }) => {
  // Vessel Parameters
  const [vesselName, setVesselName] = useState('');
  const [dwt, setDwt] = useState(rfq.vesselRequirements.minDwt);
  const [speed, setSpeed] = useState(14); // knots
  const [ladenConsumption, setLadenConsumption] = useState(35); // tons/day
  const [ballastConsumption, setBallastConsumption] = useState(30); // tons/day
  const [portConsumption, setPortConsumption] = useState(3); // tons/day

  // Route Parameters
  const [distance, setDistance] = useState(8500); // nautical miles
  const [loadRate, setLoadRate] = useState(15000); // tons/day
  const [dischargeRate, setDischargeRate] = useState(12000); // tons/day

  // Bunker Prices
  const [ifoPrice, setIfoPrice] = useState(550); // USD/ton
  const [mgoPrice, setMgoPrice] = useState(750); // USD/ton

  // Port Costs
  const [loadPortCosts, setLoadPortCosts] = useState(25000); // USD
  const [dischargePortCosts, setDischargePortCosts] = useState(30000); // USD
  const [canalDues, setCanalDues] = useState(0); // USD

  // Freight
  const [freightRate, setFreightRate] = useState(0); // USD/ton
  const [commission, setCommission] = useState(2.5); // percentage

  // Calculated values
  const [estimate, setEstimate] = useState<VoyageEstimate | null>(null);

  useEffect(() => {
    calculateEstimate();
  }, [distance, speed, ladenConsumption, ballastConsumption, portConsumption, 
      ifoPrice, loadPortCosts, dischargePortCosts, canalDues, freightRate, 
      commission, loadRate, dischargeRate]);

  const calculateEstimate = () => {
    // Timing calculations
    const seaDaysLaden = distance / (speed * 24);
    const seaDaysBallast = (distance * 0.3) / (speed * 24); // Assume 30% ballast distance
    const loadDays = rfq.cargo.quantity / loadRate;
    const dischargeDays = rfq.cargo.quantity / dischargeRate;
    const totalDays = seaDaysLaden + seaDaysBallast + loadDays + dischargeDays;

    // Bunker calculations
    const ladenBunker = seaDaysLaden * ladenConsumption;
    const ballastBunker = seaDaysBallast * ballastConsumption;
    const portBunker = (loadDays + dischargeDays) * portConsumption;
    const totalBunker = ladenBunker + ballastBunker + portBunker;
    const bunkerCost = totalBunker * ifoPrice;

    // Port costs
    const totalPortCosts = loadPortCosts + dischargePortCosts + canalDues;

    // Revenue calculations
    const grossRevenue = rfq.cargo.quantity * freightRate;
    const commissionAmount = grossRevenue * (commission / 100);
    const otherCosts = commissionAmount;
    const netRevenue = grossRevenue - bunkerCost - totalPortCosts - otherCosts;
    const tcePerDay = netRevenue / totalDays;

    const newEstimate: VoyageEstimate = {
      id: `est-${Date.now()}`,
      route: {
        loadPort: rfq.route.loadPort,
        loadPortCode: rfq.route.loadPortCode,
        dischargePort: rfq.route.dischargePort,
        dischargePortCode: rfq.route.dischargePortCode,
        distance: distance
      },
      cargo: {
        type: rfq.cargo.type,
        quantity: rfq.cargo.quantity,
        loadRate: loadRate,
        dischargeRate: dischargeRate
      },
      vessel: {
        type: 'Bulk Carrier',
        dwt: dwt,
        speed: speed,
        consumption: {
          laden: ladenConsumption,
          ballast: ballastConsumption,
          port: portConsumption
        }
      },
      bunkers: {
        ifoPrice: ifoPrice,
        mgoPrice: mgoPrice,
        ifoQuantity: totalBunker,
        mgoQuantity: 0
      },
      portCosts: {
        loadPortCosts: loadPortCosts,
        dischargePortCosts: dischargePortCosts,
        canalDues: canalDues
      },
      freight: {
        rate: freightRate,
        rateType: 'PER_TON',
        totalFreight: grossRevenue
      },
      timing: {
        seaDaysLaden: Math.round(seaDaysLaden * 10) / 10,
        seaDaysBallast: Math.round(seaDaysBallast * 10) / 10,
        loadDays: Math.round(loadDays * 10) / 10,
        dischargeDays: Math.round(dischargeDays * 10) / 10,
        totalDays: Math.round(totalDays * 10) / 10
      },
      economics: {
        grossRevenue: Math.round(grossRevenue),
        bunkerCost: Math.round(bunkerCost),
        portCosts: Math.round(totalPortCosts),
        otherCosts: Math.round(otherCosts),
        netRevenue: Math.round(netRevenue),
        tcePerDay: Math.round(tcePerDay)
      }
    };

    setEstimate(newEstimate);
  };

  const handleSubmitBid = () => {
    if (!estimate || !vesselName || freightRate <= 0) {
      alert('Please complete all required fields and enter a freight rate');
      return;
    }
    onComplete(estimate);
  };

  const InputField = ({ label, value, onChange, unit, step = "1" }: any) => (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
        {label}
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input
          type="number"
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          style={{
            flex: 1,
            padding: '10px',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            fontSize: '14px',
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-primary)'
          }}
        />
        {unit && <span style={{ fontSize: '13px', color: 'var(--text-muted)', minWidth: '60px' }}>{unit}</span>}
      </div>
    </div>
  );

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      overflow: 'auto',
      padding: '24px'
    }}>
      <div style={{
        width: '1200px',
        maxHeight: '90vh',
        backgroundColor: 'var(--bg-primary)',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
              📊 Voyage Estimator
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              {rfq.rfqNumber} • {rfq.route.loadPortCode} → {rfq.route.dischargePortCode} • {rfq.cargo.quantity.toLocaleString()} MT
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: 'var(--text-muted)'
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Left Column - Inputs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Vessel Details */}
            <div style={{ padding: '20px', backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                🚢 Vessel Details
              </h3>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Vessel Name *
                </label>
                <input
                  type="text"
                  value={vesselName}
                  onChange={(e) => setVesselName(e.target.value)}
                  placeholder="Enter vessel name"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
              <InputField label="DWT" value={dwt} onChange={setDwt} unit="MT" />
              <InputField label="Speed" value={speed} onChange={setSpeed} unit="knots" step="0.1" />
              <InputField label="Laden Consumption" value={ladenConsumption} onChange={setLadenConsumption} unit="tons/day" step="0.1" />
              <InputField label="Ballast Consumption" value={ballastConsumption} onChange={setBallastConsumption} unit="tons/day" step="0.1" />
              <InputField label="Port Consumption" value={portConsumption} onChange={setPortConsumption} unit="tons/day" step="0.1" />
            </div>

            {/* Route & Timing */}
            <div style={{ padding: '20px', backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                🗺️ Route & Timing
              </h3>
              <InputField label="Distance" value={distance} onChange={setDistance} unit="NM" />
              <InputField label="Load Rate" value={loadRate} onChange={setLoadRate} unit="tons/day" />
              <InputField label="Discharge Rate" value={dischargeRate} onChange={setDischargeRate} unit="tons/day" />
            </div>

            {/* Costs */}
            <div style={{ padding: '20px', backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                💰 Costs
              </h3>
              <InputField label="IFO Price" value={ifoPrice} onChange={setIfoPrice} unit="USD/ton" step="0.01" />
              <InputField label="MGO Price" value={mgoPrice} onChange={setMgoPrice} unit="USD/ton" step="0.01" />
              <InputField label="Load Port Costs" value={loadPortCosts} onChange={setLoadPortCosts} unit="USD" />
              <InputField label="Discharge Port Costs" value={dischargePortCosts} onChange={setDischargePortCosts} unit="USD" />
              <InputField label="Canal Dues (if any)" value={canalDues} onChange={setCanalDues} unit="USD" />
            </div>
          </div>

          {/* Right Column - Results */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Freight Rate Input */}
            <div style={{ padding: '20px', backgroundColor: '#FFF7ED', borderRadius: '12px', border: '2px solid #FF6A00' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#EA580C', marginBottom: '16px' }}>
                📈 Your Bid Rate *
              </h3>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'end' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#9A3412', display: 'block', marginBottom: '6px' }}>
                    Freight Rate
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={freightRate}
                    onChange={(e) => setFreightRate(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    style={{
                      width: '100%',
                      padding: '14px',
                      border: '2px solid #FF6A00',
                      borderRadius: '8px',
                      fontSize: '20px',
                      fontWeight: '700',
                      backgroundColor: 'white',
                      color: '#EA580C'
                    }}
                  />
                </div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#9A3412', paddingBottom: '14px' }}>
                  USD/MT
                </div>
              </div>
              <InputField label="Commission" value={commission} onChange={setCommission} unit="%" step="0.1" />
            </div>

            {/* Timing Results */}
            {estimate && (
              <>
                <div style={{ padding: '20px', backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                    ⏱️ Voyage Duration
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Laden Days</div>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
                        {estimate.timing.seaDaysLaden}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Ballast Days</div>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
                        {estimate.timing.seaDaysBallast}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Loading Days</div>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
                        {estimate.timing.loadDays}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Discharge Days</div>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
                        {estimate.timing.dischargeDays}
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>TOTAL VOYAGE DAYS</div>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: '#FF6A00' }}>
                      {estimate.timing.totalDays}
                    </div>
                  </div>
                </div>

                {/* Economics */}
                <div style={{ padding: '20px', backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                    💵 Economics
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Gross Revenue</span>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#10B981' }}>
                        ${estimate.economics.grossRevenue.toLocaleString()}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Bunker Cost</span>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#EF4444' }}>
                        -${estimate.economics.bunkerCost.toLocaleString()}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Port Costs</span>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#EF4444' }}>
                        -${estimate.economics.portCosts.toLocaleString()}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Other Costs</span>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#EF4444' }}>
                        -${estimate.economics.otherCosts.toLocaleString()}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>Net Revenue</span>
                      <span style={{ fontSize: '18px', fontWeight: '700', color: estimate.economics.netRevenue > 0 ? '#10B981' : '#EF4444' }}>
                        ${estimate.economics.netRevenue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* TCE Result */}
                <div style={{ padding: '24px', backgroundColor: estimate.economics.tcePerDay > 10000 ? '#D1FAE5' : estimate.economics.tcePerDay > 0 ? '#FEF3C7' : '#FEE2E2', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: estimate.economics.tcePerDay > 10000 ? '#065F46' : estimate.economics.tcePerDay > 0 ? '#92400E' : '#991B1B', marginBottom: '8px' }}>
                    TIME CHARTER EQUIVALENT (TCE)
                  </div>
                  <div style={{ fontSize: '36px', fontWeight: '700', color: estimate.economics.tcePerDay > 10000 ? '#059669' : estimate.economics.tcePerDay > 0 ? '#D97706' : '#DC2626' }}>
                    ${estimate.economics.tcePerDay.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: estimate.economics.tcePerDay > 10000 ? '#065F46' : estimate.economics.tcePerDay > 0 ? '#92400E' : '#991B1B', marginTop: '4px' }}>
                    per day
                  </div>
                  {estimate.economics.tcePerDay > 15000 && (
                    <div style={{ fontSize: '12px', color: '#065F46', marginTop: '12px', padding: '8px', backgroundColor: '#A7F3D0', borderRadius: '6px' }}>
                      ⭐ Excellent TCE - Very profitable voyage!
                    </div>
                  )}
                  {estimate.economics.tcePerDay > 0 && estimate.economics.tcePerDay <= 15000 && (
                    <div style={{ fontSize: '12px', color: '#92400E', marginTop: '12px', padding: '8px', backgroundColor: '#FDE68A', borderRadius: '6px' }}>
                      ⚠️ Moderate TCE - Consider adjusting freight rate
                    </div>
                  )}
                  {estimate.economics.tcePerDay <= 0 && (
                    <div style={{ fontSize: '12px', color: '#991B1B', marginTop: '12px', padding: '8px', backgroundColor: '#FCA5A5', borderRadius: '6px' }}>
                      ❌ Negative TCE - This voyage is not profitable
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '20px 24px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--bg-subtle)'
        }}>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {estimate && estimate.economics.tcePerDay > 0
              ? `✅ Ready to submit • TCE: $${estimate.economics.tcePerDay.toLocaleString()}/day`
              : '⚠️ Please review your estimates'}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '12px 24px',
                backgroundColor: 'transparent',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitBid}
              disabled={!estimate || !vesselName || freightRate <= 0}
              style={{
                padding: '12px 32px',
                backgroundColor: estimate && vesselName && freightRate > 0 ? '#FF6A00' : '#CBD5E1',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '700',
                cursor: estimate && vesselName && freightRate > 0 ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                opacity: estimate && vesselName && freightRate > 0 ? 1 : 0.6
              }}
            >
              Submit Bid
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoyageEstimator;

