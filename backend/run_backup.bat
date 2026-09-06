@echo off
cd /d "C:\Program Files\PostgreSQL\17\bin"
echo Creating data backup with INSERT statements...
pg_dump.exe -U postgres -d demora --column-inserts --data-only -f "d:\Freelance\Business\Demora\Demora Web\Demora-Store-Management-System\backend\supabase_data.sql"
echo.
echo Creating schema backup...
pg_dump.exe -U postgres -d demora --schema-only -f "d:\Freelance\Business\Demora\Demora Web\Demora-Store-Management-System\backend\supabase_schema.sql"
echo.
echo Backup files created successfully!
echo - supabase_schema.sql
echo - supabase_data.sql
pause
