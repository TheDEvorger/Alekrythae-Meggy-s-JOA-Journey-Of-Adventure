@echo off
setlocal
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js bulunamadi. Bu dosya gelistirici testlerini calistirir.
  pause
  exit /b 1
)
node "%~dp0r110-regression.js"
set "ALEK_QA_EXIT=%ERRORLEVEL%"
if not "%ALEK_QA_EXIT%"=="0" echo [HATA] R112 regresyonu basarisiz.
if "%ALEK_QA_EXIT%"=="0" echo [OK] R112 regresyonu gecti.
pause
exit /b %ALEK_QA_EXIT%
