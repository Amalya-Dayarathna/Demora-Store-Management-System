import React, { useState, useEffect } from 'react'
import {
  Typography, Paper, Box, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, DialogContentText, Chip, Grid,
  TextField, Select, MenuItem, FormControl, InputLabel
} from '@mui/material'
import { Delete, Visibility, Search } from '@mui/icons-material'
import { useBusiness } from '../context/BusinessContext'
import { formatCurrency } from '../utils/currency'
import axios from 'axios'

const Bills = () => {
  const { selectedBusiness } = useBusiness()
  const [bills, setBills] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedBill, setSelectedBill] = useState(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (selectedBusiness) {
      fetchBills()
    }
  }, [selectedBusiness])

  const fetchBills = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/bills/${selectedBusiness.id}`)
      setBills(response.data)
    } catch (error) {
      console.error('Failed to fetch bills:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBill = async () => {
    try {
      await axios.delete(`/api/bills/${selectedBill.id}`)
      await fetchBills()
      setDeleteDialogOpen(false)
      setSelectedBill(null)
    } catch (error) {
      console.error('Failed to delete bill:', error)
    }
  }

  const getStatusColor = (status) => {
    const statusColors = {
      'Ordered': 'warning',
      'Packed': 'info',
      'Dispatched': 'primary',
      'Delivered': 'success'
    }
    return statusColors[status] || 'default'
  }

  const getPaymentStatusColor = (status) => {
    return status === 'Received' ? 'success' : 'warning'
  }

  const updateBillStatus = async (billId, status) => {
    try {
      await axios.put(`/api/bills/${billId}/status`, { status })
      await fetchBills()
    } catch (error) {
      console.error('Failed to update bill status:', error)
    }
  }

  const updatePaymentStatus = async (billId, paymentStatus) => {
    try {
      await axios.put(`/api/bills/${billId}/payment-status`, { paymentStatus })
      await fetchBills()
    } catch (error) {
      console.error('Failed to update payment status:', error)
    }
  }

  const filteredBills = bills.filter(bill =>
    bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.customerPhone?.includes(searchTerm)
  )

  if (!selectedBusiness) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" color="text.secondary">
          Please select a business to manage bills
        </Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Bills - {selectedBusiness.name}
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            label="Search bills"
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Bill Number</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Payment Type</TableCell>
              <TableCell>Grand Total</TableCell>
              <TableCell>Order Status</TableCell>
              <TableCell>Payment Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredBills.map((bill) => (
              <TableRow key={bill.id}>
                <TableCell>{bill.billNumber}</TableCell>
                <TableCell>
                  {new Date(bill.createdAt).toLocaleDateString()}
                  <br />
                  <Typography variant="caption" color="text.secondary">
                    {new Date(bill.createdAt).toLocaleTimeString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  {bill.customerName || 'In-house Sale'}
                  {bill.customerPhone && (
                    <Typography variant="caption" display="block" color="text.secondary">
                      {bill.customerPhone}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>{bill.paymentType || 'COD'}</TableCell>
                <TableCell>{formatCurrency(bill.grandTotal)}</TableCell>
                <TableCell>
                  <Chip
                    label={bill.status}
                    color={getStatusColor(bill.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={bill.paymentStatus || 'Pending'}
                    color={getPaymentStatusColor(bill.paymentStatus || 'Pending')}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => {
                      setSelectedBill(bill)
                      setViewDialogOpen(true)
                    }}
                  >
                    <Visibility />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => {
                      setSelectedBill(bill)
                      setDeleteDialogOpen(true)
                    }}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Bill</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete bill {selectedBill?.billNumber}?
            <br /><br />
            <strong>This will:</strong>
            <br />• Restore all stock quantities
            <br />• Remove the income record
            <br />• Create reverse stock movement entries
            <br />• Permanently delete the bill
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteBill} color="error" variant="contained">
            Delete Bill
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Bill Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Bill Details - {selectedBill?.billNumber}</DialogTitle>
        <DialogContent>
          {selectedBill && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography><strong>Date:</strong> {new Date(selectedBill.createdAt).toLocaleString()}</Typography>
                  <Typography><strong>Payment Type:</strong> {selectedBill.paymentType || 'COD'}</Typography>
                  <Typography><strong>Customer:</strong> {selectedBill.customerName || 'In-house Sale'}</Typography>
                  {selectedBill.customerPhone && (
                    <Typography><strong>Phone:</strong> {selectedBill.customerPhone}</Typography>
                  )}
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth margin="dense">
                    <InputLabel>Order Status</InputLabel>
                    <Select
                      value={selectedBill.status}
                      label="Order Status"
                      onChange={(e) => updateBillStatus(selectedBill.id, e.target.value)}
                    >
                      <MenuItem value="Ordered">Ordered</MenuItem>
                      <MenuItem value="Packed">Packed</MenuItem>
                      <MenuItem value="Dispatched">Dispatched</MenuItem>
                      <MenuItem value="Delivered">Delivered</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl fullWidth margin="dense">
                    <InputLabel>Payment Status</InputLabel>
                    <Select
                      value={selectedBill.paymentStatus || 'Pending'}
                      label="Payment Status"
                      onChange={(e) => updatePaymentStatus(selectedBill.id, e.target.value)}
                    >
                      <MenuItem value="Pending">Pending</MenuItem>
                      <MenuItem value="Received">Received</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              
              <Typography variant="h6" gutterBottom>Items</Typography>
              <TableContainer>
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
                    {selectedBill.billItems.map((item, index) => (
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
              
              <Box sx={{ mt: 2, textAlign: 'right' }}>
                <Typography>Subtotal: {formatCurrency(selectedBill.subtotal)}</Typography>
                {selectedBill.codDelivery > 0 && (
                  <Typography>COD Delivery: {formatCurrency(selectedBill.codDelivery)}</Typography>
                )}
                {selectedBill.packagingCost > 0 && (
                  <Typography>Packaging Cost: {formatCurrency(selectedBill.packagingCost)}</Typography>
                )}
                <Typography variant="h6">Grand Total: {formatCurrency(selectedBill.grandTotal)}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Bills