import React from 'react'
import { Box, Container, Typography, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import NavigationBar from '../components/Layout/NavigationBar'
import { Footer } from '../components/common'

/**
 * Financial Advisor page component
 * Provides information and value propositions for financial advisors
 */
const FinancialAdvisor: React.FC = () => {
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
          Financial Advisors
        </Typography>
        
        <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
          Enhanced Client Liquidity Solutions
        </Typography>
        
        <Typography variant="body1" paragraph>
          As a financial advisor, you want to give your clients more options for liquidity. 
          You need an easy and secure way for them to sell their alternative investments when 
          circumstances require it.
        </Typography>
        
        <Typography variant="body1" paragraph>
          CAPITAL CORE empowers financial advisors with professional tools and services:
        </Typography>
        
        <Box component="ul" sx={{ mb: 3 }}>
          <li>Client portfolio liquidity management</li>
          <li>Professional advisor dashboard and tools</li>
          <li>White-label solutions for your practice</li>
          <li>Dedicated advisor support and training</li>
          <li>Compliance and regulatory support</li>
        </Box>
        
        <Typography variant="body1" paragraph>
          Help your clients navigate the alternative investment landscape with confidence, 
          knowing they have access to liquidity solutions when they need them most. 
          CAPITAL CORE provides the professional presentation and security suitable for 
          your advisory practice.
        </Typography>
        
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Button 
            variant="contained" 
            size="large" 
            onClick={handleRegisterClick}
          >
            Partner With Us
          </Button>
        </Box>
      </Container>
      
      {/* Footer Component */}
      <Footer />
    </Box>
  )
}

export default FinancialAdvisor