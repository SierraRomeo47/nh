// Complete working App with all features

import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

// User types
enum UserRole {
  CREW = 'CREW',
  OFFICER = 'OFFICER',
  ENGINEER = 'ENGINEER',
  MANAGER = 'MANAGER',
  COMPLIANCE_OFFICER = 'COMPLIANCE_OFFICER',
  TRADER = 'TRADER',
  ADMIN = 'ADMIN',
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  email: string;
  avatarUrl?: string;
}

// Mock users
const mockUsers: Record<UserRole, User> = {
  [UserRole.CREW]: {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    role: UserRole.CREW,
    email: 'crew@poseidon.com',
    avatarUrl: 'https://picsum.photos/seed/crew/40/40'
  },
  [UserRole.OFFICER]: {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    role: UserRole.OFFICER,
    email: 'officer@poseidon.com',
    avatarUrl: 'https://picsum.photos/seed/officer/40/40'
  },
  [UserRole.ENGINEER]: {
    id: '3',
    firstName: 'Mike',
    lastName: 'Wong',
    role: UserRole.ENGINEER,
    email: 'engineer@poseidon.com',
    avatarUrl: 'https://picsum.photos/seed/engineer/40/40'
  },
  [UserRole.MANAGER]: {
    id: '4',
    firstName: 'Sarfaraz',
    lastName: 'Akhtar',
    role: UserRole.MANAGER,
    email: 'sarfaraz.akhtar@poseidon.com',
    avatarUrl: 'https://picsum.photos/seed/manager/40/40'
  },
  [UserRole.COMPLIANCE_OFFICER]: {
    id: '5',
    firstName: 'Vinay',
    lastName: 'Chandra',
    role: UserRole.COMPLIANCE_OFFICER,
    email: 'vinay.chandra@poseidon.com',
    avatarUrl: 'https://picsum.photos/seed/compliance/40/40'
  },
  [UserRole.TRADER]: {
    id: '6',
    firstName: 'Sravan',
    lastName: 'Padavala',
    role: UserRole.TRADER,
    email: 'sravan.padavala@poseidon.com',
    avatarUrl: 'https://picsum.photos/seed/trader/40/40'
  },
  [UserRole.ADMIN]: {
    id: '7',
    firstName: 'Sumit',
    lastName: 'Redu',
    role: UserRole.ADMIN,
    email: 'sumit.redu@poseidon.com',
    avatarUrl: 'https://picsum.photos/seed/admin/40/40'
  }
};

// User Context
const UserContext = React.createContext<{
  user: User;
  switchUser: (role: UserRole) => void;
}>({
  user: mockUsers[UserRole.COMPLIANCE_OFFICER],
  switchUser: () => {}
});

const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(mockUsers[UserRole.COMPLIANCE_OFFICER]);

  const switchUser = (role: UserRole) => {
    setUser(mockUsers[role]);
  };

  return (
    <UserContext.Provider value={{ user, switchUser }}>
      {children}
    </UserContext.Provider>
  );
};

const useUser = () => React.useContext(UserContext);

// User Switcher Component
const UserSwitcher: React.FC = () => {
  const { user, switchUser } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          backgroundColor: '#1A1A1A',
          border: '1px solid #333',
          borderRadius: '8px',
          color: 'white',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#2A2A2A';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#1A1A1A';
        }}
      >
        <img
          src={user.avatarUrl || `https://picsum.photos/seed/${user.id}/32/32`}
          alt={`${user.firstName} ${user.lastName}`}
          style={{ width: '24px', height: '24px', borderRadius: '50%' }}
        />
        <span style={{ fontSize: '14px', fontWeight: '500' }}>
          {user.firstName} {user.lastName}
        </span>
        <span style={{ fontSize: '12px', color: '#888' }}>▼</span>
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: '0',
          marginTop: '8px',
          backgroundColor: '#1A1A1A',
          border: '1px solid #333',
          borderRadius: '8px',
          padding: '8px',
          minWidth: '200px',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          {Object.values(UserRole).map((role) => (
            <button
              key={role}
              onClick={() => {
                switchUser(role);
                setIsOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '8px 12px',
                backgroundColor: user.role === role ? '#FF6A00' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                color: user.role === role ? 'white' : '#CCC',
                cursor: 'pointer',
                fontSize: '14px',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (user.role !== role) {
                  e.currentTarget.style.backgroundColor = '#2A2A2A';
                }
              }}
              onMouseLeave={(e) => {
                if (user.role !== role) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <img
                src={mockUsers[role].avatarUrl || `https://picsum.photos/seed/${role}/24/24`}
                alt={mockUsers[role].firstName}
                style={{ width: '20px', height: '20px', borderRadius: '50%' }}
              />
              <div>
                <div style={{ fontWeight: '500' }}>
                  {mockUsers[role].firstName} {mockUsers[role].lastName}
                </div>
                <div style={{ fontSize: '12px', color: '#888' }}>
                  {role.replace('_', ' ')}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Header Component
const Header: React.FC = () => {
  const { user } = useUser();
  const [euaPrice, setEuaPrice] = useState(75.19);

  useEffect(() => {
    const interval = setInterval(() => {
      setEuaPrice(prev => prev + (Math.random() - 0.5) * 0.5);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header style={{ 
      backgroundColor: '#111111', 
      borderBottom: '1px solid #2A2A2A',
      padding: '16px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ 
          fontSize: '28px', 
          fontWeight: 'bold', 
          background: 'linear-gradient(135deg, #FF6A00, #FF8C42)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          🚢 Nautilus Horizon
        </div>
        <div style={{ 
          fontSize: '14px', 
          color: '#888', 
          fontWeight: '500',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Maritime Compliance Platform
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div style={{ 
          backgroundColor: '#1A1A1A', 
          padding: '8px 16px', 
          borderRadius: '8px',
          border: '1px solid #333',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{ 
            width: '8px', 
            height: '8px', 
            backgroundColor: '#10B981', 
            borderRadius: '50%',
            animation: 'pulse 2s infinite'
          }}></div>
          <span style={{ color: '#CCC', fontSize: '14px' }}>EUA Price:</span>
          <span style={{ 
            color: '#FF6A00', 
            fontWeight: 'bold', 
            fontSize: '16px',
            fontFamily: 'monospace'
          }}>
            €{euaPrice.toFixed(2)}
          </span>
        </div>
        
        <UserSwitcher />
      </div>
    </header>
  );
};

// Sidebar Component
const Sidebar: React.FC = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('dashboard');

  const getNavigationItems = () => {
    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: '📊' }
    ];

    const roleSpecificItems: Record<UserRole, Array<{id: string, label: string, icon: string}>> = {
      [UserRole.CREW]: [
        { id: 'tasks', label: 'My Tasks', icon: '📋' },
        { id: 'league', label: 'Crew League', icon: '🏆' },
        { id: 'fuel-logging', label: 'Fuel Logging', icon: '⛽' }
      ],
      [UserRole.OFFICER]: [
        { id: 'voyages', label: 'Voyages', icon: '🌍' },
        { id: 'crew-tasks', label: 'Crew Tasks', icon: '👥' },
        { id: 'compliance', label: 'Compliance', icon: '📋' }
      ],
      [UserRole.ENGINEER]: [
        { id: 'engine-status', label: 'Engine Status', icon: '🔧' },
        { id: 'fuel-consumption', label: 'Fuel Consumption', icon: '📊' },
        { id: 'maintenance', label: 'Maintenance', icon: '🛠️' }
      ],
      [UserRole.MANAGER]: [
        { id: 'fleet', label: 'Fleet Management', icon: '🚢' },
        { id: 'financial', label: 'Financial Overview', icon: '💰' },
        { id: 'reports', label: 'Reports', icon: '📈' }
      ],
      [UserRole.COMPLIANCE_OFFICER]: [
        { id: 'compliance-monitoring', label: 'Compliance Monitoring', icon: '📋' },
        { id: 'verification', label: 'Verification', icon: '✅' },
        { id: 'deadlines', label: 'Regulatory Deadlines', icon: '⏰' }
      ],
      [UserRole.TRADER]: [
        { id: 'trading', label: 'Trading Opportunities', icon: '💹' },
        { id: 'market-data', label: 'Market Data', icon: '📊' },
        { id: 'portfolio', label: 'Portfolio', icon: '💼' }
      ],
      [UserRole.ADMIN]: [
        { id: 'user-management', label: 'User Management', icon: '👤' },
        { id: 'system-settings', label: 'System Settings', icon: '⚙️' },
        { id: 'audit', label: 'Audit Logs', icon: '📝' }
      ]
    };

    return [...baseItems, ...(roleSpecificItems[user.role] || [])];
  };

  const navigationItems = getNavigationItems();

  return (
    <nav style={{ 
      width: '280px', 
      backgroundColor: '#111111', 
      borderRight: '1px solid #2A2A2A',
      padding: '24px 0',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ 
        color: '#666', 
        fontSize: '12px', 
        textTransform: 'uppercase', 
        letterSpacing: '1px',
        padding: '0 24px 16px 24px',
        fontWeight: '600'
      }}>
        Navigation
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '0 16px' }}>
        {navigationItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              padding: '12px 16px', 
              borderRadius: '8px', 
              border: 'none',
              backgroundColor: activeTab === item.id ? '#FF6A00' : 'transparent',
              color: activeTab === item.id ? 'white' : '#CCC',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'left',
              width: '100%'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== item.id) {
                e.currentTarget.style.backgroundColor = '#1A1A1A';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== item.id) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <span style={{ fontSize: '16px' }}>{item.icon}</span>
            {item.label}
            {activeTab === item.id && (
              <div style={{ 
                marginLeft: 'auto',
                width: '4px',
                height: '4px',
                backgroundColor: 'white',
                borderRadius: '50%'
              }}></div>
            )}
          </button>
        ))}
      </div>

      {/* User Section */}
      <div style={{ 
        marginTop: 'auto', 
        padding: '24px 16px 0 16px',
        borderTop: '1px solid #2A2A2A'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          padding: '12px',
          backgroundColor: '#1A1A1A',
          borderRadius: '8px'
        }}>
          <img
            src={user.avatarUrl || `https://picsum.photos/seed/${user.id}/32/32`}
            alt={`${user.firstName} ${user.lastName}`}
            style={{ width: '32px', height: '32px', borderRadius: '50%' }}
          />
          <div>
            <div style={{ color: 'white', fontSize: '14px', fontWeight: '500' }}>
              {user.firstName} {user.lastName}
            </div>
            <div style={{ color: '#888', fontSize: '12px' }}>
              {user.role.replace('_', ' ')}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Dashboard Component
const Dashboard: React.FC = () => {
  const { user } = useUser();
  const [euaPrice, setEuaPrice] = useState(75.19);

  useEffect(() => {
    const interval = setInterval(() => {
      setEuaPrice(prev => prev + (Math.random() - 0.5) * 0.5);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const getRoleSpecificContent = () => {
    switch (user.role) {
      case UserRole.CREW:
        return {
          title: 'Crew Dashboard',
          subtitle: 'Track your tasks and performance',
          cards: [
            { title: 'My Tasks', value: '5', subtitle: 'Pending tasks', color: '#FF6A00' },
            { title: 'League Rank', value: '#3', subtitle: 'Crew leaderboard', color: '#10B981' },
            { title: 'Fuel Logged', value: '45.2t', subtitle: 'This week', color: '#3B82F6' }
          ]
        };
      case UserRole.OFFICER:
        return {
          title: 'Officer Dashboard',
          subtitle: 'Monitor vessel operations and crew',
          cards: [
            { title: 'Active Voyages', value: '3', subtitle: 'In progress', color: '#FF6A00' },
            { title: 'Crew Tasks', value: '12', subtitle: 'Assigned', color: '#10B981' },
            { title: 'Compliance', value: '95%', subtitle: 'Fleet compliance', color: '#3B82F6' }
          ]
        };
      case UserRole.ENGINEER:
        return {
          title: 'Engineer Dashboard',
          subtitle: 'Monitor engine performance and maintenance',
          cards: [
            { title: 'Engine Status', value: '4/4', subtitle: 'All operational', color: '#10B981' },
            { title: 'Fuel Efficiency', value: '94.2%', subtitle: 'Average efficiency', color: '#FF6A00' },
            { title: 'Maintenance', value: '2', subtitle: 'Due this week', color: '#F59E0B' }
          ]
        };
      case UserRole.MANAGER:
        return {
          title: 'Manager Dashboard',
          subtitle: 'Fleet management and financial overview',
          cards: [
            { title: 'Fleet Size', value: '12', subtitle: 'Active vessels', color: '#FF6A00' },
            { title: 'Monthly Revenue', value: '€2.1M', subtitle: 'This month', color: '#10B981' },
            { title: 'TCC Cost', value: '€827K', subtitle: 'Total compliance cost', color: '#F59E0B' }
          ]
        };
      case UserRole.COMPLIANCE_OFFICER:
        return {
          title: 'Compliance Dashboard',
          subtitle: 'Monitor regulatory compliance and deadlines',
          cards: [
            { title: 'Compliant Vessels', value: '10/12', subtitle: 'Fleet compliance', color: '#10B981' },
            { title: 'EU ETS Exposure', value: '2,739t', subtitle: 'CO₂ exposure', color: '#F59E0B' },
            { title: 'Deadlines', value: '3', subtitle: 'Upcoming deadlines', color: '#EF4444' }
          ]
        };
      case UserRole.TRADER:
        return {
          title: 'Trading Dashboard',
          subtitle: 'Manage RFQ board and trading opportunities',
          cards: [
            { title: 'Active RFQs', value: '5', subtitle: 'Open opportunities', color: '#FF6A00' },
            { title: 'Portfolio Value', value: '€145K', subtitle: 'Total holdings', color: '#10B981' },
            { title: 'Market Price', value: '€75.19', subtitle: 'Current EUA price', color: '#3B82F6' }
          ]
        };
      case UserRole.ADMIN:
        return {
          title: 'Admin Dashboard',
          subtitle: 'System administration and user management',
          cards: [
            { title: 'Total Users', value: '24', subtitle: 'Active users', color: '#FF6A00' },
            { title: 'System Health', value: '100%', subtitle: 'All systems operational', color: '#10B981' },
            { title: 'Audit Logs', value: '1,247', subtitle: 'This month', color: '#3B82F6' }
          ]
        };
      default:
        return {
          title: 'Dashboard',
          subtitle: 'Welcome to Nautilus Horizon',
          cards: [
            { title: 'System Status', value: 'Online', subtitle: 'All systems operational', color: '#10B981' },
            { title: 'Users', value: '24', subtitle: 'Active users', color: '#3B82F6' },
            { title: 'Vessels', value: '12', subtitle: 'Fleet size', color: '#FF6A00' }
          ]
        };
    }
  };

  const content = getRoleSpecificContent();

  return (
    <main style={{ flex: 1, padding: '32px', backgroundColor: '#0A0A0A' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: '700', 
          color: 'white', 
          marginBottom: '8px',
          margin: 0,
          letterSpacing: '-0.5px'
        }}>
          {content.title}
        </h1>
        <p style={{ 
          color: '#888', 
          fontSize: '16px', 
          margin: 0,
          fontWeight: '400'
        }}>
          {content.subtitle}
        </p>
      </div>

      {/* Role-specific Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '24px', 
        marginBottom: '32px' 
      }}>
        {content.cards.map((card, index) => (
          <div key={index} style={{ 
            backgroundColor: '#111111', 
            border: '1px solid #2A2A2A', 
            borderRadius: '12px', 
            padding: '24px',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = card.color;
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#2A2A2A';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                color: 'white', 
                margin: 0
              }}>
                {card.title}
              </h3>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                backgroundColor: card.color, 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '16px', color: 'white' }}>📊</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ 
                fontSize: '32px', 
                fontWeight: 'bold', 
                color: card.color,
                lineHeight: '1'
              }}>
                {card.value}
              </div>
              <div style={{ 
                color: '#888', 
                fontSize: '14px'
              }}>
                {card.subtitle}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div style={{ 
        backgroundColor: '#111111', 
        border: '1px solid #2A2A2A', 
        borderRadius: '12px', 
        padding: '24px'
      }}>
        <h3 style={{ 
          fontSize: '18px', 
          fontWeight: '600', 
          color: 'white', 
          marginBottom: '24px',
          margin: '0 0 24px 0'
        }}>
          Recent Activity
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px', 
            padding: '16px', 
            backgroundColor: '#1A1A1A', 
            borderRadius: '8px',
            border: '1px solid #2A2A2A'
          }}>
            <div style={{ 
              width: '12px', 
              height: '12px', 
              backgroundColor: '#10B981', 
              borderRadius: '50%'
            }}></div>
            <div style={{ flex: 1 }}>
              <div style={{ color: 'white', fontWeight: '500', fontSize: '14px', marginBottom: '4px' }}>
                Welcome, {user.firstName}! You are logged in as {user.role.replace('_', ' ')}
              </div>
              <div style={{ color: '#888', fontSize: '12px' }}>
                Dashboard loaded successfully • Just now
              </div>
            </div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px', 
            padding: '16px', 
            backgroundColor: '#1A1A1A', 
            borderRadius: '8px',
            border: '1px solid #2A2A2A'
          }}>
            <div style={{ 
              width: '12px', 
              height: '12px', 
              backgroundColor: '#3B82F6', 
              borderRadius: '50%'
            }}></div>
            <div style={{ flex: 1 }}>
              <div style={{ color: 'white', fontWeight: '500', fontSize: '14px', marginBottom: '4px' }}>
                System Status: All systems operational
              </div>
              <div style={{ color: '#888', fontSize: '12px' }}>
                Database connected, API responsive • 2 minutes ago
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <UserProvider>
      <HashRouter>
        <div style={{ 
          minHeight: '100vh', 
          backgroundColor: '#0A0A0A', 
          color: 'white', 
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          <Header />
          <div style={{ display: 'flex', minHeight: 'calc(100vh - 80px)' }}>
            <Sidebar />
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </div>
        </div>
      </HashRouter>
      
      {/* Add CSS for pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </UserProvider>
  );
};

export default App;


