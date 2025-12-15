// Noon Report Form - DNV Standard Daily Vessel Report
import React, { useState, useEffect } from 'react';

interface Vessel {
  id: string;
  name: string;
  imo_number: string;
}

interface NoonReportFormProps {
  onSubmitSuccess?: (report: any) => void;
}

const NoonReportForm: React.FC<NoonReportFormProps> = ({ onSubmitSuccess }) => {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    ship_id: '',
    report_date: new Date().toISOString().split('T')[0],
    report_time: '12:00', // Noon time
    
    // Position
    latitude_degrees: '',
    latitude_direction: 'N' as 'N' | 'S',
    longitude_degrees: '',
    longitude_direction: 'E' as 'E' | 'W',
    
    // Voyage
    voyage_type: 'LADEN' as 'LADEN' | 'BALLAST' | 'IN_PORT',
    distance_sailed_24h_nm: '',
    average_speed_knots: '',
    next_port: '',
    distance_to_go_nm: '',
    
    // Weather
    wind_force_beaufort: '',
    sea_state: '',
    air_temperature_c: '',
    
    // Fuel Consumption (24h)
    me_fo_consumption_mt: '',
    me_do_consumption_mt: '',
    ae_consumption_mt: '',
    boiler_consumption_mt: '',
    
    // Fuel ROB
    fo_rob_mt: '',
    do_rob_mt: '',
    
    // Cargo
    cargo_on_board_mt: '',
    
    // Remarks
    remarks: ''
  });
  
  useEffect(() => {
    fetchVessels();
  }, []);
  
  const fetchVessels = async () => {
    try {
      const response = await fetch('http://localhost:8080/vessels/api/vessels', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setVessels(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch vessels:', err);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.ship_id) {
      setError('Please select a vessel');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8080/voyages/api/voyages/reports/noon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit noon report');
      }
      
      const result = await response.json();
      setSuccess(true);
      
      if (onSubmitSuccess) {
        onSubmitSuccess(result.data);
      }
      
      // Reset form after success
      setTimeout(() => {
        setSuccess(false);
        setFormData({
          ...formData,
          report_date: new Date().toISOString().split('T')[0],
          distance_sailed_24h_nm: '',
          me_fo_consumption_mt: '',
          remarks: ''
        });
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const updateField = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Vessel Selection */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Vessel *
          </label>
          <select
            value={formData.ship_id}
            onChange={(e) => updateField('ship_id', e.target.value)}
            className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            required
          >
            <option value="">-- Select Vessel --</option>
            {vessels.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} • IMO: {v.imo_number}
              </option>
            ))}
          </select>
        </div>
        
        {/* Report Date and Time */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Report Date *
          </label>
          <input
            type="date"
            value={formData.report_date}
            onChange={(e) => updateField('report_date', e.target.value)}
            className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Report Time *
          </label>
          <input
            type="time"
            value={formData.report_time}
            onChange={(e) => updateField('report_time', e.target.value)}
            className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
      </div>
      
      {/* Position Information */}
      <div className="border border-subtle rounded-lg p-4 space-y-4">
        <h3 className="font-semibold text-text-primary">📍 Position</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-text-secondary mb-2">Latitude</label>
            <div className="flex space-x-2">
              <input
                type="number"
                step="0.000001"
                placeholder="e.g., 25.123456"
                value={formData.latitude_degrees}
                onChange={(e) => updateField('latitude_degrees', e.target.value)}
                className="flex-1 px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <select
                value={formData.latitude_direction}
                onChange={(e) => updateField('latitude_direction', e.target.value)}
                className="px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary"
              >
                <option value="N">N</option>
                <option value="S">S</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-text-secondary mb-2">Longitude</label>
            <div className="flex space-x-2">
              <input
                type="number"
                step="0.000001"
                placeholder="e.g., 55.123456"
                value={formData.longitude_degrees}
                onChange={(e) => updateField('longitude_degrees', e.target.value)}
                className="flex-1 px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <select
                value={formData.longitude_direction}
                onChange={(e) => updateField('longitude_direction', e.target.value)}
                className="px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary"
              >
                <option value="E">E</option>
                <option value="W">W</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Voyage Information */}
      <div className="border border-subtle rounded-lg p-4 space-y-4">
        <h3 className="font-semibold text-text-primary">🗺️ Voyage Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-text-secondary mb-2">Voyage Type *</label>
            <select
              value={formData.voyage_type}
              onChange={(e) => updateField('voyage_type', e.target.value)}
              className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary"
              required
            >
              <option value="LADEN">Laden</option>
              <option value="BALLAST">Ballast</option>
              <option value="IN_PORT">In Port</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-text-secondary mb-2">Distance (24h) NM</label>
            <input
              type="number"
              step="0.1"
              value={formData.distance_sailed_24h_nm}
              onChange={(e) => updateField('distance_sailed_24h_nm', e.target.value)}
              className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm text-text-secondary mb-2">Avg Speed (kts)</label>
            <input
              type="number"
              step="0.1"
              value={formData.average_speed_knots}
              onChange={(e) => updateField('average_speed_knots', e.target.value)}
              className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm text-text-secondary mb-2">Next Port</label>
            <input
              type="text"
              value={formData.next_port}
              onChange={(e) => updateField('next_port', e.target.value)}
              className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary"
              placeholder="e.g., Singapore"
            />
          </div>
          
          <div>
            <label className="block text-sm text-text-secondary mb-2">Distance To Go (NM)</label>
            <input
              type="number"
              step="0.1"
              value={formData.distance_to_go_nm}
              onChange={(e) => updateField('distance_to_go_nm', e.target.value)}
              className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary"
            />
          </div>
        </div>
      </div>
      
      {/* Fuel Consumption (24h) */}
      <div className="border border-subtle rounded-lg p-4 space-y-4">
        <h3 className="font-semibold text-text-primary">⛽ Fuel Consumption (24 hours)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-text-secondary mb-2">ME FO (MT)</label>
            <input
              type="number"
              step="0.001"
              value={formData.me_fo_consumption_mt}
              onChange={(e) => updateField('me_fo_consumption_mt', e.target.value)}
              className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary"
              placeholder="Main Engine"
            />
          </div>
          
          <div>
            <label className="block text-sm text-text-secondary mb-2">ME DO (MT)</label>
            <input
              type="number"
              step="0.001"
              value={formData.me_do_consumption_mt}
              onChange={(e) => updateField('me_do_consumption_mt', e.target.value)}
              className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary"
              placeholder="Diesel Oil"
            />
          </div>
          
          <div>
            <label className="block text-sm text-text-secondary mb-2">AE (MT)</label>
            <input
              type="number"
              step="0.001"
              value={formData.ae_consumption_mt}
              onChange={(e) => updateField('ae_consumption_mt', e.target.value)}
              className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary"
              placeholder="Aux Engine"
            />
          </div>
          
          <div>
            <label className="block text-sm text-text-secondary mb-2">Boiler (MT)</label>
            <input
              type="number"
              step="0.001"
              value={formData.boiler_consumption_mt}
              onChange={(e) => updateField('boiler_consumption_mt', e.target.value)}
              className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary"
            />
          </div>
        </div>
      </div>
      
      {/* Fuel ROB */}
      <div className="border border-subtle rounded-lg p-4 space-y-4">
        <h3 className="font-semibold text-text-primary">📊 Fuel ROB (Remain On Board)</h3>
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-text-secondary mb-2">FO ROB (MT)</label>
            <input
              type="number"
              step="0.001"
              value={formData.fo_rob_mt}
              onChange={(e) => updateField('fo_rob_mt', e.target.value)}
              className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm text-text-secondary mb-2">DO ROB (MT)</label>
            <input
              type="number"
              step="0.001"
              value={formData.do_rob_mt}
              onChange={(e) => updateField('do_rob_mt', e.target.value)}
              className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary"
            />
          </div>
        </div>
      </div>
      
      {/* Weather */}
      <div className="border border-subtle rounded-lg p-4 space-y-4">
        <h3 className="font-semibold text-text-primary">🌊 Weather Conditions</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-text-secondary mb-2">Wind (Beaufort)</label>
            <input
              type="number"
              min="0"
              max="12"
              value={formData.wind_force_beaufort}
              onChange={(e) => updateField('wind_force_beaufort', e.target.value)}
              className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm text-text-secondary mb-2">Sea State (0-9)</label>
            <input
              type="number"
              min="0"
              max="9"
              value={formData.sea_state}
              onChange={(e) => updateField('sea_state', e.target.value)}
              className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm text-text-secondary mb-2">Air Temp (°C)</label>
            <input
              type="number"
              step="0.1"
              value={formData.air_temperature_c}
              onChange={(e) => updateField('air_temperature_c', e.target.value)}
              className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary"
            />
          </div>
        </div>
      </div>
      
      {/* Cargo */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Cargo On Board (MT)
        </label>
        <input
          type="number"
          step="0.001"
          value={formData.cargo_on_board_mt}
          onChange={(e) => updateField('cargo_on_board_mt', e.target.value)}
          className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary"
        />
      </div>
      
      {/* Remarks */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Remarks
        </label>
        <textarea
          value={formData.remarks}
          onChange={(e) => updateField('remarks', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Weather conditions, delays, incidents, etc."
        />
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="p-3 bg-error/10 border border-error rounded-lg">
          <p className="text-error text-sm">{error}</p>
        </div>
      )}
      
      {/* Success Message */}
      {success && (
        <div className="p-3 bg-success/10 border border-success rounded-lg">
          <p className="text-success text-sm">✅ Noon report submitted successfully!</p>
        </div>
      )}
      
      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || !formData.ship_id}
        className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
          !isSubmitting && formData.ship_id
            ? 'bg-primary text-white hover:bg-primary/80'
            : 'bg-subtle text-text-muted cursor-not-allowed'
        }`}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Noon Report'}
      </button>
    </form>
  );
};

export default NoonReportForm;

