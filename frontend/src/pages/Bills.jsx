import React, { useState, useEffect } from 'react'
import {
  Typography, Paper, Box, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, DialogContentText, Chip, Grid,
  TextField, Select, MenuItem, FormControl, InputLabel
} from '@mui/material'
import { Delete, Visibility, Search, Print, LocalShipping, Download } from '@mui/icons-material'
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

  useEffect(() => {
    // Load html2pdf library
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
    document.head.appendChild(script)
  }, [])

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

  const downloadBillPDF = (bill) => {
    const billHTML = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 900px; margin: 0 auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px;">
          <img src="/images/demora.png" alt="DEMORA" style="width: 60px; height: auto;" />
          <div style="text-align: right;">
            <div style="font-size: 28px; font-weight: bold;">BILL</div>
            <div style="font-size: 14px; color: #666;">Bill #${bill.billNumber}</div>
          </div>
        </div>
        
        <div style="margin-bottom: 25px;">
          <div style="font-size: 14px; font-weight: bold; margin-bottom: 10px; text-transform: uppercase; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Bill Information</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 15px;">
            <div style="font-size: 13px;">
              <div style="font-weight: bold; color: #333;">Date:</div>
              <div style="color: #666; margin-top: 3px;">${new Date(bill.createdAt).toLocaleString()}</div>
            </div>
            <div style="font-size: 13px;">
              <div style="font-weight: bold; color: #333;">Payment Type:</div>
              <div style="color: #666; margin-top: 3px;">${bill.paymentType || 'COD'}</div>
            </div>
            ${bill.orderId ? `
            <div style="font-size: 13px;">
              <div style="font-weight: bold; color: #333;">Order ID:</div>
              <div style="color: #666; margin-top: 3px;">${bill.orderId}</div>
            </div>
            ` : ''}
            ${bill.trackingId ? `
            <div style="font-size: 13px;">
              <div style="font-weight: bold; color: #333;">Tracking ID:</div>
              <div style="color: #666; margin-top: 3px;">${bill.trackingId}</div>
            </div>
            ` : ''}
          </div>
        </div>
        
        <div style="margin-bottom: 25px;">
          <div style="font-size: 14px; font-weight: bold; margin-bottom: 10px; text-transform: uppercase; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Customer Information</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 15px;">
            <div style="font-size: 13px;">
              <div style="font-weight: bold; color: #333;">Name:</div>
              <div style="color: #666; margin-top: 3px;">${bill.customerName || 'N/A'}</div>
            </div>
            <div style="font-size: 13px;">
              <div style="font-weight: bold; color: #333;">Phone:</div>
              <div style="color: #666; margin-top: 3px;">${bill.customerPhone || 'N/A'}</div>
            </div>
            ${bill.customerPhone2 ? `
            <div style="font-size: 13px;">
              <div style="font-weight: bold; color: #333;">Phone 2:</div>
              <div style="color: #666; margin-top: 3px;">${bill.customerPhone2}</div>
            </div>
            ` : ''}
            ${bill.customerAddress ? `
            <div style="font-size: 13px; grid-column: 1 / -1;">
              <div style="font-weight: bold; color: #333;">Address:</div>
              <div style="color: #666; margin-top: 3px;">${bill.customerAddress}</div>
            </div>
            ` : ''}
          </div>
        </div>
        
        <div style="margin-bottom: 25px;">
          <div style="font-size: 14px; font-weight: bold; margin-bottom: 10px; text-transform: uppercase; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Items</div>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr>
                <th style="background: #f0f0f0; padding: 10px; text-align: left; font-weight: bold; border-bottom: 2px solid #333; font-size: 13px;">Item</th>
                <th style="background: #f0f0f0; padding: 10px; text-align: left; font-weight: bold; border-bottom: 2px solid #333; font-size: 13px;">Variant</th>
                <th style="background: #f0f0f0; padding: 10px; text-align: left; font-weight: bold; border-bottom: 2px solid #333; font-size: 13px;">Quantity</th>
                <th style="background: #f0f0f0; padding: 10px; text-align: left; font-weight: bold; border-bottom: 2px solid #333; font-size: 13px;">Unit Price</th>
                <th style="background: #f0f0f0; padding: 10px; text-align: left; font-weight: bold; border-bottom: 2px solid #333; font-size: 13px;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${bill.billItems.map(item => `
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; font-size: 13px;">${item.variant?.item?.itemName || item.item?.itemName}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; font-size: 13px;">${item.variant?.variantCode || item.item?.baseRefCode}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; font-size: 13px;">${item.quantity}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; font-size: 13px;">LKR ${item.unitPrice.toFixed(2)}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; font-size: 13px;">LKR ${item.total.toFixed(2)}</td>
              </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div style="display: flex; justify-content: flex-end; margin-top: 20px;">
          <div style="width: 300px;">
            <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; border-bottom: 1px solid #ddd;">
              <span>Subtotal:</span>
              <span>LKR ${bill.subtotal.toFixed(2)}</span>
            </div>
            ${bill.packagingCost > 0 ? `
            <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; border-bottom: 1px solid #ddd;">
              <span>Packaging Cost:</span>
              <span>LKR ${bill.packagingCost.toFixed(2)}</span>
            </div>
            ` : ''}
            ${bill.codDelivery > 0 ? `
            <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; border-bottom: 1px solid #ddd;">
              <span>Delivery Charges:</span>
              <span>LKR ${bill.codDelivery.toFixed(2)}</span>
            </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; padding: 12px; background: #333; color: white; font-weight: bold; font-size: 14px; margin-top: 10px;">
              <span>GRAND TOTAL:</span>
              <span>LKR ${bill.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
          <p>Thank you for your business!</p>
          <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `

    const element = document.createElement('div')
    element.innerHTML = billHTML

    const opt = {
      margin: 10,
      filename: `bill-${bill.billNumber}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    }

    if (window.html2pdf) {
      window.html2pdf().set(opt).from(element).save()
    } else {
      console.error('html2pdf library not loaded')
    }
  }

  const printCourierLabel = (bill) => {
    const printWindow = window.open('', '', 'width=400,height=600');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Courier Label - ${bill.billNumber}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { 
            font-family: Arial, sans-serif; 
            padding: 10mm;
            width: 100mm;
          }
          .label {
            border: 2px solid #000;
            padding: 8mm;
            background: white;
          }
          .header {
            text-align: center;
            margin-bottom: 5mm;
            border-bottom: 2px solid #000;
            padding-bottom: 3mm;
          }
          .logo {
            width: 40mm;
            height: auto;
            margin-bottom: 2mm;
          }
          .store-name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 2mm;
          }
          .section {
            margin-bottom: 4mm;
          }
          .section-title {
            font-size: 11px;
            font-weight: bold;
            margin-bottom: 2mm;
            text-transform: uppercase;
            border-bottom: 1px solid #333;
            padding-bottom: 1mm;
          }
          .info-row {
            font-size: 10px;
            margin-bottom: 1.5mm;
            display: flex;
            justify-content: space-between;
          }
          .label-text {
            font-weight: bold;
          }
          .value-text {
            text-align: right;
          }
          .total-section {
            border-top: 2px solid #000;
            padding-top: 3mm;
            margin-top: 3mm;
          }
          .total-row {
            font-size: 12px;
            font-weight: bold;
            display: flex;
            justify-content: space-between;
            margin-bottom: 2mm;
          }
          .grand-total {
            font-size: 14px;
            background: #000;
            color: white;
            padding: 2mm;
            margin-top: 2mm;
          }
          .delivery-mode {
            text-align: center;
            font-size: 12px;
            font-weight: bold;
            padding: 2mm;
            border: 2px solid #000;
            margin-top: 3mm;
            background: ${bill.paymentType === 'COD' ? '#ffeb3b' : '#e0e0e0'};
          }
          @media print {
            body { padding: 0; }
            .label { border: none; }
          }
        </style>
      </head>
      <body>
        <div class="label">
          <div class="header">
            <img src="/images/demora.png" alt="DEMORA" class="logo" onerror="this.style.display='none'" />
          </div>
          
          <div class="section">
            <div class="section-title">Customer Details</div>
            <div class="info-row">
              <span class="label-text">Name:</span>
              <span class="value-text">${bill.customerName || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="label-text">Phone:</span>
              <span class="value-text">${bill.customerPhone || 'N/A'}</span>
            </div>
            ${bill.customerPhone2 ? `
            <div class="info-row">
              <span class="label-text">Phone 2:</span>
              <span class="value-text">${bill.customerPhone2}</span>
            </div>
            ` : ''}
            ${bill.customerAddress ? `
            <div class="info-row">
              <span class="label-text">Address:</span>
              <span class="value-text" style="max-width: 60mm; text-align: right;">${bill.customerAddress}</span>
            </div>
            ` : ''}
          </div>
          
          <div class="section">
            <div class="section-title">Order Details</div>
            <div class="info-row">
              <span class="label-text">Bill Number:</span>
              <span class="value-text">${bill.billNumber}</span>
            </div>
            ${bill.orderId ? `
            <div class="info-row">
              <span class="label-text">Order ID:</span>
              <span class="value-text">${bill.orderId}</span>
            </div>
            ` : ''}
            ${bill.trackingId ? `
            <div class="info-row">
              <span class="label-text">Tracking ID:</span>
              <span class="value-text">${bill.trackingId}</span>
            </div>
            ` : ''}
            <div class="info-row">
              <span class="label-text">Date:</span>
              <span class="value-text">${new Date(bill.createdAt).toLocaleDateString()}</span>
            </div>
            <div class="info-row">
              <span class="label-text">Items:</span>
              <span class="value-text">${bill.billItems.length} item(s)</span>
            </div>
          </div>
          
          <div class="total-section">
            <div class="total-row">
              <span>Bill Value:</span>
              <span>LKR ${bill.subtotal.toFixed(2)}</span>
            </div>
            ${bill.packagingCost > 0 ? `
            <div class="total-row">
              <span>Packaging:</span>
              <span>LKR ${bill.packagingCost.toFixed(2)}</span>
            </div>
            ` : ''}
            ${bill.codDelivery > 0 ? `
            <div class="total-row">
              <span>Delivery Charges:</span>
              <span>LKR ${bill.codDelivery.toFixed(2)}</span>
            </div>
            ` : ''}
            <div class="grand-total total-row">
              <span>TOTAL AMOUNT:</span>
              <span>LKR ${bill.grandTotal.toFixed(2)}</span>
            </div>
          </div>
          
          <div class="delivery-mode">
            ${bill.paymentType === 'COD' ? '⚠️ CASH ON DELIVERY (COD)' : '✓ PREPAID / BANK TRANSFER'}
          </div>
        </div>
        <script>
          window.onload = function() {
            setTimeout(() => window.print(), 500);
          };
        </script>
      </body>
      </html>
    `);
    
    printWindow.document.close();
  }

  const filteredBills = bills.filter(bill =>
    bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.customerPhone?.includes(searchTerm) ||
    bill.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.trackingId?.toLowerCase().includes(searchTerm.toLowerCase())
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
              <TableCell>Order ID</TableCell>
              <TableCell>Tracking ID</TableCell>
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
                <TableCell>{bill.orderId || '-'}</TableCell>
                <TableCell>{bill.trackingId || '-'}</TableCell>
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
                    title="View Details"
                  >
                    <Visibility />
                  </IconButton>
                  <IconButton
                    onClick={() => printCourierLabel(bill)}
                    color="primary"
                    title="Print Courier Label"
                  >
                    <LocalShipping />
                  </IconButton>
                  <IconButton
                    onClick={() => downloadBillPDF(bill)}
                    color="success"
                    title="Download Bill PDF"
                  >
                    <Download />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => {
                      setSelectedBill(bill)
                      setDeleteDialogOpen(true)
                    }}
                    title="Delete Bill"
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
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Bill Details - {selectedBill?.billNumber}</span>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<LocalShipping />}
                onClick={() => selectedBill && printCourierLabel(selectedBill)}
                size="small"
              >
                Print Label
              </Button>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={() => selectedBill && downloadBillPDF(selectedBill)}
                size="small"
              >
                Download PDF
              </Button>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedBill && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <Typography><strong>Bill Number:</strong> {selectedBill.billNumber}</Typography>
                  <Typography><strong>Date:</strong> {new Date(selectedBill.createdAt).toLocaleString()}</Typography>
                  <Typography><strong>Payment Type:</strong> {selectedBill.paymentType || 'COD'}</Typography>
                  <Typography><strong>Customer:</strong> {selectedBill.customerName || 'In-house Sale'}</Typography>
                  {selectedBill.customerPhone && (
                    <Typography><strong>Phone:</strong> {selectedBill.customerPhone}</Typography>
                  )}
                  {selectedBill.customerPhone2 && (
                    <Typography><strong>Phone 2:</strong> {selectedBill.customerPhone2}</Typography>
                  )}
                  {selectedBill.customerAddress && (
                    <Typography><strong>Address:</strong> {selectedBill.customerAddress}</Typography>
                  )}
                  {selectedBill.orderId && (
                    <Typography><strong>Order ID:</strong> {selectedBill.orderId}</Typography>
                  )}
                  {selectedBill.trackingId && (
                    <Typography><strong>Tracking ID:</strong> {selectedBill.trackingId}</Typography>
                  )}
                </Grid>
                <Grid item xs={12} sm={6}>
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
