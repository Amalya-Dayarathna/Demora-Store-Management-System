# Demora E-Commerce Store

A modern, premium e-commerce frontend for the Demora brand built with React, Vite, and Tailwind CSS.

## Features

- **Modern UI**: Minimal, premium design with black and white theme
- **Responsive Design**: Fully responsive across all devices
- **Product Catalog**: Browse products by category with search functionality
- **Shopping Cart**: Add/remove items with localStorage persistence
- **Checkout**: Complete checkout flow with customer details
- **Payment Options**: Support for COD and Bank Transfer
- **Gift Option**: Add gift details and custom messages
- **Order Confirmation**: Detailed order confirmation with bank details for transfers

## Pages

- **Home**: Hero section with featured products
- **Shop**: Full product listing with category filters and search
- **Product Details**: Detailed product view with stock information
- **Cart**: Shopping cart with quantity management
- **Checkout**: Customer details, payment method, and gift options
- **Order Confirmation**: Order summary and payment instructions

## Tech Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Icons**: Lucide React
- **State Management**: React Context API

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with API configuration:
```env
VITE_API_URL=http://localhost:5001/api
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── Navbar.jsx
│   ├── ProductCard.jsx
│   ├── CartItem.jsx
│   └── Footer.jsx
├── pages/              # Page components
│   ├── Home.jsx
│   ├── Shop.jsx
│   ├── ProductDetails.jsx
│   ├── Cart.jsx
│   ├── Checkout.jsx
│   └── OrderConfirmation.jsx
├── context/            # React Context
│   └── CartContext.jsx
├── services/           # API services
│   └── api.js
├── utils/              # Utility functions
│   └── currency.js
├── App.jsx             # Main app component
├── App.css             # Global styles
└── main.jsx            # Entry point
```

## API Integration

The app connects to the existing backend API at `http://localhost:5001/api`. It uses the following endpoints:

- `GET /businesses` - Get all businesses
- `GET /items/:businessId` - Get products for a business
- `POST /bills` - Create an order

## Features in Detail

### Product Listing
- Displays product image, name, price, and stock status
- Shows "Out of Stock" badge when stock is 0
- Disables "Add to Cart" button for out-of-stock items
- Shows low stock warning when less than 5 items available

### Cart Management
- Add/remove/update product quantities
- Cart persists in localStorage
- Real-time cart total calculation
- Cart item count in navbar

### Checkout
- Customer details form (name, phone, address)
- Additional costs (COD delivery, packaging)
- Payment method selection (COD or Bank Transfer)
- Gift option with optional sender name and message
- Order summary with itemized breakdown

### Order Confirmation
- Order number and date
- Delivery details
- Itemized order summary
- Payment instructions (bank details for transfers)
- Print order functionality
- Gift details display

## Environment Variables

```env
VITE_API_URL=http://localhost:5001/api
```

## Build for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

## Development

Start the dev server:
```bash
npm run dev
```

## Notes

- The app fetches the Demora business ID from the backend on each page load
- Cart data is stored in localStorage with key `demora_cart`
- Last order is stored in localStorage with key `lastOrder`
- All prices are formatted using USD currency format
- The app is fully responsive and mobile-friendly

## Future Enhancements

- Product reviews and ratings
- Wishlist functionality
- User accounts and order history
- Email notifications
- Advanced product filters
- Product recommendations
- Toast notifications for user feedback
