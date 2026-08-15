@echo off
cd /d "%~dp0"

start "" caddy.exe run
timeout /t 2 /nobreak >nul
start "" http://localhost:8080
exit