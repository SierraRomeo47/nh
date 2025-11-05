# Nautilus Horizon v1.3 - Quick Start Guide
**Last Updated:** November 5, 2025

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- Docker Desktop installed and running
- Node.js 20+ installed
- Git (to clone repository)

### Start the Application

**Step 1: Start Backend Services**
```bash
cd docker
docker compose up -d
```

Wait ~30 seconds for all services to be healthy.

**Step 2: Start Frontend**
```bash
cd nautilus-horizon
npm run dev
```

**Step 3: Open Browser**
Navigate to: http://localhost:3000

**Step 4: Login**
```
Email: sumit.redu@poseidon.com
Password: password
```

**You're in!** 🎉

---

## 👥 Test All Roles

### Available Demo Users
All users share password: `password`

#### Administrative Roles
```
Admin:           sumit.redu@poseidon.com
Ops Super:       opssuper@poseidon.com
Tech Super:      techsuper@poseidon.com
Fleet Super:     (create via user management)
```

#### Management Roles
```
Fleet Manager:   manager@nordicmaritime.no
Compliance Mgr:  compliance@nordicmaritime.no
Trader:          trader@nordicmaritime.no
```

#### Specialized Roles ⭐
```
Insurer:         insurer@poseidon.com        (NEW)
MTO:             mto@poseidon.com            (NEW)
```

#### Vessel Command
```
Captain:         officer1@aurora.com
Chief Engineer:  engineer1@aurora.com
```

#### Officers & Crew
```
2nd Officer:     officer2@aurora.com
2nd Engineer:    engineer2@aurora.com
Able Seaman:     crew1@aurora.com
Ord Seaman:      crew2@aurora.com
```

### Switch Users
1. Click your avatar (top right)
2. Click "Switch User" or logout
3. Login with different credentials
4. Observe different pages and permissions

---

## 🛡️ Test Insurance Module

1. Login as: `insurer@poseidon.com` / `password`
2. Navigate to: **Insurance Quotes**
3. Click: **+ New Quote**
4. Fill in vessel details:
   - Vessel Name: "MV Test Vessel"
   - Vessel Type: Container Ship
   - Age: 5 years
   - Tonnage: 50,000 GT
   - Origin: Singapore
   - Destination: Rotterdam
   - Select coverage types
5. Click: **Generate Quote**
6. View risk assessment and premium
7. Click: **Accept & Issue Policy**

**Expected Result:** Quote status changes from QUOTED to ACCEPTED

---

## 🚢 Test MTO Role

1. Login as: `mto@poseidon.com` / `password`
2. Verify you see:
   - ✅ Dashboard
   - ✅ Fleet Management
   - ✅ Voyages
   - ✅ Compliance
   - ✅ Fuel Efficiency
   - ✅ Route Planning (Scenario Pad)
3. Navigate through pages
4. Verify appropriate data visibility

---

## 👤 Test User Management

1. Login as Admin: `sumit.redu@poseidon.com` / `password`
2. Navigate to: **User Management**
3. Observe:
   - Statistics dashboard
   - User table with 12+ users
   - Search and filter controls

**Try These Actions:**
- **Search:** Type a name in search box
- **Filter:** Select "Maritime Insurer" from dropdown
- **View Permissions:** Click "View (16)" on any user
- **Export Backup:** Click "📥 Export Backup"
- **Add User:** Click "+ Add User" (see form with all roles)
- **Edit User:** Click "Edit" on any user
- **Try Delete Admin:** Try to delete yourself (should be blocked)

**Expected Results:**
- Last admin warning appears
- Cannot delete or change role of last admin
- Export downloads JSON file
- Permission viewer shows categorized permissions

---

## 🔍 Verify Backend Services

### Check Service Health
```bash
# All services status
cd docker
docker compose ps

# Auth service health
curl http://localhost:8080/auth/health

# Should return:
# {"status":"ok","service":"auth"}
```

### Test User API
```bash
# Get all users (requires auth token)
curl -H "Authorization: Bearer mock-token" \
  http://localhost:8080/auth/api/users

# Get user statistics
curl -H "Authorization: Bearer mock-token" \
  http://localhost:8080/auth/api/users/stats
```

---

## 🧪 Run Tests

### Frontend Tests
```bash
cd nautilus-horizon

# Run all tests
npm test

# Run insurance service tests
npm test insuranceService.test.ts

# Run with coverage
npm test -- --coverage
```

### Backend Tests
```bash
cd services/auth

# Run auth service tests
npm test

# With coverage
npm test -- --coverage
```

---

## 🐛 Troubleshooting

### Services Won't Start
```bash
# Check Docker is running
docker ps

# Check for port conflicts
netstat -ano | findstr "3000"
netstat -ano | findstr "8080"

# Restart all services
cd docker
docker compose down
docker compose up -d --build
```

### Frontend Won't Load
```bash
# Check frontend is running
netstat -ano | findstr "3000"

# Restart frontend
cd nautilus-horizon
# Kill existing process if running
npm run dev
```

### Can't Login
- Verify email exactly matches demo users
- Password is always: `password` (lowercase)
- Clear browser localStorage if needed
- Check browser console for errors

### Missing Pages in Navigation
- Verify you're logged in as the correct role
- Check user role in top-right profile
- Use user switcher to change roles
- Admin sees ALL pages

---

## 📖 Key Features Guide

### For Admins
**User Management:**
1. Go to User Management page
2. View all users in organization
3. Create new users with any role
4. Edit user details and roles
5. View permissions for any user
6. Export backup for disaster recovery
7. **Protected:** Cannot delete yourself if last admin

### For Insurers
**Generate Insurance Quotes:**
1. Go to Insurance Quotes page
2. Click "+ New Quote"
3. Enter vessel and voyage details
4. Select coverage types
5. Review risk assessment
6. Generate quote
7. Review premium breakdown
8. Accept quote to issue policy

### For MTO
**Logistics Coordination:**
1. View fleet overview
2. Monitor active voyages
3. Access route planning tools
4. Track fuel efficiency
5. Monitor compliance status
6. Plan optimal intermodal routes

### For All Users
**Profile Management:**
1. Click avatar (top right)
2. Go to Profile Settings
3. Update preferences
4. Customize dashboard
5. Change theme (if implemented)

---

## 🔐 Security Notes

### Current Security Posture
⚠️ **DEMO ENVIRONMENT ONLY**
- Shared passwords
- No encryption
- No MFA
- Local storage only
- Not suitable for production data

### Before Production
✅ **Must Implement:**
1. OAuth2/OIDC authentication
2. Multi-factor authentication
3. JWT with refresh tokens
4. Audit logging
5. Encryption (TLS 1.3 + AES-256)
6. Security scanning in CI
7. Regular security audits

---

## 📊 Monitoring & Logs

### View Service Logs
```bash
cd docker

# All services
docker compose logs -f

# Specific service
docker compose logs -f auth
docker compose logs -f trading
docker compose logs -f db
```

### Check Database
```bash
# Connect to database
docker compose exec db psql -U postgres -d nautilus

# List users
SELECT id, email, role, is_active FROM users;

# Count by role
SELECT role, COUNT(*) FROM users GROUP BY role;

# Exit
\q
```

---

## 🎨 UI Customization

### Current Theme
- Dark mode (default)
- Orange accent color (#FF6A00)
- Professional maritime aesthetic

### Customizable Elements
- Dashboard widgets (per role)
- Widget positions
- Data visibility flags
- Navigation preferences

---

## 📱 Supported Features

### ✅ Fully Working
- User authentication (demo mode)
- Role-based access control
- Dashboard customization
- Fleet overview
- Voyage management
- Compliance monitoring
- Trading opportunities
- Market data display
- RFQ board
- Crew tasks and league
- **Insurance quotes** ⭐
- **User management** ⭐
- Fuel logging and consumption
- Engine status monitoring
- Maintenance tracking

### ⚠️ Partially Working
- EUA price ticker (free-tier API, limited updates)
- Verifier workflow (UI only, no backend integration)
- Pooling RFQ (UI only, no execution)

### ❌ Not Yet Implemented
- THETIS MRV integration
- Union Registry connection
- Live sensor data
- AI optimization
- Production authentication
- Audit log viewer
- Mobile application

---

## 🎯 Success Indicators

### You Know It's Working When:
- ✅ All 8 Docker containers show "healthy"
- ✅ Frontend loads at http://localhost:3000
- ✅ You can login with any demo user
- ✅ Navigation changes based on role
- ✅ EUA price shows in header
- ✅ User Management shows 12+ users
- ✅ Insurance Quotes generates valid premiums
- ✅ MTO role shows 6 pages
- ✅ Admin sees Insurance Quotes in menu
- ✅ Cannot delete last admin

---

## 📞 Support

### Resources
- Architecture: `.cursor/rules/01-project.mdc`
- RBAC Details: `RBAC_CONFIGURATION.md`
- Troubleshooting: `nautilus-horizon/TROUBLESHOOTING.md`
- API Contract: `nautilus-horizon/database/API_CONTRACT.md`
- Security: `SECURITY.md`

### Common Commands
```bash
# Full restart
docker compose down && docker compose up -d --build

# View all running processes
docker compose ps

# Stop everything
docker compose down

# Clean everything (careful!)
docker compose down -v  # Deletes database!
```

---

**Happy Sailing! ⚓**

