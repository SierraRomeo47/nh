@echo off
echo ========================================
echo  Nautilus Horizon - Starting All Services
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

echo Step 1/3: Starting Backend Services (Docker)...
echo ========================================
cd docker
docker compose up -d --build
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start Docker services!
    cd ..
    pause
    exit /b 1
)
cd ..
echo [SUCCESS] Backend services started!
echo.

echo Waiting 15 seconds for services to initialize...
timeout /t 15 /nobreak >nul

echo Step 2/3: Checking service health...
echo ========================================
docker compose -f docker/docker-compose.yml ps
echo.

echo Step 3/3: Starting Frontend...
echo ========================================
cd nautilus-horizon

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install dependencies!
        cd ..
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo  ALL SERVICES STARTED SUCCESSFULLY!
echo ========================================
echo.
echo Backend Services (Docker):
echo   - API Gateway:         http://localhost:8080
echo   - Auth Service:        http://localhost:8080/auth
echo   - Vessels Service:     http://localhost:8080/vessels
echo   - Voyages Service:     http://localhost:8080/voyages
echo   - Compliance Service:  http://localhost:8080/compliance
echo   - Trading Service:     http://localhost:8080/trading
echo   - Database:            localhost:5432
echo.
echo Frontend will start at: http://localhost:3000
echo.
echo Default Login:
echo   Email:    sumit.redu@poseidon.com
echo   Password: password
echo.
echo ========================================
echo.
echo Starting frontend development server...
echo.

call npm run dev

pause


