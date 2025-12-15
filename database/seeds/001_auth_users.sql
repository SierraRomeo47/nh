-- Auth Service Users Table and Seed Data
-- This matches what the auth service expects

-- Create users table (lowercase)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) NOT NULL,
  organization_id UUID,
  ship_id VARCHAR(50),
  position VARCHAR(100),
  rank VARCHAR(100),
  theme VARCHAR(20) DEFAULT 'dark',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE
);

-- Seed demo users
-- Password for all users: "password"
-- Using bcrypt hash with cost factor 10: $2a$10$N9qo8uLOickgx2ZMRZoMye.K8XJvFPPcLFQ1fDsJmZHjVsYKWZKfe

INSERT INTO users (id, email, password_hash, first_name, last_name, role, organization_id, position, is_active)
VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'sumit.redu@poseidon.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.K8XJvFPPcLFQ1fDsJmZHjVsYKWZKfe', 'Sumit', 'Redu', 'ADMIN', '550e8400-e29b-41d4-a716-446655440010', 'Product Manager', TRUE),
  ('550e8400-e29b-41d4-a716-446655440002', 'manager@nordicmaritime.no', '$2a$10$N9qo8uLOickgx2ZMRZoMye.K8XJvFPPcLFQ1fDsJmZHjVsYKWZKfe', 'Fleet', 'Manager', 'MANAGER', '550e8400-e29b-41d4-a716-446655440010', 'Fleet Manager', TRUE),
  ('550e8400-e29b-41d4-a716-446655440003', 'compliance@nordicmaritime.no', '$2a$10$N9qo8uLOickgx2ZMRZoMye.K8XJvFPPcLFQ1fDsJmZHjVsYKWZKfe', 'Compliance', 'Officer', 'COMPLIANCE_OFFICER', '550e8400-e29b-41d4-a716-446655440010', 'Compliance Manager', TRUE),
  ('550e8400-e29b-41d4-a716-446655440004', 'trader@nordicmaritime.no', '$2a$10$N9qo8uLOickgx2ZMRZoMye.K8XJvFPPcLFQ1fDsJmZHjVsYKWZKfe', 'Carbon', 'Trader', 'TRADER', '550e8400-e29b-41d4-a716-446655440010', 'Carbon Trader', TRUE),
  ('550e8400-e29b-41d4-a716-446655440005', 'officer1@aurora.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.K8XJvFPPcLFQ1fDsJmZHjVsYKWZKfe', 'Captain', 'Anderson', 'CAPTAIN', '550e8400-e29b-41d4-a716-446655440010', 'Ship Captain', TRUE),
  ('550e8400-e29b-41d4-a716-446655440006', 'engineer1@aurora.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.K8XJvFPPcLFQ1fDsJmZHjVsYKWZKfe', 'Chief', 'Engineer', 'CHIEF_ENGINEER', '550e8400-e29b-41d4-a716-446655440010', 'Chief Engineer', TRUE),
  ('550e8400-e29b-41d4-a716-446655440007', 'insurer@poseidon.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.K8XJvFPPcLFQ1fDsJmZHjVsYKWZKfe', 'Insurance', 'Specialist', 'INSURER', '550e8400-e29b-41d4-a716-446655440011', 'Insurance Underwriter', TRUE),
  ('550e8400-e29b-41d4-a716-446655440008', 'mto@poseidon.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.K8XJvFPPcLFQ1fDsJmZHjVsYKWZKfe', 'Transport', 'Coordinator', 'MTO', '550e8400-e29b-41d4-a716-446655440010', 'Multimodal Transport Operator', TRUE),
  ('550e8400-e29b-41d4-a716-446655440009', 'fleetsup@nordicmaritime.no', '$2a$10$N9qo8uLOickgx2ZMRZoMye.K8XJvFPPcLFQ1fDsJmZHjVsYKWZKfe', 'Fleet', 'Superintendent', 'FLEET_SUPERINTENDENT', '550e8400-e29b-41d4-a716-446655440010', 'Fleet Superintendent', TRUE),
  ('550e8400-e29b-41d4-a716-446655440010', 'opssup@nordicmaritime.no', '$2a$10$N9qo8uLOickgx2ZMRZoMye.K8XJvFPPcLFQ1fDsJmZHjVsYKWZKfe', 'Operations', 'Superintendent', 'OPERATIONS_SUPERINTENDENT', '550e8400-e29b-41d4-a716-446655440010', 'Operations Superintendent', TRUE)
ON CONFLICT (email) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_organization ON users(organization_id);

