import React, { useState } from 'react';
import { UserRole } from '../types/user';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'CREW',
    position: '',
    rank: '',
    ship_id: '',
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8080/auth/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || 'mock-token'}`
        },
        body: JSON.stringify({
          ...formData,
          organization_id: '00000000-0000-0000-0000-000000000001',
          password_hash: btoa(formData.password) // Simple encoding for demo
        })
      });

      if (response.ok) {
        onSuccess();
        onClose();
        setFormData({
          email: '',
          password: '',
          first_name: '',
          last_name: '',
          role: 'CREW',
          position: '',
          rank: '',
          ship_id: '',
          is_active: true
        });
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to create user');
      }
    } catch (err) {
      setError('Network error: Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card border border-subtle rounded-lg p-6 w-full max-w-md relative">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-text-primary">Add New User</h2>
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
            <label className="block text-text-secondary text-sm mb-1">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 bg-background border border-subtle rounded-lg text-text-primary"
            />
          </div>

          <div>
            <label className="block text-text-secondary text-sm mb-1">Password</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 bg-background border border-subtle rounded-lg text-text-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-text-secondary text-sm mb-1">First Name</label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-subtle rounded-lg text-text-primary"
              />
            </div>
            <div>
              <label className="block text-text-secondary text-sm mb-1">Last Name</label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-subtle rounded-lg text-text-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-text-secondary text-sm mb-1">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 bg-background border border-subtle rounded-lg text-text-primary"
            >
              <option value="CREW">Crew Member</option>
              <option value="OFFICER">Officer</option>
              <option value="ENGINEER">Engineer</option>
              <option value="CAPTAIN">Captain</option>
              <option value="CHIEF_ENGINEER">Chief Engineer</option>
              <option value="MANAGER">Manager</option>
              <option value="COMPLIANCE_OFFICER">Compliance Officer</option>
              <option value="TRADER">Trader</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>

          <div>
            <label className="block text-text-secondary text-sm mb-1">Position</label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className="w-full px-3 py-2 bg-background border border-subtle rounded-lg text-text-primary"
            />
          </div>

          <div className="flex space-x-3">
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
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;

