@REM cls && dir /s /b /a-d | findstr /v /i "node_modules" | findstr /v /i ".git" | findstr /v /i ".next" | findstr /v /i "package-lock.json" | findstr /v /i "vite.svg" | findstr /v /i /r "\.env$"


echo off

call echo # ======= > z_getcode.txt

call type  C:\code\coaching\ank\azure-synapse-nlp-demo\0setupserver.bat  >> z_getcode.txt 	&& echo # ======= >> z_getcode.txt
call type  C:\code\coaching\ank\azure-synapse-nlp-demo\1runserver.bat  >> z_getcode.txt 	&& echo # ======= >> z_getcode.txt
call type  C:\code\coaching\ank\azure-synapse-nlp-demo\2runclient.bat  >> z_getcode.txt 	&& echo # ======= >> z_getcode.txt
call type  C:\code\coaching\ank\azure-synapse-nlp-demo\README.md  >> z_getcode.txt 	&& echo # ======= >> z_getcode.txt
call type  C:\code\coaching\ank\azure-synapse-nlp-demo\client\index.html  >> z_getcode.txt 	&& echo # ======= >> z_getcode.txt
call type  C:\code\coaching\ank\azure-synapse-nlp-demo\client\package.json  >> z_getcode.txt 	&& echo # ======= >> z_getcode.txt
call type  C:\code\coaching\ank\azure-synapse-nlp-demo\client\README.md  >> z_getcode.txt 	&& echo # ======= >> z_getcode.txt
call type  C:\code\coaching\ank\azure-synapse-nlp-demo\client\vite.config.js  >> z_getcode.txt 	&& echo # ======= >> z_getcode.txt
call type  C:\code\coaching\ank\azure-synapse-nlp-demo\client\src\App.jsx  >> z_getcode.txt 	&& echo # ======= >> z_getcode.txt
call type  C:\code\coaching\ank\azure-synapse-nlp-demo\client\src\index.css  >> z_getcode.txt 	&& echo # ======= >> z_getcode.txt
call type  C:\code\coaching\ank\azure-synapse-nlp-demo\client\src\main.jsx  >> z_getcode.txt 	&& echo # ======= >> z_getcode.txt
call type  C:\code\coaching\ank\azure-synapse-nlp-demo\server\.env.example  >> z_getcode.txt 	&& echo # ======= >> z_getcode.txt
call type  C:\code\coaching\ank\azure-synapse-nlp-demo\server\index.js  >> z_getcode.txt 	&& echo # ======= >> z_getcode.txt
call type  C:\code\coaching\ank\azure-synapse-nlp-demo\server\package.json  >> z_getcode.txt 	&& echo # ======= >> z_getcode.txt
call type  C:\code\coaching\ank\azure-synapse-nlp-demo\server\README.md  >> z_getcode.txt 	&& echo # ======= >> z_getcode.txt

echo on
