const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/items/')
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)
    if (extname && mimetype) {
      cb(null, true)
    } else {
      cb(new Error('Only image files (jpeg, jpg, png, webp) are allowed'))
    }
  }
})

// Upload images for an item or variant
router.post('/:itemId/upload', upload.array('images', 10), async (req, res) => {
  try {
    const { itemId } = req.params
    const { variantIndex } = req.body
    const item = await prisma.item.findUnique({ where: { id: itemId } })
    
    if (!item) {
      req.files.forEach(file => fs.unlinkSync(file.path))
      return res.status(404).json({ error: 'Item not found' })
    }

    const imagePaths = req.files.map(file => `/uploads/items/${file.filename}`)
    
    if (variantIndex !== undefined && variantIndex !== '') {
      const variants = item.variants || []
      const idx = parseInt(variantIndex)
      
      if (idx >= 0 && idx < variants.length) {
        const currentImages = variants[idx].images || []
        variants[idx].images = [...currentImages, ...imagePaths]
        
        await prisma.item.update({
          where: { id: itemId },
          data: { variants }
        })
        
        return res.json({ images: variants[idx].images })
      }
    }
    
    const currentImages = item.images || []
    const updatedImages = [...currentImages, ...imagePaths]

    await prisma.item.update({
      where: { id: itemId },
      data: { images: updatedImages }
    })

    res.json({ images: updatedImages })
  } catch (error) {
    req.files?.forEach(file => fs.unlinkSync(file.path))
    res.status(500).json({ error: error.message })
  }
})

// Delete an image
router.delete('/:itemId/images', async (req, res) => {
  try {
    const { itemId } = req.params
    const { imagePath, variantIndex } = req.body

    const item = await prisma.item.findUnique({ where: { id: itemId } })
    if (!item) return res.status(404).json({ error: 'Item not found' })

    if (variantIndex !== undefined && variantIndex !== '') {
      const variants = item.variants || []
      const idx = parseInt(variantIndex)
      
      if (idx >= 0 && idx < variants.length) {
        const currentImages = variants[idx].images || []
        variants[idx].images = currentImages.filter(img => img !== imagePath)
        
        await prisma.item.update({
          where: { id: itemId },
          data: { variants }
        })
        
        const filePath = path.join(__dirname, '..', imagePath)
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
        
        return res.json({ images: variants[idx].images })
      }
    }

    const currentImages = item.images || []
    const updatedImages = currentImages.filter(img => img !== imagePath)

    await prisma.item.update({
      where: { id: itemId },
      data: { images: updatedImages }
    })

    const filePath = path.join(__dirname, '..', imagePath)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    res.json({ images: updatedImages })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get images for an item or variant
router.get('/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params
    const { variantIndex } = req.query
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      select: { images: true, variants: true }
    })
    
    if (!item) return res.status(404).json({ error: 'Item not found' })
    
    if (variantIndex !== undefined && variantIndex !== '') {
      const variants = item.variants || []
      const idx = parseInt(variantIndex)
      
      if (idx >= 0 && idx < variants.length) {
        return res.json({ images: variants[idx].images || [] })
      }
    }
    
    res.json({ images: item.images || [] })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
