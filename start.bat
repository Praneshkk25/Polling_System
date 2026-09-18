@echo off
title PulsePoll Launcher
echo ========================================================
echo          Starting PulsePoll Real-time Engine
echo ========================================================
echo.
echo [1/2] Starting Go Backend Server on port 8080...
start "PulsePoll Backend (Go + Gin)" cmd /k "cd /d %~dp0backend && server.exe"

timeout /t 2 >nul

echo [2/2] Starting React Frontend Dev Server...
start "PulsePoll Frontend (React + Vite)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================================
echo PulsePoll is running!
echo Backend:  http://localhost:8080
echo Frontend: http://localhost:5173
echo ========================================================
echo.
echo Press any key to exit this launcher window...
pause >nul
