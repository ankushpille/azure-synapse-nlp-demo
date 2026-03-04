@REM 0setupserver.bat

cd /d "%~dp0server"
copy .env.example .env
echo .env created — please edit it with your Synapse credentials.
pause
