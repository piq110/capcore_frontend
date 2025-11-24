import React, { useState } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import {
  Box,
  AppBar,
  Toolbar,
  useTheme as useMuiTheme,
  CircularProgress,
} from '@mui/material'
import { useAuth } from '../../hooks/useAuth'
import TopBar from './TopBar'
import InfoBars from '../common/InfoBars'
import MFASetup from '../auth/MFASetup'

const Layout: React.FC = () => {
  const theme = useMuiTheme()
  const { isAuthenticated, isLoading } = useAuth()
  const [mfaSetupOpen, setMfaSetupOpen] = useState(false)

  const handleEmailVerificationClick = () => {
    // Navigate to email verification page or show resend dialog
    window.location.href = '/verify-email'
  }

  const handleKYCClick = () => {
    // Navigate to KYC page or show KYC dialog
    window.location.href = '/account?tab=kyc'
  }

  const handleMFASetupComplete = () => {
    setMfaSetupOpen(false)
  }

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: '100%',
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <TopBar />
        </Toolbar>
      </AppBar>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: '100%',
          mt: '64px', // AppBar height
          minHeight: 'calc(100vh - 64px)',
          backgroundColor: theme.palette.background.default,
        }}
      >
        {/* Info bars for notifications */}
        <InfoBars
          onEmailVerificationClick={handleEmailVerificationClick}
          onKYCClick={handleKYCClick}
        />
        
        <Outlet />
      </Box>

      {/* MFA Setup Dialog */}
      <MFASetup
        open={mfaSetupOpen}
        onClose={() => setMfaSetupOpen(false)}
        onComplete={handleMFASetupComplete}
      />
    </Box>
  )
}

export default Layout