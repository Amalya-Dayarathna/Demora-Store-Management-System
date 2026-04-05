import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { BusinessProvider } from './context/BusinessContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Businesses from './pages/Businesses'
import Categories from './pages/Categories'
import Items from './pages/Items'
import Images from './pages/Images'
import GiftBoxes from './pages/GiftBoxes'
import StockHistory from './pages/StockHistory'
import Billing from './pages/Billing'
import Bills from './pages/Bills'
import Cashflow from './pages/Cashflow'
import Reports from './pages/Reports'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) return <div>Loading...</div>
  
  return user ? children : <Navigate to="/login" />
}

const AppRoutes = () => {
  const { user, loading } = useAuth()
  
  if (loading) return <div>Loading...</div>
  
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <BusinessProvider>
            <Layout>
              <Dashboard />
            </Layout>
          </BusinessProvider>
        </ProtectedRoute>
      } />
      <Route path="/businesses" element={
        <ProtectedRoute>
          <BusinessProvider>
            <Layout>
              <Businesses />
            </Layout>
          </BusinessProvider>
        </ProtectedRoute>
      } />
      <Route path="/categories" element={
        <ProtectedRoute>
          <BusinessProvider>
            <Layout>
              <Categories />
            </Layout>
          </BusinessProvider>
        </ProtectedRoute>
      } />
      <Route path="/items" element={
        <ProtectedRoute>
          <BusinessProvider>
            <Layout>
              <Items />
            </Layout>
          </BusinessProvider>
        </ProtectedRoute>
      } />
      <Route path="/images" element={
        <ProtectedRoute>
          <BusinessProvider>
            <Layout>
              <Images />
            </Layout>
          </BusinessProvider>
        </ProtectedRoute>
      } />
      <Route path="/gift-boxes" element={
        <ProtectedRoute>
          <BusinessProvider>
            <Layout>
              <GiftBoxes />
            </Layout>
          </BusinessProvider>
        </ProtectedRoute>
      } />
      <Route path="/stock-history" element={
        <ProtectedRoute>
          <BusinessProvider>
            <Layout>
              <StockHistory />
            </Layout>
          </BusinessProvider>
        </ProtectedRoute>
      } />
      <Route path="/billing" element={
        <ProtectedRoute>
          <BusinessProvider>
            <Layout>
              <Billing />
            </Layout>
          </BusinessProvider>
        </ProtectedRoute>
      } />
      <Route path="/bills" element={
        <ProtectedRoute>
          <BusinessProvider>
            <Layout>
              <Bills />
            </Layout>
          </BusinessProvider>
        </ProtectedRoute>
      } />
      <Route path="/cashflow" element={
        <ProtectedRoute>
          <BusinessProvider>
            <Layout>
              <Cashflow />
            </Layout>
          </BusinessProvider>
        </ProtectedRoute>
      } />
      <Route path="/reports" element={
        <ProtectedRoute>
          <BusinessProvider>
            <Layout>
              <Reports />
            </Layout>
          </BusinessProvider>
        </ProtectedRoute>
      } />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App