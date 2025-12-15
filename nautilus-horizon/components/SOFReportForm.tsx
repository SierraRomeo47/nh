// SOF (Statement of Facts) Report Form - DNV Standard Port Call Report
import React, { useState, useEffect } from 'react';

interface Vessel {
  id: string;
  name: string;
  imo_number: string;
}

interface SOFReportFormProps {
  onSubmitSuccess?: (report: any) => void;
}

const SOFReportForm: React.FC<SOFReportFormProps> = ({ onSubmitSuccess }) => {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    ship_id: '',
    port_name: '',
    terminal_name: '',
    berth_number: '',
    
    // Arrival Timestamps
    arrival_pilot_station: '',
    arrival_berth: '',
    all_fast: '',
    
    // Documentation
    nor_tendered: '',
    nor_accepted: '',
    
    // Cargo Operations
    cargo_operation_commenced: '',
    cargo_operation_completed: '',
    cargo_type: '',
    cargo_loaded_mt: '',
    cargo_discharged_mt: '',
    
    // Departure
    last_line_let_go: '',
    departure_pilot_station: '',
    
    // Laytime
    time_at_berth_hours: '',
    laytime_used_hours: '',
    
    // Costs
    port_charges_usd: '',
    pilotage_charges_usd: '',
    tug_charges_usd: '',
    
    // Services
    tugs_used: '',
    
    // Agent
    agent_name: '',
    general_remarks: ''
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
    
    if (!formData.port_name) {
      setError('Please enter port name');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8080/voyages/api/voyages/reports/sof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit SOF report');
      }
      
      const result = await response.json();
      setSuccess(true);
      
      if (onSubmitSuccess) {
        onSubmitSuccess(result.data);
      }
      
      setTimeout(() => setSuccess(false), 2000);
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
      {/* Vessel and Port */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Port Name *
          </label>
          <input
            type="text"
            value={formData.port_name}
            onChange={(e) => updateField('port_name', e.target.value)}
            className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary"
            placeholder="e.g., Singapore"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Terminal/Berth
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={formData.terminal_name}
              onChange={(e) => updateField('terminal_name', e.target.value)}
              className="flex-1 px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary"
              placeholder="Terminal"
            />
            <input
              type="text"
              value={formData.berth_number}
              onChange={(e) => updateField('berth_number', e.target.value)}
              className="w-24 px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary"
              placeholder="Berth"
            />
          </div>
        </div>
      </div>
      
      {/* Arrival Events */}
      <div className="border border-subtle rounded-lg p-4 space-y-4">
        <h3 className="font-semibold text-text-primary">⚓ Arrival Events</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-text-secondary mb-2">Pilot Station</label>
            <input
              type="datetime-local"
              value={formData.arrival_pilot_station}
              onChange={(e) => updateField('arrival_pilot_station', e.target.value)}
              className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm text-text-secondary mb-2">Arrival Berth</label>
            <input
              type="datetime-local"
              value={formData.arrival_berth}
              onChange={(e) => updateField('arrival_berth', e.target.value)}
              className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm text-text-secondary mb-2">All Fast</label>
            <input
              type="datetime-local"
              value={formData.all_fast}
              onChange={(e) => updateField('all_fast', e.target.value)}
              className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-text-secondary mb-2">NOR Tendered</label>
            <input
              type="datetime-local"
              value={formData.nor_tendered}
              onChange={(e) => updateField('nor_tendered', e.target.value)}
              className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm text-text-secondary mb-2">NOR Accepted</label>
            <input
              type="datetime-local"
              value={formData.nor_accepted}
              onChange={(e) => updateField('nor_accepted', e.target.value)}
              className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary"
            />
          </div>
        </div>
      </div>
      
      {/* Cargo Operations */}
      <div className="border border-subtle rounded-lg p-4 space-y-4">
        <h3 className="font-semibold text-text-primary">📦 Cargo Operations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-text-secondary mb-2">Operation Commenced</label>
            <input
              type="datetime-local"
              value={formData.cargo_operation_commenced}
              onChange={(e) => updateField('cargo_operation_commenced', e.target.value)}
              className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm text-text-secondary mb-2">Operation Completed</label>
            <input
              type="datetime-local"
              value={formData.cargo_operation_completed}
              onChange={(e) => updateField('cargo_operation_completed', e.target.value)}
              className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm text-text-secondary mb-2">Cargo Type</label>
            <input
              type="text"
              value={formData.cargo_type}
              onChange={(e) => updateField('cargo_type', e.target.value)}
              className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary"
              placeholder="e.g., Crude Oil"
            />
          </div>
          
          <div>
            <label className="block text-sm text-text-secondary mb-2">Cargo Loaded (MT)</label>
            <input
              type="number"
              step="0.001"
              value={formData.cargo_loaded_mt}
              onChange={(e) => updateField('cargo_loaded_mt', e.target.value)}
              className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary"
            />
          </div>
        </div>
      </div>
      
      {/* Departure Events */}
      <div className="border border-subtle rounded-lg p-4 space-y-4">
        <h3 className="font-semibold text-text-primary">🚢 Departure Events</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-text-secondary mb-2">Last Line Let Go</label>
            <input
              type="datetime-local"
              value={formData.last_line_let_go}
              onChange={(e) => updateField('last_line_let_go', e.target.value)}
              className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm text-text-secondary mb-2">Pilot Station Departure</label>
            <input
              type="datetime-local"
              value={formData.departure_pilot_station}
              onChange={(e) => updateField('departure_pilot_station', e.target.value)}
              className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary"
            />
          </div>
        </div>
      </div>
      
      {/* Port Costs */}
      <div className="border border-subtle rounded-lg p-4 space-y-4">
        <h3 className="font-semibold text-text-primary">💰 Port Costs & Services</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-text-secondary mb-2">Port Charges (USD)</label>
            <input
              type="number"
              step="0.01"
              value={formData.port_charges_usd}
              onChange={(e) => updateField('port_charges_usd', e.target.value)}
              className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm text-text-secondary mb-2">Pilotage (USD)</label>
            <input
              type="number"
              step="0.01"
              value={formData.pilotage_charges_usd}
              onChange={(e) => updateField('pilotage_charges_usd', e.target.value)}
              className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm text-text-secondary mb-2">Tugs (USD)</label>
            <input
              type="number"
              step="0.01"
              value={formData.tug_charges_usd}
              onChange={(e) => updateField('tug_charges_usd', e.target.value)}
              className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm text-text-secondary mb-2">Tugs Used</label>
            <input
              type="number"
              value={formData.tugs_used}
              onChange={(e) => updateField('tugs_used', e.target.value)}
              className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm text-text-secondary mb-2">Agent Name</label>
          <input
            type="text"
            value={formData.agent_name}
            onChange={(e) => updateField('agent_name', e.target.value)}
            className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary"
            placeholder="Port agent company name"
          />
        </div>
      </div>
      
      {/* Remarks */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          General Remarks
        </label>
        <textarea
          value={formData.general_remarks}
          onChange={(e) => updateField('general_remarks', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Port activities, delays, protests, or other notes..."
        />
      </div>
      
      {/* Error/Success Messages */}
      {error && (
        <div className="p-3 bg-error/10 border border-error rounded-lg">
          <p className="text-error text-sm">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="p-3 bg-success/10 border border-success rounded-lg">
          <p className="text-success text-sm">✅ SOF report submitted successfully!</p>
        </div>
      )}
      
      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || !formData.ship_id || !formData.port_name}
        className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
          !isSubmitting && formData.ship_id && formData.port_name
            ? 'bg-primary text-white hover:bg-primary/80'
            : 'bg-subtle text-text-muted cursor-not-allowed'
        }`}
      >
        {isSubmitting ? 'Submitting...' : 'Submit SOF Report'}
      </button>
    </form>
  );
};

export default SOFReportForm;

