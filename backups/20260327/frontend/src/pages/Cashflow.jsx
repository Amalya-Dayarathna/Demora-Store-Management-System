import React, { useState, useEffect } from 'react'
import {
  Typography, Button, Paper, Box, TextField, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle,
  DialogContent, DialogActions, Tabs, Tab, Grid, Card, CardContent,
  FormControl, InputLabel, Select, MenuItem, IconButton
} from '@mui/material'
import { Add, Edit, Delete } from '@mui/icons-material'
import { useBusiness } from '../context/BusinessContext'
import { formatCurrency } from '../utils/currency'
import axios from 'axios'

const Cashflow = () => {
  const { selectedBusiness } = useBusiness()
  const [tabValue, setTabValue] = useState(0)
  const [summary, setSummary] = useState(null)
  const [capital, setCapital] = useState([])
  const [income, setIncome] = useState([])
  const [expenses, setExpenses] = useState([])
  const [fullCashflow, setFullCashflow] = useState([])
  const [open, setOpen] = useState(false)
  const [dialogType, setDialogType] = useState('')
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    givenBy: '',
    category: ''
  })

  useEffect(() => {
    if (selectedBusiness) {
      fetchData()
    }
  }, [selectedBusiness])

  const fetchData = async () => {
    try {
      const [summaryRes, capitalRes, incomeRes, expensesRes, fullCashflowRes] = await Promise.all([
        axios.get(`/api/cashflow/${selectedBusiness.id}/summary`),
        axios.get(`/api/cashflow/${selectedBusiness.id}/capital`),
        axios.get(`/api/cashflow/${selectedBusiness.id}/income`),
        axios.get(`/api/cashflow/${selectedBusiness.id}/expenses`),
        axios.get(`/api/cashflow/${selectedBusiness.id}/full-cashflow`)
      ])
      
      setSummary(summaryRes.data)
      setCapital(capitalRes.data)
      setIncome(incomeRes.data)
      setExpenses(expensesRes.data)
      setFullCashflow(fullCashflowRes.data)
    } catch (error) {
      console.error('Failed to fetch cashflow data:', error)
    }
  }

  const handleOpen = (type, item = null) => {
    setDialogType(type)
    setEditingItem(item)
    if (item) {
      setFormData({
        amount: item.amount.toString(),
        description: item.description || '',
        givenBy: item.givenBy || '',
        category: item.category || ''
      })
    } else {
      setFormData({ amount: '', description: '', givenBy: '', category: '' })
    }
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setEditingItem(null)
    setFormData({ amount: '', description: '', givenBy: '', category: '' })
  }

  const handleSubmit = async () => {
    try {
      const data = { ...formData, businessId: selectedBusiness.id }
      
      if (editingItem) {
        // Update existing item
        if (dialogType === 'capital') {
          await axios.put(`/api/cashflow/capital/${editingItem.id}`, data)
        } else if (dialogType === 'income') {
          await axios.put(`/api/cashflow/income/${editingItem.id}`, data)
        } else if (dialogType === 'expense') {
          await axios.put(`/api/cashflow/expenses/${editingItem.id}`, data)
        }
      } else {
        // Create new item
        if (dialogType === 'capital') {
          await axios.post('/api/cashflow/capital', data)
        } else if (dialogType === 'income') {
          await axios.post('/api/cashflow/income', data)
        } else if (dialogType === 'expense') {
          await axios.post('/api/cashflow/expenses', data)
        } else if (dialogType === 'profit') {
          await axios.post('/api/cashflow/profit-distribution', {
            amount: data.amount,
            partnerName: data.givenBy,
            businessId: data.businessId,
            description: data.description
          })
        } else if (dialogType === 'salary') {
          await axios.post('/api/cashflow/salary', {
            amount: data.amount,
            employeeName: data.givenBy,
            businessId: data.businessId,
            description: data.description
          })
        }
      }
      
      await fetchData()
      handleClose()
    } catch (error) {
      console.error('Failed to save entry:', error)
    }
  }

  const handleDelete = async (type, id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        if (type === 'capital') {
          await axios.delete(`/api/cashflow/capital/${id}`)
        } else if (type === 'income') {
          await axios.delete(`/api/cashflow/income/${id}`)
        } else if (type === 'expense') {
          await axios.delete(`/api/cashflow/expenses/${id}`)
        }
        await fetchData()
      } catch (error) {
        console.error('Failed to delete item:', error)
      }
    }
  }

  const settleCapital = async (capitalId, amount) => {
    try {
      await axios.put(`/api/cashflow/capital/${capitalId}/settle`, { settleAmount: amount })
      await fetchData()
    } catch (error) {
      console.error('Failed to settle capital:', error)
    }
  }

  if (!selectedBusiness) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" color="text.secondary">
          Please select a business to manage cashflow
        </Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Cashflow - {selectedBusiness.name}
      </Typography>

      {summary && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>Total Capital</Typography>
                <Typography variant="h5">{formatCurrency(summary.totalCapital || 0)}</Typography>
                <Typography color="textSecondary">
                  Remaining: {formatCurrency(summary.remainingCapital || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>Total Income</Typography>
                <Typography variant="h5" color="success.main">
                  {formatCurrency(summary.totalIncome || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>Total Expenses</Typography>
                <Typography variant="h5" color="error.main">
                  {formatCurrency(summary.totalExpenses || 0)}
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
                  color={summary.netCashflow >= 0 ? 'success.main' : 'error.main'}
                >
                  {formatCurrency(summary.netCashflow || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Capital" />
          <Tab label="Income" />
          <Tab label="Expenses" />
          <Tab label="Full Cashflow" />
        </Tabs>

        {tabValue === 0 && (
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Capital Management</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={() => handleOpen('salary')}
                >
                  Pay Salary
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => handleOpen('profit')}
                >
                  Distribute Profit
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => handleOpen('capital')}
                >
                  Add Capital
                </Button>
              </Box>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Given By</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Settled</TableCell>
                    <TableCell>Remaining</TableCell>
                    <TableCell>Actions</TableCell>
                    <TableCell>Settlement</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {capital.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                      <TableCell>{item.givenBy}</TableCell>
                      <TableCell>{formatCurrency(item.amount)}</TableCell>
                      <TableCell>{formatCurrency(item.settled)}</TableCell>
                      <TableCell>{formatCurrency(item.amount - item.settled)}</TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => handleOpen('capital', item)}>
                          <Edit />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDelete('capital', item.id)}>
                          <Delete />
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        {item.amount > item.settled && (
                          <Button
                            size="small"
                            onClick={() => {
                              const amount = prompt('Enter settlement amount:')
                              if (amount) settleCapital(item.id, parseFloat(amount))
                            }}
                          >
                            Settle
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {tabValue === 1 && (
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Income Records</Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpen('income')}
              >
                Add Income
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Source</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {income.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{formatCurrency(item.amount)}</TableCell>
                      <TableCell>{item.source}</TableCell>
                      <TableCell>
                        {item.source !== 'billing' && (
                          <>
                            <IconButton size="small" onClick={() => handleOpen('income', item)}>
                              <Edit />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => handleDelete('income', item.id)}>
                              <Delete />
                            </IconButton>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {tabValue === 2 && (
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Expense Records</Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpen('expense')}
              >
                Add Expense
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {expenses.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>
                        {item.category === 'capital_settlement' ? 'Capital Settlement' : 
                         item.category === 'profit_distribution' ? 'Profit Distribution' :
                         item.category === 'salary' ? 'Salary' :
                         item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                      </TableCell>
                      <TableCell>{formatCurrency(item.amount)}</TableCell>
                      <TableCell>
                        {item.category !== 'capital_settlement' && item.category !== 'profit_distribution' && item.category !== 'salary' && (
                          <>
                            <IconButton size="small" onClick={() => handleOpen('expense', item)}>
                              <Edit />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => handleDelete('expense', item.id)}>
                              <Delete />
                            </IconButton>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
        {tabValue === 3 && (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Full Cashflow History</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Income</TableCell>
                    <TableCell>Expense</TableCell>
                    <TableCell>Balance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fullCashflow.map((transaction, index) => (
                    <TableRow key={`${transaction.type}-${transaction.id}-${index}`}>
                      <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {transaction.type === 'capital' ? 'Capital Investment' :
                         transaction.type === 'settlement' ? 'Capital Settlement' :
                         transaction.type === 'salary' ? 'Salary Payment' :
                         transaction.type === 'profit_distribution' ? 'Profit Distribution' :
                         transaction.type === 'income' ? 'Income' :
                         'Expense'}
                      </TableCell>
                      <TableCell>
                        {transaction.description || transaction.givenBy || 
                         (transaction.category && transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1))}
                      </TableCell>
                      <TableCell>{transaction.amount > 0 ? formatCurrency(transaction.amount) : '-'}</TableCell>
                      <TableCell>{transaction.amount < 0 ? formatCurrency(-transaction.amount) : '-'}</TableCell>
                      <TableCell>{formatCurrency(transaction.balance)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Paper>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingItem ? 'Edit' : 'Add'} {dialogType === 'capital' ? 'Capital' : dialogType === 'income' ? 'Income' : dialogType === 'profit' ? 'Profit Distribution' : dialogType === 'salary' ? 'Salary Payment' : 'Expense'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Amount"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            sx={{ mb: 2 }}
          />
          
          {(dialogType === 'capital' || dialogType === 'profit' || dialogType === 'salary') && (
            <TextField
              margin="dense"
              label={dialogType === 'profit' ? 'Partner Name' : dialogType === 'salary' ? 'Employee Name' : 'Given By'}
              fullWidth
              variant="outlined"
              value={formData.givenBy}
              onChange={(e) => setFormData({ ...formData, givenBy: e.target.value })}
              sx={{ mb: 2 }}
            />
          )}
          
          {(dialogType !== 'capital' && dialogType !== 'profit' && dialogType !== 'salary') && (
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              variant="outlined"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              sx={{ mb: 2 }}
            />
          )}
          
          {(dialogType === 'profit' || dialogType === 'salary') && (
            <TextField
              margin="dense"
              label="Description (Optional)"
              fullWidth
              variant="outlined"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              sx={{ mb: 2 }}
            />
          )}
          
          {dialogType === 'expense' && (
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                label="Category"
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <MenuItem value="packaging">Packaging</MenuItem>
                <MenuItem value="delivery">Delivery</MenuItem>
                <MenuItem value="ads">Advertising</MenuItem>
                <MenuItem value="supplies">Supplies</MenuItem>
                <MenuItem value="utilities">Utilities</MenuItem>
                <MenuItem value="capital_settlement">Capital Settlement</MenuItem>
                <MenuItem value="profit_distribution">Profit Distribution</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">{editingItem ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Cashflow