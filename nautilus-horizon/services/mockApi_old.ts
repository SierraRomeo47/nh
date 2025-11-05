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

// Mock ships data
export const mockShips: Ship[] = [
  { id: '1', imo: '9391001', name: 'Aurora Spirit', class: 'BV', segment: 'MR Tanker', orgId: '1' },
  { id: '2', imo: '9391002', name: 'Baltic Star', class: 'LR', segment: 'MR Tanker', orgId: '1' },
  { id: '3', imo: '9391003', name: 'Coral Wave', class: 'DNV', segment: 'MR Tanker', orgId: '1' },
  { id: '4', imo: '9391004', name: 'Delta Horizon', class: 'ABS', segment: 'MR Tanker', orgId: '1' },
  { id: '5', imo: '9391005', name: 'Eastern Crest', class: 'NK', segment: 'MR Tanker', orgId: '1' },
  { id: '6', imo: '9391006', name: 'Fjord Runner', class: 'DNV', segment: 'MR Tanker', orgId: '1' },
  { id: '7', imo: '9391007', name: 'Gulf Pioneer', class: 'RINA', segment: 'MR Tanker', orgId: '1' }
];

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
  {
    id: 'task-003',
    shipId: '1',
    type: 'SPEED_OPTIMIZE',
    title: 'Speed Optimization Protocol',
    description: 'Implement eco-speed routing for next voyage leg',
    expectedDeltaFuel: -3.2,
    expectedDeltaCo2: -9.8,
    points: 60,
    status: 'IN_PROGRESS',
    createdAt: '2025-10-01T09:15:00Z',
    assignedRole: 'CAPTAIN',
    priority: 'HIGH',
    estimatedDuration: 60,
    category: 'ENERGY_SAVING',
    difficulty: 'EXPERT'
  },

  // Engineer Tasks - Technical and operational
  {
    id: 'task-004',
    shipId: '1',
    type: 'WHR_OPTIMIZE',
    title: 'Waste Heat Recovery Optimization',
    description: 'Calibrate and optimize waste heat recovery system for maximum efficiency',
    expectedDeltaFuel: -1.8,
    expectedDeltaCo2: -5.6,
    points: 45,
    status: 'AVAILABLE',
    createdAt: '2025-10-01T11:00:00Z',
    assignedRole: 'ENGINEER',
    priority: 'HIGH',
    estimatedDuration: 90,
    category: 'ENERGY_SAVING',
    difficulty: 'EXPERT'
  },
  {
    id: 'task-005',
    shipId: '1',
    type: 'VFD_ENABLE',
    title: 'Variable Frequency Drive Setup',
    description: 'Configure VFD for optimal motor efficiency in non-critical systems',
    expectedDeltaFuel: -0.8,
    expectedDeltaCo2: -2.4,
    points: 25,
    status: 'AVAILABLE',
    createdAt: '2025-10-01T12:30:00Z',
    assignedRole: 'ENGINEER',
    priority: 'MEDIUM',
    estimatedDuration: 120,
    category: 'ENERGY_SAVING',
    difficulty: 'HARD'
  },
  {
    id: 'task-006',
    shipId: '1',
    type: 'MAINTENANCE_ROUTINE',
    title: 'Engine Efficiency Check',
    description: 'Perform routine maintenance to ensure optimal engine performance',
    expectedDeltaFuel: -1.5,
    expectedDeltaCo2: -4.6,
    points: 40,
    status: 'IN_PROGRESS',
    createdAt: '2025-10-01T14:00:00Z',
    assignedRole: 'ENGINEER',
    priority: 'HIGH',
    estimatedDuration: 180,
    category: 'MAINTENANCE',
    difficulty: 'MEDIUM'
  },

  // Crew Tasks - Environmental and operational
  {
    id: 'task-007',
    shipId: '1',
    type: 'LIGHTS_OFF',
    title: 'Lights Off Protocol',
    description: 'Ensure all non-essential lighting is turned off during daylight hours',
    expectedDeltaFuel: -0.3,
    expectedDeltaCo2: -0.9,
    points: 15,
    status: 'AVAILABLE',
    createdAt: '2025-10-01T15:30:00Z',
    assignedRole: 'CREW',
    priority: 'LOW',
    estimatedDuration: 20,
    category: 'ENVIRONMENTAL',
    difficulty: 'EASY'
  },
  {
    id: 'task-008',
    shipId: '1',
    type: 'WATER_SAVING',
    title: 'Water Conservation Initiative',
    description: 'Implement water-saving measures in galley and accommodation areas',
    expectedDeltaFuel: -0.2,
    expectedDeltaCo2: -0.6,
    points: 12,
    status: 'AVAILABLE',
    createdAt: '2025-10-01T16:00:00Z',
    assignedRole: 'CREW',
    priority: 'LOW',
    estimatedDuration: 30,
    category: 'ENVIRONMENTAL',
    difficulty: 'EASY'
  },
  {
    id: 'task-009',
    shipId: '1',
    type: 'ENVIRONMENTAL_CHECK',
    title: 'Environmental Compliance Check',
    description: 'Perform daily environmental checks and record findings',
    expectedDeltaFuel: -0.1,
    expectedDeltaCo2: -0.3,
    points: 10,
    status: 'COMPLETED',
    createdAt: '2025-10-01T07:00:00Z',
    completedAt: '2025-10-01T07:30:00Z',
    assignedRole: 'CREW',
    priority: 'MEDIUM',
    estimatedDuration: 15,
    category: 'ENVIRONMENTAL',
    difficulty: 'EASY'
  },

  // Chief Engineer Tasks - Advanced technical
  {
    id: 'task-010',
    shipId: '1',
    type: 'WHR_OPTIMIZE',
    title: 'Advanced WHR System Analysis',
    description: 'Conduct comprehensive analysis and optimization of waste heat recovery systems',
    expectedDeltaFuel: -2.2,
    expectedDeltaCo2: -6.8,
    points: 55,
    status: 'AVAILABLE',
    createdAt: '2025-10-01T17:00:00Z',
    assignedRole: 'CHIEF_ENGINEER',
    priority: 'CRITICAL',
    estimatedDuration: 240,
    category: 'ENERGY_SAVING',
    difficulty: 'EXPERT'
  },
  {
    id: 'task-011',
    shipId: '1',
    type: 'ECO_RPM',
    title: 'Eco-RPM Discipline',
    description: '24h continuous operation within eco-RPM band',
    expectedDeltaFuel: -1.8,
    expectedDeltaCo2: -5.6,
    points: 40,
    status: 'IN_PROGRESS',
    createdAt: '2025-10-01T09:15:00Z',
    assignedRole: 'CHIEF_ENGINEER',
    priority: 'HIGH',
    estimatedDuration: 1440, // 24 hours
    category: 'ENERGY_SAVING',
    difficulty: 'HARD'
  },

  // Officer Tasks - Navigation and operational
  {
    id: 'task-012',
    shipId: '1',
    type: 'SPEED_OPTIMIZE',
    title: 'Route Optimization',
    description: 'Optimize voyage route for fuel efficiency considering weather conditions',
    expectedDeltaFuel: -2.8,
    expectedDeltaCo2: -8.6,
    points: 50,
    status: 'AVAILABLE',
    createdAt: '2025-10-01T18:30:00Z',
    assignedRole: 'OFFICER',
    priority: 'HIGH',
    estimatedDuration: 90,
    category: 'ENERGY_SAVING',
    difficulty: 'HARD'
  },
  {
    id: 'task-013',
    shipId: '1',
    type: 'ENVIRONMENTAL_CHECK',
    title: 'Environmental Monitoring',
    description: 'Monitor and report environmental compliance during navigation',
    expectedDeltaFuel: -0.1,
    expectedDeltaCo2: -0.3,
    points: 10,
    status: 'AVAILABLE',
    createdAt: '2025-10-01T19:00:00Z',
    assignedRole: 'OFFICER',
    priority: 'MEDIUM',
    estimatedDuration: 25,
    category: 'ENVIRONMENTAL',
    difficulty: 'EASY'
  }
];

// Mock league standings with enhanced energy savings
export const mockLeagueStandings: LeagueStanding[] = [
  {
    rank: 1,
    shipId: '6',
    shipName: 'Fjord Runner',
    totalPoints: 245,
    weeklyPoints: 85,
    badges: ['SGM Uptime >90% (7d)', 'Eco-RPM Discipline', 'WHR Master', 'Environmental Champion'],
    efficiencyScore: 87
  },
  {
    rank: 2,
    shipId: '2',
    shipName: 'Baltic Star',
    totalPoints: 220,
    weeklyPoints: 75,
    badges: ['Trim Master', 'Energy Saver', 'Water Conservation Expert'],
    efficiencyScore: 82
  },
  {
    rank: 3,
    shipId: '1',
    shipName: 'Aurora Spirit',
    totalPoints: 195,
    weeklyPoints: 60,
    badges: ['SGM Pioneer'],
    efficiencyScore: 78
  },
  {
    rank: 4,
    shipId: '3',
    shipName: 'Coral Wave',
    totalPoints: 180,
    weeklyPoints: 55,
    badges: ['Eco-RPM Discipline', 'Lights Off Champion'],
    efficiencyScore: 75
  },
  {
    rank: 5,
    shipId: '5',
    shipName: 'Eastern Crest',
    totalPoints: 165,
    weeklyPoints: 45,
    badges: ['Environmental Steward'],
    efficiencyScore: 72
  },
  {
    rank: 6,
    shipId: '4',
    shipName: 'Delta Horizon',
    totalPoints: 140,
    weeklyPoints: 40,
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
    userId: 'crew-6',
    role: 'CAPTAIN',
    period: 'WEEKLY' as const,
    timestamp: '2025-10-01T00:00:00Z',
    fuelSaved: 12.5,
    co2Saved: 38.7,
    electricitySaved: 850,
    waterSaved: 1200,
    tasksCompleted: 15,
    tasksInProgress: 3,
    efficiencyScore: 87,
    whrEfficiency: 92,
    sgmUptime: 95,
    lightsOffCompliance: 98,
    waterConservationScore: 85,
    environmentalChecks: 7,
    pointsEarned: 85,
    badgesEarned: ['WHR Master', 'Environmental Champion']
  },
  {
    shipId: '2',
    userId: 'crew-2',
    role: 'ENGINEER',
    period: 'WEEKLY' as const,
    timestamp: '2025-10-01T00:00:00Z',
    fuelSaved: 10.2,
    co2Saved: 31.6,
    electricitySaved: 720,
    waterSaved: 980,
    tasksCompleted: 12,
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
  
  for (let i = 0; i < 2880; i++) { // 2 days at 1-min intervals
    const rpm = 80 + rnd() * 10;
    const speed = 13 + rnd() * 1.5;
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
      rpm,
      speedKn: speed,
      meLoadPct: meLoad,
      aeLoadPct: aeLoad,
      sfocGKwh: sfoc,
      fuelRateTpd: fuelRate,
      cargoMode: 'LOADED',
      seaState,
      trimM: trim
    };
  }
}

// Mock API functions
export async function fetchVoyages(shipId?: string, section?: string): Promise<Voyage[]> {
  // Import here to avoid circular dependency
  const { mockVoyagesData } = await import('../data/voyages');
  
  let voyages = mockVoyagesData;
  
  if (shipId) {
    const ship = mockShips.find(s => s.id === shipId);
    if (ship) {
      voyages = voyages.filter(v => v.imo === ship.imo);
    }
  }
  
  return voyages;
}

export async function fetchRecommendations(shipId?: string): Promise<Recommendation[]> {
  return shipId ? mockRecommendations.filter(r => r.shipId === shipId) : mockRecommendations;
}

export async function applyRecommendation(recommendationId: string, userId: string): Promise<ActionLog> {
  const recommendation = mockRecommendations.find(r => r.id === recommendationId);
  if (!recommendation) throw new Error('Recommendation not found');
  
  // Mark recommendation as applied
  recommendation.status = 'APPLIED';
  
  // Create action log entry
  const actionLog: ActionLog = {
    id: `action-${Date.now()}`,
    recommendationId,
    crewUserId: userId,
    appliedTs: new Date().toISOString(),
    beforeSnapshot: { status: 'baseline' },
    afterSnapshot: { status: 'applied' },
    realizedDeltaTFuel: recommendation.expectedDeltaTFuel * (0.8 + Math.random() * 0.4), // Add some variance
    realizedDeltaTCo2: recommendation.expectedDeltaTCo2 * (0.8 + Math.random() * 0.4)
  };
  
  return actionLog;
}

export async function fetchFuelEUBalance(shipId: string, year: number): Promise<FuelEUBalance | null> {
  return mockFuelEUBalances.find(b => b.shipId === shipId && b.year === year) || null;
}

export async function createPoolRFQ(rfq: Omit<PoolRFQ, 'id' | 'offers'>): Promise<PoolRFQ> {
  const newRFQ: PoolRFQ = {
    ...rfq,
    id: `rfq-${Date.now()}`,
    offers: []
  };
  
  mockRFQs.push(newRFQ);
  return newRFQ;
}

export async function acceptPoolOffer(rfqId: string, offerId: string): Promise<LedgerEntry[]> {
  const rfq = mockRFQs.find(r => r.id === rfqId);
  const offer = rfq?.offers.find(o => o.id === offerId);
  
  if (!rfq || !offer) throw new Error('RFQ or offer not found');
  
  // Mark offer as accepted
  offer.status = OfferStatus.ACCEPTED;
  rfq.status = RfqStatus.FILLED;
  
  // Create ledger entries
  const totalCost = offer.offeredGco2e * offer.priceEurPerGco2e / 1e6; // Convert to EUR
  
  const ledgerEntries: LedgerEntry[] = [
    {
      id: `ledger-${Date.now()}-1`,
      timestamp: new Date().toISOString(),
      refType: 'POOL_PURCHASE',
      refId: offerId,
      amountEur: -totalCost,
      currency: 'EUR',
      memo: `FuelEU pool purchase from ${offer.counterparty}`
    }
  ];
  
  return ledgerEntries;
}

export async function calculateCharterCost(input: CharterCalculationInput): Promise<CharterCalculationResult> {
  // Simple charter cost allocation based on type and clause
  const baseFuelCost = input.fuelTons * 600; // €600/tonne fuel assumption
  const etsCost = input.co2Tons * (input.etsCoveredSharePct / 100) * input.euaPrice;
  const fueleuCost = Math.max(0, -input.complianceBalanceGco2e / 1e6 * (input.poolPrice || input.penalty));
  
  let ownerCost = 0;
  let chartererCost = 0;
  
  switch (input.charterType) {
    case 'SPOT_VOYAGE':
      if (input.clauseVariant === 'FREIGHT_INCLUSIVE') {
        chartererCost = baseFuelCost + etsCost + fueleuCost;
      } else {
        ownerCost = baseFuelCost;
        chartererCost = etsCost + fueleuCost;
      }
      break;
      
    case 'TIME':
      ownerCost = baseFuelCost;
      chartererCost = etsCost + fueleuCost;
      break;
      
    case 'BAREBOAT':
      chartererCost = baseFuelCost + etsCost + fueleuCost;
      break;
  }
  
  return {
    ownerCostEur: ownerCost,
    chartererCostEur: chartererCost,
    voyageTccEur: ownerCost + chartererCost,
    breakdown: {
      fuel: { owner: input.charterType === 'BAREBOAT' ? 0 : baseFuelCost, charterer: input.charterType === 'BAREBOAT' ? baseFuelCost : 0 },
      ets: { owner: 0, charterer: etsCost },
      fueleu: { owner: 0, charterer: fueleuCost }
    }
  };
}

export async function generateAuditPack(decisionId: string): Promise<Blob> {
  const { auditService } = await import('./auditService');
  
  try {
    const auditPack = await auditService.generateAuditPack(decisionId);
    
    const auditData = {
      decisionId,
      timestamp: new Date().toISOString(),
      summary: 'Comprehensive compliance audit pack',
      decision: auditPack.decision,
      ledgerEntries: auditPack.ledgerEntries,
      narrative: auditPack.narrative,
      downloadUrl: auditPack.downloadUrl,
      policies: { version: '1.0', applied: 'FuelEU Maritime 2025, EU ETS, IMO DCS' }
    };
    
    return new Blob([JSON.stringify(auditData, null, 2)], { type: 'application/json' });
  } catch (error) {
    console.error('Failed to generate audit pack:', error);
    
    // Fallback mock data
    const auditData = {
      decisionId,
      timestamp: new Date().toISOString(),
      summary: 'Mock audit pack for compliance decision',
      ledgerEntries: [],
      policies: { version: '1.0', applied: 'FuelEU Maritime 2025' },
      error: 'Audit service unavailable'
    };
    
    return new Blob([JSON.stringify(auditData, null, 2)], { type: 'application/json' });
  }
}

// Enhanced functions for role-based task management and energy savings tracking

export async function fetchTasksByRole(shipId: string, role: string): Promise<Task[]> {
  return mockTasks.filter(task => 
    task.shipId === shipId && 
    (task.assignedRole === role || !task.assignedRole) // Include unassigned tasks
  );
}

export async function fetchEnergySavingsMetrics(shipId: string, userId?: string): Promise<EnergySavingsMetrics[]> {
  let metrics = mockEnergySavingsMetrics.filter(metric => metric.shipId === shipId);
  
  if (userId) {
    metrics = metrics.filter(metric => metric.userId === userId);
  }
  
  return metrics;
}

export async function getRoleSpecificTasks(shipId: string, role: string): Promise<Task[]> {
  const roleTasks = mockTasks.filter(task => 
    task.shipId === shipId && task.assignedRole === role
  );
  
  // Add some generic tasks that all roles can perform
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

export async function getEnvironmentalImpact(shipId: string): Promise<{
  totalCo2Saved: number;
  totalFuelSaved: number;
  environmentalScore: number;
}> {
  const tasks = mockTasks.filter(task => task.shipId === shipId && task.status === 'COMPLETED');
  
  const totalCo2Saved = tasks.reduce((total, task) => total + Math.abs(task.expectedDeltaCo2), 0);
  const totalFuelSaved = tasks.reduce((total, task) => total + Math.abs(task.expectedDeltaFuel), 0);
  
  // Calculate environmental score based on completed environmental and energy-saving tasks
  const environmentalTasks = tasks.filter(task => 
    ['ENVIRONMENTAL', 'ENERGY_SAVING'].includes(task.category)
  );
  const environmentalScore = Math.min(100, (environmentalTasks.length / 10) * 100);
  
  return {
    totalCo2Saved,
    totalFuelSaved,
    environmentalScore
  };
}