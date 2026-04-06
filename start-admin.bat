@echo off
echo Starting Admin Panel...
echo.
echo Backend will run on: http://localhost:5001
echo Admin Panel will run on: http://localhost:3000
echo.

REM Start backend
start "Backend Server" cmd /k "cd backend && npm run dev"

REM Wait 3 seconds for backend to start
timeout /t 3 /nobreak > nul

REM Start admin panel
start "Admin Panel" cmd /k "cd frontend && npm run dev"

echo.
echo Admin Panel started!
echo Close this window or press any key to exit (services will continue running)
pause > nul
