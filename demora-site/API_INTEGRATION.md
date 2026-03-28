# API Integration Guide

## Overview

The Demora e-commerce store integrates with your existing Node.js/Express backend. This guide explains how the API integration works and how to extend it.

---

## API Configuration

### Base URL
```javascript
// .env
VITE_API_URL=http://localhost:5001/api
```

### Axios Instance
```javascript
// src/services/api.js
const api = axios.create({
  baseURL: API_URL,
});
```

---

## API Endpoints

### 1. Get All Businesses

**Endpoint**: `GET /businesses`

**Purpose**: Fetch all businesses to find Demora

**Response**:
```javascript
[
  {
    id: "cuid123",
    name: "Demora",
    description: "Premium products",
    color: "#000000",
    status: "active",
    createdAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "cuid456",
    name: "Lilac",
    description: "Another business",
    color: "#FF69B4",
    status: "active",
    createdAt: "2024-01-01T00:00:00Z"
  }
]
```

**Usage Example**:
```javascript
import { apiService } from '../services/api';

const fetchBusinesses = async () => {
  try {
    const response = await apiService.getBusinesses();
    const demora = response.data.find(
      (b) => b.name.toLowerCase() === 'demora'
    );
    console.log('Demora Business ID:', demora.id);
  } catch (error) {
    console.error('Failed to fetch businesses:', error);
  }
};
```

---

### 2. Get Products by Business

**Endpoint**: `GET /items/:businessId`

**Purpose**: Fetch all products for a specific business

**Parameters**:
- `businessId` (string): The business ID

**Response**:
```javascript
[
  {
    id: "item123",
    itemName: "Premium Shirt",
    categoryId: "cat123",
    baseRefCode: "SHIRT-001",
    costPrice: 20,
    costPriceCode: "DDD",
    sellingPrice: 49.99,
    stockQuantity: 100,
    totalStock: 100,  // Calculated: stockQuantity + variant stocks
    variants: [],
    tags: ["Men", "Clothing"],
    images: ["image1.jpg", "image2.jpg"],
    category: {
      id: "cat123",
      categoryName: "Clothing",
      categoryCode: "CLO"
    }
  }
]
```

**Usage Example**:
```javascript
const fetchProducts = async (businessId) => {
  try {
    const response = await apiService.getItems(businessId);
    const products = response.data;
    console.log(`Found ${products.length} products`);
    
    // Filter out of stock items
    const inStock = products.filter(p => p.totalStock > 0);
    console.log(`${inStock.length} items in stock`);
  } catch (error) {
    console.error('Failed to fetch products:', error);
  }
};
```

---

### 3. Create Order (Bill)

**Endpoint**: `POST /bills`

**Purpose**: Create a new order

**Request Body**:
```javascript
{
  businessId: "cuid123",
  items: [
    {
      variantId: "item-product123",  // Virtual variant ID for items
      quantity: 2
    },
    {
      variantId: "variant456",       // Real variant ID
      quantity: 1
    }
  ],
  customerName: "John Doe",
  customerPhone: "+1234567890",
  customerAddress: "123 Main St, City, State 12345",
  paymentType: "COD",                // "COD" or "Bank Transfer"
  codDelivery: 5.00,                 // Optional
  packagingCost: 2.50                // Optional
}
```

**Response**:
```javascript
{
  id: "bill123",
  billNumber: "BILL-1704067200000-1",
  subtotal: 99.98,
  codDelivery: 5.00,
  packagingCost: 2.50,
  grandTotal: 107.48,
  status: "Ordered",
  paymentType: "COD",
  paymentStatus: "Pending",
  customerName: "John Doe",
  customerPhone: "+1234567890",
  customerAddress: "123 Main St, City, State 12345",
  businessId: "cuid123",
  createdAt: "2024-01-01T12:00:00Z",
  billItems: [
    {
      id: "billitem123",
      billId: "bill123",
      itemId: "product123",
      quantity: 2,
      unitPrice: 49.99,
      total: 99.98,
      item: { /* product details */ }
    }
  ]
}
```

**Usage Example**:
```javascript
const createOrder = async (orderData) => {
  try {
    const response = await apiService.createBill(orderData);
    const order = response.data;
    
    console.log('Order created:', order.billNumber);
    console.log('Total:', order.grandTotal);
    
    // Store order for confirmation page
    localStorage.setItem('lastOrder', JSON.stringify(order));
    
    return order;
  } catch (error) {
    console.error('Failed to create order:', error);
    throw error;
  }
};
```

---

## Implementation Examples

### Example 1: Fetch and Display Products

```javascript
// src/pages/Shop.jsx
import { useEffect, useState } from 'react';
import { apiService } from '../services/api';

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Step 1: Get all businesses
        const businessesRes = await apiService.getBusinesses();
        
        // Step 2: Find Demora business
        const demora = businessesRes.data.find(
          (b) => b.name.toLowerCase() === 'demora'
        );
        
        if (!demora) {
          setError('Demora business not found');
          return;
        }
        
        // Step 3: Get products for Demora
        const itemsRes = await apiService.getItems(demora.id);
        setProducts(itemsRes.data);
        
      } catch (err) {
        setError('Failed to load products');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {products.map(product => (
        <div key={product.id}>
          <h3>{product.itemName}</h3>
          <p>${product.sellingPrice}</p>
          <p>Stock: {product.totalStock}</p>
        </div>
      ))}
    </div>
  );
}
```

---

### Example 2: Create Order from Cart

```javascript
// src/pages/Checkout.jsx
import { useCart } from '../context/CartContext';
import { apiService } from '../services/api';

export default function Checkout() {
  const { cart, getTotalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Step 1: Get business ID
      const businessesRes = await apiService.getBusinesses();
      const demora = businessesRes.data.find(
        (b) => b.name.toLowerCase() === 'demora'
      );
      
      // Step 2: Prepare bill items
      const billItems = cart.map(item => ({
        variantId: `item-${item.id}`,  // Virtual variant ID
        quantity: item.quantity
      }));
      
      // Step 3: Create bill
      const billData = {
        businessId: demora.id,
        items: billItems,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerAddress: formData.customerAddress,
        paymentType: formData.paymentType,
        codDelivery: parseFloat(formData.codDelivery) || 0,
        packagingCost: parseFloat(formData.packagingCost) || 0
      };
      
      const response = await apiService.createBill(billData);
      
      // Step 4: Handle success
      localStorage.setItem('lastOrder', JSON.stringify(response.data));
      clearCart();
      navigate('/order-confirmation');
      
    } catch (error) {
      console.error('Failed to create order:', error);
      setError(error.response?.data?.error || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={loading}>
        {loading ? 'Processing...' : 'Place Order'}
      </button>
    </form>
  );
}
```

---

### Example 3: Error Handling

```javascript
// Comprehensive error handling
const fetchWithErrorHandling = async () => {
  try {
    const response = await apiService.getItems(businessId);
    return response.data;
  } catch (error) {
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      console.error('Server error:', error.response.status);
      console.error('Error message:', error.response.data.error);
      
      if (error.response.status === 404) {
        throw new Error('Business not found');
      } else if (error.response.status === 500) {
        throw new Error('Server error. Please try again later.');
      }
    } else if (error.request) {
      // Request made but no response
      console.error('No response from server');
      throw new Error('Network error. Please check your connection.');
    } else {
      // Error in request setup
      console.error('Error:', error.message);
      throw new Error('An error occurred. Please try again.');
    }
  }
};
```

---

## Adding New API Endpoints

### Step 1: Add to API Service

```javascript
// src/services/api.js
export const apiService = {
  // Existing endpoints...
  
  // New endpoint
  getOrderHistory: (businessId) => 
    api.get(`/bills/${businessId}`),
  
  updateOrderStatus: (billId, status) => 
    api.put(`/bills/${billId}/status`, { status }),
};
```

### Step 2: Use in Component

```javascript
// src/pages/OrderHistory.jsx
import { apiService } from '../services/api';

const fetchOrderHistory = async (businessId) => {
  try {
    const response = await apiService.getOrderHistory(businessId);
    setOrders(response.data);
  } catch (error) {
    console.error('Failed to fetch orders:', error);
  }
};
```

---

## Request/Response Patterns

### Success Response
```javascript
{
  status: 200,
  data: { /* response data */ }
}
```

### Error Response
```javascript
{
  status: 400,
  data: {
    error: "Error message"
  }
}
```

### Handling Responses
```javascript
try {
  const response = await apiService.someMethod();
  // response.data contains the actual data
  console.log(response.data);
} catch (error) {
  // error.response.data contains error details
  console.error(error.response.data.error);
}
```

---

## Best Practices

### 1. Always Handle Errors
```javascript
try {
  const response = await apiService.getItems(businessId);
  setData(response.data);
} catch (error) {
  setError('Failed to load data');
  console.error(error);
}
```

### 2. Show Loading States
```javascript
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  setLoading(true);
  try {
    // API call
  } finally {
    setLoading(false);
  }
};
```

### 3. Validate Data Before Sending
```javascript
if (!formData.customerName || !formData.customerPhone) {
  setError('Please fill in all required fields');
  return;
}

const response = await apiService.createBill(formData);
```

### 4. Cache Data When Possible
```javascript
const [businesses, setBusinesses] = useState(null);

useEffect(() => {
  if (!businesses) {
    fetchBusinesses();
  }
}, []);
```

### 5. Use Proper HTTP Methods
- `GET` - Fetch data
- `POST` - Create data
- `PUT` - Update data
- `DELETE` - Delete data

---

## Debugging API Calls

### Check Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Make API call
4. Click on request
5. Check Request/Response tabs

### Log API Calls
```javascript
// Add logging to api.js
api.interceptors.request.use(config => {
  console.log('API Request:', config.method.toUpperCase(), config.url);
  return config;
});

api.interceptors.response.use(
  response => {
    console.log('API Response:', response.status, response.data);
    return response;
  },
  error => {
    console.error('API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);
```

### Test with Postman
1. Open Postman
2. Set method (GET, POST, etc.)
3. Enter URL: `http://localhost:5001/api/...`
4. Add headers if needed
5. Add body for POST requests
6. Send request

---

## Common Issues & Solutions

### Issue: CORS Error
**Solution**: Ensure backend has CORS enabled for localhost:3000

### Issue: 404 Not Found
**Solution**: Verify endpoint URL and business ID

### Issue: 400 Bad Request
**Solution**: Check request body format and required fields

### Issue: 500 Server Error
**Solution**: Check backend logs for errors

### Issue: Network Timeout
**Solution**: Check if backend is running and accessible

---

## Performance Tips

1. **Cache business ID** - Don't fetch businesses on every page
2. **Lazy load products** - Load products only when needed
3. **Debounce search** - Debounce search API calls
4. **Pagination** - Load products in batches
5. **Error retry** - Retry failed requests

---

## Security Considerations

1. **Never expose API keys** - Use environment variables
2. **Validate input** - Validate all user input
3. **Use HTTPS** - Use HTTPS in production
4. **Sanitize data** - Sanitize data before displaying
5. **Handle errors safely** - Don't expose sensitive error details

---

**Last Updated**: 2024
