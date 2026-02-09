import React, { useRef, useEffect, useState } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography } from '@mui/material'

const QRScanner = ({ open, onClose, onScan }) => {
  const videoRef = useRef(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      startCamera()
    } else {
      stopCamera()
    }
    
    return () => stopCamera()
  }, [open])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      setError('Camera access denied or not available')
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks()
      tracks.forEach(track => track.stop())
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Scan QR Code</DialogTitle>
      <DialogContent>
        {error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <Box sx={{ textAlign: 'center' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{ width: '100%', maxWidth: 400, height: 300 }}
            />
            <Typography variant="body2" sx={{ mt: 2 }}>
              Point camera at QR code to scan
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}

export default QRScanner