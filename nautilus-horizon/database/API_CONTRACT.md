# Voyage Legs API Contract

## Overview
This document defines the API contract for voyage legs management, ensuring proper integration between frontend and backend services.

## Base URL
```
http://localhost:8080/voyages/api
```

## Authentication
All endpoints require Bearer token authentication:
```
Authorization: Bearer <access_token>
```

## Endpoints

### 1. Get All Voyages (with optional legs)
**GET** `/voyages`

**Query Parameters:**
- `include_legs` (boolean, default: false): Include voyage legs in response
- `ship_id` (UUID, optional): Filter by ship ID
- `status` (string, optional): Filter by status (ACTIVE, COMPLETED, CANCELLED)
- `start_date` (date, optional): Filter voyages starting after this date
- `end_date` (date, optional): Filter voyages ending before this date

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "voyage_id": "V-9391001-20240115",
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
        }
      ],
      "compliance": {
        "eu_ets": {
          "covered_share_pct": 50,
          "eua_exposure_tco2": 234.5,
          "reported_year": 2024
        },
        "fueleu": {
          "energy_in_scope_gj": 45000,
          "ghg_intensity_gco2e_per_mj": 89.5,
          "compliance_balance_gco2e": 1250000
        }
      }
    }
  ],
  "meta": {
    "total": 36,
    "page": 1,
    "limit": 50
  }
}
```

### 2. Get Single Voyage with Legs
**GET** `/voyages/:voyage_id`

**Response:** Same structure as above, single object in `data` array.

### 3. Create Voyage with Legs
**POST** `/voyages`

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

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "voyage_id": "V-9391001-20240115",
    ...
  }
}
```

### 4. Update Voyage
**PUT** `/voyages/:voyage_id`

Same request body structure as POST, but all fields optional (only provided fields will be updated).

### 5. Add Leg to Existing Voyage
**POST** `/voyages/:voyage_id/legs`

**Request Body:**
```json
{
  "leg_number": 3,
  "departure_port": "Singapore",
  "arrival_port": "Hong Kong",
  "departure_date": "2024-02-16T10:00:00Z",
  "arrival_date": "2024-02-20T14:00:00Z",
  "distance_nm": 1400,
  "cargo_type": "Container",
  "cargo_quantity": 12000
}
```

### 6. Update Voyage Leg
**PUT** `/voyages/:voyage_id/legs/:leg_id`

Same request body structure as POST leg.

### 7. Delete Voyage Leg
**DELETE** `/voyages/:voyage_id/legs/:leg_id`

**Response:**
```json
{
  "message": "Leg deleted successfully"
}
```

### 8. Get Compliance Data
**GET** `/voyages/:voyage_id/compliance`

**Response:**
```json
{
  "data": {
    "eu_ets": {
      "covered_share_pct": 50,
      "eua_exposure_tco2": 234.5,
      "reported_year": 2024,
      "surrender_deadline_iso": "2025-04-30T23:59:59Z",
      "verification_status": "PENDING"
    },
    "fueleu": {
      "energy_in_scope_gj": 45000,
      "ghg_intensity_gco2e_per_mj": 89.5,
      "compliance_balance_gco2e": 1250000,
      "banked_gco2e": 250000,
      "borrowed_gco2e": 0,
      "pooling_status": "SURPLUS_AVAILABLE"
    },
    "imo_dcs": {
      "transport_work_tnm": 688000000,
      "submission_status": "PENDING",
      "submission_deadline": "2025-03-31"
    }
  }
}
```

## Error Responses

All errors follow this format:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "traceId": "unique-trace-id"
  }
}
```

**HTTP Status Codes:**
- 200: Success
- 201: Created
- 400: Bad Request (validation error)
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error

## Validation Rules

1. **Voyage ID**: Must be unique across all voyages
2. **Leg Numbers**: Must be sequential, starting from 1, no gaps
3. **Port Continuity**: 
   - Leg N arrival_port must match Leg N+1 departure_port (if leg N+1 exists)
   - First leg departure_port should match voyage start_port
   - Last leg arrival_port should match voyage end_port
4. **Dates**: 
   - Leg departure_date >= voyage start_date
   - Leg arrival_date <= voyage end_date
   - Leg arrival_date > leg departure_date
   - Leg N+1 departure_date >= Leg N arrival_date
5. **Distance**: Should be provided or will be calculated from port coordinates

## Data Requirements

### Minimum Required for Voyage Creation:
- `voyage_id` (unique)
- `ship_id` (must exist)
- `start_date`
- At least one leg OR both `start_port` and `end_port`

### Recommended for Accurate Compliance Calculations:
- All voyage legs with distances
- Cargo information
- Actual fuel consumption data per leg

