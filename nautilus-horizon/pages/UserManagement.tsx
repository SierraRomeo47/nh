import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { UserRole, Permission, ROLE_PERMISSIONS } from '../types/user';
import { UserPosition } from '../contexts/UserContext';

interface BackendUser {
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
  last_login_at: string | null;
  created_at: string;
  organization_id: string;
}

interface UserStats {
  total_users: number;
  active_users: number;
  online_now: number;
  new_this_month: number;
  role_distribution: Record<string, number>;
}

const API_BASE_URL = 'http://localhost:8080/auth/api';

const UserManagement: React.FC = () => {
  const { user: currentUser } = useUser();
  const [users, setUsers] = useState<BackendUser[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<BackendUser | null>(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('ALL');

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: UserRole.CREW,
    position: '',
    rank: '',
    isActive: true,
  });

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/users`, {
        credentials: 'include', // K8s-ready: Cookie-based auth (JWT in HTTP-only cookies)
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || 'mock-token'}` // Fallback for demo mode
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.data || []);
      } else {
        console.error('Failed to fetch users:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/stats`, {
        credentials: 'include', // K8s-ready: Cookie-based auth (JWT in HTTP-only cookies)
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || 'mock-token'}` // Fallback for demo mode
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      } else {
        console.error('Failed to fetch stats:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleCreateUser = () => {
    setModalMode('create');
    setFormData({
      email: '',
      firstName: '',
      lastName: '',
      role: UserRole.CREW,
      position: '',
      rank: '',
      isActive: true,
    });
    setShowModal(true);
  };

  const handleEditUser = (user: BackendUser) => {
    setModalMode('edit');
    setSelectedUser(user);
    setFormData({
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role as UserRole,
      position: user.position,
      rank: user.rank,
      isActive: user.is_active,
    });
    setShowModal(true);
  };

  const handleSaveUser = async () => {
    try {
      const userData = {
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        role: formData.role,
        position: formData.position,
        rank: formData.rank,
        is_active: formData.isActive,
        organization_id: currentUser?.organizationId || '00000000-0000-0000-0000-000000000001',
      };

      if (modalMode === 'create') {
        const response = await fetch(`${API_BASE_URL}/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken') || 'mock-token'}`
          },
          body: JSON.stringify(userData)
        });

        if (!response.ok) {
          const error = await response.json();
          alert(`Failed to create user: ${error.message}`);
          return;
        }

        alert('User created successfully!');
      } else {
        const response = await fetch(`${API_BASE_URL}/users/${selectedUser?.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken') || 'mock-token'}`
          },
          body: JSON.stringify(userData)
        });

        if (!response.ok) {
          const error = await response.json();
          if (error.code === 'FORBIDDEN') {
            alert(`⚠️ Protection Active:\n\n${error.message}`);
            return;
          }
          alert(`Failed to update user: ${error.message}`);
          return;
        }

        alert('User updated successfully!');
      }

      setShowModal(false);
      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error('Error saving user:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string, userRole: string) => {
    const adminCount = users.filter(u => u.role === 'ADMIN' && u.is_active).length;
    
    if (userRole === 'ADMIN' && adminCount <= 1) {
      alert('⚠️ Last Admin Protection\n\nCannot delete the last administrator. At least one admin must exist to manage the system.');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${userName}?\n\nThis will deactivate their account.`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || 'mock-token'}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Failed to delete user: ${error.message}`);
        return;
      }

      alert('User deleted successfully!');
      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const handleExportUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/export`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || 'mock-token'}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nautilus-users-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        alert('Users exported successfully!');
      }
    } catch (error) {
      console.error('Error exporting users:', error);
      alert('Failed to export users.');
    }
  };

  const handleViewPermissions = (user: BackendUser) => {
    setSelectedUser(user);
    setShowPermissionsModal(true);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
  };

  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      'CREW': 'Crew Member',
      'OFFICER': 'Deck Officer',
      'ENGINEER': 'Marine Engineer',
      'CAPTAIN': 'Captain',
      'CHIEF_ENGINEER': 'Chief Engineer',
      'MANAGER': 'Fleet Manager',
      'COMPLIANCE_OFFICER': 'Compliance Manager',
      'TRADER': 'Emissions Trader',
      'TECHNICAL_SUPERINTENDENT': 'Tech Superintendent',
      'OPERATIONS_SUPERINTENDENT': 'Ops Superintendent',
      'PORT_CAPTAIN': 'Port Captain',
      'FLEET_SUPERINTENDENT': 'Fleet Superintendent',
      'INSURER': 'Maritime Insurer',
      'MTO': 'Multimodal Transport Operator',
      'ADMIN': 'Administrator',
      'GUEST': 'Guest'
    };
    return roleMap[role] || role;
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'MANAGER': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'CAPTAIN': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'TRADER': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'INSURER': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'MTO': return 'bg-teal-500/20 text-teal-400 border-teal-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getOnlineStatus = (lastLogin: string | null) => {
    if (!lastLogin) return 'offline';
    const loginTime = new Date(lastLogin);
    const now = new Date();
    const diffMinutes = (now.getTime() - loginTime.getTime()) / 1000 / 60;
    return diffMinutes < 15 ? 'online' : diffMinutes < 60 ? 'away' : 'offline';
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = searchTerm === '' || 
      u.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'ALL' || u.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  const adminCount = users.filter(u => u.role === 'ADMIN' && u.is_active).length;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
              User Management
            </h1>
            <p className="text-[var(--text-muted)]">
              Manage user accounts, roles, and permissions across the organization
            </p>
            {adminCount <= 1 && (
              <div className="mt-3 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-red-400 text-sm">
                  ⚠️ <strong>Last Admin Protection Active:</strong> You are the only administrator. You cannot change your role or delete your account.
                </p>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportUsers}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              📥 Export Backup
            </button>
            <button
              onClick={handleCreateUser}
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
            >
              + Add User
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[var(--text-muted)] text-sm mb-1">Total Users</p>
                <p className="text-3xl font-bold text-[var(--text-primary)]">
                  {stats?.total_users || users.length}
                </p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[var(--text-muted)] text-sm mb-1">Active Users</p>
                <p className="text-3xl font-bold text-green-400">
                  {stats?.active_users || users.filter(u => u.is_active).length}
                </p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[var(--text-muted)] text-sm mb-1">Online Now</p>
                <p className="text-3xl font-bold text-blue-400">
                  {stats?.online_now || users.filter(u => getOnlineStatus(u.last_login_at) === 'online').length}
                </p>
              </div>
              <div className="text-4xl">🟢</div>
            </div>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[var(--text-muted)] text-sm mb-1">Administrators</p>
                <p className="text-3xl font-bold text-red-400">
                  {adminCount}
                </p>
              </div>
              <div className="text-4xl">🛡️</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Search Users
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Filter by Role
              </label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-orange-500"
              >
                <option value="ALL">All Roles</option>
                {Object.values(UserRole).map(role => (
                  <option key={role} value={role}>{getRoleDisplayName(role)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--bg-primary)] border-b border-[var(--border-color)]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                    Permissions
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-[var(--text-muted)]">
                      No users found matching your criteria
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const onlineStatus = getOnlineStatus(u.last_login_at);
                    const isLastAdmin = u.role === 'ADMIN' && adminCount <= 1;
                    const permissions = ROLE_PERMISSIONS[u.role as UserRole] || [];

                    return (
                      <tr key={u.id} className="hover:bg-[var(--bg-primary)] transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {getInitials(u.first_name, u.last_name)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-[var(--text-primary)]">
                                {u.first_name} {u.last_name}
                              </div>
                              <div className="text-sm text-[var(--text-muted)]">
                                {u.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getRoleBadgeColor(u.role)}`}>
                            {getRoleDisplayName(u.role)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
                          {u.position || u.rank || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              onlineStatus === 'online' ? 'bg-green-400' :
                              onlineStatus === 'away' ? 'bg-yellow-400' :
                              'bg-gray-500'
                            }`}></div>
                            <span className="text-sm text-[var(--text-secondary)] capitalize">
                              {onlineStatus}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleViewPermissions(u)}
                            className="text-sm text-blue-400 hover:text-blue-300 underline"
                          >
                            View ({permissions.length})
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEditUser(u)}
                            className="text-blue-400 hover:text-blue-300 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id, `${u.first_name} ${u.last_name}`, u.role)}
                            disabled={isLastAdmin}
                            className={`${isLastAdmin ? 'text-gray-600 cursor-not-allowed' : 'text-red-400 hover:text-red-300'}`}
                            title={isLastAdmin ? 'Cannot delete the last administrator' : 'Delete user'}
                          >
                            {isLastAdmin ? '🔒 Protected' : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Form Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--bg-card)] rounded-lg border border-[var(--border-color)] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
                {modalMode === 'create' ? 'Create New User' : 'Edit User'}
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-orange-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Role *
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}
                      disabled={modalMode === 'edit' && selectedUser?.role === 'ADMIN' && adminCount <= 1}
                      className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {Object.values(UserRole).filter(r => r !== UserRole.GUEST).map(role => (
                        <option key={role} value={role}>{getRoleDisplayName(role)}</option>
                      ))}
                    </select>
                    {modalMode === 'edit' && selectedUser?.role === 'ADMIN' && adminCount <= 1 && (
                      <p className="text-xs text-red-400 mt-1">🔒 Cannot change role - last admin</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Position
                    </label>
                    <select
                      value={formData.position}
                      onChange={(e) => setFormData({...formData, position: e.target.value})}
                      className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-orange-500"
                    >
                      <option value="">Select position...</option>
                      {Object.values(UserPosition).map(position => (
                        <option key={position} value={position}>{position}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Rank / License
                  </label>
                  <input
                    type="text"
                    value={formData.rank}
                    onChange={(e) => setFormData({...formData, rank: e.target.value})}
                    placeholder="e.g., Captain, Chief Engineer"
                    className="w-full px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="w-4 h-4 text-orange-500 border-[var(--border-color)] rounded focus:ring-orange-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-[var(--text-primary)]">
                    Active Account
                  </label>
                </div>

                {/* Permission Preview */}
                <div className="mt-6 p-4 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)]">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
                    Role Permissions ({(ROLE_PERMISSIONS[formData.role] || []).length})
                  </h3>
                  <div className="max-h-32 overflow-y-auto">
                    <div className="flex flex-wrap gap-2">
                      {(ROLE_PERMISSIONS[formData.role] || []).slice(0, 12).map((perm: Permission) => (
                        <span key={perm} className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                          {perm.replace(/_/g, ' ')}
                        </span>
                      ))}
                      {(ROLE_PERMISSIONS[formData.role] || []).length > 12 && (
                        <span className="text-xs px-2 py-1 text-[var(--text-muted)]">
                          +{(ROLE_PERMISSIONS[formData.role] || []).length - 12} more...
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[var(--border-color)]">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-[var(--border-color)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-primary)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveUser}
                  disabled={!formData.email || !formData.firstName || !formData.lastName}
                  className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {modalMode === 'create' ? 'Create User' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Permissions Modal */}
        {showPermissionsModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--bg-card)] rounded-lg border border-[var(--border-color)] max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                    User Permissions
                  </h2>
                  <p className="text-[var(--text-muted)] mt-1">
                    {selectedUser.first_name} {selectedUser.last_name} - {getRoleDisplayName(selectedUser.role)}
                  </p>
                </div>
                <button
                  onClick={() => setShowPermissionsModal(false)}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {Object.entries(
                  (ROLE_PERMISSIONS[selectedUser.role as UserRole] || []).reduce((acc, perm) => {
                    const category = perm.split('_')[0];
                    if (!acc[category]) acc[category] = [];
                    acc[category].push(perm);
                    return acc;
                  }, {} as Record<string, Permission[]>)
                ).map(([category, perms]) => (
                  <div key={category} className="p-4 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)]">
                    <h3 className="font-semibold text-[var(--text-primary)] mb-3 capitalize">
                      {category} Permissions ({perms.length})
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {perms.map((perm: Permission) => (
                        <div key={perm} className="flex items-center gap-2">
                          <span className="text-green-400">✓</span>
                          <span className="text-sm text-[var(--text-secondary)]">
                            {perm.replace(/_/g, ' ').toLowerCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-sm text-blue-400">
                  ℹ️ Permissions are determined by role. To change permissions, update the user's role.
                </p>
              </div>

              <div className="flex justify-end mt-6 pt-4 border-t border-[var(--border-color)]">
                <button
                  onClick={() => setShowPermissionsModal(false)}
                  className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
