# 🚀 Quick Start Guide - Nautilus Horizon

This guide will help you get Nautilus Horizon running locally in under 5 minutes.

## 📋 Prerequisites

Before you begin, ensure you have:

- ✅ **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop/)
- ✅ **Node.js 20+** - [Download here](https://nodejs.org/)
- ✅ **Git** - [Download here](https://git-scm.com/)

## 🎯 Quick Start (2 Commands)

### Option 1: Start Everything at Once (Recommended)

Simply double-click or run:

```bash
start-all-services.bat
```

This script will:
1. ✅ Check Docker is running
2. ✅ Create `.env` file if needed
3. ✅ Start all backend services (Docker)
4. ✅ Wait for services to initialize
5. ✅ Install frontend dependencies
6. ✅ Start frontend development server

**Access the application:**
- Frontend: http://localhost:3000
- API Gateway: http://localhost:8080

**Default Login:**
- Email: `sumit.redu@poseidon.com`
- Password: `password`

---

### Option 2: Start Services Separately

#### Step 1: Start Backend Services

```bash
start-backend.bat
```

Wait about 30 seconds for all services to be healthy.

#### Step 2: Start Frontend (in new terminal)

```bash
start-frontend.bat
```

---

## 🔧 Utility Scripts

### Check Service Status

```bash
check-status.bat
```

Shows Docker container status and health checks for all services.

### View Logs

```bash
view-logs.bat
```

Displays live logs from all backend services (Ctrl+C to exit).

### Stop All Services

```bash
stop-all-services.bat
```

Gracefully stops all Docker containers.

---

## 🐳 Backend Services

The following microservices will start in Docker:

| Service | Port | Health Check | Description |
|---------|------|--------------|-------------|
| **nginx Gateway** | 8080 | - | API Gateway (routes all requests) |
| **Auth** | 3001 | `/auth/health` | Authentication & JWT |
| **Vessels** | 3002 | `/vessels/health` | Vessel management |
| **Voyages** | 3003 | `/voyages/health` | Voyage tracking |
| **Compliance** | 3004 | `/compliance/health` | Compliance monitoring |
| **Trading** | 3005 | `/trading/health` | Emissions trading |
| **Compliance Ledger** | 3006 | `/compliance-ledger/health` | Compliance records |
| **Insurance** | 3007 | `/insurance/health` | Insurance quotes |
| **Master Data** | 3008 | `/master-data/health` | Master data management |
| **PostgreSQL** | 5432 | - | Database |

---

## 🌐 Frontend

The React frontend runs on **Vite** development server:

- **Port:** 3000
- **Hot Reload:** Enabled
- **Technology:** React 19 + TypeScript + Tailwind CSS

---

## 🔐 Test Users

All demo users have the password: `password`

### Administrative Users
- **Admin:** `sumit.redu@poseidon.com` - Full system access
- **Fleet Superintendent:** `fleetsup@nordicmaritime.no` - Complete fleet management
- **Operations Superintendent:** `opssup@nordicmaritime.no` - Operational oversight

### Management Users
- **Fleet Manager:** `manager@nordicmaritime.no` - Fleet operations (10 pages)
- **Compliance Officer:** `compliance@nordicmaritime.no` - Regulatory compliance (10 pages)
- **Trader:** `trader@nordicmaritime.no` - Emissions trading (5 pages)

### Specialized Roles
- **Insurer:** `insurer@poseidon.com` - Insurance quotes (6 pages)
- **MTO (Multimodal Transport):** `mto@poseidon.com` - Logistics coordination (6 pages)

### Vessel Command
- **Captain:** `officer1@aurora.com` - Vessel command (9 pages)
- **Chief Engineer:** `engineer1@aurora.com` - Engineering department (9 pages)

See [README.md](README.md) for complete user list.

---

## 🐛 Troubleshooting

### Problem: "Docker is not running"

**Solution:**
1. Start Docker Desktop
2. Wait for it to fully initialize (whale icon in system tray should be steady)
3. Run the script again

### Problem: "Port already in use"

**Solution:**
```bash
# Check what's using the port
netstat -ano | findstr :3000
netstat -ano | findstr :8080

# Stop the process or change ports in docker-compose.yml
```

### Problem: Services fail health checks

**Solution:**
```bash
# View logs to see what's wrong
view-logs.bat

# Or check specific service
docker compose -f docker/docker-compose.yml logs auth
```

### Problem: Frontend won't start

**Solution:**
```bash
cd nautilus-horizon
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Problem: Database connection errors

**Solution:**
```bash
# Restart with fresh database
stop-all-services.bat

# Then start again
start-all-services.bat
```

---

## 🔍 Verifying Installation

### 1. Check Docker Services

```bash
docker compose -f docker/docker-compose.yml ps
```

All services should show status "Up" and "healthy".

### 2. Test API Gateway

```bash
curl http://localhost:8080/auth/health
```

Should return: `{"status":"healthy"}`

### 3. Test Frontend

Open browser to http://localhost:3000 - you should see the login page.

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────┐
│  Frontend (React + Vite)                    │
│  http://localhost:3000                      │
└─────────────────┬───────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────┐
│  nginx API Gateway                          │
│  http://localhost:8080                      │
└─────────────────┬───────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────┐
│  Microservices (Docker)                     │
│  ├─ auth          (:3001)                   │
│  ├─ vessels       (:3002)                   │
│  ├─ voyages       (:3003)                   │
│  ├─ compliance    (:3004)                   │
│  ├─ trading       (:3005)                   │
│  ├─ comp-ledger   (:3006)                   │
│  ├─ insurance     (:3007)                   │
│  └─ master-data   (:3008)                   │
└─────────────────┬───────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────┐
│  PostgreSQL Database                        │
│  localhost:5432                             │
│  Database: nautilus                         │
└─────────────────────────────────────────────┘
```

---

## 🛠️ Manual Commands

If you prefer using command line directly:

### Start Backend

```bash
cd docker
docker compose up -d --build
```

### Start Frontend

```bash
cd nautilus-horizon
npm install
npm run dev
```

### Stop Everything

```bash
docker compose -f docker/docker-compose.yml down
```

### View Logs

```bash
docker compose -f docker/docker-compose.yml logs -f
```

### Reset Database (WARNING: Deletes all data!)

```bash
docker compose -f docker/docker-compose.yml down -v
docker compose -f docker/docker-compose.yml up -d
```

---

## 📚 Next Steps

After successful startup:

1. **Explore the UI:** Login as different users to see role-based access
2. **Check Documentation:** See [README.md](README.md) for complete feature list
3. **Review Architecture:** Read [.cursor/rules/01-project.mdc](.cursor/rules/01-project.mdc)
4. **Test APIs:** Use tools like Postman or curl to explore endpoints
5. **Run Tests:** See [README.md](README.md#testing) for testing instructions

---

## 🆘 Getting Help

1. Check [Troubleshooting Guide](nautilus-horizon/TROUBLESHOOTING.md)
2. Review [Documentation](docs/)
3. Check service logs: `view-logs.bat`
4. Verify all prerequisites are installed
5. Contact support team

---

## ⚠️ Important Notes

### Development Environment Only

This setup is for **local development only** and includes:
- Demo authentication (shared passwords)
- No encryption at rest
- No MFA
- Exposed ports

**DO NOT use for production data or deploy to public networks!**

### Performance

First startup may take 2-5 minutes to:
- Download Docker images
- Build service containers
- Initialize database
- Run migrations
- Install npm dependencies

Subsequent starts are much faster (~30 seconds).

---

## 🎉 Success!

If everything is working, you should see:

✅ Docker services running and healthy  
✅ Frontend accessible at http://localhost:3000  
✅ Login working with demo credentials  
✅ Navigation between pages working  
✅ API calls returning data  

**Welcome to Nautilus Horizon! 🚢**

---

**Last Updated:** November 14, 2025  
**Version:** 1.3.0


