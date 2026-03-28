# Demora E-Commerce Store - Complete Setup Guide

## 📋 Overview

This is a modern, production-ready e-commerce frontend for the Demora brand. It's built with React, Vite, and Tailwind CSS, and integrates with your existing Node.js/Express backend.

## 🚀 Quick Start (5 minutes)

### Step 1: Install Dependencies
```bash
cd demora-site
npm install
```

### Step 2: Configure Environment
Create `.env` file:
```env
VITE_API_URL=http://localhost:5001/api
```

### Step 3: Start Development Server
```bash
npm run dev
```

Visit: `http://localhost:3000`

---

## 📁 Project Structure

```
demora-site/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          # Navigation bar with cart icon
│   │   ├── ProductCard.jsx     # Product display card
│   │   ├── CartItem.jsx        # Cart item component
│   │   └── Footer.jsx          # Footer component
│   │
│   ├── pages/
│   │   ├── Home.jsx            # Hero + featured products
│   │   ├── Shop.jsx            # Product listing with filters
│   │   ├── ProductDetails.jsx  # Single product page
│   │   ├── Cart.jsx            # Shopping cart
│   │   ├── Checkout.jsx        # Checkout form
│   │   └── OrderConfirmation.jsx # Order confirmation
│   │
│   ├── context/
│   │   └── CartContext.jsx     # Cart state management
│   │
│   ├── services/
│   │   └── api.js              # API calls to backend
│   │
│   ├── utils/
│   │   └── currency.js         # Currency formatting
│   │
│   ├── App.jsx                 # Main app with routing
│   ├── App.css                 # Global styles
│   └── main.jsx                # Entry point
│
├── .env                        # Environment variables
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind CSS config
├── postcss.config.js           # PostCSS config
└── package.json                # Dependencies
```

---

## 🔧 Configuration

### Environment Variables

Create `.env` file in `demora-site/` directory:

```env
# API Configuration
VITE_API_URL=http://localhost:5001/api
```

### Backend Requirements

Your backend must be running with:
- **Port**: 5001
- **API Base URL**: http://localhost:5001/api
- **CORS**: Enabled for http://localhost:3000
- **Database**: PostgreSQL with Demora business

---

## 📦 Dependencies

### Core
- **react**: UI library
- **react-router-dom**: Client-side routing
- **axios**: HTTP client

### Styling
- **tailwindcss**: Utility-first CSS
- **postcss**: CSS processing
- **autoprefixer**: CSS vendor prefixes

### Icons
- **lucide-react**: Icon library

### Build
- **vite**: Build tool
- **@vitejs/plugin-react**: React plugin for Vite

---

## 🎨 Design System

### Colors
- **Primary**: Black (#000000)
- **Secondary**: White (#ffffff)
- **Accent**: Gray shades for UI elements

### Typography
- **Font**: System fonts (Apple/Google/Segoe)
- **Sizes**: Responsive scaling
- **Weight**: 400 (regular), 600 (semibold), 700 (bold)

### Spacing
- Uses Tailwind's spacing scale
- Responsive padding/margins
- Mobile-first approach

---

## 🛒 Features

### 1. Product Catalog
- Browse all products from Demora business
- Category filtering
- Search functionality
- Stock status display
- Out-of-stock handling

### 2. Shopping Cart
- Add/remove items
- Update quantities
- localStorage persistence
- Real-time total calculation
- Cart count in navbar

### 3. Checkout
- Customer details form
- Additional costs (delivery, packaging)
- Payment method selection
- Gift option with custom message
- Order summary

### 4. Payment Options
- **Cash on Delivery (COD)**: Pay on delivery
- **Bank Transfer**: Display bank details for transfer

### 5. Order Management
- Order confirmation page
- Order number and date
- Itemized breakdown
- Payment instructions
- Print order functionality

---

## 🔌 API Integration

### Endpoints Used

#### Get Businesses
```
GET /businesses
Response: Array of business objects
```

#### Get Products
```
GET /items/:businessId
Response: Array of product objects with stock info
```

#### Create Order
```
POST /bills
Body: {
  businessId: string,
  items: Array<{variantId, quantity}>,
  customerName: string,
  customerPhone: string,
  customerAddress: string,
  paymentType: "COD" | "Bank Transfer",
  codDelivery: number,
  packagingCost: number
}
Response: Bill object with order details
```

---

## 🚀 Development

### Start Dev Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

---

## 📱 Responsive Design

The store is fully responsive:
- **Mobile**: 320px and up
- **Tablet**: 768px and up
- **Desktop**: 1024px and up

All components use Tailwind's responsive utilities.

---

## 🔐 Security Considerations

1. **Environment Variables**: Never commit `.env` file
2. **CORS**: Configure backend CORS properly
3. **Input Validation**: All forms validate user input
4. **localStorage**: Cart data stored locally (no sensitive data)
5. **API Calls**: Use HTTPS in production

---

## 🐛 Troubleshooting

### Issue: Products not loading
**Solution**:
1. Check backend is running on port 5001
2. Verify Demora business exists in database
3. Check browser console for errors
4. Verify API URL in `.env`

### Issue: Cart not persisting
**Solution**:
1. Check if localStorage is enabled
2. Clear browser cache
3. Check browser console for errors

### Issue: API connection errors
**Solution**:
1. Verify backend is running
2. Check CORS configuration
3. Verify API URL matches backend
4. Check network tab in DevTools

### Issue: Styles not loading
**Solution**:
1. Rebuild Tailwind: `npm run build`
2. Clear browser cache
3. Check if `App.css` is imported in `main.jsx`

---

## 📝 Customization

### Change Business Name
Edit in these files:
- `src/pages/Home.jsx`
- `src/pages/Shop.jsx`
- `src/pages/ProductDetails.jsx`
- `src/pages/Checkout.jsx`

Change:
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

### Modify Colors
Edit `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: '#000000',
      secondary: '#ffffff',
    },
  },
}
```

---

## 📊 Performance

- **Lazy Loading**: Components load on demand
- **Code Splitting**: Vite handles automatic splitting
- **Caching**: localStorage for cart data
- **Optimization**: Tailwind purges unused CSS

---

## 🔄 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Environment Variables for Production
Set in your hosting platform:
```
VITE_API_URL=https://your-backend-api.com/api
```

---

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [React Router Documentation](https://reactrouter.com)
- [Axios Documentation](https://axios-http.com)

---

## 📞 Support

For issues:
1. Check the troubleshooting section
2. Review browser console for errors
3. Check network tab in DevTools
4. Verify backend is running and accessible

---

## 📄 License

This project is part of the Demora Store Management System.

---

## ✅ Checklist

Before going live:
- [ ] Backend is running on port 5001
- [ ] Database has Demora business with products
- [ ] `.env` file is configured
- [ ] All dependencies are installed
- [ ] Development server runs without errors
- [ ] All pages load correctly
- [ ] Cart functionality works
- [ ] Checkout process completes
- [ ] Orders are created in backend
- [ ] Bank details are updated
- [ ] Mobile responsiveness is tested
- [ ] Production build is tested

---

**Happy selling! 🎉**
