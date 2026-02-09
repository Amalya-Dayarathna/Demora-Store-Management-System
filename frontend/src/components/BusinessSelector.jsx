import React from 'react'
import { FormControl, InputLabel, Select, MenuItem, Box, Typography } from '@mui/material'
import { useBusiness } from '../context/BusinessContext'

const BusinessSelector = () => {
  const { selectedBusiness, businesses, selectBusiness, loading } = useBusiness()

  if (loading) return <div>Loading businesses...</div>

  if (businesses.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="text.secondary">
          No businesses found. Please create a business first.
        </Typography>
      </Box>
    )
  }

  return (
    <FormControl fullWidth size="small" sx={{ minWidth: 200 }}>
      <InputLabel>Select Business</InputLabel>
      <Select
        value={selectedBusiness?.id || ''}
        label="Select Business"
        onChange={(e) => {
          const business = businesses.find(b => b.id === e.target.value)
          selectBusiness(business)
        }}
      >
        {businesses.map((business) => (
          <MenuItem key={business.id} value={business.id}>
            {business.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

export default BusinessSelector