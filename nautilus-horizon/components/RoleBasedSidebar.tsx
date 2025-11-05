// Role-Based Sidebar Navigation

import React from 'react';
import { NavLink } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { UserRole } from '../contexts/UserContext';
import { Permission } from '../types/user';
import { DashboardIcon, DocumentTextIcon, BeakerIcon, CogIcon, LifebuoyIcon, GlobeAltIcon } from './common/Icons';

const RoleBasedSidebar: React.FC = () => {
  const { user, hasPermission } = useUser();

  if (!user) {
    return (
      <nav className="w-64 bg-[#121212] text-accent-b p-4 flex flex-col shrink-0">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </nav>
    );
  }

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
      isActive
        ? 'bg-primary text-white'
        : 'text-text-secondary hover:bg-subtle hover:text-text-primary'
    }`;

  const getRoleSpecificNavigation = () => {
    const baseNavItems = [
      {
        to: '/dashboard',
        icon: DashboardIcon,
        label: 'Dashboard',
        permission: Permission.VIEW_DASHBOARD
      }
    ];

    // Add role-specific navigation items
    switch (user.role) {
      case UserRole.CREW:
        return [
          ...baseNavItems,
          {
            to: '/crew/tasks',
            icon: () => <span className="h-5 w-5 mr-3 text-center">📋</span>,
            label: 'My Tasks',
            permission: Permission.VIEW_CREW_TASKS
          },
          {
            to: '/crew/league',
            icon: () => <span className="h-5 w-5 mr-3 text-center">🏆</span>,
            label: 'Crew League',
            permission: Permission.VIEW_LEAGUE
          },
          {
            to: '/fuel-logging',
            icon: BeakerIcon,
            label: 'Fuel Logging',
            permission: Permission.ENTER_FUEL_CONSUMPTION
          },
          {
            to: '/safety',
            icon: () => <span className="h-5 w-5 mr-3 text-center">🛡️</span>,
            label: 'Safety',
            permission: Permission.VIEW_CREW_TASKS
          }
        ];

      case UserRole.OFFICER:
        return [
          ...baseNavItems,
          {
            to: '/voyages',
            icon: GlobeAltIcon,
            label: 'Voyages',
            permission: Permission.VIEW_VOYAGES
          },
          {
            to: '/crew/tasks',
            icon: () => <span className="h-5 w-5 mr-3 text-center">📋</span>,
            label: 'Crew Management',
            permission: Permission.VIEW_CREW_TASKS
          },
          {
            to: '/navigation',
            icon: () => <span className="h-5 w-5 mr-3 text-center">🧭</span>,
            label: 'Navigation',
            permission: Permission.VIEW_VOYAGES
          },
          {
            to: '/fuel-management',
            icon: BeakerIcon,
            label: 'Fuel Management',
            permission: Permission.VIEW_FUEL_DATA
          },
          {
            to: '/safety',
            icon: () => <span className="h-5 w-5 mr-3 text-center">🛡️</span>,
            label: 'Safety & Security',
            permission: Permission.VIEW_CREW_TASKS
          }
        ];

      case UserRole.ENGINEER:
        return [
          ...baseNavItems,
          {
            to: '/engine-status',
            icon: BeakerIcon,
            label: 'Engine Status',
            permission: Permission.VIEW_ENGINE_STATUS
          },
          {
            to: '/waste-heat-recovery',
            icon: () => <span className="h-5 w-5 mr-3 text-center">♨️</span>,
            label: 'Waste Heat Recovery',
            permission: Permission.MANAGE_WHR_SYSTEMS
          },
          {
            to: '/maintenance',
            icon: CogIcon,
            label: 'Maintenance',
            permission: Permission.MANAGE_MAINTENANCE
          },
          {
            to: '/emissions',
            icon: () => <span className="h-5 w-5 mr-3 text-center">🌱</span>,
            label: 'Emissions',
            permission: Permission.VIEW_EMISSIONS_DATA
          },
          {
            to: '/fuel-consumption',
            icon: BeakerIcon,
            label: 'Fuel Consumption',
            permission: Permission.VIEW_FUEL_DATA
          }
        ];

      case UserRole.MANAGER:
        return [
          ...baseNavItems,
          {
            to: '/voyages',
            icon: GlobeAltIcon,
            label: 'Voyages',
            permission: Permission.VIEW_VOYAGES
          },
          {
            to: '/rfq-board',
            icon: DocumentTextIcon,
            label: 'RFQ Board',
            permission: Permission.VIEW_RFQ_BOARD
          },
          {
            to: '/scenario-pad',
            icon: BeakerIcon,
            label: 'Scenario Pad',
            permission: Permission.VIEW_FINANCIAL_DATA
          },
          {
            to: '/fleet-management',
            icon: GlobeAltIcon,
            label: 'Fleet Management',
            permission: Permission.VIEW_FLEET_OVERVIEW
          },
          {
            to: '/crew/tasks',
            icon: () => <span className="h-5 w-5 mr-3 text-center">📋</span>,
            label: 'Crew Management',
            permission: Permission.VIEW_CREW_TASKS
          }
        ];

      case UserRole.COMPLIANCE_OFFICER:
        return [
          ...baseNavItems,
          {
            to: '/compliance-monitoring',
            icon: DocumentTextIcon,
            label: 'Compliance Monitoring',
            permission: Permission.VIEW_COMPLIANCE_DATA
          },
          {
            to: '/regulations',
            icon: () => <span className="h-5 w-5 mr-3 text-center">📜</span>,
            label: 'Marine Regulations',
            permission: Permission.VIEW_REGULATIONS
          },
          {
            to: '/verification',
            icon: BeakerIcon,
            label: 'Data Verification',
            permission: Permission.VERIFY_FUEL_DATA
          },
          {
            to: '/regulatory-deadlines',
            icon: () => <span className="h-5 w-5 mr-3 text-center">⏰</span>,
            label: 'Regulatory Deadlines',
            permission: Permission.VIEW_COMPLIANCE_DATA
          },
          {
            to: '/rfq-board',
            icon: DocumentTextIcon,
            label: 'Emissions Trading',
            permission: Permission.VIEW_RFQ_BOARD
          }
        ];

      case UserRole.TRADER:
        return [
          ...baseNavItems,
          {
            to: '/rfq-board',
            icon: DocumentTextIcon,
            label: 'Emissions Trading',
            permission: Permission.VIEW_RFQ_BOARD
          },
          {
            to: '/trading-opportunities',
            icon: () => <span className="h-5 w-5 mr-3 text-center">💰</span>,
            label: 'Trading Opportunities',
            permission: Permission.RESPOND_TO_RFQ
          },
          {
            to: '/market-data',
            icon: () => <span className="h-5 w-5 mr-3 text-center">📈</span>,
            label: 'Market Data',
            permission: Permission.VIEW_FINANCIAL_DATA
          },
          {
            to: '/portfolio',
            icon: DocumentTextIcon,
            label: 'Trading Portfolio',
            permission: Permission.MANAGE_RFQ
          }
        ];

      case UserRole.CAPTAIN:
        return [
          ...baseNavItems,
          {
            to: '/voyages',
            icon: GlobeAltIcon,
            label: 'Voyages',
            permission: Permission.VIEW_VOYAGES
          },
          {
            to: '/crew/tasks',
            icon: () => <span className="h-5 w-5 mr-3 text-center">📋</span>,
            label: 'Crew Management',
            permission: Permission.VIEW_CREW_TASKS
          },
          {
            to: '/navigation',
            icon: () => <span className="h-5 w-5 mr-3 text-center">🧭</span>,
            label: 'Navigation',
            permission: Permission.VIEW_VOYAGES
          },
          {
            to: '/safety',
            icon: () => <span className="h-5 w-5 mr-3 text-center">🛡️</span>,
            label: 'Safety & Security',
            permission: Permission.VIEW_CREW_TASKS
          },
          {
            to: '/compliance',
            icon: DocumentTextIcon,
            label: 'Compliance',
            permission: Permission.VIEW_COMPLIANCE_DATA
          }
        ];

      case UserRole.CHIEF_ENGINEER:
        return [
          ...baseNavItems,
          {
            to: '/engine-status',
            icon: BeakerIcon,
            label: 'Engine Status',
            permission: Permission.VIEW_ENGINE_STATUS
          },
          {
            to: '/waste-heat-recovery',
            icon: () => <span className="h-5 w-5 mr-3 text-center">♨️</span>,
            label: 'Waste Heat Recovery',
            permission: Permission.MANAGE_WHR_SYSTEMS
          },
          {
            to: '/maintenance',
            icon: CogIcon,
            label: 'Maintenance',
            permission: Permission.MANAGE_MAINTENANCE
          },
          {
            to: '/emissions',
            icon: () => <span className="h-5 w-5 mr-3 text-center">🌱</span>,
            label: 'Emissions',
            permission: Permission.VIEW_EMISSIONS_DATA
          },
          {
            to: '/crew/tasks',
            icon: () => <span className="h-5 w-5 mr-3 text-center">📋</span>,
            label: 'Engineering Tasks',
            permission: Permission.VIEW_CREW_TASKS
          }
        ];

      case UserRole.TECHNICAL_SUPERINTENDENT:
        return [
          ...baseNavItems,
          {
            to: '/fleet-management',
            icon: GlobeAltIcon,
            label: 'Fleet Management',
            permission: Permission.VIEW_FLEET_OVERVIEW
          },
          {
            to: '/engine-status',
            icon: BeakerIcon,
            label: 'Engine Status',
            permission: Permission.VIEW_ENGINE_STATUS
          },
          {
            to: '/waste-heat-recovery',
            icon: () => <span className="h-5 w-5 mr-3 text-center">♨️</span>,
            label: 'Waste Heat Recovery',
            permission: Permission.MANAGE_WHR_SYSTEMS
          },
          {
            to: '/maintenance',
            icon: CogIcon,
            label: 'Maintenance',
            permission: Permission.MANAGE_MAINTENANCE
          },
          {
            to: '/compliance-monitoring',
            icon: DocumentTextIcon,
            label: 'Compliance',
            permission: Permission.VIEW_COMPLIANCE_DATA
          },
          {
            to: '/fuel-consumption',
            icon: BeakerIcon,
            label: 'Fuel Consumption',
            permission: Permission.VIEW_FUEL_DATA
          }
        ];

      case UserRole.OPERATIONS_SUPERINTENDENT:
        return [
          ...baseNavItems,
          {
            to: '/fleet-management',
            icon: GlobeAltIcon,
            label: 'Fleet Management',
            permission: Permission.VIEW_FLEET_OVERVIEW
          },
          {
            to: '/voyages',
            icon: GlobeAltIcon,
            label: 'Voyages',
            permission: Permission.VIEW_VOYAGES
          },
          {
            to: '/crew/tasks',
            icon: () => <span className="h-5 w-5 mr-3 text-center">📋</span>,
            label: 'Crew Management',
            permission: Permission.VIEW_CREW_TASKS
          },
          {
            to: '/compliance-monitoring',
            icon: DocumentTextIcon,
            label: 'Compliance',
            permission: Permission.VIEW_COMPLIANCE_DATA
          },
          {
            to: '/fuel-consumption',
            icon: BeakerIcon,
            label: 'Fuel Consumption',
            permission: Permission.VIEW_FUEL_DATA
          },
          {
            to: '/scenario-pad',
            icon: BeakerIcon,
            label: 'Scenario Planning',
            permission: Permission.VIEW_FINANCIAL_DATA
          }
        ];

      case UserRole.PORT_CAPTAIN:
        return [
          ...baseNavItems,
          {
            to: '/fleet-management',
            icon: GlobeAltIcon,
            label: 'Fleet Management',
            permission: Permission.VIEW_FLEET_OVERVIEW
          },
          {
            to: '/voyages',
            icon: GlobeAltIcon,
            label: 'Voyages',
            permission: Permission.VIEW_VOYAGES
          },
          {
            to: '/crew/tasks',
            icon: () => <span className="h-5 w-5 mr-3 text-center">📋</span>,
            label: 'Crew Management',
            permission: Permission.VIEW_CREW_TASKS
          },
          {
            to: '/compliance-monitoring',
            icon: DocumentTextIcon,
            label: 'Compliance',
            permission: Permission.VIEW_COMPLIANCE_DATA
          },
          {
            to: '/fuel-consumption',
            icon: BeakerIcon,
            label: 'Fuel Consumption',
            permission: Permission.VIEW_FUEL_DATA
          }
        ];

      case UserRole.FLEET_SUPERINTENDENT:
        return [
          ...baseNavItems,
          {
            to: '/fleet-management',
            icon: GlobeAltIcon,
            label: 'Fleet Management',
            permission: Permission.VIEW_FLEET_OVERVIEW
          },
          {
            to: '/voyages',
            icon: GlobeAltIcon,
            label: 'Voyages',
            permission: Permission.VIEW_VOYAGES
          },
          {
            to: '/compliance-monitoring',
            icon: DocumentTextIcon,
            label: 'Compliance Monitoring',
            permission: Permission.VIEW_COMPLIANCE_DATA
          },
          {
            to: '/rfq-board',
            icon: DocumentTextIcon,
            label: 'RFQ Board',
            permission: Permission.VIEW_RFQ_BOARD
          },
          {
            to: '/scenario-pad',
            icon: BeakerIcon,
            label: 'Scenario Pad',
            permission: Permission.VIEW_FINANCIAL_DATA
          },
          {
            to: '/fuel-consumption',
            icon: BeakerIcon,
            label: 'Fuel Consumption',
            permission: Permission.VIEW_FUEL_DATA
          },
          {
            to: '/maintenance',
            icon: CogIcon,
            label: 'Maintenance',
            permission: Permission.MANAGE_MAINTENANCE
          },
          {
            to: '/regulatory-deadlines',
            icon: () => <span className="h-5 w-5 mr-3 text-center">⏰</span>,
            label: 'Regulatory Deadlines',
            permission: Permission.VIEW_COMPLIANCE_DATA
          }
        ];

      case UserRole.ADMIN:
        return [
          ...baseNavItems,
          {
            to: '/user-management',
            icon: () => <span className="h-5 w-5 mr-3 text-center">👤</span>,
            label: 'User Management',
            permission: Permission.MANAGE_USERS
          },
          {
            to: '/system-settings',
            icon: CogIcon,
            label: 'System Settings',
            permission: Permission.SYSTEM_ADMIN
          },
          {
            to: '/fleet-management',
            icon: () => <span className="h-5 w-5 mr-3 text-center">🚢</span>,
            label: 'Fleet Management',
            permission: Permission.VIEW_FLEET_OVERVIEW
          },
          {
            to: '/voyages',
            icon: () => <span className="h-5 w-5 mr-3 text-center">🌍</span>,
            label: 'Voyages',
            permission: Permission.VIEW_VOYAGES
          },
          {
            to: '/crew/tasks',
            icon: () => <span className="h-5 w-5 mr-3 text-center">📋</span>,
            label: 'Crew Tasks',
            permission: Permission.VIEW_CREW_TASKS
          },
          {
            to: '/crew/league',
            icon: () => <span className="h-5 w-5 mr-3 text-center">🏆</span>,
            label: 'Crew League',
            permission: Permission.VIEW_LEAGUE
          },
          {
            to: '/fuel-logging',
            icon: () => <span className="h-5 w-5 mr-3 text-center">⛽</span>,
            label: 'Fuel Logging',
            permission: Permission.ENTER_FUEL_CONSUMPTION
          },
          {
            to: '/fuel-consumption',
            icon: () => <span className="h-5 w-5 mr-3 text-center">📊</span>,
            label: 'Fuel Consumption',
            permission: Permission.VIEW_FUEL_DATA
          },
          {
            to: '/engine-status',
            icon: () => <span className="h-5 w-5 mr-3 text-center">🔧</span>,
            label: 'Engine Status',
            permission: Permission.VIEW_ENGINE_STATUS
          },
          {
            to: '/waste-heat-recovery',
            icon: () => <span className="h-5 w-5 mr-3 text-center">🔥</span>,
            label: 'Waste Heat Recovery',
            permission: Permission.MANAGE_WHR_SYSTEMS
          },
          {
            to: '/maintenance',
            icon: () => <span className="h-5 w-5 mr-3 text-center">🛠️</span>,
            label: 'Maintenance',
            permission: Permission.MANAGE_MAINTENANCE
          },
          {
            to: '/compliance-monitoring',
            icon: () => <span className="h-5 w-5 mr-3 text-center">📋</span>,
            label: 'Compliance Monitoring',
            permission: Permission.VIEW_COMPLIANCE_DATA
          },
          {
            to: '/verification',
            icon: () => <span className="h-5 w-5 mr-3 text-center">✅</span>,
            label: 'Verification',
            permission: Permission.VERIFY_FUEL_DATA
          },
          {
            to: '/regulatory-deadlines',
            icon: () => <span className="h-5 w-5 mr-3 text-center">⏰</span>,
            label: 'Regulatory Deadlines',
            permission: Permission.VIEW_COMPLIANCE_DATA
          },
          {
            to: '/trading-opportunities',
            icon: () => <span className="h-5 w-5 mr-3 text-center">💹</span>,
            label: 'Trading Opportunities',
            permission: Permission.RESPOND_TO_RFQ
          },
          {
            to: '/market-data',
            icon: () => <span className="h-5 w-5 mr-3 text-center">📊</span>,
            label: 'Market Data',
            permission: Permission.VIEW_FINANCIAL_DATA
          },
          {
            to: '/portfolio',
            icon: () => <span className="h-5 w-5 mr-3 text-center">💼</span>,
            label: 'Portfolio',
            permission: Permission.MANAGE_RFQ
          },
          {
            to: '/rfq-board',
            icon: () => <span className="h-5 w-5 mr-3 text-center">📄</span>,
            label: 'RFQ Board',
            permission: Permission.VIEW_RFQ_BOARD
          },
          {
            to: '/scenario-pad',
            icon: () => <span className="h-5 w-5 mr-3 text-center">🧪</span>,
            label: 'Scenario Pad',
            permission: Permission.VIEW_FINANCIAL_DATA
          }
        ];

      default:
        return baseNavItems;
    }
  };

  const navigationItems = getRoleSpecificNavigation().filter(item => 
    hasPermission(item.permission)
  );

  const getRoleDisplayName = () => {
    switch (user.role) {
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
      case UserRole.ADMIN: return 'System Administrator';
      default: return 'Marine Professional';
    }
  };

  return (
    <nav className="w-64 bg-[#121212] text-accent-b p-4 flex flex-col shrink-0">
      {/* Logo and User Info */}
      <div className="flex items-center space-x-3 mb-6 px-2">
        <img src="https://picsum.photos/seed/logo/40/40" alt="Logo" className="rounded-full" />
        <div>
          <span className="text-xl font-bold text-text-primary">Nautilus</span>
          <div className="text-xs text-text-muted">{getRoleDisplayName()}</div>
        </div>
      </div>

      {/* User Profile */}
      <div className="mb-6 p-3 bg-card rounded-lg">
        <div className="flex items-center space-x-3">
          <img 
            src={user.avatar || `https://picsum.photos/seed/${user.id}/40/40`} 
            alt={`${user.firstName} ${user.lastName}`} 
            className="rounded-full w-10 h-10" 
          />
          <div>
            <div className="text-sm font-medium text-text-primary">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-xs text-text-secondary">
              {user.position || user.role}
            </div>
            {user.shipId && (
              <div className="text-xs text-text-muted">
                {user.shipId}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex flex-col space-y-2 flex-1">
        {navigationItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <NavLink key={item.to} to={item.to} className={navLinkClasses}>
              <IconComponent className="h-5 w-5 mr-3" />
              {item.label}
            </NavLink>
          );
        })}
      </div>

      {/* Role-specific sections */}
      {user.role === UserRole.CREW && (
        <div className="mt-6 mb-2">
          <div className="px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
            Crew Portal
          </div>
        </div>
      )}

      {user.role === UserRole.MANAGER && (
        <div className="mt-6 mb-2">
          <div className="px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
            Management Tools
          </div>
        </div>
      )}

      {user.role === UserRole.COMPLIANCE_OFFICER && (
        <div className="mt-6 mb-2">
          <div className="px-4 text-xs font-semibold text-text-muted uppercase tracking-wider">
            Compliance Tools
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="flex flex-col space-y-2">
        <NavLink to="/profile" className={navLinkClasses}>
          <CogIcon className="h-5 w-5 mr-3" />
          Profile
        </NavLink>
        <NavLink to="/profile-settings" className={navLinkClasses}>
          <CogIcon className="h-5 w-5 mr-3" />
          Customization
        </NavLink>
        <NavLink to="/settings" className={navLinkClasses}>
          <CogIcon className="h-5 w-5 mr-3" />
          Settings
        </NavLink>
        <a href="#" className="flex items-center px-4 py-3 text-sm font-medium rounded-lg text-text-secondary hover:bg-subtle hover:text-text-primary">
          <LifebuoyIcon className="h-5 w-5 mr-3" />
          Support
        </a>
      </div>
    </nav>
  );
};

export default RoleBasedSidebar;
