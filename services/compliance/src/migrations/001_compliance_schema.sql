-- Compliance Schema
-- EU ETS, FuelEU Maritime, THETIS MRV, Verifiers

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Verifiers (Accredited verification bodies)
CREATE TABLE verifiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    accreditation_number VARCHAR(100) UNIQUE NOT NULL,
    accreditation_body VARCHAR(255) NOT NULL,
    accreditation_scope TEXT NOT NULL,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Verification Records (THETIS MRV workflow)
CREATE TABLE verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    verifier_id UUID REFERENCES verifiers(id),
    data_type VARCHAR(50) NOT NULL, -- FUEL_CONSUMPTION, EU_ETS, FUELEU
    reference_id UUID NOT NULL, -- References the specific data record
    verification_date DATE NOT NULL,
    verification_result VARCHAR(50) NOT NULL, -- VERIFIED, REJECTED, CONDITIONAL
    findings TEXT,
    recommendations TEXT,
    certificate_number VARCHAR(100),
    queries_open INTEGER DEFAULT 0,
    queries_closed INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, IN_PROGRESS, VERIFIED, REJECTED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verification Queries (THETIS MRV queries)
CREATE TABLE verification_queries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    verification_id UUID REFERENCES verifications(id) ON DELETE CASCADE,
    query_text TEXT NOT NULL,
    response_text TEXT,
    status VARCHAR(50) DEFAULT 'OPEN', -- OPEN, ANSWERED, CLOSED
    assigned_to UUID, -- User ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    answered_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE
);

-- Pooling Arrangements (FuelEU)
CREATE TABLE pooling_arrangements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pool_name VARCHAR(255) NOT NULL,
    pool_leader_org_id UUID REFERENCES organizations(id),
    reporting_year INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, CLOSED, SUSPENDED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    closed_at TIMESTAMP WITH TIME ZONE
);

-- Pool Participants
CREATE TABLE pool_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pool_id UUID REFERENCES pooling_arrangements(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    ship_id VARCHAR(7), -- IMO number
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(pool_id, organization_id, ship_id)
);

-- RFQ System (FuelEU Pooling)
CREATE TABLE pool_rfqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    reporting_year INTEGER NOT NULL,
    need_gco2e DECIMAL(20,3) NOT NULL, -- Positive for need, negative for surplus
    price_range_min DECIMAL(10,6),
    price_range_max DECIMAL(10,6),
    notes TEXT,
    status VARCHAR(50) DEFAULT 'OPEN', -- OPEN, CLOSED, FILLED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    closed_at TIMESTAMP WITH TIME ZONE
);

-- Pool Offers
CREATE TABLE pool_offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rfq_id UUID REFERENCES pool_rfqs(id) ON DELETE CASCADE,
    counterparty_org_id UUID REFERENCES organizations(id),
    offered_gco2e DECIMAL(20,3) NOT NULL,
    price_eur_per_gco2e DECIMAL(10,6) NOT NULL,
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, ACCEPTED, DECLINED, EXPIRED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Compliance Alerts
CREATE TABLE compliance_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    ship_id VARCHAR(7), -- IMO number
    alert_type VARCHAR(50) NOT NULL, -- DEADLINE_APPROACHING, NON_COMPLIANCE, VERIFICATION_OUTSTANDING
    severity VARCHAR(20) DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, CRITICAL
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    due_date DATE,
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, ACKNOWLEDGED, RESOLVED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Surrender Plans (Union Registry)
CREATE TABLE surrender_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    reporting_year INTEGER NOT NULL,
    total_allowances_required DECIMAL(15,3) NOT NULL,
    allowances_purchased DECIMAL(15,3) DEFAULT 0,
    allowances_hedged DECIMAL(15,3) DEFAULT 0,
    coverage_pct DECIMAL(5,2),
    strategy TEXT, -- Describes hedging strategy
    status VARCHAR(50) DEFAULT 'DRAFT', -- DRAFT, EXECUTING, COMPLETED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_verifications_verifier ON verifications(verifier_id);
CREATE INDEX idx_verifications_status ON verifications(status);
CREATE INDEX idx_verification_queries_verification ON verification_queries(verification_id);
CREATE INDEX idx_verification_queries_status ON verification_queries(status);
CREATE INDEX idx_pool_participants_pool ON pool_participants(pool_id);
CREATE INDEX idx_pool_rfqs_status ON pool_rfqs(status);
CREATE INDEX idx_compliance_alerts_org_status ON compliance_alerts(organization_id, status);
CREATE INDEX idx_compliance_alerts_type ON compliance_alerts(alert_type);


