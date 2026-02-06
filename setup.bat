@echo off
REM TerminalTunes Installation Script for Windows

echo ========================================
echo   TerminalTunes Setup (Windows)
echo ========================================
echo.

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    exit /b 1
)

echo [OK] Node.js found: 
node --version

REM Check for audio player
where mplayer >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] mplayer found
) else (
    echo [WARNING] No audio player found
    echo Install one of: mplayer, sox, vlc
    echo Download from: http://www.mplayerhq.hu/
)

REM Install dependencies
echo.
echo Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies
    exit /b 1
)

echo [OK] Dependencies installed

REM Create directories
echo.
echo Creating directories...
if not exist "data\playlists" mkdir data\playlists
if not exist "data\youtube" mkdir data\youtube
if not exist "data\curated" mkdir data\curated
echo [OK] Directories created

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Quick Start:
echo   node bin\terminal-tunes.js --help
echo   node bin\terminal-tunes.js play song.mp3
echo.
echo Optional: Add to PATH for global access
echo.

pause
