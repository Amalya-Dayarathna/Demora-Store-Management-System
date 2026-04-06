import React, { useState, useEffect } from 'react'
import {
  Typography, Button, Paper, Box, TextField, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid,
  Card, CardContent, Divider, Alert, Collapse, FormControl,
  InputLabel, Select, MenuItem, Autocomplete
} from '@mui/material'
import { Add, Remove, Delete, QrCode2 as BarcodeIcon, Print, Download, ExpandMore, ExpandLess } from '@mui/icons-material'
import { useBusiness } from '../context/BusinessContext'
import BarcodeScanner from '../components/BarcodeScanner'
import { formatCurrency } from '../utils/currency'
import axios from 'axios'

const Billing = () => {
  const { selectedBusiness } = useBusiness()
  const [cart, setCart] = useState([])
  const [barcodeScanOpen, setBarcodeScanOpen] = useState(false)
  const [barcodeInput, setBarcodeInput] = useState('')
  const [barcodeSearching, setBarcodeSearching] = useState(false)
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    phone2: '',
    address: '',
    orderId: '',
    trackingId: ''
  })
  const [showCustomerInfo, setShowCustomerInfo] = useState(false)
  const [codDelivery, setCodDelivery] = useState(0)
  const [packagingCost, setPackagingCost] = useState(0)
  const [paymentType, setPaymentType] = useState('COD')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [createdBill, setCreatedBill] = useState(null)
  const [showBillSummary, setShowBillSummary] = useState(false)
  const [items, setItems] = useState([])
  const [variants, setVariants] = useState([])

  useEffect(() => {
    if (selectedBusiness) {
      fetchItemsAndVariants()
    }
  }, [selectedBusiness])

  const fetchItemsAndVariants = async () => {
    try {
      const [itemsRes, variantsRes] = await Promise.all([
        axios.get(`/api/items/${selectedBusiness.id}`),
        axios.get(`/api/variants/${selectedBusiness.id}`)
      ])
      setItems(itemsRes.data)
      
      // Create virtual variants from items with inline variants
      const inlineVariants = []
      itemsRes.data.forEach(item => {
        if (item.variants && item.variants.length > 0) {
          item.variants.forEach((v, index) => {
            inlineVariants.push({
              id: `${item.id}-${index}`,
              variantCode: `${item.baseRefCode}-${v.color || ''}${v.size || ''}`,
              attributes: { color: v.color, size: v.size },
              stockQuantity: v.quantity,
              item: item,
              isInlineVariant: true,
              variantIndex: index
            })
          })
        }
      })
      
      setVariants([...variantsRes.data, ...inlineVariants])
    } catch (error) {
      console.error('Failed to fetch items and variants:', error)
    }
  }

  const addToCartFromDropdown = (selectedOption) => {
    if (!selectedOption) return
    
    const isVariant = selectedOption.type === 'variant'
    const cartItemId = isVariant ? selectedOption.id : `item-${selectedOption.id}`
    const stockQuantity = selectedOption.stockQuantity
    const price = isVariant ? selectedOption.item.sellingPrice : selectedOption.sellingPrice
    
    const existingItem = cart.find(item => item.variantId === cartItemId)
    if (existingItem) {
      if (existingItem.quantity >= stockQuantity) {
        setError('Insufficient stock')
        return
      }
      setCart(cart.map(item =>
        item.variantId === cartItemId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      if (stockQuantity === 0) {
        setError('Out of stock')
        return
      }
      
      const variant = isVariant ? selectedOption : {
        id: `item-${selectedOption.id}`,
        variantCode: selectedOption.baseRefCode,
        stockQuantity: selectedOption.stockQuantity,
        item: selectedOption,
        isItemVariant: true
      }
      
      setCart([...cart, {
        variantId: cartItemId,
        variant,
        quantity: 1,
        price
      }])
    }
    setError('')
  }

  const addToCartByBarcode = async (barcode) => {
    if (!barcode || !barcode.trim()) return
    
    setBarcodeSearching(true)
    try {
      const response = await axios.get(`/api/variants/barcode/${barcode.trim()}?businessId=${selectedBusiness.id}`)
      const variant = response.data
      
      // Handle virtual variant ID for items and inline variants
      const cartItemId = variant.isItemVariant ? `item-${variant.item.id}` : 
                        variant.isInlineVariant ? `${variant.itemId}-${variant.variantIndex}` :
                        variant.id
      
      const existingItem = cart.find(item => item.variantId === cartItemId)
      if (existingItem) {
        if (existingItem.quantity >= variant.stockQuantity) {
          setError('Insufficient stock')
          setBarcodeSearching(false)
          return
        }
        setCart(cart.map(item =>
          item.variantId === cartItemId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ))
      } else {
        if (variant.stockQuantity === 0) {
          setError('Out of stock')
          setBarcodeSearching(false)
          return
        }
        setCart([...cart, {
          variantId: cartItemId,
          variant,
          quantity: 1,
          price: variant.item.sellingPrice
        }])
      }
      setError('')
      setBarcodeInput('')
    } catch (error) {
      setError(error.response?.data?.error || 'Barcode not found')
    } finally {
      setBarcodeSearching(false)
    }
  }

  const updateQuantity = (variantId, newQuantity) => {
    if (newQuantity === 0) {
      setCart(cart.filter(item => item.variantId !== variantId))
    } else {
      setCart(cart.map(item =>
        item.variantId === variantId
          ? { ...item, quantity: newQuantity }
          : item
      ))
    }
  }

  const removeFromCart = (variantId) => {
    setCart(cart.filter(item => item.variantId !== variantId))
  }

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const grandTotal = subtotal + parseFloat(codDelivery || 0) + parseFloat(packagingCost || 0)
    return { subtotal, grandTotal }
  }

  const handleCreateBill = async () => {
    if (cart.length === 0) {
      setError('Cart is empty')
      return
    }

    try {
      setLoading(true)
      const billData = {
        businessId: selectedBusiness.id,
        items: cart.map(item => ({
          variantId: item.variantId,
          quantity: item.quantity
        })),
        codDelivery: parseFloat(codDelivery || 0),
        packagingCost: parseFloat(packagingCost || 0),
        paymentType,
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        customerPhone2: customerInfo.phone2,
        customerAddress: customerInfo.address,
        orderId: customerInfo.orderId,
        trackingId: customerInfo.trackingId
      }

      const response = await axios.post('/api/bills', billData)
      const newBill = response.data
      
      // Reset form
      setCart([])
      setCustomerInfo({ name: '', phone: '', phone2: '', address: '', orderId: '', trackingId: '' })
      setCodDelivery(0)
      setPackagingCost(0)
      setPaymentType('COD')
      setError('')
      setShowCustomerInfo(false)
      
      // Show bill summary
      setCreatedBill(newBill)
      setShowBillSummary(true)
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create bill')
    } finally {
      setLoading(false)
    }
  }

  const printBill = () => {
    const printWindow = window.open('', '_blank')
    const billContent = generateBillHTML()
    printWindow.document.write(billContent)
    printWindow.document.close()
    printWindow.print()
  }

  const downloadBill = () => {
    const billContent = generateBillHTML()
    const blob = new Blob([billContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bill-${createdBill?.billNumber}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  const generateBillHTML = () => {
    if (!createdBill) return ''
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bill - ${createdBill.billNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 20px; }
          .bill-info { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .totals { text-align: right; }
          .total-row { font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>${selectedBusiness.name}</h2>
          <h3>BILL</h3>
        </div>
        
        <div class="bill-info">
          <p><strong>Bill Number:</strong> ${createdBill.billNumber}</p>
          <p><strong>Date:</strong> ${new Date(createdBill.createdAt).toLocaleDateString()}</p>
          ${createdBill.customerName ? `<p><strong>Customer:</strong> ${createdBill.customerName}</p>` : ''}
          ${createdBill.customerPhone ? `<p><strong>Phone:</strong> ${createdBill.customerPhone}</p>` : ''}
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Variant</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${createdBill.billItems.map(item => `
              <tr>
                <td>${item.variant?.item?.itemName || item.item?.itemName}</td>
                <td>${item.variant?.variantCode || item.item?.baseRefCode}</td>
                <td>${item.quantity}</td>
                <td>LKR ${item.unitPrice.toFixed(2)}</td>
                <td>LKR ${item.total.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="totals">
          <p>Subtotal: LKR ${createdBill.subtotal.toFixed(2)}</p>
          ${createdBill.codDelivery > 0 ? `<p>COD Delivery: LKR ${createdBill.codDelivery.toFixed(2)}</p>` : ''}
          ${createdBill.packagingCost > 0 ? `<p>Packaging Cost: LKR ${createdBill.packagingCost.toFixed(2)}</p>` : ''}
          <p class="total-row">Grand Total: LKR ${createdBill.grandTotal.toFixed(2)}</p>
        </div>
      </body>
      </html>
    `
  }

  const { subtotal, grandTotal } = calculateTotals()

  if (!selectedBusiness) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" color="text.secondary">
          Please select a business to create bills
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ px: { xs: 0, sm: 0 } }}>
      <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
        Billing - {selectedBusiness.name}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: { xs: 1.5, sm: 2 }, mb: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                <TextField
                  label="Scan/Enter Barcode"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && barcodeInput.trim()) {
                      addToCartByBarcode(barcodeInput.trim())
                    }
                  }}
                  fullWidth
                  autoFocus
                  placeholder="Scan barcode or type manually..."
                  disabled={barcodeSearching}
                  InputProps={{
                    endAdornment: barcodeSearching ? (
                      <Typography variant="caption" color="text.secondary">Searching...</Typography>
                    ) : null
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  variant="contained"
                  startIcon={<BarcodeIcon />}
                  onClick={() => setBarcodeScanOpen(true)}
                  fullWidth
                  sx={{ height: '56px' }}
                >
                  Barcode Scanner
                </Button>
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: { xs: 1.5, sm: 2 }, mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Or select from list:</Typography>
            <Autocomplete
              options={[
                ...items.filter(item => item.stockQuantity > 0 && (!item.variants || item.variants.length === 0)).map(item => ({
                  ...item,
                  type: 'item',
                  label: `${item.itemName} (${item.baseRefCode}) - Stock: ${item.stockQuantity}`
                })),
                ...variants.filter(variant => variant.stockQuantity > 0).map(variant => ({
                  ...variant,
                  type: 'variant',
                  label: `${variant.item.itemName} - ${variant.variantCode} - Stock: ${variant.stockQuantity}`
                }))
              ]}
              getOptionLabel={(option) => option.label}
              onChange={(event, value) => addToCartFromDropdown(value)}
              renderInput={(params) => (
                <TextField {...params} label="Select Item/Variant" fullWidth />
              )}
            />
          </Paper>

          <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Item</TableCell>
                  <TableCell>Variant</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cart.map((item) => (
                  <TableRow key={item.variantId}>
                    <TableCell sx={{ minWidth: { xs: 120, sm: 'auto' } }}>{item.variant.item.itemName}</TableCell>
                    <TableCell sx={{ minWidth: { xs: 100, sm: 'auto' } }}>{item.variant.variantCode}</TableCell>
                    <TableCell>{formatCurrency(item.price)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        >
                          <Remove />
                        </IconButton>
                        {item.quantity}
                        <IconButton
                          size="small"
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          disabled={item.quantity >= item.variant.stockQuantity}
                        >
                          <Add />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell>{formatCurrency(item.price * item.quantity)}</TableCell>
                    <TableCell>
                      <IconButton
                        color="error"
                        onClick={() => removeFromCart(item.variantId)}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Customer Information
                </Typography>
                <Button
                  size="small"
                  onClick={() => setShowCustomerInfo(!showCustomerInfo)}
                  endIcon={showCustomerInfo ? <ExpandLess /> : <ExpandMore />}
                >
                  {showCustomerInfo ? 'Hide' : 'Add Customer'}
                </Button>
              </Box>
              
              <Collapse in={showCustomerInfo}>
                <TextField
                  label="Customer Name (Optional)"
                  fullWidth
                  margin="dense"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                />
                <TextField
                  label="Phone (Optional)"
                  fullWidth
                  margin="dense"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                />
                <TextField
                  label="Phone 2 (Optional)"
                  fullWidth
                  margin="dense"
                  value={customerInfo.phone2}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone2: e.target.value })}
                />
                <TextField
                  label="Address (Optional)"
                  fullWidth
                  multiline
                  rows={2}
                  margin="dense"
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                />
                <TextField
                  label="Order ID (Optional)"
                  fullWidth
                  margin="dense"
                  value={customerInfo.orderId}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, orderId: e.target.value })}
                />
                <TextField
                  label="Tracking ID (Optional)"
                  fullWidth
                  margin="dense"
                  value={customerInfo.trackingId}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, trackingId: e.target.value })}
                />
                <Divider sx={{ my: 2 }} />
              </Collapse>
              
              <TextField
                label="COD Delivery Charge (LKR)"
                type="number"
                fullWidth
                margin="dense"
                value={codDelivery}
                onChange={(e) => setCodDelivery(e.target.value)}
              />
              
              <TextField
                label="Packaging Cost (LKR)"
                type="number"
                fullWidth
                margin="dense"
                value={packagingCost}
                onChange={(e) => setPackagingCost(e.target.value)}
              />
              
              <FormControl fullWidth margin="dense">
                <InputLabel>Payment Type</InputLabel>
                <Select
                  value={paymentType}
                  label="Payment Type"
                  onChange={(e) => setPaymentType(e.target.value)}
                >
                  <MenuItem value="COD">Cash on Delivery (COD)</MenuItem>
                  <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                </Select>
              </FormControl>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Subtotal:</Typography>
                <Typography>{formatCurrency(subtotal)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>COD Delivery:</Typography>
                <Typography>{formatCurrency(codDelivery || 0)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Packaging Cost:</Typography>
                <Typography>{formatCurrency(packagingCost || 0)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Grand Total:</Typography>
                <Typography variant="h6">{formatCurrency(grandTotal)}</Typography>
              </Box>
              
              <Button
                variant="contained"
                fullWidth
                onClick={handleCreateBill}
                disabled={loading || cart.length === 0}
              >
                {loading ? 'Creating Bill...' : 'Create Bill'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bill Summary */}
      {showBillSummary && createdBill && (
        <Paper sx={{ mt: 3, p: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 2, gap: { xs: 2, sm: 0 } }}>
            <Typography variant="h5" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>Bill Created Successfully!</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                startIcon={<Print />}
                onClick={printBill}
              >
                Print Bill
              </Button>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={downloadBill}
              >
                Download
              </Button>
              <Button
                onClick={() => setShowBillSummary(false)}
              >
                Close
              </Button>
            </Box>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6" gutterBottom>Bill Details</Typography>
              <Typography><strong>Bill Number:</strong> {createdBill.billNumber}</Typography>
              <Typography><strong>Date:</strong> {new Date(createdBill.createdAt).toLocaleDateString()}</Typography>
              <Typography><strong>Status:</strong> {createdBill.status}</Typography>
              {createdBill.customerName && (
                <Typography><strong>Customer:</strong> {createdBill.customerName}</Typography>
              )}
              {createdBill.customerPhone && (
                <Typography><strong>Phone:</strong> {createdBill.customerPhone}</Typography>
              )}
              {createdBill.customerPhone2 && (
                <Typography><strong>Phone 2:</strong> {createdBill.customerPhone2}</Typography>
              )}
              {createdBill.orderId && (
                <Typography><strong>Order ID:</strong> {createdBill.orderId}</Typography>
              )}
              {createdBill.trackingId && (
                <Typography><strong>Tracking ID:</strong> {createdBill.trackingId}</Typography>
              )}
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="h6" gutterBottom>Amount Summary</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Subtotal:</Typography>
                <Typography>{formatCurrency(createdBill.subtotal)}</Typography>
              </Box>
              {createdBill.codDelivery > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>COD Delivery:</Typography>
                  <Typography>{formatCurrency(createdBill.codDelivery)}</Typography>
                </Box>
              )}
              {createdBill.packagingCost > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Packaging Cost:</Typography>
                  <Typography>{formatCurrency(createdBill.packagingCost)}</Typography>
                </Box>
              )}
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">Grand Total:</Typography>
                <Typography variant="h6">{formatCurrency(createdBill.grandTotal)}</Typography>
              </Box>
            </Grid>
          </Grid>
          
          <Typography variant="h6" sx={{ mt: 2, mb: 1, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>Items</Typography>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Item</TableCell>
                  <TableCell>Variant</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Unit Price</TableCell>
                  <TableCell>Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {createdBill.billItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.variant?.item?.itemName || item.item?.itemName}</TableCell>
                    <TableCell>{item.variant?.variantCode || item.item?.baseRefCode}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                    <TableCell>{formatCurrency(item.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <BarcodeScanner 
        open={barcodeScanOpen} 
        onClose={() => setBarcodeScanOpen(false)}
        onScan={(code) => {
          addToCartByBarcode(code)
          setBarcodeScanOpen(false)
        }}
      />
    </Box>
  )
}

export default Billing