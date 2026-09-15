@echo off
title CampusFind AI

echo.
echo ==========================================
echo       CAMPUSFIND AI - STARTING
echo ==========================================
echo.

echo Starting FastAPI Backend...
start "CampusFind AI - Backend" cmd /k "cd /d D:\Internship projects\CampusFind-AI\backend && uvicorn main:app --reload"

timeout /t 3 /nobreak >nul

echo Starting React Frontend...
start "CampusFind AI - Frontend" cmd /k "cd /d D:\Internship projects\CampusFind-AI\frontend && npm run dev"

timeout /t 5 /nobreak >nul

echo.
echo ==========================================
echo       CAMPUSFIND AI STARTED
echo ==========================================
echo.
echo Backend:  http://127.0.0.1:8000
echo Frontend: http://localhost:5173
echo.
echo Opening CampusFind AI...
echo.

start http://localhost:5173

exit