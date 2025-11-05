# Maritime Compliance Database System

## Overview

This database system is designed to meet the latest data standards for maritime compliance verification, supporting:

- **EU ETS (Emissions Trading System)** - CO2 emissions monitoring and reporting
- **FuelEU Maritime** - GHG intensity and compliance balance tracking
- **IMO DCS (Data Collection System)** - Fuel consumption and transport work reporting
- **Verification and Audit** - Third-party verification and compliance auditing

## Database Standards Compliance

### Regulatory Compliance
- ✅ **EU ETS Regulation 2023/957** - Full compliance with monitoring, reporting, and verification requirements
- ✅ **FuelEU Maritime Regulation 2023/1805** - Complete GHG intensity and compliance balance tracking
- ✅ **IMO DCS Resolution MEPC.278(70)** - Fuel consumption and transport work data collection
- ✅ **ISO 14064-1:2018** - GHG emissions quantification and reporting standards
- ✅ **ISO 19011:2018** - Audit management systems guidelines

### Data Integrity Standards
- ✅ **ACID Compliance** - Full transactional integrity
- ✅ **Audit Trail** - Complete change tracking with user attribution
- ✅ **Data Validation** - Multi-layer validation with regulatory compliance checks
- ✅ **Verification Support** - Third-party verifier integration and certificate management
- ✅ **Backup and Recovery** - Automated backup with point-in-time recovery

## Database Schema

### Core Entities

#### Organizations
- Shipping companies, charterers, and other maritime entities
- IMO company number tracking
- Contact information and registration details

#### Ships
- Vessel information with IMO number as primary identifier
- Technical specifications and classification details
- Organization ownership and flag state

#### Voyages
- Commercial and ballast voyage tracking
- Multi-leg voyage support
- Charter type and counterparty information

### Compliance Data

#### Fuel Consumption (IMO DCS)
- Detailed fuel consumption by type and leg
- Bunker delivery note integration
- Fuel quality parameters (density, sulphur, carbon content)

#### EU ETS Data
- CO2 emissions calculation and reporting
- Covered share percentage tracking
- Allowance requirements and surrender status

#### FuelEU Maritime Data
- Energy consumption in scope
- GHG intensity calculations
- Compliance balance and pooling status

### Verification System

#### Verifiers
- Accredited verification body registry
- Accreditation scope and validity tracking
- Contact information and certification details

#### Verifications
- Third-party verification records
- Verification results and findings
- Certificate number tracking

### Pooling System (FuelEU)

#### Pooling Arrangements
- FuelEU pooling group management
- Pool leader designation
- Participant tracking

#### RFQ System
- Pooling request for quotes
- Offer management and acceptance
- Price negotiation tracking

## Installation and Setup

### Prerequisites
- PostgreSQL 14+ with UUID extension
- Node.js 18+ with npm
- SSL certificate for production

### Environment Variables
```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nautilus_horizon
DB_USER=postgres
DB_PASSWORD=your_password

# SSL Configuration (Production)
NODE_ENV=production
DB_SSL=true
```

### Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Create Database**
   ```sql
   CREATE DATABASE nautilus_horizon;
   CREATE USER nautilus_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE nautilus_horizon TO nautilus_user;
   ```

3. **Run Migrations**
   ```bash
   npm run migrate
   ```

4. **Initialize Database**
   ```bash
   npm run db:init
   ```

## Usage Examples

### Basic Operations

```typescript
import { dbService } from './database/services';
import { validateFuelConsumption } from './database/validation';

// Create organization
const organization = await dbService.createOrganization({
  name: 'Poseidon Shipping Ltd',
  imo_company_number: '1234567',
  registration_country: 'CYP',
  contact_email: 'compliance@poseidon.com'
});

// Add ship
const ship = await dbService.createShip({
  imo_number: '9876543',
  name: 'MV Neptune',
  organization_id: organization.id,
  ship_type: 'Container Ship',
  flag_state: 'CYP'
});

// Validate fuel consumption data
const validation = validateFuelConsumption({
  fuel_type: 'MGO',
  consumption_tonnes: 150.5,
  consumption_date: new Date('2024-01-15')
});

if (!validation.isValid) {
  console.error('Validation errors:', validation.errors);
}
```

### Compliance Reporting

```typescript
// Get fleet compliance summary
const summary = await dbService.getFleetComplianceSummary(orgId, 2024);

// Get pooling opportunities
const opportunities = await dbService.getPoolingOpportunities(orgId, 2024);

// Get active compliance alerts
const alerts = await dbService.getActiveAlertsByOrganization(orgId);
```

### Verification Process

```typescript
// Create verification record
const verification = await dbService.createVerification({
  verifier_id: verifier.id,
  data_type: 'FUEL_CONSUMPTION',
  reference_id: fuelConsumption.id,
  verification_date: new Date(),
  verification_result: 'VERIFIED',
  findings: 'All data verified against bunker delivery notes',
  certificate_number: 'VER-2024-001'
});
```

## Data Validation

The system includes comprehensive validation rules:

### Fuel Consumption Validation
- Required field validation
- Fuel type enumeration
- Consumption amount validation
- Density and quality parameter ranges
- Regulatory compliance checks (sulphur limits)

### EU ETS Validation
- Percentage range validation (0-100%)
- Emissions calculation consistency
- Year validation
- Compliance status tracking

### FuelEU Validation
- Energy consumption validation
- GHG intensity range checks
- Pooling status validation
- Compliance balance calculations

### Cross-Validation
- Fuel consumption vs CO2 emissions consistency
- Energy calculations vs fuel consumption
- Multi-year compliance tracking

## Security Features

### Access Control
- Role-based access control (RBAC)
- Organization-level data isolation
- Verifier-specific access permissions

### Audit Trail
- Complete change tracking
- User attribution
- IP address logging
- Timestamp precision

### Data Encryption
- SSL/TLS for data in transit
- Encrypted database connections
- Secure credential management

## Performance Optimization

### Indexing Strategy
- Primary key indexes on all tables
- Foreign key indexes for joins
- Composite indexes for common queries
- Partial indexes for active records

### Query Optimization
- Prepared statements for security
- Connection pooling for scalability
- Query result caching
- Pagination for large datasets

## Backup and Recovery

### Automated Backups
- Daily full backups
- Hourly incremental backups
- Point-in-time recovery capability
- Cross-region backup replication

### Recovery Procedures
- Automated failover
- Data consistency checks
- Rollback procedures
- Disaster recovery plans

## Monitoring and Alerting

### Database Monitoring
- Connection pool monitoring
- Query performance tracking
- Storage usage alerts
- Error rate monitoring

### Compliance Alerts
- Deadline approaching notifications
- Non-compliance warnings
- Verification due reminders
- Pooling opportunity alerts

## API Integration

### RESTful Endpoints
- CRUD operations for all entities
- Bulk data import/export
- Compliance reporting APIs
- Verification submission endpoints

### Webhook Support
- Real-time compliance alerts
- Verification status updates
- Pooling opportunity notifications
- Regulatory deadline reminders

## Testing

### Unit Tests
- Data validation tests
- CRUD operation tests
- Business logic tests
- Error handling tests

### Integration Tests
- Database connection tests
- Migration tests
- API endpoint tests
- End-to-end workflow tests

### Performance Tests
- Load testing
- Stress testing
- Concurrent user testing
- Database performance testing

## Deployment

### Development Environment
```bash
npm run dev
npm run db:migrate
npm run db:seed
```

### Production Deployment
```bash
npm run build
npm run db:migrate:prod
npm run start
```

### Docker Deployment
```bash
docker-compose up -d
docker-compose exec app npm run db:migrate
```

## Support and Maintenance

### Regular Maintenance
- Database statistics updates
- Index maintenance
- Log rotation
- Performance monitoring

### Updates and Patches
- Security patch management
- Regulatory compliance updates
- Feature enhancements
- Bug fixes

## Compliance Certifications

This database system is designed to support:
- **ISO 14064-1:2018** - GHG emissions quantification
- **ISO 19011:2018** - Audit management systems
- **EU ETS MRR** - Monitoring and reporting regulation
- **FuelEU Maritime** - GHG intensity requirements
- **IMO DCS** - Data collection system standards

## Contact and Support

For technical support or compliance questions:
- Email: compliance@nautilus-horizon.com
- Documentation: https://docs.nautilus-horizon.com
- Support Portal: https://support.nautilus-horizon.com


