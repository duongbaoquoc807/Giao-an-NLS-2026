@echo off
title EduPlan AI - Soan Giao An 5512
color 0b
echo ========================================================
echo        DANG KHOI DONG HE THONG EDUPLAN AI 5512
echo ========================================================
echo.

set PATH=C:\Users\Admin\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;%PATH%

echo [1/2] Dang khoi dong May chu Local...
start "" http://localhost:3000
node dist/server.cjs

pause
