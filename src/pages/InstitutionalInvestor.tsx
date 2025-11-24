import React from 'react'
import { Box, Container, Typography, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import NavigationBar from '../components/Layout/NavigationBar'
import { Footer } from '../components/common'

/**
 * Institutional Investor page component
 * Provides information and value propositions for institutional investors
 */
const InstitutionalInvestor: React.FC = () => {
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
          Institutional Investors
        </Typography>
        
        <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
          Sophisticated Solutions for Organizations
        </Typography>
        
        <Typography variant="body1" paragraph>
          As an institution investing on behalf of an organization, you need sophisticated tools 
          and access to explore ways to buy and sell REITs, BDCs and private real estate investments. 
          CAPITAL CORE provides the institutional-grade platform you require.
        </Typography>
        
        <Typography variant="body1" paragraph>
          Our platform is designed to meet the unique needs of institutional investors:
        </Typography>
        
        <Box component="ul" sx={{ mb: 3 }}>
          <li>Institutional-scale transaction capabilities</li>
          <li>Advanced portfolio management tools</li>
          <li>Comprehensive reporting and analytics</li>
          <li>Dedicated institutional support team</li>
          <li>Regulatory compliance and audit trails</li>
        </Box>
        
        <Typography variant="body1" paragraph>
          Whether you're managing pension funds, endowments, or other institutional assets, 
          CAPITAL CORE provides the security, scale, and sophistication you need to effectively 
          manage alternative investment liquidity.
        </Typography>
        
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Button 
            variant="contained" 
            size="large" 
            onClick={handleRegisterClick}
          >
            Explore Institutional Solutions
          </Button>
        </Box>
      </Container>
      
      {/* Footer Component */}
      <Footer />
    </Box>
  )
}

export default InstitutionalInvestor