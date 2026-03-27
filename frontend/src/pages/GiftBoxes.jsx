import React, { useState, useEffect } from 'react'
import {
  Typography, Button, Paper, Box, TextField, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle,
  DialogContent, DialogActions, Grid, Card, CardContent, FormControl,
  InputLabel, Select, MenuItem, IconButton, Divider
} from '@mui/material'
import { Add, Delete, Visibility, Edit } from '@mui/icons-material'
import { useBusiness } from '../context/BusinessContext'
import { formatCurrency } from '../utils/currency'
import axios from 'axios'

const GiftBoxes = () => {
  const { selectedBusiness } = useBusiness()
  const [giftBoxes, setGiftBoxes] = useState([])
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [open, setOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [selectedGiftBox, setSelectedGiftBox] = useState(null)
  const [editingGiftBox, setEditingGiftBox] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    packingCost: ''
  })
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedItem, setSelectedItem] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [giftBoxItems, setGiftBoxItems] = useState([])

  useEffect(() => {
    if (selectedBusiness) {
      fetchData()
    }
  }, [selectedBusiness])

  const fetchData = async () => {
    try {
      const [giftBoxRes, categoriesRes, itemsRes] = await Promise.all([
        axios.get(`/api/gift-boxes/${selectedBusiness.id}`),
        axios.get(`/api/categories/${selectedBusiness.id}`),
        axios.get(`/api/items/${selectedBusiness.id}`)
      ])
      setGiftBoxes(giftBoxRes.data)
      setCategories(categoriesRes.data)
      setItems(itemsRes.data)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  const handleOpen = (giftBox = null) => {
    setEditingGiftBox(giftBox)
    if (giftBox) {
      // Edit mode - populate form with existing data
      setFormData({
        name: giftBox.name,
        description: giftBox.description || '',
        packingCost: giftBox.packingCost.toString()
      })
      setGiftBoxItems(giftBox.items.map(item => ({
        itemId: item.item.id,
        item: item.item,
        quantity: item.quantity
      })))
    } else {
      // Create mode - reset form
      setFormData({ name: '', description: '', packingCost: '' })
      setGiftBoxItems([])
    }
    setSelectedCategory('')
    setSelectedItem('')
    setQuantity(1)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setEditingGiftBox(null)
  }

  const addItemToGiftBox = () => {
    if (!selectedItem) return
    
    const item = items.find(i => i.id === selectedItem)
    const existingItem = giftBoxItems.find(gi => gi.itemId === selectedItem)
    
    if (existingItem) {
      setGiftBoxItems(giftBoxItems.map(gi =>
        gi.itemId === selectedItem
          ? { ...gi, quantity: gi.quantity + quantity }
          : gi
      ))
    } else {
      setGiftBoxItems([...giftBoxItems, {
        itemId: selectedItem,
        item: item,
        quantity: quantity
      }])
    }
    
    setSelectedItem('')
    setQuantity(1)
  }

  const removeItemFromGiftBox = (itemId) => {
    setGiftBoxItems(giftBoxItems.filter(gi => gi.itemId !== itemId))
  }

  const calculateCostTotal = () => {
    const itemsCost = giftBoxItems.reduce((sum, gi) => 
      sum + (gi.item.sellingPrice * gi.quantity), 0
    )
    const packingCost = parseFloat(formData.packingCost || 0)
    return itemsCost + packingCost
  }

  const calculateProfit = () => {
    const totalCost = calculateCostTotal()
    const sellingPrice = parseFloat(formData.sellingPrice || 0)
    return sellingPrice - totalCost
  }

  const handleSubmit = async () => {
    try {
      const data = {
        ...formData,
        items: giftBoxItems.map(gi => ({
          itemId: gi.itemId,
          quantity: gi.quantity
        })),
        businessId: selectedBusiness.id
      }
      
      if (editingGiftBox) {
        // Update existing gift box
        await axios.put(`/api/gift-boxes/${editingGiftBox.id}`, data)
      } else {
        // Create new gift box
        await axios.post('/api/gift-boxes', data)
      }
      
      await fetchData()
      handleClose()
    } catch (error) {
      console.error('Failed to save gift box:', error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this gift box?')) {
      try {
        await axios.delete(`/api/gift-boxes/${id}`)
        await fetchData()
      } catch (error) {
        console.error('Failed to delete gift box:', error)
      }
    }
  }

  const filteredItems = items.filter(item => 
    selectedCategory ? item.categoryId === selectedCategory : true
  )

  if (!selectedBusiness) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" color="text.secondary">
          Please select a business to manage gift boxes
        </Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Gift Boxes - {selectedBusiness.name}</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen()}
        >
          Create Gift Box
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Gift Box Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Items Count</TableCell>
              <TableCell>Gift Box Cost</TableCell>
              <TableCell>Packing Cost</TableCell>
              <TableCell>Gift Box Selling Price</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {giftBoxes.map((giftBox) => (
              <TableRow key={giftBox.id}>
                <TableCell>{giftBox.giftBoxCode}</TableCell>
                <TableCell>{giftBox.name}</TableCell>
                <TableCell>{giftBox.description || '-'}</TableCell>
                <TableCell>{giftBox.items.length} items</TableCell>
                <TableCell>
                  {formatCurrency(giftBox.items.reduce((sum, item) => sum + (item.item.costPrice * item.quantity), 0))}
                </TableCell>
                <TableCell>{formatCurrency(giftBox.packingCost)}</TableCell>
                <TableCell>
                  {formatCurrency(giftBox.items.reduce((sum, item) => sum + (item.item.sellingPrice * item.quantity), 0) + giftBox.packingCost)}
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => {
                      setSelectedGiftBox(giftBox)
                      setViewOpen(true)
                    }}
                  >
                    <Visibility />
                  </IconButton>
                  <IconButton
                    onClick={() => handleOpen(giftBox)}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(giftBox.id)}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Gift Box Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editingGiftBox ? 'Edit Gift Box' : 'Create Gift Box'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                autoFocus
                margin="dense"
                label="Gift Box Name"
                fullWidth
                variant="outlined"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <TextField
                margin="dense"
                label="Description"
                fullWidth
                multiline
                rows={2}
                variant="outlined"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <TextField
                margin="dense"
                label="Packing Cost"
                type="number"
                fullWidth
                variant="outlined"
                value={formData.packingCost}
                onChange={(e) => setFormData({ ...formData, packingCost: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Add Items</Typography>
              <FormControl fullWidth margin="dense">
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Category"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.categoryName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth margin="dense">
                <InputLabel>Item</InputLabel>
                <Select
                  value={selectedItem}
                  label="Item"
                  onChange={(e) => setSelectedItem(e.target.value)}
                >
                  {filteredItems.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.itemName} - {formatCurrency(item.sellingPrice)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <TextField
                  label="Quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  sx={{ width: 100 }}
                />
                <Button
                  variant="outlined"
                  onClick={addItemToGiftBox}
                  disabled={!selectedItem}
                >
                  Add Item
                </Button>
              </Box>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="h6" gutterBottom>Gift Box Items</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Item</TableCell>
                  <TableCell>Selling Price</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {giftBoxItems.map((gi) => (
                  <TableRow key={gi.itemId}>
                    <TableCell>{gi.item.itemName}</TableCell>
                    <TableCell>{formatCurrency(gi.item.sellingPrice)}</TableCell>
                    <TableCell>{gi.quantity}</TableCell>
                    <TableCell>{formatCurrency(gi.item.sellingPrice * gi.quantity)}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => removeItemFromGiftBox(gi.itemId)}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Box sx={{ mt: 2, textAlign: 'right' }}>
            <Typography>Items Selling Price: {formatCurrency(giftBoxItems.reduce((sum, gi) => sum + (gi.item.sellingPrice * gi.quantity), 0))}</Typography>
            <Typography>Packing Cost: {formatCurrency(formData.packingCost || 0)}</Typography>
            <Typography variant="h6">Gift Box Selling Price: {formatCurrency(calculateCostTotal())}</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!formData.name || giftBoxItems.length === 0}
          >
            {editingGiftBox ? 'Update Gift Box' : 'Create Gift Box'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Gift Box Dialog */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Gift Box Details - {selectedGiftBox?.giftBoxCode} - {selectedGiftBox?.name}</DialogTitle>
        <DialogContent>
          {selectedGiftBox && (
            <Box>
              <Typography><strong>Gift Box Code:</strong> {selectedGiftBox.giftBoxCode}</Typography>
              <Typography><strong>Description:</strong> {selectedGiftBox.description || 'No description'}</Typography>
              <Typography><strong>Gift Box Cost:</strong> {formatCurrency(selectedGiftBox.items.reduce((sum, item) => sum + (item.item.costPrice * item.quantity), 0))}</Typography>
              <Typography><strong>Packing Cost:</strong> {formatCurrency(selectedGiftBox.packingCost)}</Typography>
              <Typography><strong>Gift Box Selling Price:</strong> {formatCurrency(selectedGiftBox.items.reduce((sum, item) => sum + (item.item.sellingPrice * item.quantity), 0) + selectedGiftBox.packingCost)}</Typography>
              
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Items</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedGiftBox.items.map((gi) => (
                      <TableRow key={gi.id}>
                        <TableCell>{gi.item.itemName}</TableCell>
                        <TableCell>{gi.item.category.categoryName}</TableCell>
                        <TableCell>{formatCurrency(gi.item.sellingPrice)}</TableCell>
                        <TableCell>{gi.quantity}</TableCell>
                        <TableCell>{formatCurrency(gi.item.sellingPrice * gi.quantity)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default GiftBoxes