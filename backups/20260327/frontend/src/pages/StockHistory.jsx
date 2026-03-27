import React, { useState, useEffect } from 'react'
import {
  Typography, Paper, Box, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, TextField, Grid, FormControl, InputLabel,
  Select, MenuItem, Card, CardContent, Accordion, AccordionSummary,
  AccordionDetails
} from '@mui/material'
import { Search, ExpandMore, TrendingUp, TrendingDown } from '@mui/icons-material'
import { useBusiness } from '../context/BusinessContext'
import axios from 'axios'

const StockHistory = () => {
  const { selectedBusiness } = useBusiness()
  const [stockData, setStockData] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (selectedBusiness) {
      fetchStockHistory()
    }
  }, [selectedBusiness])

  const fetchStockHistory = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/stock-movements/${selectedBusiness.id}/summary`)
      setStockData(response.data)
    } catch (error) {
      console.error('Failed to fetch stock history:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMovementColor = (movementType) => {
    return movementType === 'IN' ? 'success' : 'error'
  }

  const getMovementIcon = (movementType) => {
    return movementType === 'IN' ? <TrendingUp /> : <TrendingDown />
  }

  const formatReason = (reason) => {
    const reasonMap = {
      'initial': 'Initial Stock',
      'restock': 'Restocked',
      'bill': 'Sold (Bill)',
      'bill_reversal': 'Bill Deleted (Reversed)',
      'adjustment': 'Manual Adjustment'
    }
    return reasonMap[reason] || reason
  }

  const filteredData = stockData.filter(item =>
    item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.baseRefCode.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!selectedBusiness) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" color="text.secondary">
          Please select a business to view stock history
        </Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Stock History - {selectedBusiness.name}
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            label="Search items"
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

      {filteredData.map((item) => (
        <Accordion key={item.id} sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6">{item.itemName}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.category.categoryName} • {item.baseRefCode} • Current Stock: {item.stockQuantity}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {item.stockMovements.length + item.variants.reduce((sum, v) => sum + v.stockMovements.length, 0)} movements
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              {/* Item Stock Movements */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Item Stock History
                    </Typography>
                    {item.stockMovements.length > 0 ? (
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Date</TableCell>
                              <TableCell>Type</TableCell>
                              <TableCell>Quantity</TableCell>
                              <TableCell>Reason</TableCell>
                              <TableCell>Reference</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {item.stockMovements.map((movement) => (
                              <TableRow key={movement.id}>
                                <TableCell>
                                  {new Date(movement.createdAt).toLocaleDateString()}
                                  <br />
                                  <Typography variant="caption" color="text.secondary">
                                    {new Date(movement.createdAt).toLocaleTimeString()}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    icon={getMovementIcon(movement.movementType)}
                                    label={movement.movementType}
                                    color={getMovementColor(movement.movementType)}
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell>{movement.quantity}</TableCell>
                                <TableCell>{formatReason(movement.reason)}</TableCell>
                                <TableCell>{movement.reference || '-'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Typography color="text.secondary">No stock movements recorded</Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Variant Stock Movements */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Variant Stock History
                    </Typography>
                    {item.variants.length > 0 ? (
                      item.variants.map((variant) => (
                        <Box key={variant.id} sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            {variant.variantCode} (Stock: {variant.stockQuantity})
                          </Typography>
                          {variant.stockMovements.length > 0 ? (
                            <TableContainer>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Qty</TableCell>
                                    <TableCell>Reason</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {variant.stockMovements.map((movement) => (
                                    <TableRow key={movement.id}>
                                      <TableCell>
                                        {new Date(movement.createdAt).toLocaleDateString()}
                                        <br />
                                        <Typography variant="caption" color="text.secondary">
                                          {new Date(movement.createdAt).toLocaleTimeString()}
                                        </Typography>
                                      </TableCell>
                                      <TableCell>
                                        <Chip
                                          icon={getMovementIcon(movement.movementType)}
                                          label={movement.movementType}
                                          color={getMovementColor(movement.movementType)}
                                          size="small"
                                        />
                                      </TableCell>
                                      <TableCell>{movement.quantity}</TableCell>
                                      <TableCell>{formatReason(movement.reason)}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No movements recorded
                            </Typography>
                          )}
                        </Box>
                      ))
                    ) : (
                      <Typography color="text.secondary">No variants found</Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}

      {filteredData.length === 0 && !loading && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No stock history found
          </Typography>
        </Paper>
      )}
    </Box>
  )
}

export default StockHistory