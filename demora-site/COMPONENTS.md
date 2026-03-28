# Component Documentation

## Components Overview

### Navbar
**File**: `src/components/Navbar.jsx`

Navigation bar with logo, menu links, and shopping cart icon.

**Features**:
- Sticky positioning
- Mobile responsive menu
- Cart item count badge
- Links to Home and Shop

**Props**: None

**Usage**:
```jsx
<Navbar />
```

---

### ProductCard
**File**: `src/components/ProductCard.jsx`

Displays a single product with image, name, price, and add to cart button.

**Features**:
- Product image with hover effect
- Out of stock badge
- Stock warning (< 5 items)
- Add to cart button
- Category display

**Props**:
```javascript
{
  product: {
    id: string,
    itemName: string,
    sellingPrice: number,
    totalStock: number,
    images: string[],
    category: { categoryName: string }
  }
}
```

**Usage**:
```jsx
<ProductCard product={product} />
```

---

### CartItem
**File**: `src/components/CartItem.jsx`

Displays a single item in the shopping cart with quantity controls.

**Features**:
- Product image
- Quantity increment/decrement
- Remove button
- Item total calculation

**Props**:
```javascript
{
  item: {
    id: string,
    itemName: string,
    sellingPrice: number,
    quantity: number,
    images: string[],
    category: { categoryName: string }
  }
}
```

**Usage**:
```jsx
<CartItem item={item} />
```

---

### Footer
**File**: `src/components/Footer.jsx`

Footer with links and company information.

**Features**:
- Company info
- Navigation links
- Support links
- Legal links
- Copyright notice

**Props**: None

**Usage**:
```jsx
<Footer />
```

---

## Pages Overview

### Home
**File**: `src/pages/Home.jsx`

Landing page with hero section and featured products.

**Features**:
- Hero banner
- Featured products grid
- Call-to-action buttons
- Loading and error states

**Data Fetching**:
- Fetches all businesses
- Finds Demora business
- Gets first 6 products

---

### Shop
**File**: `src/pages/Shop.jsx`

Product listing page with search and category filters.

**Features**:
- Product grid
- Search functionality
- Category filtering
- Product count display
- Loading and error states

**Data Fetching**:
- Fetches all products for Demora
- Extracts unique categories
- Filters based on search and category

---

### ProductDetails
**File**: `src/pages/ProductDetails.jsx`

Detailed product page with full information and add to cart.

**Features**:
- Large product image
- Detailed product info
- Stock status
- Quantity selector
- Add to cart button
- Product specifications

**Data Fetching**:
- Fetches single product by ID
- Handles not found errors

---

### Cart
**File**: `src/pages/Cart.jsx`

Shopping cart page with items and order summary.

**Features**:
- List of cart items
- Order summary
- Subtotal calculation
- Proceed to checkout button
- Empty cart message

**Data Source**: CartContext

---

### Checkout
**File**: `src/pages/Checkout.jsx`

Checkout page with customer details and payment options.

**Features**:
- Customer details form
- Additional costs input
- Payment method selection
- Gift option with message
- Order summary
- Form validation

**Data Submission**:
- Creates bill via API
- Stores order in localStorage
- Clears cart
- Redirects to confirmation

---

### OrderConfirmation
**File**: `src/pages/OrderConfirmation.jsx`

Order confirmation page with details and payment instructions.

**Features**:
- Order number and date
- Delivery details
- Itemized order summary
- Payment instructions
- Bank details (for transfers)
- Gift details display
- Print functionality

**Data Source**: Location state or localStorage

---

## Context Overview

### CartContext
**File**: `src/context/CartContext.jsx`

Global cart state management using React Context.

**State**:
```javascript
{
  cart: Array<Product>,
  addToCart: (product) => void,
  removeFromCart: (productId) => void,
  updateQuantity: (productId, quantity) => void,
  clearCart: () => void,
  getTotalPrice: () => number,
  getTotalItems: () => number
}
```

**Usage**:
```jsx
import { useCart } from '../context/CartContext';

function MyComponent() {
  const { cart, addToCart, getTotalPrice } = useCart();
  // ...
}
```

**localStorage Key**: `demora_cart`

---

## Services Overview

### API Service
**File**: `src/services/api.js`

Axios instance and API methods for backend communication.

**Methods**:
```javascript
apiService.getBusinesses()           // GET /businesses
apiService.getItems(businessId)      // GET /items/:businessId
apiService.createBill(billData)      // POST /bills
apiService.getBills(businessId)      // GET /bills/:businessId
```

**Usage**:
```jsx
import { apiService } from '../services/api';

const response = await apiService.getItems(businessId);
```

---

## Utilities Overview

### Currency Utilities
**File**: `src/utils/currency.js`

Currency formatting functions.

**Functions**:
```javascript
formatCurrency(amount)  // Returns: $1,234.56
formatPrice(price)      // Returns: $1234.56
```

**Usage**:
```jsx
import { formatPrice } from '../utils/currency';

<span>{formatPrice(99.99)}</span>  // $99.99
```

---

## Hooks Usage

### useCart
Access cart state and methods.

```jsx
const { 
  cart,              // Array of items
  addToCart,         // Add item to cart
  removeFromCart,    // Remove item from cart
  updateQuantity,    // Update item quantity
  clearCart,         // Clear entire cart
  getTotalPrice,     // Get total price
  getTotalItems      // Get total items count
} = useCart();
```

### useNavigate
Navigate between pages.

```jsx
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate('/shop');
```

### useParams
Get URL parameters.

```jsx
import { useParams } from 'react-router-dom';

const { id } = useParams();
```

### useLocation
Get current location and state.

```jsx
import { useLocation } from 'react-router-dom';

const location = useLocation();
const order = location.state?.order;
```

---

## Data Models

### Product
```javascript
{
  id: string,
  itemName: string,
  categoryId: string,
  baseRefCode: string,
  costPrice: number,
  sellingPrice: number,
  stockQuantity: number,
  totalStock: number,  // Calculated: stockQuantity + variant stocks
  variants: Array,
  tags: Array,
  images: Array<string>,
  category: {
    id: string,
    categoryName: string,
    categoryCode: string
  }
}
```

### Bill (Order)
```javascript
{
  id: string,
  billNumber: string,
  subtotal: number,
  codDelivery: number,
  packagingCost: number,
  grandTotal: number,
  status: string,           // "Ordered", "Packed", "Dispatched", "Delivered"
  paymentType: string,      // "COD", "Bank Transfer"
  paymentStatus: string,    // "Pending", "Received"
  customerName: string,
  customerPhone: string,
  customerAddress: string,
  businessId: string,
  createdAt: Date,
  billItems: Array<BillItem>
}
```

### BillItem
```javascript
{
  id: string,
  billId: string,
  variantId: string,
  itemId: string,
  quantity: number,
  unitPrice: number,
  total: number,
  item: Product,
  variant: Variant
}
```

---

## Best Practices

### Component Structure
1. Imports at top
2. Component function
3. State and effects
4. Event handlers
5. Render JSX

### Naming Conventions
- Components: PascalCase (ProductCard.jsx)
- Functions: camelCase (handleAddToCart)
- Constants: UPPER_SNAKE_CASE (API_URL)
- Files: PascalCase for components, camelCase for utilities

### Error Handling
- Always handle API errors
- Show user-friendly error messages
- Log errors to console for debugging

### Performance
- Use React.memo for expensive components
- Lazy load images
- Minimize re-renders
- Use useCallback for event handlers

### Accessibility
- Use semantic HTML
- Add alt text to images
- Use proper heading hierarchy
- Ensure keyboard navigation

---

## Common Patterns

### Fetching Data
```jsx
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getItems(businessId);
      setData(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, [businessId]);
```

### Form Handling
```jsx
const [formData, setFormData] = useState({
  name: '',
  email: ''
});

const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: value
  }));
};
```

### Conditional Rendering
```jsx
{loading ? (
  <LoadingSpinner />
) : error ? (
  <ErrorMessage error={error} />
) : data.length === 0 ? (
  <EmptyState />
) : (
  <DataDisplay data={data} />
)}
```

---

## Testing Tips

1. Test with different screen sizes
2. Test with slow network
3. Test with empty data
4. Test error scenarios
5. Test form validation
6. Test cart operations
7. Test checkout flow

---

## Debugging

### Browser DevTools
- Console: Check for errors
- Network: Check API calls
- Application: Check localStorage
- Elements: Inspect HTML structure

### React DevTools
- Component tree
- Props inspection
- State inspection
- Performance profiling

### Common Issues
- Check console for errors
- Verify API responses
- Check localStorage data
- Verify component props
- Check network requests

---

**Last Updated**: 2024
