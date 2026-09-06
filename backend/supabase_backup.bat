@echo off
echo Creating Supabase-compatible backup...
"C:\Program Files\PostgreSQL\17\bin\pg_dump.exe" -U postgres -d demora --column-inserts --data-only -f supabase_data.sql
echo.
echo Creating schema backup...
"C:\Program Files\PostgreSQL\17\bin\pg_dump.exe" -U postgres -d demora --schema-only -f supabase_schema.sql
echo.
echo Backup complete! 
echo - supabase_schema.sql (tables structure)
echo - supabase_data.sql (data with INSERT statements)
echo.
echo Import to Supabase:
echo 1. First run supabase_schema.sql
echo 2. Then run supabase_data.sql
pause
