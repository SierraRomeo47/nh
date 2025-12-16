# Pre-Deployment Checklist

Use this checklist before every production deployment.

## Code Quality

- [ ] All TypeScript compilation errors resolved
- [ ] No linter errors (ESLint passes)
- [ ] All tests pass (if applicable)
- [ ] No hardcoded secrets in code
- [ ] Environment variables properly referenced

## Docker Configuration

- [ ] All Dockerfiles use production builds (not dev mode)
- [ ] Multi-stage builds implemented
- [ ] `wget` installed in all Dockerfiles (for healthchecks)
- [ ] Ports match between Dockerfiles and docker-compose.yml
- [ ] Prisma services generate client in build step

## Docker Compose

- [ ] `NODE_ENV` set to `production` (or uses env var)
- [ ] All services have `DB_URL` environment variable
- [ ] Prisma services have both `DB_URL` and `DATABASE_URL`
- [ ] Database port not exposed publicly (removed)
- [ ] Resource limits set appropriately for 4GB RAM
- [ ] Healthchecks configured for all services
- [ ] Nginx config path correct (`./nginx.conf`)

## Environment Variables

- [ ] `POSTGRES_PASSWORD` is strong (16+ characters)
- [ ] `JWT_SECRET` is strong (32+ characters)
- [ ] `JWT_REFRESH_SECRET` is strong (32+ characters)
- [ ] `ALLOWED_ORIGINS` includes production frontend domain
- [ ] All required env vars set in Coolify
- [ ] No default/weak passwords in production

## Database

- [ ] Database migrations tested locally
- [ ] Prisma schema up to date
- [ ] Database backup strategy in place
- [ ] Connection strings use environment variables (not hardcoded)

## Networking & Security

- [ ] CORS configured for production domains
- [ ] Database not exposed publicly
- [ ] Firewall rules configured (22, 80, 443 only)
- [ ] HTTPS enabled for all domains
- [ ] SSL certificates valid and auto-renewing

## DNS Configuration

- [ ] API domain (`api.nautilushorizon.com`) points to Hetzner IP
- [ ] Frontend domain points to Vercel
- [ ] DNS records propagated (check with `nslookup`)

## Service Health

- [ ] All services have `/health` endpoints
- [ ] Healthcheck commands work (`wget` available)
- [ ] Services can connect to database
- [ ] Services can communicate via Docker network

## Documentation

- [ ] Deployment runbook updated
- [ ] Environment variables documented
- [ ] Architecture decisions documented
- [ ] Troubleshooting guide available

## Testing

- [ ] Local `docker compose up` succeeds
- [ ] All services become healthy
- [ ] Health endpoints return 200
- [ ] API endpoints respond correctly
- [ ] Frontend can call backend (CORS works)

## Monitoring

- [ ] Logging configured
- [ ] Error tracking set up (if applicable)
- [ ] Uptime monitoring configured
- [ ] Alerts configured for critical failures

## Backup & Recovery

- [ ] Database backup tested
- [ ] Backup restore procedure documented
- [ ] Volume persistence verified
- [ ] Disaster recovery plan exists

## Post-Deployment Verification

After deployment, verify:

- [ ] All containers show "healthy" in Coolify
- [ ] `https://api.nautilushorizon.com/health` returns 200
- [ ] Frontend loads and can call API
- [ ] No CORS errors in browser console
- [ ] Authentication flow works
- [ ] Database queries succeed
- [ ] Logs show no critical errors

## Rollback Plan

- [ ] Know how to rollback in Coolify (previous deployment)
- [ ] Know how to rollback in Vercel (previous deployment)
- [ ] Database migration rollback procedure documented
- [ ] Test rollback process in staging first

