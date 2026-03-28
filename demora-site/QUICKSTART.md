# Demora E-Commerce Store - Quick Start Guide

## Prerequisites

- Node.js (v18+)
- Backend server running on port 5001
- PostgreSQL database with Demora business data

## Setup Steps

### 1. Install Dependencies

```bash
cd demora-site
npm install
```

### 2. Configure Environment

Create `.env` file in the `demora-site` directory:

```env
VITE_API_URL=http://localhost:5001/api
```

### 3. Start Development Server

```bash
npm run dev
```

The store will be available at: `http://localhost:3000`

## Backend Requirements

Make sure your backend is running with:
- Port: 5001
- Database: PostgreSQL with Demora business
- API endpoints available at: `http://localhost:5001/api`

## Project Structure

```
demora-site/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/              # Page components
│   ├── context/            # React Context (Cart)
│   ├── services/           # API service
│   ├── utils/              # Utility functions
│   ├── App.jsx             # Main app
│   ├── App.css             # Global styles
│   └── main.jsx            # Entry point
├── .env                    # Environment variables
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS config
├── postcss.config.js       # PostCSS config
└── package.json            # Dependencies
```

## Key Features

✅ Modern, premium UI (black & white theme)
✅ Fully responsive design
✅ Product catalog with search & filters
✅ Shopping cart with localStorage
✅ Complete checkout flow
✅ Multiple payment methods (COD, Bank Transfer)
✅ Gift option with custom messages
✅ Order confirmation page
✅ Reusable components
✅ Clean, modular code

## Available Routes

- `/` - Home page
- `/shop` - Product listing
- `/product/:id` - Product details
- `/cart` - Shopping cart
- `/checkout` - Checkout page
- `/order-confirmation` - Order confirmation

## API Endpoints Used

- `GET /businesses` - Fetch all businesses
- `GET /items/:businessId` - Fetch products
- `POST /bills` - Create order

## Customization

### Change Business Name
Edit the business name filter in:
- `src/pages/Home.jsx`
- `src/pages/Shop.jsx`
- `src/pages/ProductDetails.jsx`
- `src/pages/Checkout.jsx`

Change from:
```javascript
const demora = businessesRes.data.find(
  (b) => b.name.toLowerCase() === 'demora'
);
```

### Update Bank Details
Edit `src/pages/OrderConfirmation.jsx`:
```javascript
const bankDetails = {
  accountName: 'Your Account Name',
  accountNumber: 'Your Account Number',
  bankName: 'Your Bank Name',
  routingNumber: 'Your Routing Number',
};
```

### Modify Styling
- Global styles: `src/App.css`
- Tailwind config: `tailwind.config.js`
- Component styles: Use Tailwind classes in JSX

## Build for Production

```bash
npm run build
```

Output will be in `dist/` directory.

## Troubleshooting

### API Connection Issues
- Ensure backend is running on port 5001
- Check `VITE_API_URL` in `.env`
- Verify CORS is enabled on backend

### Products Not Loading
- Verify Demora business exists in database
- Check if products are assigned to Demora business
- Check browser console for API errors

### Cart Not Persisting
- Check if localStorage is enabled
- Clear browser cache and try again

## Support

For issues or questions, check:
1. Backend logs for API errors
2. Browser console for frontend errors
3. Network tab in DevTools for API calls
