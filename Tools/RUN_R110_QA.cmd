@echo off
setlocal
where node >nul 2>nul
if errorlevel 1 (
  echo [HATA] Node.js bulunamadi. QA icin Node.js 18 veya daha yenisini kur.
  pause
  exit /b 1
)
node "%~dp0r110-regression.js"
set "ALEK_QA_EXIT=%ERRORLEVEL%"
if not "%ALEK_QA_EXIT%"=="0" echo [HATA] R112 regresyon kontrollerinden biri basarisiz.
if "%ALEK_QA_EXIT%"=="0" echo [OK] R112 kontrollerinin tamami gecti.
pause
exit /b %ALEK_QA_EXIT%
