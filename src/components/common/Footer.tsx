import React from 'react'
import {
  Box,
  Container,
  Typography,
  Divider,
  useTheme,
  Button
} from '@mui/material'
import { useNavigate } from 'react-router-dom'

/**
 * Footer component containing company information, legal links, and contact information
 */
const Footer: React.FC = () => {
  const theme = useTheme()
  const navigate = useNavigate()



  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: theme.palette.grey[100],
        borderTop: `1px solid ${theme.palette.divider}`,
        mt: 'auto',
        py: { xs: 3, sm: 4 }
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        {/* Company Information */}
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography variant="h6" component="div" sx={{ mb: 1 }}>
            CAPITAL CORE
          </Typography>
          <Typography variant="body2" color="text.secondary">
            CAPITAL CORE Securities, LLC Member FINRA/SIPC
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Contact: support@capitalcore.app
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Marketplace Disclaimer */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" component="h3" sx={{ mb: 2, textAlign: 'center' }}>
            Important Marketplace Disclaimer
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              lineHeight: 1.6,
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              textAlign: 'justify',
              maxWidth: '900px',
              mx: 'auto'
            }}
          >
            CAPITAL CORE is a marketplace for investor transactions and does not buy or sell securities or own real estate, including any buildings shown herein. The information provided does not represent an offer to buy or sell any security nor does it represent a recommendation to buy, sell or hold any security. Investing in any security discussed herein is not suitable for all investors as they are speculative and involve a high degree of risk. Investors should obtain additional information about potential investments and must be prepared to withstand a total loss of their investment. Conflicts of interest may exist between investors and CAPITAL CORE. CAPITAL CORE cannot and does not guarantee that a market will develop for some securities, and as a result, they may remain illiquid.
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Legal Links */}
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Button
            variant="text"
            onClick={() => navigate('/terms-of-use')}
            sx={{ 
              mr: 2, 
              mb: 1,
              textTransform: 'none',
              fontSize: '0.875rem',
              minHeight: 44,
              '&:focus-visible': {
                outline: '2px solid',
                outlineColor: 'primary.main',
                outlineOffset: '2px'
              }
            }}
          >
            Terms of Use
          </Button>
          <Button
            variant="text"
            onClick={() => navigate('/privacy-policy')}
            sx={{ 
              mr: 2, 
              mb: 1,
              textTransform: 'none',
              fontSize: '0.875rem',
              minHeight: 44,
              '&:focus-visible': {
                outline: '2px solid',
                outlineColor: 'primary.main',
                outlineOffset: '2px'
              }
            }}
          >
            Privacy Policy
          </Button>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            For questions, contact us at support@capitalcore.app
          </Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Copyright */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} CAPITAL CORE Securities, LLC. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}

export default Footer