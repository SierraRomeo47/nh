# Architecture Decision Records

## ADR-001: Service Decomposition

**Decision**: Split application into microservices (auth, vessels, voyages, compliance, trading, insurance, master-data)

**Rationale**:
- Independent scaling of services
- Technology flexibility per service
- Clear service boundaries
- Easier team ownership

**Trade-offs**:
- Increased operational complexity
- Network latency between services
- More deployment units to manage

## ADR-002: Docker Compose for Backend Services

**Decision**: Use Docker Compose to orchestrate all backend services on a single Hetzner server

**Rationale**:
- Cost-effective for 4GB RAM server
- Simplified networking (internal Docker network)
- Single deployment unit
- Easy local development

**Trade-offs**:
- All services share same host (no isolation)
- Single point of failure for infrastructure
- Resource contention possible

## ADR-003: Coolify for Backend Deployment

**Decision**: Deploy backend services via Coolify on Hetzner

**Rationale**:
- Self-hosted alternative to Heroku/Vercel
- Full control over infrastructure
- Cost-effective (single server)
- Git-based deployments
- Built-in SSL/TLS

**Trade-offs**:
- Requires server management
- Manual scaling (vertical only)
- Single server = single point of failure

## ADR-004: Vercel for Frontend Deployment

**Decision**: Deploy frontend to Vercel

**Rationale**:
- Optimized for static sites and React
- Global CDN
- Automatic HTTPS
- Zero-config deployments
- Free tier sufficient for MVP

**Trade-offs**:
- Vendor lock-in
- Limited server-side capabilities
- Cold starts for serverless functions

## ADR-005: Shared PostgreSQL Database

**Decision**: All services share single PostgreSQL database

**Rationale**:
- Simpler setup and management
- ACID transactions across services
- Single backup target
- Cost-effective

**Trade-offs**:
- Database becomes bottleneck
- Schema coupling between services
- Single point of failure
- Migration coordination needed

**Future Consideration**: Move to service-specific databases if scaling issues arise

## ADR-006: Nginx as API Gateway

**Decision**: Use Nginx as reverse proxy/gateway for all services

**Rationale**:
- Single entry point for frontend
- CORS handling centralized
- Request routing and load balancing
- SSL/TLS termination

**Trade-offs**:
- Additional service to manage
- Single point of failure for API access
- Manual configuration required

## ADR-007: Environment Variable Standardization

**Decision**: Use `DB_URL` for most services, `DATABASE_URL` for Prisma services

**Rationale**:
- Prisma convention requires `DATABASE_URL`
- Other services use `DB_URL` for consistency
- Docker Compose provides both for compatibility

**Implementation**: 
- Services using `pg` Pool: `DB_URL`
- Services using Prisma: `DATABASE_URL`
- Docker Compose sets both from same source

## ADR-008: Production Builds in Docker

**Decision**: All Dockerfiles use multi-stage builds with production optimizations

**Rationale**:
- Smaller image sizes
- No dev dependencies in production
- TypeScript compilation at build time
- Faster container startup

**Implementation**:
- Builder stage: Install all deps, compile TypeScript
- Production stage: Install production deps only, copy compiled code

## ADR-009: Resource Limits for 4GB RAM

**Decision**: Set memory limits per service to fit within 4GB constraint

**Allocation**:
- Database: 1024M limit, 512M reservation
- Each service: 384M limit, 256M reservation
- Gateway: 128M limit, 64M reservation
- Total: ~3.2GB reserved, leaving 800MB for OS and overhead

**Rationale**:
- Prevents OOM kills
- Predictable resource usage
- Allows all services to run simultaneously

## ADR-010: Auth Service on Vercel (Optional)

**Decision**: Auth service can be deployed to Vercel OR kept on Coolify

**Rationale**:
- Vercel provides serverless scaling
- But requires public database access
- Coolify keeps everything on private network

**Recommendation**: Keep auth on Coolify for security (private DB access)

**If using Vercel**:
- Use connection pooler (PgBouncer, Supabase)
- Or public database with firewall rules
- Ensure `DB_URL` points to accessible database

## ADR-011: Service Health Checks

**Decision**: All services expose `/health` endpoint with Docker healthchecks

**Rationale**:
- Coolify uses healthchecks for dependency management
- Services wait for DB to be healthy before starting
- Easy monitoring and debugging

**Implementation**:
- Healthcheck uses `wget` (installed in all Dockerfiles)
- Checks every 10s with 3s timeout
- 10 retries before marking unhealthy

## ADR-012: CORS Configuration

**Decision**: Support multiple origins via nginx map and service-level CORS

**Rationale**:
- Frontend on Vercel needs to call backend on Coolify
- Development needs localhost support
- Production needs domain support

**Implementation**:
- Nginx map checks Origin header
- Allows localhost, Vercel domains, and custom domains
- Services also check `ALLOWED_ORIGINS` env var

## ADR-013: Unused Services

**Decision**: Services like `api-gateway`, `market-data`, `pooling-rfq`, etc. exist but not in docker-compose

**Rationale**:
- Planned for future implementation
- Not yet needed for MVP
- Kept in repo for reference

**Action**: Document which services are active vs planned

## ADR-014: TypeScript Configuration

**Decision**: Each service has its own `tsconfig.json` with test exclusions

**Rationale**:
- Services are independent
- Build processes don't need test files
- Prevents build errors in production

**Implementation**:
- `include`: `["src/**/*"]`
- `exclude`: `["tests", "**/*.test.ts", "vitest.config.ts", "tsconfig.json"]`

