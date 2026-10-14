@echo off
echo ============================================================
echo  XpenseSlate - Starting Application
echo ============================================================

echo Starting backend (http://localhost:8000)...
start "XpenseSlate - Backend" cmd /k "call env\Scripts\activate && python main.py"

echo Starting frontend (http://localhost:3000)...
start "XpenseSlate - Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Both windows launched.
echo   API:     http://localhost:8000
echo   Swagger: http://localhost:8000/docs
echo   UI:      http://localhost:3000
