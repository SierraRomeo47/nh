@echo off
echo ========================================
echo  Starting Frontend (React + Vite)
echo ========================================
echo.

cd nautilus-horizon

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install dependencies!
        pause
        exit /b 1
    )
    echo.
)

echo Starting development server...
echo.
echo Frontend will be available at: http://localhost:3000
echo.
echo Default Login:
echo   Email:    sumit.redu@poseidon.com
echo   Password: password
echo.
echo ========================================
echo.

call npm run dev

pause


