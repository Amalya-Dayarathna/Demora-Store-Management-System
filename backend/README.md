# Demora - Multi-Business Inventory Management System

A clean, user-friendly full-stack web application for managing multiple businesses with separate inventory, billing, and cashflow tracking.

## Tech Stack

**Frontend:**
- React (Vite)
- Material UI (Black & White Theme)
- Mobile-friendly, admin-focused UI

**Backend:**
- Node.js & Express.js
- REST APIs
- JWT Authentication
- QR Code Generation

**Database:**
- PostgreSQL
- Prisma ORM

## Features

### Core System
- Multi-business support with complete data separation
- Business selector on every major screen
- CRUD operations for businesses

### Inventory Management
- Category & Item management
- Variant-based inventory with attributes (color, size)
- QR code generation for each variant
- Stock tracking at variant level
- Low stock alerts

### Billing System
- QR code scanning for quick item addition
- Real-time stock validation
- Order status tracking (Ordered → Packed → Delivered → Money Received)
- COD delivery charge calculation
- Automatic stock reduction on billing

### Cashflow Management
- Capital tracking with member-wise records
- Income & expense management
- Capital settlement tracking
- Category-wise expense reporting

### Reporting
- Inventory reports with stock status
- Sales reports with date filtering
- Cashflow summaries
- Capital settlement reports

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- Git

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd Demora-Store-Management-System

# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb demora_db

# Update .env file with your database credentials
DATABASE_URL="postgresql://username:password@localhost:5432/demora_db"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
PORT=5000
```

### 3. Initialize Database

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view database
npx prisma studio
```

### 4. Create Admin User

```bash
# Start the backend server
npm run dev

# In another terminal, create admin user
curl -X POST http://localhost:5000/api/auth/setup
```

Default admin credentials: `admin` / `admin123`

### 5. Start the Application

```bash
# Terminal 1: Start backend (from root directory)
npm run dev

# Terminal 2: Start frontend (from frontend directory)
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Prisma Studio: http://localhost:5555

## Usage Guide

### 1. Login
- Use default credentials: `admin` / `admin123`

### 2. Create Business
- Navigate to Businesses page
- Add your first business (e.g., "Demora - T Shirts")

### 3. Setup Categories
- Go to Categories page
- Create categories with codes (e.g., "Hair Clips" - "HC")

### 4. Add Items
- Navigate to Items page
- Add items with cost and selling prices
- Base reference codes are auto-generated

### 5. Create Variants
- Go to Variants page
- Add variants with color/size attributes
- QR codes are automatically generated
- Set initial stock quantities

### 6. Start Billing
- Use Billing page for creating orders
- Scan QR codes or manually enter variant codes
- Add customer information and COD charges
- Stock is automatically reduced on bill creation

### 7. Manage Cashflow
- Track capital investments by members
- Record income and expenses
- Settle capital payments
- View cashflow summaries

### 8. Generate Reports
- View inventory status and low stock alerts
- Analyze sales performance
- Track cashflow and expenses
- Monitor capital settlements

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/setup` - Create admin user

### Businesses
- `GET /api/businesses` - List all businesses
- `POST /api/businesses` - Create business
- `PUT /api/businesses/:id` - Update business
- `DELETE /api/businesses/:id` - Delete business

### Categories
- `GET /api/categories/:businessId` - Get categories by business
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Items
- `GET /api/items/:businessId` - Get items by business
- `POST /api/items` - Create item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

### Variants
- `GET /api/variants/:businessId` - Get variants by business
- `GET /api/variants/qr/:qrCode` - Get variant by QR code
- `POST /api/variants` - Create variant
- `PUT /api/variants/:id/stock` - Update stock
- `GET /api/variants/:id/qr-image` - Generate QR code image
- `DELETE /api/variants/:id` - Delete variant

### Billing
- `GET /api/bills/:businessId` - Get bills by business
- `POST /api/bills` - Create bill
- `PUT /api/bills/:id/status` - Update bill status

### Cashflow
- `GET /api/cashflow/:businessId/summary` - Get cashflow summary
- `GET /api/cashflow/:businessId/capital` - Get capital records
- `POST /api/cashflow/capital` - Add capital
- `PUT /api/cashflow/capital/:id/settle` - Settle capital
- `GET /api/cashflow/:businessId/income` - Get income records
- `POST /api/cashflow/income` - Add income
- `GET /api/cashflow/:businessId/expenses` - Get expense records
- `POST /api/cashflow/expenses` - Add expense

### Reports
- `GET /api/reports/:businessId/inventory` - Inventory report
- `GET /api/reports/:businessId/sales` - Sales report
- `GET /api/reports/:businessId/cashflow` - Cashflow report
- `GET /api/reports/:businessId/capital-settlement` - Capital settlement report

## Database Schema

### Key Models
- **Business**: Multi-tenant business entities
- **Category**: Product categories with codes
- **Item**: Products with base reference codes
- **Variant**: Stock-tracked variants with QR codes
- **Bill**: Orders with customer information
- **BillItem**: Line items in bills
- **Capital**: Member capital investments
- **Income**: Revenue tracking
- **Expense**: Cost tracking

## Development Notes

### Gift Box Logic (Future Enhancement)
The system is designed to support gift boxes as virtual products that consist of multiple variants. When billing a gift box:
1. Reduce stock of all included variants
2. Add box and packaging costs as expenses
3. Calculate final price dynamically

### QR Code Integration
- Each variant gets a unique QR code matching its variant code
- QR codes can be scanned via camera or barcode scanner
- Manual QR code entry is supported for testing

### Security
- JWT-based authentication
- Business-level data isolation
- Input validation on all endpoints

### Mobile Responsiveness
- Material UI responsive design
- Touch-friendly interface
- Optimized for tablet use in retail environments

## Production Deployment

1. Set strong JWT secret in production
2. Use environment variables for database credentials
3. Enable HTTPS
4. Set up database backups
5. Configure proper CORS settings
6. Use PM2 or similar for process management

## Support

For issues or questions, please refer to the API documentation or check the console logs for detailed error messages.