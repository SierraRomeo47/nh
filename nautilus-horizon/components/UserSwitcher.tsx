// User Switcher Component for Testing Different Roles

import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { UserRole } from '../contexts/UserContext';

interface BackendUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  position: string;
  ship_id: string | null;
  ship_name: string | null;
  is_active: boolean;
}

const UserSwitcher: React.FC = () => {
  const { user, switchUserRole, switchToUser, logout } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [backendUsers, setBackendUsers] = useState<BackendUser[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Re-fetch latest users whenever the menu is opened
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/auth/api/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || 'mock-token'}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setBackendUsers(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchUser = async (selectedUser: BackendUser) => {
    try {
      setIsOpen(false);
      
      // Map backend role to UserRole enum
      const mappedRole = mapBackendRoleToUserRole(selectedUser.role || selectedUser.position);
      
      // Prefer identity-based switch for consistency of names/avatar
      switchToUser({
        id: selectedUser.id,
        email: selectedUser.email,
        firstName: selectedUser.first_name,
        lastName: selectedUser.last_name,
        role: mappedRole,
        shipId: selectedUser.ship_id || undefined,
        position: selectedUser.position || undefined,
        isActive: selectedUser.is_active,
      });
      
      // Navigate to dashboard to ensure clean state
      window.location.hash = '#/dashboard';
    } catch (error) {
      console.error('Error switching user:', error);
      // Show error message to user
      alert('Error switching user. Please try again.');
    }
  };

  const mapBackendRoleToUserRole = (backendRole: string): UserRole => {
    const roleMap: Record<string, UserRole> = {
      'CREW': UserRole.CREW,
      'OFFICER': UserRole.OFFICER,
      'ENGINEER': UserRole.ENGINEER,
      'CAPTAIN': UserRole.CAPTAIN,
      'CHIEF_ENGINEER': UserRole.CHIEF_ENGINEER,
      'MANAGER': UserRole.MANAGER,
      'COMPLIANCE_OFFICER': UserRole.COMPLIANCE_OFFICER,
      'TRADER': UserRole.TRADER,
      'TECHNICAL_SUPERINTENDENT': UserRole.TECHNICAL_SUPERINTENDENT,
      'OPERATIONS_SUPERINTENDENT': UserRole.OPERATIONS_SUPERINTENDENT,
      'ADMIN': UserRole.ADMIN
    };
    // Abbreviation mappings commonly used by backend
    const alt: Record<string, UserRole> = {
      'C/E': UserRole.CHIEF_ENGINEER,
      '2/E': UserRole.ENGINEER,
      '3/E': UserRole.ENGINEER,
      '2/O': UserRole.OFFICER,
      '3/O': UserRole.OFFICER,
      'A/B': UserRole.CREW,
      'O/S': UserRole.CREW,
      'FLEET MANAGER': UserRole.MANAGER,
      'COMPLIANCE MANAGER': UserRole.COMPLIANCE_OFFICER,
      'EMISSIONS TRADER': UserRole.TRADER,
      'SECOND ENGINEER': UserRole.ENGINEER,
      'SECOND OFFICER': UserRole.OFFICER,
      'SYSTEM ADMINISTRATOR': UserRole.ADMIN,
      'ADMINISTRATOR': UserRole.ADMIN,
      'SYSTEM ADMIN': UserRole.ADMIN,
      'SYSADMIN': UserRole.ADMIN,
      'PRODUCT MANAGER': UserRole.ADMIN,
    };
    const key = (backendRole || '').toUpperCase();
    return roleMap[key] || alt[key] || UserRole.CREW;
  };

  const getRoleDisplayName = (role: string) => {
    const roleDisplayMap: Record<string, string> = {
      'CREW': 'Crew Member',
      'OFFICER': 'Deck Officer',
      'ENGINEER': 'Marine Engineer',
      'CAPTAIN': 'Captain',
      'CHIEF_ENGINEER': 'Chief Engineer',
      'MANAGER': 'Fleet Manager',
      'COMPLIANCE_OFFICER': 'Compliance Manager',
      'TRADER': 'Emissions Trader',
      'TECHNICAL_SUPERINTENDENT': 'Technical Superintendent',
      'OPERATIONS_SUPERINTENDENT': 'Operations Superintendent',
      'PORT_CAPTAIN': 'Port Captain',
      'FLEET_SUPERINTENDENT': 'Fleet Superintendent',
      'INSURER': 'Maritime Insurer',
      'MTO': 'Multimodal Transport Operator',
      'ADMIN': 'Administrator',
      'A/B': 'Able Seaman',
      'O/S': 'Ordinary Seaman',
      'A/ENG': 'Assistant Engineer',
      '3/O': 'Third Officer',
      '2/O': 'Second Officer',
      'C/E': 'Chief Engineer'
    };
    
    return roleDisplayMap[role] || role || 'Marine Professional';
  };

  if (!user) return null;

  const isAdmin = user.role === UserRole.ADMIN;

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--bg-card)';
        }}
      >
        <div style={{ 
          width: '24px', 
          height: '24px', 
          borderRadius: '50%',
          backgroundColor: '#FF6A00',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
        </div>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>
            {user.firstName} {user.lastName}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {getRoleDisplayName(user.role)}
          </div>
        </div>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>▼</span>
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: '0',
          marginTop: '8px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '16px',
          minWidth: isAdmin ? '320px' : '240px',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          {isAdmin ? (
            <>
              <h3 style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                color: 'var(--text-primary)', 
                marginBottom: '12px' 
              }}>
                Switch User Role
              </h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{backendUsers.filter(u => u.is_active).length} users</span>
                <button onClick={fetchUsers} style={{ fontSize: '12px', color: '#FF6A00' }}>Refresh</button>
              </div>
            </>
          ) : (
            <h3 style={{ 
              fontSize: '14px', 
              fontWeight: '600', 
              color: 'var(--text-primary)', 
              marginBottom: '12px' 
            }}>
              User Menu
            </h3>
          )}
          {isAdmin && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {loading ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Loading users...
                </div>
              ) : backendUsers.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No users found
                </div>
              ) : (
                backendUsers.filter(u => u.is_active).map((backendUser) => {
                  // Compare by email since we don't have matching IDs between context and backend
                  const isCurrentUser = user?.email === backendUser.email;
                  return (
                    <button
                      key={backendUser.id}
                      onClick={() => handleSwitchUser(backendUser)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        width: '100%',
                        padding: '12px',
                        backgroundColor: isCurrentUser ? '#FF6A0020' : 'transparent',
                        border: isCurrentUser ? '1px solid #FF6A0030' : '1px solid transparent',
                        borderRadius: '8px',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        fontSize: '14px',
                        textAlign: 'left',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!isCurrentUser) {
                          e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isCurrentUser) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '50%',
                        backgroundColor: '#FF6A00',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {backendUser.first_name?.charAt(0)}{backendUser.last_name?.charAt(0)}
                      </div>
                      <div style={{ textAlign: 'left', flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>
                          {backendUser.first_name} {backendUser.last_name}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {getRoleDisplayName(backendUser.position || backendUser.role)}
                        </div>
                      </div>
                      {isCurrentUser && (
                        <div style={{ 
                          width: '8px', 
                          height: '8px', 
                          backgroundColor: '#FF6A00', 
                          borderRadius: '50%' 
                        }}></div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          )}
          <div style={{ 
            marginTop: '16px', 
            paddingTop: '12px', 
            borderTop: '1px solid var(--border-color)' 
          }}>
            <button
              onClick={() => {
                setIsOpen(false);
                logout();
                window.location.hash = '#/login';
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                padding: '10px',
                backgroundColor: '#DC2626',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#B91C1C';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#DC2626';
              }}
            >
              <span style={{ fontSize: '16px' }}>🚪</span>
              Logout
            </button>
          </div>
          {isAdmin && (
            <div style={{ 
              marginTop: '12px', 
              paddingTop: '12px', 
              borderTop: '1px solid var(--border-color)' 
            }}>
              <p style={{ 
                fontSize: '12px', 
                color: 'var(--text-muted)' 
              }}>
                This switcher is for demonstration purposes. In production, users would log in with their actual credentials.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserSwitcher;
