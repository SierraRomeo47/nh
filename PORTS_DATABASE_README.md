# Ports Database Documentation

## Overview

Successfully created a comprehensive maritime ports database with **11,734 sea ports** from **218 countries** worldwide.

## Data Source

- **Excel File**: `UNLOCODE Comparision Sep 2025.xlsx`
- **Filter**: Function code contains '1' (sea ports only)
- **Coordinates**: Only ports with valid latitude/longitude included

## Database Schema

```sql
CREATE TABLE ports (
    id SERIAL PRIMARY KEY,
    unlocode VARCHAR(5) UNIQUE NOT NULL,      -- UN/LOCODE (e.g., NLRTM, SGSIN)
    name VARCHAR(255) NOT NULL,                -- Port name (e.g., Rotterdam)
    country_code VARCHAR(2) NOT NULL,          -- ISO country code (e.g., NL, SG)
    latitude DECIMAL(10, 8),                   -- Latitude in decimal degrees
    longitude DECIMAL(11, 8),                  -- Longitude in decimal degrees
    function_code VARCHAR(10),                 -- Port function code
    iata_code VARCHAR(3),                      -- IATA airport code (if applicable)
    subdivision VARCHAR(10),                   -- Country subdivision code
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

All endpoints are available at: `http://localhost/vessels/api/ports`

### 1. Search Ports by Name
```
GET /api/ports/search?q=rotterdam&limit=20
```

**Response:**
```json
[
  {
    "unlocode": "NLRTM",
    "name": "Rotterdam",
    "country_code": "NL",
    "latitude": 51.91666667,
    "longitude": 4.50000000
  }
]
```

### 2. Get Port by UNLOCODE
```
GET /api/ports/NLRTM
```

**Response:**
```json
{
  "id": 1234,
  "unlocode": "NLRTM",
  "name": "Rotterdam",
  "country_code": "NL",
  "latitude": 51.91666667,
  "longitude": 4.50000000,
  "function_code": "1-------",
  "iata_code": null,
  "subdivision": null,
  "created_at": "2025-11-02T10:00:00.000Z",
  "updated_at": "2025-11-02T10:00:00.000Z"
}
```

### 3. Get All Ports with Filtering
```
GET /api/ports?search=new&country=US&limit=50&offset=0
```

**Response:**
```json
{
  "ports": [...],
  "total": 42,
  "limit": 50,
  "offset": 0
}
```

### 4. Get Ports by Country
```
GET /api/ports/country/NL
```

**Response:**
```json
{
  "country": "NL",
  "ports": [...],
  "total": 156
}
```

### 5. Get Nearby Ports
```
GET /api/ports/nearby?lat=51.92&lon=4.48&radius=100&limit=10
```

**Parameters:**
- `lat`: Latitude in decimal degrees
- `lon`: Longitude in decimal degrees
- `radius`: Radius in kilometers (default: 50km)
- `limit`: Maximum results (default: 20)

**Response:**
```json
[
  {
    "unlocode": "NLRTM",
    "name": "Rotterdam",
    "country_code": "NL",
    "latitude": 51.91666667,
    "longitude": 4.50000000,
    "distance_km": 0.5
  }
]
```

## Sample Ports in Database

| UNLOCODE | Port Name | Country | Latitude | Longitude |
|----------|-----------|---------|----------|-----------|
| NLRTM | Rotterdam | NL | 51.92°N | 4.50°E |
| SGSIN | Singapore | SG | 1.28°N | 103.85°E |
| USNYC | New York | US | 40.70°N | 74.00°W |
| CNSHA | Shanghai | CN | 31.23°N | 121.47°E |
| AEDXB | Dubai | AE | 25.27°N | 55.33°E |
| DEHAM | Hamburg | DE | 53.55°N | 9.99°E |
| HKHKG | Hong Kong | HK | 22.32°N | 114.17°E |
| EGPSE | Port Said East | EG | 31.22°N | 32.35°E |

## Frontend Integration

The frontend service (`nautilus-horizon/services/portService.ts`) provides easy-to-use functions:

```typescript
import { searchPorts, getPortByUnlocode, getNearbyPorts } from './services/portService';

// Search for ports
const ports = await searchPorts('rotterdam');

// Get specific port
const port = await getPortByUnlocode('NLRTM');

// Find nearby ports
const nearby = await getNearbyPorts(51.92, 4.48, 100);
```

## Data Quality

- **Total Sea Ports**: 11,734
- **Countries Covered**: 218
- **Ports with Valid Coordinates**: 100%
- **Source**: UN/LOCODE + DNV 2024 data

## Files Created

1. `scripts/create_ports_db.py` - Python script to generate SQL from Excel
2. `scripts/ports.sql` - Generated SQL file with all port data
3. `services/vessels/src/controllers/ports.controller.ts` - API controller
4. `services/vessels/src/routes/ports.routes.ts` - API routes
5. `nautilus-horizon/services/portService.ts` - Frontend service

## Usage in Voyage Planning

The port database is now integrated into the Scenario Pad voyage planning feature. When selecting origin and destination ports, the system can:

- Search ports by name in real-time
- Display accurate coordinates
- Calculate precise distances using actual port locations
- Show optimized maritime routes between any two ports

## Maintenance

To update the port database:

1. Get updated Excel file
2. Run: `python scripts/create_ports_db.py`
3. Import: `Get-Content scripts/ports.sql | docker exec -i nh_db psql -U postgres -d nautilus`
4. Restart vessels service: `docker-compose restart vessels`

