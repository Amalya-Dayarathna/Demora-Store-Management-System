import React, { useState, useEffect } from 'react'
import {
  Typography, Button, Box, Grid, Card, CardMedia, CardActions,
  IconButton, FormControl, InputLabel, Select, MenuItem, Alert, Chip
} from '@mui/material'
import { CloudUpload, Delete, SwapHoriz, Image as ImageIcon } from '@mui/icons-material'
import { useBusiness } from '../context/BusinessContext'
import axios from 'axios'

const Images = () => {
  const { selectedBusiness } = useBusiness()
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedItem, setSelectedItem] = useState('')
  const [selectedVariant, setSelectedVariant] = useState('')
  const [images, setImages] = useState([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (selectedBusiness) {
      fetchCategories()
    }
  }, [selectedBusiness])

  useEffect(() => {
    if (selectedCategory) {
      fetchItemsByCategory()
    } else {
      setItems([])
      setSelectedItem('')
    }
  }, [selectedCategory])

  useEffect(() => {
    if (selectedItem) {
      setSelectedVariant('')
      fetchImages()
    } else {
      setImages([])
    }
  }, [selectedItem])

  useEffect(() => {
    if (selectedVariant) {
      fetchImages()
    }
  }, [selectedVariant])

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`/api/categories/${selectedBusiness.id}`)
      setCategories(response.data)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const fetchItemsByCategory = async () => {
    try {
      const response = await axios.get(`/api/items/${selectedBusiness.id}`)
      const filtered = response.data.filter(item => item.categoryId === selectedCategory)
      setItems(filtered)
    } catch (error) {
      console.error('Failed to fetch items:', error)
    }
  }

  const fetchImages = async () => {
    try {
      const params = selectedVariant !== '' ? `?variantIndex=${selectedVariant}` : ''
      const response = await axios.get(`/api/images/${selectedItem}${params}`)
      setImages(response.data.images || [])
    } catch (error) {
      console.error('Failed to fetch images:', error)
    }
  }

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files)
    
    if (files.length + images.length > 10) {
      setError('Maximum 10 images allowed per item')
      return
    }

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      files.forEach(file => formData.append('images', file))
      if (selectedVariant !== '') {
        formData.append('variantIndex', selectedVariant)
      }

      const response = await axios.post(`/api/images/${selectedItem}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setImages(response.data.images)
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to upload images')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (imagePath) => {
    if (!window.confirm('Delete this image?')) return

    try {
      const data = { imagePath }
      if (selectedVariant !== '') {
        data.variantIndex = selectedVariant
      }
      
      const response = await axios.delete(`/api/images/${selectedItem}/images`, { data })
      setImages(response.data.images)
    } catch (error) {
      setError('Failed to delete image')
    }
  }

  const handleReplace = async (oldImagePath, event) => {
    const file = event.target.files[0]
    if (!file) return

    setUploading(true)
    setError('')

    try {
      const deleteData = { imagePath: oldImagePath }
      if (selectedVariant !== '') {
        deleteData.variantIndex = selectedVariant
      }
      
      await axios.delete(`/api/images/${selectedItem}/images`, { data: deleteData })

      const formData = new FormData()
      formData.append('images', file)
      if (selectedVariant !== '') {
        formData.append('variantIndex', selectedVariant)
      }

      const response = await axios.post(`/api/images/${selectedItem}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setImages(response.data.images)
    } catch (error) {
      setError('Failed to replace image')
    } finally {
      setUploading(false)
    }
  }

  if (!selectedBusiness) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" color="text.secondary">
          Please select a business to manage images
        </Typography>
      </Box>
    )
  }

  const selectedItemData = items.find(i => i.id === selectedItem)
  const itemVariants = selectedItemData?.variants || []

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Product Images - {selectedBusiness.name}
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Select Category</InputLabel>
            <Select
              value={selectedCategory}
              label="Select Category"
              onChange={(e) => {
                setSelectedCategory(e.target.value)
                setSelectedItem('')
                setSelectedVariant('')
              }}
            >
              <MenuItem value="">-- Select Category --</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.categoryName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={4}>
          <FormControl fullWidth disabled={!selectedCategory}>
            <InputLabel>Select Item</InputLabel>
            <Select
              value={selectedItem}
              label="Select Item"
              onChange={(e) => {
                setSelectedItem(e.target.value)
                setSelectedVariant('')
              }}
            >
              <MenuItem value="">-- Select Item --</MenuItem>
              {items.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.itemName} ({item.baseRefCode})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {itemVariants.length > 0 && (
          <Grid item xs={12} md={4}>
            <FormControl fullWidth disabled={!selectedItem}>
              <InputLabel>Select Variant (Optional)</InputLabel>
              <Select
                value={selectedVariant}
                label="Select Variant (Optional)"
                onChange={(e) => setSelectedVariant(e.target.value)}
              >
                <MenuItem value="">All Variants</MenuItem>
                {itemVariants.map((variant, idx) => (
                  <MenuItem key={idx} value={idx}>
                    {variant.color} - {variant.size}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}
      </Grid>

      {selectedItem && (
        <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Uploading images for: <strong>{selectedItemData?.itemName}</strong>
            {selectedVariant !== '' && itemVariants[selectedVariant] && (
              <Chip 
                label={`${itemVariants[selectedVariant].color} - ${itemVariants[selectedVariant].size}`}
                size="small"
                sx={{ ml: 1 }}
              />
            )}
          </Typography>
        </Box>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {selectedItem && (
        <>
          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              component="label"
              startIcon={<CloudUpload />}
              disabled={uploading || images.length >= 10}
            >
              {uploading ? 'Uploading...' : 'Upload Images'}
              <input
                type="file"
                hidden
                multiple
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileUpload}
              />
            </Button>
            <Typography variant="caption" sx={{ ml: 2, color: 'text.secondary' }}>
              {images.length}/10 images • Min 3 required for website
            </Typography>
          </Box>

          {images.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8, bgcolor: 'grey.50', borderRadius: 2 }}>
              <ImageIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
              <Typography color="text.secondary">
                No images uploaded yet. Upload at least 3 images for this item.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {images.map((imagePath, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                  <Card>
                    <CardMedia
                      component="img"
                      height="200"
                      image={`http://localhost:5001${imagePath}`}
                      alt={`${selectedItemData?.itemName} - ${index + 1}`}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardActions sx={{ justifyContent: 'space-between' }}>
                      <Box>
                        <IconButton
                          size="small"
                          color="primary"
                          component="label"
                          disabled={uploading}
                        >
                          <SwapHoriz />
                          <input
                            type="file"
                            hidden
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={(e) => handleReplace(imagePath, e)}
                          />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(imagePath)}
                          disabled={uploading}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                      <Typography variant="caption">
                        Image {index + 1}
                      </Typography>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}
    </Box>
  )
}

export default Images
