import React, { useState, useEffect } from 'react'
import {
  Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Box, IconButton, FormControl, InputLabel,
  Select, MenuItem, Grid
} from '@mui/material'
import { Add, Edit, Delete, QrCode, Search, Inventory } from '@mui/icons-material'
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
    stockQuantity: ''
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
      stockQuantity: item.stockQuantity?.toString() || '0'
    } : {
      itemName: '',
      categoryId: '',
      costPrice: '',
      sellingPrice: '',
      stockQuantity: ''
    })
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setEditingItem(null)
    setFormData({ itemName: '', categoryId: '', costPrice: '', sellingPrice: '', stockQuantity: '' })
  }

  const handleSubmit = async () => {
    try {
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
    }
  }

  const showQRCode = async (item) => {
    try {
      const response = await axios.get(`/api/items/${item.id}/qr-image`)
      setSelectedItem({ ...item, qrImage: response.data.qrCode })
      setQrOpen(true)
    } catch (error) {
      console.error('Failed to generate QR code:', error)
    }
  }

  const downloadQRCode = () => {
    if (selectedItem?.qrImage) {
      const link = document.createElement('a')
      link.download = `${selectedItem.baseRefCode}-qr.png`
      link.href = selectedItem.qrImage
      link.click()
    }
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
    <Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
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
        <Grid item xs={12} md={4}>
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Items - {selectedBusiness.name}</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen()}
        >
          Add Item
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Item Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Base Ref Code</TableCell>
              <TableCell>Cost Price (LKR)</TableCell>
              <TableCell>Cost Price Code</TableCell>
              <TableCell>Selling Price (LKR)</TableCell>
              <TableCell>Total Stock</TableCell>
              <TableCell>Variants</TableCell>
              <TableCell>QR Code</TableCell>
              <TableCell>Actions</TableCell>
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
                <TableCell>{item._count?.variants || 0}</TableCell>
                <TableCell>
                  <IconButton onClick={() => showQRCode(item)}>
                    <QrCode />
                  </IconButton>
                </TableCell>
                <TableCell>
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

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
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
          />
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