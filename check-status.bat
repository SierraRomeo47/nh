@echo off
echo ========================================
echo  Service Status Check
echo ========================================
echo.

echo Docker Services:
echo ========================================
docker compose -f docker/docker-compose.yml ps
echo.

echo Health Checks:
echo ========================================
echo Checking Auth Service...
curl -s http://localhost:8080/auth/health || echo [FAILED] Auth service not responding

echo.
echo Checking Vessels Service...
curl -s http://localhost:8080/vessels/health || echo [FAILED] Vessels service not responding

echo.
echo Checking Voyages Service...
curl -s http://localhost:8080/voyages/health || echo [FAILED] Voyages service not responding

echo.
echo Checking Compliance Service...
curl -s http://localhost:8080/compliance/health || echo [FAILED] Compliance service not responding

echo.
echo Checking Trading Service...
curl -s http://localhost:8080/trading/health || echo [FAILED] Trading service not responding

echo.
echo ========================================
echo  Status Check Complete
echo ========================================
echo.

pause


