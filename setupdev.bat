@echo off
setlocal

echo ============================================================
echo  XpenseSlate - Dev Setup
echo ============================================================

:: 1. Create virtual environment
if not exist "env\" (
    echo Creating Python virtual environment...
    python -m venv env
    if errorlevel 1 (
        echo ERROR: Failed to create virtual environment.
        exit /b 1
    )
)

:: 2. Activate venv and install Python dependencies
echo Installing Python dependencies...
call env\Scripts\activate.bat
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: pip install failed.
    exit /b 1
)

:: 3. Run Alembic migrations
echo Running database migrations...
alembic upgrade head
if errorlevel 1 (
    echo ERROR: Alembic migration failed.
    exit /b 1
)

:: 4. Optionally load seed data
if exist "finance.db" (
    echo Skipping seed data load (finance.db already exists).
) else (
    where sqlite3 >nul 2>&1
    if not errorlevel 1 (
        echo Loading seed data...
        sqlite3 finance.db < seed_data.sql
    ) else (
        echo NOTE: sqlite3 CLI not found; skipping seed data load.
        echo       To load manually: sqlite3 finance.db ^< seed_data.sql
    )
)

:: 5. Install frontend dependencies
echo Installing frontend dependencies...
cd frontend
npm install
if errorlevel 1 (
    echo ERROR: npm install failed.
    exit /b 1
)
cd ..

echo.
echo ============================================================
echo  Setup complete.
echo  Run: runapplication.bat
echo ============================================================
endlocal
