@echo off
REM Spooky Study Buddy Deployment Script for Windows
REM This script builds and prepares the application for production deployment

setlocal enabledelayedexpansion

echo 🎃 Starting Spooky Study Buddy deployment preparation...
echo.

REM Function to print status messages
set "PURPLE=[95m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "RED=[91m"
set "NC=[0m"

REM Check if required files exist
echo %PURPLE%[DEPLOY]%NC% Checking environment configuration...

if not exist "server\.env" (
    echo %RED%[ERROR]%NC% server\.env file not found!
    echo %YELLOW%[WARNING]%NC% Please copy server\.env.example to server\.env and configure it
    exit /b 1
)

if not exist "client\.env" (
    echo %YELLOW%[WARNING]%NC% client\.env not found, using defaults
)

echo %GREEN%[SUCCESS]%NC% Environment check completed

REM Check if npm is available
echo %PURPLE%[DEPLOY]%NC% Checking npm installation...
npm --version >nul 2>&1
if errorlevel 1 (
    echo %RED%[ERROR]%NC% npm is not installed!
    exit /b 1
)
echo %GREEN%[SUCCESS]%NC% npm is available

REM Install dependencies
echo %PURPLE%[DEPLOY]%NC% Installing dependencies...
call npm run install:all
if errorlevel 1 (
    echo %RED%[ERROR]%NC% Failed to install dependencies
    exit /b 1
)
echo %GREEN%[SUCCESS]%NC% Dependencies installed

REM Lint code
echo %PURPLE%[DEPLOY]%NC% Linting code...
call npm run lint
if errorlevel 1 (
    echo %YELLOW%[WARNING]%NC% Linting issues found, but continuing...
)
echo %GREEN%[SUCCESS]%NC% Code linting completed

REM Run tests
echo %PURPLE%[DEPLOY]%NC% Running tests...
call npm run test
if errorlevel 1 (
    echo %YELLOW%[WARNING]%NC% Some tests failed, but continuing...
)
echo %GREEN%[SUCCESS]%NC% Tests completed

REM Clean previous builds
echo %PURPLE%[DEPLOY]%NC% Cleaning previous builds...
if exist "client\dist" rmdir /s /q "client\dist"
if exist "server\dist" rmdir /s /q "server\dist"

REM Build application
echo %PURPLE%[DEPLOY]%NC% Building application for production...
call npm run build
if errorlevel 1 (
    echo %RED%[ERROR]%NC% Build failed
    exit /b 1
)
echo %GREEN%[SUCCESS]%NC% Application built successfully

echo.
echo %GREEN%[SUCCESS]%NC% 🎉 Deployment preparation completed successfully!
echo.
echo 📋 Next steps:
echo   1. Configure your OpenAI API key in server\.env
echo   2. Choose your deployment method (see DEPLOYMENT.md)
echo   3. Start production server: cd server ^&^& npm start
echo.
echo 🔗 Useful commands:
echo   • Test locally: npm run dev
echo   • Build only: npm run build
echo   • Start production: cd server ^&^& set NODE_ENV=production ^&^& npm start
echo.

pause