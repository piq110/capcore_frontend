import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  Chip,
  useTheme as useMuiTheme,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material'
import {
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Store as MarketplaceIcon,
  AccountBalance as PortfolioIcon,
  AccountBalanceWallet as WalletIcon,
  Person as AccountIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material'
import capitalCoreBlack from '../../assets/capital_core_black.svg'
import capitalCoreWhite from '../../assets/capital_core_white.svg'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../contexts/ThemeContext'

interface NavigationItem {
  text: string
  path: string
  icon: React.ReactElement
}

const navigationItems: NavigationItem[] = [
  {
    text: 'Marketplace',
    path: '/app/marketplace',
    icon: <MarketplaceIcon />,
  },
  {
    text: 'Portfolio',
    path: '/app/portfolio',
    icon: <PortfolioIcon />,
  },
  {
    text: 'Wallet',
    path: '/app/wallet',
    icon: <WalletIcon />,
  },
  {
    text: 'Account',
    path: '/app/account',
    icon: <AccountIcon />,
  },
]

const TopBar: React.FC = () => {
  const muiTheme = useMuiTheme()
  const { mode, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null)



  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setMenuAnchorEl(null)
  }

  const handleNavigation = (path: string) => {
    navigate(path)
    handleMenuClose()
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
    handleMenuClose()
  }

  const handleSettings = () => {
    navigate('/app/account')
    handleMenuClose()
  }

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success'
      case 'pending':
        return 'warning'
      case 'rejected':
        return 'error'
      default:
        return 'default'
    }
  }

  const getUserDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`
    } else if (user?.firstName) {
      return user.firstName
    } else if (user?.lastName) {
      return user.lastName
    }
    return 'User'
  }

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    } else if (user?.firstName) {
      return user.firstName.charAt(0).toUpperCase()
    } else if (user?.lastName) {
      return user.lastName.charAt(0).toUpperCase()
    } else if (user?.email) {
      return user.email.charAt(0).toUpperCase()
    }
    return 'U'
  }

  const filteredItems = navigationItems

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
      }}
    >
      {/* Left side - Branding and status */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Brand/Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            component="img"
            src={mode === 'light' ? capitalCoreBlack : capitalCoreWhite}
            alt="Capital Core"
            sx={{
              height: 32,
              width: 'auto',
            }}
          />
        </Box>
        
        {/* Status indicators */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          {user && !user.emailVerified && (
            <Chip
              label="Email Verification Required"
              size="small"
              color="warning"
              variant="outlined"
              sx={{ display: { xs: 'none', md: 'flex' } }}
            />
          )}
          
          {user && user.kycStatus !== 'approved' && (
            <Chip
              label={`KYC: ${user.kycStatus.toUpperCase()}`}
              size="small"
              color={getKycStatusColor(user.kycStatus)}
              variant="outlined"
              sx={{ display: { xs: 'none', md: 'flex' } }}
            />
          )}
        </Box>
      </Box>

      {/* User Dropdown Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              minWidth: 220,
              '& .MuiMenuItem-root': {
                px: 2,
                py: 1,
              },
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* Navigation Items */}
        {filteredItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (location.pathname === '/app' && item.path === '/app/marketplace')
          
          return (
            <MenuItem
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                backgroundColor: isActive ? 'primary.main' : 'transparent',
                color: isActive ? 'white' : 'text.primary',
                '&:hover': {
                  backgroundColor: isActive ? 'primary.dark' : 'action.hover',
                },
                '& .MuiListItemIcon-root': {
                  color: isActive ? 'white' : 'text.secondary',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.9rem',
                  fontWeight: isActive ? 600 : 400,
                }}
              />
            </MenuItem>
          )
        })}
        
        <Divider sx={{ my: 1 }} />
        
        {/* Settings */}
        <MenuItem onClick={handleSettings}>
          <ListItemIcon sx={{ minWidth: 36 }}>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText
            primary="Settings"
            primaryTypographyProps={{
              fontSize: '0.9rem',
            }}
          />
        </MenuItem>
        
        {/* Logout */}
        <MenuItem onClick={handleLogout}>
          <ListItemIcon sx={{ minWidth: 36 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            primaryTypographyProps={{
              fontSize: '0.9rem',
            }}
          />
        </MenuItem>
      </Menu>

      {/* Right side - User actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Theme Toggle */}
        <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
          <IconButton color="inherit" size="small" onClick={toggleTheme}>
            {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
        </Tooltip>

        {/* Notifications */}
        <IconButton color="inherit" size="small">
          <NotificationsIcon />
        </IconButton>

        {/* User info with dropdown */}
        <Box
          onClick={handleMenuOpen}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            ml: 1,
            px: 1,
            py: 0.5,
            borderRadius: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
            },
          }}
        >
          <Avatar
            sx={{
              width: 32,
              height: 32,
              fontSize: '0.875rem',
              bgcolor: muiTheme.palette.secondary.main,
            }}
          >
            {getUserInitials()}
          </Avatar>
          
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.2 }}>
              {getUserDisplayName()}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8, lineHeight: 1 }}>
              {user?.phoneNumber || user?.email || 'User'}
            </Typography>
          </Box>
          
          <ExpandMoreIcon 
            sx={{ 
              fontSize: '1rem',
              opacity: 0.7,
              transform: menuAnchorEl ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease-in-out',
            }} 
          />
        </Box>
      </Box>
    </Box>
  )
}

export default TopBar