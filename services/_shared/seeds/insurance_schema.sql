-- Insurance Quotes Schema
-- Stores maritime insurance quote requests and generated quotes

-- Insurance Quotes Table
CREATE TABLE IF NOT EXISTS insurance_quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_id VARCHAR(50) UNIQUE NOT NULL,
    
    -- Request Information
    request_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Vessel Information
    vessel_id UUID REFERENCES ships(id) ON DELETE SET NULL,
    vessel_name VARCHAR(255) NOT NULL,
    vessel_type VARCHAR(50) NOT NULL,
    vessel_age INTEGER NOT NULL,
    gross_tonnage INTEGER NOT NULL,
    
    -- Route Information
    route_origin VARCHAR(255) NOT NULL,
    route_destination VARCHAR(255) NOT NULL,
    route_risk_zone VARCHAR(50) NOT NULL,
    voyage_duration INTEGER NOT NULL, -- days
    
    -- Cargo Information
    cargo_type VARCHAR(50),
    cargo_value DECIMAL(15,2),
    
    -- Risk Assessment
    safety_rating VARCHAR(20) NOT NULL,
    compliance_score INTEGER NOT NULL, -- 0-100
    previous_claims INTEGER NOT NULL DEFAULT 0,
    deductible DECIMAL(15,2) NOT NULL,
    
    -- Financial Information
    total_premium DECIMAL(15,2) NOT NULL,
    coverage_types TEXT[] NOT NULL, -- Array of coverage types
    
    -- Risk Assessment Details (JSON)
    risk_assessment JSONB NOT NULL, -- Stores risk factors, scores, overall risk level
    
    -- Coverage Breakdown (JSON)
    coverage_breakdown JSONB NOT NULL, -- Array of coverage details with premiums
    
    -- Terms and Conditions
    terms_and_conditions TEXT[],
    
    -- Quote Status
    status VARCHAR(20) NOT NULL DEFAULT 'QUOTED', -- DRAFT, QUOTED, ACCEPTED, DECLINED, EXPIRED
    underwriter VARCHAR(255) NOT NULL DEFAULT 'Nautilus Marine Insurance Ltd.',
    policy_number VARCHAR(50), -- Set when accepted
    
    -- Audit Fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Indexes
    CONSTRAINT check_compliance_score CHECK (compliance_score >= 0 AND compliance_score <= 100),
    CONSTRAINT check_previous_claims CHECK (previous_claims >= 0),
    CONSTRAINT check_status CHECK (status IN ('DRAFT', 'QUOTED', 'ACCEPTED', 'DECLINED', 'EXPIRED'))
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_insurance_quotes_vessel_id ON insurance_quotes(vessel_id);
CREATE INDEX IF NOT EXISTS idx_insurance_quotes_status ON insurance_quotes(status);
CREATE INDEX IF NOT EXISTS idx_insurance_quotes_request_date ON insurance_quotes(request_date);
CREATE INDEX IF NOT EXISTS idx_insurance_quotes_quote_id ON insurance_quotes(quote_id);

-- Insurance Policies Table (for accepted quotes)
CREATE TABLE IF NOT EXISTS insurance_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_number VARCHAR(50) UNIQUE NOT NULL,
    quote_id UUID REFERENCES insurance_quotes(id) ON DELETE CASCADE,
    
    -- Policy Dates
    issue_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    effective_date TIMESTAMP WITH TIME ZONE NOT NULL,
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Policy Status
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, CANCELLED, EXPIRED, SUSPENDED
    cancellation_date TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    
    -- Payment Information
    premium_paid DECIMAL(15,2),
    payment_date TIMESTAMP WITH TIME ZONE,
    payment_method VARCHAR(50),
    payment_reference VARCHAR(100),
    
    -- Audit Fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT check_policy_status CHECK (status IN ('ACTIVE', 'CANCELLED', 'EXPIRED', 'SUSPENDED'))
);

CREATE INDEX IF NOT EXISTS idx_insurance_policies_policy_number ON insurance_policies(policy_number);
CREATE INDEX IF NOT EXISTS idx_insurance_policies_status ON insurance_policies(status);
CREATE INDEX IF NOT EXISTS idx_insurance_policies_quote_id ON insurance_policies(quote_id);

-- Insurance Claims Table
CREATE TABLE IF NOT EXISTS insurance_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_number VARCHAR(50) UNIQUE NOT NULL,
    policy_id UUID REFERENCES insurance_policies(id) ON DELETE CASCADE,
    
    -- Claim Information
    claim_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    incident_date TIMESTAMP WITH TIME ZONE NOT NULL,
    incident_location VARCHAR(255),
    incident_description TEXT NOT NULL,
    
    -- Claim Details
    claim_type VARCHAR(50) NOT NULL, -- Corresponds to coverage types
    estimated_loss DECIMAL(15,2),
    claimed_amount DECIMAL(15,2) NOT NULL,
    approved_amount DECIMAL(15,2),
    
    -- Claim Status
    status VARCHAR(20) NOT NULL DEFAULT 'SUBMITTED', -- SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, PAID
    status_notes TEXT,
    
    -- Payment Information
    payment_date TIMESTAMP WITH TIME ZONE,
    payment_reference VARCHAR(100),
    
    -- Audit Fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    CONSTRAINT check_claim_status CHECK (status IN ('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'PAID'))
);

CREATE INDEX IF NOT EXISTS idx_insurance_claims_policy_id ON insurance_claims(policy_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_status ON insurance_claims(status);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_claim_number ON insurance_claims(claim_number);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_insurance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_insurance_quotes_timestamp
    BEFORE UPDATE ON insurance_quotes
    FOR EACH ROW
    EXECUTE FUNCTION update_insurance_updated_at();

CREATE TRIGGER update_insurance_policies_timestamp
    BEFORE UPDATE ON insurance_policies
    FOR EACH ROW
    EXECUTE FUNCTION update_insurance_updated_at();

CREATE TRIGGER update_insurance_claims_timestamp
    BEFORE UPDATE ON insurance_claims
    FOR EACH ROW
    EXECUTE FUNCTION update_insurance_updated_at();

-- Comments for documentation
COMMENT ON TABLE insurance_quotes IS 'Stores maritime insurance quote requests and generated quotes';
COMMENT ON TABLE insurance_policies IS 'Stores insurance policies issued from accepted quotes';
COMMENT ON TABLE insurance_claims IS 'Stores insurance claims filed against policies';
COMMENT ON COLUMN insurance_quotes.risk_assessment IS 'JSON object containing overall risk level, risk factors array, total score, and recommendation';
COMMENT ON COLUMN insurance_quotes.coverage_breakdown IS 'JSON array containing coverage type, premium, limit, and description for each coverage';

