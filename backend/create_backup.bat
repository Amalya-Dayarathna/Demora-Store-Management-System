@echo off
"C:\Program Files\PostgreSQL\17\bin\pg_dump.exe" -U postgres -d demora -f supabase_backup.sql
echo Backup created successfully!
pause
