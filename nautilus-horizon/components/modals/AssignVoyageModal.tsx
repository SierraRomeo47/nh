import React, { useState, useEffect } from 'react';

interface Vessel {
  id: string;
  imo_number: string;
  name: string;
  ship_type: string;
}

interface AssignVoyageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vessels: Vessel[];
}

const VOYAGE_TYPES = ['COMMERCIAL', 'BALLAST', 'TRAINING', 'TESTING', 'REPOSITIONING'];
const CHARTER_TYPES = ['SPOT_VOYAGE', 'TIME', 'BAREBOAT', 'NONE'];

const AssignVoyageModal: React.FC<AssignVoyageModalProps> = ({ isOpen, onClose, onSuccess, vessels }) => {
  const [formData, setFormData] = useState({
    ship_id: '',
    voyage_id: '',
    voyage_type: 'COMMERCIAL',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    start_port: '',
    end_port: '',
    charter_type: 'SPOT_VOYAGE',
    status: 'ACTIVE'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Generate a unique voyage ID
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000);
      setFormData(prev => ({
        ...prev,
        voyage_id: `V-${timestamp}-${random}`
      }));
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.ship_id || !formData.start_date || !formData.start_port || !formData.end_port) {
      setError('Ship, start date, start port, and end port are required');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/voyages/api/voyages', {
        method: 'POST',
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
        // Reset form
        setFormData({
          ship_id: '',
          voyage_id: '',
          voyage_type: 'COMMERCIAL',
          start_date: new Date().toISOString().split('T')[0],
          end_date: '',
          start_port: '',
          end_port: '',
          charter_type: 'SPOT_VOYAGE',
          status: 'ACTIVE'
        });
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to create voyage');
      }
    } catch (err) {
      setError('Network error: Failed to create voyage');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card border border-subtle rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-text-primary">Assign New Voyage</h2>
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
          <div>
            <label className="block text-text-secondary text-sm mb-1">
              Select Vessel <span className="text-error">*</span>
            </label>
            <select
              required
              value={formData.ship_id}
              onChange={(e) => setFormData({ ...formData, ship_id: e.target.value })}
              className="w-full px-3 py-2 bg-background border border-subtle rounded-lg text-text-primary"
            >
              <option value="">-- Select a vessel --</option>
              {vessels.map(vessel => (
                <option key={vessel.id} value={vessel.id}>
                  {vessel.name} (IMO: {vessel.imo_number}) - {vessel.ship_type}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-text-secondary text-sm mb-1">Voyage ID</label>
              <input
                type="text"
                value={formData.voyage_id}
                onChange={(e) => setFormData({ ...formData, voyage_id: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-subtle rounded-lg text-text-primary"
                placeholder="Auto-generated"
              />
            </div>
            
            <div>
              <label className="block text-text-secondary text-sm mb-1">Voyage Type</label>
              <select
                value={formData.voyage_type}
                onChange={(e) => setFormData({ ...formData, voyage_type: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-subtle rounded-lg text-text-primary"
              >
                {VOYAGE_TYPES.map(type => (
                  <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-text-secondary text-sm mb-1">
                Start Date <span className="text-error">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-subtle rounded-lg text-text-primary"
              />
            </div>
            
            <div>
              <label className="block text-text-secondary text-sm mb-1">End Date</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                min={formData.start_date}
                className="w-full px-3 py-2 bg-background border border-subtle rounded-lg text-text-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-text-secondary text-sm mb-1">
                Start Port <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.start_port}
                onChange={(e) => setFormData({ ...formData, start_port: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-subtle rounded-lg text-text-primary"
                placeholder="e.g., Rotterdam"
              />
            </div>
            
            <div>
              <label className="block text-text-secondary text-sm mb-1">
                End Port <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.end_port}
                onChange={(e) => setFormData({ ...formData, end_port: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-subtle rounded-lg text-text-primary"
                placeholder="e.g., Singapore"
              />
            </div>
          </div>

          <div>
            <label className="block text-text-secondary text-sm mb-1">Charter Type</label>
            <select
              value={formData.charter_type}
              onChange={(e) => setFormData({ ...formData, charter_type: e.target.value })}
              className="w-full px-3 py-2 bg-background border border-subtle rounded-lg text-text-primary"
            >
              {CHARTER_TYPES.map(type => (
                <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
              ))}
            </select>
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
              {loading ? 'Creating...' : 'Create Voyage'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignVoyageModal;

