// Charter and Broker Types based on maritime industry standards

export enum CharterType {
  VOYAGE = 'VOYAGE',
  TIME_CHARTER = 'TIME_CHARTER',
  BAREBOAT = 'BAREBOAT',
  COA = 'COA' // Contract of Affreightment
}

export enum VesselSize {
  HANDYSIZE = 'HANDYSIZE',
  HANDYMAX = 'HANDYMAX',
  PANAMAX = 'PANAMAX',
  SUPRAMAX = 'SUPRAMAX',
  AFRAMAX = 'AFRAMAX',
  SUEZMAX = 'SUEZMAX',
  VLCC = 'VLCC',
  ULCC = 'ULCC'
}

export enum CargoType {
  DRY_BULK = 'DRY_BULK',
  LIQUID_BULK = 'LIQUID_BULK',
  CONTAINERS = 'CONTAINERS',
  GENERAL_CARGO = 'GENERAL_CARGO',
  LNG = 'LNG',
  LPG = 'LPG'
}

export enum BidStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  COUNTERED = 'COUNTERED',
  WITHDRAWN = 'WITHDRAWN',
  EXPIRED = 'EXPIRED'
}

export interface VoyageEstimate {
  id: string;
  route: {
    loadPort: string;
    loadPortCode: string;
    dischargePort: string;
    dischargePortCode: string;
    distance: number; // nautical miles
  };
  cargo: {
    type: CargoType;
    quantity: number; // metric tons
    loadRate: number; // tons per day
    dischargeRate: number; // tons per day
  };
  vessel: {
    type: string;
    dwt: number;
    speed: number; // knots
    consumption: {
      laden: number; // tons/day at sea
      ballast: number; // tons/day at sea
      port: number; // tons/day in port
    };
  };
  bunkers: {
    ifoPrice: number; // USD per ton
    mgoPrice: number; // USD per ton
    ifoQuantity: number;
    mgoQuantity: number;
  };
  portCosts: {
    loadPortCosts: number; // USD
    dischargePortCosts: number; // USD
    canalDues?: number; // USD (if applicable)
  };
  freight: {
    rate: number; // USD per ton or USD per day
    rateType: 'PER_TON' | 'LUMPSUM' | 'PER_DAY';
    totalFreight: number; // USD
  };
  timing: {
    seaDaysLaden: number;
    seaDaysBallast: number;
    loadDays: number;
    dischargeDays: number;
    totalDays: number;
  };
  economics: {
    grossRevenue: number;
    bunkerCost: number;
    portCosts: number;
    otherCosts: number; // commissions, etc.
    netRevenue: number;
    tcePerDay: number; // Time Charter Equivalent per day
  };
}

export interface RFQ {
  id: string;
  rfqNumber: string;
  charterer: string;
  chartererId: string;
  createdAt: Date;
  expiresAt: Date;
  status: 'OPEN' | 'CLOSED' | 'AWARDED' | 'CANCELLED';
  charterType: CharterType;
  cargo: {
    type: CargoType;
    quantity: number;
    tolerance?: number; // percentage
  };
  laycan: {
    start: Date; // Laycan = Laydays/Cancelling
    end: Date;
  };
  route: {
    loadPort: string;
    loadPortCode: string;
    dischargePort: string;
    dischargePortCode: string;
    alternativeDischarge?: string[];
  };
  vesselRequirements: {
    minDwt: number;
    maxDwt: number;
    maxAge?: number;
    flags?: string[]; // Acceptable flag states
    iceClass?: string;
  };
  terms: {
    freightBasis: string; // e.g., "WORLDSCALE", "LUMPSUM", "PER_TON"
    loadTerms: string; // e.g., "FILO" (Free In Liner Out)
    paymentTerms: string;
    demurrage?: number; // USD per day
    despatch?: number; // USD per day
  };
  bids: Bid[];
  attachments?: string[];
  notes?: string;
}

export interface Bid {
  id: string;
  bidNumber: string;
  rfqId: string;
  brokerId: string;
  brokerName: string;
  brokerCompany: string;
  submittedAt: Date;
  status: BidStatus;
  vessel: {
    name: string;
    imo: string;
    flag: string;
    built: number;
    dwt: number;
    loa: number; // Length overall
    beam: number;
    draft: number;
    grt: number;
    currentPosition?: string;
    eta?: Date;
  };
  offer: {
    freightRate: number;
    freightBasis: string;
    totalFreight?: number;
    demurrage?: number;
    despatch?: number;
    laytime?: string;
    validity: Date; // Offer valid until
  };
  estimate: VoyageEstimate;
  messages: ChatMessage[];
  counterOffers?: {
    chartererRate?: number;
    brokerRate?: number;
    negotiationRounds: number;
  };
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'CHARTERER' | 'BROKER';
  message: string;
  timestamp: Date;
  type: 'MESSAGE' | 'BID_SUBMIT' | 'BID_ACCEPT' | 'BID_REJECT' | 'COUNTER_OFFER' | 'SYSTEM';
  bidData?: {
    rate: number;
    basis: string;
    tce?: number;
  };
}

export interface CharterMarketListing {
  id: string;
  type: 'CARGO' | 'TONNAGE'; // Cargo available or vessel available
  postedBy: string;
  postedAt: Date;
  laycan: {
    start: Date;
    end: Date;
  };
  cargo?: {
    type: CargoType;
    quantity: number;
    loadPort: string;
    dischargePort: string;
  };
  vessel?: {
    name: string;
    type: string;
    dwt: number;
    open: string; // Port where vessel is available
    openDate: Date;
  };
  indicativeRate?: number;
  status: 'ACTIVE' | 'FIXED' | 'CANCELLED';
}
