# Insurance Quotes Integration Guide

## Overview
This document describes the complete integration between the insurance quote form (frontend) and the database, including all field mappings and the backend service architecture.

## Architecture

```
Frontend Form (InsuranceQuotes.tsx)
        ↓
Frontend Service (insuranceService.ts)
        ↓
NGINX Gateway (:8080/insurance/)
        ↓
Backend Service (:3007)
        ↓
PostgreSQL Database (insurance_quotes table)
```

## Field Mappings

### Form → Backend API → Database

| Form Field | Frontend Property | API Request Field | Database Column | Type | Notes |
|------------|-------------------|-------------------|-----------------|------|-------|
| Vessel Name | vesselName | vesselName | vessel_name | VARCHAR(255) | Required |
| Vessel Type | vesselType | vesselType | vessel_type | VARCHAR(50) | Required, dropdown |
| Vessel Age | vesselAge | vesselAge | vessel_age | INTEGER | Required, years |
| Gross Tonnage | grossTonnage | grossTonnage | gross_tonnage | INTEGER | Required, GT |
| Origin Port | routeOrigin | routeOrigin | route_origin | VARCHAR(255) | Required |
| Destination Port | routeDestination | routeDestination | route_destination | VARCHAR(255) | Required |
| Route Risk Zone | routeRiskZone | routeRiskZone | route_risk_zone | VARCHAR(50) | Required, dropdown |
| Voyage Duration | voyageDuration | voyageDuration | voyage_duration | INTEGER | Required, days |
| Cargo Type | cargoType | cargoType | cargo_type | VARCHAR(50) | Optional, dropdown |
| Cargo Value | cargoValue | cargoValue | cargo_value | DECIMAL(15,2) | Optional, USD |
| Safety Rating | safetyRating | safetyRating | safety_rating | VARCHAR(20) | Required, dropdown |
| Compliance Score | complianceScore | complianceScore | compliance_score | INTEGER | Required, 0-100 |
| Previous Claims | previousClaims | previousClaims | previous_claims | INTEGER | Required |
| Deductible | deductible | deductible | deductible | DECIMAL(15,2) | Required, USD |
| Coverage Types | coverageType | coverageType | coverage_types | TEXT[] | Required, array/checkboxes |

### Generated Fields (Backend)

| Field | Source | Database Column | Type | Description |
|-------|--------|-----------------|------|-------------|
| Quote ID | Auto-generated | quote_id | VARCHAR(50) | Format: MIQ-{timestamp}-{random} |
| Risk Assessment | Calculated | risk_assessment | JSONB | Contains risk factors, scores, overall risk |
| Coverage Breakdown | Calculated | coverage_breakdown | JSONB | Array of coverage details with premiums |
| Total Premium | Calculated | total_premium | DECIMAL(15,2) | Sum of all coverage premiums |
| Terms & Conditions | Auto-generated | terms_and_conditions | TEXT[] | Based on coverage types |

## Database Schema

### Table: insurance_quotes

```sql
CREATE TABLE insurance_quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_id VARCHAR(50) UNIQUE NOT NULL,
    
    -- Request Information
    request_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Vessel Information
    vessel_id UUID REFERENCES ships(id),
    vessel_name VARCHAR(255) NOT NULL,
    vessel_type VARCHAR(50) NOT NULL,
    vessel_age INTEGER NOT NULL,
    gross_tonnage INTEGER NOT NULL,
    
    -- Route Information
    route_origin VARCHAR(255) NOT NULL,
    route_destination VARCHAR(255) NOT NULL,
    route_risk_zone VARCHAR(50) NOT NULL,
    voyage_duration INTEGER NOT NULL,
    
    -- Cargo Information
    cargo_type VARCHAR(50),
    cargo_value DECIMAL(15,2),
    
    -- Risk Assessment
    safety_rating VARCHAR(20) NOT NULL,
    compliance_score INTEGER NOT NULL,
    previous_claims INTEGER NOT NULL DEFAULT 0,
    deductible DECIMAL(15,2) NOT NULL,
    
    -- Financial Information
    total_premium DECIMAL(15,2) NOT NULL,
    coverage_types TEXT[] NOT NULL,
    
    -- Calculated Data (JSON)
    risk_assessment JSONB NOT NULL,
    coverage_breakdown JSONB NOT NULL,
    
    -- Terms
    terms_and_conditions TEXT[],
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'QUOTED',
    underwriter VARCHAR(255) NOT NULL,
    policy_number VARCHAR(50),
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);
```

## API Endpoints

### Backend Service: Insurance (:3007)

#### 1. Generate Quote
**Endpoint:** `POST /insurance/quotes`

**Request Body:**
```json
{
  "vesselName": "MV Aurora Spirit",
  "vesselType": "Container Ship",
  "vesselAge": 5,
  "grossTonnage": 50000,
  "routeOrigin": "Singapore",
  "routeDestination": "Rotterdam",
  "routeRiskZone": "Low Risk Zone",
  "voyageDuration": 30,
  "cargoType": "Containerized",
  "cargoValue": 5000000,
  "safetyRating": "Good",
  "complianceScore": 85,
  "previousClaims": 0,
  "deductible": 50000,
  "coverageType": [
    "Hull & Machinery",
    "Protection & Indemnity"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "quote": {
    "id": "uuid-here",
    "quoteId": "MIQ-TIMESTAMP-RANDOM",
    "requestDate": "2025-11-09T...",
    "expiryDate": "2025-12-09T...",
    "vessel": {
      "name": "MV Aurora Spirit",
      "type": "Container Ship",
      "age": 5,
      "tonnage": 50000
    },
    "coverage": [...],
    "totalPremium": 125000,
    "deductible": 50000,
    "riskAssessment": {...},
    "termsAndConditions": [...],
    "validUntil": "2025-12-09T...",
    "underwriter": "Nautilus Marine Insurance Ltd.",
    "status": "QUOTED"
  }
}
```

#### 2. Get Quote by ID
**Endpoint:** `GET /insurance/quotes/:quoteId`

#### 3. Get Quotes by Vessel
**Endpoint:** `GET /insurance/vessels/:vesselId/quotes`

#### 4. Accept Quote
**Endpoint:** `POST /insurance/quotes/:quoteId/accept`

**Response:**
```json
{
  "success": true,
  "policyNumber": "MIP-TIMESTAMP",
  "message": "Insurance policy MIP-TIMESTAMP has been issued successfully"
}
```

### NGINX Gateway Routes

All requests go through the gateway at `http://localhost:8080/insurance/`

The gateway forwards requests to the insurance service at `insurance:3007`

## Data Flow Example

1. **User fills form:**
   - Vessel Name: "MV Aurora Spirit"
   - Vessel Type: "Container Ship"
   - Vessel Age: 5
   - ... (other fields)

2. **Frontend submits to backend:**
```javascript
const response = await fetch('http://localhost:8080/insurance/insurance/quotes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(quoteRequest)
});
```

3. **Backend processes:**
   - Validates required fields
   - Calculates risk assessment
   - Calculates coverage premiums
   - Generates quote ID
   - Saves to database

4. **Database stores:**
```sql
INSERT INTO insurance_quotes (
  id, quote_id, vessel_name, vessel_type, ...
) VALUES (
  'uuid', 'MIQ-...', 'MV Aurora Spirit', 'Container Ship', ...
);
```

5. **Response returns to frontend:**
   - Displays generated quote
   - Shows risk assessment
   - Lists coverage breakdown
   - Allows acceptance

## Validation Rules

### Frontend Validation
- Vessel Name: Required, non-empty
- Vessel Age: Required, positive integer
- Gross Tonnage: Required, positive integer
- Compliance Score: Required, 0-100
- Previous Claims: Required, non-negative integer
- Coverage Types: Required, at least one selected
- Route fields: Required, non-empty

### Backend Validation
- All required fields present
- Coverage types is non-empty array
- Compliance score between 0-100
- Previous claims non-negative
- Numeric fields are valid numbers

## Error Handling

### Frontend
```typescript
try {
  const quote = await insuranceService.generateQuote(request);
  // Handle success
} catch (error) {
  console.error('Error generating quote:', error);
  alert('Failed to generate quote. Please try again.');
}
```

### Backend
```typescript
if (!quoteRequest.vesselName) {
  return res.status(400).json({
    success: false,
    error: 'Missing required fields: vesselName'
  });
}
```

## Deployment Steps

1. **Apply database schema:**
```bash
psql -U postgres -d nautilus < services/_shared/seeds/insurance_schema.sql
```

2. **Build insurance service:**
```bash
cd services/insurance
npm install
```

3. **Update docker-compose:**
```bash
docker compose -f docker/docker-compose.yml up -d --build
```

4. **Verify service:**
```bash
curl http://localhost:8080/insurance/insurance/health
```

## Testing

### 1. Test Backend Directly
```bash
curl -X POST http://localhost:3007/insurance/quotes \
  -H "Content-Type: application/json" \
  -d '{
    "vesselName": "Test Vessel",
    "vesselType": "Container Ship",
    "vesselAge": 5,
    "grossTonnage": 50000,
    "routeOrigin": "Singapore",
    "routeDestination": "Rotterdam",
    "routeRiskZone": "Low Risk Zone",
    "voyageDuration": 30,
    "safetyRating": "Good",
    "complianceScore": 85,
    "previousClaims": 0,
    "deductible": 50000,
    "coverageType": ["Hull & Machinery"]
  }'
```

### 2. Test Through Gateway
```bash
curl -X POST http://localhost:8080/insurance/insurance/quotes \
  -H "Content-Type: application/json" \
  -d '{ ... same as above ... }'
```

### 3. Test Frontend
1. Navigate to http://localhost:3000/#/insurance/quotes
2. Click "+ New Quote"
3. Fill in all fields
4. Click "Generate Quote"
5. Verify quote appears in list
6. Click quote to view details
7. Click "Accept & Issue Policy"
8. Verify policy number is displayed

### 4. Verify Database
```sql
-- Check if quote was saved
SELECT * FROM insurance_quotes ORDER BY created_at DESC LIMIT 1;

-- Check policy creation
SELECT * FROM insurance_policies ORDER BY issue_date DESC LIMIT 1;
```

## Troubleshooting

### Issue: Connection refused
- Verify insurance service is running: `docker ps | grep insurance`
- Check service logs: `docker logs nh_insurance`
- Verify gateway config: `docker logs nh_gateway`

### Issue: Field validation errors
- Check frontend console for errors
- Verify all required fields are filled
- Check data types match expected format

### Issue: Database errors
- Verify schema is applied: `\d insurance_quotes`
- Check database connection: `docker logs nh_db`
- Verify user permissions

### Issue: CORS errors
- Check nginx config includes insurance routes
- Verify gateway is reloaded after config change
- Check browser console for specific CORS error

## Future Enhancements

1. **Authentication:** Add JWT middleware to protect endpoints
2. **Authorization:** Implement role-based access (only INSURER role can generate quotes)
3. **Real vessel lookup:** Link to vessels table for auto-fill
4. **Email notifications:** Send quote and policy documents
5. **PDF generation:** Create downloadable quote/policy PDFs
6. **Claims management:** Add claims filing and processing
7. **Premium payment:** Integrate payment processing
8. **Policy renewal:** Automate policy renewal reminders

## Contact

For questions or issues, refer to the main project documentation or contact the development team.

Last Updated: November 9, 2025

