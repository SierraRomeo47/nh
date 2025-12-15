@echo off
echo ========================================
echo  Starting Backend Services (Docker)
echo ========================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist "docker\.env" (
    echo [ERROR] docker\.env file not found!
    echo.
    echo Creating docker\.env file...
    (
        echo # Nautilus Horizon Environment Variables
        echo # Docker Compose Configuration
        echo.
        echo # Database
        echo POSTGRES_PASSWORD=nautilus_dev_password_2024
        echo.
        echo # Authentication
        echo JWT_SECRET=your_jwt_secret_key_change_this_in_production_12345
        echo.
        echo # Node Environment
        echo NODE_ENV=development
    ) > docker\.env
    echo [SUCCESS] Created docker\.env file
    echo.
)

echo Starting all backend services...
cd docker
docker compose up -d --build
cd ..

echo.
echo ========================================
echo  Backend Services Status
echo ========================================
docker compose -f docker/docker-compose.yml ps

echo.
echo ========================================
echo Services are starting...
echo Wait about 30 seconds for all health checks to pass.
echo.
echo To view logs: docker compose -f docker/docker-compose.yml logs -f
echo To stop:      docker compose -f docker/docker-compose.yml down
echo ========================================
echo.

pause


