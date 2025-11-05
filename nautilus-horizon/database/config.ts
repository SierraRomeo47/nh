// Database Configuration
// Supports PostgreSQL with connection pooling and SSL

import { Pool, PoolConfig } from 'pg';

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean | { rejectUnauthorized: boolean };
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

// Default configuration
const defaultConfig: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'nautilus_horizon',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
};

// Create connection pool
let pool: Pool | null = null;

export function createPool(config: Partial<DatabaseConfig> = {}): Pool {
  const finalConfig: PoolConfig = { ...defaultConfig, ...config };
  
  pool = new Pool(finalConfig);
  
  // Handle pool errors
  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
  });
  
  return pool;
}

export function getPool(): Pool {
  if (!pool) {
    throw new Error('Database pool not initialized. Call createPool() first.');
  }
  return pool;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

// Database connection test
export async function testConnection(): Promise<boolean> {
  try {
    const testPool = getPool();
    const client = await testPool.connect();
    await client.query('SELECT NOW()');
    client.release();
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

// Environment-specific configurations
export const configs = {
  development: {
    ...defaultConfig,
    ssl: false,
  },
  
  production: {
    ...defaultConfig,
    ssl: { rejectUnauthorized: false },
    max: 50,
  },
  
  test: {
    ...defaultConfig,
    database: 'nautilus_horizon_test',
    max: 5,
  }
};

// Get configuration based on environment
export function getConfig(): DatabaseConfig {
  const env = process.env.NODE_ENV || 'development';
  return configs[env as keyof typeof configs] || configs.development;
}
