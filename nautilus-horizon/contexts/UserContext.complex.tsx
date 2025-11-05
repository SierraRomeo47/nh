// User Context and Authentication System

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, UserRole, UserDepartment, Permission, DashboardConfig, DEFAULT_DASHBOARD_CONFIGS, ROLE_PERMISSIONS } from '../types/user';

interface UserContextType {
  user: UserProfile | null;
  dashboardConfig: DashboardConfig | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updateDashboardConfig: (config: Partial<DashboardConfig>) => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: UserRole) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock user data - in production, this would come from your authentication service
  const mockUsers: UserProfile[] = [
    {
      id: '1',
      email: 'crew@poseidon.com',
      firstName: 'John',
      lastName: 'Sailor',
      role: UserRole.CREW,
      department: UserDepartment.DECK,
      organizationId: 'poseidon-shipping',
      shipId: 'mv-neptune',
      avatar: 'https://picsum.photos/seed/crew1/40/40',
      phoneNumber: '+1-555-0123',
      position: 'Deckhand',
      rank: 'Able Seaman',
      language: 'en',
      timezone: 'UTC',
      theme: 'dark',
      dashboardLayout: 'compact',
      permissions: [
        Permission.VIEW_DASHBOARD,
        Permission.VIEW_CREW_TASKS,
        Permission.COMPLETE_TASKS,
        Permission.VIEW_LEAGUE,
        Permission.VIEW_FUEL_DATA,
        Permission.ENTER_FUEL_CONSUMPTION,
        Permission.EDIT_USER_PROFILE
      ],
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    },
    {
      id: '2',
      email: 'officer@poseidon.com',
      firstName: 'Sarah',
      lastName: 'Captain',
      role: UserRole.OFFICER,
      department: UserDepartment.DECK,
      organizationId: 'poseidon-shipping',
      shipId: 'mv-neptune',
      avatar: 'https://picsum.photos/seed/officer1/40/40',
      phoneNumber: '+1-555-0124',
      position: 'Chief Officer',
      rank: 'Chief Officer',
      language: 'en',
      timezone: 'UTC',
      theme: 'dark',
      dashboardLayout: 'grid',
      permissions: [
        Permission.VIEW_DASHBOARD,
        Permission.VIEW_FLEET_OVERVIEW,
        Permission.VIEW_VOYAGES,
        Permission.VIEW_FUEL_DATA,
        Permission.ENTER_FUEL_CONSUMPTION,
        Permission.EDIT_FUEL_DATA,
        Permission.VIEW_CREW_TASKS,
        Permission.ASSIGN_TASKS,
        Permission.VIEW_LEAGUE,
        Permission.EDIT_USER_PROFILE
      ],
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    },
    {
      id: '3',
      email: 'compliance@poseidon.com',
      firstName: 'Michael',
      lastName: 'Compliance',
      role: UserRole.COMPLIANCE_OFFICER,
      department: UserDepartment.COMPLIANCE,
      organizationId: 'poseidon-shipping',
      avatar: 'https://picsum.photos/seed/compliance1/40/40',
      phoneNumber: '+1-555-0125',
      position: 'Compliance Officer',
      rank: 'Senior Officer',
      language: 'en',
      timezone: 'UTC',
      theme: 'dark',
      dashboardLayout: 'grid',
      permissions: [
        Permission.VIEW_DASHBOARD,
        Permission.VIEW_FLEET_OVERVIEW,
        Permission.VIEW_COMPLIANCE_DATA,
        Permission.VIEW_FINANCIAL_DATA,
        Permission.VIEW_VOYAGES,
        Permission.VIEW_FUEL_DATA,
        Permission.VERIFY_FUEL_DATA,
        Permission.VIEW_RFQ_BOARD,
        Permission.CREATE_RFQ,
        Permission.MANAGE_RFQ,
        Permission.VIEW_SETTINGS,
        Permission.EDIT_USER_PROFILE
      ],
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    },
    {
      id: '4',
      email: 'manager@poseidon.com',
      firstName: 'Emma',
      lastName: 'Manager',
      role: UserRole.MANAGER,
      department: UserDepartment.MANAGEMENT,
      organizationId: 'poseidon-shipping',
      avatar: 'https://picsum.photos/seed/manager1/40/40',
      phoneNumber: '+1-555-0126',
      position: 'Fleet Manager',
      rank: 'Manager',
      language: 'en',
      timezone: 'UTC',
      theme: 'dark',
      dashboardLayout: 'grid',
      permissions: [
        Permission.VIEW_DASHBOARD,
        Permission.VIEW_FLEET_OVERVIEW,
        Permission.VIEW_FINANCIAL_DATA,
        Permission.VIEW_VOYAGES,
        Permission.CREATE_VOYAGES,
        Permission.EDIT_VOYAGES,
        Permission.VIEW_FUEL_DATA,
        Permission.EDIT_FUEL_DATA,
        Permission.VIEW_RFQ_BOARD,
        Permission.CREATE_RFQ,
        Permission.VIEW_CREW_TASKS,
        Permission.ASSIGN_TASKS,
        Permission.VIEW_LEAGUE,
        Permission.VIEW_SETTINGS,
        Permission.EDIT_USER_PROFILE
      ],
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    }
  ];

  // Initialize user from localStorage or mock login
  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Check if user is already logged in
        const savedUser = localStorage.getItem('nautilus_user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          
          // Load dashboard config
          const savedConfig = localStorage.getItem(`nautilus_dashboard_${userData.id}`);
          if (savedConfig) {
            setDashboardConfig(JSON.parse(savedConfig));
          } else {
            // Create default dashboard config
            const defaultConfig = createDefaultDashboardConfig(userData);
            setDashboardConfig(defaultConfig);
          }
        } else {
          // Auto-login as compliance officer for demo
          const defaultUser = mockUsers.find(u => u.role === UserRole.COMPLIANCE_OFFICER) || mockUsers[0];
          setUser(defaultUser);
          localStorage.setItem('nautilus_user', JSON.stringify(defaultUser));
          
          const defaultConfig = createDefaultDashboardConfig(defaultUser);
          setDashboardConfig(defaultConfig);
          localStorage.setItem(`nautilus_dashboard_${defaultUser.id}`, JSON.stringify(defaultConfig));
        }
      } catch (error) {
        console.error('Error initializing user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, []);

  const createDefaultDashboardConfig = (user: UserProfile): DashboardConfig => {
    const defaultConfig = DEFAULT_DASHBOARD_CONFIGS[user.role];
    return {
      id: `dashboard_${user.id}`,
      userId: user.id,
      role: user.role,
      layout: defaultConfig.layout || 'grid',
      columns: defaultConfig.columns || 3,
      widgets: defaultConfig.widgets || [],
      showFinancialData: defaultConfig.showFinancialData || false,
      showComplianceData: defaultConfig.showComplianceData || false,
      showCrewData: defaultConfig.showCrewData || false,
      showTechnicalData: defaultConfig.showTechnicalData || false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Mock authentication - in production, this would be an API call
      const foundUser = mockUsers.find(u => u.email === email);
      if (foundUser && password === 'password') { // Simple password for demo
        setUser(foundUser);
        localStorage.setItem('nautilus_user', JSON.stringify(foundUser));
        
        // Load or create dashboard config
        const savedConfig = localStorage.getItem(`nautilus_dashboard_${foundUser.id}`);
        if (savedConfig) {
          setDashboardConfig(JSON.parse(savedConfig));
        } else {
          const defaultConfig = createDefaultDashboardConfig(foundUser);
          setDashboardConfig(defaultConfig);
          localStorage.setItem(`nautilus_dashboard_${foundUser.id}`, JSON.stringify(defaultConfig));
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setDashboardConfig(null);
    localStorage.removeItem('nautilus_user');
    // Clear all dashboard configs
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('nautilus_dashboard_')) {
        localStorage.removeItem(key);
      }
    });
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    
    // If role is being updated, we need to update permissions and dashboard config
    let updatedUser = { ...user, ...updates, updatedAt: new Date() };
    
    if (updates.role && updates.role !== user.role) {
      // Update permissions based on new role
      updatedUser.permissions = ROLE_PERMISSIONS[updates.role] || [];
      
      // Update dashboard config for new role
      const defaultConfig = DEFAULT_DASHBOARD_CONFIGS[updates.role];
      const newDashboardConfig: DashboardConfig = {
        id: `dashboard_${updatedUser.id}`,
        userId: updatedUser.id,
        role: updates.role,
        layout: defaultConfig.layout || 'grid',
        columns: defaultConfig.columns || 3,
        widgets: defaultConfig.widgets || [],
        showFinancialData: defaultConfig.showFinancialData || false,
        showComplianceData: defaultConfig.showComplianceData || false,
        showCrewData: defaultConfig.showCrewData || false,
        showTechnicalData: defaultConfig.showTechnicalData || false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setDashboardConfig(newDashboardConfig);
      localStorage.setItem(`nautilus_dashboard_${updatedUser.id}`, JSON.stringify(newDashboardConfig));
    }
    
    setUser(updatedUser);
    localStorage.setItem('nautilus_user', JSON.stringify(updatedUser));
  };

  const updateDashboardConfig = async (config: Partial<DashboardConfig>) => {
    if (!dashboardConfig) return;
    
    const updatedConfig = { ...dashboardConfig, ...config, updatedAt: new Date() };
    setDashboardConfig(updatedConfig);
    localStorage.setItem(`nautilus_dashboard_${user?.id}`, JSON.stringify(updatedConfig));
  };

  const hasPermission = (permission: Permission): boolean => {
    return user?.permissions.includes(permission) || false;
  };

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const value: UserContextType = {
    user,
    dashboardConfig,
    isLoading,
    login,
    logout,
    updateProfile,
    updateDashboardConfig,
    hasPermission,
    hasRole
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
