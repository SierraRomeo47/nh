// Simplified User Context for the Nautilus Horizon App

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { DEFAULT_DASHBOARD_CONFIGS } from '../types/user';

export enum UserRole {
  CREW = 'CREW',
  OFFICER = 'OFFICER',
  ENGINEER = 'ENGINEER',
  MANAGER = 'MANAGER',
  COMPLIANCE_OFFICER = 'COMPLIANCE_OFFICER',
  TRADER = 'TRADER',
  ADMIN = 'ADMIN',
  // Marine-specific roles
  CAPTAIN = 'CAPTAIN',
  CHIEF_ENGINEER = 'CHIEF_ENGINEER',
  TECHNICAL_SUPERINTENDENT = 'TECHNICAL_SUPERINTENDENT',
  OPERATIONS_SUPERINTENDENT = 'OPERATIONS_SUPERINTENDENT',
  PORT_CAPTAIN = 'PORT_CAPTAIN',
  FLEET_SUPERINTENDENT = 'FLEET_SUPERINTENDENT',
  // Specialized roles
  INSURER = 'INSURER',
  MTO = 'MTO',
  // Charter market roles
  CHARTERER = 'CHARTERER',
  BROKER = 'BROKER'
}

export enum UserRank {
  CAPTAIN = 'Captain',
  CHIEF_OFFICER = 'Chief Officer',
  SECOND_OFFICER = 'Second Officer',
  THIRD_OFFICER = 'Third Officer',
  CHIEF_ENGINEER = 'Chief Engineer',
  SECOND_ENGINEER = 'Second Engineer',
  THIRD_ENGINEER = 'Third Engineer',
  ELECTRICIAN = 'Electrician',
  BOSUN = 'Bosun',
  ABLE_SEAMAN = 'Able Seaman',
  ORDINARY_SEAMAN = 'Ordinary Seaman',
  CADET = 'Cadet',
}

export enum UserPosition {
  FLEET_MANAGER = 'Fleet Manager',
  OPERATIONS_MANAGER = 'Operations Manager',
  OPERATIONS_SUPERINTENDENT = 'Operations Superintendent',
  TECHNICAL_SUPERINTENDENT = 'Technical Superintendent',
  CHARTERING_MANAGER = 'Chartering Manager',
  FINANCE_MANAGER = 'Finance Manager',
  HR_MANAGER = 'HR Manager',
  IT_ADMIN = 'IT Admin',
  VERIFIER = 'Verifier',
  AUDITOR = 'Auditor',
  PRODUCT_MANAGER = 'Product Manager',
  COMPLIANCE_MANAGER = 'Compliance Manager',
  INSURANCE_UNDERWRITER = 'Insurance Underwriter',
  LOGISTICS_COORDINATOR = 'Logistics Coordinator',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationId: string;
  shipId?: string;
  rank?: UserRank;
  position?: UserPosition;
  avatarUrl?: string;
  preferences?: {
    theme?: 'light' | 'dark';
    language?: string;
    timezone?: string;
  };
  certifications?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface UserContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  switchUserRole: (role: UserRole) => void;
  switchToUser: (payload: Partial<User> & { email: string; firstName: string; lastName: string; role: UserRole }) => void;
  updatePreferences: (preferences: Partial<User['preferences']>) => void;
  dashboardConfig: any;
  hasPermission: (permission: string) => boolean;
  getVesselSpecificData: (data: any[], dataType: 'voyages' | 'tasks' | 'performance') => any[];
  getShipName: () => string;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Theme management function
const applyTheme = (theme: 'light' | 'dark') => {
  const root = document.documentElement;
  if (theme === 'light') {
    root.style.setProperty('--bg-primary', '#F5F5F5');
    root.style.setProperty('--bg-secondary', '#FFFFFF');
    root.style.setProperty('--bg-card', '#FFFFFF');
    root.style.setProperty('--bg-subtle', '#E5E5E7');
    root.style.setProperty('--text-primary', '#1A1A1A');
    root.style.setProperty('--text-secondary', '#3A3A3C');
    root.style.setProperty('--text-muted', '#8E8E93');
    root.style.setProperty('--border-color', '#D1D1D6');
    root.setAttribute('data-theme', 'light');
  } else {
    root.style.setProperty('--bg-primary', '#0A0A0A');
    root.style.setProperty('--bg-secondary', '#111111');
    root.style.setProperty('--bg-card', '#1C1C1E');
    root.style.setProperty('--bg-subtle', '#3A3A3C');
    root.style.setProperty('--text-primary', '#FFFFFF');
    root.style.setProperty('--text-secondary', '#E5E5E7');
    root.style.setProperty('--text-muted', '#A1A1AA');
    root.style.setProperty('--border-color', '#2A2A2A');
    root.setAttribute('data-theme', 'dark');
  }
};

const demoUsers: Record<UserRole, User> = {
  [UserRole.CREW]: {
    id: 'user-crew-1',
    email: 'crew@poseidon.com',
    firstName: 'John',
    lastName: 'Doe',
    role: UserRole.CREW,
    organizationId: 'org-1',
    shipId: '9391001', // Aurora Spirit
    rank: UserRank.ABLE_SEAMAN,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  [UserRole.OFFICER]: {
    id: 'user-officer-1',
    email: 'officer@poseidon.com',
    firstName: 'Jane',
    lastName: 'Smith',
    role: UserRole.OFFICER,
    organizationId: 'org-1',
    shipId: '9391002', // Baltic Star
    rank: UserRank.CHIEF_OFFICER,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  [UserRole.ENGINEER]: {
    id: 'user-engineer-1',
    email: 'engineer@poseidon.com',
    firstName: 'Mike',
    lastName: 'Wong',
    role: UserRole.ENGINEER,
    organizationId: 'org-1',
    shipId: '9391003', // Coral Wave
    rank: UserRank.CHIEF_ENGINEER,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  [UserRole.MANAGER]: {
    id: 'user-manager-1',
    email: 'sarfaraz.akhtar@poseidon.com',
    firstName: 'Sarfaraz',
    lastName: 'Akhtar',
    role: UserRole.MANAGER,
    organizationId: 'org-1',
    position: UserPosition.FLEET_MANAGER,
    rank: UserRank.CAPTAIN,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  [UserRole.COMPLIANCE_OFFICER]: {
    id: 'user-compliance-1',
    email: 'vinay.chandra@poseidon.com',
    firstName: 'Vinay',
    lastName: 'Chandra',
    role: UserRole.COMPLIANCE_OFFICER,
    organizationId: 'org-1',
    position: UserPosition.COMPLIANCE_MANAGER,
    rank: UserRank.CAPTAIN,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  [UserRole.TRADER]: {
    id: 'user-trader-1',
    email: 'sravan.padavala@poseidon.com',
    firstName: 'Sravan',
    lastName: 'Padavala',
    role: UserRole.TRADER,
    organizationId: 'org-1',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  [UserRole.ADMIN]: {
    id: 'user-admin-1',
    email: 'sumit.redu@poseidon.com',
    firstName: 'Sumit',
    lastName: 'Redu',
    role: UserRole.ADMIN,
    organizationId: 'org-1',
    position: UserPosition.PRODUCT_MANAGER,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  [UserRole.CAPTAIN]: {
    id: 'user-captain-1',
    email: 'captain@poseidon.com',
    firstName: 'David',
    lastName: 'Anderson',
    role: UserRole.CAPTAIN,
    organizationId: 'org-1',
    shipId: '9391004', // Delta Horizon
    rank: UserRank.CAPTAIN,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  [UserRole.CHIEF_ENGINEER]: {
    id: 'user-chief-engineer-1',
    email: 'chief.engineer@poseidon.com',
    firstName: 'Maria',
    lastName: 'Rodriguez',
    role: UserRole.CHIEF_ENGINEER,
    organizationId: 'org-1',
    shipId: '9391005', // Eastern Crest
    rank: UserRank.CHIEF_ENGINEER,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  [UserRole.TECHNICAL_SUPERINTENDENT]: {
    id: 'user-tech-super-1',
    email: 'nitesh.chandak@poseidon.com',
    firstName: 'Nitesh',
    lastName: 'Chandak',
    role: UserRole.TECHNICAL_SUPERINTENDENT,
    organizationId: 'org-1',
    position: UserPosition.TECHNICAL_SUPERINTENDENT,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  [UserRole.OPERATIONS_SUPERINTENDENT]: {
    id: 'user-ops-super-1',
    email: 'nitin.singh@poseidon.com',
    firstName: 'Nitin',
    lastName: 'Singh',
    role: UserRole.OPERATIONS_SUPERINTENDENT,
    organizationId: 'org-1',
    position: UserPosition.OPERATIONS_SUPERINTENDENT,
    rank: UserRank.CAPTAIN,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  [UserRole.PORT_CAPTAIN]: {
    id: 'user-port-captain-1',
    email: 'port.captain@poseidon.com',
    firstName: 'Robert',
    lastName: 'Thompson',
    role: UserRole.PORT_CAPTAIN,
    organizationId: 'org-1',
    rank: UserRank.CAPTAIN,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  [UserRole.FLEET_SUPERINTENDENT]: {
    id: 'user-fleet-super-1',
    email: 'fleet.super@poseidon.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: UserRole.FLEET_SUPERINTENDENT,
    organizationId: 'org-1',
    rank: UserRank.CAPTAIN,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  [UserRole.INSURER]: {
    id: 'user-insurer-1',
    email: 'insurer@poseidon.com',
    firstName: 'Michael',
    lastName: 'Roberts',
    role: UserRole.INSURER,
    organizationId: 'org-1',
    position: UserPosition.INSURANCE_UNDERWRITER,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  [UserRole.MTO]: {
    id: 'user-mto-1',
    email: 'mto@poseidon.com',
    firstName: 'Elena',
    lastName: 'Martinez',
    role: UserRole.MTO,
    organizationId: 'org-1',
    position: UserPosition.LOGISTICS_COORDINATOR,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  [UserRole.GUEST]: {
    id: 'user-guest-1',
    email: 'guest@poseidon.com',
    firstName: 'Guest',
    lastName: 'User',
    role: UserRole.GUEST,
    organizationId: 'org-1',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Simulate loading user from local storage or session
    const storedIdentityRaw = localStorage.getItem('currentUserIdentity');
    if (storedIdentityRaw) {
      try {
        const parsed = JSON.parse(storedIdentityRaw);
        if (parsed && parsed.email && parsed.firstName && parsed.lastName && parsed.role) {
          // Minimal validation; fall back to role map if missing ids
          const base: User = {
            id: parsed.id || `user-${parsed.role}-local`,
            email: parsed.email,
            firstName: parsed.firstName,
            lastName: parsed.lastName,
            role: parsed.role as UserRole,
            organizationId: parsed.organizationId || 'org-1',
            shipId: parsed.shipId,
            rank: parsed.rank,
            position: parsed.position,
            avatarUrl: parsed.avatarUrl,
            preferences: parsed.preferences,
            certifications: parsed.certifications || [],
            isActive: parsed.isActive ?? true,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          setUser(base);
          // Ensure demo token is set for backend API calls
          if (!localStorage.getItem('accessToken')) {
            localStorage.setItem('accessToken', 'mock-token');
          }
          // Apply saved theme
          if (base.preferences?.theme) {
            applyTheme(base.preferences.theme);
          }
          return;
        }
      } catch (_) {
        // ignore parse error and fall back to role-based demo
      }
    }

    const storedUserRole = localStorage.getItem('currentUserRole') as UserRole;
    const isLoginRoute = typeof window !== 'undefined' && window.location && window.location.hash.endsWith('/login');
    if (!isLoginRoute && storedUserRole && demoUsers[storedUserRole]) {
      setUser(demoUsers[storedUserRole]);
      // Ensure demo token is set for backend API calls
      if (!localStorage.getItem('accessToken')) {
        localStorage.setItem('accessToken', 'mock-token');
      }
    } else {
      // No default user; require login
      setUser(null);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Call backend auth service with credentials to enable cookie handling
      const response = await fetch('http://localhost:8080/auth/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // CRITICAL: Enable cookies for K8s/production deployment
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Invalid credentials' }));
        throw new Error(errorData.message || 'Invalid credentials');
      }

      const data = await response.json();
      
      // Note: JWT tokens are now in HTTP-only cookies (secure, K8s ready)
      // No localStorage usage for tokens in production

      // Map backend user to frontend user format
      const backendUser = data.data?.user;
      if (backendUser) {
        const mappedUser: User = {
          id: backendUser.id,
          email: backendUser.email,
          firstName: backendUser.first_name,
          lastName: backendUser.last_name,
          role: backendUser.role as UserRole,
          organizationId: backendUser.organization_id || 'org-1',
          shipId: backendUser.ship_id,
          rank: backendUser.rank as UserRank,
          position: backendUser.position as UserPosition,
          isActive: backendUser.is_active,
          createdAt: new Date(backendUser.created_at),
          updatedAt: new Date(backendUser.updated_at || backendUser.created_at),
        };
        setUser(mappedUser);
        localStorage.setItem('currentUserRole', mappedUser.role);
        localStorage.setItem('currentUserIdentity', JSON.stringify(mappedUser));
        // Set a flag to indicate backend authentication is active
        localStorage.setItem('backendAuth', 'true');
      } else {
        throw new Error('No user data returned from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call backend to clear session and cookies
      await fetch('http://localhost:8080/auth/api/auth/logout', {
        method: 'POST',
        credentials: 'include', // Include cookies for proper logout
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state
      setUser(null);
      localStorage.removeItem('currentUserRole');
      localStorage.removeItem('currentUserIdentity');
      localStorage.removeItem('accessToken'); // Clear demo token
    }
  };

  const switchUserRole = (role: UserRole) => {
    if (demoUsers[role]) {
      setUser(demoUsers[role]);
      localStorage.setItem('currentUserRole', role);
      // Store demo token for backend API calls
      localStorage.setItem('accessToken', 'mock-token');
      // also clear identity to avoid stale overrides
      localStorage.removeItem('currentUserIdentity');
    } else {
      console.error(`Role ${role} not found in demo users.`);
    }
  };

  const switchToUser = (payload: Partial<User> & { email: string; firstName: string; lastName: string; role: UserRole }) => {
    const identity: User = {
      id: payload.id || `user-${payload.email}`,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      role: payload.role,
      organizationId: payload.organizationId || 'org-1',
      shipId: payload.shipId,
      rank: payload.rank,
      position: payload.position,
      avatarUrl: payload.avatarUrl,
      preferences: payload.preferences,
      certifications: payload.certifications || [],
      isActive: payload.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setUser(identity);
    localStorage.setItem('currentUserIdentity', JSON.stringify(identity));
    localStorage.setItem('currentUserRole', identity.role);
    // Store demo token for backend API calls
    localStorage.setItem('accessToken', 'mock-token');
  };

  const updatePreferences = (preferences: Partial<User['preferences']>) => {
    if (!user) return;
    const updatedUser: User = {
      ...user,
      preferences: {
        ...user.preferences,
        ...preferences
      },
      updatedAt: new Date()
    };
    setUser(updatedUser);
    localStorage.setItem('currentUserIdentity', JSON.stringify(updatedUser));
    
    // Apply theme immediately if provided
    if (preferences.theme) {
      applyTheme(preferences.theme);
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    // For now, return true for all permissions - in a real app this would check against user permissions
    return true;
  };

  const getDashboardConfig = () => {
    if (!user) return { layout: 'grid', columns: 3, widgets: [] };

    // Use the imported default configurations
    const defaultConfig = DEFAULT_DASHBOARD_CONFIGS[user.role] || DEFAULT_DASHBOARD_CONFIGS[UserRole.CREW];
    
    // Check for saved user settings from ProfileSettings
    const savedSettings = localStorage.getItem('userSettings');
    let customLayout = defaultConfig.layout || 'grid';
    let customColumns = defaultConfig.columns || 3;
    
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        // Map dashboardLayout from ProfileSettings to layout for DashboardConfig
        if (parsed.dashboardLayout) {
          customLayout = parsed.dashboardLayout;
        }
        if (parsed.columns) {
          customColumns = parsed.columns;
        }
      } catch (e) {
        console.error('Failed to parse saved settings', e);
      }
    }
    
    return {
      layout: customLayout,
      columns: customColumns,
      widgets: defaultConfig.widgets || [],
      showFinancialData: defaultConfig.showFinancialData || false,
      showComplianceData: defaultConfig.showComplianceData || false,
      showCrewData: defaultConfig.showCrewData || true,
      showTechnicalData: defaultConfig.showTechnicalData || true
    };
  };

  const dashboardConfig = getDashboardConfig();

  // Helper function to get vessel-specific data
  const getVesselSpecificData = (data: any[], dataType: 'voyages' | 'tasks' | 'performance') => {
    if (!user?.shipId) return data;
    
    switch (dataType) {
      case 'voyages':
        return data.filter((item: any) => item.imo === user.shipId);
      case 'tasks':
        return data.filter((item: any) => item.shipId === user.shipId);
      case 'performance':
        return data.filter((item: any) => item.shipId === user.shipId);
      default:
        return data;
    }
  };

  // Helper function to get ship name
  const getShipName = () => {
    if (!user?.shipId) return 'Unknown Vessel';
    
    const shipNames: Record<string, string> = {
      '9391001': 'Aurora Spirit',
      '9391002': 'Baltic Star',
      '9391003': 'Coral Wave',
      '9391004': 'Delta Horizon',
      '9391005': 'Eastern Crest',
      '9391006': 'Fjord Runner',
      '9391007': 'Gulf Pioneer'
    };
    
    return shipNames[user.shipId] || 'Unknown Vessel';
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      login, 
      logout, 
      switchUserRole,
      switchToUser,
      updatePreferences,
      dashboardConfig, 
      hasPermission,
      getVesselSpecificData,
      getShipName
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
