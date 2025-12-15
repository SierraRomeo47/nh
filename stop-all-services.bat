@echo off
echo ========================================
echo  Stopping All Services
echo ========================================
echo.

echo Stopping Docker services...
docker compose -f docker/docker-compose.yml down

echo.
echo ========================================
echo  All services stopped!
echo ========================================
echo.
echo To remove all data (WARNING: Destructive!):
echo   docker compose -f docker/docker-compose.yml down -v
echo.

pause


