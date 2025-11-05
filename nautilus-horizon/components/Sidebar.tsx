import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { UserRole } from '../contexts/UserContext';

const Sidebar: React.FC = () => {
  const { user } = useUser();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const getNavLinkStyle = (path: string) => {
    const isActive = location.pathname === path;
    return {
      display: 'flex',
      alignItems: 'center',
      gap: isCollapsed ? '0' : '12px',
      padding: isCollapsed ? '12px' : '12px 16px',
      borderRadius: '8px',
      border: 'none',
      backgroundColor: isActive ? '#FF6A00' : 'transparent',
      color: isActive ? 'white' : 'var(--text-secondary)',
      textDecoration: 'none',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      textAlign: 'left' as const,
      width: '100%',
      justifyContent: isCollapsed ? 'center' : 'flex-start'
    };
  };

  const getRoleSpecificNavigation = () => {
    if (!user) return [];

    const baseItems = [
      { to: '/dashboard', label: 'Dashboard', icon: '📊' }
    ];

    const roleSpecificItems: Record<UserRole, Array<{to: string, label: string, icon: string}>> = {
      [UserRole.CREW]: [
        { to: '/crew/tasks', label: 'My Tasks', icon: '📋' },
        { to: '/crew/league', label: 'Crew League', icon: '🏆' },
        { to: '/fuel-logging', label: 'Fuel Logging', icon: '⛽' },
        { to: '/fuel-consumption', label: 'Fuel Consumption', icon: '📊' }
      ],
      [UserRole.OFFICER]: [
        { to: '/voyages', label: 'Voyages', icon: '🌍' },
        { to: '/crew/tasks', label: 'Crew Management', icon: '👥' },
        { to: '/fuel-consumption', label: 'Fuel Management', icon: '⛽' },
        { to: '/compliance-monitoring', label: 'Compliance', icon: '📋' },
        { to: '/crew/league', label: 'Crew League', icon: '🏆' },
        { to: '/fleet-management', label: 'Fleet Overview', icon: '🚢' }
      ],
      [UserRole.ENGINEER]: [
        { to: '/engine-status', label: 'Engine Status', icon: '🔧' },
        { to: '/fuel-consumption', label: 'Fuel Consumption', icon: '📊' },
        { to: '/waste-heat-recovery', label: 'Waste Heat Recovery', icon: '🔥' },
        { to: '/maintenance', label: 'Maintenance', icon: '🛠️' },
        { to: '/crew/tasks', label: 'Tasks', icon: '📋' },
        { to: '/crew/league', label: 'Crew League', icon: '🏆' }
      ],
      [UserRole.CAPTAIN]: [
        { to: '/voyages', label: 'Voyages', icon: '🌍' },
        { to: '/crew/tasks', label: 'Crew Management', icon: '👥' },
        { to: '/fleet-management', label: 'Fleet Overview', icon: '🚢' },
        { to: '/compliance-monitoring', label: 'Compliance', icon: '📋' },
        { to: '/fuel-consumption', label: 'Fuel Data', icon: '⛽' },
        { to: '/crew/league', label: 'Crew League', icon: '🏆' }
      ],
      [UserRole.CHIEF_ENGINEER]: [
        { to: '/engine-status', label: 'Engine Status', icon: '🔧' },
        { to: '/waste-heat-recovery', label: 'Waste Heat Recovery', icon: '🔥' },
        { to: '/maintenance', label: 'Maintenance', icon: '🛠️' },
        { to: '/fuel-consumption', label: 'Fuel Consumption', icon: '📊' },
        { to: '/crew/tasks', label: 'Engineering Tasks', icon: '📋' },
        { to: '/compliance-monitoring', label: 'Compliance', icon: '📋' },
        { to: '/fleet-management', label: 'Fleet Overview', icon: '🚢' },
        { to: '/voyages', label: 'Voyages', icon: '🌍' }
      ],
      [UserRole.MANAGER]: [
        { to: '/fleet-management', label: 'Fleet Management', icon: '🚢' },
        { to: '/voyages', label: 'Voyages', icon: '🌍' },
        { to: '/rfq-board', label: 'RFQ Board', icon: '📄' },
        { to: '/scenario-pad', label: 'Scenario Pad', icon: '🧪' },
        { to: '/crew/tasks', label: 'Crew Management', icon: '👥' },
        { to: '/compliance-monitoring', label: 'Compliance', icon: '📋' },
        { to: '/crew/league', label: 'Crew League', icon: '🏆' }
      ],
      [UserRole.COMPLIANCE_OFFICER]: [
        { to: '/compliance-monitoring', label: 'Compliance Monitoring', icon: '📋' },
        { to: '/verification', label: 'Verification', icon: '✅' },
        { to: '/regulatory-deadlines', label: 'Regulatory Deadlines', icon: '⏰' },
        { to: '/rfq-board', label: 'Emissions Trading', icon: '📄' },
        { to: '/fleet-management', label: 'Fleet Overview', icon: '🚢' },
        { to: '/voyages', label: 'Voyages', icon: '🌍' }
      ],
      [UserRole.TRADER]: [
        { to: '/trading-opportunities', label: 'Trading Opportunities', icon: '💹' },
        { to: '/market-data', label: 'Market Data', icon: '📊' },
        { to: '/portfolio', label: 'Portfolio', icon: '💼' },
        { to: '/rfq-board', label: 'RFQ Board', icon: '📄' }
      ],
      [UserRole.TECHNICAL_SUPERINTENDENT]: [
        { to: '/fleet-management', label: 'Fleet Management', icon: '🚢' },
        { to: '/engine-status', label: 'Engine Status', icon: '🔧' },
        { to: '/waste-heat-recovery', label: 'Waste Heat Recovery', icon: '🔥' },
        { to: '/maintenance', label: 'Maintenance', icon: '🛠️' },
        { to: '/compliance-monitoring', label: 'Compliance', icon: '📋' },
        { to: '/fuel-consumption', label: 'Fuel Consumption', icon: '📊' }
      ],
      [UserRole.OPERATIONS_SUPERINTENDENT]: [
        { to: '/fleet-management', label: 'Fleet Management', icon: '🚢' },
        { to: '/voyages', label: 'Voyages', icon: '🌍' },
        { to: '/crew/tasks', label: 'Crew Management', icon: '👥' },
        { to: '/compliance-monitoring', label: 'Compliance', icon: '📋' },
        { to: '/fuel-consumption', label: 'Fuel Consumption', icon: '📊' },
        { to: '/scenario-pad', label: 'Scenario Planning', icon: '🧪' }
      ],
      [UserRole.PORT_CAPTAIN]: [
        { to: '/fleet-management', label: 'Fleet Management', icon: '🚢' },
        { to: '/voyages', label: 'Voyages', icon: '🌍' },
        { to: '/crew/tasks', label: 'Crew Management', icon: '👥' },
        { to: '/compliance-monitoring', label: 'Compliance', icon: '📋' },
        { to: '/fuel-consumption', label: 'Fuel Consumption', icon: '📊' }
      ],
      [UserRole.FLEET_SUPERINTENDENT]: [
        { to: '/fleet-management', label: 'Fleet Management', icon: '🚢' },
        { to: '/voyages', label: 'Voyages', icon: '🌍' },
        { to: '/compliance-monitoring', label: 'Compliance Monitoring', icon: '📋' },
        { to: '/rfq-board', label: 'RFQ Board', icon: '📄' },
        { to: '/scenario-pad', label: 'Scenario Pad', icon: '🧪' },
        { to: '/fuel-consumption', label: 'Fuel Consumption', icon: '📊' },
        { to: '/maintenance', label: 'Maintenance', icon: '🛠️' },
        { to: '/regulatory-deadlines', label: 'Regulatory Deadlines', icon: '⏰' }
      ],
      [UserRole.INSURER]: [
        { to: '/insurance/quotes', label: 'Insurance Quotes', icon: '🛡️' },
        { to: '/fleet-management', label: 'Fleet Overview', icon: '🚢' },
        { to: '/voyages', label: 'Voyages', icon: '🌍' },
        { to: '/compliance-monitoring', label: 'Compliance', icon: '📋' },
        { to: '/fuel-consumption', label: 'Fuel Efficiency', icon: '📊' }
      ],
      [UserRole.MTO]: [
        { to: '/fleet-management', label: 'Fleet Management', icon: '🚢' },
        { to: '/voyages', label: 'Voyages', icon: '🌍' },
        { to: '/compliance-monitoring', label: 'Compliance', icon: '📋' },
        { to: '/fuel-consumption', label: 'Fuel Efficiency', icon: '📊' },
        { to: '/scenario-pad', label: 'Route Planning', icon: '🧪' }
      ],
      [UserRole.ADMIN]: [
        { to: '/user-management', label: 'User Management', icon: '👤' },
        { to: '/system-settings', label: 'System Settings', icon: '⚙️' },
        { to: '/fleet-management', label: 'Fleet Management', icon: '🚢' },
        { to: '/voyages', label: 'Voyages', icon: '🌍' },
        { to: '/crew/tasks', label: 'My Tasks', icon: '📋' },
        { to: '/crew/league', label: 'Crew League', icon: '🏆' },
        { to: '/fuel-logging', label: 'Fuel Logging', icon: '⛽' },
        { to: '/fuel-consumption', label: 'Fuel Consumption', icon: '📊' },
        { to: '/engine-status', label: 'Engine Status', icon: '🔧' },
        { to: '/waste-heat-recovery', label: 'Waste Heat Recovery', icon: '🔥' },
        { to: '/maintenance', label: 'Maintenance', icon: '🛠️' },
        { to: '/compliance-monitoring', label: 'Compliance Monitoring', icon: '📋' },
        { to: '/verification', label: 'Verification', icon: '✅' },
        { to: '/regulatory-deadlines', label: 'Regulatory Deadlines', icon: '⏰' },
        { to: '/insurance/quotes', label: 'Insurance Quotes', icon: '🛡️' },
        { to: '/trading-opportunities', label: 'Trading Opportunities', icon: '💹' },
        { to: '/market-data', label: 'Market Data', icon: '📊' },
        { to: '/portfolio', label: 'Portfolio', icon: '💼' },
        { to: '/rfq-board', label: 'RFQ Board', icon: '📄' },
        { to: '/scenario-pad', label: 'Scenario Pad', icon: '🧪' },
        { to: '/profile-settings', label: 'Profile Settings', icon: '👤' }
      ]
    };

    return [...baseItems, ...(roleSpecificItems[user.role] || [])];
  };

  const navigationItems = getRoleSpecificNavigation();

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case UserRole.CREW: return 'Crew Member';
      case UserRole.OFFICER: return 'Deck Officer';
      case UserRole.ENGINEER: return 'Marine Engineer';
      case UserRole.CAPTAIN: return 'Captain';
      case UserRole.CHIEF_ENGINEER: return 'Chief Engineer';
      case UserRole.MANAGER: return 'Fleet Manager';
      case UserRole.COMPLIANCE_OFFICER: return 'Compliance Manager';
      case UserRole.TRADER: return 'Emissions Trader';
      case UserRole.TECHNICAL_SUPERINTENDENT: return 'Tech Superintendent';
      case UserRole.OPERATIONS_SUPERINTENDENT: return 'Ops Superintendent';
      case UserRole.PORT_CAPTAIN: return 'Port Captain';
      case UserRole.FLEET_SUPERINTENDENT: return 'Fleet Superintendent';
      case UserRole.INSURER: return 'Maritime Insurer';
      case UserRole.MTO: return 'Multimodal Transport Operator';
      case UserRole.ADMIN: return 'System Administrator';
      default: return 'Marine Professional';
    }
  };

  if (!user) return null;

  return (
    <nav style={{ 
      width: isCollapsed ? '80px' : '280px', 
      backgroundColor: 'var(--bg-secondary)', 
      borderRight: '1px solid var(--border-color)',
      padding: '24px 0',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      transition: 'width 0.3s ease'
    }}>
      <div style={{ 
        padding: '0 24px 16px 24px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {!isCollapsed && (
          <span style={{ 
            fontSize: '20px', 
            fontWeight: 'bold', 
            color: 'var(--text-primary)' 
          }}>
            🚢 Nautilus Horizon
          </span>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            width: '32px',
            height: '32px',
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#FF6A00';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
          }}
        >
          {isCollapsed ? '▶' : '◀'}
        </button>
      </div>
      
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '4px', 
        flex: 1,
        padding: '16px'
      }}>
        {navigationItems.map((item) => (
          <NavLink 
            key={item.to} 
            to={item.to}
            style={getNavLinkStyle(item.to)}
            onMouseEnter={(e) => {
              if (location.pathname !== item.to) {
                e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
              }
            }}
            onMouseLeave={(e) => {
              if (location.pathname !== item.to) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <span style={{ fontSize: '16px' }}>{item.icon}</span>
            {!isCollapsed && item.label}
            {!isCollapsed && location.pathname === item.to && (
              <div style={{ 
                marginLeft: 'auto',
                width: '4px',
                height: '4px',
                backgroundColor: 'white',
                borderRadius: '50%'
              }}></div>
            )}
          </NavLink>
        ))}
      </div>
      
      {/* User Section */}
      <div style={{ 
        padding: isCollapsed ? '16px 8px' : '16px',
        borderTop: '1px solid var(--border-color)'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: isCollapsed ? '0' : '12px',
          padding: '12px',
          backgroundColor: 'var(--bg-card)',
          borderRadius: '8px',
          justifyContent: isCollapsed ? 'center' : 'flex-start'
        }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            backgroundColor: '#FF6A00',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </div>
          {!isCollapsed && (
            <div>
              <div style={{ 
                color: 'var(--text-primary)', 
                fontSize: '14px', 
                fontWeight: '500' 
              }}>
                {user?.firstName} {user?.lastName}
              </div>
              <div style={{ 
                color: 'var(--text-muted)', 
                fontSize: '12px' 
              }}>
                {user ? getRoleDisplayName(user.role) : 'User'}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;