@echo off
echo ========================================
echo  Viewing Service Logs
echo ========================================
echo.
echo Press Ctrl+C to stop viewing logs
echo.

docker compose -f docker/docker-compose.yml logs -f --tail=100

pause


