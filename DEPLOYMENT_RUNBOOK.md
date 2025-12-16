# Deployment Runbook

Complete guide for deploying Nautilus Horizon to Coolify (Hetzner) and Vercel.

## Prerequisites

- Hetzner server with 4GB+ RAM, Ubuntu 22.04+
- Domain name with DNS access
- GitHub repository access
- Coolify account
- Vercel account

## Part 1: Hetzner Server Setup

### 1.1 Initial Server Configuration

```bash
# SSH into server
ssh root@YOUR_HETZNER_IP

# Update system
apt update && apt upgrade -y
timedatectl set-timezone UTC

# Install basic tools
apt install -y vim htop curl git ufw

# Configure firewall
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
ufw status
```

### 1.2 Install Docker

```bash
curl -fsSL https://get.docker.com | sh
docker --version
docker compose version
```

### 1.3 Install Coolify

```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

After installation, access Coolify at `http://YOUR_HETZNER_IP:8000`

### 1.4 Configure Coolify Panel Domain (Optional but Recommended)

1. Create DNS A record: `coolify.yourdomain.com` → `YOUR_HETZNER_IP`
2. In Coolify Settings → General, set panel domain
3. Enable Let's Encrypt for HTTPS

## Part 2: Coolify Application Setup

### 2.1 Connect Git Repository

1. In Coolify → Resources → Git Sources
2. Add GitHub/GitLab provider with personal access token
3. Verify repository access

### 2.2 Create Docker Compose Application

1. Projects → New Project → "Nautilus Horizon"
2. New Resource → Docker Compose
3. Select repository: `SierraRomeo47/nh`
4. Branch: `main`
5. Compose file path: `docker-compose.yml` (root)

### 2.3 Configure Environment Variables

1. In application → Environment Variables
2. Create environment group `nautilus-prod` with:

```bash
NODE_ENV=production
POSTGRES_PASSWORD=<generate-strong-password>
JWT_SECRET=<generate-32-char-secret>
JWT_REFRESH_SECRET=<generate-32-char-secret>
ALLOWED_ORIGINS=https://your-vercel-domain.vercel.app,https://nautilushorizon.com
```

3. Attach environment group to Docker Compose application

### 2.4 Configure Domain and HTTPS

1. In application → Domains
2. Add domain: `api.nautilushorizon.com` (for gateway service)
3. Enable HTTPS / Let's Encrypt
4. Create DNS A record: `api.nautilushorizon.com` → `YOUR_HETZNER_IP`

### 2.5 Deploy

1. Click "Deploy" or trigger via Git push
2. Monitor logs for:
   - Database healthcheck passing
   - All services becoming healthy
   - No critical errors

## Part 3: Vercel Frontend Setup

### 3.1 Deploy Frontend

1. In Vercel → New Project
2. Import repository: `SierraRomeo47/nh`
3. Root directory: `nautilus-horizon`
4. Framework: Vite/React (auto-detected)

### 3.2 Configure Environment Variables

In Vercel project settings → Environment Variables:

```bash
VITE_API_URL=https://api.nautilushorizon.com
# or
NEXT_PUBLIC_API_URL=https://api.nautilushorizon.com
```

### 3.3 Configure Custom Domain (Optional)

1. In Vercel → Domains
2. Add `nautilushorizon.com` or `www.nautilushorizon.com`
3. Update DNS records as instructed

## Part 4: Database Migrations

### 4.1 Initial Database Setup

If using Prisma services (auth, compliance-ledger):

```bash
# SSH into Hetzner server
ssh root@YOUR_HETZNER_IP

# Access database container
docker exec -it nh_db psql -U postgres -d nautilus

# Or run migrations via service containers
docker exec -it nh_auth npx prisma migrate deploy
docker exec -it nh_compliance_ledger npx prisma migrate deploy
```

### 4.2 Seed Data (Optional)

```bash
# If seed scripts exist
docker exec -it nh_master_data npm run seed
```

## Part 5: Verification

### 5.1 Health Checks

```bash
# From your local machine
curl https://api.nautilushorizon.com/health

# Should return: {"status":"ok","message":"Nautilus Horizon API Gateway",...}
```

### 5.2 Service Health

In Coolify → Application → Logs, verify all services show "healthy"

### 5.3 Frontend Integration

1. Open frontend URL (Vercel domain)
2. Check browser console for API calls
3. Verify no CORS errors
4. Test authentication flow

## Part 6: Troubleshooting

### Database Container Unhealthy

```bash
# Check database logs
docker logs nh_db

# Common issues:
# - Insufficient disk space
# - Permission issues on volume
# - PostgreSQL initialization errors
```

### Service Won't Start

```bash
# Check service logs in Coolify
# Common issues:
# - Missing environment variables
# - Database connection failures
# - Port conflicts
```

### CORS Errors

1. Verify `ALLOWED_ORIGINS` includes your frontend domain
2. Check nginx.conf CORS map configuration
3. Verify frontend uses correct API URL

### Memory Issues (4GB RAM)

```bash
# Monitor memory usage
docker stats

# If services are being killed:
# - Reduce service memory limits in docker-compose.yml
# - Consider disabling non-critical services
# - Upgrade server RAM
```

## Part 7: Backup Strategy

### 7.1 Database Backups

```bash
# Manual backup
docker exec nh_db pg_dump -U postgres nautilus | gzip > backup-$(date +%F).sql.gz

# Automated backup (add to crontab)
0 2 * * * docker exec nh_db pg_dump -U postgres nautilus | gzip > /var/backups/nautilus-$(date +\%F).sql.gz
```

### 7.2 Volume Backups

Coolify handles volume persistence automatically. For manual backups:

```bash
# Backup volume
docker run --rm -v nh_pgdata:/data -v $(pwd):/backup alpine tar czf /backup/pgdata-backup.tar.gz /data
```

## Part 8: Monitoring

### 8.1 Coolify Monitoring

- Use Coolify's built-in logs viewer
- Set up notifications for deployment failures
- Monitor resource usage in Coolify dashboard

### 8.2 External Monitoring

- Set up UptimeRobot or similar for `https://api.nautilushorizon.com/health`
- Monitor frontend domain
- Set up alerts for downtime

## Part 9: Updates and Maintenance

### 9.1 Deploying Updates

1. Push changes to `main` branch
2. Coolify auto-deploys (if enabled) or manually trigger
3. Monitor deployment logs
4. Verify health checks pass

### 9.2 Rolling Back

1. In Coolify → Deployments
2. Find previous successful deployment
3. Click "Redeploy"

### 9.3 Database Migrations

Always test migrations in staging first:

```bash
# Run migrations
docker exec -it nh_auth npx prisma migrate deploy
```

## Part 10: Security Checklist

- [ ] All secrets in environment variables (not in code)
- [ ] Database port not exposed publicly (removed from docker-compose)
- [ ] HTTPS enabled for all domains
- [ ] CORS configured for production domains only
- [ ] Strong passwords and secrets (32+ characters)
- [ ] Firewall configured (only 22, 80, 443 open)
- [ ] Regular security updates applied
- [ ] Backups configured and tested

