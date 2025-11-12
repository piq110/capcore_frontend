import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  IconButton,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
} from '@mui/icons-material'
import capitalCoreBlack from '../../assets/capital_core_black.svg'
import capitalCoreWhite from '../../assets/capital_core_white.svg'
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext'
import CustomerDropdown from './CustomerDropdown'

export interface NavigationBarProps {
  currentPage?: string
  onNavigate?: (path: string) => void
  isAuthenticated?: boolean
}

interface NavigationItem {
  label: string
  path: string
}

const navigationItems: NavigationItem[] = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
]

const NavigationBar: React.FC<NavigationBarProps> = ({
  currentPage,
  onNavigate,
  isAuthenticated = false,
}) => {
  const theme = useTheme()
  const { mode, toggleTheme } = useCustomTheme()
  const navigate = useNavigate()
  const location = useLocation()
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [customerDropdownAnchor, setCustomerDropdownAnchor] = useState<null | HTMLElement>(null)

  const handleNavigation = (path: string) => {
    if (onNavigate) {
      onNavigate(path)
    } else {
      navigate(path)
    }
    setMobileMenuOpen(false)
  }

  const handleCustomerDropdownOpen = (event: React.MouseEvent<HTMLElement>) => {
    setCustomerDropdownAnchor(event.currentTarget)
  }

  const handleCustomerDropdownClose = () => {
    setCustomerDropdownAnchor(null)
  }

  const handleCustomerSelect = (userType: 'individual' | 'institutional' | 'advisor') => {
    const paths = {
      individual: '/individual-investor',
      institutional: '/institutional-investor',
      advisor: '/financial-advisor',
    }
    console.log('Navigating to:', paths[userType]) // Debug log
    handleNavigation(paths[userType])
    handleCustomerDropdownClose()
  }

  const handleAuthNavigation = (type: 'signin' | 'signup') => {
    const path = type === 'signin' ? '/login' : '/register'
    handleNavigation(path)
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const isCurrentPage = (path: string) => {
    return currentPage === path || location.pathname === path
  }

  const renderDesktopNavigation = () => (
    <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
      {/* Navigation Items */}
      {navigationItems.map((item) => (
        <Button
          key={item.path}
          color="inherit"
          onClick={() => handleNavigation(item.path)}
          aria-current={isCurrentPage(item.path) ? 'page' : undefined}
          sx={{
            fontWeight: isCurrentPage(item.path) ? 600 : 400,
            textDecoration: isCurrentPage(item.path) ? 'underline' : 'none',
            minHeight: 44,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
            '&:focus-visible': {
              outline: '2px solid',
              outlineColor: 'secondary.main',
              outlineOffset: '2px'
            }
          }}
        >
          {item.label}
        </Button>
      ))}

      {/* Customer Dropdown */}
      <Button
        color="inherit"
        endIcon={<ExpandMoreIcon />}
        onClick={handleCustomerDropdownOpen}
        aria-expanded={Boolean(customerDropdownAnchor)}
        aria-haspopup="menu"
        aria-controls="customer-dropdown-menu"
        sx={{
          minHeight: 44,
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
          '&:focus-visible': {
            outline: '2px solid',
            outlineColor: 'secondary.main',
            outlineOffset: '2px'
          }
        }}
      >
        Customer
      </Button>

      <CustomerDropdown
        anchorEl={customerDropdownAnchor}
        open={Boolean(customerDropdownAnchor)}
        onClose={handleCustomerDropdownClose}
        onSelect={handleCustomerSelect}
      />
    </Box>
  )

  const renderMobileNavigation = () => (
    <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
      <IconButton
        color="inherit"
        aria-label="open navigation menu"
        aria-expanded={mobileMenuOpen}
        aria-controls="mobile-navigation-menu"
        onClick={toggleMobileMenu}
        sx={{
          minWidth: 44,
          minHeight: 44,
          '&:focus-visible': {
            outline: '2px solid',
            outlineColor: 'secondary.main',
            outlineOffset: '2px'
          }
        }}
      >
        <MenuIcon />
      </IconButton>

      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={toggleMobileMenu}
        id="mobile-navigation-menu"
        aria-labelledby="mobile-menu-title"
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100vw', sm: 320 },
            maxWidth: 400,
            boxSizing: 'border-box',
          },
        }}
      >
        <Box sx={{ 
          p: 3, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }} id="mobile-menu-title">
            Menu
          </Typography>
          <IconButton 
            onClick={toggleMobileMenu}
            sx={{ 
              minWidth: 44,
              minHeight: 44,
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
            aria-label="close navigation menu"
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <List sx={{ pt: 0 }}>
          {navigationItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={isCurrentPage(item.path)}
                sx={{ 
                  minHeight: 48,
                  px: 3,
                  py: 1.5,
                  '&:hover': {
                    backgroundColor: 'primary.light',
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  },
                }}
              >
                <ListItemText 
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '1rem',
                    fontWeight: 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}

          {/* Customer options in mobile menu */}
          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography 
              variant="overline" 
              sx={{ 
                px: 3, 
                color: 'text.secondary',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.1em'
              }}
            >
              Customer Types
            </Typography>
          </Box>
          <ListItem disablePadding>
            <ListItemButton 
              onClick={() => handleNavigation('/individual-investor')}
              sx={{ 
                minHeight: 48,
                px: 3,
                py: 1.5,
                '&:hover': {
                  backgroundColor: 'primary.light',
                },
              }}
            >
              <ListItemText 
                primary="Individual Investor"
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                }}
              />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton 
              onClick={() => handleNavigation('/institutional-investor')}
              sx={{ 
                minHeight: 48,
                px: 3,
                py: 1.5,
                '&:hover': {
                  backgroundColor: 'primary.light',
                },
              }}
            >
              <ListItemText 
                primary="Institutional Investor"
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                }}
              />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton 
              onClick={() => handleNavigation('/financial-advisor')}
              sx={{ 
                minHeight: 48,
                px: 3,
                py: 1.5,
                '&:hover': {
                  backgroundColor: 'primary.light',
                },
              }}
            >
              <ListItemText 
                primary="Financial Advisor"
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                }}
              />
            </ListItemButton>
          </ListItem>

          {/* Theme Toggle in mobile menu */}
          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography 
              variant="overline" 
              sx={{ 
                px: 3, 
                color: 'text.secondary',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.1em'
              }}
            >
              Settings
            </Typography>
          </Box>
          <ListItem disablePadding>
            <ListItemButton 
              onClick={toggleTheme}
              sx={{ 
                minHeight: 48,
                px: 3,
                py: 1.5,
                '&:hover': {
                  backgroundColor: 'primary.light',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
              </Box>
              <ListItemText 
                primary={`Switch to ${mode === 'light' ? 'Dark' : 'Light'} Mode`}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                }}
              />
            </ListItemButton>
          </ListItem>

          {/* Authentication buttons in mobile menu */}
          {!isAuthenticated && (
            <>
              <Box sx={{ mt: 3, mb: 1 }}>
                <Typography 
                  variant="overline" 
                  sx={{ 
                    px: 3, 
                    color: 'text.secondary',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    letterSpacing: '0.1em'
                  }}
                >
                  Account
                </Typography>
              </Box>
              <ListItem disablePadding>
                <ListItemButton 
                  onClick={() => handleAuthNavigation('signin')}
                  sx={{ 
                    minHeight: 48,
                    px: 3,
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: 'primary.light',
                    },
                  }}
                >
                  <ListItemText 
                    primary="Sign In"
                    primaryTypographyProps={{
                      fontSize: '1rem',
                      fontWeight: 500,
                    }}
                  />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton 
                  onClick={() => handleAuthNavigation('signup')}
                  sx={{ 
                    minHeight: 48,
                    px: 3,
                    py: 1.5,
                    backgroundColor: 'secondary.main',
                    color: 'secondary.contrastText',
                    '&:hover': {
                      backgroundColor: 'secondary.dark',
                    },
                  }}
                >
                  <ListItemText 
                    primary="Sign Up"
                    primaryTypographyProps={{
                      fontSize: '1rem',
                      fontWeight: 600,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            </>
          )}
        </List>
      </Drawer>
    </Box>
  )

  const renderAuthButtons = () => {
    if (isAuthenticated) return null

    return (
      <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, ml: 2 }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={() => handleAuthNavigation('signin')}
          sx={{
            minHeight: 44,
            borderColor: 'rgba(255, 255, 255, 0.5)',
            '&:hover': {
              borderColor: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
            '&:focus-visible': {
              outline: '2px solid',
              outlineColor: 'secondary.main',
              outlineOffset: '2px'
            }
          }}
        >
          Sign In
        </Button>
        <Button
          variant="contained"
          onClick={() => handleAuthNavigation('signup')}
          sx={{
            minHeight: 44,
            backgroundColor: theme.palette.secondary.main,
            color: theme.palette.secondary.contrastText,
            '&:hover': {
              backgroundColor: theme.palette.secondary.dark,
            },
            '&:focus-visible': {
              outline: '2px solid',
              outlineColor: 'white',
              outlineOffset: '2px'
            }
          }}
        >
          Sign Up
        </Button>
      </Box>
    )
  }

  return (
    <AppBar position="static" sx={{ backgroundColor: theme.palette.primary.main }}>
      <Toolbar>
        {/* Logo */}
        <Box
          component="img"
          src={mode === 'light' ? capitalCoreBlack : capitalCoreWhite}
          alt="Capital Core - Go to homepage"
          onClick={() => handleNavigation('/')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleNavigation('/')
            }
          }}
          tabIndex={0}
          role="button"
          sx={{
            height: 32,
            width: 'auto',
            cursor: 'pointer',
            mr: 4,
            '&:focus-visible': {
              outline: '2px solid',
              outlineColor: 'secondary.main',
              outlineOffset: '2px',
              borderRadius: 1
            }
          }}
        />

        {/* Desktop Navigation */}
        {renderDesktopNavigation()}

        {/* Spacer */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Theme Toggle */}
        <IconButton
          color="inherit"
          onClick={toggleTheme}
          aria-label={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
          sx={{
            mr: 1,
            minWidth: 44,
            minHeight: 44,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
            '&:focus-visible': {
              outline: '2px solid',
              outlineColor: 'secondary.main',
              outlineOffset: '2px'
            }
          }}
        >
          {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
        </IconButton>

        {/* Authentication Buttons */}
        {renderAuthButtons()}

        {/* Mobile Navigation */}
        {renderMobileNavigation()}
      </Toolbar>
    </AppBar>
  )
}

export default NavigationBar