import React from 'react'
import { Box, Container, Typography } from '@mui/material'
import NavigationBar from '../components/Layout/NavigationBar'
import { Footer } from '../components/common'

/**
 * Contact page component
 * Provides contact information and support details
 */
const Contact: React.FC = () => {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation Bar */}
      <NavigationBar />
      
      <Container maxWidth="lg" sx={{ flexGrow: 1, py: 4 }}>
        <Typography variant="h2" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
          Contact Us
        </Typography>
        
        <Typography variant="body1" paragraph sx={{ textAlign: 'center' }}>
          Get in touch with our team for support and inquiries.
        </Typography>
        
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Email Support
          </Typography>
          <Typography variant="body1" paragraph>
            support@capitalcore.app
          </Typography>
          
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Company Information
          </Typography>
          <Typography variant="body1">
            CAPITAL CORE Securities, LLC Member FINRA/SIPC
          </Typography>
        </Box>
      </Container>
      
      {/* Footer Component */}
      <Footer />
    </Box>
  )
}

export default Contact