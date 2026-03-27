import React, { useState, useEffect } from 'react'
import {
  Typography, Grid, Paper, Box, Card, CardContent, CircularProgress
} from '@mui/material'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useBusiness } from '../context/BusinessContext'
import axios from 'axios'

const Dashboard = () => {
  const { selectedBusiness } = useBusiness()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (selectedBusiness) {
      fetchStats()
    }
  }, [selectedBusiness])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const [inventoryRes, salesRes, cashflowRes, categoriesRes, itemsRes] = await Promise.all([
        axios.get(`/api/reports/${selectedBusiness.id}/inventory`),
        axios.get(`/api/reports/${selectedBusiness.id}/sales`),
        axios.get(`/api/cashflow/${selectedBusiness.id}/summary`),
        axios.get(`/api/categories/${selectedBusiness.id}`),
        axios.get(`/api/items/${selectedBusiness.id}`)
      ])
      
      setStats({
        inventory: inventoryRes.data,
        sales: salesRes.data,
        cashflow: cashflowRes.data,
        categories: categoriesRes.data,
        items: itemsRes.data
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!selectedBusiness) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" color="text.secondary">
          Please select a business to view dashboard
        </Typography>
      </Box>
    )
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard - {selectedBusiness.name}
      </Typography>
      
      {stats && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Variants
                </Typography>
                <Typography variant="h4">
                  {stats.inventory.totalVariants}
                </Typography>
                <Typography color="error">
                  {stats.inventory.outOfStock} out of stock
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Sales
                </Typography>
                <Typography variant="h4">
                  ${stats.sales.totalSales?.toFixed(2) || '0.00'}
                </Typography>
                <Typography color="textSecondary">
                  {stats.sales.totalOrders} orders
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Net Cashflow
                </Typography>
                <Typography variant="h4" color={stats.cashflow.netCashflow >= 0 ? 'success.main' : 'error.main'}>
                  ${stats.cashflow.netCashflow?.toFixed(2) || '0.00'}
                </Typography>
                <Typography color="textSecondary">
                  Income: ${stats.cashflow.totalIncome?.toFixed(2) || '0.00'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Low Stock Alert
              </Typography>
              {stats.inventory.lowStockItems.length > 0 ? (
                stats.inventory.lowStockItems.slice(0, 5).map((variant) => (
                  <Box key={variant.id} sx={{ mb: 1 }}>
                    <Typography>
                      {variant.item.itemName} ({variant.variantCode}) - {variant.stockQuantity} left
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography color="text.secondary">No low stock items</Typography>
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Items by Category</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.categories?.map(cat => ({
                        name: cat.categoryName,
                        value: stats.items?.filter(item => item.categoryId === cat.id).length || 0
                      })) || []}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stats.categories?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 50%)`} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Stock Levels</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.items?.slice(0, 10) || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="itemName" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="totalStock" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  )
}

export default Dashboard