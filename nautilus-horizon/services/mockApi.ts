import { 
  Ship, 
  Voyage, 
  PoolRFQ, 
  PoolOffer, 
  RfqStatus, 
  OfferStatus,
  FuelEUBalance,
  EUAExposure,
  TradeHedge,
  LedgerEntry,
  Recommendation,
  ActionLog,
  LeagueStanding,
  Task,
  EnergyReading,
  CharterCalculationInput,
  CharterCalculationResult,
  AuditDecision
} from '../types/index';

// Mock EUA price with some volatility
let mockEuaPrice = 76.0;

export function getMockEuaPrice(): number {
  // Add some random volatility (±2%)
  const volatility = (Math.random() - 0.5) * 0.04;
  mockEuaPrice = Math.max(60, Math.min(100, mockEuaPrice * (1 + volatility)));
  return Number(mockEuaPrice.toFixed(2));
}

// Mock ships data removed - using database vessels only via /vessels/api/vessels endpoint

// Mock FuelEU balances
export const mockFuelEUBalances: FuelEUBalance[] = [
  { id: '1', shipId: '1', year: 2025, balanceGco2e: -5.2e6, bankedGco2e: 0, borrowedGco2e: 0, inPool: false },
  { id: '2', shipId: '2', year: 2025, balanceGco2e: 1.1e6, bankedGco2e: 0, borrowedGco2e: 0, inPool: false },
  { id: '3', shipId: '3', year: 2025, balanceGco2e: -2.9e6, bankedGco2e: 0, borrowedGco2e: 0, inPool: false },
  { id: '4', shipId: '4', year: 2025, balanceGco2e: -8.1e6, bankedGco2e: 0, borrowedGco2e: 0, inPool: false },
  { id: '5', shipId: '5', year: 2025, balanceGco2e: -3.7e6, bankedGco2e: 0, borrowedGco2e: 0, inPool: false },
  { id: '6', shipId: '6', year: 2025, balanceGco2e: 0.8e6, bankedGco2e: 0, borrowedGco2e: 0, inPool: false },
  { id: '7', shipId: '7', year: 2025, balanceGco2e: -0.2e6, bankedGco2e: 0, borrowedGco2e: 0, inPool: false }
];

// Mock RFQs
export const mockRFQs: PoolRFQ[] = [
  {
    id: 'rfq-001',
    orgId: '1',
        year: 2025,
    needGco2e: 5200000, // 5.2M tonnes deficit
    notes: 'Seeking FuelEU compliance units for Aurora Spirit deficit',
        status: RfqStatus.OPEN,
        offers: [
      {
        id: 'offer-001',
        rfqId: 'rfq-001',
        counterparty: 'Green Marine Pool',
        offeredGco2e: 5200000,
        priceEurPerGco2e: 0.045,
        validUntilTs: '2025-12-31T23:59:59Z',
        status: OfferStatus.PENDING
      },
      {
        id: 'offer-002',
        rfqId: 'rfq-001',
        counterparty: 'Baltic Compliance Co.',
        offeredGco2e: 3000000,
        priceEurPerGco2e: 0.042,
        validUntilTs: '2025-12-15T23:59:59Z',
        status: OfferStatus.PENDING
      }
    ],
    priceRange: { min: 0.040, max: 0.050 }
  },
  {
    id: 'rfq-002',
    orgId: '1',
    year: 2025,
    needGco2e: 8100000, // 8.1M tonnes deficit for Delta Horizon
    notes: 'Large deficit from Singapore-Rotterdam voyage',
    status: RfqStatus.OPEN,
        offers: [
      {
        id: 'offer-003',
        rfqId: 'rfq-002',
        counterparty: 'Nordic Efficiency Fund',
        offeredGco2e: 8100000,
        priceEurPerGco2e: 0.048,
        validUntilTs: '2025-11-30T23:59:59Z',
        status: OfferStatus.PENDING
      }
    ]
  }
];

// Mock recommendations for crew
export const mockRecommendations: Recommendation[] = [
  {
    id: 'rec-001',
    shipId: '1',
    createdTs: '2025-10-01T08:00:00Z',
    type: 'SGM_ENABLE',
    rationale: 'Enable SGM for 90%+ sea-time to reduce auxiliary power consumption',
    expectedDeltaTFuel: -2.5,
    expectedDeltaTCo2: -7.8,
    confidence01: 0.85,
    status: 'PENDING'
  },
  {
    id: 'rec-002',
    shipId: '1',
    createdTs: '2025-10-01T10:30:00Z',
    type: 'TRIM_OPTIMIZE',
    rationale: 'Adjust trim to ±0.2m for optimal resistance',
    expectedDeltaTFuel: -1.2,
    expectedDeltaTCo2: -3.7,
    confidence01: 0.75,
    status: 'PENDING'
  },
  {
    id: 'rec-003',
    shipId: '2',
    createdTs: '2025-10-01T09:15:00Z',
    type: 'ECO_RPM',
    rationale: 'Maintain eco-RPM band for 24h continuous operation',
    expectedDeltaTFuel: -1.8,
    expectedDeltaTCo2: -5.6,
    confidence01: 0.90,
    status: 'PENDING'
  }
];

// Mock tasks for crew PWA - Enhanced with role-specific performance-impacting tasks
export const mockTasks: Task[] = [
  // ===== CREW MEMBER TASKS (John Doe) =====
  {
    id: 'task-crew-001',
    shipId: '1',
    type: 'MAINTENANCE_ROUTINE',
    title: 'Deck Maintenance & Cleaning',
    description: 'Perform daily deck maintenance and cleaning to ensure optimal vessel performance',
    expectedDeltaFuel: -0.5,
    expectedDeltaCo2: -1.5,
    points: 20,
    status: 'AVAILABLE',
    createdAt: '2025-01-15T06:00:00Z',
    assignedRole: 'CREW',
    priority: 'MEDIUM',
    estimatedDuration: 120,
    category: 'OPERATIONAL',
    difficulty: 'EASY'
  },
  {
    id: 'task-crew-002',
    shipId: '1',
    type: 'ENVIRONMENTAL_CHECK',
    title: 'Cargo Securing Inspection',
    description: 'Inspect and secure cargo to prevent shifting and maintain vessel stability',
    expectedDeltaFuel: -0.8,
    expectedDeltaCo2: -2.4,
    points: 25,
    status: 'AVAILABLE',
    createdAt: '2025-01-15T08:00:00Z',
    assignedRole: 'CREW',
    priority: 'HIGH',
    estimatedDuration: 90,
    category: 'SAFETY',
    difficulty: 'MEDIUM'
  },
  {
    id: 'task-crew-003',
    shipId: '1',
    type: 'LIGHTS_OFF',
    title: 'Energy Conservation Protocol',
    description: 'Ensure all non-essential lighting and equipment are turned off during daylight',
    expectedDeltaFuel: -0.3,
    expectedDeltaCo2: -0.9,
    points: 15,
    status: 'AVAILABLE',
    createdAt: '2025-01-15T10:00:00Z',
    assignedRole: 'CREW',
    priority: 'LOW',
    estimatedDuration: 30,
    category: 'ENERGY_SAVING',
    difficulty: 'EASY'
  },
  {
    id: 'task-crew-004',
    shipId: '1',
    type: 'WATER_SAVING',
    title: 'Water Conservation Initiative',
    description: 'Implement water-saving measures in accommodation and galley areas',
    expectedDeltaFuel: -0.2,
    expectedDeltaCo2: -0.6,
    points: 12,
    status: 'COMPLETED',
    createdAt: '2025-01-15T07:00:00Z',
    completedAt: '2025-01-15T07:30:00Z',
    assignedRole: 'CREW',
    priority: 'LOW',
    estimatedDuration: 30,
    category: 'ENVIRONMENTAL',
    difficulty: 'EASY'
  },

  // ===== DECK OFFICER TASKS (Jane Smith) =====
  {
    id: 'task-officer-001',
    shipId: '1',
    type: 'TRIM_OPTIMIZE',
    title: 'Trim Optimization Protocol',
    description: 'Monitor and maintain optimal vessel trim for fuel efficiency',
    expectedDeltaFuel: -1.5,
    expectedDeltaCo2: -4.6,
    points: 40,
    status: 'AVAILABLE',
    createdAt: '2025-01-15T08:00:00Z',
    assignedRole: 'OFFICER',
    priority: 'HIGH',
    estimatedDuration: 60,
    category: 'ENERGY_SAVING',
    difficulty: 'MEDIUM'
  },
  {
    id: 'task-officer-002',
    shipId: '1',
    type: 'MAINTENANCE_ROUTINE',
    title: 'Navigation Equipment Check',
    description: 'Perform daily navigation equipment inspection and calibration',
    expectedDeltaFuel: -0.4,
    expectedDeltaCo2: -1.2,
    points: 18,
    status: 'AVAILABLE',
    createdAt: '2025-01-15T09:00:00Z',
    assignedRole: 'OFFICER',
    priority: 'MEDIUM',
    estimatedDuration: 45,
    category: 'SAFETY',
    difficulty: 'MEDIUM'
  },
  {
    id: 'task-officer-003',
    shipId: '1',
    type: 'ENVIRONMENTAL_CHECK',
    title: 'Port State Control Preparation',
    description: 'Ensure vessel compliance with port state control requirements',
    expectedDeltaFuel: -0.3,
    expectedDeltaCo2: -0.9,
    points: 15,
    status: 'IN_PROGRESS',
    createdAt: '2025-01-15T10:00:00Z',
    assignedRole: 'OFFICER',
    priority: 'HIGH',
    estimatedDuration: 120,
    category: 'COMPLIANCE',
    difficulty: 'HARD'
  },

  // ===== MARINE ENGINEER TASKS (Mike Wong) =====
  {
    id: 'task-engineer-001',
    shipId: '1',
    type: 'WHR_OPTIMIZE',
    title: 'Waste Heat Recovery Optimization',
    description: 'Calibrate and optimize waste heat recovery system for maximum efficiency',
    expectedDeltaFuel: -2.0,
    expectedDeltaCo2: -6.2,
    points: 50,
    status: 'AVAILABLE',
    createdAt: '2025-01-15T08:00:00Z',
    assignedRole: 'ENGINEER',
    priority: 'HIGH',
    estimatedDuration: 180,
    category: 'ENERGY_SAVING',
    difficulty: 'EXPERT'
  },
  {
    id: 'task-engineer-002',
    shipId: '1',
    type: 'VFD_ENABLE',
    title: 'Variable Frequency Drive Optimization',
    description: 'Configure VFD systems for optimal motor efficiency in non-critical systems',
    expectedDeltaFuel: -1.2,
    expectedDeltaCo2: -3.7,
    points: 35,
    status: 'AVAILABLE',
    createdAt: '2025-01-15T09:00:00Z',
    assignedRole: 'ENGINEER',
    priority: 'MEDIUM',
    estimatedDuration: 150,
    category: 'ENERGY_SAVING',
    difficulty: 'HARD'
  },
  {
    id: 'task-engineer-003',
    shipId: '1',
    type: 'MAINTENANCE_ROUTINE',
    title: 'Engine Performance Monitoring',
    description: 'Monitor engine parameters and perform preventive maintenance',
    expectedDeltaFuel: -1.0,
    expectedDeltaCo2: -3.1,
    points: 30,
    status: 'IN_PROGRESS',
    createdAt: '2025-01-15T07:00:00Z',
    assignedRole: 'ENGINEER',
    priority: 'HIGH',
    estimatedDuration: 120,
    category: 'MAINTENANCE',
    difficulty: 'MEDIUM'
  },
  {
    id: 'task-engineer-004',
    shipId: '1',
    type: 'ENVIRONMENTAL_CHECK',
    title: 'MARPOL Compliance Check',
    description: 'Ensure compliance with MARPOL regulations and environmental standards',
    expectedDeltaFuel: -0.5,
    expectedDeltaCo2: -1.5,
    points: 20,
    status: 'AVAILABLE',
    createdAt: '2025-01-15T11:00:00Z',
    assignedRole: 'ENGINEER',
    priority: 'HIGH',
    estimatedDuration: 90,
    category: 'COMPLIANCE',
    difficulty: 'MEDIUM'
  },

  // ===== FLEET MANAGER TASKS (Captain Sarfaraz Akhtar) =====
  {
    id: 'task-manager-001',
    shipId: '1',
    type: 'SPEED_OPTIMIZE',
    title: 'Fleet Performance Optimization',
    description: 'Analyze and optimize fleet-wide performance metrics and fuel consumption',
    expectedDeltaFuel: -3.5,
    expectedDeltaCo2: -10.8,
    points: 70,
    status: 'AVAILABLE',
    createdAt: '2025-01-15T08:00:00Z',
    assignedRole: 'MANAGER',
    priority: 'CRITICAL',
    estimatedDuration: 240,
    category: 'OPERATIONAL',
    difficulty: 'EXPERT'
  },
  {
    id: 'task-manager-002',
    shipId: '1',
    type: 'MAINTENANCE_ROUTINE',
    title: 'Fleet Maintenance Scheduling',
    description: 'Coordinate and optimize maintenance schedules across the fleet',
    expectedDeltaFuel: -2.0,
    expectedDeltaCo2: -6.2,
    points: 50,
    status: 'AVAILABLE',
    createdAt: '2025-01-15T09:00:00Z',
    assignedRole: 'MANAGER',
    priority: 'HIGH',
    estimatedDuration: 180,
    category: 'OPERATIONAL',
    difficulty: 'HARD'
  },
  {
    id: 'task-manager-003',
    shipId: '1',
    type: 'ENVIRONMENTAL_CHECK',
    title: 'Regulatory Compliance Oversight',
    description: 'Ensure fleet-wide compliance with maritime regulations and standards',
    expectedDeltaFuel: -1.5,
    expectedDeltaCo2: -4.6,
    points: 40,
    status: 'IN_PROGRESS',
    createdAt: '2025-01-15T10:00:00Z',
    assignedRole: 'MANAGER',
    priority: 'HIGH',
    estimatedDuration: 120,
    category: 'COMPLIANCE',
    difficulty: 'HARD'
  },

  // ===== COMPLIANCE MANAGER TASKS (Captain Vinay Chandra) =====
  {
    id: 'task-compliance-001',
    shipId: '1',
    type: 'ENVIRONMENTAL_CHECK',
    title: 'Safety Management System Audit',
    description: 'Conduct comprehensive safety management system audit and compliance check',
    expectedDeltaFuel: -1.8,
    expectedDeltaCo2: -5.6,
    points: 45,
    status: 'AVAILABLE',
    createdAt: '2025-01-15T08:00:00Z',
    assignedRole: 'COMPLIANCE_OFFICER',
    priority: 'CRITICAL',
    estimatedDuration: 300,
    category: 'COMPLIANCE',
    difficulty: 'EXPERT'
  },
  {
    id: 'task-compliance-002',
    shipId: '1',
    type: 'MAINTENANCE_ROUTINE',
    title: 'Risk Assessment & Mitigation',
    description: 'Perform risk assessment and implement mitigation strategies',
    expectedDeltaFuel: -1.2,
    expectedDeltaCo2: -3.7,
    points: 35,
    status: 'AVAILABLE',
    createdAt: '2025-01-15T09:00:00Z',
    assignedRole: 'COMPLIANCE_OFFICER',
    priority: 'HIGH',
    estimatedDuration: 180,
    category: 'SAFETY',
    difficulty: 'HARD'
  },
  {
    id: 'task-compliance-003',
    shipId: '1',
    type: 'ENVIRONMENTAL_CHECK',
    title: 'Environmental Compliance Verification',
    description: 'Verify compliance with environmental regulations and standards',
    expectedDeltaFuel: -0.8,
    expectedDeltaCo2: -2.4,
    points: 25,
    status: 'COMPLETED',
    createdAt: '2025-01-15T07:00:00Z',
    completedAt: '2025-01-15T08:30:00Z',
    assignedRole: 'COMPLIANCE_OFFICER',
    priority: 'HIGH',
    estimatedDuration: 90,
    category: 'COMPLIANCE',
    difficulty: 'MEDIUM'
  },

  // ===== EMISSIONS TRADER TASKS (Sravan Padavala) =====
  {
    id: 'task-trader-001',
    shipId: '1',
    type: 'ENVIRONMENTAL_CHECK',
    title: 'Carbon Credit Trading Analysis',
    description: 'Analyze carbon credit trading opportunities and market trends',
    expectedDeltaFuel: -2.5,
    expectedDeltaCo2: -7.8,
    points: 55,
    status: 'AVAILABLE',
    createdAt: '2025-01-15T08:00:00Z',
    assignedRole: 'TRADER',
    priority: 'HIGH',
    estimatedDuration: 120,
    category: 'OPERATIONAL',
    difficulty: 'HARD'
  },
  {
    id: 'task-trader-002',
    shipId: '1',
    type: 'ENVIRONMENTAL_CHECK',
    title: 'Emissions Data Analysis',
    description: 'Analyze vessel emissions data and identify reduction opportunities',
    expectedDeltaFuel: -1.5,
    expectedDeltaCo2: -4.6,
    points: 40,
    status: 'AVAILABLE',
    createdAt: '2025-01-15T09:00:00Z',
    assignedRole: 'TRADER',
    priority: 'MEDIUM',
    estimatedDuration: 90,
    category: 'ENVIRONMENTAL',
    difficulty: 'MEDIUM'
  },
  {
    id: 'task-trader-003',
    shipId: '1',
    type: 'ENVIRONMENTAL_CHECK',
    title: 'Sustainability Initiative Development',
    description: 'Develop and implement sustainability initiatives for fleet operations',
    expectedDeltaFuel: -2.0,
    expectedDeltaCo2: -6.2,
    points: 50,
    status: 'IN_PROGRESS',
    createdAt: '2025-01-15T10:00:00Z',
    assignedRole: 'TRADER',
    priority: 'HIGH',
    estimatedDuration: 180,
    category: 'ENVIRONMENTAL',
    difficulty: 'HARD'
  },

  // ===== PRODUCT MANAGER TASKS (Sumit Redu) =====
  {
    id: 'task-admin-001',
    shipId: '1',
    type: 'MAINTENANCE_ROUTINE',
    title: 'Product Strategy Development',
    description: 'Develop and implement product strategies aligned with company goals',
    expectedDeltaFuel: -3.0,
    expectedDeltaCo2: -9.3,
    points: 60,
    status: 'AVAILABLE',
    createdAt: '2025-01-15T08:00:00Z',
    assignedRole: 'ADMIN',
    priority: 'CRITICAL',
    estimatedDuration: 240,
    category: 'OPERATIONAL',
    difficulty: 'EXPERT'
  },
  {
    id: 'task-admin-002',
    shipId: '1',
    type: 'MAINTENANCE_ROUTINE',
    title: 'Market Research & Analysis',
    description: 'Conduct market research to identify customer needs and market trends',
    expectedDeltaFuel: -1.8,
    expectedDeltaCo2: -5.6,
    points: 45,
    status: 'AVAILABLE',
    createdAt: '2025-01-15T09:00:00Z',
    assignedRole: 'ADMIN',
    priority: 'HIGH',
    estimatedDuration: 180,
    category: 'OPERATIONAL',
    difficulty: 'HARD'
  },
  {
    id: 'task-admin-003',
    shipId: '1',
    type: 'MAINTENANCE_ROUTINE',
    title: 'Cross-Functional Team Coordination',
    description: 'Coordinate with cross-functional teams to optimize product development',
    expectedDeltaFuel: -2.2,
    expectedDeltaCo2: -6.8,
    points: 50,
    status: 'IN_PROGRESS',
    createdAt: '2025-01-15T10:00:00Z',
    assignedRole: 'ADMIN',
    priority: 'HIGH',
    estimatedDuration: 120,
    category: 'OPERATIONAL',
    difficulty: 'MEDIUM'
  },

  // ===== CAPTAIN TASKS (David Anderson) =====
  {
    id: 'task-captain-001',
    shipId: '1',
    type: 'SGM_ENABLE',
    title: 'SGM Optimization Protocol',
    description: 'Enable shaft generator motor for auxiliary power during sea passage',
    expectedDeltaFuel: -2.8,
    expectedDeltaCo2: -8.7,
    points: 55,
    status: 'AVAILABLE',
    createdAt: '2025-01-15T08:00:00Z',
    assignedRole: 'CAPTAIN',
    priority: 'HIGH',
    estimatedDuration: 45,
    category: 'ENERGY_SAVING',
    difficulty: 'MEDIUM'
  },
  {
    id: 'task-captain-002',
    shipId: '1',
    type: 'SPEED_OPTIMIZE',
    title: 'Eco-Speed Routing Implementation',
    description: 'Implement eco-speed routing for optimal fuel efficiency',
    expectedDeltaFuel: -3.5,
    expectedDeltaCo2: -10.8,
    points: 70,
    status: 'AVAILABLE',
    createdAt: '2025-01-15T09:00:00Z',
    assignedRole: 'CAPTAIN',
    priority: 'CRITICAL',
    estimatedDuration: 90,
    category: 'ENERGY_SAVING',
    difficulty: 'EXPERT'
  },
  {
    id: 'task-captain-003',
    shipId: '1',
    type: 'MAINTENANCE_ROUTINE',
    title: 'Vessel Command & Safety Oversight',
    description: 'Ensure overall vessel safety and regulatory compliance',
    expectedDeltaFuel: -2.0,
    expectedDeltaCo2: -6.2,
    points: 50,
    status: 'IN_PROGRESS',
    createdAt: '2025-01-15T07:00:00Z',
    assignedRole: 'CAPTAIN',
    priority: 'CRITICAL',
    estimatedDuration: 180,
    category: 'SAFETY',
    difficulty: 'HARD'
  },

  // ===== CHIEF ENGINEER TASKS (Maria Rodriguez) =====
  {
    id: 'task-chief-001',
    shipId: '1',
    type: 'WHR_OPTIMIZE',
    title: 'Advanced WHR System Analysis',
    description: 'Conduct comprehensive analysis and optimization of waste heat recovery systems',
    expectedDeltaFuel: -2.5,
    expectedDeltaCo2: -7.8,
    points: 60,
    status: 'AVAILABLE',
    createdAt: '2025-01-15T08:00:00Z',
    assignedRole: 'CHIEF_ENGINEER',
    priority: 'CRITICAL',
    estimatedDuration: 300,
    category: 'ENERGY_SAVING',
    difficulty: 'EXPERT'
  },
  {
    id: 'task-chief-002',
    shipId: '1',
    type: 'ECO_RPM',
    title: 'Eco-RPM Discipline Protocol',
    description: 'Maintain 24h continuous operation within eco-RPM band',
    expectedDeltaFuel: -2.0,
    expectedDeltaCo2: -6.2,
    points: 50,
    status: 'IN_PROGRESS',
    createdAt: '2025-01-15T09:00:00Z',
    assignedRole: 'CHIEF_ENGINEER',
    priority: 'HIGH',
    estimatedDuration: 1440, // 24 hours
    category: 'ENERGY_SAVING',
    difficulty: 'HARD'
  },
  {
    id: 'task-chief-003',
    shipId: '1',
    type: 'MAINTENANCE_ROUTINE',
    title: 'Technical Maintenance Planning',
    description: 'Plan and coordinate technical maintenance activities',
    expectedDeltaFuel: -1.8,
    expectedDeltaCo2: -5.6,
    points: 45,
    status: 'AVAILABLE',
    createdAt: '2025-01-15T10:00:00Z',
    assignedRole: 'CHIEF_ENGINEER',
    priority: 'HIGH',
    estimatedDuration: 180,
    category: 'MAINTENANCE',
    difficulty: 'HARD'
  },

  // ===== TECHNICAL SUPERINTENDENT TASKS (Nitesh Chandak) =====
  {
    id: 'task-tech-001',
    shipId: '1',
    type: 'MAINTENANCE_ROUTINE',
    title: 'Technical Oversight & Support',
    description: 'Provide technical oversight and support for vessel operations',
    expectedDeltaFuel: -2.2,
    expectedDeltaCo2: -6.8,
    points: 50,
    status: 'AVAILABLE',
    createdAt: '2025-01-15T08:00:00Z',
    assignedRole: 'TECHNICAL_SUPERINTENDENT',
    priority: 'HIGH',
    estimatedDuration: 240,
    category: 'OPERATIONAL',
    difficulty: 'HARD'
  },
  {
    id: 'task-tech-002',
    shipId: '1',
    type: 'MAINTENANCE_ROUTINE',
    title: 'Maintenance Planning & Scheduling',
    description: 'Plan and schedule maintenance activities for optimal vessel performance',
    expectedDeltaFuel: -1.5,
    expectedDeltaCo2: -4.6,
    points: 40,
    status: 'AVAILABLE',
    createdAt: '2025-01-15T09:00:00Z',
    assignedRole: 'TECHNICAL_SUPERINTENDENT',
    priority: 'HIGH',
    estimatedDuration: 180,
    category: 'MAINTENANCE',
    difficulty: 'MEDIUM'
  },
  {
    id: 'task-tech-003',
    shipId: '1',
    type: 'ENVIRONMENTAL_CHECK',
    title: 'Incident Investigation & Analysis',
    description: 'Investigate technical incidents and implement corrective actions',
    expectedDeltaFuel: -1.0,
    expectedDeltaCo2: -3.1,
    points: 30,
    status: 'IN_PROGRESS',
    createdAt: '2025-01-15T10:00:00Z',
    assignedRole: 'TECHNICAL_SUPERINTENDENT',
    priority: 'MEDIUM',
    estimatedDuration: 120,
    category: 'SAFETY',
    difficulty: 'HARD'
  },

  // ===== OPERATIONS SUPERINTENDENT TASKS (Captain Nitin Singh) =====
  {
    id: 'task-ops-001',
    shipId: '1',
    type: 'MAINTENANCE_ROUTINE',
    title: 'Operational Planning & Coordination',
    description: 'Plan and coordinate vessel operations for optimal efficiency',
    expectedDeltaFuel: -2.5,
    expectedDeltaCo2: -7.8,
    points: 55,
    status: 'AVAILABLE',
    createdAt: '2025-01-15T08:00:00Z',
    assignedRole: 'OPERATIONS_SUPERINTENDENT',
    priority: 'CRITICAL',
    estimatedDuration: 180,
    category: 'OPERATIONAL',
    difficulty: 'HARD'
  },
  {
    id: 'task-ops-002',
    shipId: '1',
    type: 'MAINTENANCE_ROUTINE',
    title: 'Crew Assignment & Management',
    description: 'Manage crew assignments and ensure optimal staffing levels',
    expectedDeltaFuel: -1.8,
    expectedDeltaCo2: -5.6,
    points: 45,
    status: 'AVAILABLE',
    createdAt: '2025-01-15T09:00:00Z',
    assignedRole: 'OPERATIONS_SUPERINTENDENT',
    priority: 'HIGH',
    estimatedDuration: 120,
    category: 'OPERATIONAL',
    difficulty: 'MEDIUM'
  },
  {
    id: 'task-ops-003',
    shipId: '1',
    type: 'ENVIRONMENTAL_CHECK',
    title: 'Safety Protocol Implementation',
    description: 'Implement and monitor safety protocols for crew and asset protection',
    expectedDeltaFuel: -1.5,
    expectedDeltaCo2: -4.6,
    points: 40,
    status: 'IN_PROGRESS',
    createdAt: '2025-01-15T10:00:00Z',
    assignedRole: 'OPERATIONS_SUPERINTENDENT',
    priority: 'HIGH',
    estimatedDuration: 150,
    category: 'SAFETY',
    difficulty: 'HARD'
  }
];

// Mock league standings with enhanced energy savings
export const mockLeagueStandings: LeagueStanding[] = [
  {
    rank: 1,
    shipId: '1',
    shipName: 'Aurora Spirit',
    totalPoints: 450,
    weeklyPoints: 120,
    badges: ['Energy Champion', 'Efficiency Master', 'Environmental Leader'],
    efficiencyScore: 95
  },
  {
    rank: 2,
    shipId: '2',
    shipName: 'Baltic Star',
    totalPoints: 380,
    weeklyPoints: 95,
    badges: ['Fuel Saver', 'Trim Optimizer'],
    efficiencyScore: 88
  },
  {
    rank: 3,
    shipId: '3',
    shipName: 'Coral Wave',
    totalPoints: 320,
    weeklyPoints: 80,
    badges: ['WHR Expert', 'Maintenance Pro'],
    efficiencyScore: 82
  },
  {
    rank: 4,
    shipId: '4',
    shipName: 'Delta Horizon',
    totalPoints: 280,
    weeklyPoints: 70,
    badges: ['Speed Optimizer'],
    efficiencyScore: 75
  },
  {
    rank: 5,
    shipId: '5',
    shipName: 'Eastern Crest',
    totalPoints: 240,
    weeklyPoints: 60,
    badges: ['Compliance Champion'],
    efficiencyScore: 70
  },
  {
    rank: 6,
    shipId: '6',
    shipName: 'Fjord Runner',
    totalPoints: 200,
    weeklyPoints: 50,
    badges: [],
    efficiencyScore: 68
  },
  {
    rank: 7,
    shipId: '7',
    shipName: 'Gulf Pioneer',
    totalPoints: 120,
    weeklyPoints: 30,
    badges: [],
    efficiencyScore: 65
  }
];

// Mock energy savings metrics for enhanced league tracking
export const mockEnergySavingsMetrics = [
  {
    shipId: '6',
    totalFuelSaved: 45.2,
    totalCo2Saved: 140.1,
    tasksCompleted: 8,
    tasksInProgress: 2,
    efficiencyScore: 82,
    whrEfficiency: 88,
    sgmUptime: 89,
    lightsOffCompliance: 95,
    waterConservationScore: 92,
    environmentalChecks: 6,
    pointsEarned: 75,
    badgesEarned: ['Energy Saver', 'Water Conservation Expert']
  }
];

// Mock sensor data generator
export function* generateMockSensorData(shipId: string, seed: number = 42): Generator<EnergyReading> {
  let x = seed;
  const rnd = () => (x = Math.imul(1664525, x + 1013904223) >>> 0) / 2**32;
  
  for (let i = 0; i < 1000; i++) {
    const meLoad = 65 + rnd() * 15;
    const aeLoad = 35 + rnd() * 10;
    const sfoc = 185 + rnd() * 8;
    const fuelRate = 28 + (meLoad - 65) / 10 + rnd();
    const trim = (rnd() - 0.5) * 0.4;
    const seaStates = ['Calm', 'Moderate', 'Rough'];
    const seaState = seaStates[Math.floor(rnd() * 3)];
    
    yield {
      id: `reading-${shipId}-${i}`,
      shipId,
      timestamp: new Date(Date.now() + i * 60000).toISOString(),
      meLoad,
      aeLoad,
      sfoc,
      fuelRate,
      trim,
      seaState,
      notes: i % 10 === 0 ? 'Regular maintenance check' : undefined
    };
  }
}

// Mock API functions
export async function getTasks(shipId: string): Promise<Task[]> {
  return mockTasks.filter(task => task.shipId === shipId);
}

export async function getRecommendations(shipId: string): Promise<Recommendation[]> {
  return mockRecommendations.filter(rec => rec.shipId === shipId);
}

export async function applyRecommendation(recommendationId: string, userId: string): Promise<void> {
  // Mock implementation
  console.log(`Applying recommendation ${recommendationId} by user ${userId}`);
}

export async function getLeagueStandings(): Promise<LeagueStanding[]> {
  return mockLeagueStandings;
}

export async function getEnergySavingsMetrics(shipId: string) {
  return mockEnergySavingsMetrics.find(metrics => metrics.shipId === shipId);
}

// Role-specific task filtering
export async function getRoleSpecificTasks(shipId: string, role: string): Promise<Task[]> {
  const roleTasks = mockTasks.filter(task => 
    task.shipId === shipId && 
    task.assignedRole === role
  );
  
  // Add some generic tasks for all roles
  const genericTasks = mockTasks.filter(task => 
    task.shipId === shipId && 
    !task.assignedRole && 
    ['ENVIRONMENTAL_CHECK', 'LIGHTS_OFF', 'WATER_SAVING'].includes(task.category)
  );
  
  return [...roleTasks, ...genericTasks];
}

export async function calculateRolePoints(shipId: string, role: string): Promise<number> {
  const roleTasks = await getRoleSpecificTasks(shipId, role);
  const completedTasks = roleTasks.filter(task => task.status === 'COMPLETED');
  return completedTasks.reduce((total, task) => total + task.points, 0);
}

// Mock ledger entries for FuelEU pool transactions
export function generateLedgerEntries(offerId: string, amountGco2e: number, priceEurPerGco2e: number): LedgerEntry[] {
  const totalCost = amountGco2e * priceEurPerGco2e;
  const offer = mockRFQs.flatMap(rfq => rfq.offers || []).find(o => o.id === offerId);
  
  if (!offer) {
    throw new Error(`Offer ${offerId} not found`);
  }
  
  const ledgerEntries: LedgerEntry[] = [
    {
      id: `ledger-${offerId}-fuel`,
      timestamp: new Date().toISOString(),
      type: 'FUEL_EU_PURCHASE',
      refId: offerId,
      amountEur: -totalCost,
      currency: 'EUR',
      memo: `FuelEU pool purchase from ${offer.counterparty}`
    }
  ];
  
  return ledgerEntries;
}

export async function calculateCharterCost(input: CharterCalculationInput): Promise<CharterCalculationResult> {
  // Mock calculation based on input parameters
  const baseRate = 15000; // Base daily rate
  const fuelFactor = input.fuelPrice / 500; // Normalize to $500/tonne baseline
  const distanceFactor = input.distance / 10000; // Normalize to 10,000nm baseline
  const cargoFactor = input.cargoSize / 50000; // Normalize to 50,000 tonnes baseline
  
  const dailyRate = baseRate * fuelFactor * distanceFactor * cargoFactor;
  const voyageDays = input.distance / (input.speed * 24);
  const totalCost = dailyRate * voyageDays;
  
  return {
    dailyRate: Math.round(dailyRate),
    voyageDays: Math.round(voyageDays * 10) / 10,
    totalCost: Math.round(totalCost),
    breakdown: {
      baseRate: Math.round(baseRate),
      fuelAdjustment: Math.round((fuelFactor - 1) * baseRate),
      distanceAdjustment: Math.round((distanceFactor - 1) * baseRate),
      cargoAdjustment: Math.round((cargoFactor - 1) * baseRate)
    }
  };
}

// Mock audit decision function
export async function getAuditDecision(shipId: string, year: number): Promise<AuditDecision> {
  // Mock implementation - in reality this would call external audit service
  const balance = mockFuelEUBalances.find(b => b.shipId === shipId && b.year === year);
  
  if (!balance) {
    throw new Error(`No FuelEU balance found for ship ${shipId} in year ${year}`);
  }
  
  const isCompliant = balance.balanceGco2e >= 0;
  const deficit = Math.abs(Math.min(0, balance.balanceGco2e));
  
  return {
    shipId,
    year,
    isCompliant,
    deficitGco2e: deficit,
    recommendedAction: isCompliant ? 'NO_ACTION' : 'PURCHASE_FUEL_EU',
    estimatedCost: deficit * 0.045, // €0.045 per gCO2e
    confidence: 0.95
  };
}

// Missing functions that are imported by other files
export async function fetchEnergySavingsMetrics(shipId: string) {
  return mockEnergySavingsMetrics.find(metrics => metrics.shipId === shipId) || {
    shipId,
    totalFuelSaved: 0,
    totalCo2Saved: 0,
    tasksCompleted: 0,
    tasksInProgress: 0,
    efficiencyScore: 0,
    whrEfficiency: 0,
    sgmUptime: 0,
    lightsOffCompliance: 0,
    waterConservationScore: 0,
    environmentalChecks: 0,
    pointsEarned: 0,
    badgesEarned: []
  };
}

export async function getEnvironmentalImpact(shipId: string) {
  const tasks = await getTasks(shipId);
  const completedTasks = tasks.filter(task => task.status === 'COMPLETED');
  
  return {
    totalCo2Saved: completedTasks.reduce((total, task) => total + Math.abs(task.expectedDeltaCo2), 0),
    totalFuelSaved: completedTasks.reduce((total, task) => total + Math.abs(task.expectedDeltaFuel), 0),
    environmentalScore: Math.min(100, completedTasks.length * 10)
  };
}

export async function fetchVoyages(shipId?: string) {
  try {
    // Call the voyages service backend API
    const response = await fetch('http://localhost:8080/voyages/api/voyages', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken') || 'mock-token'}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch voyages');
    }
    
    const data = await response.json();
    const voyages = data.data || [];
    
    console.log('Fetched voyages from backend:', voyages.length);
    console.log('First voyage sample:', JSON.stringify(voyages[0], null, 2));
    
    // Map backend data to frontend format
    const mappedVoyages = voyages.map((voyage: any) => {
      // Extract legs from backend - handle both nested legs array and separate voyage_legs
      let legsArray: string[] = [];
      if (voyage.legs && Array.isArray(voyage.legs)) {
        legsArray = voyage.legs.map((leg: any) => {
          if (typeof leg === 'string') return leg;
          if (leg.departure_port && leg.arrival_port) {
            return `${leg.departure_port} → ${leg.arrival_port}`;
          }
          return null;
        }).filter(Boolean);
      } else if (voyage.voyage_legs && Array.isArray(voyage.voyage_legs)) {
        // Sort by leg_number if available
        const sortedLegs = [...voyage.voyage_legs].sort((a: any, b: any) => 
          (a.leg_number || 0) - (b.leg_number || 0)
        );
        legsArray = sortedLegs.map((leg: any) => `${leg.departure_port} → ${leg.arrival_port}`);
      } else if (voyage.start_port && voyage.end_port) {
        // Fallback: create single leg from start/end ports
        legsArray = [`${voyage.start_port} → ${voyage.end_port}`];
      }
      
      return {
        id: voyage.id,
        voyage_id: voyage.voyage_id,
        shipId: voyage.ship_id,
        ship_name: voyage.ship_name || 'Unknown',
        imo: voyage.imo_number || '',
        origin: voyage.start_port || '',
        destination: voyage.end_port || '',
        startDate: voyage.start_date,
        endDate: voyage.end_date,
        status: voyage.status,
        distance: 0, // Calculate from legs if available
        fuelConsumed: 0,
        co2Emitted: 0,
        legs: legsArray,
        fueleu: {
          compliance_balance_gco2e: 0,
          banked_gco2e: 0,
          borrowed_gco2e: 0,
          pooling_status: 'NONE'
        },
        imo_dcs: {
          fuel_by_type_t: {}
        },
        eu_ets: {
          eua_exposure_tco2: 0,
          covered_share_pct: 0,
          surrender_deadline_iso: ''
        }
      };
    });

    // Enrich with regulatory computations and ensure we cover all vessels
    // Fetch vessels list with full details for accurate calculations
    let vesselsMap: Map<string, any> = new Map();
    try {
      const vesselsResp = await fetch('http://localhost:8080/vessels/api/vessels', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken') || 'mock-token'}` }
      });
      const vesselsJson = await vesselsResp.json();
      (vesselsJson.data || []).forEach((v: any) => {
        vesselsMap.set(String(v.id), {
          id: v.id,
          imo_number: v.imo_number,
          name: v.name,
          ship_type: v.ship_type || 'CONTAINER',
          deadweight_tonnage: v.deadweight_tonnage || 80000,
          gross_tonnage: v.gross_tonnage || 60000,
          engine_power_kw: v.engine_power_kw || 25000,
        });
      });
    } catch {
      // fallback empty
    }

    const shipIdToVoyage = new Map<string, any>();
    mappedVoyages.forEach(v => { if (v.shipId) shipIdToVoyage.set(String(v.shipId), v); });

    // EU ports list (major EU ports for route detection)
    const EU_PORTS = new Set([
      'Rotterdam', 'Amsterdam', 'Antwerp', 'Hamburg', 'Bremen', 'Bremerhaven', 
      'Barcelona', 'Valencia', 'Genoa', 'Naples', 'Marseille', 'Le Havre',
      'Felixstowe', 'Southampton', 'Dublin', 'Cork', 'Gdansk', 'Gdynia',
      'Klaipeda', 'Helsinki', 'Stockholm', 'Gothenburg', 'Copenhagen', 'Aarhus'
    ]);

    // Port distance estimates (nautical miles between major ports)
    const ROUTE_DISTANCES: Record<string, number> = {
      'Rotterdam-Singapore': 11000,
      'Rotterdam-Suez Canal': 3200,
      'Suez Canal-Singapore': 5400,
      'Rotterdam-New York': 3400,
      'Singapore-Shanghai': 1500,
      'Singapore-Hong Kong': 1400,
      'Rotterdam-Hamburg': 200,
      'Hamburg-New York': 3600,
    };

    // Vessel type fuel consumption factors (tonnes per 1000 nm)
    const VESSEL_FUEL_FACTORS: Record<string, { base: number; co2Factor: number; fuelMix: { hfo: number; mgo: number; lng: number } }> = {
      'CONTAINER': { base: 25, co2Factor: 3.114, fuelMix: { hfo: 0.75, mgo: 0.20, lng: 0.05 } },
      'BULK_CARRIER': { base: 20, co2Factor: 3.114, fuelMix: { hfo: 0.80, mgo: 0.15, lng: 0.05 } },
      'TANKER': { base: 18, co2Factor: 3.114, fuelMix: { hfo: 0.85, mgo: 0.10, lng: 0.05 } },
      'LNG_CARRIER': { base: 30, co2Factor: 2.75, fuelMix: { hfo: 0.10, mgo: 0.10, lng: 0.80 } }, // LNG carriers use LNG fuel
      'LPG_CARRIER': { base: 22, co2Factor: 2.85, fuelMix: { hfo: 0.70, mgo: 0.20, lng: 0.10 } },
      'CAR_CARRIER': { base: 28, co2Factor: 3.114, fuelMix: { hfo: 0.75, mgo: 0.20, lng: 0.05 } },
      'CRUISE': { base: 35, co2Factor: 3.114, fuelMix: { hfo: 0.60, mgo: 0.35, lng: 0.05 } },
      'GENERAL_CARGO': { base: 15, co2Factor: 3.114, fuelMix: { hfo: 0.80, mgo: 0.15, lng: 0.05 } },
      'CEMENT_CARRIER': { base: 16, co2Factor: 3.114, fuelMix: { hfo: 0.80, mgo: 0.15, lng: 0.05 } },
    };

    // Helper: Calculate distance from legs or ports
    const calcDistanceNm = (legs: string[], origin?: string, destination?: string): number => {
      if (legs && legs.length > 0) {
        // Estimate from legs: Rotterdam-Singapore route is ~8700nm total
        // Each leg varies: Rotterdam→Suez ~3200nm, Suez→Singapore ~5400nm
        let total = 0;
        for (const leg of legs) {
          const parts = leg.split(' → ');
          if (parts.length === 2) {
            const key = `${parts[0]}-${parts[1]}`;
            const reverseKey = `${parts[1]}-${parts[0]}`;
            if (ROUTE_DISTANCES[key]) total += ROUTE_DISTANCES[key];
            else if (ROUTE_DISTANCES[reverseKey]) total += ROUTE_DISTANCES[reverseKey];
            else {
              // Estimate: EU to Suez ~3000nm, Suez to Asia ~5000nm, EU to EU ~500nm
              const startEU = EU_PORTS.has(parts[0]);
              const endEU = EU_PORTS.has(parts[1]);
              if (startEU && endEU) total += 500;
              else if ((startEU || endEU) && (parts[0].includes('Suez') || parts[1].includes('Suez'))) total += 3000;
              else if (parts[0].includes('Suez') || parts[1].includes('Suez')) total += 5000;
              else total += 2000; // default intercontinental
            }
          }
        }
        return total || 3000; // fallback
      }
      if (origin && destination) {
        const key = `${origin}-${destination}`;
        if (ROUTE_DISTANCES[key]) return ROUTE_DISTANCES[key];
      }
      return 3000; // default
    };

    // Helper: Determine if voyage is intra-EU, extra-EU, or mixed
    const calculateEUETSCoverage = (legs: string[], origin?: string, destination?: string): number => {
      if (legs && legs.length > 0) {
        let euDistance = 0;
        let totalDistance = 0;
        for (const leg of legs) {
          const parts = leg.split(' → ');
          if (parts.length === 2) {
            const startEU = EU_PORTS.has(parts[0]);
            const endEU = EU_PORTS.has(parts[1]);
            const legDist = calcDistanceNm([leg], parts[0], parts[1]);
            totalDistance += legDist;
            if (startEU && endEU) {
              euDistance += legDist; // 100% EU
            } else if (startEU || endEU) {
              euDistance += legDist * 0.5; // 50% for extra-EU touching EU
            }
          }
        }
        return totalDistance > 0 ? Math.round((euDistance / totalDistance) * 100) : 50;
      }
      // Check origin/destination
      const originEU = origin && EU_PORTS.has(origin);
      const destEU = destination && EU_PORTS.has(destination);
      if (originEU && destEU) return 100; // Intra-EU
      if (originEU || destEU) return 50;  // Extra-EU touching EU
      return 0; // Non-EU
    };

    const FUEL_CO2_FACTOR_HFO = 3.114;
    const FUEL_CO2_FACTOR_MGO = 3.206;
    const FUEL_CO2_FACTOR_LNG = 2.75;
    const MJ_PER_TONNE_FUEL = 42700;
    const FUEL_EU_TARGET_GCO2E_PER_MJ_2025 = 91.16;

    const enrich = (v: any, vessel?: any): any => {
      const vesselData = vessel || vesselsMap.get(String(v.shipId));
      const shipType = vesselData?.ship_type || 'CONTAINER';
      const dwt = vesselData?.deadweight_tonnage || 80000;
      const enginePower = vesselData?.engine_power_kw || 25000;
      
      const fuelFactors = VESSEL_FUEL_FACTORS[shipType] || VESSEL_FUEL_FACTORS['CONTAINER'];
      
      const distanceNm = v.distance && v.distance > 0 
        ? v.distance 
        : calcDistanceNm(v.legs || [], v.origin, v.destination);
      
      // Fuel consumption varies by vessel type and size (larger = more fuel per nm but better per tonne cargo)
      const baseConsumption = fuelFactors.base * (distanceNm / 1000);
      const sizeMultiplier = Math.pow(dwt / 80000, 0.7); // Larger ships are more efficient per tonne
      const totalFuelT = Math.max(50, Math.round(baseConsumption * sizeMultiplier));
      
      // Fuel mix by type
      const hfo = Math.round(totalFuelT * fuelFactors.fuelMix.hfo);
      const mgo = Math.round(totalFuelT * fuelFactors.fuelMix.mgo);
      const lng = Math.round(totalFuelT * fuelFactors.fuelMix.lng);
      
      // CO2 emissions (different factors for different fuels)
      const co2T = Math.round(
        hfo * FUEL_CO2_FACTOR_HFO + 
        mgo * FUEL_CO2_FACTOR_MGO + 
        lng * FUEL_CO2_FACTOR_LNG
      );
      
      // Energy and FuelEU calculations
      const energyGJ = totalFuelT * (MJ_PER_TONNE_FUEL / 1000);
      const ghgIntensity = (co2T * 1e6) / (energyGJ * 1000);
      const intensityDelta = FUEL_EU_TARGET_GCO2E_PER_MJ_2025 - ghgIntensity;
      const balanceGco2e = Math.round(intensityDelta * (energyGJ * 1000));

      // EU ETS coverage based on actual route
      const coveredShare = calculateEUETSCoverage(v.legs || [], v.origin, v.destination);
      const euaExposure = Math.round(co2T * (coveredShare / 100));
      const surrenderDeadline = new Date(new Date().getFullYear() + 1, 3, 30).toISOString();

      return {
        ...v,
        distance: distanceNm,
        fuelConsumed: totalFuelT,
        co2Emitted: co2T,
        imo_dcs: {
          fuel_by_type_t: { 
            HFO: hfo, 
            MGO: mgo, 
            ...(lng > 0 ? { LNG: lng } : {})
          },
          transport_work_tnm: Math.round(dwt * distanceNm),
          submission_timeline: 'Monitoring quarterly; annual submission by Mar 31',
        },
        eu_ets: {
          eua_exposure_tco2: euaExposure,
          covered_share_pct: coveredShare,
          reported_year: new Date().getFullYear(),
          surrender_deadline_iso: surrenderDeadline,
        },
        fueleu: {
          energy_in_scope_gj: Math.round(energyGJ),
          ghg_intensity_gco2e_per_mj: Number(ghgIntensity.toFixed(2)),
          compliance_balance_gco2e: balanceGco2e,
          banked_gco2e: balanceGco2e > 0 ? Math.round(balanceGco2e * 0.2) : 0,
          borrowed_gco2e: balanceGco2e < 0 ? Math.abs(Math.round(balanceGco2e * 0.1)) : 0,
          pooling_status: balanceGco2e >= 0 ? 'SURPLUS_AVAILABLE' : 'DEFICIT_NEEDS_POOLING',
        },
      };
    };

    const enrichedMapped = mappedVoyages.map(v => enrich(v, vesselsMap.get(String(v.shipId))));

    // Generate varied routes based on vessel type
    const ROUTE_TEMPLATES: Record<string, Array<Array<string>>> = {
      'CONTAINER': [
        ['Rotterdam', 'Hamburg', 'Felixstowe'],
        ['Singapore', 'Hong Kong', 'Shanghai', 'Busan'],
        ['Los Angeles', 'Panama Canal', 'Savannah', 'Rotterdam'],
        ['Bremerhaven', 'New York', 'Charleston', 'Miami'],
        ['Algeciras', 'Singapore', 'Ningbo', 'Shanghai'],
      ],
      'BULK_CARRIER': [
        ['Port Hedland', 'Qingdao'],
        ['Tubarao', 'Rotterdam', 'Hamburg'],
        ['Newcastle', 'Tokyo', 'Yokohama'],
        ['Richards Bay', 'Tianjin', 'Shanghai'],
        ['Dampier', 'Qingdao', 'Dalian'],
      ],
      'TANKER': [
        ['Jebel Ali', 'Rotterdam', 'Hamburg'],
        ['Rotterdam', 'New York', 'Houston'],
        ['Singapore', 'Yokohama', 'Busan'],
        ['Ras Tanura', 'Fujairah', 'Rotterdam'],
        ['Abqaiq', 'Suez Canal', 'Rotterdam'],
      ],
      'LNG_CARRIER': [
        ['Ras Laffan', 'Sabetta', 'Rotterdam'],
        ['Sabine Pass', 'Zeebrugge'],
        ['Darwin', 'Tokyo Bay', 'Osaka'],
        ['Yamal', 'Sabetta', 'Rotterdam'],
        ['Gladstone', 'Tokyo Bay', 'Yokohama'],
      ],
      'LPG_CARRIER': [
        ['Houston', 'Rotterdam', 'Antwerp'],
        ['Yanbu', 'Suez Canal', 'Rotterdam'],
        ['Qatar', 'Fujairah', 'Singapore'],
      ],
      'CAR_CARRIER': [
        ['Bremerhaven', 'Baltimore', 'New York', 'Veracruz'],
        ['Yokohama', 'Long Beach', 'Vancouver'],
        ['Southampton', 'New York', 'Savannah'],
        ['Ulsan', 'Los Angeles', 'San Diego'],
      ],
      'GENERAL_CARGO': [
        ['Rotterdam', 'Gothenburg', 'Helsinki'],
        ['Shanghai', 'Busan', 'Tokyo'],
        ['Hamburg', 'Antwerp', 'Felixstowe'],
      ],
      'CEMENT_CARRIER': [
        ['Rotterdam', 'Hamburg', 'Copenhagen'],
        ['Shanghai', 'Hong Kong', 'Singapore'],
        ['Antwerp', 'London', 'Dublin'],
      ],
    };

    const getRouteForVessel = (vesselType: string, index: number): string[] => {
      const templates = ROUTE_TEMPLATES[vesselType] || ROUTE_TEMPLATES['CONTAINER'];
      const template = templates[index % templates.length];
      
      // Convert array to leg strings
      const legs: string[] = [];
      for (let i = 0; i < template.length - 1; i++) {
        legs.push(`${template[i]} → ${template[i + 1]}`);
      }
      return legs;
    };

    // Synthesize voyages for vessels without voyages
    const syntheticVoyages: any[] = [];
    let syntheticIndex = 0;
    vesselsMap.forEach((v, id) => {
      if (!shipIdToVoyage.has(String(id))) {
        const routeLegs = getRouteForVessel(v.ship_type || 'CONTAINER', syntheticIndex);
        const synth = enrich({
          id: `syn-${id}`,
          voyage_id: `V-${v.imo_number}-${Date.now()}`,
          shipId: id,
          ship_name: v.name,
          imo: v.imo_number,
          origin: routeLegs[0]?.split(' → ')[0] || 'Rotterdam',
          destination: routeLegs[routeLegs.length - 1]?.split(' → ')[1] || 'Singapore',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * (10 + syntheticIndex % 20)).toISOString(),
          status: 'COMPLETED',
          legs: routeLegs,
        }, v);
        syntheticVoyages.push(synth);
        syntheticIndex++;
      }
    });

    const finalVoyages = [...enrichedMapped, ...syntheticVoyages];

    // If a shipId filter is provided, filter here
    const filtered = shipId ? finalVoyages.filter(v => String(v.shipId) === String(shipId)) : finalVoyages;

    console.log('Voyages returned to UI:', filtered.length);
    return filtered;
  } catch (error) {
    console.error('Failed to fetch voyages from backend:', error);
    // Return empty array on error
    return [];
  }
}

export async function createPoolRFQ(rfqData: any) {
  // Mock implementation
  const newRFQ = {
    id: `rfq-${Date.now()}`,
    ...rfqData,
    status: 'OPEN',
    offers: []
  };
  
  mockRFQs.push(newRFQ);
  return newRFQ;
}

export async function acceptPoolOffer(offerId: string) {
  // Mock implementation
  const offer = mockRFQs.flatMap(rfq => rfq.offers || []).find(o => o.id === offerId);
  if (offer) {
    offer.status = 'ACCEPTED';
  }
  return offer;
}
