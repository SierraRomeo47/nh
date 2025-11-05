// Domain entities and value objects

export interface Company {
  id: string;
  name: string;
  imo_company_number: string;
  registration_country: string;
  created_at: Date;
  updated_at: Date;
}

export interface Vessel {
  id: string;
  company_id: string;
  imo_number: string;
  name: string;
  flag_state: string;
  created_at: Date;
  updated_at: Date;
}

export interface Voyage {
  id: string;
  vessel_id: string;
  start_date: Date;
  end_date: Date;
  voyage_type: 'COMMERCIAL' | 'BALLAST';
  created_at: Date;
  updated_at: Date;
}

export interface EmissionRecord {
  id: string;
  voyage_id: string;
  co2_tonnes: number;
  n2o_tonnes?: number;
  ch4_tonnes?: number;
  energy_gj: number;
  import_source: 'MRV_SYSTEM' | 'MANUAL';
  imported_at: Date;
  period_year: number;
  created_at: Date;
  updated_at: Date;
}

export interface VerificationRecord {
  id: string;
  emission_record_id: string;
  verifier_id: string;
  verification_status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  certificate_number?: string;
  verified_at?: Date;
  findings?: string;
  created_at: Date;
  updated_at: Date;
}

export interface FuelEUBalance {
  id: string;
  company_id: string;
  period_year: number;
  balance_gco2e: bigint; // Signed: can be negative (borrowing) or positive (banking)
  banked_gco2e: bigint;
  borrowed_gco2e: bigint;
  pool_allocation_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface PoolAllocation {
  id: string;
  company_id: string;
  vessel_id: string;
  period_year: number;
  pool_id: string;
  allocation_type: 'OUTFLOW' | 'INFLOW';
  amount_gco2e: bigint;
  effective_from: Date;
  created_at: Date;
  updated_at: Date;
}

export interface EUAOperation {
  id: string;
  company_id: string;
  operation_type: 'FORECAST' | 'HEDGE' | 'SURRENDER' | 'RECONCILE';
  euas_count: number; // Positive for forecast/hedge, negative for surrender
  price_per_eua?: number;
  executed_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface AuditEvent {
  id: string;
  user_id?: string;
  event_type: string;
  resource_type: string;
  resource_id?: string;
  action: string;
  metadata?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
  company_id?: string;
}
