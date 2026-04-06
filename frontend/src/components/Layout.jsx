import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemIcon, 
  ListItemText, Box, IconButton, useMediaQuery, useTheme
} from '@mui/material'
import {
  Menu as MenuIcon, Dashboard, Business, Category, Inventory,
  QrCode2 as BarcodeIcon, Receipt, AccountBalance, Assessment, Logout, History, ReceiptLong, CardGiftcard
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import BusinessSelector from './BusinessSelector'

const drawerWidth = 240

const Layout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Businesses', icon: <Business />, path: '/businesses' },
    { text: 'Categories', icon: <Category />, path: '/categories' },
    { text: 'Items', icon: <Inventory />, path: '/items' },
    { text: 'Barcodes', icon: <BarcodeIcon />, path: '/barcodes' },
    { text: 'Gift Boxes', icon: <CardGiftcard />, path: '/gift-boxes' },
    { text: 'Stock History', icon: <History />, path: '/stock-history' },
    { text: 'Billing', icon: <Receipt />, path: '/billing' },
    { text: 'Bills', icon: <ReceiptLong />, path: '/bills' },
    { text: 'Cashflow', icon: <AccountBalance />, path: '/cashflow' },
    { text: 'Reports', icon: <Assessment />, path: '/reports' },
  ]

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const drawer = (
    <div>
      <Toolbar sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80px', pb: 0 }}>
        <img src="/images/demora.png" alt="Demora" style={{ height: '125px' }} />
      </Toolbar>
      <List sx={{ pt: 0 }}>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => navigate(item.path)}
            selected={location.pathname === item.path}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'rgba(0, 0, 0, 0.08)',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.12)',
                },
              },
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        <ListItem button onClick={handleLogout}>
          <ListItemIcon><Logout /></ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </div>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: 'white',
          color: 'black',
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <BusinessSelector />
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: { xs: 7, sm: 8 },
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

export default Layout