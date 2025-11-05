# Compliance Ledger Service

EU ETS ledger, FuelEU balances, and audit trail service for Nautilus Horizon.

## Overview

The compliance-ledger service manages:
- **Verified emissions** per voyage from MRV imports
- **FuelEU balance tracking** with banking/borrowing rules
- **EUA operations**: forecast, hedge, surrender, and reconcile
- **Pool allocations** with guardrails
- **Audit trail** for all compliance operations

## Architecture

Follows the layered architecture pattern:
- **Controllers** → HTTP endpoints and request handling
- **Services** → Business logic and validation
- **Repositories** → Prisma data access layer
- **Models** → Domain entities and DTOs

## Entities

### Core
- `Company` - Maritime organizations
- `Vessel` - Fleet vessels with IMO numbers
- `Voyage` - Commercial and ballast voyages

### Compliance
- `EmissionRecord` - Verified emissions from MRV system
- `VerificationRecord` - Third-party verification status
- `FuelEUBalance` - FuelEU compliance balances in gCO2e
- `PoolAllocation` - Pool participation per vessel/period
- `EUAOperation` - Emission Allowance operations
- `AuditEvent` - Immutable audit trail

## Business Rules

### FuelEUBalance
- No borrowing when vessel is pooled
- Banking allowed up to 10 years forward
- Borrowing limited to 1 year forward
- Balance invariant: `balance = banked - borrowed`

### PoolAllocation
- One pool per vessel per period
- OUTFLOW requires sufficient balance
- Pooled vessels cannot borrow

### EUAOperation
- Surrender only after positive emissions
- Reconcile must match surrendered amount
- Forecast accuracy tracked

## API Endpoints

### Emissions
- `POST /api/emissions` - Record emissions
- `PUT /api/emissions/:id` - Update unverified emissions

### FuelEU Balance
- `POST /api/fueleu/balance` - Adjust balance
- `GET /api/fueleu/balance` - Get balance
- `POST /api/fueleu/bank/:companyId/:periodYear` - Bank to next period

### EUA Operations
- `POST /api/eua/forecast` - Forecast EUA needs
- `POST /api/eua/surrender` - Surrender EUAs
- `POST /api/eua/reconcile` - Reconcile surrendered EUAs
- `GET /api/eua/accuracy/:companyId/:periodYear` - Get forecast accuracy

### Pool
- `POST /api/pools/allocate` - Allocate vessel to pool
- `GET /api/pools/performance/:poolId/:periodYear` - Get pool performance

## Setup

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- Docker (optional)

### Installation

```bash
cd services/compliance-ledger
npm install
```

### Environment Variables

Create `.env` file:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nautilus"
PORT=3006
NODE_ENV=development
```

### Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Open Prisma Studio
npm run prisma:studio
```

## Development

```bash
# Start development server
npm run dev

# Run tests
npm test

# Type check
npm run typecheck

# Lint
npm run lint
```

## Testing

TDD approach with Vitest:
- **Unit tests** for business invariants
- **Integration tests** for API endpoints
- **Coverage target**: 80% lines

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch
```

## Docker

```bash
# Build image
docker build -t compliance-ledger .

# Run with docker-compose (from project root)
docker-compose up compliance-ledger
```

## Health Check

```bash
curl http://localhost:3006/health
# {"status":"ok","service":"compliance-ledger"}
```

## Security

- Input validation with Zod
- Authorization via JWT (from auth service)
- Audit trail for all mutations
- Error masking for sensitive data

## Status

✅ **Complete**: Core service implementation with all entities and business rules
