import React from 'react'
import { Box, Container, Typography, Chip } from '@mui/material'
import NavigationBar from '../components/Layout/NavigationBar'
import { UserTypeCards, FAQ } from '../components/landing'
import { Footer } from '../components/common'
import heroImage from '../assets/hero.jpg'

/**
 * Landing page component that serves as the main entry point for the CAPITAL CORE platform
 * Provides navigation, user type identification, and essential information
 */
const LandingPage: React.FC = () => {
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
        {/* Hero and User Type Cards Section with Background */}
        <Box 
          component="section"
          aria-labelledby="hero-heading"
          sx={{ 
            width: '100%',
            position: 'relative',
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: (theme) => `linear-gradient(
                to bottom,
                ${theme.palette.mode === 'light' 
                  ? 'rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.6) 40%, rgba(255, 255, 255, 0.7) 70%, rgba(255, 255, 255, 0.95) 100%'
                  : 'rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.6) 40%, rgba(15, 23, 42, 0.7) 70%, rgba(15, 23, 42, 0.95) 100%'
                }
              )`,
              zIndex: 1
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `url(${heroImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              opacity: 0.4,
              zIndex: 0
            }
          }}
        >
          {/* Hero Content */}
          <Box sx={{ 
            py: { xs: 4, sm: 6, md: 8 },
            px: { xs: 2, sm: 3, md: 4 },
            position: 'relative',
            zIndex: 2
          }}>
            <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
              <Box sx={{ mb: 3 }}>
                <Chip
                  label="Secondary Marketplace"
                  color="primary"
                  variant="outlined"
                  sx={{ 
                    mb: 2,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    fontWeight: 600
                  }}
                />
              </Box>
              
              <Typography 
                variant="h1" 
                component="h1" 
                id="hero-heading"
                gutterBottom
                sx={{ 
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                  fontWeight: 600,
                  mb: { xs: 2, sm: 3 }
                }}
              >
                The Premier Marketplace for REITs & BDCs
              </Typography>
              
              <Typography 
                variant="h5" 
                component="p" 
                sx={{ 
                  fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.5rem' },
                  maxWidth: '700px',
                  mx: 'auto',
                  mb: 3,
                  lineHeight: 1.4,
                  color: (theme) => theme.palette.mode === 'light' 
                    ? 'text.secondary' 
                    : 'grey.300'
                }}
              >
                Connect and trade REITs and BDCs. <br />
                Access liquidity for your alternative investments with transparent pricing and secure transactions.
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                justifyContent: 'center',
                flexWrap: 'wrap',
                mt: 4
              }}>
                <Chip
                  label="Real Estate Investment Trusts"
                  color="secondary"
                  sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    fontWeight: 500
                  }}
                />
                <Chip
                  label="Business Development Companies"
                  color="secondary"
                  sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    fontWeight: 500
                  }}
                />
                <Chip
                  label="24/7 Support"
                  color="success"
                  sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    fontWeight: 500
                  }}
                />
              </Box>
            </Container>
          </Box>
          
          {/* User Type Cards Section */}
          <Box sx={{ 
            py: { xs: 3, sm: 4, md: 6 },
            position: 'relative',
            zIndex: 2
          }}>
            <UserTypeCards />
          </Box>
        </Box>
        
        {/* FAQ Section */}
        <Box 
          component="section"
          sx={{ 
            width: '100%',
            backgroundColor: (theme) => theme.palette.mode === 'light' ? 'grey.50' : 'grey.900'
          }}
        >
          <FAQ />
        </Box>
      </Box>
      
      {/* Footer Component */}
      <Footer />
    </Box>
  )
}

export default LandingPage