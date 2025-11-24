import React from 'react'
import { Box, Card, CardContent, Typography, Grid, Container, useTheme } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { ScreenReaderOnly } from '../common'
import PersonIcon from '@mui/icons-material/Person'
import BusinessIcon from '@mui/icons-material/Business'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'

interface UserTypeCard {
  type: 'individual' | 'institution' | 'advisor'
  title: string
  icon: React.ReactNode
  subtitle: string
}

interface UserTypeCardsProps {
  onCardClick?: (cardType: string) => void
}

const userTypeData: UserTypeCard[] = [
  {
    type: 'individual',
    title: 'Individual Investor',
    subtitle: 'Personal Portfolio',
    icon: <PersonIcon sx={{ fontSize: { xs: 48, sm: 64 } }} />
  },
  {
    type: 'institution',
    title: 'Institution',
    subtitle: 'Organizational Investment',
    icon: <BusinessIcon sx={{ fontSize: { xs: 48, sm: 64 } }} />
  },
  {
    type: 'advisor',
    title: 'Financial Advisor',
    subtitle: 'Client Management',
    icon: <TrendingUpIcon sx={{ fontSize: { xs: 48, sm: 64 } }} />
  }
]

/**
 * UserTypeCards component displays three icon-based cards for different user types
 * Each card contains an icon, title, and subtitle, optimized for light and dark themes
 */
const UserTypeCards: React.FC<UserTypeCardsProps> = ({ onCardClick }) => {
  const navigate = useNavigate()
  const theme = useTheme()

  const handleCardClick = (cardType: string) => {
    if (onCardClick) {
      onCardClick(cardType)
    }
    // Navigate to About page as specified in requirements 2.5 and 4.1
    navigate('/about')
  }

  return (
    <Container 
      maxWidth="lg" 
      sx={{ py: { xs: 4, sm: 6, md: 8 } }}
      component="section"
      aria-labelledby="user-types-heading"
    >
      <Box sx={{ textAlign: 'center', mb: { xs: 4, sm: 6 } }}>
        <Typography 
          variant="h4" 
          component="h2" 
          id="user-types-heading"
          gutterBottom
          sx={{ 
            fontSize: { xs: '1.75rem', sm: '2.25rem' },
            fontWeight: 600
          }}
        >
          Choose Your Investor Type
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ 
            fontSize: { xs: '1rem', sm: '1.125rem' },
            maxWidth: '600px',
            mx: 'auto'
          }}
        >
          Select the category that best describes you
        </Typography>
      </Box>
      
      <Grid container spacing={{ xs: 3, sm: 4 }} justifyContent="center">
        {userTypeData.map((userType) => (
          <Grid item xs={12} sm={6} md={4} key={userType.type}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                background: theme.palette.mode === 'dark' 
                  ? 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(25, 118, 210, 0.02) 100%)'
                  : 'linear-gradient(135deg, rgba(25, 118, 210, 0.03) 0%, rgba(255, 255, 255, 1) 100%)',
                border: '1px solid',
                borderColor: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.1)' 
                  : 'rgba(0, 0, 0, 0.08)',
                '&:hover': {
                  transform: { xs: 'scale(1.02)', sm: 'translateY(-8px) scale(1.02)' },
                  boxShadow: theme.palette.mode === 'dark'
                    ? '0 12px 40px rgba(25, 118, 210, 0.3)'
                    : '0 12px 40px rgba(25, 118, 210, 0.2)',
                  borderColor: 'primary.main',
                  background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, rgba(25, 118, 210, 0.15) 0%, rgba(25, 118, 210, 0.05) 100%)'
                    : 'linear-gradient(135deg, rgba(25, 118, 210, 0.08) 0%, rgba(255, 255, 255, 1) 100%)',
                  '& .icon-wrapper': {
                    transform: 'scale(1.1)',
                    color: 'primary.main'
                  }
                },
                '&:focus-visible': {
                  outline: '3px solid',
                  outlineColor: 'primary.main',
                  outlineOffset: '4px'
                },
                '&:active': {
                  transform: 'scale(0.98)'
                },
                borderRadius: 3,
                minHeight: { xs: '200px', sm: '240px' }
              }}
              onClick={() => handleCardClick(userType.type)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleCardClick(userType.type)
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`Select ${userType.title} - ${userType.subtitle}`}
            >
              <CardContent sx={{ 
                p: { xs: 3, sm: 4 }, 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center'
              }}>
                <Box
                  className="icon-wrapper"
                  sx={{
                    mb: 2,
                    color: theme.palette.mode === 'dark' 
                      ? 'primary.light' 
                      : 'primary.main',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {userType.icon}
                </Box>
                
                <Typography 
                  variant="h5" 
                  component="h3" 
                  sx={{ 
                    fontWeight: 700,
                    color: 'text.primary',
                    mb: 0.5,
                    fontSize: { xs: '1.25rem', sm: '1.5rem' }
                  }}
                >
                  {userType.title}
                </Typography>
                
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.secondary',
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    fontWeight: 500
                  }}
                >
                  {userType.subtitle}
                </Typography>
                
                <ScreenReaderOnly>
                  Press Enter or Space to select {userType.title} - {userType.subtitle}
                </ScreenReaderOnly>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}

export default UserTypeCards