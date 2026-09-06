@echo off
set PGPASSWORD=Demora@098#
set FILENAME=backups\backup_%DATE:~10,4%%DATE:~4,2%%DATE:~7,2%_%TIME:~0,2%%TIME:~3,2%.dump
set FILENAME=%FILENAME: =0%
"C:\Program Files\PostgreSQL\17\bin\pg_dump.exe" "postgresql://postgres.madcotnrosxqjgscnieq:Demora%%40098%%23@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres?sslmode=require" --no-owner --no-acl -F c -f "%FILENAME%"
echo Backup saved to %FILENAME%
pause
