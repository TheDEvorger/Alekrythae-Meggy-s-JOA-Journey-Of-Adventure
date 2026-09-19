@echo off
setlocal
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js bulunamadi. Bu dosya gelistirici testlerini calistirir.
  pause
  exit /b 1
)
node "%~dp0r110-regression.js"
if errorlevel 1 exit /b 1
node "%~dp0r113-browser-runtime.js"
set "ALEK_QA_EXIT=%ERRORLEVEL%"
if not "%ALEK_QA_EXIT%"=="0" echo [HATA] R113 tarayici testi basarisiz. Kurulum: npm install --prefix Tools ve npx --prefix Tools playwright install chromium
if "%ALEK_QA_EXIT%"=="0" echo [OK] R113 regresyonu ve gercek tarayici testi gecti.
pause
exit /b %ALEK_QA_EXIT%
