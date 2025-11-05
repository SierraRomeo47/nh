import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';

const DB_URL = process.env.DB_URL || 'postgres://postgres:nautilus_dev_password_123@localhost:5432/nautilus';

async function loadSeedData() {
  const pool = new Pool({ connectionString: DB_URL });
  
  try {
    console.log('Loading synthetic maritime data...');
    
    // Read the SQL file
    const sqlPath = join(__dirname, 'synthetic_data.sql');
    const sql = readFileSync(sqlPath, 'utf-8');
    
    // Execute the SQL
    await pool.query(sql);
    
    console.log('✓ Synthetic data loaded successfully!');
    console.log('  - 5 Organizations');
    console.log('  - 30 Vessels (10 different types)');
    console.log('  - Sample Users (admin, crew, officers, engineers, managers)');
    console.log('  - 6 Voyages with legs');
    console.log('  - Fuel consumption data');
    console.log('  - Energy efficiency technologies');
    console.log('  - EU ETS and FuelEU compliance data');
    console.log('  - Verifiers and verification records');
    console.log('  - Compliance alerts');
    console.log('  - Pooling arrangements and RFQs');
    console.log('  - EUA trades and market data');
    
  } catch (error) {
    console.error('Error loading seed data:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

loadSeedData();


