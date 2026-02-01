@echo off
chcp 65001 >nul
title Movie Dashboard Launcher

echo ===========================================
echo 🎬 Movie Dashboard Launcher
echo ===========================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js not detected, please install Node.js first
    echo Download: https://nodejs.org/
    pause
    exit /b 1
)

:: Check Node version
echo 📋 Checking Node.js version...
node --version

:: Check dependencies
if not exist "node_modules" (
    echo.
    echo 📦 First run, installing dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Dependencies installation failed
        pause
        exit /b 1
    )
)

:: Run launcher
echo.
node launcher.js
pause
