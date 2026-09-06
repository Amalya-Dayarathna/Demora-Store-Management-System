# How to Check Supabase Project Status

## Step 1: Go to Supabase Dashboard
1. Open your browser and go to: https://supabase.com/dashboard
2. Log in with your Supabase account (the email you used to create the project)

## Step 2: Find Your Project
- You should see a list of your projects on the left sidebar or in the main area
- Look for a project with the name or reference containing: **madcotnrosxqjgscnieq**
- This is your project reference ID (visible in the database URL)

## Step 3: Check Project Status
Once you click on your project, look for:

### A. Project Status Indicator
- Look at the top of the page
- You should see a green checkmark or status indicator
- If it shows "Active" or a green dot = Project is running ✅
- If it shows "Paused" or red indicator = Project is paused ❌

### B. Database Connection Info
1. Click on **Settings** (bottom left sidebar)
2. Click on **Database**
3. You should see:
   - Host: `db.madcotnrosxqjgscnieq.supabase.co`
   - Port: `5432`
   - Database: `postgres`
   - User: `postgres`
   - Password: (hidden, but you know it)

### C. Check IP Whitelist
1. In the same **Database** settings page
2. Look for **Network** or **IP Whitelist** section
3. Check if your current IP is allowed
4. If not, add your IP address or allow all IPs (0.0.0.0/0)

## Step 4: Check Database Tables
1. Go to **SQL Editor** (left sidebar)
2. Run this query to check if tables exist:
```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```
3. If you see tables like `users`, `businesses`, `items`, etc. = Database is set up ✅
4. If you see nothing or only system tables = Database needs migration ❌

## Step 5: If Project is Paused
- Click on the project
- Look for a **Resume** button
- Click it to restart the project

## Common Issues & Solutions

### Issue: "Project not found"
- Make sure you're logged into the correct Supabase account
- Check if the project was deleted

### Issue: "Can't connect to database"
- Check if project is paused (resume it)
- Check IP whitelist settings
- Verify database credentials in your .env file

### Issue: "No tables in database"
- You need to run Prisma migrations
- Run: `npx prisma migrate deploy`

## Your Project Reference
- **Project ID**: madcotnrosxqjgscnieq
- **Database Host**: db.madcotnrosxqjgscnieq.supabase.co
- **Database Port**: 5432
- **Database Name**: postgres
