@echo off
echo ========================================
echo    QuickPainel - Iniciando Sistema
echo ========================================
echo.
echo Iniciando backend...
start "Backend" cmd /k "cd /d "%~dp0\api" && npm start"
echo.
echo Aguardando 5 segundos para o backend inicializar...
timeout /t 5 /nobreak > nul
echo.
echo Iniciando frontend...
start "Frontend" cmd /k "cd /d "%~dp0" && npm run dev"
echo.
echo Sistema iniciado! Acesse: http://localhost:8080
pause 