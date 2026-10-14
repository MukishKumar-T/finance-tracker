@echo off
echo ============================================================
echo  Personal Finance Tracker - Starting Application
echo ============================================================

echo Starting backend (http://localhost:8000)...
start "Backend - Finance Tracker" cmd /k "call env\Scripts\activate && python main.py"

echo Starting frontend (http://localhost:3000)...
start "Frontend - Finance Tracker" cmd /k "cd frontend && npm run dev"

echo.
echo Both windows launched.
echo   API:     http://localhost:8000
echo   Swagger: http://localhost:8000/docs
echo   UI:      http://localhost:3000
