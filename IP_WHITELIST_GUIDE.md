# How to Find and Configure IP Whitelist in Supabase

## Step 1: Go to Supabase Dashboard
1. Open https://supabase.com/dashboard
2. Click on your project (madcotnrosxqjgscnieq)

## Step 2: Navigate to Network Settings
1. On the left sidebar, scroll down and click **Settings** (gear icon)
2. In the Settings menu, look for **Network** tab (not Database)
3. Click on **Network**

## Step 3: Check IP Whitelist
You should see a section called:
- **"Allowed IP Addresses"** or
- **"IP Whitelist"** or
- **"Network Restrictions"**

## Step 4: Add Your IP Address
You have two options:

### Option A: Allow All IPs (Easiest for Development)
1. Click **Add** or **+ Add IP**
2. Enter: `0.0.0.0/0` (this allows all IPs)
3. Click **Save**
⚠️ Note: This is less secure but good for development

### Option B: Allow Only Your IP (More Secure)
1. Find your current IP address:
   - Go to https://whatismyipaddress.com
   - Copy your IPv4 address (e.g., 203.0.113.45)
2. In Supabase, click **Add** or **+ Add IP**
3. Enter your IP address
4. Click **Save**

## Alternative: If You Can't Find Network Settings

Some Supabase projects have network settings in different locations:

### Location 1: Settings → Network
- Click Settings (gear icon)
- Look for "Network" tab

### Location 2: Settings → Database
- Click Settings (gear icon)
- Click "Database"
- Scroll down to find "Network" or "IP Whitelist"

### Location 3: Project Settings
- Click your project name at top
- Look for "Network" in the dropdown menu

## If Still Can't Find It

Try this alternative approach:
1. Go to Supabase Dashboard
2. Click on your project
3. Look for **"Restrictions"** or **"Security"** section
4. Find **"Network Restrictions"** or **"IP Whitelist"**

## After Adding IP

1. Save the changes
2. Wait 1-2 minutes for changes to take effect
3. Try connecting again:
   ```bash
   npx prisma migrate dev --name init
   ```

## Your Current Connection String
```
postgresql://postgres:Demora%40098%23@db.madcotnrosxqjgscnieq.supabase.co:5432/postgres?schema=public&sslmode=require
```

This should work once IP whitelist is configured.
