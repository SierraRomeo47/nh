# Environment Variables Reference

This document lists all required environment variables for the Nautilus Horizon deployment.

## Global Variables (All Services)

### Database Configuration
- `POSTGRES_PASSWORD` (required): PostgreSQL database password
- `DB_URL` (required): PostgreSQL connection string
  - Format: `postgres://postgres:${POSTGRES_PASSWORD}@db:5432/nautilus`
  - Used by: auth, vessels, voyages, compliance, trading, insurance, master-data
- `DATABASE_URL` (required for Prisma services): Same as DB_URL but for Prisma
  - Used by: auth (Prisma), compliance-ledger (Prisma)

### Node Environment
- `NODE_ENV` (optional, defaults to production): Set to `production` for production deployments
  - Values: `development` | `production`

## Service-Specific Variables

### Auth Service (`services/auth`)
- `PORT` (optional, defaults to 3001): Service port
- `JWT_SECRET` (required): Secret key for JWT token signing (min 32 characters)
- `JWT_REFRESH_SECRET` (required): Secret key for refresh token signing (min 32 characters)
- `ALLOWED_ORIGINS` (optional): Comma-separated list of allowed CORS origins
  - Default: `http://localhost:3000,https://*.vercel.app,https://*.nautilushorizon.com,https://nautilushorizon.com`

### Vessels Service (`services/vessels`)
- `PORT` (optional, defaults to 3002): Service port

### Voyages Service (`services/voyages`)
- `PORT` (optional, defaults to 3003): Service port

### Compliance Service (`services/compliance`)
- `PORT` (optional, defaults to 3004): Service port

### Compliance-Ledger Service (`services/compliance-ledger`)
- `PORT` (optional, defaults to 3006): Service port
- `DATABASE_URL` (required): Prisma connection string

### Trading Service (`services/trading`)
- `PORT` (optional, defaults to 3005): Service port

### Insurance Service (`services/insurance`)
- `PORT` (optional, defaults to 3007): Service port

### Master-Data Service (`services/master-data`)
- `PORT` (optional, defaults to 3008): Service port

## Coolify Environment Variables

In Coolify, create an environment group (e.g., `nautilus-prod`) with:

```bash
NODE_ENV=production
POSTGRES_PASSWORD=<strong-random-password>
JWT_SECRET=<strong-random-secret-32-chars-min>
JWT_REFRESH_SECRET=<strong-random-secret-32-chars-min>
ALLOWED_ORIGINS=https://your-vercel-domain.vercel.app,https://nautilushorizon.com
```

## Vercel Environment Variables

For services deployed on Vercel (e.g., auth service):

```bash
NODE_ENV=production
PORT=3001
JWT_SECRET=<strong-random-secret>
JWT_REFRESH_SECRET=<strong-random-secret>
DB_URL=<public-database-url-or-connection-pooler>
DATABASE_URL=<same-as-DB_URL>
ALLOWED_ORIGINS=https://your-vercel-domain.vercel.app,https://nautilushorizon.com
```

**Note**: Vercel serverless functions cannot connect to private Docker network databases. Use:
- Public database URL (with proper firewall rules)
- Connection pooler (PgBouncer, Supabase, etc.)
- Or keep auth service on Coolify only

## Generating Secure Secrets

```bash
# Generate JWT_SECRET (32+ characters)
openssl rand -base64 32

# Generate POSTGRES_PASSWORD (16+ characters)
openssl rand -base64 24
```

## Security Notes

- Never commit secrets to Git
- Use Coolify's protected environment variables
- Rotate secrets regularly
- Use different secrets for development and production
- Ensure `POSTGRES_PASSWORD` is strong (16+ characters, mixed case, numbers, symbols)

