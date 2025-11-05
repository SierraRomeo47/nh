# Voyage Legs Database Schema and API Structure

## Overview
This document defines the database schema and API structure for voyage legs, ensuring proper linking between voyages, ships, and regulatory compliance data.

## Database Schema

### Core Tables

#### 1. voyages
Primary voyage information table.

```sql
CREATE TABLE voyages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    voyage_id VARCHAR(100) UNIQUE NOT NULL,
    ship_id UUID REFERENCES ships(id) ON DELETE CASCADE,
    voyage_type VARCHAR(50) DEFAULT 'COMMERCIAL',
    start_date DATE NOT NULL,
    end_date DATE,
    start_port VARCHAR(100),
    end_port VARCHAR(100),
    charter_type VARCHAR(50),
    charterer_org_id UUID REFERENCES organizations(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'ACTIVE'
);

CREATE INDEX idx_voyages_ship_id ON voyages(ship_id);
CREATE INDEX idx_voyages_status ON voyages(status);
CREATE INDEX idx_voyages_start_date ON voyages(start_date);
```

#### 2. voyage_legs
Detailed leg-by-leg information for multi-port voyages.

```sql
CREATE TABLE voyage_legs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    voyage_id UUID REFERENCES voyages(id) ON DELETE CASCADE NOT NULL,
    leg_number INTEGER NOT NULL,
    departure_port VARCHAR(100) NOT NULL,
    arrival_port VARCHAR(100) NOT NULL,
    departure_date TIMESTAMP WITH TIME ZONE,
    arrival_date TIMESTAMP WITH TIME ZONE,
    distance_nm DECIMAL(10,2),
    cargo_type VARCHAR(100),
    cargo_quantity DECIMAL(15,3),
    sea_state VARCHAR(50), -- Calm, Moderate, Rough
    weather_conditions VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_voyage_leg_number UNIQUE (voyage_id, leg_number),
    CONSTRAINT check_leg_number_positive CHECK (leg_number > 0)
);

CREATE INDEX idx_voyage_legs_voyage_id ON voyage_legs(voyage_id);
CREATE INDEX idx_voyage_legs_ports ON voyage_legs(departure_port, arrival_port);
```

### Enhanced Schema with Compliance Links

#### 3. voyage_compliance_data
Links voyages to compliance calculations (EU ETS, FuelEU, IMO DCS).

```sql
CREATE TABLE voyage_compliance_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    voyage_id UUID REFERENCES voyages(id) ON DELETE CASCADE NOT NULL UNIQUE,
    
    -- EU ETS Data
    eu_ets_covered_share_pct DECIMAL(5,2) DEFAULT 0,
    eu_ets_eua_exposure_tco2 DECIMAL(12,2) DEFAULT 0,
    eu_ets_reported_year INTEGER,
    eu_ets_surrender_deadline_iso TIMESTAMP WITH TIME ZONE,
    eu_ets_verification_status VARCHAR(50), -- PENDING, VERIFIED, REJECTED
    
    -- FuelEU Maritime Data
    fueleu_energy_in_scope_gj DECIMAL(15,3) DEFAULT 0,
    fueleu_ghg_intensity_gco2e_per_mj DECIMAL(10,4) DEFAULT 0,
    fueleu_compliance_balance_gco2e DECIMAL(15,2) DEFAULT 0,
    fueleu_banked_gco2e DECIMAL(15,2) DEFAULT 0,
    fueleu_borrowed_gco2e DECIMAL(15,2) DEFAULT 0,
    fueleu_pooling_status VARCHAR(50) DEFAULT 'NONE', -- NONE, SURPLUS_AVAILABLE, DEFICIT_NEEDS_POOLING, IN_POOL
    
    -- IMO DCS Data
    imo_dcs_transport_work_tnm DECIMAL(15,2) DEFAULT 0,
    imo_dcs_submission_status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, SUBMITTED, VERIFIED
    imo_dcs_submission_deadline DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_compliance_voyage_id ON voyage_compliance_data(voyage_id);
CREATE INDEX idx_compliance_eu_ets_year ON voyage_compliance_data(eu_ets_reported_year);
```

#### 4. leg_fuel_consumption
Fuel consumption per leg (links to voyage_legs for detailed tracking).

```sql
CREATE TABLE leg_fuel_consumption (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    leg_id UUID REFERENCES voyage_legs(id) ON DELETE CASCADE NOT NULL,
    voyage_id UUID REFERENCES voyages(id) ON DELETE CASCADE NOT NULL,
    fuel_type VARCHAR(50) NOT NULL, -- HFO, MGO, LNG, etc.
    consumption_tonnes DECIMAL(15,3) NOT NULL,
    consumption_date DATE NOT NULL,
    co2_emitted_t DECIMAL(12,2),
    energy_gj DECIMAL(15,3),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_leg_fuel_leg_id ON leg_fuel_consumption(leg_id);
CREATE INDEX idx_leg_fuel_voyage_id ON leg_fuel_consumption(voyage_id);
CREATE INDEX idx_leg_fuel_date ON leg_fuel_consumption(consumption_date);
```

## API Endpoint Structure

### 1. Get Voyage with Legs
```
GET /voyages/api/voyages/:voyage_id
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "voyage_id": "V-1234567-001",
    "ship_id": "uuid",
    "ship_name": "Aurora Spirit",
    "imo_number": "9391001",
    "voyage_type": "COMMERCIAL",
    "start_date": "2024-01-15",
    "end_date": "2024-02-20",
    "start_port": "Rotterdam",
    "end_port": "Singapore",
    "status": "COMPLETED",
    "legs": [
      {
        "id": "uuid",
        "leg_number": 1,
        "departure_port": "Rotterdam",
        "arrival_port": "Suez Canal",
        "departure_date": "2024-01-15T08:00:00Z",
        "arrival_date": "2024-01-25T14:00:00Z",
        "distance_nm": 3200,
        "cargo_type": "Container",
        "cargo_quantity": 12000
      },
      {
        "id": "uuid",
        "leg_number": 2,
        "departure_port": "Suez Canal",
        "arrival_port": "Singapore",
        "departure_date": "2024-01-26T06:00:00Z",
        "arrival_date": "2024-02-15T10:00:00Z",
        "distance_nm": 5400,
        "cargo_type": "Container",
        "cargo_quantity": 12000
      }
    ],
    "compliance": {
      "eu_ets": {
        "covered_share_pct": 50,
        "eua_exposure_tco2": 234.5,
        "reported_year": 2024,
        "surrender_deadline_iso": "2025-04-30T23:59:59Z"
      },
      "fueleu": {
        "energy_in_scope_gj": 45000,
        "ghg_intensity_gco2e_per_mj": 89.5,
        "compliance_balance_gco2e": 1250000
      },
      "imo_dcs": {
        "transport_work_tnm": 688000000,
        "submission_status": "SUBMITTED"
      }
    }
  }
}
```

### 2. Get All Voyages with Legs
```
GET /voyages/api/voyages?include_legs=true&ship_id=uuid
```

**Query Parameters:**
- `include_legs` (boolean): Include voyage legs in response
- `ship_id` (UUID): Filter by ship
- `status` (string): Filter by status (ACTIVE, COMPLETED, CANCELLED)
- `start_date` (date): Filter voyages starting after this date
- `end_date` (date): Filter voyages ending before this date

### 3. Create Voyage with Legs
```
POST /voyages/api/voyages
```

**Request Body:**
```json
{
  "voyage_id": "V-9391001-20240115",
  "ship_id": "uuid",
  "voyage_type": "COMMERCIAL",
  "start_date": "2024-01-15",
  "end_date": "2024-02-20",
  "start_port": "Rotterdam",
  "end_port": "Singapore",
  "charter_type": "SPOT_VOYAGE",
  "status": "ACTIVE",
  "legs": [
    {
      "leg_number": 1,
      "departure_port": "Rotterdam",
      "arrival_port": "Suez Canal",
      "departure_date": "2024-01-15T08:00:00Z",
      "arrival_date": "2024-01-25T14:00:00Z",
      "distance_nm": 3200,
      "cargo_type": "Container",
      "cargo_quantity": 12000
    },
    {
      "leg_number": 2,
      "departure_port": "Suez Canal",
      "arrival_port": "Singapore",
      "departure_date": "2024-01-26T06:00:00Z",
      "arrival_date": "2024-02-15T10:00:00Z",
      "distance_nm": 5400,
      "cargo_type": "Container",
      "cargo_quantity": 12000
    }
  ]
}
```

### 4. Update Voyage Legs
```
PUT /voyages/api/voyages/:voyage_id/legs
```

### 5. Add Leg to Voyage
```
POST /voyages/api/voyages/:voyage_id/legs
```

### 6. Get Leg Fuel Consumption
```
GET /voyages/api/voyages/:voyage_id/legs/:leg_id/fuel
```

## Data Validation Rules

1. **Leg Numbering**: Must be sequential starting from 1, no gaps
2. **Port Continuity**: Arrival port of leg N must match departure port of leg N+1 (if exists)
3. **Date Validation**: 
   - Leg departure_date >= voyage start_date
   - Leg arrival_date <= voyage end_date
   - Leg arrival_date > leg departure_date
4. **Distance**: If not provided, calculate from port coordinates or use route database
5. **EU ETS Coverage**: Calculate based on EU port list and leg distances

## Common Voyage Routes by Ship Type

For generating synthetic/example voyages, use these typical routes:

### Container Ships
- Rotterdam → Hamburg → Felixstowe → New York
- Singapore → Hong Kong → Shanghai → Busan
- Los Angeles → Panama Canal → Savannah → Rotterdam

### Bulk Carriers
- Port Hedland (Australia) → Qingdao (China)
- Tubarao (Brazil) → Rotterdam → Hamburg
- Newcastle (Australia) → Tokyo → Yokohama

### LNG Carriers
- Ras Laffan (Qatar) → Sabetta (Russia) → Rotterdam
- Sabine Pass (USA) → Zeebrugge (Belgium)
- Darwin (Australia) → Tokyo Bay

### Tankers
- Jebel Ali (UAE) → Rotterdam → Hamburg
- Rotterdam → New York → Houston
- Singapore → Yokohama → Busan

### Car Carriers
- Bremerhaven → Baltimore → New York → Veracruz
- Yokohama → Long Beach → Vancouver

## Sample SQL Queries

### Get voyage with all legs and compliance data
```sql
SELECT 
    v.*,
    json_agg(
        json_build_object(
            'leg_number', vl.leg_number,
            'departure_port', vl.departure_port,
            'arrival_port', vl.arrival_port,
            'distance_nm', vl.distance_nm,
            'cargo_type', vl.cargo_type
        ) ORDER BY vl.leg_number
    ) as legs,
    vcd.*
FROM voyages v
LEFT JOIN voyage_legs vl ON vl.voyage_id = v.id
LEFT JOIN voyage_compliance_data vcd ON vcd.voyage_id = v.id
WHERE v.id = $1
GROUP BY v.id, vcd.id;
```

### Calculate EU ETS coverage from legs
```sql
WITH eu_ports AS (
    SELECT unnest(ARRAY['Rotterdam', 'Hamburg', 'Antwerp', ...]) as port
),
leg_coverage AS (
    SELECT 
        vl.voyage_id,
        vl.leg_number,
        CASE 
            WHEN vl.departure_port IN (SELECT port FROM eu_ports) 
                 AND vl.arrival_port IN (SELECT port FROM eu_ports) 
            THEN 1.0 -- 100% intra-EU
            WHEN vl.departure_port IN (SELECT port FROM eu_ports) 
                 OR vl.arrival_port IN (SELECT port FROM eu_ports)
            THEN 0.5 -- 50% extra-EU touching EU
            ELSE 0.0 -- 0% non-EU
        END as coverage_factor,
        vl.distance_nm
    FROM voyage_legs vl
)
SELECT 
    voyage_id,
    ROUND(
        (SUM(distance_nm * coverage_factor) / NULLIF(SUM(distance_nm), 0)) * 100, 
        2
    ) as eu_ets_covered_share_pct
FROM leg_coverage
GROUP BY voyage_id;
```

## Migration Script

```sql
-- Ensure all existing voyages have at least one leg from start_port to end_port
INSERT INTO voyage_legs (voyage_id, leg_number, departure_port, arrival_port, distance_nm)
SELECT 
    v.id,
    1,
    v.start_port,
    v.end_port,
    CASE 
        WHEN v.start_port IS NOT NULL AND v.end_port IS NOT NULL THEN 3000 -- default estimate
        ELSE NULL
    END
FROM voyages v
WHERE NOT EXISTS (
    SELECT 1 FROM voyage_legs vl WHERE vl.voyage_id = v.id
)
AND v.start_port IS NOT NULL 
AND v.end_port IS NOT NULL;
```

