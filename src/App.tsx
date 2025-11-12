
import { Routes, Route } from 'react-router-dom'
import { Box } from '@mui/material'
import { AuthProvider } from './hooks/useAuth'
import { AdminAuthProvider } from './hooks/useAdminAuth'
import { NotificationProvider } from './contexts/NotificationContext'
import Layout from './components/Layout/Layout'
import AdminLayout from './components/admin/AdminLayout'
import ErrorBoundary from './components/common/ErrorBoundary'

import Login from './pages/Login'
import Register from './pages/Register'
import EmailVerification from './components/auth/EmailVerification'
import LandingPage from './pages/LandingPage'
import About from './pages/About'
import Contact from './pages/Contact'
import IndividualInvestor from './pages/IndividualInvestor'
import InstitutionalInvestor from './pages/InstitutionalInvestor'
import FinancialAdvisor from './pages/FinancialAdvisor'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfUse from './pages/TermsOfUse'
import Marketplace from './pages/Marketplace'
import Portfolio from './pages/Portfolio'
import Wallet from './pages/Wallet'
import Account from './pages/Account'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AdminUsers from './pages/AdminUsers'
import AdminProducts from './pages/AdminProducts'
import AdminKYC from './pages/AdminKYC'
import AdminOrders from './pages/AdminOrders'
import AdminWithdrawals from './pages/AdminWithdrawals'
import AdminWallets from './pages/AdminWallets'
import AdminReports from './pages/AdminReports'
import NotFound from './pages/NotFound'

function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <NotificationProvider>
          <Box sx={{ width: '100%', minHeight: '100vh' }}>
            <Routes>
              {/* Public routes - Landing page and related pages */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/individual-investor" element={<IndividualInvestor />} />
              <Route path="/institutional-investor" element={<InstitutionalInvestor />} />
              <Route path="/financial-advisor" element={<FinancialAdvisor />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-use" element={<TermsOfUse />} />
              
              {/* Authentication routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<EmailVerification />} />
              
              {/* Admin routes - separate from user routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="kyc" element={<AdminKYC />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="withdrawals" element={<AdminWithdrawals />} />
                <Route path="wallets" element={<AdminWallets />} />
                <Route path="reports" element={<AdminReports />} />
                {/* Add more admin routes here as needed */}
              </Route>
              
              {/* Protected user routes with layout */}
              <Route path="/app" element={<Layout />}>
                <Route index element={<Marketplace />} />
                <Route path="marketplace" element={<Marketplace />} />
                <Route path="portfolio" element={<ErrorBoundary><Portfolio /></ErrorBoundary>} />
                <Route path="wallet" element={<Wallet />} />
                <Route path="account" element={<Account />} />
              </Route>
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Box>
        </NotificationProvider>
      </AdminAuthProvider>
    </AuthProvider>
  )
}

export default App