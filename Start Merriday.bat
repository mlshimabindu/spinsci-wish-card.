@echo off
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
  echo Install Node.js from https://nodejs.org then double-click this file again.
  pause
  exit /b 1
)
if not exist node_modules (
  echo Installing Merriday. The first launch can take a minute.
  call npm install
  if errorlevel 1 (
    echo Install failed.
    pause
    exit /b 1
  )
)
if not exist .next\BUILD_ID (
  echo Building Merriday. The first launch takes a minute. Opening it after that is quick.
  call npm run build
  if errorlevel 1 (
    echo Build failed.
    pause
    exit /b 1
  )
)
echo Merriday will open at http://127.0.0.1:43123
echo Leave this window open. Closing it stops Merriday.
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://127.0.0.1:43123"
call npm run start
