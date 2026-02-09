import React, { useState, useEffect } from 'react'
import {
  Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Box, IconButton, Chip
} from '@mui/material'
import { Add, Edit, Delete } from '@mui/icons-material'
import { useBusiness } from '../context/BusinessContext'
import axios from 'axios'

const Businesses = () => {
  const { businesses, fetchBusinesses, updateBusiness } = useBusiness()
  const [open, setOpen] = useState(false)
  const [editingBusiness, setEditingBusiness] = useState(null)
  const [formData, setFormData] = useState({ name: '', description: '', color: '#000000' })

  const handleOpen = (business = null) => {
    setEditingBusiness(business)
    setFormData(business ? { 
      name: business.name, 
      description: business.description || '', 
      color: business.color || '#000000' 
    } : { 
      name: '', 
      description: '', 
      color: '#000000' 
    })
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setEditingBusiness(null)
    setFormData({ name: '', description: '', color: '#000000' })
  }

  const handleSubmit = async () => {
    try {
      if (editingBusiness) {
        await updateBusiness(editingBusiness.id, formData)
      } else {
        await axios.post('/api/businesses', formData)
        await fetchBusinesses()
      }
      handleClose()
    } catch (error) {
      console.error('Failed to save business:', error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this business?')) {
      try {
        await axios.delete(`/api/businesses/${id}`)
        await fetchBusinesses()
      } catch (error) {
        console.error('Failed to delete business:', error)
      }
    }
  }

  const toggleStatus = async (business) => {
    try {
      const newStatus = business.status === 'active' ? 'inactive' : 'active'
      await axios.put(`/api/businesses/${business.id}`, { ...business, status: newStatus })
      await fetchBusinesses()
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Businesses</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen()}
        >
          Add Business
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Color</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {businesses.map((business) => (
              <TableRow key={business.id}>
                <TableCell>{business.name}</TableCell>
                <TableCell>{business.description || '-'}</TableCell>
                <TableCell>
                  <Box sx={{ 
                    width: 30, 
                    height: 30, 
                    backgroundColor: business.color || '#000000',
                    borderRadius: 1,
                    border: '1px solid #ccc'
                  }} />
                </TableCell>
                <TableCell>
                  <Chip
                    label={business.status}
                    color={business.status === 'active' ? 'success' : 'default'}
                    onClick={() => toggleStatus(business)}
                    clickable
                  />
                </TableCell>
                <TableCell>{new Date(business.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(business)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(business.id)} color="error">
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
          {editingBusiness ? 'Edit Business' : 'Add Business'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Business Name"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Business Color"
            type="color"
            fullWidth
            variant="outlined"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingBusiness ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Businesses