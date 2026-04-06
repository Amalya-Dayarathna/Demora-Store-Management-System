@echo off
echo Starting Demora Store Management System...
echo.
echo Backend will run on: http://localhost:5001
echo Admin Panel will run on: http://localhost:3000
echo E-commerce Site will run on: http://localhost:5173
echo.
echo Press Ctrl+C to stop all services
echo.

REM Start backend
start "Backend Server" cmd /k "cd backend && npm run dev"

REM Wait 3 seconds for backend to start
timeout /t 3 /nobreak > nul

REM Start admin panel
start "Admin Panel" cmd /k "cd frontend && npm run dev"

REM Start e-commerce site
start "E-commerce Site" cmd /k "cd demora-site && npm run dev"

echo.
echo All services started!
echo Close this window or press any key to exit (services will continue running)
pause > nul
