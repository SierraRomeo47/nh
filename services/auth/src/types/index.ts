// Role-based permission mappings - Marine Industry Specific
export enum Permission {
  // Dashboard Permissions
  VIEW_DASHBOARD = 'VIEW_DASHBOARD',
  VIEW_FLEET_OVERVIEW = 'VIEW_FLEET_OVERVIEW',
  VIEW_FINANCIAL_DATA = 'VIEW_FINANCIAL_DATA',
  VIEW_COMPLIANCE_DATA = 'VIEW_COMPLIANCE_DATA',
  
  // Voyage Permissions
  VIEW_VOYAGES = 'VIEW_VOYAGES',
  CREATE_VOYAGES = 'CREATE_VOYAGES',
  EDIT_VOYAGES = 'EDIT_VOYAGES',
  DELETE_VOYAGES = 'DELETE_VOYAGES',
  
  // Fuel Permissions
  VIEW_FUEL_DATA = 'VIEW_FUEL_DATA',
  ENTER_FUEL_CONSUMPTION = 'ENTER_FUEL_CONSUMPTION',
  EDIT_FUEL_DATA = 'EDIT_FUEL_DATA',
  VERIFY_FUEL_DATA = 'VERIFY_FUEL_DATA',
  
  // RFQ Permissions
  VIEW_RFQ_BOARD = 'VIEW_RFQ_BOARD',
  CREATE_RFQ = 'CREATE_RFQ',
  RESPOND_TO_RFQ = 'RESPOND_TO_RFQ',
  MANAGE_RFQ = 'MANAGE_RFQ',
  
  // Crew Portal Permissions
  VIEW_CREW_TASKS = 'VIEW_CREW_TASKS',
  ASSIGN_TASKS = 'ASSIGN_TASKS',
  COMPLETE_TASKS = 'COMPLETE_TASKS',
  VIEW_LEAGUE = 'VIEW_LEAGUE',
  
  // Settings Permissions
  VIEW_SETTINGS = 'VIEW_SETTINGS',
  EDIT_USER_PROFILE = 'EDIT_USER_PROFILE',
  MANAGE_USERS = 'MANAGE_USERS',
  SYSTEM_ADMIN = 'SYSTEM_ADMIN',
  
  // Marine Engineering Permissions
  MANAGE_WHR_SYSTEMS = 'MANAGE_WHR_SYSTEMS',
  VIEW_ENGINE_STATUS = 'VIEW_ENGINE_STATUS',
  MANAGE_MAINTENANCE = 'MANAGE_MAINTENANCE',
  VIEW_EMISSIONS_DATA = 'VIEW_EMISSIONS_DATA',
  
  // Compliance Permissions
  VIEW_REGULATIONS = 'VIEW_REGULATIONS',
  MANAGE_COMPLIANCE = 'MANAGE_COMPLIANCE',
  GENERATE_COMPLIANCE_REPORTS = 'GENERATE_COMPLIANCE_REPORTS',
  
  // Customization Permissions
  CUSTOMIZE_DASHBOARD = 'CUSTOMIZE_DASHBOARD',
  MANAGE_PROFILE_SETTINGS = 'MANAGE_PROFILE_SETTINGS',
  
  // Additional permissions
  ASSIGN_VERIFIER = 'ASSIGN_VERIFIER',
  PLAN_SURRENDER = 'PLAN_SURRENDER'
}

export enum UserRole {
  CREW = 'CREW',
  OFFICER = 'OFFICER',
  ENGINEER = 'ENGINEER',
  MANAGER = 'MANAGER',
  COMPLIANCE_OFFICER = 'COMPLIANCE_OFFICER',
  TRADER = 'TRADER',
  ADMIN = 'ADMIN',
  GUEST = 'GUEST',
  CAPTAIN = 'CAPTAIN',
  CHIEF_ENGINEER = 'CHIEF_ENGINEER',
  TECHNICAL_SUPERINTENDENT = 'TECHNICAL_SUPERINTENDENT',
  OPERATIONS_SUPERINTENDENT = 'OPERATIONS_SUPERINTENDENT',
  PORT_CAPTAIN = 'PORT_CAPTAIN',
  FLEET_SUPERINTENDENT = 'FLEET_SUPERINTENDENT'
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.CREW]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_CREW_TASKS,
    Permission.COMPLETE_TASKS,
    Permission.VIEW_LEAGUE,
    Permission.VIEW_FUEL_DATA,
    Permission.ENTER_FUEL_CONSUMPTION,
    Permission.EDIT_USER_PROFILE,
    Permission.CUSTOMIZE_DASHBOARD
  ],
  
  [UserRole.OFFICER]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_FLEET_OVERVIEW,
    Permission.VIEW_VOYAGES,
    Permission.VIEW_FUEL_DATA,
    Permission.ENTER_FUEL_CONSUMPTION,
    Permission.EDIT_FUEL_DATA,
    Permission.VIEW_CREW_TASKS,
    Permission.ASSIGN_TASKS,
    Permission.VIEW_LEAGUE,
    Permission.VIEW_EMISSIONS_DATA,
    Permission.EDIT_USER_PROFILE,
    Permission.CUSTOMIZE_DASHBOARD
  ],
  
  [UserRole.ENGINEER]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_VOYAGES,
    Permission.VIEW_FUEL_DATA,
    Permission.ENTER_FUEL_CONSUMPTION,
    Permission.EDIT_FUEL_DATA,
    Permission.VIEW_CREW_TASKS,
    Permission.COMPLETE_TASKS,
    Permission.VIEW_LEAGUE,
    Permission.MANAGE_WHR_SYSTEMS,
    Permission.VIEW_ENGINE_STATUS,
    Permission.MANAGE_MAINTENANCE,
    Permission.VIEW_EMISSIONS_DATA,
    Permission.VIEW_REGULATIONS,
    Permission.EDIT_USER_PROFILE,
    Permission.CUSTOMIZE_DASHBOARD
  ],
  
  [UserRole.CAPTAIN]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_FLEET_OVERVIEW,
    Permission.VIEW_VOYAGES,
    Permission.CREATE_VOYAGES,
    Permission.EDIT_VOYAGES,
    Permission.VIEW_FUEL_DATA,
    Permission.EDIT_FUEL_DATA,
    Permission.VIEW_CREW_TASKS,
    Permission.ASSIGN_TASKS,
    Permission.VIEW_LEAGUE,
    Permission.VIEW_EMISSIONS_DATA,
    Permission.VIEW_REGULATIONS,
    Permission.EDIT_USER_PROFILE,
    Permission.CUSTOMIZE_DASHBOARD
  ],
  
  [UserRole.CHIEF_ENGINEER]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_FLEET_OVERVIEW,
    Permission.VIEW_VOYAGES,
    Permission.VIEW_FUEL_DATA,
    Permission.EDIT_FUEL_DATA,
    Permission.VIEW_CREW_TASKS,
    Permission.ASSIGN_TASKS,
    Permission.VIEW_LEAGUE,
    Permission.MANAGE_WHR_SYSTEMS,
    Permission.VIEW_ENGINE_STATUS,
    Permission.MANAGE_MAINTENANCE,
    Permission.VIEW_EMISSIONS_DATA,
    Permission.VIEW_REGULATIONS,
    Permission.MANAGE_COMPLIANCE,
    Permission.EDIT_USER_PROFILE,
    Permission.CUSTOMIZE_DASHBOARD
  ],
  
  [UserRole.MANAGER]: [
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
    Permission.VIEW_EMISSIONS_DATA,
    Permission.VIEW_REGULATIONS,
    Permission.MANAGE_COMPLIANCE,
    Permission.VIEW_SETTINGS,
    Permission.EDIT_USER_PROFILE,
    Permission.CUSTOMIZE_DASHBOARD,
    Permission.PLAN_SURRENDER
  ],
  
  [UserRole.COMPLIANCE_OFFICER]: [
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
    Permission.VIEW_EMISSIONS_DATA,
    Permission.VIEW_REGULATIONS,
    Permission.MANAGE_COMPLIANCE,
    Permission.GENERATE_COMPLIANCE_REPORTS,
    Permission.VIEW_SETTINGS,
    Permission.EDIT_USER_PROFILE,
    Permission.CUSTOMIZE_DASHBOARD,
    Permission.ASSIGN_VERIFIER,
    Permission.PLAN_SURRENDER
  ],
  
  [UserRole.TRADER]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_FINANCIAL_DATA,
    Permission.VIEW_RFQ_BOARD,
    Permission.CREATE_RFQ,
    Permission.RESPOND_TO_RFQ,
    Permission.MANAGE_RFQ,
    Permission.VIEW_EMISSIONS_DATA,
    Permission.VIEW_SETTINGS,
    Permission.EDIT_USER_PROFILE,
    Permission.CUSTOMIZE_DASHBOARD
  ],
  
  [UserRole.TECHNICAL_SUPERINTENDENT]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_FLEET_OVERVIEW,
    Permission.VIEW_VOYAGES,
    Permission.VIEW_FUEL_DATA,
    Permission.EDIT_FUEL_DATA,
    Permission.VIEW_CREW_TASKS,
    Permission.ASSIGN_TASKS,
    Permission.MANAGE_WHR_SYSTEMS,
    Permission.VIEW_ENGINE_STATUS,
    Permission.MANAGE_MAINTENANCE,
    Permission.VIEW_EMISSIONS_DATA,
    Permission.VIEW_REGULATIONS,
    Permission.MANAGE_COMPLIANCE,
    Permission.VIEW_SETTINGS,
    Permission.EDIT_USER_PROFILE,
    Permission.CUSTOMIZE_DASHBOARD
  ],
  
  [UserRole.ADMIN]: [
    ...Object.values(Permission)
  ],
  
  [UserRole.GUEST]: [
    Permission.VIEW_DASHBOARD
  ],
  
  [UserRole.OPERATIONS_SUPERINTENDENT]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_FLEET_OVERVIEW,
    Permission.VIEW_VOYAGES,
    Permission.VIEW_CREW_TASKS,
    Permission.ASSIGN_TASKS,
    Permission.VIEW_SETTINGS,
    Permission.EDIT_USER_PROFILE,
    Permission.CUSTOMIZE_DASHBOARD
  ],
  
  [UserRole.PORT_CAPTAIN]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_VOYAGES,
    Permission.VIEW_CREW_TASKS,
    Permission.VIEW_SETTINGS,
    Permission.EDIT_USER_PROFILE,
    Permission.CUSTOMIZE_DASHBOARD
  ],
  
  [UserRole.FLEET_SUPERINTENDENT]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_FLEET_OVERVIEW,
    Permission.VIEW_VOYAGES,
    Permission.MANAGE_MAINTENANCE,
    Permission.VIEW_SETTINGS,
    Permission.EDIT_USER_PROFILE,
    Permission.CUSTOMIZE_DASHBOARD
  ]
};
