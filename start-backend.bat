@echo off
echo Iniciando o servidor backend do QuickPainel...
echo.
cd /d "%~dp0\api"
echo Instalando dependencias...
npm install
echo.
echo Iniciando servidor na porta 3001...
node server.js
pause 