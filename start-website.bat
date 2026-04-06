@echo off
echo Starting E-commerce Website...
echo.
echo Backend will run on: http://localhost:5001
echo E-commerce Site will run on: http://localhost:5173
echo.

REM Start backend
start "Backend Server" cmd /k "cd backend && npm run dev"

REM Wait 3 seconds for backend to start
timeout /t 3 /nobreak > nul

REM Start e-commerce site
start "E-commerce Site" cmd /k "cd demora-site && npm run dev"

echo.
echo E-commerce Website started!
echo Close this window or press any key to exit (services will continue running)
pause > nul
