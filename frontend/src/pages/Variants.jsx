import React, { useState, useEffect } from 'react'
import {
  Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Box, IconButton, FormControl, InputLabel,
  Select, MenuItem, Chip, Grid
} from '@mui/material'
import { Add, Edit, Delete, QrCode, Inventory } from '@mui/icons-material'
import { useBusiness } from '../context/BusinessContext'
import axios from 'axios'

const Variants = () => {
  const { selectedBusiness } = useBusiness()
  const [variants, setVariants] = useState([])
  const [items, setItems] = useState([])
  const [open, setOpen] = useState(false)
  const [stockOpen, setStockOpen] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [formData, setFormData] = useState({
    itemId: '',
    color: '',
    size: '',
    stockQuantity: ''
  })
  const [stockData, setStockData] = useState({
    quantity: '',
    operation: 'add'
  })

  useEffect(() => {
    if (selectedBusiness) {
      fetchVariants()
      fetchItems()
    }
  }, [selectedBusiness])

  const fetchVariants = async () => {
    try {
      const response = await axios.get(`/api/variants/${selectedBusiness.id}`)
      setVariants(response.data)
    } catch (error) {
      console.error('Failed to fetch variants:', error)
    }
  }

  const fetchItems = async () => {
    try {
      const response = await axios.get(`/api/items/${selectedBusiness.id}`)
      setItems(response.data)
    } catch (error) {
      console.error('Failed to fetch items:', error)
    }
  }

  const handleOpen = () => {
    setFormData({ itemId: '', color: '', size: '', stockQuantity: '' })
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setFormData({ itemId: '', color: '', size: '', stockQuantity: '' })
  }

  const handleSubmit = async () => {
    try {
      const attributes = {}
      if (formData.color) attributes.color = formData.color
      if (formData.size) attributes.size = formData.size
      
      const data = {
        itemId: formData.itemId,
        attributes,
        stockQuantity: parseInt(formData.stockQuantity),
        businessId: selectedBusiness.id
      }
      
      await axios.post('/api/variants', data)
      await fetchVariants()
      handleClose()
    } catch (error) {
      console.error('Failed to create variant:', error)
    }
  }

  const handleStockUpdate = async () => {
    try {
      await axios.put(`/api/variants/${selectedVariant.id}/stock`, stockData)
      await fetchVariants()
      setStockOpen(false)
      setStockData({ quantity: '', operation: 'add' })
    } catch (error) {
      console.error('Failed to update stock:', error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this variant?')) {
      try {
        await axios.delete(`/api/variants/${id}`)
        await fetchVariants()
      } catch (error) {
        console.error('Failed to delete variant:', error)
      }
    }
  }

  const showQRCode = async (variant) => {
    try {
      const response = await axios.get(`/api/variants/${variant.id}/qr-image`)
      setSelectedVariant({ ...variant, qrImage: response.data.qrCode })
      setQrOpen(true)
    } catch (error) {
      console.error('Failed to generate QR code:', error)
    }
  }

  const getStockColor = (quantity) => {
    if (quantity === 0) return 'error'
    if (quantity <= 5) return 'warning'
    return 'success'
  }

  if (!selectedBusiness) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" color="text.secondary">
          Please select a business to manage variants
        </Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Variants - {selectedBusiness.name}</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpen}
        >
          Add Variant
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Item</TableCell>
              <TableCell>Variant Code</TableCell>
              <TableCell>Attributes</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {variants.map((variant) => (
              <TableRow key={variant.id}>
                <TableCell>{variant.item.itemName}</TableCell>
                <TableCell>{variant.variantCode}</TableCell>
                <TableCell>
                  {variant.attributes.color && (
                    <Chip label={variant.attributes.color} size="small" sx={{ mr: 1 }} />
                  )}
                  {variant.attributes.size && (
                    <Chip label={variant.attributes.size} size="small" />
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    label={variant.stockQuantity}
                    color={getStockColor(variant.stockQuantity)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => {
                      setSelectedVariant(variant)
                      setStockOpen(true)
                    }}
                  >
                    <Inventory />
                  </IconButton>
                  <IconButton onClick={() => showQRCode(variant)}>
                    <QrCode />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(variant.id)} color="error">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Variant Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add Variant</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Item</InputLabel>
            <Select
              value={formData.itemId}
              label="Item"
              onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
            >
              {items.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.itemName} ({item.baseRefCode})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Color"
                fullWidth
                variant="outlined"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Size"
                fullWidth
                variant="outlined"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              />
            </Grid>
          </Grid>
          
          <TextField
            margin="dense"
            label="Initial Stock Quantity"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.stockQuantity}
            onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
            sx={{ mt: 2 }}
          />
          
          <Button
            variant="outlined"
            fullWidth
            sx={{ mt: 2 }}
            onClick={() => showQRCode(selectedVariant)}
          >
            View QR Code
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Stock Update Dialog */}
      <Dialog open={stockOpen} onClose={() => setStockOpen(false)}>
        <DialogTitle>Update Stock - {selectedVariant?.variantCode}</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Current Stock: {selectedVariant?.stockQuantity}
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
        <DialogTitle>QR Code - {selectedVariant?.variantCode}</DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          {selectedVariant?.qrImage && (
            <img src={selectedVariant.qrImage} alt="QR Code" style={{ maxWidth: '100%' }} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            if (selectedVariant?.qrImage) {
              const link = document.createElement('a')
              link.download = `${selectedVariant.variantCode}-qr.png`
              link.href = selectedVariant.qrImage
              link.click()
            }
          }}>Download</Button>
          <Button onClick={() => setQrOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Variants