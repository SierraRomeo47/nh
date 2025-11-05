// Database Migrations
// Handles database schema updates and data migrations

import { Pool } from 'pg';
import { getPool } from './config';

export interface Migration {
  id: string;
  name: string;
  up: string;
  down: string;
}

export class MigrationService {
  private pool: Pool;

  constructor() {
    this.pool = getPool();
  }

  async initializeMigrationsTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS migrations (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    await this.pool.query(query);
  }

  async getExecutedMigrations(): Promise<string[]> {
    const query = 'SELECT id FROM migrations ORDER BY executed_at';
    const result = await this.pool.query(query);
    return result.rows.map(row => row.id);
  }

  async executeMigration(migration: Migration): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(migration.up);
      await client.query('INSERT INTO migrations (id, name) VALUES ($1, $2)', [migration.id, migration.name]);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async rollbackMigration(migration: Migration): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(migration.down);
      await client.query('DELETE FROM migrations WHERE id = $1', [migration.id]);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async runMigrations(migrations: Migration[]): Promise<void> {
    await this.initializeMigrationsTable();
    const executed = await this.getExecutedMigrations();
    
    for (const migration of migrations) {
      if (!executed.includes(migration.id)) {
        console.log(`Running migration: ${migration.name}`);
        await this.executeMigration(migration);
      }
    }
  }
}

// Define migrations
export const migrations: Migration[] = [
  {
    id: '001_initial_schema',
    name: 'Create initial database schema',
    up: `
      -- This migration creates the complete initial schema
      -- See schema.sql for the full schema definition
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      
      -- Organizations table
      CREATE TABLE IF NOT EXISTS organizations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        imo_company_number VARCHAR(7) UNIQUE,
        registration_country VARCHAR(3) NOT NULL,
        address TEXT,
        contact_email VARCHAR(255),
        contact_phone VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        is_active BOOLEAN DEFAULT TRUE
      );
      
      -- Ships table
      CREATE TABLE IF NOT EXISTS ships (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        imo_number VARCHAR(7) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
        ship_type VARCHAR(100),
        gross_tonnage INTEGER,
        deadweight_tonnage INTEGER,
        engine_power_kw INTEGER,
        flag_state VARCHAR(3) NOT NULL,
        year_built INTEGER,
        classification_society VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        is_active BOOLEAN DEFAULT TRUE
      );
      
      -- Add other tables as needed...
    `,
    down: `
      DROP TABLE IF EXISTS ships CASCADE;
      DROP TABLE IF EXISTS organizations CASCADE;
    `
  },
  
  {
    id: '002_add_verification_indexes',
    name: 'Add performance indexes for verification queries',
    up: `
      CREATE INDEX IF NOT EXISTS idx_verifications_data_type ON verifications(data_type);
      CREATE INDEX IF NOT EXISTS idx_verifications_result ON verifications(verification_result);
      CREATE INDEX IF NOT EXISTS idx_fuel_consumption_verified ON fuel_consumption(verified_at);
      CREATE INDEX IF NOT EXISTS idx_eu_ets_verified ON eu_ets_data(verified_at);
      CREATE INDEX IF NOT EXISTS idx_fueleu_verified ON fueleu_data(verified_at);
    `,
    down: `
      DROP INDEX IF EXISTS idx_verifications_data_type;
      DROP INDEX IF EXISTS idx_verifications_result;
      DROP INDEX IF EXISTS idx_fuel_consumption_verified;
      DROP INDEX IF EXISTS idx_eu_ets_verified;
      DROP INDEX IF EXISTS idx_fueleu_verified;
    `
  },
  
  {
    id: '003_add_compliance_views',
    name: 'Create compliance reporting views',
    up: `
      -- Fleet compliance summary view
      CREATE OR REPLACE VIEW fleet_compliance_summary AS
      SELECT 
        o.id as organization_id,
        o.name as organization_name,
        s.id as ship_id,
        s.name as ship_name,
        s.imo_number,
        COUNT(v.id) as total_voyages,
        SUM(fc.consumption_tonnes) as total_fuel_consumption,
        SUM(ets.eu_covered_emissions_t) as total_ets_emissions,
        SUM(fueleu.compliance_balance_gco2e) as fueleu_balance,
        AVG(CASE WHEN ets.compliance_status = 'COMPLIANT' THEN 1.0 ELSE 0.0 END) as compliance_rate
      FROM organizations o
      JOIN ships s ON o.id = s.organization_id
      LEFT JOIN voyages v ON s.id = v.ship_id
      LEFT JOIN fuel_consumption fc ON v.id = fc.voyage_id
      LEFT JOIN eu_ets_data ets ON v.id = ets.voyage_id
      LEFT JOIN fueleu_data fueleu ON v.id = fueleu.voyage_id
      WHERE o.is_active = true AND s.is_active = true
      GROUP BY o.id, o.name, s.id, s.name, s.imo_number;
      
      -- Pooling opportunities view
      CREATE OR REPLACE VIEW pooling_opportunities AS
      SELECT 
        o.id as organization_id,
        o.name as organization_name,
        s.name as ship_name,
        fueleu.compliance_balance_gco2e,
        fueleu.energy_in_scope_gj,
        fueleu.reporting_year,
        CASE 
          WHEN fueleu.compliance_balance_gco2e > 0 THEN 'SURPLUS'
          WHEN fueleu.compliance_balance_gco2e < 0 THEN 'DEFICIT'
          ELSE 'BALANCED'
        END as balance_type
      FROM organizations o
      JOIN ships s ON o.id = s.organization_id
      JOIN voyages v ON s.id = v.ship_id
      JOIN fueleu_data fueleu ON v.id = fueleu.voyage_id
      WHERE o.is_active = true AND s.is_active = true
        AND fueleu.compliance_balance_gco2e != 0;
    `,
    down: `
      DROP VIEW IF EXISTS pooling_opportunities;
      DROP VIEW IF EXISTS fleet_compliance_summary;
    `
  }
];

// Run migrations
export async function runMigrations(): Promise<void> {
  const migrationService = new MigrationService();
  await migrationService.runMigrations(migrations);
  console.log('Database migrations completed successfully');
}
