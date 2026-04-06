# How to Run Demora Store Management System

## Quick Start

### Option 1: Run Everything (Recommended for Development)
Double-click `start-all.bat` to start:
- Backend Server (Port 5001)
- Admin Panel (Port 3000)
- E-commerce Website (Port 5173)

### Option 2: Run Admin Panel Only
Double-click `start-admin.bat` to start:
- Backend Server (Port 5001)
- Admin Panel (Port 3000)

### Option 3: Run E-commerce Website Only
Double-click `start-website.bat` to start:
- Backend Server (Port 5001)
- E-commerce Website (Port 5173)

## Manual Start (Alternative Method)

### 1. Start Backend Server
```bash
cd backend
npm run dev
```
Backend will run on: http://localhost:5001

### 2. Start Admin Panel
Open a new terminal:
```bash
cd frontend
npm run dev
```
Admin Panel will run on: http://localhost:3000

### 3. Start E-commerce Website
Open another new terminal:
```bash
cd demora-site
npm run dev
```
E-commerce Website will run on: http://localhost:5173

## Access URLs

- **Backend API**: http://localhost:5001
- **Admin Panel**: http://localhost:3000
- **E-commerce Website**: http://localhost:5173

## Default Login Credentials (Admin Panel)
- Username: `admin`
- Password: `admin123`

## Stopping Services

### If using batch files:
- Close the command prompt windows that opened

### If running manually:
- Press `Ctrl + C` in each terminal window

## Troubleshooting

### Port Already in Use
If you get a port conflict error:
1. Close any applications using ports 3000, 5001, or 5173
2. Or change the ports in the respective configuration files

### Database Connection Error
Make sure PostgreSQL is running and the connection string in `backend/.env` is correct.

### Module Not Found Error
Run `npm install` in the respective folder:
```bash
cd backend && npm install
cd frontend && npm install
cd demora-site && npm install
```

## Project Structure

```
Demora-Store-Management-System/
├── backend/          # Express.js API server (Port 5001)
├── frontend/         # Admin Panel - React + Material-UI (Port 3000)
├── demora-site/      # E-commerce Website - React + Tailwind (Port 5173)
├── start-all.bat     # Run everything
├── start-admin.bat   # Run admin panel only
└── start-website.bat # Run website only
```

## Notes

- The backend must be running for both frontend applications to work
- Admin Panel is for business management (inventory, billing, reports)
- E-commerce Website is for customers to browse and purchase products
- Both applications share the same backend and database
