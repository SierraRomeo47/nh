import React, { useState, useEffect } from 'react';

interface Vessel {
  id: string;
  imo_number: string;
  name: string;
  ship_type: string;
  gross_tonnage: number;
  deadweight_tonnage: number;
  engine_power_kw: number;
  flag_state: string;
  year_built: number;
  classification_society: string;
}

interface VesselModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vessel?: Vessel | null;
}

const SHIP_TYPES = [
  'CONTAINER',
  'BULK_CARRIER',
  'TANKER',
  'CAR_CARRIER',
  'GENERAL_CARGO',
  'CEMENT_CARRIER',
  'LNG_CARRIER',
  'LPG_CARRIER',
  'CRUISE',
  'RO_RO',
  'OTHERS'
];

const FLAG_STATES = [
  'Panama',
  'Liberia',
  'Marshall Islands',
  'Malta',
  'Cyprus',
  'Singapore',
  'Hong Kong',
  'Greece',
  'Bahamas',
  'United Kingdom',
  'Norway',
  'Germany'
];

const CLASSIFICATION_SOCIETIES = [
  'ABS',
  'BV',
  'CCS',
  'DNV',
  'GL',
  'KR',
  'LR',
  'NK',
  'RINA',
  'RS'
];

const VesselModal: React.FC<VesselModalProps> = ({ isOpen, onClose, onSuccess, vessel }) => {
  const isEditMode = !!vessel;
  const [formData, setFormData] = useState({
    imo_number: '',
    name: '',
    ship_type: 'CONTAINER',
    gross_tonnage: 0,
    deadweight_tonnage: 0,
    engine_power_kw: 0,
    flag_state: 'Panama',
    year_built: new Date().getFullYear(),
    classification_society: 'DNV'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (vessel) {
      setFormData({
        imo_number: vessel.imo_number || '',
        name: vessel.name || '',
        ship_type: vessel.ship_type || 'CONTAINER',
        gross_tonnage: vessel.gross_tonnage || 0,
        deadweight_tonnage: vessel.deadweight_tonnage || 0,
        engine_power_kw: vessel.engine_power_kw || 0,
        flag_state: vessel.flag_state || 'Panama',
        year_built: vessel.year_built || new Date().getFullYear(),
        classification_society: vessel.classification_society || 'DNV'
      });
    } else {
      setFormData({
        imo_number: '',
        name: '',
        ship_type: 'CONTAINER',
        gross_tonnage: 0,
        deadweight_tonnage: 0,
        engine_power_kw: 0,
        flag_state: 'Panama',
        year_built: new Date().getFullYear(),
        classification_society: 'DNV'
      });
    }
    setError('');
  }, [vessel, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!formData.imo_number || !formData.name) {
      setError('IMO number and vessel name are required');
      setLoading(false);
      return;
    }

    // Validate IMO number format (should be 7 digits)
    if (!/^\d{7}$/.test(formData.imo_number)) {
      setError('IMO number must be exactly 7 digits');
      setLoading(false);
      return;
    }

    try {
      const url = isEditMode 
        ? `http://localhost:8080/vessels/api/vessels/${vessel.id}`
        : 'http://localhost:8080/vessels/api/vessels';
      
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || 'mock-token'}`
        },
        body: JSON.stringify({
          ...formData,
          organization_id: '00000000-0000-0000-0000-000000000001'
        })
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await response.json();
        setError(data.message || `Failed to ${isEditMode ? 'update' : 'create'} vessel`);
      }
    } catch (err) {
      setError(`Network error: Failed to ${isEditMode ? 'update' : 'create'} vessel`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card border border-subtle rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-text-primary">
            {isEditMode ? 'Edit Vessel' : 'Create New Vessel'}
          </h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors p-2 hover:bg-subtle rounded-lg"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-error/20 border border-error rounded-lg text-error text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-text-secondary text-sm mb-1">
                IMO Number <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                pattern="\d{7}"
                maxLength={7}
                value={formData.imo_number}
                onChange={(e) => setFormData({ ...formData, imo_number: e.target.value.replace(/\D/g, '') })}
                className="w-full px-3 py-2 bg-background border border-subtle rounded-lg text-text-primary"
                placeholder="1234567"
              />
              <p className="text-xs text-text-secondary mt-1">7-digit IMO number</p>
            </div>
            
            <div>
              <label className="block text-text-secondary text-sm mb-1">
                Vessel Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-subtle rounded-lg text-text-primary"
                placeholder="Vessel Name"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-text-secondary text-sm mb-1">Ship Type</label>
              <select
                value={formData.ship_type}
                onChange={(e) => setFormData({ ...formData, ship_type: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-subtle rounded-lg text-text-primary"
              >
                {SHIP_TYPES.map(type => (
                  <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-text-secondary text-sm mb-1">Flag State</label>
              <select
                value={formData.flag_state}
                onChange={(e) => setFormData({ ...formData, flag_state: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-subtle rounded-lg text-text-primary"
              >
                {FLAG_STATES.map(flag => (
                  <option key={flag} value={flag}>{flag}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-text-secondary text-sm mb-1">Gross Tonnage</label>
              <input
                type="number"
                min="0"
                value={formData.gross_tonnage || ''}
                onChange={(e) => setFormData({ ...formData, gross_tonnage: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-background border border-subtle rounded-lg text-text-primary"
              />
            </div>
            
            <div>
              <label className="block text-text-secondary text-sm mb-1">Deadweight Tonnage</label>
              <input
                type="number"
                min="0"
                value={formData.deadweight_tonnage || ''}
                onChange={(e) => setFormData({ ...formData, deadweight_tonnage: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-background border border-subtle rounded-lg text-text-primary"
              />
            </div>
            
            <div>
              <label className="block text-text-secondary text-sm mb-1">Engine Power (kW)</label>
              <input
                type="number"
                min="0"
                value={formData.engine_power_kw || ''}
                onChange={(e) => setFormData({ ...formData, engine_power_kw: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-background border border-subtle rounded-lg text-text-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-text-secondary text-sm mb-1">Year Built</label>
              <input
                type="number"
                min="1900"
                max={new Date().getFullYear() + 1}
                value={formData.year_built || ''}
                onChange={(e) => setFormData({ ...formData, year_built: parseInt(e.target.value) || new Date().getFullYear() })}
                className="w-full px-3 py-2 bg-background border border-subtle rounded-lg text-text-primary"
              />
            </div>
            
            <div>
              <label className="block text-text-secondary text-sm mb-1">Classification Society</label>
              <select
                value={formData.classification_society}
                onChange={(e) => setFormData({ ...formData, classification_society: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-subtle rounded-lg text-text-primary"
              >
                {CLASSIFICATION_SOCIETIES.map(society => (
                  <option key={society} value={society}>{society}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-card border border-subtle text-text-primary rounded-lg hover:bg-subtle transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50"
            >
              {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Vessel' : 'Create Vessel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VesselModal;

