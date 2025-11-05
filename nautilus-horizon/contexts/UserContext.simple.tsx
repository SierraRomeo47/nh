// Simplified User Context for the Nautilus Horizon App

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export enum UserRole {
  CREW = 'CREW',
  OFFICER = 'OFFICER',
  ENGINEER = 'ENGINEER',
  MANAGER = 'MANAGER',
  COMPLIANCE_OFFICER = 'COMPLIANCE_OFFICER',
  TRADER = 'TRADER',
  ADMIN = 'ADMIN',
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
  TECHNICAL_SUPERINTENDENT = 'Technical Superintendent',
  CHARTERING_MANAGER = 'Chartering Manager',
  FINANCE_MANAGER = 'Finance Manager',
  HR_MANAGER = 'HR Manager',
  IT_ADMIN = 'IT Admin',
  VERIFIER = 'Verifier',
  AUDITOR = 'Auditor',
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
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const demoUsers: Record<UserRole, User> = {
  [UserRole.CREW]: {
    id: 'user-crew-1',
    email: 'crew@poseidon.com',
    firstName: 'John',
    lastName: 'Doe',
    role: UserRole.CREW,
    organizationId: 'org-1',
    shipId: 'ship-1',
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
    shipId: 'ship-1',
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
    shipId: 'ship-1',
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
    position: UserPosition.VERIFIER,
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
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Simulate loading user from local storage or session
    const storedUserRole = localStorage.getItem('currentUserRole') as UserRole;
    if (storedUserRole && demoUsers[storedUserRole]) {
      setUser(demoUsers[storedUserRole]);
    } else {
      // Default to Compliance Officer for initial load
      setUser(demoUsers[UserRole.COMPLIANCE_OFFICER]);
      localStorage.setItem('currentUserRole', UserRole.COMPLIANCE_OFFICER);
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate API call
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        const foundUser = Object.values(demoUsers).find(u => u.email === email);
        if (foundUser && password === 'password') {
          setUser(foundUser);
          localStorage.setItem('currentUserRole', foundUser.role);
          resolve();
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 500);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUserRole');
  };

  const switchUserRole = (role: UserRole) => {
    if (demoUsers[role]) {
      setUser(demoUsers[role]);
      localStorage.setItem('currentUserRole', role);
    } else {
      console.error(`Role ${role} not found in demo users.`);
    }
  };

  return (
    <UserContext.Provider value={{ user, login, logout, switchUserRole }}>
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


