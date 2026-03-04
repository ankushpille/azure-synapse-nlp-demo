@REM 1runserver.bat

cd /d "%~dp0server"
call npm install
call npm run dev
