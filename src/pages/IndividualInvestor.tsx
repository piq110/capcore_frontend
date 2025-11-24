import React from 'react'
import { Box, Container, Typography, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import NavigationBar from '../components/Layout/NavigationBar'
import { Footer } from '../components/common'

/**
 * Individual Investor page component
 * Provides information and value propositions for individual investors
 */
const IndividualInvestor: React.FC = () => {
  const navigate = useNavigate()

  const handleRegisterClick = () => {
    navigate('/register')
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation Bar */}
      <NavigationBar />
      
      <Container maxWidth="lg" sx={{ flexGrow: 1, py: 4 }}>
        <Typography variant="h2" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
          Individual Investors
        </Typography>
        
        <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
          Peace of Mind Through Liquidity
        </Typography>
        
        <Typography variant="body1" paragraph>
          As an individual investor, you understand the value of alternative investments like REITs, 
          BDCs, and private real estate. However, you also want the peace of mind that comes with 
          knowing you have a path to liquidity when life circumstances change.
        </Typography>
        
        <Typography variant="body1" paragraph>
          CAPITAL CORE provides you with a secure, regulated marketplace where you can connect 
          with qualified buyers and sellers of alternative investments. Our platform offers:
        </Typography>
        
        <Box component="ul" sx={{ mb: 3 }}>
          <li>Access to a network of qualified investors</li>
          <li>Transparent pricing and market information</li>
          <li>Secure transaction processing</li>
          <li>Professional support throughout the process</li>
        </Box>
        
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Button 
            variant="contained" 
            size="large" 
            onClick={handleRegisterClick}
          >
            Start Your Journey
          </Button>
        </Box>
      </Container>
      
      {/* Footer Component */}
      <Footer />
    </Box>
  )
}

export default IndividualInvestor