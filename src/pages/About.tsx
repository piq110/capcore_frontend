import React from 'react'
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent,
  useTheme,
  useMediaQuery
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { Footer } from '../components/common'
import {
  Person as PersonIcon,
  Business as BusinessIcon,
  TrendingUp as AdvisorIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Support as SupportIcon
} from '@mui/icons-material'
import NavigationBar from '../components/Layout/NavigationBar'

/**
 * About page component that provides detailed information about the platform
 * and different user types with comprehensive explanations and pathways to registration
 */
const About: React.FC = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const handleRegisterClick = () => {
    navigate('/register')
  }

  const handleContactClick = () => {
    navigate('/contact')
  }

  const userTypeData = [
    {
      type: 'individual',
      title: 'Individual Investors',
      icon: <PersonIcon sx={{ fontSize: 48, color: theme.palette.primary.main }} />,
      description: "I'm an individual I want the peace of mind that comes with a path to liquidity. I'd like to connect with buyers and sellers of REITs, BDCs and private Real Estate investments.",
      benefits: [
        'Access to secondary markets for alternative investments',
        'Liquidity solutions when you need them most',
        'Transparent pricing and secure transactions',
        'Direct connection with qualified buyers and sellers'
      ],
      features: [
        'Portfolio management tools',
        'Real-time market data',
        'Secure transaction processing',
        'Dedicated customer support'
      ]
    },
    {
      type: 'institutional',
      title: 'Institutional Investors',
      icon: <BusinessIcon sx={{ fontSize: 48, color: theme.palette.primary.main }} />,
      description: "I'm an institution I invest on behalf of an organization and want to explore ways to buy and sell REITs, BDCs and private real estate investments.",
      benefits: [
        'Sophisticated tools for large-scale transactions',
        'Institutional-grade security and compliance',
        'Advanced analytics and reporting capabilities',
        'Dedicated relationship management'
      ],
      features: [
        'Bulk transaction processing',
        'Custom reporting and analytics',
        'API integration capabilities',
        'White-label solutions available'
      ]
    },
    {
      type: 'advisor',
      title: 'Financial Advisors',
      icon: <AdvisorIcon sx={{ fontSize: 48, color: theme.palette.primary.main }} />,
      description: "I'm an advisor I want to give my clients more options for liquidity. I need an easy and secure way for them to sell their alternative investments.",
      benefits: [
        'Enhanced client service capabilities',
        'Access to alternative investment liquidity',
        'Streamlined client onboarding process',
        'Comprehensive client reporting tools'
      ],
      features: [
        'Client portfolio management',
        'Multi-client dashboard',
        'Automated compliance reporting',
        'Educational resources and market insights'
      ]
    }
  ]

  const platformFeatures = [
    {
      icon: <SecurityIcon sx={{ fontSize: 40, color: theme.palette.secondary.main }} />,
      title: 'Security First',
      description: 'Bank-level security with multi-factor authentication and encrypted transactions'
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40, color: theme.palette.secondary.main }} />,
      title: 'Fast Execution',
      description: 'Streamlined processes for quick transaction completion and settlement'
    },
    {
      icon: <SupportIcon sx={{ fontSize: 40, color: theme.palette.secondary.main }} />,
      title: '24/7 Support',
      description: 'Dedicated customer support team available around the clock'
    }
  ]

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation Bar */}
      <NavigationBar />
      
      <Container maxWidth="lg" sx={{ flexGrow: 1, py: { xs: 2, md: 4 } }}>
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
          <Typography 
            variant={isMobile ? "h3" : "h2"} 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 600,
              color: theme.palette.primary.main,
              mb: 2
            }}
          >
            About CAPITAL CORE
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ 
              maxWidth: 800, 
              mx: 'auto',
              lineHeight: 1.6
            }}
          >
            Connecting investors with liquidity solutions for alternative investments. 
            Our platform serves individual investors, institutions, and financial advisors 
            with secure, transparent access to secondary markets.
          </Typography>
        </Box>

        {/* User Type Sections */}
        {userTypeData.map((userType, index) => (
          <Box key={userType.type} sx={{ mb: { xs: 4, md: 6 } }}>
            <Card 
              elevation={2}
              sx={{ 
                p: { xs: 2, md: 3 },
                backgroundColor: index % 2 === 0 ? 'background.paper' : 'background.default'
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  {userType.icon}
                  <Typography 
                    variant="h4" 
                    component="h2" 
                    sx={{ 
                      ml: 2, 
                      fontWeight: 600,
                      fontSize: { xs: '1.5rem', md: '2rem' },
                      color: 'primary.main'
                    }}
                  >
                    {userType.title}
                  </Typography>
                </Box>
                
                <Typography 
                  variant="body1" 
                  paragraph 
                  sx={{ 
                    fontSize: '1.1rem',
                    fontStyle: 'italic',
                    color: theme.palette.primary.dark,
                    mb: 3,
                    p: 2,
                    backgroundColor: 'rgba(25, 118, 210, 0.05)',
                    borderRadius: 1,
                    borderLeft: `4px solid ${theme.palette.primary.main}`
                  }}
                >
                  "{userType.description}"
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
                      Key Benefits
                    </Typography>
                    <Box component="ul" sx={{ pl: 2, m: 0 }}>
                      {userType.benefits.map((benefit, idx) => (
                        <Typography 
                          key={idx} 
                          component="li" 
                          variant="body2" 
                          sx={{ mb: 1, lineHeight: 1.6 }}
                        >
                          {benefit}
                        </Typography>
                      ))}
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
                      Platform Features
                    </Typography>
                    <Box component="ul" sx={{ pl: 2, m: 0 }}>
                      {userType.features.map((feature, idx) => (
                        <Typography 
                          key={idx} 
                          component="li" 
                          variant="body2" 
                          sx={{ mb: 1, lineHeight: 1.6 }}
                        >
                          {feature}
                        </Typography>
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        ))}

        {/* Platform Features Section */}
        <Box sx={{ mt: { xs: 4, md: 6 }, mb: { xs: 4, md: 6 } }}>
          <Typography 
            variant="h4" 
            component="h2" 
            gutterBottom 
            sx={{ 
              textAlign: 'center', 
              mb: 4,
              fontWeight: 600
            }}
          >
            Why Choose CAPITAL CORE?
          </Typography>
          
          <Grid container spacing={3}>
            {platformFeatures.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card 
                  elevation={1}
                  sx={{ 
                    height: '100%',
                    textAlign: 'center',
                    p: 2,
                    '&:hover': {
                      elevation: 3,
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease-in-out'
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ mb: 2 }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Contact Information Section */}
        <Box sx={{ mt: { xs: 4, md: 6 }, mb: { xs: 4, md: 6 } }}>
          <Typography 
            variant="h4" 
            component="h2" 
            gutterBottom 
            sx={{ 
              textAlign: 'center', 
              mb: 4,
              fontWeight: 600
            }}
          >
            Get in Touch
          </Typography>
          
          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={12} md={6}>
              <Card elevation={1} sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Support & Inquiries
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Our dedicated support team is here to help with any questions about our platform or services.
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, color: theme.palette.primary.main }}>
                  support@capitalcore.app
                </Typography>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card elevation={1} sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Company Information
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  CAPITAL CORE is a registered securities firm committed to providing secure investment solutions.
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  CAPITAL CORE Securities, LLC<br />
                  Member FINRA/SIPC
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Call to Action Section */}
        <Box 
          sx={{ 
            textAlign: 'center', 
            mt: { xs: 4, md: 6 },
            p: { xs: 3, md: 4 },
            backgroundColor: theme.palette.primary.main,
            borderRadius: 2,
            color: 'white'
          }}
        >
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            Ready to Get Started?
          </Typography>
          <Typography variant="body1" paragraph sx={{ mb: 3, opacity: 0.9 }}>
            Join thousands of investors who trust CAPITAL CORE for their alternative investment liquidity needs.
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            justifyContent: 'center',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center'
          }}>
            <Button 
              variant="contained" 
              size="large" 
              onClick={handleRegisterClick}
              sx={{ 
                backgroundColor: theme.palette.secondary.main,
                color: theme.palette.secondary.contrastText,
                minWidth: { xs: '100%', sm: 'auto' },
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: theme.palette.secondary.dark,
                  transform: 'translateY(-1px)',
                  boxShadow: theme.shadows[8]
                }
              }}
            >
              Create Your Account
            </Button>
            <Button 
              variant="outlined" 
              size="large" 
              onClick={handleContactClick}
              sx={{ 
                borderColor: 'white',
                color: 'white',
                minWidth: { xs: '100%', sm: 'auto' },
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  transform: 'translateY(-1px)',
                }
              }}
            >
              Contact Our Team
            </Button>
          </Box>
          
          <Typography variant="body2" sx={{ mt: 3, opacity: 0.8 }}>
            Already have an account?{' '}
            <Button 
              color="inherit" 
              onClick={() => navigate('/login')}
              sx={{ 
                textDecoration: 'underline',
                fontWeight: 600,
                p: 0,
                minWidth: 'auto',
                '&:hover': {
                  backgroundColor: 'transparent',
                  textDecoration: 'underline'
                }
              }}
            >
              Sign In Here
            </Button>
          </Typography>
        </Box>
      </Container>
      
      {/* Footer Component */}
      <Footer />
    </Box>
  )
}

export default About