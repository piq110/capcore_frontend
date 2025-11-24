import React from 'react'
import { Box, Container, Typography } from '@mui/material'
import NavigationBar from '../components/Layout/NavigationBar'
import { Footer } from '../components/common'

/**
 * Privacy Policy page component
 * Displays the complete privacy policy for CAPITAL CORE
 */
const PrivacyPolicy: React.FC = () => {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation Bar */}
      <NavigationBar />
      
      {/* Main content area */}
      <Container maxWidth="lg" sx={{ flexGrow: 1, py: 4 }}>
        <Typography variant="h3" component="h1" sx={{ mb: 4, textAlign: 'center' }}>
          Privacy Policy
        </Typography>
        
        <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
            CAPITAL CORE Securities, LLC is committed to protecting your privacy and maintaining the confidentiality 
            of your personal information. This Privacy Policy describes how we collect, use, and protect your information.
          </Typography>

          <Typography variant="h5" component="h2" sx={{ mb: 2, mt: 4 }}>
            Information We Collect
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
            We collect information you provide directly to us, such as when you create an account, complete transactions, 
            or contact us. This may include your name, address, phone number, email address, Social Security number, 
            financial information, and investment experience.
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
            We also collect information automatically when you use our platform, including your IP address, browser type, 
            operating system, and usage patterns.
          </Typography>

          <Typography variant="h5" component="h2" sx={{ mb: 2, mt: 4 }}>
            How We Use Your Information
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
            We use your information to provide our services, process transactions, verify your identity, comply with 
            legal requirements, and communicate with you about your account and our services.
          </Typography>

          <Typography variant="h5" component="h2" sx={{ mb: 2, mt: 4 }}>
            Information Sharing
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
            We do not sell, rent, or trade your personal information to third parties for marketing purposes. We may 
            share your information with service providers who assist us in operating our platform, with regulatory 
            authorities as required by law, and in connection with business transfers.
          </Typography>

          <Typography variant="h5" component="h2" sx={{ mb: 2, mt: 4 }}>
            Security
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
            We implement appropriate technical and organizational measures to protect your personal information against 
            unauthorized access, alteration, disclosure, or destruction.
          </Typography>

          <Typography variant="h5" component="h2" sx={{ mb: 2, mt: 4 }}>
            Your Rights
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
            You have the right to access, update, or delete your personal information. You may also opt out of certain 
            communications from us.
          </Typography>

          <Typography variant="h5" component="h2" sx={{ mb: 2, mt: 4 }}>
            Contact Us
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
            If you have questions about this Privacy Policy, please contact us at{' '}
            <Typography component="span" sx={{ fontWeight: 'bold' }}>
              support@capitalcore.app
            </Typography>
            .
          </Typography>

          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7, fontStyle: 'italic' }}>
            This Privacy Policy may be updated from time to time. We will notify you of any material changes.
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
            Last updated: {new Date().toLocaleDateString()}
          </Typography>
        </Box>
      </Container>
      
      {/* Footer Component */}
      <Footer />
    </Box>
  )
}

export default PrivacyPolicy