import React, { createContext, useContext, useState, useEffect } from 'react'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import axios from 'axios'

const BusinessContext = createContext()

export const useBusiness = () => {
  const context = useContext(BusinessContext)
  if (!context) {
    throw new Error('useBusiness must be used within a BusinessProvider')
  }
  return context
}

export const BusinessProvider = ({ children }) => {
  const [selectedBusiness, setSelectedBusiness] = useState(null)
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(false)
  const [theme, setTheme] = useState(null)

  const createBusinessTheme = (color) => {
    return createTheme({
      palette: {
        mode: 'light',
        primary: {
          main: color || '#000000',
        },
        secondary: {
          main: '#ffffff',
        },
        background: {
          default: '#ffffff',
          paper: '#f5f5f5',
        },
        text: {
          primary: '#000000',
          secondary: '#666666',
        },
      },
      typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h4: {
          fontWeight: 600,
        },
        h6: {
          fontWeight: 500,
        },
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: 'none',
              borderRadius: 4,
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              border: '1px solid #e0e0e0',
            },
          },
        },
      },
    })
  }

  const fetchBusinesses = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/businesses')
      setBusinesses(response.data)
      
      // Auto-select first business if none selected
      if (!selectedBusiness && response.data.length > 0) {
        selectBusiness(response.data[0])
      }
    } catch (error) {
      console.error('Failed to fetch businesses:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBusinesses()
  }, [])

  const selectBusiness = (business) => {
    setSelectedBusiness(business)
    setTheme(createBusinessTheme(business?.color))
  }

  const addBusiness = async (businessData) => {
    try {
      const response = await axios.post('/api/businesses', businessData)
      await fetchBusinesses()
      return { success: true, business: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Failed to create business' }
    }
  }

  const updateBusiness = async (id, businessData) => {
    try {
      const response = await axios.put(`/api/businesses/${id}`, businessData)
      await fetchBusinesses()
      // Update selected business if it was the one being edited
      if (selectedBusiness && selectedBusiness.id === id) {
        selectBusiness(response.data)
      }
      return { success: true, business: response.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Failed to update business' }
    }
  }

  const value = {
    selectedBusiness,
    businesses,
    loading,
    selectBusiness,
    addBusiness,
    updateBusiness,
    fetchBusinesses
  }

  return (
    <BusinessContext.Provider value={value}>
      {theme ? (
        <ThemeProvider theme={theme}>
          {children}
        </ThemeProvider>
      ) : (
        children
      )}
    </BusinessContext.Provider>
  )
}