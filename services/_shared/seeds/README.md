# Seed Data Documentation

## Overview
This directory contains synthetic maritime data for populating the Nautilus Horizon database with realistic test data.

## Dataset Summary

### Vessels (30 total across 10 types)

1. **Container Ships** (5 vessels)
   - Aurora Spirit, Baltic Express, Nordic Star, Mediterranean Bridge, Pacific Gateway
   - Routes: Rotterdam-Singapore, Hamburg-New York, Asia-Europe

2. **Bulk Carriers** (5 vessels)
   - Atlantic Warrior, Iron Ore Pioneer, Coal Carrier Express, Grain Seafarer, Mineral Voyager
   - Carrying: Iron ore, coal, grain, minerals

3. **Crude Oil Tankers** (3 vessels)
   - Crude Navigator, Petrol Express, Oil Endeavour
   - Capacity: 150,000-170,000 DWT

4. **Product Tankers** (3 vessels)
   - Chemical Pioneer, Refined Voyager, Distillate Carrier
   - Carrying: Refined products, chemicals

5. **LNG Carriers** (3 vessels)
   - LNG Arctic Explorer, Gas Star, Cryogenic Navigator
   - Cryogenic cargo transport

6. **Car Carriers (RoRo)** (2 vessels)
   - Auto Express 1, Vehicle Bridge
   - Vehicle transportation

7. **General Cargo** (3 vessels)
   - General Trader, Cargo Seafarer, Freight Navigator
   - Multi-purpose cargo

8. **Reefer Ships** (2 vessels)
   - Frozen Food Express, Cold Chain Carrier
   - Temperature-controlled cargo

9. **Offshore Support Vessels** (2 vessels)
   - Platform Supply Vessel Alpha, Supply Ship Beta
   - Offshore operations support

10. **Cement Carriers** (2 vessels)
    - Cement Carrier Prime, Builder Supply
    - Bulk cement transport

## Data Details

### Organizations
- Nordic Maritime Corp (Norway)
- Mediterranean Shipping Lines (Switzerland)
- Pacific Tanker Fleet (Singapore)
- Atlantic Container Services (USA)
- Baltic LNG Transport (Denmark)

### Voyages
- Active voyages from February-March 2024
- Completed voyages from January-February 2024
- Routes across major shipping lanes (Rotterdam-Singapore, Hamburg-New York, etc.)

### Fuel Consumption
- MGO (Marine Gas Oil) consumption data
- Daily consumption tracked
- Main engine and auxiliary engine consumption
- Bunker Delivery Notes (BDN) tracking

### Energy Efficiency Technologies
- Shaft Generator Motor (4.5% efficiency gain)
- Waste Heat Recovery (6.2% efficiency gain)
- Mewis Duct (3.8% efficiency gain)
- Onshore Power Supply (OPS) (15% reduction)
- Wind Turbines (2.5% efficiency gain)

### Compliance Data
- EU ETS: Emissions tracking for 2024 reporting year
- FuelEU: GHG intensity and compliance balance
- Surrender deadlines: April 30, 2025
- Compliance alerts: Active monitoring

### Verifiers
- DNV GL Maritime Verification
- Lloyd's Register Marine
- ABS Group

### Pooling & Trading
- 2 active FuelEU pooling arrangements
- RFQs for surplus/deficit trading
- EUA trades (spot and futures)
- Real-time market data

## Loading the Data

### From Command Line
```bash
# Set database URL
export DB_URL="postgres://postgres:nautilus_dev_password_123@localhost:5432/nautilus"

# Run the seed script
cd services/_shared/seeds
ts-node load_seed_data.ts
```

### From Docker
```bash
# Execute inside database container
docker exec -i nh_db psql -U postgres -d nautilus < services/_shared/seeds/synthetic_data.sql
```

## Notes

- All passwords in seed data: "Test123!" (hashed with bcrypt)
- Real IMO numbers for vessels
- Realistic consumption figures based on vessel types
- Diverse vessel types covering major commercial maritime operations
- Multi-port voyages with legs
- Cross-compliance data (EU ETS + FuelEU)
- Verification workflow examples

## Vessel Type Breakdown

| Type | Count | Key Characteristics |
|------|-------|---------------------|
| Container | 5 | High-speed, frequent port calls |
| Bulk Carrier | 5 | Variable cargoes, seasonal routes |
| Crude Tanker | 3 | Large capacity, long-distance |
| Product Tanker | 3 | Smaller capacity, refined products |
| LNG Carrier | 3 | Cryogenic, specialized |
| Car Carrier | 2 | RoRo, frequent sailings |
| General Cargo | 3 | Versatile, varied cargoes |
| Reefer | 2 | Temperature-controlled |
| Offshore Support | 2 | Specialized operations |
| Cement Carrier | 2 | Dry bulk, regional |


