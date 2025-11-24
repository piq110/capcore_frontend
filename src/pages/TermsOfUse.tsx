import React from 'react'
import { Box, Container, Typography, Divider } from '@mui/material'
import NavigationBar from '../components/Layout/NavigationBar'
import { Footer } from '../components/common'

/**
 * Terms of Use page containing legal disclaimers and terms for CAPITAL CORE platform
 */
const TermsOfUse: React.FC = () => {
  const termsContent = `
CAPITAL CORE Securities, LLC ("CAPITAL CORE") is a registered broker-dealer and member of FINRA and SIPC. 
All securities transactions are conducted through CAPITAL CORE. Investment advisory services are provided by 
CAPITAL CORE Investment Advisors, LLC, an SEC-registered investment adviser.

This website and the information contained herein are for informational purposes only and do not constitute 
an offer to sell or a solicitation of an offer to buy any securities. Any such offer or solicitation will 
be made only through definitive offering documents. Past performance is not indicative of future results. 
All investments involve risk, including the potential loss of principal.

The securities offered through this platform may be illiquid and there is no guarantee that a market will 
exist for the resale of such securities. Investment in alternative investments is speculative and involves 
substantial risk of loss. These investments are suitable only for sophisticated investors who can afford 
to lose their entire investment.

Before making any investment decision, you should carefully consider the risks and uncertainties described 
in the relevant offering documents. You should not invest unless you are prepared to lose your entire 
investment. Investment in securities involves risk, and there can be no assurance that any investment 
strategy will be successful.

This platform is intended for use by accredited investors only, as defined by applicable securities laws. 
By using this platform, you represent and warrant that you meet the applicable accredited investor standards.

All information provided is believed to be accurate but is not guaranteed. CAPITAL CORE does not provide 
tax, legal, or accounting advice. You should consult with your own tax, legal, and accounting advisors 
before making any investment decisions.
  `.trim()

  return (
    <Box sx={{ 
      width: '100%',
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      margin: 0,
      padding: 0
    }}>
      {/* Skip Navigation Link */}
      <Box
        component="a"
        href="#main-content"
        sx={{
          position: 'absolute',
          left: '-9999px',
          zIndex: 999,
          padding: '8px 16px',
          backgroundColor: 'primary.main',
          color: 'primary.contrastText',
          textDecoration: 'none',
          borderRadius: '0 0 4px 4px',
          '&:focus': {
            left: '16px',
            top: '16px'
          }
        }}
      >
        Skip to main content
      </Box>
      
      {/* Navigation Bar */}
      <NavigationBar />
      
      {/* Main content area */}
      <Box
        sx={{ 
          flexGrow: 1, 
          width: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
        id="main-content"
        component="main"
        role="main"
      >
        <Container maxWidth="md" sx={{ py: { xs: 4, sm: 6, md: 8 } }}>
          {/* Page Header */}
          <Box sx={{ textAlign: 'center', mb: { xs: 4, sm: 6 } }}>
            <Typography 
              variant="h1" 
              component="h1" 
              gutterBottom
              sx={{ 
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                fontWeight: 600,
                mb: { xs: 2, sm: 3 }
              }}
            >
              Terms of Use
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary"
              sx={{ 
                fontSize: { xs: '1rem', sm: '1.125rem' },
                maxWidth: '600px',
                mx: 'auto'
              }}
            >
              Important legal information and disclaimers for using the CAPITAL CORE platform
            </Typography>
          </Box>

          <Divider sx={{ mb: 4 }} />

          {/* Company Information */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
              Company Information
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>CAPITAL CORE Securities, LLC</strong>
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Member FINRA/SIPC
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Contact: support@capitalcore.app
            </Typography>
          </Box>

          <Divider sx={{ mb: 4 }} />

          {/* Terms Content */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
              Important Disclaimers and Terms
            </Typography>
            <Typography
              variant="body1"
              sx={{
                lineHeight: 1.7,
                fontSize: { xs: '0.875rem', sm: '1rem' },
                whiteSpace: 'pre-line'
              }}
            >
              {termsContent}
            </Typography>
          </Box>

          <Divider sx={{ mb: 4 }} />

          {/* Additional Sections */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
              Risk Disclosure
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
              Alternative investments are complex financial instruments that carry significant risks. 
              These investments may be subject to restrictions on resale and transfer, may lack transparency, 
              and may not be suitable for all investors.
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
              Investors should carefully review all offering materials and consult with their financial, 
              tax, and legal advisors before making any investment decisions.
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
              Accredited Investor Requirements
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
              This platform is intended for use by accredited investors only. By accessing and using 
              this platform, you represent and warrant that you meet the definition of an accredited 
              investor as defined in Rule 501 of Regulation D under the Securities Act of 1933.
            </Typography>
          </Box>

          <Divider sx={{ mb: 4 }} />

          {/* Last Updated */}
          <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="body2">
              Last updated: {new Date().toLocaleDateString()}
            </Typography>
          </Box>
        </Container>
      </Box>
      
      {/* Footer Component */}
      <Footer />
    </Box>
  )
}

export default TermsOfUse