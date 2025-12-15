// Bunker Report Form - DNV Standard Bunkering Operations
import React, { useState, useEffect } from 'react';

interface Vessel {
  id: string;
  name: string;
  imo_number: string;
}

interface BunkerReportFormProps {
  onSubmitSuccess?: (report: any) => void;
}

const BunkerReportForm: React.FC<BunkerReportFormProps> = ({ onSubmitSuccess }) => {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    ship_id: '',
    bunkering_port: '',
    bunker_date: new Date().toISOString().split('T')[0],
    
    // Fuel Details
    fuel_type: 'VLSFO',
    fuel_grade: '',
    quantity_received_mt: '',
    quantity_ordered_mt: '',
    
    // Supplier
    supplier_name: '',
    delivery_note_number: '',
    barge_name: '',
    
    // Quality Specifications
    density_15c_kg_m3: '',
    viscosity_50c_cst: '',
    sulphur_content_pct: '',
    flash_point_c: '',
    
    // Calorific Values
    lower_calorific_value_mj_kg: '',
    carbon_content_pct: '',
    
    // Financial
    unit_price_usd_per_mt: '',
    total_cost_usd: '',
    
    // ROB
    rob_before_mt: '',
    rob_after_mt: '',
    
    // Quality
    sample_taken: false,
    quality_acceptance_status: 'PENDING' as 'ACCEPTED' | 'DISPUTED' | 'REJECTED' | 'PENDING'
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
    
    if (!formData.supplier_name) {
      setError('Please enter supplier name');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8080/voyages/api/voyages/reports/bunker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit bunker report');
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
    
    // Auto-calculate total cost
    if (field === 'quantity_received_mt' || field === 'unit_price_usd_per_mt') {
      const qty = field === 'quantity_received_mt' ? parseFloat(value) : parseFloat(formData.quantity_received_mt);
      const price = field === 'unit_price_usd_per_mt' ? parseFloat(value) : parseFloat(formData.unit_price_usd_per_mt);
      if (!isNaN(qty) && !isNaN(price)) {
        setFormData(prev => ({ ...prev, [field]: value, total_cost_usd: (qty * price).toFixed(2) }));
        return;
      }
    }
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
        
        {/* Port and Date */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Bunkering Port *
          </label>
          <input
            type="text"
            value={formData.bunkering_port}
            onChange={(e) => updateField('bunkering_port', e.target.value)}
            className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary"
            placeholder="e.g., Singapore"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Bunker Date *
          </label>
          <input
            type="date"
            value={formData.bunker_date}
            onChange={(e) => updateField('bunker_date', e.target.value)}
            className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary"
            required
          />
        </div>
      </div>
      
      {/* Fuel Details */}
      <div className="border border-subtle rounded-lg p-4 space-y-4">
        <h3 className="font-semibold text-text-primary">⛽ Fuel Details</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-text-secondary mb-2">Fuel Type *</label>
            <select
              value={formData.fuel_type}
              onChange={(e) => updateField('fuel_type', e.target.value)}
              className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary"
              required
            >
              <option value="VLSFO">VLSFO (Very Low Sulphur)</option>
              <option value="HFO">HFO (Heavy Fuel Oil)</option>
              <option value="MGO">MGO (Marine Gas Oil)</option>
              <option value="MDO">MDO (Marine Diesel Oil)</option>
              <option value="LNG">LNG</option>
              <option value="LSMGO">LSMGO (Low Sulphur MGO)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-text-secondary mb-2">Grade</label>
            <input
              type="text"
              value={formData.fuel_grade}
              onChange={(e) => updateField('fuel_grade', e.target.value)}
              className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary"
              placeholder="e.g., ISO-F-RMG 380"
            />
          </div>
          
          <div>
            <label className="block text-sm text-text-secondary mb-2">Qty Received (MT) *</label>
            <input
              type="number"
              step="0.001"
              value={formData.quantity_received_mt}
              onChange={(e) => updateField('quantity_received_mt', e.target.value)}
              className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm text-text-secondary mb-2">Qty Ordered (MT)</label>
            <input
              type="number"
              step="0.001"
              value={formData.quantity_ordered_mt}
              onChange={(e) => updateField('quantity_ordered_mt', e.target.value)}
              className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary"
            />
          </div>
        </div>
      </div>
      
      {/* Supplier Information */}
      <div className="border border-subtle rounded-lg p-4 space-y-4">
        <h3 className="font-semibold text-text-primary">🏢 Supplier Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-text-secondary mb-2">Supplier Name *</label>
            <input
              type="text"
              value={formData.supplier_name}
              onChange={(e) => updateField('supplier_name', e.target.value)}
              className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary"
              placeholder="e.g., Shell Marine"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm text-text-secondary mb-2">BDN Number</label>
            <input
              type="text"
              value={formData.delivery_note_number}
              onChange={(e) => updateField('delivery_note_number', e.target.value)}
              className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary"
              placeholder="Bunker Delivery Note"
            />
          </div>
          
          <div>
            <label className="block text-sm text-text-secondary mb-2">Barge Name</label>
            <input
              type="text"
              value={formData.barge_name}
              onChange={(e) => updateField('barge_name', e.target.value)}
              className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary"
            />
          </div>
        </div>
      </div>
      
      {/* Quality Specifications (ISO 8217) */}
      <div className="border border-subtle rounded-lg p-4 space-y-4">
        <h3 className="font-semibold text-text-primary">🔬 Quality Specifications (ISO 8217)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-text-secondary mb-2">Density @15°C</label>
            <input
              type="number"
              step="0.0001"
              value={formData.density_15c_kg_m3}
              onChange={(e) => updateField('density_15c_kg_m3', e.target.value)}
              className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary"
              placeholder="kg/m³"
            />
          </div>
          
          <div>
            <label className="block text-sm text-text-secondary mb-2">Viscosity @50°C</label>
            <input
              type="number"
              step="0.0001"
              value={formData.viscosity_50c_cst}
              onChange={(e) => updateField('viscosity_50c_cst', e.target.value)}
              className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary"
              placeholder="cSt"
            />
          </div>
          
          <div>
            <label className="block text-sm text-text-secondary mb-2">Sulphur %</label>
            <input
              type="number"
              step="0.0001"
              value={formData.sulphur_content_pct}
              onChange={(e) => updateField('sulphur_content_pct', e.target.value)}
              className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary"
              placeholder="% m/m"
            />
          </div>
          
          <div>
            <label className="block text-sm text-text-secondary mb-2">Flash Point °C</label>
            <input
              type="number"
              step="0.1"
              value={formData.flash_point_c}
              onChange={(e) => updateField('flash_point_c', e.target.value)}
              className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm text-text-secondary mb-2">LCV (MJ/kg)</label>
            <input
              type="number"
              step="0.0001"
              value={formData.lower_calorific_value_mj_kg}
              onChange={(e) => updateField('lower_calorific_value_mj_kg', e.target.value)}
              className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary"
              placeholder="Lower Calorific Value"
            />
          </div>
          
          <div>
            <label className="block text-sm text-text-secondary mb-2">Carbon %</label>
            <input
              type="number"
              step="0.01"
              value={formData.carbon_content_pct}
              onChange={(e) => updateField('carbon_content_pct', e.target.value)}
              className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary"
            />
          </div>
        </div>
      </div>
      
      {/* Financial */}
      <div className="border border-subtle rounded-lg p-4 space-y-4">
        <h3 className="font-semibold text-text-primary">💰 Financial</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-text-secondary mb-2">Unit Price (USD/MT)</label>
            <input
              type="number"
              step="0.01"
              value={formData.unit_price_usd_per_mt}
              onChange={(e) => updateField('unit_price_usd_per_mt', e.target.value)}
              className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm text-text-secondary mb-2">Total Cost (USD)</label>
            <input
              type="number"
              step="0.01"
              value={formData.total_cost_usd}
              onChange={(e) => updateField('total_cost_usd', e.target.value)}
              className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary"
              readOnly
            />
          </div>
          
          <div>
            <label className="block text-sm text-text-secondary mb-2">Quality Status</label>
            <select
              value={formData.quality_acceptance_status}
              onChange={(e) => updateField('quality_acceptance_status', e.target.value)}
              className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary"
            >
              <option value="PENDING">Pending</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="DISPUTED">Disputed</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* ROB */}
      <div className="border border-subtle rounded-lg p-4 space-y-4">
        <h3 className="font-semibold text-text-primary">📊 Remain On Board (ROB)</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-text-secondary mb-2">ROB Before (MT)</label>
            <input
              type="number"
              step="0.001"
              value={formData.rob_before_mt}
              onChange={(e) => updateField('rob_before_mt', e.target.value)}
              className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm text-text-secondary mb-2">ROB After (MT)</label>
            <input
              type="number"
              step="0.001"
              value={formData.rob_after_mt}
              onChange={(e) => updateField('rob_after_mt', e.target.value)}
              className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="sample_taken"
            checked={formData.sample_taken}
            onChange={(e) => updateField('sample_taken', e.target.checked)}
            className="w-4 h-4 text-primary focus:ring-primary border-subtle rounded"
          />
          <label htmlFor="sample_taken" className="text-sm text-text-primary">
            Fuel sample taken for lab testing
          </label>
        </div>
      </div>
      
      {/* Error/Success Messages */}
      {error && (
        <div className="p-3 bg-error/10 border border-error rounded-lg">
          <p className="text-error text-sm">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="p-3 bg-success/10 border border-success rounded-lg">
          <p className="text-success text-sm">✅ Bunker report submitted successfully!</p>
        </div>
      )}
      
      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || !formData.ship_id || !formData.supplier_name}
        className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
          !isSubmitting && formData.ship_id && formData.supplier_name
            ? 'bg-primary text-white hover:bg-primary/80'
            : 'bg-subtle text-text-muted cursor-not-allowed'
        }`}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Bunker Report'}
      </button>
    </form>
  );
};

export default BunkerReportForm;

