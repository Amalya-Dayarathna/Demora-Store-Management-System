import React, { useState } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, Typography, Box
} from '@mui/material'
import { QrCode2 as BarcodeIcon } from '@mui/icons-material'

const BarcodeScanner = ({ open, onClose, onScan }) => {
  const [barcodeInput, setBarcodeInput] = useState('')

  const handleScan = () => {
    if (barcodeInput.trim()) {
      onScan(barcodeInput.trim())
      setBarcodeInput('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleScan()
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BarcodeIcon />
          Barcode Scanner
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ py: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Use a barcode scanner device or manually enter the barcode number
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="Scan or Enter Barcode"
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Scan barcode or type manually..."
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleScan} 
          variant="contained"
          disabled={!barcodeInput.trim()}
        >
          Add to Cart
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default BarcodeScanner
