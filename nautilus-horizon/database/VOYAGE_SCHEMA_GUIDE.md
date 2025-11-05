# Enhanced Voyage Schema Guide
## DNV, LR, and ABS Standards Implementation

### Overview

This enhanced voyage schema implements the latest standards from DNV (Det Norske Veritas), Lloyd's Register (LR), and American Bureau of Shipping (ABS) for comprehensive fuel data collection, supporting fossil fuels, biofuels, and e-fuels with full regulatory compliance.

## Fuel Categories and Types

### 1. Fossil Fuels
Traditional marine fuels with established properties and emission factors.

**Supported Types:**
- **MGO** (Marine Gas Oil) - Low sulphur distillate fuel
- **MDO** (Marine Diesel Oil) - Medium sulphur distillate fuel  
- **HFO** (Heavy Fuel Oil) - High sulphur residual fuel
- **LNG** (Liquefied Natural Gas) - Natural gas in liquid form
- **LPG** (Liquefied Petroleum Gas) - Propane/butane mixture

**Key Properties:**
- Standard calorific values and densities
- Sulphur content limits (IMO Annex VI)
- Carbon content for CO2 calculations
- Well-to-wake GHG emission factors

### 2. Biofuels
Renewable fuels derived from biological sources with sustainability tracking.

**Supported Types:**
- **BIO_MGO** - Bio-based marine gas oil
- **BIO_MDO** - Bio-based marine diesel oil
- **BIO_HFO** - Bio-based heavy fuel oil
- **FAME** - Fatty Acid Methyl Esters
- **HVO** - Hydrotreated Vegetable Oil
- **BIO_LNG** - Bio-based liquefied natural gas
- **BIO_METHANOL** - Bio-based methanol
- **BIO_ETHANOL** - Bio-based ethanol

**Key Properties:**
- Feedstock tracking (rapeseed, palm, waste oils, etc.)
- Generation classification (1G, 2G, 3G, 4G)
- Land use change categories (ILUC, dLUC, No LUC)
- Sustainability certifications (ISCC, RED II)
- Blend ratio tracking for hybrid fuels

### 3. E-Fuels (Electrofuels)
Carbon-neutral fuels produced using renewable electricity.

**Supported Types:**
- **E_METHANOL** - Electro-methanol
- **E_AMMONIA** - Electro-ammonia
- **E_HYDROGEN** - Electro-hydrogen
- **E_DIESEL** - Electro-diesel
- **E_LNG** - Electro-liquefied natural gas

**Key Properties:**
- Production method tracking (electrolysis, Power-to-X)
- Renewable electricity source (solar, wind, hydro)
- Carbon source (Direct Air Capture, industrial CO2)
- Well-to-wake GHG emissions (typically 0 gCO2e/MJ)
- Certificate of origin requirements

### 4. Hybrid Blends
Mixtures of fossil and renewable fuels with precise blend tracking.

**Supported Types:**
- **MGO_BIO_BLEND** - MGO with biofuel blend
- **MDO_BIO_BLEND** - MDO with biofuel blend
- **HFO_BIO_BLEND** - HFO with biofuel blend

**Key Properties:**
- Precise blend ratio tracking
- Dual emission factor calculations
- Certification requirements for both components

## Database Schema Structure

### Enhanced Fuel Consumption Table

```sql
CREATE TABLE fuel_consumption (
    -- Basic Information
    fuel_type VARCHAR(50) NOT NULL,
    fuel_category VARCHAR(20) NOT NULL,
    consumption_tonnes DECIMAL(15,3) NOT NULL,
    consumption_date DATE NOT NULL,
    
    -- Physical Properties (DNV Standards)
    density_kg_m3 DECIMAL(8,2),
    lower_calorific_value_mj_kg DECIMAL(8,2),
    higher_calorific_value_mj_kg DECIMAL(8,2),
    viscosity_cst DECIMAL(8,2),
    flash_point_c DECIMAL(5,1),
    
    -- Chemical Composition
    sulphur_content_pct DECIMAL(5,3),
    carbon_content_pct DECIMAL(5,3),
    hydrogen_content_pct DECIMAL(5,3),
    nitrogen_content_pct DECIMAL(5,3),
    oxygen_content_pct DECIMAL(5,3),
    
    -- Biofuel Properties (LR Standards)
    biofuel_feedstock VARCHAR(100),
    biofuel_blend_ratio_pct DECIMAL(5,2),
    biofuel_generation VARCHAR(20),
    land_use_change_category VARCHAR(20),
    
    -- E-Fuel Properties (ABS Standards)
    e_fuel_production_method VARCHAR(50),
    renewable_electricity_source VARCHAR(50),
    carbon_source VARCHAR(50),
    well_to_tank_ghg_gco2e_mj DECIMAL(10,6),
    tank_to_wake_ghg_gco2e_mj DECIMAL(10,6),
    well_to_wake_ghg_gco2e_mj DECIMAL(10,6),
    
    -- Safety and Handling
    toxicity_level VARCHAR(20),
    corrosiveness_rating VARCHAR(20),
    storage_requirements TEXT,
    handling_requirements TEXT,
    
    -- Engine Compatibility
    engine_type VARCHAR(50),
    retrofit_required BOOLEAN DEFAULT FALSE,
    retrofit_certificate VARCHAR(100),
    
    -- Regulatory Compliance
    imo_annex_vi_compliant BOOLEAN DEFAULT TRUE,
    eu_red_ii_compliant BOOLEAN DEFAULT FALSE,
    iscc_certified BOOLEAN DEFAULT FALSE
);
```

### Fuel Specifications Table

```sql
CREATE TABLE fuel_specifications (
    fuel_type VARCHAR(50) UNIQUE NOT NULL,
    fuel_category VARCHAR(20) NOT NULL,
    
    -- Standard Properties
    standard_density_kg_m3 DECIMAL(8,2),
    standard_lower_calorific_value_mj_kg DECIMAL(8,2),
    default_well_to_wake_ghg_gco2e_mj DECIMAL(10,6),
    
    -- Classification Society Approvals
    dnv_approved BOOLEAN DEFAULT FALSE,
    lr_approved BOOLEAN DEFAULT FALSE,
    abs_approved BOOLEAN DEFAULT FALSE,
    
    -- Safety Properties
    toxicity_class VARCHAR(20),
    corrosiveness_class VARCHAR(20),
    compatible_engine_types TEXT[]
);
```

## Calculation Methods

### Energy Consumption Calculation
```typescript
energyConsumptionGj = consumptionTonnes × lowerCalorificValueMjKg
```

### CO2 Emissions Calculation
```typescript
co2EmissionsT = (consumptionTonnes × carbonContentPct / 100) × (44 / 12)
```

### GHG Emissions by Fuel Category

#### Fossil Fuels
```typescript
wellToWakeEmissionsGco2e = energyGj × standardEmissionFactor
```

#### Biofuels
```typescript
wellToWakeEmissionsGco2e = energyGj × feedstockFactor × generationFactor
```

#### E-Fuels
```typescript
wellToWakeEmissionsGco2e = 0 // Carbon neutral
```

#### Hybrid Fuels
```typescript
wellToWakeEmissionsGco2e = (biofuelEmissions × blendRatio) + (fossilEmissions × (1 - blendRatio))
```

## Validation Rules

### Required Fields by Fuel Category

#### All Fuels
- `fuel_type`
- `fuel_category`
- `consumption_tonnes`
- `consumption_date`

#### Biofuels
- `biofuel_feedstock`
- `sustainability_certificate`
- `lower_calorific_value_mj_kg`

#### E-Fuels
- `certificate_of_origin`
- `renewable_electricity_source`
- `lower_calorific_value_mj_kg`

#### Hybrid Fuels
- `biofuel_blend_ratio_pct`

### Regulatory Compliance Checks

#### IMO Annex VI
- Sulphur content ≤ 3.5% (global limit)
- Sulphur content ≤ 0.5% (ECA limit)

#### EU RED II
- Sustainability certification required for biofuels
- GHG savings ≥ 50% (advanced biofuels)
- GHG savings ≥ 65% (from 2021)

#### FuelEU Maritime
- Well-to-wake GHG intensity reporting
- Compliance balance calculations
- Pooling eligibility tracking

## Usage Examples

### 1. Fossil Fuel Entry
```typescript
const fossilFuel: FuelConsumption = {
  fuel_type: 'MGO',
  fuel_category: 'FOSSIL',
  consumption_tonnes: 150.5,
  consumption_date: new Date('2024-01-15'),
  density_kg_m3: 840,
  lower_calorific_value_mj_kg: 42.7,
  sulphur_content_pct: 0.1,
  carbon_content_pct: 86.0
};
```

### 2. Biofuel Entry
```typescript
const biofuel: FuelConsumption = {
  fuel_type: 'HVO',
  fuel_category: 'BIOFUEL',
  consumption_tonnes: 120.0,
  consumption_date: new Date('2024-01-20'),
  biofuel_feedstock: 'WASTE_COOKING_OIL',
  biofuel_generation: '2G',
  sustainability_certificate: 'ISCC-EU-123456',
  lower_calorific_value_mj_kg: 44.0,
  eu_red_ii_compliant: true
};
```

### 3. E-Fuel Entry
```typescript
const eFuel: FuelConsumption = {
  fuel_type: 'E_METHANOL',
  fuel_category: 'E_FUEL',
  consumption_tonnes: 200.0,
  consumption_date: new Date('2024-01-25'),
  certificate_of_origin: 'CO-2024-002',
  renewable_electricity_source: 'WIND',
  carbon_source: 'DIRECT_AIR_CAPTURE',
  lower_calorific_value_mj_kg: 19.9,
  well_to_wake_ghg_gco2e_mj: 0.0
};
```

## Classification Society Standards

### DNV Guidelines
- Comprehensive fuel property specifications
- Safety and handling requirements
- Engine compatibility assessments
- Quality assurance protocols

### Lloyd's Register Standards
- Biofuel feedstock tracking
- Sustainability certification requirements
- Land use change impact assessment
- Generation-based emission factors

### ABS Requirements
- E-fuel production method documentation
- Renewable electricity source verification
- Carbon source tracking
- Safety protocols for alternative fuels

## Regulatory Compliance

### IMO DCS (Data Collection System)
- Fuel consumption by type
- Transport work calculations
- Distance and cargo tracking
- Annual reporting requirements

### EU ETS (Emissions Trading System)
- CO2 emissions calculation
- Covered share percentage
- Allowance requirements
- Surrender obligations

### FuelEU Maritime
- GHG intensity reporting
- Compliance balance tracking
- Pooling arrangements
- Penalty calculations

## Best Practices

### Data Quality
1. Always validate fuel properties against standards
2. Use actual measured values when available
3. Document measurement methods and equipment
4. Maintain calibration records

### Certification Management
1. Track certificate validity periods
2. Monitor renewal requirements
3. Maintain audit trails
4. Implement automated alerts

### Safety Considerations
1. Document handling requirements
2. Track toxicity and corrosiveness
3. Maintain safety data sheets
4. Train personnel on new fuel types

### Verification Support
1. Provide complete documentation
2. Maintain audit trails
3. Support third-party verification
4. Enable regulatory submissions

## Integration with Existing Systems

### Voyage Management
- Link fuel consumption to voyage legs
- Track consumption patterns
- Monitor efficiency metrics
- Generate compliance reports

### Compliance Monitoring
- Real-time validation
- Automated alerts
- Regulatory reporting
- Audit trail maintenance

### Financial Tracking
- Fuel cost allocation
- Carbon pricing integration
- Compliance cost tracking
- ROI calculations for alternative fuels

This enhanced voyage schema provides a comprehensive foundation for managing all types of marine fuels while ensuring full compliance with international regulations and classification society standards.
