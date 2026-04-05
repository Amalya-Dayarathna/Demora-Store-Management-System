import React, { useState, useEffect } from 'react'
import {
  Container, Paper, Typography, Box, Button, Checkbox,
  InputAdornment, IconButton, Grid, Autocomplete, TextField,
  Card, CardContent
} from '@mui/material'
import { Search, Print, QrCode2 as BarcodeIcon, Download, Clear } from '@mui/icons-material'
import Barcode from 'react-barcode'
import JsBarcode from 'jsbarcode'
import axios from 'axios'
import { useBusiness } from '../context/BusinessContext'

const Barcodes = () => {
  const { selectedBusiness } = useBusiness()
  const [items, setItems] = useState([])
  const [variants, setVariants] = useState([])
  const [selectedBarcodes, setSelectedBarcodes] = useState([])
  const [displayedBarcodes, setDisplayedBarcodes] = useState([])
  const [quantities, setQuantities] = useState({})

  useEffect(() => {
    if (selectedBusiness) {
      fetchData()
    }
  }, [selectedBusiness])

  const fetchData = async () => {
    try {
      const [itemsRes, variantsRes] = await Promise.all([
        axios.get(`/api/items/${selectedBusiness.id}`),
        axios.get(`/api/variants/${selectedBusiness.id}`)
      ])
      console.log('Items loaded:', itemsRes.data.length)
      console.log('Variants loaded:', variantsRes.data.length)
      setItems(itemsRes.data)
      setVariants(variantsRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const allBarcodes = [
    ...items.filter(item => item.barcode).map(item => ({
      id: `item-${item.id}`,
      barcode: item.barcode,
      name: item.itemName,
      code: item.baseRefCode,
      type: 'Item',
      stock: item.stockQuantity,
      price: item.sellingPrice
    })),
    // Add inline variants
    ...items.flatMap(item => 
      (item.variants || []).filter(v => v.barcode).map((variant, index) => ({
        id: `item-${item.id}-variant-${index}`,
        barcode: variant.barcode,
        name: item.itemName,
        code: `${item.baseRefCode}-${variant.color || variant.size || index}`,
        type: 'Inline Variant',
        attributes: { color: variant.color, size: variant.size },
        stock: variant.quantity,
        price: item.sellingPrice
      }))
    ),
    // Add real variants
    ...variants.filter(v => v.barcode).map(variant => ({
      id: `variant-${variant.id}`,
      barcode: variant.barcode,
      name: variant.item.itemName,
      code: variant.variantCode,
      type: 'Variant',
      attributes: variant.attributes,
      stock: variant.stockQuantity,
      price: variant.item.sellingPrice
    }))
  ]

  const handleAddToDisplay = (selectedOptions) => {
    if (!selectedOptions || selectedOptions.length === 0) return
    
    const newBarcodes = selectedOptions.filter(
      option => !displayedBarcodes.find(b => b.id === option.id)
    )
    
    const newQuantities = { ...quantities }
    newBarcodes.forEach(b => {
      if (!newQuantities[b.id]) newQuantities[b.id] = 1
    })
    
    setDisplayedBarcodes([...displayedBarcodes, ...newBarcodes])
    setQuantities(newQuantities)
  }

  const handleRemoveFromDisplay = (id) => {
    setDisplayedBarcodes(displayedBarcodes.filter(b => b.id !== id))
    setSelectedBarcodes(selectedBarcodes.filter(bId => bId !== id))
    const newQuantities = { ...quantities }
    delete newQuantities[id]
    setQuantities(newQuantities)
  }

  const handleClearAll = () => {
    setDisplayedBarcodes([])
    setSelectedBarcodes([])
    setQuantities({})
  }

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=800,height=600')
    const selectedItems = displayedBarcodes.filter(b => selectedBarcodes.includes(b.id))
    
    // Generate barcode SVGs
    const barcodeDataUrls = {}
    selectedItems.forEach(item => {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      JsBarcode(svg, item.barcode, {
        format: 'EAN13',
        width: 1,
        height: 20,
        displayValue: false
      })
      const svgData = new XMLSerializer().serializeToString(svg)
      barcodeDataUrls[item.id] = 'data:image/svg+xml;base64,' + btoa(svgData)
    })
    
    // Expand items based on quantity
    const expandedItems = []
    selectedItems.forEach(item => {
      const qty = quantities[item.id] || 1
      for (let i = 0; i < qty; i++) {
        expandedItems.push({ ...item, barcodeUrl: barcodeDataUrls[item.id] })
      }
    })
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Barcodes</title>
          <style>
            * { box-sizing: border-box; }
            body { font-family: Arial, sans-serif; margin: 5mm; padding: 0; }
            .barcode-grid { 
              display: grid; 
              grid-template-columns: repeat(6, 1fr); 
              gap: 3mm;
            }
            .barcode-item { 
              border: 1px solid #000; 
              padding: 1.5mm; 
              text-align: center;
              page-break-inside: avoid;
              background: white;
              width: 30mm;
              height: 20mm;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              align-items: center;
            }
            .header-row { 
              display: flex;
              justify-content: space-between;
              width: 100%;
              font-size: 7px; 
              font-weight: bold; 
              margin: 0;
              color: #000;
            }
            .barcode-img { 
              width: 100%;
              height: auto;
              margin: 0.5mm 0;
            }
            .barcode-number { 
              font-size: 6px; 
              font-weight: bold;
              margin: 0;
              letter-spacing: 0.3px;
            }
            .item-code { 
              font-size: 6px; 
              font-weight: normal;
              margin: 0;
              color: #000;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              width: 100%;
            }
            @media print {
              body { margin: 5mm; }
              .barcode-grid { gap: 3mm; }
            }
          </style>
        </head>
        <body>
          <div class="barcode-grid">
            ${expandedItems.map(item => {
              const variantText = item.attributes ? 
                ` - ${Object.entries(item.attributes).filter(([k,v]) => v).map(([k,v]) => v).join('/')}` : 
                '';
              return `
              <div class="barcode-item">
                <div class="header-row">
                  <span>DEMORA</span>
                  <span>LKR ${item.price.toFixed(2)}</span>
                </div>
                <img class="barcode-img" src="${item.barcodeUrl}" alt="Barcode" />
                <div class="barcode-number">${item.barcode}</div>
                <div class="item-code">${item.code}${variantText}</div>
              </div>
            `}).join('')}
          </div>
          <script>
            window.onload = function() {
              setTimeout(() => window.print(), 500);
            };
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  const handleDownloadBarcodes = () => {
    const selectedItems = displayedBarcodes.filter(b => selectedBarcodes.includes(b.id))
    
    // Expand items based on quantity
    const expandedItems = []
    selectedItems.forEach(item => {
      const qty = quantities[item.id] || 1
      for (let i = 0; i < qty; i++) {
        expandedItems.push({ ...item, copyNumber: i + 1 })
      }
    })
    
    expandedItems.forEach((item, index) => {
      setTimeout(() => {
        // Generate barcode SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        JsBarcode(svg, item.barcode, {
          format: 'EAN13',
          width: 1,
          height: 20,
          displayValue: false
        })
        const svgData = new XMLSerializer().serializeToString(svg)
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
        const url = URL.createObjectURL(svgBlob)
        
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          canvas.width = 240
          canvas.height = 160
          
          // White background
          ctx.fillStyle = 'white'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          
          // Black border
          ctx.strokeStyle = 'black'
          ctx.lineWidth = 2
          ctx.strokeRect(0, 0, canvas.width, canvas.height)
          
          // Header row - DEMORA and Price
          ctx.fillStyle = 'black'
          ctx.font = 'bold 12px Arial'
          ctx.textAlign = 'left'
          ctx.fillText('DEMORA', 10, 18)
          ctx.textAlign = 'right'
          ctx.fillText(`LKR ${item.price.toFixed(2)}`, canvas.width - 10, 18)
          
          // Draw barcode (centered)
          const barcodeWidth = 200
          const barcodeX = (canvas.width - barcodeWidth) / 2
          ctx.drawImage(img, barcodeX, 35, barcodeWidth, 40)
          
          // Barcode number (centered)
          ctx.font = 'bold 10px Arial'
          ctx.textAlign = 'center'
          ctx.fillText(item.barcode, canvas.width / 2, 90)
          
          // Item code and variant (centered)
          ctx.font = '10px Arial'
          const variantText = item.attributes ? 
            ` - ${Object.entries(item.attributes).filter(([k,v]) => v).map(([k,v]) => v).join('/')}` : 
            '';
          ctx.fillText(`${item.code}${variantText}`, canvas.width / 2, 110)
          
          // Download
          canvas.toBlob((blob) => {
            const downloadUrl = URL.createObjectURL(blob)
            const link = document.createElement('a')
            const suffix = expandedItems.filter(i => i.id === item.id).length > 1 ? `-copy${item.copyNumber}` : ''
            link.download = `barcode-${item.code}${suffix}.png`
            link.href = downloadUrl
            link.click()
            URL.revokeObjectURL(downloadUrl)
          })
          
          URL.revokeObjectURL(url)
        }
        
        img.src = url
      }, index * 300)
    })
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Barcodes
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Search, select, and print/download barcodes for items and variants
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Autocomplete
              multiple
              options={allBarcodes}
              getOptionLabel={(option) => {
                const attrText = option.attributes ? 
                  ` (${Object.entries(option.attributes).filter(([k,v]) => v).map(([k, v]) => `${k}: ${v}`).join(', ')})` : 
                  '';
                return `${option.name} - ${option.code}${attrText} - Stock: ${option.stock}`;
              }}
              onChange={(event, value) => handleAddToDisplay(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Search and select items/variants to display..."
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                        {params.InputProps.startAdornment}
                      </>
                    )
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: 'right', display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={handleDownloadBarcodes}
              disabled={selectedBarcodes.length === 0}
            >
              Download ({selectedBarcodes.length})
            </Button>
            <Button
              variant="contained"
              startIcon={<Print />}
              onClick={handlePrint}
              disabled={selectedBarcodes.length === 0}
            >
              Print ({selectedBarcodes.length})
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Clear />}
              onClick={handleClearAll}
              disabled={displayedBarcodes.length === 0}
            >
              Clear
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={2}>
        {displayedBarcodes.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Checkbox
                      checked={selectedBarcodes.includes(item.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedBarcodes([...selectedBarcodes, item.id])
                        } else {
                          setSelectedBarcodes(selectedBarcodes.filter(id => id !== item.id))
                        }
                      }}
                    />
                    <TextField
                      type="number"
                      size="small"
                      label="Copies"
                      value={quantities[item.id] || 1}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1
                        setQuantities({ ...quantities, [item.id]: Math.max(1, val) })
                      }}
                      inputProps={{ min: 1, max: 100 }}
                      sx={{ width: 80 }}
                    />
                  </Box>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleRemoveFromDisplay(item.id)}
                  >
                    <Clear />
                  </IconButton>
                </Box>
                <Typography variant="subtitle2" gutterBottom>
                  {item.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {item.code}
                </Typography>
                {item.attributes && (
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    {Object.entries(item.attributes).map(([k, v]) => `${k}: ${v}`).join(', ')}
                  </Typography>
                )}
                <Box sx={{ textAlign: 'center', my: 2 }}>
                  <Barcode value={item.barcode} width={1.5} height={50} fontSize={12} />
                </Box>
                <Typography variant="body2" gutterBottom>
                  Price: LKR {item.price.toFixed(2)}
                </Typography>
                <Typography variant="body2" color={item.stock > 0 ? 'success.main' : 'error.main'}>
                  Stock: {item.stock}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {displayedBarcodes.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <BarcodeIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Search and select items/variants to display barcodes
          </Typography>
        </Box>
      )}
    </Container>
  )
}

export default Barcodes
