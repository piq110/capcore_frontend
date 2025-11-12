import React from 'react'
import { Box, Card, CardContent, Typography, Grid, Container } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { ScreenReaderOnly } from '../common'

interface UserTypeCard {
  type: 'individual' | 'institution' | 'advisor'
  title: string
  description: string
}

interface UserTypeCardsProps {
  onCardClick?: (cardType: string) => void
}

const userTypeData: UserTypeCard[] = [
  {
    type: 'individual',
    title: 'Individual',
    description: "I'm an individual I want the peace of mind that comes with a path to liquidity. I'd like to connect with buyers and sellers of REITs, BDCs and private Real Estate investments."
  },
  {
    type: 'institution',
    title: 'Institution',
    description: "I'm an institution I invest on behalf of an organization and want to explore ways to buy and sell REITs, BDCs and private real estate investments."
  },
  {
    type: 'advisor',
    title: 'Advisor',
    description: "I'm an advisor I want to give my clients more options for liquidity. I need an easy and secure way for them to sell their alternative investments."
  }
]

/**
 * UserTypeCards component displays three cards for different user types
 * Each card contains descriptive text and navigates to the About page when clicked
 */
const UserTypeCards: React.FC<UserTypeCardsProps> = ({ onCardClick }) => {
  const navigate = useNavigate()

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
      sx={{ py: { xs: 3, sm: 4, md: 6 } }}
      component="section"
      aria-labelledby="user-types-heading"
    >
      <Box sx={{ textAlign: 'center', mb: { xs: 3, sm: 4 } }}>
        <Typography 
          variant="h4" 
          component="h2" 
          id="user-types-heading"
          gutterBottom
          sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
        >
          Choose Your Path
        </Typography>
        <Typography 
          variant="h6" 
          color="text.secondary"
          sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
        >
          Select the option that best describes you
        </Typography>
      </Box>
      
      <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} justifyContent="center">
        {userTypeData.map((userType) => (
          <Grid item xs={12} sm={6} md={4} key={userType.type}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: { xs: 'none', sm: 'translateY(-4px)' },
                  boxShadow: (theme) => theme.shadows[8],
                  borderColor: 'primary.main'
                },
                '&:focus-visible': {
                  outline: '2px solid',
                  outlineColor: 'primary.main',
                  outlineOffset: '2px'
                },
                border: '2px solid transparent',
                borderRadius: 2,
                minHeight: { xs: 'auto', sm: '280px' }
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
              aria-label={`Learn more about ${userType.title} options`}
            >
              <CardContent sx={{ 
                p: { xs: 2, sm: 3 }, 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column' 
              }}>
                <Typography 
                  variant="h5" 
                  component="h3" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 'bold',
                    color: 'primary.main',
                    textAlign: 'center',
                    mb: { xs: 1.5, sm: 2 },
                    fontSize: { xs: '1.25rem', sm: '1.5rem' }
                  }}
                >
                  {userType.title}
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    flexGrow: 1,
                    lineHeight: 1.6,
                    textAlign: 'left',
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}
                >
                  {userType.description}
                </Typography>
                <ScreenReaderOnly>
                  Press Enter or Space to learn more about {userType.title} options
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