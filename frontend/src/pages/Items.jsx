import React, { useState, useEffect } from 'react'
import {
  Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Box, IconButton, FormControl, InputLabel,
  Select, MenuItem, Grid, Chip
} from '@mui/material'
import { Add, Edit, Delete, QrCode2 as BarcodeIcon, Search, Inventory, AddCircle, RemoveCircle } from '@mui/icons-material'
import { useBusiness } from '../context/BusinessContext'
import { formatCurrency } from '../utils/currency'
import axios from 'axios'

const Items = () => {
  const { selectedBusiness } = useBusiness()
  const [items, setItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [categories, setCategories] = useState([])
  const [open, setOpen] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)
  const [barcodeOpen, setBarcodeOpen] = useState(false)
  const [stockOpen, setStockOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [editingItem, setEditingItem] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [stockData, setStockData] = useState({
    quantity: '',
    operation: 'add'
  })
  const [formData, setFormData] = useState({
    itemName: '',
    categoryId: '',
    costPrice: '',
    sellingPrice: '',
    stockQuantity: '',
    variants: [],
    tags: []
  })

  useEffect(() => {
    if (selectedBusiness) {
      fetchItems()
      fetchCategories()
    }
  }, [selectedBusiness])

  useEffect(() => {
    filterItems()
  }, [searchTerm, categoryFilter, items])

  const filterItems = () => {
    let filtered = items
    
    if (categoryFilter) {
      filtered = filtered.filter(item => item.categoryId === categoryFilter)
    }
    
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    setFilteredItems(filtered)
  }

  const fetchItems = async () => {
    try {
      const response = await axios.get(`/api/items/${selectedBusiness.id}`)
      setItems(response.data)
      setFilteredItems(response.data)
    } catch (error) {
      console.error('Failed to fetch items:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`/api/categories/${selectedBusiness.id}`)
      setCategories(response.data)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const handleOpen = (item = null) => {
    setEditingItem(item)
    setFormData(item ? {
      itemName: item.itemName,
      categoryId: item.categoryId,
      costPrice: item.costPrice.toString(),
      sellingPrice: item.sellingPrice.toString(),
      stockQuantity: item.stockQuantity?.toString() || '0',
      variants: item.variants || [],
      tags: item.tags || []
    } : {
      itemName: '',
      categoryId: '',
      costPrice: '',
      sellingPrice: '',
      stockQuantity: '',
      variants: [],
      tags: []
    })
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setEditingItem(null)
    setFormData({ itemName: '', categoryId: '', costPrice: '', sellingPrice: '', stockQuantity: '', variants: [], tags: [] })
  }

  const handleSubmit = async () => {
    try {
      if (formData.variants.length > 0) {
        const variantTotal = formData.variants.reduce((sum, v) => sum + (parseInt(v.quantity) || 0), 0)
        const totalStock = parseInt(formData.stockQuantity) || 0
        if (variantTotal !== totalStock) {
          alert(`Total stock must equal sum of variant quantities. Variant total: ${variantTotal}, Stock: ${totalStock}`)
          return
        }
      }
      
      const data = { ...formData, businessId: selectedBusiness.id }
      
      if (editingItem) {
        await axios.put(`/api/items/${editingItem.id}`, formData)
      } else {
        await axios.post('/api/items', data)
      }
      
      await fetchItems()
      handleClose()
    } catch (error) {
      console.error('Failed to save item:', error)
      alert(error.response?.data?.error || 'Failed to save item')
    }
  }

  const showBarcodes = async (item) => {
    setSelectedItem(item)
    setBarcodeOpen(true)
  }

  const downloadQRCode = () => {
    if (selectedItem?.qrImage) {
      const link = document.createElement('a')
      link.download = `${selectedItem.baseRefCode}-qr.png`
      link.href = selectedItem.qrImage
      link.click()
    }
  }

  const getTagColor = (tag) => {
    const tagLower = tag.toLowerCase()
    if (tagLower.includes('women') || tagLower.includes('woman')) return '#9c27b0'
    if (tagLower.includes('kids') || tagLower.includes('kid') || tagLower.includes('children')) return '#2196f3'
    if (tagLower.includes('men') || tagLower.includes('mens') || tagLower.includes('male')) return '#4caf50'
    if (tagLower.includes('summer') || tagLower.includes('spring')) return '#ff9800'
    if (tagLower.includes('winter') || tagLower.includes('fall')) return '#00bcd4'
    if (tagLower.includes('sale') || tagLower.includes('discount')) return '#f44336'
    return '#757575'
  }

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [...formData.variants, { color: '', size: '', quantity: 0 }]
    })
  }

  const removeVariant = (index) => {
    const newVariants = formData.variants.filter((_, i) => i !== index)
    setFormData({ ...formData, variants: newVariants })
  }

  const updateVariant = (index, field, value) => {
    const newVariants = [...formData.variants]
    newVariants[index] = { ...newVariants[index], [field]: value }
    setFormData({ ...formData, variants: newVariants })
  }

  const calculateVariantTotal = () => {
    return formData.variants.reduce((sum, v) => sum + (parseInt(v.quantity) || 0), 0)
  }

  const handleStockUpdate = async () => {
    try {
      await axios.put(`/api/items/${selectedItem.id}/stock`, stockData)
      await fetchItems()
      setStockOpen(false)
      setStockData({ quantity: '', operation: 'add' })
    } catch (error) {
      console.error('Failed to update stock:', error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`/api/items/${id}`)
        await fetchItems()
      } catch (error) {
        console.error('Failed to delete item:', error)
      }
    }
  }

  if (!selectedBusiness) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" color="text.secondary">
          Please select a business to manage items
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ px: { xs: 0, sm: 0 } }}>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Search items or categories"
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth>
            <InputLabel>Filter by Category</InputLabel>
            <Select
              value={categoryFilter}
              label="Filter by Category"
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.categoryName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 3, gap: { xs: 2, sm: 0 } }}>
        <Typography variant="h4" sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>Items - {selectedBusiness.name}</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen()}
        >
          Add Item
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: 120 }}>Item Name</TableCell>
              <TableCell sx={{ minWidth: 100 }}>Category</TableCell>
              <TableCell sx={{ minWidth: 100 }}>Base Ref Code</TableCell>
              <TableCell sx={{ minWidth: 100 }}>Cost Price (LKR)</TableCell>
              <TableCell sx={{ minWidth: 100 }}>Cost Price Code</TableCell>
              <TableCell sx={{ minWidth: 100 }}>Selling Price (LKR)</TableCell>
              <TableCell sx={{ minWidth: 80 }}>Total Stock</TableCell>
              <TableCell sx={{ minWidth: 150 }}>Variants & Tags</TableCell>
              <TableCell sx={{ minWidth: 150 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.itemName}</TableCell>
                <TableCell>{item.category.categoryName}</TableCell>
                <TableCell>{item.baseRefCode}</TableCell>
                <TableCell>{formatCurrency(item.costPrice)}</TableCell>
                <TableCell>{item.costPriceCode}</TableCell>
                <TableCell>{formatCurrency(item.sellingPrice)}</TableCell>
                <TableCell>{item.totalStock || 0}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {item.variants && item.variants.length > 0 && (
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {item.variants.map((v, i) => (
                          <Chip 
                            key={i} 
                            label={`${v.color || ''}${v.size ? ' ' + v.size : ''}: ${v.quantity}`}
                            size="small"
                          />
                        ))}
                      </Box>
                    )}
                    {item.tags && item.tags.length > 0 && (
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {item.tags.map((tag, i) => (
                          <Chip 
                            key={i} 
                            label={tag}
                            size="small"
                            variant="outlined"
                            sx={{ borderColor: getTagColor(tag), color: getTagColor(tag) }}
                          />
                        ))}
                      </Box>
                    )}
                    {(!item.variants || item.variants.length === 0) && (!item.tags || item.tags.length === 0) && 'None'}
                  </Box>
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => showBarcodes(item)}>
                    <BarcodeIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      setSelectedItem(item)
                      setStockOpen(true)
                    }}
                  >
                    <Inventory />
                  </IconButton>
                  <IconButton onClick={() => handleOpen(item)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(item.id)} color="error">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth fullScreen={window.innerWidth < 600}>
        <DialogTitle>
          {editingItem ? 'Edit Item' : 'Add Item'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Item Name"
            fullWidth
            variant="outlined"
            value={formData.itemName}
            onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
            sx={{ mb: 2 }}
          />
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={formData.categoryId}
              label="Category"
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.categoryName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            margin="dense"
            label="Cost Price (LKR)"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.costPrice}
            onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Selling Price (LKR)"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.sellingPrice}
            onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Stock Quantity"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.stockQuantity}
            onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
            sx={{ mb: 2 }}
          />
          
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle1">Tags (Optional)</Typography>
              <Button startIcon={<AddCircle />} onClick={() => setFormData({ ...formData, tags: [...formData.tags, ''] })} size="small">
                Add Tag
              </Button>
            </Box>
            
            {formData.tags.map((tag, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                <TextField
                  label="Tag (e.g., Women, Kids, Summer)"
                  size="small"
                  fullWidth
                  value={tag}
                  onChange={(e) => {
                    const newTags = [...formData.tags]
                    newTags[index] = e.target.value
                    setFormData({ ...formData, tags: newTags })
                  }}
                />
                <IconButton onClick={() => setFormData({ ...formData, tags: formData.tags.filter((_, i) => i !== index) })} color="error" size="small">
                  <RemoveCircle />
                </IconButton>
              </Box>
            ))}
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle1">Variants (Optional)</Typography>
              <Button startIcon={<AddCircle />} onClick={addVariant} size="small">
                Add Variant
              </Button>
            </Box>
            
            {formData.variants.length > 0 && (
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" color={calculateVariantTotal() === parseInt(formData.stockQuantity || 0) ? 'success.main' : 'error.main'}>
                  Variant Total: {calculateVariantTotal()} / {formData.stockQuantity || 0}
                </Typography>
              </Box>
            )}
            
            {formData.variants.map((variant, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                <TextField
                  label="Color"
                  size="small"
                  value={variant.color}
                  onChange={(e) => updateVariant(index, 'color', e.target.value)}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Size"
                  size="small"
                  value={variant.size}
                  onChange={(e) => updateVariant(index, 'size', e.target.value)}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Quantity"
                  type="number"
                  size="small"
                  value={variant.quantity}
                  onChange={(e) => updateVariant(index, 'quantity', parseInt(e.target.value) || 0)}
                  sx={{ width: 100 }}
                />
                <IconButton onClick={() => removeVariant(index)} color="error" size="small">
                  <RemoveCircle />
                </IconButton>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingItem ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Stock Update Dialog */}
      <Dialog open={stockOpen} onClose={() => setStockOpen(false)}>
        <DialogTitle>Update Stock - {selectedItem?.itemName}</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Current Stock: {selectedItem?.stockQuantity || 0}
          </Typography>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Operation</InputLabel>
            <Select
              value={stockData.operation}
              label="Operation"
              onChange={(e) => setStockData({ ...stockData, operation: e.target.value })}
            >
              <MenuItem value="add">Add Stock</MenuItem>
              <MenuItem value="subtract">Remove Stock</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            label="Quantity"
            type="number"
            fullWidth
            variant="outlined"
            value={stockData.quantity}
            onChange={(e) => setStockData({ ...stockData, quantity: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStockOpen(false)}>Cancel</Button>
          <Button onClick={handleStockUpdate} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>

      {/* Barcode Dialog */}
      <Dialog open={barcodeOpen} onClose={() => setBarcodeOpen(false)} maxWidth="md" fullWidth fullScreen={window.innerWidth < 600}>
        <DialogTitle>Barcodes - {selectedItem?.itemName}</DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            {selectedItem && (
              <Box>
                {/* Item Barcode */}
                {selectedItem.barcode && (
                  <Box sx={{ mb: 3, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>Item Barcode</Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {selectedItem.baseRefCode}
                    </Typography>
                    <Box sx={{ textAlign: 'center', my: 2 }}>
                      <img 
                        src={`https://barcode.tec-it.com/barcode.ashx?data=${selectedItem.barcode}&code=EAN13&translate-esc=on`}
                        alt="Barcode"
                        style={{ maxWidth: '100%' }}
                      />
                    </Box>
                    <Typography variant="caption" sx={{ display: 'block', textAlign: 'center' }}>
                      {selectedItem.barcode}
                    </Typography>
                  </Box>
                )}
                
                {/* Variant Barcodes */}
                {selectedItem.variants && selectedItem.variants.length > 0 && (
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>Inline Variant Barcodes</Typography>
                    {selectedItem.variants.map((variant, index) => (
                      <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                        <Typography variant="body2" gutterBottom>
                          {variant.color && `Color: ${variant.color}`}
                          {variant.color && variant.size && ' | '}
                          {variant.size && `Size: ${variant.size}`}
                          {' - Stock: '}{variant.quantity}
                        </Typography>
                        {variant.barcode && (
                          <>
                            <Box sx={{ textAlign: 'center', my: 2 }}>
                              <img 
                                src={`https://barcode.tec-it.com/barcode.ashx?data=${variant.barcode}&code=EAN13&translate-esc=on`}
                                alt="Variant Barcode"
                                style={{ maxWidth: '100%' }}
                              />
                            </Box>
                            <Typography variant="caption" sx={{ display: 'block', textAlign: 'center' }}>
                              {variant.barcode}
                            </Typography>
                          </>
                        )}
                        {!variant.barcode && (
                          <Typography variant="caption" color="error">
                            No barcode generated. Please update this item to generate barcodes.
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Box>
                )}
                
                {!selectedItem.barcode && (!selectedItem.variants || selectedItem.variants.length === 0) && (
                  <Typography color="text.secondary">No barcode available for this item</Typography>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBarcodeOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={qrOpen} onClose={() => setQrOpen(false)}>
        <DialogTitle>QR Code - {selectedItem?.baseRefCode}</DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          {selectedItem?.qrImage && (
            <img src={selectedItem.qrImage} alt="QR Code" style={{ maxWidth: '100%' }} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={downloadQRCode}>Download</Button>
          <Button onClick={() => setQrOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Items
