import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Toolbar,
} from '@mui/material'
import {
  Store as MarketplaceIcon,
  AccountBalance as PortfolioIcon,
  AccountBalanceWallet as WalletIcon,
  Person as AccountIcon,
  AdminPanelSettings as AdminIcon,

} from '@mui/icons-material'

interface SidebarProps {
  onItemClick?: () => void
}

interface NavigationItem {
  text: string
  path: string
  icon: React.ReactElement
  adminOnly?: boolean
}

const navigationItems: NavigationItem[] = [
  {
    text: 'Marketplace',
    path: '/marketplace',
    icon: <MarketplaceIcon />,
  },
  {
    text: 'Portfolio',
    path: '/portfolio',
    icon: <PortfolioIcon />,
  },
  {
    text: 'Wallet',
    path: '/wallet',
    icon: <WalletIcon />,
  },
  {
    text: 'Account',
    path: '/account',
    icon: <AccountIcon />,
  },
  {
    text: 'Admin Dashboard',
    path: '/admin',
    icon: <AdminIcon />,
    adminOnly: true,
  },
]

const Sidebar: React.FC<SidebarProps> = ({ onItemClick }) => {
  const navigate = useNavigate()
  const location = useLocation()

  // TODO: Replace with actual user role check from auth context
  const isAdmin = false // Will be replaced with actual role check

  const handleNavigation = (path: string) => {
    navigate(path)
    onItemClick?.()
  }

  const filteredItems = navigationItems.filter(
    (item) => !item.adminOnly || isAdmin
  )

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo/Brand area */}
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          px: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              backgroundColor: 'primary.main',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                sx={{
                  width: 12,
                  height: 2,
                  backgroundColor: 'white',
                  mb: 0.5,
                }}
              />
              <Box
                sx={{
                  width: 8,
                  height: 2,
                  backgroundColor: 'white',
                  mb: 0.5,
                }}
              />
              <Box
                sx={{
                  width: 16,
                  height: 2,
                  backgroundColor: 'white',
                }}
              />
            </Box>
          </Box>
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 600,
              color: 'text.primary',
              fontSize: '1.1rem',
            }}
          >
            LODAS
          </Typography>
        </Box>
      </Toolbar>

      <Divider />

      {/* Navigation items */}
      <List sx={{ flexGrow: 1, pt: 2 }}>
        {filteredItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (location.pathname === '/' && item.path === '/marketplace')
          
          return (
            <ListItem key={item.path} disablePadding sx={{ px: 2, mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: 2,
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
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    fontWeight: isActive ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>

      {/* Footer area */}
      <Box sx={{ p: 2, mt: 'auto' }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', textAlign: 'center' }}
        >
          Capital Core
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', textAlign: 'center', mt: 0.5 }}
        >
          v1.0.0
        </Typography>
      </Box>
    </Box>
  )
}

export default Sidebar