import React, { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  ship_id: string | null;
  ship_name: string | null;
  position: string;
  rank: string;
  is_active: boolean;
  custom_position?: string;
}

interface Ship {
  id: string;
  name: string;
  imo_number: string;
}

interface Fleet {
  id: string;
  name: string;
  description: string;
  vessels?: Ship[];
}

interface UserAssignments {
  vessels: Ship[];
  fleets: Fleet[];
}

interface ManageRolesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ManageRolesModal: React.FC<ManageRolesModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [ships, setShips] = useState<Ship[]>([]);
  const [fleets, setFleets] = useState<Fleet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [selectedVessels, setSelectedVessels] = useState<string[]>([]);
  const [selectedFleets, setSelectedFleets] = useState<string[]>([]);
  const [userAssignments, setUserAssignments] = useState<Record<string, UserAssignments>>({});
  const [selectedPosition, setSelectedPosition] = useState<string>('');
  const [customPosition, setCustomPosition] = useState<string>('');
  const [fleetVessels, setFleetVessels] = useState<Record<string, Ship[]>>({});

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      fetchShips();
      fetchFleets();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8080/auth/api/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || 'mock-token'}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const fetchShips = async () => {
    try {
      const response = await fetch('http://localhost:8080/vessels/api/vessels', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || 'mock-token'}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setShips(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch ships:', err);
    }
  };

  const fetchFleets = async () => {
    try {
      const response = await fetch('http://localhost:8080/vessels/api/fleets', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || 'mock-token'}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const fleetsData = data.data || [];
        setFleets(fleetsData);
        
        // Fetch vessels for each fleet
        const vesselsByFleet: Record<string, Ship[]> = {};
        for (const fleet of fleetsData) {
          try {
            const vesselsResponse = await fetch(`http://localhost:8080/vessels/api/fleets/${fleet.id}/vessels`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken') || 'mock-token'}`
              }
            });
            if (vesselsResponse.ok) {
              const vesselsData = await vesselsResponse.json();
              vesselsByFleet[fleet.id] = vesselsData.data || [];
            }
          } catch (err) {
            console.error(`Failed to fetch vessels for fleet ${fleet.id}:`, err);
          }
        }
        setFleetVessels(vesselsByFleet);
      } else {
        console.error('Failed to fetch fleets:', response.status, response.statusText);
      }
    } catch (err) {
      console.error('Failed to fetch fleets:', err);
    }
  };

  const fetchUserAssignments = async (userId: string) => {
    try {
      const response = await fetch(`http://localhost:8080/auth/api/users/${userId}/assignments`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || 'mock-token'}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserAssignments(prev => ({ ...prev, [userId]: data.data }));
      }
    } catch (err) {
      console.error('Failed to fetch user assignments:', err);
    }
  };

  const handleEdit = async (user: User) => {
    setEditingUser(user.id);
    setEditForm({
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      ship_id: user.ship_id,
      position: user.position,
      email: user.email
    });
    
    // Set position selection
    if (user.position && !['CREW', 'OFFICER', 'ENGINEER', 'CAPTAIN', 'CHIEF_ENGINEER', 'MANAGER', 'COMPLIANCE_OFFICER', 'TRADER', 'ADMIN'].includes(user.position)) {
      setSelectedPosition('OTHER');
      setCustomPosition(user.position);
    } else {
      setSelectedPosition(user.role);
      setCustomPosition('');
    }
    
    // Fetch current assignments
    await fetchUserAssignments(user.id);
    const assignments = userAssignments[user.id];
    if (assignments) {
      setSelectedVessels(assignments.vessels.map((v: Ship) => v.id));
      setSelectedFleets(assignments.fleets.map((f: Fleet) => f.id));
    }
  };

  const handleCancel = () => {
    setEditingUser(null);
    setEditForm({});
    setSelectedVessels([]);
    setSelectedFleets([]);
    setSelectedPosition('');
    setCustomPosition('');
  };

  const handleSave = async (userId: string) => {
    setLoading(true);
    setError('');

    try {
      // Determine the actual role/position to save
      const finalRole = selectedPosition === 'OTHER' ? customPosition : selectedPosition;
      
      // Update user basic info including email
      const updateData = {
        ...editForm,
        role: finalRole,
        position: finalRole
      };
      
      await fetch(`http://localhost:8080/auth/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || 'mock-token'}`
        },
        body: JSON.stringify(updateData)
      });

      // Update vessel assignments
      const vesselsResponse = await fetch(`http://localhost:8080/auth/api/users/${userId}/vessels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || 'mock-token'}`
        },
        body: JSON.stringify({ vessel_ids: selectedVessels })
      });

      if (!vesselsResponse.ok) {
        throw new Error('Failed to update vessel assignments');
      }

      // Update fleet assignments
      const fleetsResponse = await fetch(`http://localhost:8080/auth/api/users/${userId}/fleets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || 'mock-token'}`
        },
        body: JSON.stringify({ fleet_ids: selectedFleets })
      });

      if (!fleetsResponse.ok) {
        throw new Error('Failed to update fleet assignments');
      }

      onSuccess();
      setEditingUser(null);
      setEditForm({});
      setSelectedVessels([]);
      setSelectedFleets([]);
      setSelectedPosition('');
      setCustomPosition('');
      fetchUsers();
    } catch (err) {
      setError('Network error: Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:8080/auth/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || 'mock-token'}`
        },
        body: JSON.stringify({ is_active: !currentStatus })
      });

      if (response.ok) {
        onSuccess();
        fetchUsers();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to update user status');
      }
    } catch (err) {
      setError('Network error: Failed to update user status');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card border border-subtle rounded-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto relative">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-text-primary">Manage Users & Access</h2>
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

        <div className="space-y-4 mb-4">
          {users.map((user) => (
            <div key={user.id} className="p-4 bg-subtle rounded-lg">
              {editingUser === user.id ? (
                // Edit Mode
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-text-secondary text-sm mb-1">First Name</label>
                      <input
                        type="text"
                        value={editForm.first_name || ''}
                        onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                        className="w-full px-3 py-2 bg-background border border-subtle rounded-lg text-text-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-text-secondary text-sm mb-1">Last Name</label>
                      <input
                        type="text"
                        value={editForm.last_name || ''}
                        onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                        className="w-full px-3 py-2 bg-background border border-subtle rounded-lg text-text-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-text-secondary text-sm mb-1">Email</label>
                    <input
                      type="email"
                      value={editForm.email || ''}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-subtle rounded-lg text-text-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-text-secondary text-sm mb-1">Position</label>
                    <select
                      value={selectedPosition}
                      onChange={(e) => {
                        setSelectedPosition(e.target.value);
                        if (e.target.value !== 'OTHER') {
                          setCustomPosition('');
                        }
                      }}
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
                      <option value="OTHER">Other (Custom)</option>
                    </select>
                  </div>

                  {selectedPosition === 'OTHER' && (
                    <div>
                      <label className="block text-text-secondary text-sm mb-1">Custom Position Name</label>
                      <input
                        type="text"
                        value={customPosition}
                        onChange={(e) => setCustomPosition(e.target.value)}
                        placeholder="Enter custom position name"
                        className="w-full px-3 py-2 bg-background border border-subtle rounded-lg text-text-primary"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-text-secondary text-sm mb-1">Fleet Access (Priority - Multiple Selection)</label>
                    <div className="border border-subtle rounded-lg p-2 max-h-40 overflow-y-auto bg-background">
                      {fleets.map((fleet) => {
                        const fleetVesselCount = fleetVessels[fleet.id]?.length || 0;
                        return (
                          <label key={fleet.id} className="flex items-center space-x-2 p-2 hover:bg-subtle rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedFleets.includes(fleet.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedFleets([...selectedFleets, fleet.id]);
                                } else {
                                  setSelectedFleets(selectedFleets.filter(id => id !== fleet.id));
                                }
                              }}
                              className="rounded"
                            />
                            <div className="flex-1">
                              <span className="text-text-primary text-sm font-medium">{fleet.name}</span>
                              <div className="text-xs text-text-secondary">{fleet.description}</div>
                              <div className="text-xs text-primary mt-1">
                                {fleetVesselCount} vessel{fleetVesselCount !== 1 ? 's' : ''} in fleet
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                    <div className="text-xs text-text-secondary mt-1">
                      Selected: {selectedFleets.length} fleet(s) - Grants access to all vessels in selected fleets
                    </div>
                  </div>

                  <div>
                    <label className="block text-text-secondary text-sm mb-1">
                      Additional Vessel Access (Vessels NOT in selected fleets)
                    </label>
                    <div className="border border-subtle rounded-lg p-2 max-h-40 overflow-y-auto bg-background">
                      {(() => {
                        // Get vessels from selected fleets
                        const vesselsInSelectedFleets = new Set<string>();
                        selectedFleets.forEach(fleetId => {
                          fleetVessels[fleetId]?.forEach(vessel => {
                            vesselsInSelectedFleets.add(vessel.id);
                          });
                        });
                        
                        // Filter out vessels that are in selected fleets
                        const availableVessels = ships.filter(ship => !vesselsInSelectedFleets.has(ship.id));
                        
                        if (availableVessels.length === 0) {
                          return (
                            <div className="text-text-secondary text-sm p-4 text-center">
                              All vessels are covered by selected fleets
                            </div>
                          );
                        }
                        
                        return availableVessels.map((ship) => (
                          <label key={ship.id} className="flex items-center space-x-2 p-2 hover:bg-subtle rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedVessels.includes(ship.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedVessels([...selectedVessels, ship.id]);
                                } else {
                                  setSelectedVessels(selectedVessels.filter(id => id !== ship.id));
                                }
                              }}
                              className="rounded"
                            />
                            <span className="text-text-primary text-sm">{ship.name} ({ship.imo_number})</span>
                          </label>
                        ));
                      })()}
                    </div>
                    <div className="text-xs text-text-secondary mt-1">
                      Selected: {selectedVessels.length} additional vessel(s)
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSave(user.id)}
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-card border border-subtle text-text-primary rounded-lg hover:bg-subtle transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="font-medium text-text-primary">
                        {user.first_name} {user.last_name}
                      </div>
                      <div className={`px-2 py-1 rounded text-xs ${
                        user.is_active ? 'bg-success/20 text-success' : 'bg-error/20 text-error'
                      }`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                    <div className="text-sm text-text-secondary space-y-1">
                      <div>Position: <span className="text-text-primary">{user.role}</span></div>
                      {user.position && <div>Additional Info: <span className="text-text-primary">{user.position}</span></div>}
                      <div>
                        Single Vessel: <span className="text-text-primary">
                          {user.ship_name ? `${user.ship_name}` : 'None'}
                        </span>
                      </div>
                      <div>Email: <span className="text-text-primary">{user.email}</span></div>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleActive(user.id, user.is_active)}
                      disabled={loading}
                      className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                        user.is_active 
                          ? 'bg-warning/20 text-warning hover:bg-warning/30' 
                          : 'bg-success/20 text-success hover:bg-success/30'
                      }`}
                    >
                      {user.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ManageRolesModal;
