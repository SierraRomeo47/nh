import { z } from 'zod';

// DTOs for HTTP requests/responses

export const createEmissionRecordSchema = z.object({
  voyage_id: z.string().uuid(),
  co2_tonnes: z.number().positive(),
  n2o_tonnes: z.number().positive().optional(),
  ch4_tonnes: z.number().positive().optional(),
  energy_gj: z.number().positive(),
  import_source: z.enum(['MRV_SYSTEM', 'MANUAL']),
  period_year: z.number().int().min(2020).max(2050),
});

export type CreateEmissionRecordDto = z.infer<typeof createEmissionRecordSchema>;

export const updateFuelEUBalanceSchema = z.object({
  company_id: z.string().uuid(),
  period_year: z.number().int().min(2020).max(2050),
  adjustment_gco2e: z.number().int(),
  operation: z.enum(['BANK', 'BORROW', 'POOL', 'ADJUST']),
});

export type UpdateFuelEUBalanceDto = z.infer<typeof updateFuelEUBalanceSchema>;

export const createEUAOperationSchema = z.object({
  company_id: z.string().uuid(),
  operation_type: z.enum(['FORECAST', 'HEDGE', 'SURRENDER', 'RECONCILE']),
  euas_count: z.number().int(),
  price_per_eua: z.number().positive().optional(),
  voyage_ids: z.array(z.string().uuid()).optional(),
});

export type CreateEUAOperationDto = z.infer<typeof createEUAOperationSchema>;

export const createPoolAllocationSchema = z.object({
  company_id: z.string().uuid(),
  vessel_id: z.string().uuid(),
  period_year: z.number().int().min(2020).max(2050),
  pool_id: z.string().uuid(),
  amount_gco2e: z.number().int(),
  allocation_type: z.enum(['OUTFLOW', 'INFLOW']),
});

export type CreatePoolAllocationDto = z.infer<typeof createPoolAllocationSchema>;

export const getKPIsSchema = z.object({
  company_id: z.string().uuid(),
  period_year: z.number().int().min(2020).max(2050),
});

export type GetKPIsDto = z.infer<typeof getKPIsSchema>;

export interface KPIResponse {
  period_year: number;
  total_emissions_tonnes: number;
  fuel_eu_balance_gco2e: bigint;
  required_euas: number;
  forecasted_euas: number;
  surrendered_euas: number;
  pool_performance: {
    total_outflow_gco2e: bigint;
    total_inflow_gco2e: bigint;
    net_performance_gco2e: bigint;
  };
  verification_rate: number; // Percentage of emissions verified
}
