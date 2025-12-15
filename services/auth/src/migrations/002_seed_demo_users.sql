-- Seed Demo Users
-- Password for all users: "password"
-- Bcrypt hash: $2b$10$rV5z8P5JqZ6jW9xY4kD8/.5x7tHj0eUqKLGkXyQ6Z5Y8nK0wY0oK2

-- Insert demo users
INSERT INTO "User" (id, email, "emailVerifiedAt", "createdAt", "updatedAt", "isLocked", "failedLoginCount")
VALUES
  ('user-admin-1', 'sumit.redu@poseidon.com', NOW(), NOW(), NOW(), FALSE, 0),
  ('user-manager-1', 'manager@nordicmaritime.no', NOW(), NOW(), NOW(), FALSE, 0),
  ('user-compliance-1', 'compliance@nordicmaritime.no', NOW(), NOW(), NOW(), FALSE, 0),
  ('user-trader-1', 'trader@nordicmaritime.no', NOW(), NOW(), NOW(), FALSE, 0),
  ('user-captain-1', 'officer1@aurora.com', NOW(), NOW(), NOW(), FALSE, 0),
  ('user-engineer-1', 'engineer1@aurora.com', NOW(), NOW(), NOW(), FALSE, 0),
  ('user-insurer-1', 'insurer@poseidon.com', NOW(), NOW(), NOW(), FALSE, 0),
  ('user-mto-1', 'mto@poseidon.com', NOW(), NOW(), NOW(), FALSE, 0),
  ('user-fleetsup-1', 'fleetsup@nordicmaritime.no', NOW(), NOW(), NOW(), FALSE, 0),
  ('user-opssup-1', 'opssup@nordicmaritime.no', NOW(), NOW(), NOW(), FALSE, 0)
ON CONFLICT (email) DO NOTHING;

-- Insert email credentials (password: "password")
-- Hash generated with bcrypt, cost factor 10
INSERT INTO "EmailCredential" ("userId", "passwordHash", "passwordVersion")
VALUES
  ('user-admin-1', '$2b$10$rV5z8P5JqZ6jW9xY4kD8/.5x7tHj0eUqKLGkXyQ6Z5Y8nK0wY0oK2', 1),
  ('user-manager-1', '$2b$10$rV5z8P5JqZ6jW9xY4kD8/.5x7tHj0eUqKLGkXyQ6Z5Y8nK0wY0oK2', 1),
  ('user-compliance-1', '$2b$10$rV5z8P5JqZ6jW9xY4kD8/.5x7tHj0eUqKLGkXyQ6Z5Y8nK0wY0oK2', 1),
  ('user-trader-1', '$2b$10$rV5z8P5JqZ6jW9xY4kD8/.5x7tHj0eUqKLGkXyQ6Z5Y8nK0wY0oK2', 1),
  ('user-captain-1', '$2b$10$rV5z8P5JqZ6jW9xY4kD8/.5x7tHj0eUqKLGkXyQ6Z5Y8nK0wY0oK2', 1),
  ('user-engineer-1', '$2b$10$rV5z8P5JqZ6jW9xY4kD8/.5x7tHj0eUqKLGkXyQ6Z5Y8nK0wY0oK2', 1),
  ('user-insurer-1', '$2b$10$rV5z8P5JqZ6jW9xY4kD8/.5x7tHj0eUqKLGkXyQ6Z5Y8nK0wY0oK2', 1),
  ('user-mto-1', '$2b$10$rV5z8P5JqZ6jW9xY4kD8/.5x7tHj0eUqKLGkXyQ6Z5Y8nK0wY0oK2', 1),
  ('user-fleetsup-1', '$2b$10$rV5z8P5JqZ6jW9xY4kD8/.5x7tHj0eUqKLGkXyQ6Z5Y8nK0wY0oK2', 1),
  ('user-opssup-1', '$2b$10$rV5z8P5JqZ6jW9xY4kD8/.5x7tHj0eUqKLGkXyQ6Z5Y8nK0wY0oK2', 1)
ON CONFLICT ("userId") DO NOTHING;

-- Insert roles
INSERT INTO "Role" (id, name)
VALUES
  ('role-admin', 'ADMIN'),
  ('role-manager', 'MANAGER'),
  ('role-compliance', 'COMPLIANCE_OFFICER'),
  ('role-trader', 'TRADER'),
  ('role-captain', 'CAPTAIN'),
  ('role-chief-engineer', 'CHIEF_ENGINEER'),
  ('role-insurer', 'INSURER'),
  ('role-mto', 'MTO'),
  ('role-fleet-sup', 'FLEET_SUPERINTENDENT'),
  ('role-ops-sup', 'OPERATIONS_SUPERINTENDENT')
ON CONFLICT (name) DO NOTHING;

-- Assign roles to users
INSERT INTO "UserRole" ("userId", "roleId")
VALUES
  ('user-admin-1', 'role-admin'),
  ('user-manager-1', 'role-manager'),
  ('user-compliance-1', 'role-compliance'),
  ('user-trader-1', 'role-trader'),
  ('user-captain-1', 'role-captain'),
  ('user-engineer-1', 'role-chief-engineer'),
  ('user-insurer-1', 'role-insurer'),
  ('user-mto-1', 'role-mto'),
  ('user-fleetsup-1', 'role-fleet-sup'),
  ('user-opssup-1', 'role-ops-sup')
ON CONFLICT ("userId", "roleId") DO NOTHING;

