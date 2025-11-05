-- Trading Service Seed Data
-- Industry-standard market data, RFQs, offers, and trading opportunities

-- ============================================================================
-- MARKET DATA - EUA Prices (European Union Allowances)
-- ============================================================================
-- Realistic EUA price fluctuations over 30 days (~€65-75/tCO2)

INSERT INTO market_data (id, data_type, price, currency, timestamp, source, metadata)
SELECT 
  gen_random_uuid(),
  'EUA',
  -- Base price €70 with realistic daily fluctuations
  70.0 + (RANDOM() * 10 - 5),
  'EUR',
  NOW() - ((30 - gs.day) * INTERVAL '1 day') + (RANDOM() * INTERVAL '23 hours'),
  CASE (gs.day % 3)
    WHEN 0 THEN 'ICE_FUTURES'
    WHEN 1 THEN 'EEX_SPOT'
    ELSE 'PLATTS_ASSESSMENT'
  END,
  jsonb_build_object(
    'contract', 'DEC25',
    'volume_traded', (RANDOM() * 500000 + 100000)::int,
    'bid', 70.0 + (RANDOM() * 10 - 5) - 0.15,
    'ask', 70.0 + (RANDOM() * 10 - 5) + 0.15
  )
FROM generate_series(1, 30) AS gs(day);

-- Add current real-time price
INSERT INTO market_data (id, data_type, price, currency, source, metadata)
VALUES (
  gen_random_uuid(),
  'EUA',
  74.25,
  'EUR',
  'ICE_FUTURES',
  jsonb_build_object(
    'contract', 'DEC25',
    'volume_traded', 285000,
    'bid', 74.10,
    'ask', 74.40,
    'change', -1.75,
    'change_percent', -2.3
  )
);

-- ============================================================================
-- MARKET DATA - Fuel Prices (per tonne)
-- ============================================================================

INSERT INTO market_data (id, data_type, price, currency, timestamp, source, metadata)
VALUES
  -- VLSFO (Very Low Sulphur Fuel Oil) - Main marine fuel
  (gen_random_uuid(), 'FUEL_VLSFO', 650.00, 'EUR', NOW(), 'PLATTS_SINGAPORE', 
   jsonb_build_object('port', 'Singapore', 'grade', '0.5%S')),
  
  -- MGO (Marine Gas Oil) - Low sulphur distillate
  (gen_random_uuid(), 'FUEL_MGO', 820.00, 'EUR', NOW(), 'PLATTS_ROTTERDAM',
   jsonb_build_object('port', 'Rotterdam', 'grade', '0.1%S')),
  
  -- LNG (Liquefied Natural Gas)
  (gen_random_uuid(), 'FUEL_LNG', 580.00, 'EUR', NOW(), 'JKM_INDEX',
   jsonb_build_object('delivery', 'NW_EUROPE', 'unit', 'per_tonne')),
  
  -- Biofuel MGO (B30 blend)
  (gen_random_uuid(), 'FUEL_BIO_MGO', 1150.00, 'EUR', NOW(), 'GoodFuels',
   jsonb_build_object('blend', 'B30', 'certification', 'ISCC_EU')),
  
  -- E-Methanol
  (gen_random_uuid(), 'FUEL_E_METHANOL', 1450.00, 'EUR', NOW(), 'Maersk_Fuels',
   jsonb_build_object('source', 'renewable_electricity', 'carbon_capture', true));

-- ============================================================================
-- POOL RFQs - FuelEU Maritime Compliance Trading
-- ============================================================================

WITH org_list AS (
  SELECT id, name, ROW_NUMBER() OVER () as rn
  FROM organizations
  WHERE imo_company_number IS NOT NULL
  LIMIT 8
)
INSERT INTO pool_rfqs (
  id, organization_id, reporting_year, need_gco2e, 
  price_range_min, price_range_max, notes, status, created_at
)
SELECT 
  gen_random_uuid(),
  ol.id,
  2025,
  -- Mix of deficits (positive) and surplus (negative)
  CASE ol.rn % 5
    WHEN 0 THEN 5200000   -- 5.2M tonnes deficit
    WHEN 1 THEN -8500000  -- 8.5M tonnes surplus
    WHEN 2 THEN 3100000   -- 3.1M tonnes deficit
    WHEN 3 THEN -2400000  -- 2.4M tonnes surplus
    ELSE 1800000          -- 1.8M tonnes deficit
  END,
  -- Price range in €/gCO2e (typically €0.035-0.055)
  0.038,
  0.052,
  CASE ol.rn % 5
    WHEN 0 THEN 'Seeking compliance units for Aurora Spirit fleet - high priority due to Q4 2025 deadline'
    WHEN 1 THEN 'Surplus available from extensive biofuel adoption on EU routes - willing to offer competitive pricing'
    WHEN 2 THEN 'Need units to offset Singapore-Rotterdam route emissions - flexible on terms'
    WHEN 3 THEN 'Excess credits from wind-assisted propulsion retrofit - looking for long-term partners'
    ELSE 'Short-term requirement for 2025 compliance balance - immediate settlement preferred'
  END,
  CASE ol.rn % 3
    WHEN 0 THEN 'OPEN'
    WHEN 1 THEN 'FILLED'
    ELSE 'OPEN'
  END,
  NOW() - ((ol.rn % 15) * INTERVAL '1 day')
FROM org_list ol;

-- ============================================================================
-- POOL OFFERS - Responses to RFQs
-- ============================================================================

WITH rfq_list AS (
  SELECT id, need_gco2e, ROW_NUMBER() OVER () as rn
  FROM pool_rfqs
  WHERE status = 'OPEN' AND need_gco2e > 0  -- Only deficits get offers
  LIMIT 5
),
org_list AS (
  SELECT id, name, ROW_NUMBER() OVER () as org_rn
  FROM organizations
  WHERE imo_company_number IS NOT NULL
  LIMIT 3
)
INSERT INTO pool_offers (
  id, rfq_id, counterparty_org_id, offered_gco2e,
  price_eur_per_gco2e, valid_until, status, created_at
)
SELECT 
  gen_random_uuid(),
  rl.id,
  ol.id,
  -- Offer full or partial amount
  CASE (rl.rn + ol.org_rn) % 3
    WHEN 0 THEN rl.need_gco2e                    -- Full amount
    WHEN 1 THEN rl.need_gco2e * 0.6              -- 60%
    ELSE rl.need_gco2e * 0.4                      -- 40%
  END,
  -- Competitive pricing around €0.042-0.048
  0.042 + (RANDOM() * 0.006),
  NOW() + ((15 + (rl.rn * 10)) * INTERVAL '1 day'),
  CASE (rl.rn + ol.org_rn) % 4
    WHEN 0 THEN 'PENDING'
    WHEN 1 THEN 'ACCEPTED'
    WHEN 2 THEN 'PENDING'
    ELSE 'DECLINED'
  END,
  NOW() - ((rl.rn % 7) * INTERVAL '1 day')
FROM rfq_list rl
CROSS JOIN org_list ol
LIMIT 12;

-- ============================================================================
-- TRADING OPPORTUNITIES
-- ============================================================================

INSERT INTO trading_opportunities (
  id, source, opportunity_type, description, quantity,
  price_range_min, price_range_max, expiry_date, status, created_at
)
VALUES
  -- EUA Purchase Opportunities
  (gen_random_uuid(), 'ICE_FUTURES', 'EUA_PURCHASE',
   'December 2025 EUA futures contract - favorable pricing below market average',
   1500.0, 72.50, 73.00,
   NOW() + INTERVAL '15 days', 'OPEN', NOW() - INTERVAL '2 days'),
   
  (gen_random_uuid(), 'OTC_MARKET', 'EUA_PURCHASE',
   'Large block trade opportunity - 5000 tCO2 EUAs at discounted rate',
   5000.0, 68.00, 69.50,
   NOW() + INTERVAL '7 days', 'OPEN', NOW() - INTERVAL '1 day'),
   
  -- FuelEU Pooling Opportunities
  (gen_random_uuid(), 'INTERNAL_RFQ', 'FUELEU_POOL',
   'Nordic Shipping Group seeking 3.2M gCO2e deficit coverage - multi-year arrangement possible',
   3200000.0, 0.040, 0.048,
   NOW() + INTERVAL '30 days', 'OPEN', NOW() - INTERVAL '5 days'),
   
  (gen_random_uuid(), 'EXTERNAL_MARKET', 'FUELEU_POOL',
   'Baltic compliance cooperative offering surplus credits - verified by DNV',
   6500000.0, 0.043, 0.047,
   NOW() + INTERVAL '20 days', 'INTERESTED', NOW() - INTERVAL '3 days'),
   
  -- Additional opportunities
  (gen_random_uuid(), 'ICE_OPTIONS', 'EUA_OPTIONS',
   'Call options on March 2026 EUA futures - hedge against price volatility',
   2000.0, 3.50, 4.20,
   NOW() + INTERVAL '45 days', 'OPEN', NOW() - INTERVAL '1 day');

-- ============================================================================
-- EUA TRADES - Historical Trading Activity
-- ============================================================================

WITH org_list AS (
  SELECT id, ROW_NUMBER() OVER () as rn
  FROM organizations
  WHERE imo_company_number IS NOT NULL
  LIMIT 5
)
INSERT INTO eua_trades (
  id, organization_id, trade_type, quantity_tco2,
  price_eur_per_tco2, trade_date, counterparty, external_ref, market, created_at
)
SELECT 
  gen_random_uuid(),
  ol.id,
  CASE (ol.rn % 3)
    WHEN 0 THEN 'BUY'
    WHEN 1 THEN 'SELL'
    ELSE 'BUY'
  END,
  -- Trade sizes: 500-3000 tCO2
  (500 + RANDOM() * 2500)::numeric(15,3),
  -- Prices around €68-76/tCO2
  (68.0 + RANDOM() * 8.0)::numeric(10,2),
  CURRENT_DATE - ((ol.rn * 7 + gs.trade_num * 3) * INTERVAL '1 day'),
  CASE (gs.trade_num % 4)
    WHEN 0 THEN 'ICE Futures Europe'
    WHEN 1 THEN 'EEX Spot Market'
    WHEN 2 THEN 'Shell Energy Europe'
    ELSE 'BP Trading'
  END,
  'TRD-2025-' || LPAD((ol.rn * 10 + gs.trade_num)::text, 5, '0'),
  CASE (gs.trade_num % 3)
    WHEN 0 THEN 'SPOT'
    WHEN 1 THEN 'FUTURES'
    ELSE 'OPTIONS'
  END,
  NOW() - ((ol.rn * 7 + gs.trade_num * 3) * INTERVAL '1 day')
FROM org_list ol
CROSS JOIN generate_series(1, 6) AS gs(trade_num);

-- ============================================================================
-- TRADING PORTFOLIO - Active Positions
-- ============================================================================

WITH org_list AS (
  SELECT id, ROW_NUMBER() OVER () as rn
  FROM organizations
  WHERE imo_company_number IS NOT NULL
  LIMIT 6
)
INSERT INTO trading_portfolio (
  id, organization_id, position_type, quantity,
  entry_price, current_price, unrealized_pnl,
  entry_date, maturity_date, status, created_at
)
SELECT 
  gen_random_uuid(),
  ol.id,
  CASE (ol.rn % 4)
    WHEN 0 THEN 'EUA_SPOT'
    WHEN 1 THEN 'EUA_FORWARD'
    WHEN 2 THEN 'EUA_FUTURES'
    ELSE 'FUELEU_POOL'
  END,
  -- Position sizes
  (1000 + RANDOM() * 3000)::numeric(15,3),
  -- Entry prices
  (69.0 + RANDOM() * 5.0)::numeric(10,2),
  -- Current price (EUA)
  74.25,
  -- Calculate unrealized P&L
  ((74.25 - (69.0 + RANDOM() * 5.0)) * (1000 + RANDOM() * 3000))::numeric(15,2),
  CURRENT_DATE - ((ol.rn * 20) * INTERVAL '1 day'),
  CASE (ol.rn % 4)
    WHEN 1 THEN CURRENT_DATE + INTERVAL '6 months'  -- Forwards have maturity
    WHEN 2 THEN CURRENT_DATE + INTERVAL '3 months'  -- Futures have maturity
    ELSE NULL
  END,
  CASE (ol.rn % 5)
    WHEN 0 THEN 'ACTIVE'
    WHEN 1 THEN 'MATURED'
    ELSE 'ACTIVE'
  END,
  NOW() - ((ol.rn * 20) * INTERVAL '1 day')
FROM org_list ol
CROSS JOIN generate_series(1, 3) AS gs(pos_num);

-- ============================================================================
-- SUMMARY
-- ============================================================================

SELECT 
  'Market Data Points: ' || COUNT(*) as summary
FROM market_data
UNION ALL
SELECT 
  'Active RFQs: ' || COUNT(*)
FROM pool_rfqs WHERE status = 'OPEN'
UNION ALL
SELECT 
  'Total Offers: ' || COUNT(*)
FROM pool_offers
UNION ALL
SELECT 
  'Trading Opportunities: ' || COUNT(*)
FROM trading_opportunities WHERE status = 'OPEN'
UNION ALL
SELECT 
  'EUA Trades: ' || COUNT(*)
FROM eua_trades
UNION ALL
SELECT 
  'Active Portfolio Positions: ' || COUNT(*)
FROM trading_portfolio WHERE status = 'ACTIVE';

