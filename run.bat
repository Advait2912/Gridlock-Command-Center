@echo off
echo Starting GridLock Command Center...

echo -^> Starting backend on port 8000
call venv\Scripts\activate.bat
start /B "GridLock Backend" uvicorn backend.main:app --port 8000

:: Wait a bit for backend to initialize
timeout /t 2 /nobreak >nul

echo -^> Starting frontend on port 5173
cd frontend
start /B "GridLock Frontend" call npm run dev
cd ..

echo.
echo =========================================
echo [OK] GridLock is running!
echo    Frontend UI: http://localhost:5173
echo    Backend API: http://localhost:8000/docs
echo =========================================
echo Press any key to stop both servers.
pause >nul

echo Stopping servers...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM uvicorn.exe >nul 2>&1
:: sometimes python processes linger
taskkill /F /IM python.exe >nul 2>&1
