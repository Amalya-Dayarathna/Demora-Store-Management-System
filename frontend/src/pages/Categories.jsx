import React, { useState, useEffect } from 'react'
import {
  Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Box, IconButton
} from '@mui/material'
import { Add, Edit, Delete } from '@mui/icons-material'
import { useBusiness } from '../context/BusinessContext'
import axios from 'axios'

const Categories = () => {
  const { selectedBusiness } = useBusiness()
  const [categories, setCategories] = useState([])
  const [open, setOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formData, setFormData] = useState({ categoryName: '', categoryCode: '' })

  useEffect(() => {
    if (selectedBusiness) {
      fetchCategories()
    }
  }, [selectedBusiness])

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`/api/categories/${selectedBusiness.id}`)
      setCategories(response.data)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const handleOpen = (category = null) => {
    setEditingCategory(category)
    setFormData(category ? 
      { categoryName: category.categoryName, categoryCode: category.categoryCode } : 
      { categoryName: '', categoryCode: '' }
    )
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setEditingCategory(null)
    setFormData({ categoryName: '', categoryCode: '' })
  }

  const handleSubmit = async () => {
    try {
      const data = { ...formData, businessId: selectedBusiness.id }
      
      if (editingCategory) {
        await axios.put(`/api/categories/${editingCategory.id}`, formData)
      } else {
        await axios.post('/api/categories', data)
      }
      
      await fetchCategories()
      handleClose()
    } catch (error) {
      console.error('Failed to save category:', error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await axios.delete(`/api/categories/${id}`)
        await fetchCategories()
      } catch (error) {
        console.error('Failed to delete category:', error)
      }
    }
  }

  if (!selectedBusiness) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" color="text.secondary">
          Please select a business to manage categories
        </Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Categories - {selectedBusiness.name}</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen()}
        >
          Add Category
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Category Name</TableCell>
              <TableCell>Category Code</TableCell>
              <TableCell>Items Count</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.categoryName}</TableCell>
                <TableCell>{category.categoryCode}</TableCell>
                <TableCell>{category._count?.items || 0}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(category)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(category.id)} color="error">
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
          {editingCategory ? 'Edit Category' : 'Add Category'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Category Name"
            fullWidth
            variant="outlined"
            value={formData.categoryName}
            onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Category Code (e.g., HC, TS)"
            fullWidth
            variant="outlined"
            value={formData.categoryCode}
            onChange={(e) => setFormData({ ...formData, categoryCode: e.target.value.toUpperCase() })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingCategory ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Categories