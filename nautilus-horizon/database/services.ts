// Database Services
// CRUD operations for maritime compliance data

import { Pool } from 'pg';
import { getPool } from './config';
import {
  Organization,
  Ship,
  Voyage,
  VoyageLeg,
  FuelConsumption,
  EuEtsData,
  FuelEuData,
  Verifier,
  Verification,
  PoolingArrangement,
  PoolParticipant,
  PoolRfq,
  PoolOffer,
  EuaTrade,
  ComplianceAlert,
  AuditLog
} from './models';

export class DatabaseService {
  private pool: Pool;

  constructor() {
    this.pool = getPool();
  }

  // Organization CRUD
  async createOrganization(org: Omit<Organization, 'id' | 'created_at' | 'updated_at'>): Promise<Organization> {
    const query = `
      INSERT INTO organizations (name, imo_company_number, registration_country, address, contact_email, contact_phone)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [org.name, org.imo_company_number, org.registration_country, org.address, org.contact_email, org.contact_phone];
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async getOrganization(id: string): Promise<Organization | null> {
    const query = 'SELECT * FROM organizations WHERE id = $1 AND is_active = true';
    const result = await this.pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async updateOrganization(id: string, updates: Partial<Organization>): Promise<Organization | null> {
    const fields = Object.keys(updates).filter(key => key !== 'id' && key !== 'created_at');
    const values = Object.values(updates).filter((_, index) => fields[index] !== 'id' && fields[index] !== 'created_at');
    
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const query = `UPDATE organizations SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`;
    
    const result = await this.pool.query(query, [id, ...values]);
    return result.rows[0] || null;
  }

  // Ship CRUD
  async createShip(ship: Omit<Ship, 'id' | 'created_at' | 'updated_at'>): Promise<Ship> {
    const query = `
      INSERT INTO ships (imo_number, name, organization_id, ship_type, gross_tonnage, deadweight_tonnage, 
                        engine_power_kw, flag_state, year_built, classification_society)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const values = [
      ship.imo_number, ship.name, ship.organization_id, ship.ship_type,
      ship.gross_tonnage, ship.deadweight_tonnage, ship.engine_power_kw,
      ship.flag_state, ship.year_built, ship.classification_society
    ];
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async getShip(id: string): Promise<Ship | null> {
    const query = 'SELECT * FROM ships WHERE id = $1 AND is_active = true';
    const result = await this.pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async getShipsByOrganization(orgId: string): Promise<Ship[]> {
    const query = 'SELECT * FROM ships WHERE organization_id = $1 AND is_active = true ORDER BY name';
    const result = await this.pool.query(query, [orgId]);
    return result.rows;
  }

  // Voyage CRUD
  async createVoyage(voyage: Omit<Voyage, 'id' | 'created_at' | 'updated_at'>): Promise<Voyage> {
    const query = `
      INSERT INTO voyages (voyage_id, ship_id, voyage_type, start_date, end_date, start_port, end_port, charter_type, charterer_org_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const values = [
      voyage.voyage_id, voyage.ship_id, voyage.voyage_type, voyage.start_date,
      voyage.end_date, voyage.start_port, voyage.end_port, voyage.charter_type, voyage.charterer_org_id
    ];
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async getVoyage(id: string): Promise<Voyage | null> {
    const query = 'SELECT * FROM voyages WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async getVoyagesByShip(shipId: string, limit = 50): Promise<Voyage[]> {
    const query = 'SELECT * FROM voyages WHERE ship_id = $1 ORDER BY start_date DESC LIMIT $2';
    const result = await this.pool.query(query, [shipId, limit]);
    return result.rows;
  }

  // Fuel Consumption CRUD
  async createFuelConsumption(fuel: Omit<FuelConsumption, 'id' | 'created_at'>): Promise<FuelConsumption> {
    const query = `
      INSERT INTO fuel_consumption (voyage_id, leg_id, fuel_type, consumption_tonnes, consumption_date,
                                   fuel_supplier, bunker_delivery_note, density_kg_m3, sulphur_content_pct, carbon_content_pct)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const values = [
      fuel.voyage_id, fuel.leg_id, fuel.fuel_type, fuel.consumption_tonnes, fuel.consumption_date,
      fuel.fuel_supplier, fuel.bunker_delivery_note, fuel.density_kg_m3, fuel.sulphur_content_pct, fuel.carbon_content_pct
    ];
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async getFuelConsumptionByVoyage(voyageId: string): Promise<FuelConsumption[]> {
    const query = 'SELECT * FROM fuel_consumption WHERE voyage_id = $1 ORDER BY consumption_date';
    const result = await this.pool.query(query, [voyageId]);
    return result.rows;
  }

  // EU ETS Data CRUD
  async createEuEtsData(ets: Omit<EuEtsData, 'id' | 'created_at'>): Promise<EuEtsData> {
    const query = `
      INSERT INTO eu_ets_data (voyage_id, reporting_year, covered_share_pct, total_co2_emissions_t,
                              eu_covered_emissions_t, surrender_deadline, allowances_required, allowances_surrendered)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const values = [
      ets.voyage_id, ets.reporting_year, ets.covered_share_pct, ets.total_co2_emissions_t,
      ets.eu_covered_emissions_t, ets.surrender_deadline, ets.allowances_required, ets.allowances_surrendered
    ];
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async getEuEtsDataByVoyage(voyageId: string): Promise<EuEtsData[]> {
    const query = 'SELECT * FROM eu_ets_data WHERE voyage_id = $1 ORDER BY reporting_year DESC';
    const result = await this.pool.query(query, [voyageId]);
    return result.rows;
  }

  // FuelEU Data CRUD
  async createFuelEuData(fueleu: Omit<FuelEuData, 'id' | 'created_at'>): Promise<FuelEuData> {
    const query = `
      INSERT INTO fueleu_data (voyage_id, reporting_year, energy_in_scope_gj, ghg_intensity_gco2e_per_mj,
                              compliance_balance_gco2e, pooling_status, pool_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [
      fueleu.voyage_id, fueleu.reporting_year, fueleu.energy_in_scope_gj, fueleu.ghg_intensity_gco2e_per_mj,
      fueleu.compliance_balance_gco2e, fueleu.pooling_status, fueleu.pool_id
    ];
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async getFuelEuDataByVoyage(voyageId: string): Promise<FuelEuData[]> {
    const query = 'SELECT * FROM fueleu_data WHERE voyage_id = $1 ORDER BY reporting_year DESC';
    const result = await this.pool.query(query, [voyageId]);
    return result.rows;
  }

  // Verification CRUD
  async createVerification(verification: Omit<Verification, 'id' | 'created_at'>): Promise<Verification> {
    const query = `
      INSERT INTO verifications (verifier_id, data_type, reference_id, verification_date,
                                verification_result, findings, recommendations, certificate_number)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const values = [
      verification.verifier_id, verification.data_type, verification.reference_id, verification.verification_date,
      verification.verification_result, verification.findings, verification.recommendations, verification.certificate_number
    ];
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async getVerificationsByVerifier(verifierId: string): Promise<Verification[]> {
    const query = 'SELECT * FROM verifications WHERE verifier_id = $1 ORDER BY verification_date DESC';
    const result = await this.pool.query(query, [verifierId]);
    return result.rows;
  }

  // Compliance Alerts
  async createComplianceAlert(alert: Omit<ComplianceAlert, 'id' | 'created_at'>): Promise<ComplianceAlert> {
    const query = `
      INSERT INTO compliance_alerts (organization_id, alert_type, severity, title, description, due_date)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [alert.organization_id, alert.alert_type, alert.severity, alert.title, alert.description, alert.due_date];
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async getActiveAlertsByOrganization(orgId: string): Promise<ComplianceAlert[]> {
    const query = 'SELECT * FROM compliance_alerts WHERE organization_id = $1 AND status = $2 ORDER BY severity DESC, created_at DESC';
    const result = await this.pool.query(query, [orgId, 'ACTIVE']);
    return result.rows;
  }

  // Audit Trail
  async getAuditLog(tableName: string, recordId: string): Promise<AuditLog[]> {
    const query = 'SELECT * FROM audit_log WHERE table_name = $1 AND record_id = $2 ORDER BY timestamp DESC';
    const result = await this.pool.query(query, [tableName, recordId]);
    return result.rows;
  }

  // Complex Queries for Reporting
  async getFleetComplianceSummary(orgId: string, year: number): Promise<any> {
    const query = `
      SELECT 
        s.name as ship_name,
        s.imo_number,
        COUNT(v.id) as total_voyages,
        SUM(fc.consumption_tonnes) as total_fuel_consumption,
        SUM(ets.eu_covered_emissions_t) as total_ets_emissions,
        SUM(fueleu.compliance_balance_gco2e) as fueleu_balance,
        AVG(ets.compliance_status = 'COMPLIANT'::text)::float as compliance_rate
      FROM ships s
      LEFT JOIN voyages v ON s.id = v.ship_id AND EXTRACT(YEAR FROM v.start_date) = $2
      LEFT JOIN fuel_consumption fc ON v.id = fc.voyage_id
      LEFT JOIN eu_ets_data ets ON v.id = ets.voyage_id AND ets.reporting_year = $2
      LEFT JOIN fueleu_data fueleu ON v.id = fueleu.voyage_id AND fueleu.reporting_year = $2
      WHERE s.organization_id = $1 AND s.is_active = true
      GROUP BY s.id, s.name, s.imo_number
      ORDER BY s.name
    `;
    const result = await this.pool.query(query, [orgId, year]);
    return result.rows;
  }

  async getPoolingOpportunities(orgId: string, year: number): Promise<any> {
    const query = `
      SELECT 
        s.name as ship_name,
        fueleu.compliance_balance_gco2e,
        fueleu.energy_in_scope_gj,
        CASE 
          WHEN fueleu.compliance_balance_gco2e > 0 THEN 'SURPLUS'
          WHEN fueleu.compliance_balance_gco2e < 0 THEN 'DEFICIT'
          ELSE 'BALANCED'
        END as balance_type
      FROM ships s
      JOIN voyages v ON s.id = v.ship_id
      JOIN fueleu_data fueleu ON v.id = fueleu.voyage_id
      WHERE s.organization_id = $1 
        AND fueleu.reporting_year = $2
        AND fueleu.compliance_balance_gco2e != 0
      ORDER BY ABS(fueleu.compliance_balance_gco2e) DESC
    `;
    const result = await this.pool.query(query, [orgId, year]);
    return result.rows;
  }

  // Close connection
  async close(): Promise<void> {
    await this.pool.end();
  }
}

// Export singleton instance
export const dbService = new DatabaseService();
