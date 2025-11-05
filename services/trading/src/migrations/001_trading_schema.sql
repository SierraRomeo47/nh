-- Trading Schema
-- EUA Trading, Market Data, Portfolio Management

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- EUA Trading Records
CREATE TABLE eua_trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    trade_type VARCHAR(10) NOT NULL, -- BUY, SELL
    quantity_tco2 DECIMAL(15,3) NOT NULL,
    price_eur_per_tco2 DECIMAL(10,2) NOT NULL,
    trade_date DATE NOT NULL,
    counterparty VARCHAR(255),
    external_ref VARCHAR(100),
    market VARCHAR(50), -- SPOT, FUTURES, OPTIONS
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Market Data (Real-time prices)
CREATE TABLE market_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    data_type VARCHAR(50) NOT NULL, -- EUA, FUEL, FREIGHT
    price DECIMAL(15,6) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source VARCHAR(100),
    metadata JSONB
);

-- Trading Portfolio
CREATE TABLE trading_portfolio (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    position_type VARCHAR(50) NOT NULL, -- EUA_FORWARD, EUA_SPOT, FUELEU_POOL
    quantity DECIMAL(15,3) NOT NULL,
    entry_price DECIMAL(10,2),
    current_price DECIMAL(10,2),
    unrealized_pnl DECIMAL(15,2),
    entry_date DATE NOT NULL,
    maturity_date DATE,
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, MATURED, CLOSED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trading Opportunities
CREATE TABLE trading_opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source VARCHAR(100) NOT NULL, -- INTERNAL_RFQ, EXTERNAL_MARKET
    opportunity_type VARCHAR(50) NOT NULL, -- EUA_PURCHASE, FUELEU_POOL
    description TEXT,
    quantity DECIMAL(15,3),
    price_range_min DECIMAL(10,2),
    price_range_max DECIMAL(10,2),
    expiry_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'OPEN', -- OPEN, INTERESTED, DECLINED, EXPIRED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_eua_trades_org_date ON eua_trades(organization_id, trade_date);
CREATE INDEX idx_eua_trades_type ON eua_trades(trade_type);
CREATE INDEX idx_market_data_type_timestamp ON market_data(data_type, timestamp DESC);
CREATE INDEX idx_trading_portfolio_org ON trading_portfolio(organization_id);
CREATE INDEX idx_trading_opportunities_status ON trading_opportunities(status);


