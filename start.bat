@echo off
title 🌋 Lava Cafe POS System Launcher
echo ===================================================
echo             🌋 LAVA CAFE POS SYSTEM
echo ===================================================
echo.
echo Starting Backend and Frontend Servers...
echo.

:: Start backend
start cmd /k "cd backend && echo Starting Backend Server... && npm run dev"

:: Start frontend
start cmd /k "cd frontend && echo Starting Frontend Server... && npm start"

echo ===================================================
echo Servers are launching in separate windows!
echo.
echo Backend API:  http://localhost:5000
echo Frontend POS: http://localhost:3000
echo ===================================================
pause
