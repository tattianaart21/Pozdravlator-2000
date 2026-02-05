@echo off
chcp 65001 >nul
cd /d "%~dp0"
git add .
git status
echo.
echo Готово. Для коммита выполните: git commit -m "ваше сообщение"
pause
