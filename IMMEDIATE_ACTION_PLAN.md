# ⚡ Immediate Action Plan - Close Critical Gaps

**Goal:** Make Nautilus Horizon production-ready  
**Timeline:** 8-12 weeks  
**Status:** Execution Ready

---

## 🎯 WEEK 1: SECURITY HARDENING (CRITICAL)

### Day 1-2: Authentication Overhaul
**Task:** Replace demo authentication  
**Effort:** 16 hours

```typescript
// Current (INSECURE):
password: "password" for all users
JWT_SECRET: "default-secret-change-in-production"

// Required:
□ Integrate Auth0 or Okta
□ Remove shared passwords
□ Generate secure JWT secrets (256-bit minimum)
□ Implement password complexity rules
□ Add account lockout after 5 failed attempts
```

**Files to Modify:**
- `services/auth/src/services/auth.service.ts`
- `services/auth/src/crypto/jwt.ts`
- `docker/.env` (generate real secrets)

---

### Day 3: Enable MFA
**Task:** Implement Multi-Factor Authentication  
**Effort:** 8 hours

```
□ Setup TOTP (Google Authenticator, Authy)
□ Add MFA enrollment flow
□ Add MFA verification on login
□ Add backup codes generation
□ Test MFA flow end-to-end
```

**Files to Create:**
- `services/auth/src/services/mfa.service.ts`
- `nautilus-horizon/pages/MFASetup.tsx`

---

### Day 4: TLS/HTTPS Setup
**Task:** Enable encryption in transit  
**Effort:** 8 hours

```
□ Generate SSL certificates (Let's Encrypt)
□ Configure nginx for HTTPS
□ Force HTTPS redirect
□ Update CORS for HTTPS
□ Add security headers (HSTS, CSP)
□ Test all connections over HTTPS
```

**Files to Modify:**
- `nginx/nginx.conf`
- `docker/docker-compose.yml`

---

### Day 5: Database Encryption & Backups
**Task:** Secure data at rest  
**Effort:** 8 hours

```
□ Enable PostgreSQL encryption at rest
□ Setup automated daily backups
□ Configure point-in-time recovery
□ Test backup restoration
□ Document backup procedures
```

**Commands:**
```bash
# Setup automated backups
docker exec nh_db pg_dump -U postgres nautilus > backup_$(date +%Y%m%d).sql

# Create backup cron job
0 2 * * * /usr/local/bin/backup-db.sh
```

---

### Day 6-7: Audit Logging
**Task:** Implement comprehensive audit trail  
**Effort:** 16 hours

```sql
-- Create audit_log table
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    operation VARCHAR(10) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    user_id UUID,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Add triggers to all critical tables
CREATE TRIGGER audit_trigger_ships
AFTER INSERT OR UPDATE OR DELETE ON ships
FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
```

```
□ Create audit_log table
□ Implement audit trigger function
□ Add triggers to: users, ships, voyages, organizations
□ Create audit log viewer UI (Admin only)
□ Test audit trail completeness
```

**Files to Create:**
- `database/migrations/011_audit_logging.sql`
- `nautilus-horizon/pages/AuditLog.tsx`
- `services/auth/src/middleware/audit.middleware.ts`

---

**Week 1 Deliverable:** ✅ System secure for pilot deployment with real users

---

## 🎯 WEEK 2-3: CORE SERVICE COMPLETION

### Week 2, Day 1-3: Complete Compliance Service
**Effort:** 24 hours

```typescript
// Implement missing endpoints
□ POST /api/compliance/calculate → Calculate vessel compliance
□ GET /api/compliance/alerts → Get compliance alerts
□ GET /api/compliance/deadlines → Get regulatory deadlines
□ POST /api/compliance/verify → Submit for verification
□ GET /api/compliance/status/:vesselId → Vessel compliance status
```

**Create:**
```
services/compliance/src/
  controllers/compliance.controller.ts
  services/compliance-calculation.service.ts
  services/alert.service.ts
  repositories/compliance.repo.ts
  tests/compliance.service.test.ts (target: 15 tests)
```

---

### Week 2, Day 4-5: Trading Service - RFQ & Portfolio
**Effort:** 16 hours

```typescript
// Implement RFQ management
□ GET /api/rfqs → List all RFQs
□ POST /api/rfqs → Create RFQ
□ GET /api/rfqs/:id → Get RFQ details
□ POST /api/rfqs/:id/offers → Submit offer
□ PUT /api/rfqs/:id/accept → Accept offer

// Implement Portfolio
□ GET /api/portfolio → Get portfolio positions
□ POST /api/portfolio → Add position
□ PUT /api/portfolio/:id → Update position
```

**Populate Data:**
```sql
-- Add 5 sample RFQs
INSERT INTO pool_rfqs (organization_id, reporting_year, need_gco2e, price_range_min, price_range_max, status)
VALUES (...);
```

---

### Week 3, Day 1-2: Master Data Service Completion
**Effort:** 16 hours

```typescript
// Add missing endpoints
□ GET /api/organizations → List organizations
□ GET /api/ports?search=rotterdam → Search ports
□ GET /api/fleets → List fleets
□ POST /api/fleets → Create fleet
□ PUT /api/fleets/:id/vessels → Assign vessels to fleet
```

**Import Data:**
```python
# Import UN/LOCODE port data
python scripts/import_ports.py
# Result: ~10,000 ports in database
```

---

### Week 3, Day 3-5: Testing Sprint
**Effort:** 24 hours

```
□ Add unit tests for vessels service (target: 10 tests)
□ Add unit tests for voyages service (target: 15 tests)
□ Add unit tests for trading service (target: 10 tests)
□ Add integration tests for all API endpoints (target: 20 tests)
□ Add E2E tests for critical flows (target: 5 tests)
□ Setup coverage reporting in CI

Current Coverage: 20%
Target Coverage: 60%
Tests to Write: ~60 tests
```

**Test Files to Create:**
```
services/vessels/tests/vessels.service.test.ts
services/voyages/tests/voyages.service.test.ts
services/voyages/tests/voyages.api.test.ts
services/trading/tests/trading.service.test.ts
tests/e2e/login.test.ts
tests/e2e/create-user.test.ts
tests/e2e/create-voyage.test.ts
```

---

**Week 2-3 Deliverable:** ✅ All core services functional with adequate test coverage

---

## 🎯 WEEK 4: INFRASTRUCTURE & MONITORING

### Day 1-2: CI/CD Pipeline
**Effort:** 16 hours

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline
on: [push, pull_request]
jobs:
  test:
    - npm test
    - npm run lint
    - npm run typecheck
  security:
    - npm audit
    - Snyk scan
  deploy:
    - Build Docker images
    - Deploy to staging
    - Run smoke tests
```

```
□ Create GitHub Actions workflow
□ Add automated testing
□ Add security scanning
□ Add automated deployment to staging
□ Add manual approval for production
```

---

### Day 3: Monitoring Setup
**Effort:** 8 hours

```
□ Setup Sentry for error tracking
□ Add structured logging (Winston or Pino)
□ Setup log aggregation (CloudWatch or ELK)
□ Create health check dashboard
□ Add performance monitoring
□ Configure alerting (email, Slack)
```

**Integration:**
```typescript
// Add to all services
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

---

### Day 4-5: Database Improvements
**Effort:** 16 hours

```sql
-- Create missing critical tables
□ Create audit_log table with triggers
□ Create compliance_alerts table
□ Create verifiers table
□ Create verifications table
□ Add CHECK constraints for validation
□ Add missing indexes for performance
□ Test database performance with large dataset
```

**Populate Data:**
```
□ Import 10,000 ports from UN/LOCODE
□ Create 5 default fleets
□ Assign vessels to fleets
□ Generate 100 sample fuel consumption records
□ Generate 15 compliance records (1 per vessel)
□ Create 5 sample RFQs
□ Generate 3 insurance quotes
```

---

**Week 4 Deliverable:** ✅ Production-grade infrastructure and monitoring

---

## 🚀 QUICK WINS (Can Do Today)

### 15-Minute Tasks:
```
□ Delete 9 duplicate App.tsx files
□ Delete duplicate UserContext files
□ Create .env.example files
□ Add LICENSE file
□ Update README with current status
```

### 1-Hour Tasks:
```
□ Enable TypeScript strict mode
□ Fix all TypeScript 'any' types in mockApi.ts
□ Add loading states to all async operations
□ Add error boundaries to all major components
□ Create health check dashboard page
```

### 2-Hour Tasks:
```
□ Create 5 default fleets in database
□ Generate 3 sample insurance quotes
□ Populate RFQ Board with 5 sample RFQs
□ Add 100 sample fuel consumption records
□ Create compliance records for all 15 vessels
```

### 1-Day Tasks:
```
□ Import UN/LOCODE port data (10,000 ports)
□ Generate OpenAPI spec for one service
□ Add 10 unit tests to vessels service
□ Setup Sentry error tracking
□ Create operational runbook
```

---

## 📋 This Week's Action Items

### Monday: Security Audit
```
Morning:
□ Audit all authentication flows
□ Document security vulnerabilities
□ Plan OAuth2 integration approach

Afternoon:
□ Generate secure JWT secrets
□ Update environment variables
□ Test with new secrets
```

### Tuesday-Wednesday: OAuth2 Implementation
```
□ Setup Auth0 or Okta account
□ Implement OAuth2 flow
□ Update login page
□ Test authentication end-to-end
□ Update all demo users with real emails
```

### Thursday: MFA & Rate Limiting
```
□ Implement TOTP-based MFA
□ Add MFA enrollment flow
□ Add rate limiting middleware
□ Test login with MFA
```

### Friday: Audit Logging & Backups
```
□ Create audit_log table
□ Implement audit triggers
□ Setup automated backups
□ Test backup restoration
□ Document security improvements
```

---

## 🎯 Success Criteria

### Week 1 Success:
- ✅ No demo passwords remain
- ✅ MFA enabled and tested
- ✅ HTTPS enforced
- ✅ Audit log functional
- ✅ Backups running
- ✅ Security scan passing

### Week 2-3 Success:
- ✅ Compliance service operational
- ✅ RFQ management working
- ✅ Test coverage > 60%
- ✅ All core services have tests
- ✅ Integration tests passing

### Week 4 Success:
- ✅ CI/CD pipeline operational
- ✅ Monitoring active
- ✅ All critical data populated
- ✅ Health dashboard available
- ✅ Deployment documented

### Overall Success (Week 8-12):
- ✅ Production Readiness Score > 85%
- ✅ Security audit passed
- ✅ Load testing passed
- ✅ External integrations working
- ✅ **READY FOR PRODUCTION DEPLOYMENT** 🚀

---

## 📞 Need Help?

### Critical Issues (Block Production):
1. Security hardening
2. External API integrations (THETIS MRV)
3. Audit logging
4. Test coverage

### High Priority (Needed Soon):
5. Complete compliance service
6. RFQ & portfolio implementation
7. CI/CD setup
8. Monitoring implementation

### Can Wait:
9. Mobile optimization
10. PWA features
11. IoT integrations
12. Performance tuning (for current scale)

---

**Start with Security (Week 1). Everything else can wait, but security cannot.**

**This plan gets you to production in 8-12 weeks with focused effort.**

---

**Created:** December 2, 2025  
**Priority:** Execute Week 1 security tasks IMMEDIATELY  
**Next Review:** After Week 1 completion

