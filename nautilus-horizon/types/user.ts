// User Profile and Role Management System

export enum UserRole {
  CREW = 'CREW',
  OFFICER = 'OFFICER',
  ENGINEER = 'ENGINEER',
  MANAGER = 'MANAGER',
  COMPLIANCE_OFFICER = 'COMPLIANCE_OFFICER',
  TRADER = 'TRADER',
  ADMIN = 'ADMIN',
  GUEST = 'GUEST',
  // Marine-specific roles
  CAPTAIN = 'CAPTAIN',
  CHIEF_ENGINEER = 'CHIEF_ENGINEER',
  TECHNICAL_SUPERINTENDENT = 'TECHNICAL_SUPERINTENDENT',
  OPERATIONS_SUPERINTENDENT = 'OPERATIONS_SUPERINTENDENT',
  PORT_CAPTAIN = 'PORT_CAPTAIN',
  FLEET_SUPERINTENDENT = 'FLEET_SUPERINTENDENT',
  // Specialized roles
  INSURER = 'INSURER',
  MTO = 'MTO',  // Multimodal Transport Operator
  // Charter market roles
  CHARTERER = 'CHARTERER',  // Cargo owners seeking vessels
  BROKER = 'BROKER'  // Ship brokers facilitating charter deals
}

export enum UserDepartment {
  DECK = 'DECK',
  ENGINE = 'ENGINE',
  GALLEY = 'GALLEY',
  MANAGEMENT = 'MANAGEMENT',
  COMPLIANCE = 'COMPLIANCE',
  TRADING = 'TRADING',
  INSURANCE = 'INSURANCE',
  LOGISTICS = 'LOGISTICS',
  IT = 'IT',
  HR = 'HR'
}

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
  
  // Insurance Permissions
  VIEW_INSURANCE_QUOTES = 'VIEW_INSURANCE_QUOTES',
  CREATE_INSURANCE_QUOTE = 'CREATE_INSURANCE_QUOTE',
  MANAGE_INSURANCE_POLICIES = 'MANAGE_INSURANCE_POLICIES',
  VIEW_RISK_ASSESSMENT = 'VIEW_RISK_ASSESSMENT',
  APPROVE_INSURANCE_CLAIMS = 'APPROVE_INSURANCE_CLAIMS',
  
  // MTO (Multimodal Transport Operator) Permissions
  MANAGE_CARGO_OPERATIONS = 'MANAGE_CARGO_OPERATIONS',
  COORDINATE_INTERMODAL_TRANSPORT = 'COORDINATE_INTERMODAL_TRANSPORT',
  MANAGE_DOCUMENTATION = 'MANAGE_DOCUMENTATION',
  TRACK_SHIPMENTS = 'TRACK_SHIPMENTS',
  OPTIMIZE_ROUTES = 'OPTIMIZE_ROUTES',
  
  // Charter and Broker Permissions
  VIEW_CHARTER_MARKET = 'VIEW_CHARTER_MARKET',
  CREATE_CHARTER_RFQ = 'CREATE_CHARTER_RFQ',
  SUBMIT_BID = 'SUBMIT_BID',
  ACCEPT_BID = 'ACCEPT_BID',
  REJECT_BID = 'REJECT_BID',
  COUNTER_OFFER = 'COUNTER_OFFER',
  VIEW_VOYAGE_ESTIMATES = 'VIEW_VOYAGE_ESTIMATES',
  CREATE_VOYAGE_ESTIMATES = 'CREATE_VOYAGE_ESTIMATES',
  ACCESS_CHARTER_CHAT = 'ACCESS_CHARTER_CHAT',
  MANAGE_FIXTURE = 'MANAGE_FIXTURE',
  VIEW_TONNAGE_LIST = 'VIEW_TONNAGE_LIST',
  MANAGE_VESSEL_POSITIONS = 'MANAGE_VESSEL_POSITIONS'
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  department: UserDepartment;
  organizationId: string;
  shipId?: string; // For crew members assigned to specific ships
  
  // Profile Information
  avatar?: string;
  phoneNumber?: string;
  position?: string;
  rank?: string;
  licenseNumber?: string;
  certifications?: string[];
  
  // Preferences
  language: string;
  timezone: string;
  theme: 'light' | 'dark' | 'auto';
  dashboardLayout: string;
  
  // Permissions
  permissions: Permission[];
  
  // Status
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface DashboardConfig {
  id: string;
  userId: string;
  role: UserRole;
  
  // Dashboard Layout
  layout: 'grid' | 'list' | 'compact';
  columns: number;
  
  // Widget Configuration
  widgets: DashboardWidget[];
  
  // Visibility Settings
  showFinancialData: boolean;
  showComplianceData: boolean;
  showCrewData: boolean;
  showTechnicalData: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  position: { x: number; y: number; w: number; h: number };
  config: Record<string, any>;
  isVisible: boolean;
}

export enum WidgetType {
  // Fleet Overview
  FLEET_OVERVIEW = 'FLEET_OVERVIEW',
  ACTIVE_VOYAGES = 'ACTIVE_VOYAGES',
  COMPLIANCE_STATUS = 'COMPLIANCE_STATUS',
  
  // Financial
  TCC_METER = 'TCC_METER',
  EUA_PRICE = 'EUA_PRICE',
  FUEL_COSTS = 'FUEL_COSTS',
  FINANCIAL_SUMMARY = 'FINANCIAL_SUMMARY',
  
  // Crew Specific
  MY_TASKS = 'MY_TASKS',
  CREW_LEAGUE = 'CREW_LEAGUE',
  PERFORMANCE_METRICS = 'PERFORMANCE_METRICS',
  SCHEDULE = 'SCHEDULE',
  
  // Technical
  ENGINE_STATUS = 'ENGINE_STATUS',
  FUEL_CONSUMPTION = 'FUEL_CONSUMPTION',
  EFFICIENCY_METRICS = 'EFFICIENCY_METRICS',
  MAINTENANCE_ALERTS = 'MAINTENANCE_ALERTS',
  
  // Compliance
  COMPLIANCE_ALERTS = 'COMPLIANCE_ALERTS',
  VERIFICATION_STATUS = 'VERIFICATION_STATUS',
  REGULATORY_DEADLINES = 'REGULATORY_DEADLINES',
  
  // Trading
  RFQ_BOARD = 'RFQ_BOARD',
  TRADING_OPPORTUNITIES = 'TRADING_OPPORTUNITIES',
  MARKET_DATA = 'MARKET_DATA',
  
  // Marine Engineering (New)
  WASTE_HEAT_RECOVERY = 'WASTE_HEAT_RECOVERY',
  EMISSIONS_MONITORING = 'EMISSIONS_MONITORING',
  REGULATIONS_COMPLIANCE = 'REGULATIONS_COMPLIANCE',
  TECHNICAL_PERFORMANCE = 'TECHNICAL_PERFORMANCE',
  SAFETY_METRICS = 'SAFETY_METRICS',
  MARINE_WEATHER = 'MARINE_WEATHER',
  NAVIGATION_STATUS = 'NAVIGATION_STATUS',
  CARGO_MANAGEMENT = 'CARGO_MANAGEMENT',
  
  // Customization
  CUSTOM_WIDGET = 'CUSTOM_WIDGET',
  PROFILE_SETTINGS = 'PROFILE_SETTINGS'
}

// Role-based permission mappings - Marine Industry Specific
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.CREW]: [
    // Core crew permissions - focused on operational tasks
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
    // Deck officer permissions - navigation and crew management
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
    // Marine engineer permissions - technical systems and maintenance
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
    // Captain permissions - overall vessel responsibility
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
    // Chief engineer permissions - technical department leadership
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
    // Fleet manager permissions - operational and financial oversight
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
    Permission.CUSTOMIZE_DASHBOARD
  ],
  
  [UserRole.COMPLIANCE_OFFICER]: [
    // Compliance officer permissions - regulatory compliance focus
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
    Permission.CUSTOMIZE_DASHBOARD
  ],
  
  [UserRole.TRADER]: [
    // Trader permissions - focused on emissions trading and RFQ management
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
    // Technical superintendent permissions - technical oversight and maintenance
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
  
  [UserRole.OPERATIONS_SUPERINTENDENT]: [
    // Operations superintendent permissions - operational oversight
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_FLEET_OVERVIEW,
    Permission.VIEW_FINANCIAL_DATA,
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
    Permission.MANAGE_COMPLIANCE,
    Permission.VIEW_SETTINGS,
    Permission.EDIT_USER_PROFILE,
    Permission.CUSTOMIZE_DASHBOARD
  ],
  
  [UserRole.PORT_CAPTAIN]: [
    // Port captain permissions - port operations and vessel oversight
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
    Permission.MANAGE_COMPLIANCE,
    Permission.VIEW_SETTINGS,
    Permission.EDIT_USER_PROFILE,
    Permission.CUSTOMIZE_DASHBOARD
  ],
  
  [UserRole.FLEET_SUPERINTENDENT]: [
    // Fleet superintendent permissions - full fleet management
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_FLEET_OVERVIEW,
    Permission.VIEW_FINANCIAL_DATA,
    Permission.VIEW_COMPLIANCE_DATA,
    Permission.VIEW_VOYAGES,
    Permission.CREATE_VOYAGES,
    Permission.EDIT_VOYAGES,
    Permission.DELETE_VOYAGES,
    Permission.VIEW_FUEL_DATA,
    Permission.EDIT_FUEL_DATA,
    Permission.VIEW_RFQ_BOARD,
    Permission.CREATE_RFQ,
    Permission.MANAGE_RFQ,
    Permission.VIEW_CREW_TASKS,
    Permission.ASSIGN_TASKS,
    Permission.VIEW_LEAGUE,
    Permission.MANAGE_WHR_SYSTEMS,
    Permission.VIEW_ENGINE_STATUS,
    Permission.MANAGE_MAINTENANCE,
    Permission.VIEW_EMISSIONS_DATA,
    Permission.VIEW_REGULATIONS,
    Permission.MANAGE_COMPLIANCE,
    Permission.GENERATE_COMPLIANCE_REPORTS,
    Permission.VIEW_SETTINGS,
    Permission.EDIT_USER_PROFILE,
    Permission.CUSTOMIZE_DASHBOARD
  ],
  
  [UserRole.INSURER]: [
    // Maritime Insurer permissions - insurance quotes and risk assessment
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_FLEET_OVERVIEW,
    Permission.VIEW_FINANCIAL_DATA,
    Permission.VIEW_VOYAGES,
    Permission.VIEW_FUEL_DATA,
    Permission.VIEW_COMPLIANCE_DATA,
    Permission.VIEW_EMISSIONS_DATA,
    Permission.VIEW_REGULATIONS,
    Permission.VIEW_INSURANCE_QUOTES,
    Permission.CREATE_INSURANCE_QUOTE,
    Permission.MANAGE_INSURANCE_POLICIES,
    Permission.VIEW_RISK_ASSESSMENT,
    Permission.APPROVE_INSURANCE_CLAIMS,
    Permission.VIEW_SETTINGS,
    Permission.EDIT_USER_PROFILE,
    Permission.CUSTOMIZE_DASHBOARD
  ],
  
  [UserRole.MTO]: [
    // Multimodal Transport Operator permissions - end-to-end logistics
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_FLEET_OVERVIEW,
    Permission.VIEW_FINANCIAL_DATA,
    Permission.VIEW_VOYAGES,
    Permission.CREATE_VOYAGES,
    Permission.EDIT_VOYAGES,
    Permission.VIEW_FUEL_DATA,
    Permission.VIEW_COMPLIANCE_DATA,
    Permission.VIEW_REGULATIONS,
    Permission.MANAGE_COMPLIANCE,
    Permission.MANAGE_CARGO_OPERATIONS,
    Permission.COORDINATE_INTERMODAL_TRANSPORT,
    Permission.MANAGE_DOCUMENTATION,
    Permission.TRACK_SHIPMENTS,
    Permission.OPTIMIZE_ROUTES,
    Permission.VIEW_SETTINGS,
    Permission.EDIT_USER_PROFILE,
    Permission.CUSTOMIZE_DASHBOARD
  ],
  
  [UserRole.ADMIN]: [
    // Admin has all permissions
    ...Object.values(Permission)
  ],
  
  [UserRole.CHARTERER]: [
    // Charterer permissions - cargo owners seeking vessel space
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_FINANCIAL_DATA,
    Permission.VIEW_VOYAGES,
    Permission.VIEW_CHARTER_MARKET,
    Permission.CREATE_CHARTER_RFQ,
    Permission.VIEW_VOYAGE_ESTIMATES,
    Permission.ACCEPT_BID,
    Permission.REJECT_BID,
    Permission.COUNTER_OFFER,
    Permission.ACCESS_CHARTER_CHAT,
    Permission.MANAGE_FIXTURE,
    Permission.VIEW_TONNAGE_LIST,
    Permission.VIEW_SETTINGS,
    Permission.EDIT_USER_PROFILE,
    Permission.CUSTOMIZE_DASHBOARD
  ],
  
  [UserRole.BROKER]: [
    // Broker permissions - facilitating charter deals between owners and charterers
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_FINANCIAL_DATA,
    Permission.VIEW_FLEET_OVERVIEW,
    Permission.VIEW_VOYAGES,
    Permission.VIEW_CHARTER_MARKET,
    Permission.CREATE_CHARTER_RFQ,
    Permission.SUBMIT_BID,
    Permission.VIEW_VOYAGE_ESTIMATES,
    Permission.CREATE_VOYAGE_ESTIMATES,
    Permission.ACCEPT_BID,
    Permission.REJECT_BID,
    Permission.COUNTER_OFFER,
    Permission.ACCESS_CHARTER_CHAT,
    Permission.MANAGE_FIXTURE,
    Permission.VIEW_TONNAGE_LIST,
    Permission.MANAGE_VESSEL_POSITIONS,
    Permission.VIEW_SETTINGS,
    Permission.EDIT_USER_PROFILE,
    Permission.CUSTOMIZE_DASHBOARD
  ],
  
  [UserRole.GUEST]: [
    Permission.VIEW_DASHBOARD
  ]
};

// Default dashboard configurations for each role - Marine Industry Specific
export const DEFAULT_DASHBOARD_CONFIGS: Record<UserRole, Partial<DashboardConfig>> = {
  [UserRole.CREW]: {
    layout: 'compact',
    columns: 2,
    showFinancialData: false,
    showComplianceData: false,
    showCrewData: true,
    showTechnicalData: true,
    widgets: [
      { id: 'my-tasks', type: WidgetType.MY_TASKS, title: 'My Tasks', position: { x: 0, y: 0, w: 1, h: 2 }, config: {}, isVisible: true },
      { id: 'crew-league', type: WidgetType.CREW_LEAGUE, title: 'Crew League', position: { x: 1, y: 0, w: 1, h: 2 }, config: {}, isVisible: true },
      { id: 'fuel-consumption', type: WidgetType.FUEL_CONSUMPTION, title: 'Fuel Consumption', position: { x: 0, y: 2, w: 2, h: 1 }, config: {}, isVisible: true },
      { id: 'safety-metrics', type: WidgetType.SAFETY_METRICS, title: 'Safety Metrics', position: { x: 0, y: 3, w: 2, h: 1 }, config: {}, isVisible: true }
    ]
  },
  
  [UserRole.OFFICER]: {
    layout: 'grid',
    columns: 3,
    showFinancialData: false,
    showComplianceData: true,
    showCrewData: true,
    showTechnicalData: true,
    widgets: [
      { id: 'fleet-overview', type: WidgetType.FLEET_OVERVIEW, title: 'Fleet Overview', position: { x: 0, y: 0, w: 2, h: 1 }, config: {}, isVisible: true },
      { id: 'active-voyages', type: WidgetType.ACTIVE_VOYAGES, title: 'Active Voyages', position: { x: 2, y: 0, w: 1, h: 1 }, config: {}, isVisible: true },
      { id: 'crew-tasks', type: WidgetType.MY_TASKS, title: 'Crew Tasks', position: { x: 0, y: 1, w: 1, h: 1 }, config: {}, isVisible: true },
      { id: 'navigation-status', type: WidgetType.NAVIGATION_STATUS, title: 'Navigation Status', position: { x: 1, y: 1, w: 1, h: 1 }, config: {}, isVisible: true },
      { id: 'compliance-status', type: WidgetType.COMPLIANCE_STATUS, title: 'Compliance Status', position: { x: 2, y: 1, w: 1, h: 1 }, config: {}, isVisible: true },
      { id: 'marine-weather', type: WidgetType.MARINE_WEATHER, title: 'Weather Conditions', position: { x: 0, y: 2, w: 3, h: 1 }, config: {}, isVisible: true }
    ]
  },
  
  [UserRole.ENGINEER]: {
    layout: 'grid',
    columns: 2,
    showFinancialData: false,
    showComplianceData: false,
    showCrewData: true,
    showTechnicalData: true,
    widgets: [
      { id: 'engine-status', type: WidgetType.ENGINE_STATUS, title: 'Engine Status', position: { x: 0, y: 0, w: 1, h: 1 }, config: {}, isVisible: true },
      { id: 'fuel-consumption', type: WidgetType.FUEL_CONSUMPTION, title: 'Fuel Consumption', position: { x: 1, y: 0, w: 1, h: 1 }, config: {}, isVisible: true },
      { id: 'waste-heat-recovery', type: WidgetType.WASTE_HEAT_RECOVERY, title: 'Waste Heat Recovery', position: { x: 0, y: 1, w: 2, h: 1 }, config: {}, isVisible: true },
      { id: 'efficiency-metrics', type: WidgetType.EFFICIENCY_METRICS, title: 'Efficiency Metrics', position: { x: 0, y: 2, w: 1, h: 1 }, config: {}, isVisible: true },
      { id: 'emissions-monitoring', type: WidgetType.EMISSIONS_MONITORING, title: 'Emissions Monitoring', position: { x: 1, y: 2, w: 1, h: 1 }, config: {}, isVisible: true },
      { id: 'maintenance-alerts', type: WidgetType.MAINTENANCE_ALERTS, title: 'Maintenance Alerts', position: { x: 0, y: 3, w: 2, h: 1 }, config: {}, isVisible: true }
    ]
  },
  
  [UserRole.CAPTAIN]: {
    layout: 'grid',
    columns: 3,
    showFinancialData: false,
    showComplianceData: true,
    showCrewData: true,
    showTechnicalData: true,
    widgets: [
      { id: 'fleet-overview', type: WidgetType.FLEET_OVERVIEW, title: 'Fleet Overview', position: { x: 0, y: 0, w: 2, h: 1 }, config: {}, isVisible: true },
      { id: 'active-voyages', type: WidgetType.ACTIVE_VOYAGES, title: 'Active Voyages', position: { x: 2, y: 0, w: 1, h: 1 }, config: {}, isVisible: true },
      { id: 'crew-tasks', type: WidgetType.MY_TASKS, title: 'Crew Tasks', position: { x: 0, y: 1, w: 1, h: 1 }, config: {}, isVisible: true },
      { id: 'navigation-status', type: WidgetType.NAVIGATION_STATUS, title: 'Navigation Status', position: { x: 1, y: 1, w: 1, h: 1 }, config: {}, isVisible: true },
      { id: 'compliance-status', type: WidgetType.COMPLIANCE_STATUS, title: 'Compliance Status', position: { x: 2, y: 1, w: 1, h: 1 }, config: {}, isVisible: true },
      { id: 'safety-metrics', type: WidgetType.SAFETY_METRICS, title: 'Safety Metrics', position: { x: 0, y: 2, w: 3, h: 1 }, config: {}, isVisible: true }
    ]
  },
  
  [UserRole.CHIEF_ENGINEER]: {
    layout: 'grid',
    columns: 2,
    showFinancialData: false,
    showComplianceData: true,
    showCrewData: true,
    showTechnicalData: true,
    widgets: [
      { id: 'engine-status', type: WidgetType.ENGINE_STATUS, title: 'Engine Status', position: { x: 0, y: 0, w: 1, h: 1 }, config: {}, isVisible: true },
      { id: 'fuel-consumption', type: WidgetType.FUEL_CONSUMPTION, title: 'Fuel Consumption', position: { x: 1, y: 0, w: 1, h: 1 }, config: {}, isVisible: true },
      { id: 'waste-heat-recovery', type: WidgetType.WASTE_HEAT_RECOVERY, title: 'Waste Heat Recovery', position: { x: 0, y: 1, w: 2, h: 1 }, config: {}, isVisible: true },
      { id: 'efficiency-metrics', type: WidgetType.EFFICIENCY_METRICS, title: 'Efficiency Metrics', position: { x: 0, y: 2, w: 1, h: 1 }, config: {}, isVisible: true },
      { id: 'emissions-monitoring', type: WidgetType.EMISSIONS_MONITORING, title: 'Emissions Monitoring', position: { x: 1, y: 2, w: 1, h: 1 }, config: {}, isVisible: true },
      { id: 'regulations-compliance', type: WidgetType.REGULATIONS_COMPLIANCE, title: 'Regulations Compliance', position: { x: 0, y: 3, w: 2, h: 1 }, config: {}, isVisible: true }
    ]
  },
  
  [UserRole.MANAGER]: {
    layout: 'grid',
    columns: 3,
    showFinancialData: true,
    showComplianceData: true,
    showCrewData: true,
    showTechnicalData: true,
    widgets: [
      { id: 'fleet-overview', type: WidgetType.FLEET_OVERVIEW, title: 'Fleet Overview', position: { x: 0, y: 0, w: 2, h: 1 }, config: {}, isVisible: true },
      { id: 'tcc-meter', type: WidgetType.TCC_METER, title: 'TCC Meter', position: { x: 2, y: 0, w: 1, h: 2 }, config: {}, isVisible: true },
      { id: 'financial-summary', type: WidgetType.FINANCIAL_SUMMARY, title: 'Financial Summary', position: { x: 0, y: 1, w: 2, h: 1 }, config: {}, isVisible: true },
      { id: 'compliance-alerts', type: WidgetType.COMPLIANCE_ALERTS, title: 'Compliance Alerts', position: { x: 0, y: 2, w: 3, h: 1 }, config: {}, isVisible: true }
    ]
  },
  
  [UserRole.COMPLIANCE_OFFICER]: {
    layout: 'grid',
    columns: 3,
    showFinancialData: true,
    showComplianceData: true,
    showCrewData: false,
    showTechnicalData: false,
    widgets: [
      { id: 'compliance-status', type: WidgetType.COMPLIANCE_STATUS, title: 'Compliance Status', position: { x: 0, y: 0, w: 2, h: 1 }, config: {}, isVisible: true },
      { id: 'eua-price', type: WidgetType.EUA_PRICE, title: 'EUA Price', position: { x: 2, y: 0, w: 1, h: 1 }, config: {}, isVisible: true },
      { id: 'regulations-compliance', type: WidgetType.REGULATIONS_COMPLIANCE, title: 'Regulations Compliance', position: { x: 0, y: 1, w: 3, h: 1 }, config: {}, isVisible: true },
      { id: 'verification-status', type: WidgetType.VERIFICATION_STATUS, title: 'Verification Status', position: { x: 0, y: 2, w: 2, h: 1 }, config: {}, isVisible: true },
      { id: 'regulatory-deadlines', type: WidgetType.REGULATORY_DEADLINES, title: 'Regulatory Deadlines', position: { x: 2, y: 2, w: 1, h: 1 }, config: {}, isVisible: true }
    ]
  },
  
  [UserRole.TRADER]: {
    layout: 'grid',
    columns: 2,
    showFinancialData: true,
    showComplianceData: false,
    showCrewData: false,
    showTechnicalData: false,
    widgets: [
      { id: 'rfq-board', type: WidgetType.RFQ_BOARD, title: 'RFQ Board', position: { x: 0, y: 0, w: 2, h: 2 }, config: {}, isVisible: true },
      { id: 'market-data', type: WidgetType.MARKET_DATA, title: 'Market Data', position: { x: 0, y: 2, w: 1, h: 1 }, config: {}, isVisible: true },
      { id: 'trading-opportunities', type: WidgetType.TRADING_OPPORTUNITIES, title: 'Trading Opportunities', position: { x: 1, y: 2, w: 1, h: 1 }, config: {}, isVisible: true }
    ]
  },
  
  [UserRole.TECHNICAL_SUPERINTENDENT]: {
    layout: 'grid',
    columns: 3,
    showFinancialData: false,
    showComplianceData: true,
    showCrewData: true,
    showTechnicalData: true,
    widgets: [
      { id: 'fleet-overview', type: WidgetType.FLEET_OVERVIEW, title: 'Fleet Overview', position: { x: 0, y: 0, w: 2, h: 1 }, config: {}, isVisible: true },
      { id: 'technical-performance', type: WidgetType.TECHNICAL_PERFORMANCE, title: 'Technical Performance', position: { x: 2, y: 0, w: 1, h: 1 }, config: {}, isVisible: true },
      { id: 'waste-heat-recovery', type: WidgetType.WASTE_HEAT_RECOVERY, title: 'Waste Heat Recovery', position: { x: 0, y: 1, w: 1, h: 1 }, config: {}, isVisible: true },
      { id: 'emissions-monitoring', type: WidgetType.EMISSIONS_MONITORING, title: 'Emissions Monitoring', position: { x: 1, y: 1, w: 1, h: 1 }, config: {}, isVisible: true },
      { id: 'regulations-compliance', type: WidgetType.REGULATIONS_COMPLIANCE, title: 'Regulations Compliance', position: { x: 2, y: 1, w: 1, h: 1 }, config: {}, isVisible: true },
      { id: 'maintenance-alerts', type: WidgetType.MAINTENANCE_ALERTS, title: 'Maintenance Alerts', position: { x: 0, y: 2, w: 3, h: 1 }, config: {}, isVisible: true }
    ]
  },
  
  [UserRole.OPERATIONS_SUPERINTENDENT]: {
    layout: 'grid',
    columns: 3,
    showFinancialData: true,
    showComplianceData: true,
    showCrewData: true,
    showTechnicalData: true,
    widgets: [
      { id: 'fleet-overview', type: WidgetType.FLEET_OVERVIEW, title: 'Fleet Overview', position: { x: 0, y: 0, w: 2, h: 1 }, config: {}, isVisible: true },
      { id: 'active-voyages', type: WidgetType.ACTIVE_VOYAGES, title: 'Active Voyages', position: { x: 2, y: 0, w: 1, h: 1 }, config: {}, isVisible: true },
      { id: 'compliance-status', type: WidgetType.COMPLIANCE_STATUS, title: 'Compliance Status', position: { x: 0, y: 1, w: 1, h: 1 }, config: {}, isVisible: true },
      { id: 'fuel-consumption', type: WidgetType.FUEL_CONSUMPTION, title: 'Fuel Consumption', position: { x: 1, y: 1, w: 1, h: 1 }, config: {}, isVisible: true },
      { id: 'financial-summary', type: WidgetType.FINANCIAL_SUMMARY, title: 'Financial Summary', position: { x: 2, y: 1, w: 1, h: 1 }, config: {}, isVisible: true }
    ]
  },
  
  [UserRole.PORT_CAPTAIN]: {
    layout: 'grid',
    columns: 3,
    showFinancialData: false,
    showComplianceData: true,
    showCrewData: true,
    showTechnicalData: true,
    widgets: [
      { id: 'fleet-overview', type: WidgetType.FLEET_OVERVIEW, title: 'Fleet Overview', position: { x: 0, y: 0, w: 2, h: 1 }, config: {}, isVisible: true },
      { id: 'active-voyages', type: WidgetType.ACTIVE_VOYAGES, title: 'Active Voyages', position: { x: 2, y: 0, w: 1, h: 1 }, config: {}, isVisible: true },
      { id: 'compliance-status', type: WidgetType.COMPLIANCE_STATUS, title: 'Compliance Status', position: { x: 0, y: 1, w: 1, h: 1 }, config: {}, isVisible: true },
      { id: 'crew-tasks', type: WidgetType.MY_TASKS, title: 'Crew Tasks', position: { x: 1, y: 1, w: 1, h: 1 }, config: {}, isVisible: true },
      { id: 'fuel-consumption', type: WidgetType.FUEL_CONSUMPTION, title: 'Fuel Consumption', position: { x: 2, y: 1, w: 1, h: 1 }, config: {}, isVisible: true }
    ]
  },
  
  [UserRole.FLEET_SUPERINTENDENT]: {
    layout: 'grid',
    columns: 3,
    showFinancialData: true,
    showComplianceData: true,
    showCrewData: true,
    showTechnicalData: true,
    widgets: [
      { id: 'fleet-overview', type: WidgetType.FLEET_OVERVIEW, title: 'Fleet Overview', position: { x: 0, y: 0, w: 2, h: 1 }, config: {}, isVisible: true },
      { id: 'tcc-meter', type: WidgetType.TCC_METER, title: 'TCC Meter', position: { x: 2, y: 0, w: 1, h: 2 }, config: {}, isVisible: true },
      { id: 'financial-summary', type: WidgetType.FINANCIAL_SUMMARY, title: 'Financial Summary', position: { x: 0, y: 1, w: 1, h: 1 }, config: {}, isVisible: true },
      { id: 'compliance-alerts', type: WidgetType.COMPLIANCE_ALERTS, title: 'Compliance Alerts', position: { x: 1, y: 1, w: 1, h: 1 }, config: {}, isVisible: true },
      { id: 'rfq-board', type: WidgetType.RFQ_BOARD, title: 'RFQ Board', position: { x: 0, y: 2, w: 2, h: 1 }, config: {}, isVisible: true },
      { id: 'maintenance-alerts', type: WidgetType.MAINTENANCE_ALERTS, title: 'Maintenance Alerts', position: { x: 2, y: 2, w: 1, h: 1 }, config: {}, isVisible: true }
    ]
  },
  
  [UserRole.INSURER]: {
    layout: 'grid',
    columns: 3,
    showFinancialData: true,
    showComplianceData: true,
    showCrewData: false,
    showTechnicalData: true,
    widgets: [
      { id: 'fleet-overview', type: WidgetType.FLEET_OVERVIEW, title: 'Fleet Overview', position: { x: 0, y: 0, w: 2, h: 1 }, config: {}, isVisible: true },
      { id: 'active-voyages', type: WidgetType.ACTIVE_VOYAGES, title: 'Active Voyages', position: { x: 2, y: 0, w: 1, h: 1 }, config: {}, isVisible: true },
      { id: 'compliance-status', type: WidgetType.COMPLIANCE_STATUS, title: 'Compliance Status', position: { x: 0, y: 1, w: 1, h: 1 }, config: {}, isVisible: true },
      { id: 'financial-summary', type: WidgetType.FINANCIAL_SUMMARY, title: 'Financial Summary', position: { x: 1, y: 1, w: 1, h: 1 }, config: {}, isVisible: true },
      { id: 'fuel-consumption', type: WidgetType.FUEL_CONSUMPTION, title: 'Fuel Efficiency', position: { x: 2, y: 1, w: 1, h: 1 }, config: {}, isVisible: true }
    ]
  },
  
  [UserRole.MTO]: {
    layout: 'grid',
    columns: 3,
    showFinancialData: true,
    showComplianceData: true,
    showCrewData: false,
    showTechnicalData: true,
    widgets: [
      { id: 'fleet-overview', type: WidgetType.FLEET_OVERVIEW, title: 'Fleet Overview', position: { x: 0, y: 0, w: 2, h: 1 }, config: {}, isVisible: true },
      { id: 'active-voyages', type: WidgetType.ACTIVE_VOYAGES, title: 'Active Voyages', position: { x: 2, y: 0, w: 1, h: 2 }, config: {}, isVisible: true },
      { id: 'compliance-status', type: WidgetType.COMPLIANCE_STATUS, title: 'Compliance Status', position: { x: 0, y: 1, w: 1, h: 1 }, config: {}, isVisible: true },
      { id: 'fuel-consumption', type: WidgetType.FUEL_CONSUMPTION, title: 'Fuel Efficiency', position: { x: 1, y: 1, w: 1, h: 1 }, config: {}, isVisible: true }
    ]
  },
  
  [UserRole.ADMIN]: {
    layout: 'grid',
    columns: 4,
    showFinancialData: true,
    showComplianceData: true,
    showCrewData: true,
    showTechnicalData: true,
    widgets: [
      { id: 'fleet-overview', type: WidgetType.FLEET_OVERVIEW, title: 'Fleet Overview', position: { x: 0, y: 0, w: 2, h: 1 }, config: {}, isVisible: true },
      { id: 'tcc-meter', type: WidgetType.TCC_METER, title: 'TCC Meter', position: { x: 2, y: 0, w: 1, h: 2 }, config: {}, isVisible: true },
      { id: 'compliance-status', type: WidgetType.COMPLIANCE_STATUS, title: 'Compliance Status', position: { x: 3, y: 0, w: 1, h: 1 }, config: {}, isVisible: true },
      { id: 'financial-summary', type: WidgetType.FINANCIAL_SUMMARY, title: 'Financial Summary', position: { x: 0, y: 1, w: 2, h: 1 }, config: {}, isVisible: true },
      { id: 'system-status', type: WidgetType.MAINTENANCE_ALERTS, title: 'System Status', position: { x: 3, y: 1, w: 1, h: 1 }, config: {}, isVisible: true }
    ]
  },
  
  [UserRole.CHARTERER]: {
    layout: 'grid',
    columns: 3,
    showFinancialData: true,
    showComplianceData: false,
    showCrewData: false,
    showTechnicalData: false,
    widgets: [
      { id: 'charter-market', type: WidgetType.RFQ_BOARD, title: 'Charter Market', position: { x: 0, y: 0, w: 2, h: 1 }, config: {}, isVisible: true },
      { id: 'my-rfqs', type: WidgetType.MY_TASKS, title: 'My RFQs', position: { x: 2, y: 0, w: 1, h: 1 }, config: {}, isVisible: true },
      { id: 'voyage-estimates', type: WidgetType.FINANCIAL_SUMMARY, title: 'Voyage Estimates', position: { x: 0, y: 1, w: 2, h: 1 }, config: {}, isVisible: true },
      { id: 'market-data', type: WidgetType.MARKET_DATA, title: 'Market Data', position: { x: 2, y: 1, w: 1, h: 1 }, config: {}, isVisible: true }
    ]
  },
  
  [UserRole.BROKER]: {
    layout: 'grid',
    columns: 3,
    showFinancialData: true,
    showComplianceData: false,
    showCrewData: false,
    showTechnicalData: false,
    widgets: [
      { id: 'broker-desk', type: WidgetType.RFQ_BOARD, title: 'Broker Desk', position: { x: 0, y: 0, w: 2, h: 1 }, config: {}, isVisible: true },
      { id: 'tonnage-list', type: WidgetType.FLEET_OVERVIEW, title: 'Available Tonnage', position: { x: 2, y: 0, w: 1, h: 1 }, config: {}, isVisible: true },
      { id: 'active-negotiations', type: WidgetType.MY_TASKS, title: 'Active Negotiations', position: { x: 0, y: 1, w: 1, h: 1 }, config: {}, isVisible: true },
      { id: 'voyage-calculator', type: WidgetType.FINANCIAL_SUMMARY, title: 'Voyage Calculator', position: { x: 1, y: 1, w: 1, h: 1 }, config: {}, isVisible: true },
      { id: 'market-intelligence', type: WidgetType.MARKET_DATA, title: 'Market Intelligence', position: { x: 2, y: 1, w: 1, h: 1 }, config: {}, isVisible: true }
    ]
  },
  
  [UserRole.GUEST]: {
    layout: 'compact',
    columns: 1,
    showFinancialData: false,
    showComplianceData: false,
    showCrewData: false,
    showTechnicalData: false,
    widgets: [
      { id: 'welcome', type: WidgetType.FLEET_OVERVIEW, title: 'Welcome', position: { x: 0, y: 0, w: 1, h: 1 }, config: {}, isVisible: true }
    ]
  }
};
