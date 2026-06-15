@echo off
REM AttendPro Startup Script for Windows

echo.
echo ============================================
echo   
AcademaOne - Attendance Management System
echo ============================================
echo.

REM Check if MongoDB is running
echo Checking MongoDB...
tasklist | find /i "mongod" >nul
if errorlevel 1 (
    echo.
    echo WARNING: MongoDB is not running!
    echo Please start MongoDB first by running: mongod
    echo.
    pause
    exit /b 1
) else (
    echo MongoDB is running
)

REM Start backend server
echo.
echo Starting Backend Server...
echo Opening new window for backend...

cd backend
start cmd /k "node server.js"

REM Wait for backend to start
timeout /t 3 /nobreak

REM Check if backend started
netstat -ano | find ":5000" >nul
if errorlevel 1 (
    echo.
    echo ERROR: Backend failed to start on port 5000
    echo.
    pause
    exit /b 1
)

echo Backend server started successfully on port 5000

REM Display instructions
echo.
echo ============================================
echo   Setup Complete!
echo ============================================
echo.
echo Next Steps:
echo   1. Frontend is ready to open
echo   2. Open frontend/index.html in your browser
echo   3. Register as a new user
echo   4. Data will be automatically saved to MongoDB
echo.
echo To verify database:
echo   Run: node backend/verify-database.js
echo.
echo ============================================
echo.

pause
