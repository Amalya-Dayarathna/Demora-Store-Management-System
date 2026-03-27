import React, { useState, useEffect } from 'react'
import {
  Typography, Paper, Box, TextField, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Tabs, Tab,
  Grid, Card, CardContent, Chip
} from '@mui/material'
import { useBusiness } from '../context/BusinessContext'
import { formatCurrency } from '../utils/currency'
import axios from 'axios'

const Reports = () => {
  const { selectedBusiness } = useBusiness()
  const [tabValue, setTabValue] = useState(0)
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })
  const [inventoryReport, setInventoryReport] = useState(null)
  const [salesReport, setSalesReport] = useState(null)
  const [cashflowReport, setCashflowReport] = useState(null)
  const [settlementReport, setSettlementReport] = useState([])

  useEffect(() => {
    if (selectedBusiness) {
      fetchReports()
    }
  }, [selectedBusiness])

  const fetchReports = async () => {
    try {
      const params = dateRange.startDate && dateRange.endDate ? 
        `?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}` : ''
      
      const [inventoryRes, salesRes, cashflowRes, settlementRes] = await Promise.all([
        axios.get(`/api/reports/${selectedBusiness.id}/inventory`),
        axios.get(`/api/reports/${selectedBusiness.id}/sales${params}`),
        axios.get(`/api/reports/${selectedBusiness.id}/cashflow${params}`),
        axios.get(`/api/reports/${selectedBusiness.id}/capital-settlement`)
      ])
      
      setInventoryReport(inventoryRes.data)
      setSalesReport(salesRes.data)
      setCashflowReport(cashflowRes.data)
      setSettlementReport(settlementRes.data)
    } catch (error) {
      console.error('Failed to fetch reports:', error)
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
          Please select a business to view reports
        </Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Reports - {selectedBusiness.name}
      </Typography>

      <Paper sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              label="Start Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              label="End Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Button variant="contained" onClick={fetchReports} fullWidth>
              Generate Reports
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Inventory" />
          <Tab label="Sales" />
          <Tab label="Cashflow" />
          <Tab label="Capital Settlement" />
        </Tabs>

        {tabValue === 0 && inventoryReport && (
          <Box sx={{ p: 2 }}>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>Total Items in Stock</Typography>
                    <Typography variant="h4">{inventoryReport.stockAnalysis?.totalItems || 0}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>Total Cost Value</Typography>
                    <Typography variant="h4">{formatCurrency(inventoryReport.stockAnalysis?.totalCostValue || 0)}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>Total Selling Value</Typography>
                    <Typography variant="h4" color="success.main">
                      {formatCurrency(inventoryReport.stockAnalysis?.totalSellingValue || 0)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>Potential Profit</Typography>
                    <Typography variant="h4" color="primary.main">
                      {formatCurrency(inventoryReport.stockAnalysis?.totalProfit || 0)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>Total Variants</Typography>
                    <Typography variant="h4">{inventoryReport.totalVariants}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>Low Stock Items</Typography>
                    <Typography variant="h4" color="warning.main">
                      {inventoryReport.lowStock}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>Out of Stock</Typography>
                    <Typography variant="h4" color="error.main">
                      {inventoryReport.outOfStock}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell>Variant Code</TableCell>
                    <TableCell>Attributes</TableCell>
                    <TableCell>Stock</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inventoryReport.variants.map((variant) => (
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
                      <TableCell>{variant.stockQuantity}</TableCell>
                      <TableCell>
                        <Chip
                          label={
                            variant.stockQuantity === 0 ? 'Out of Stock' :
                            variant.stockQuantity <= 5 ? 'Low Stock' : 'In Stock'
                          }
                          color={getStockColor(variant.stockQuantity)}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {tabValue === 1 && salesReport && (
          <Box sx={{ p: 2 }}>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>Total Sales</Typography>
                    <Typography variant="h4">{formatCurrency(salesReport.totalSales || 0)}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>Total Orders</Typography>
                    <Typography variant="h4">{salesReport.totalOrders}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>Avg Order Value</Typography>
                    <Typography variant="h4">{formatCurrency(salesReport.avgOrderValue || 0)}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Bill Number</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {salesReport.bills.map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell>{bill.billNumber}</TableCell>
                      <TableCell>{new Date(bill.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{bill.customerName || 'N/A'}</TableCell>
                      <TableCell>{formatCurrency(bill.grandTotal)}</TableCell>
                      <TableCell>
                        <Chip label={bill.status} size="small" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {tabValue === 2 && cashflowReport && (
          <Box sx={{ p: 2 }}>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>Total Income</Typography>
                    <Typography variant="h5" color="success.main">
                      {formatCurrency(cashflowReport.summary.totalIncome || 0)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>Total Expenses</Typography>
                    <Typography variant="h5" color="error.main">
                      {formatCurrency(cashflowReport.summary.totalExpenses || 0)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>Net Cashflow</Typography>
                    <Typography 
                      variant="h5" 
                      color={cashflowReport.summary.netCashflow >= 0 ? 'success.main' : 'error.main'}
                    >
                      {formatCurrency(cashflowReport.summary.netCashflow || 0)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>Remaining Capital</Typography>
                    <Typography variant="h5">
                      {formatCurrency(cashflowReport.summary.remainingCapital || 0)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Typography variant="h6" gutterBottom>Expenses by Category</Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {Object.entries(cashflowReport.expensesByCategory || {}).map(([category, amount]) => (
                <Grid item xs={6} md={3} key={category}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </Typography>
                      <Typography variant="h6">{formatCurrency(amount)}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {tabValue === 3 && (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Capital Settlement Report</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Member</TableCell>
                    <TableCell>Total Capital</TableCell>
                    <TableCell>Settled Amount</TableCell>
                    <TableCell>Remaining Balance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {settlementReport.map((member, index) => (
                    <TableRow key={index}>
                      <TableCell>{member.member}</TableCell>
                      <TableCell>{formatCurrency(member.totalCapital)}</TableCell>
                      <TableCell>{formatCurrency(member.settledAmount)}</TableCell>
                      <TableCell>
                        <Typography 
                          color={member.remainingBalance > 0 ? 'error.main' : 'success.main'}
                        >
                          {formatCurrency(member.remainingBalance)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Paper>
    </Box>
  )
}

export default Reports