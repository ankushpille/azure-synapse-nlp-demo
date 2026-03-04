@REM 0setupserver.bat

cd /d "%~dp0server"
REM fill in Synapse credentials
copy .env.example .env
echo .env created — please edit it with your Synapse credentials.
pause
