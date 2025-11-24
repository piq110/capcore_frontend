import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Drawer,
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
  Dashboard as DashboardIcon,
  People as UsersIcon,
  Store as ProductsIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,

  AdminPanelSettings as AdminIcon,
  Assignment as KYCIcon,
  AccountBalanceWallet as WithdrawalsIcon,
  AccountBalanceWallet,
  ShoppingCart as OrdersIcon,
} from '@mui/icons-material'

const DRAWER_WIDTH = 280

interface NavigationItem {
  text: string
  path: string
  icon: React.ReactElement
}

const navigationItems: NavigationItem[] = [
  {
    text: 'Dashboard',
    path: '/admin/dashboard',
    icon: <DashboardIcon />,
  },
  {
    text: 'User Management',
    path: '/admin/users',
    icon: <UsersIcon />,
  },
  {
    text: 'Product Management',
    path: '/admin/products',
    icon: <ProductsIcon />,
  },
  {
    text: 'KYC Management',
    path: '/admin/kyc',
    icon: <KYCIcon />,
  },
  {
    text: 'Order Management',
    path: '/admin/orders',
    icon: <OrdersIcon />,
  },
  {
    text: 'Withdrawals',
    path: '/admin/withdrawals',
    icon: <WithdrawalsIcon />,
  },
  {
    text: 'Wallet Management',
    path: '/admin/wallets',
    icon: <AccountBalanceWallet />,
  },
  {
    text: 'Reports & Analytics',
    path: '/admin/reports',
    icon: <AnalyticsIcon />,
  },
  {
    text: 'Settings',
    path: '/admin/settings',
    icon: <SettingsIcon />,
  },
]

const AdminSidebar: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const handleNavigation = (path: string) => {
    navigate(path)
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          backgroundColor: 'error.main',
          color: 'white',
        },
      }}
    >
      {/* Logo/Brand area */}
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          px: 3,
          backgroundColor: 'error.dark',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AdminIcon sx={{ fontSize: 32, color: 'white' }} />
          <Box>
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 600,
                color: 'white',
                fontSize: '1.1rem',
                lineHeight: 1.2,
              }}
            >
              Capital Core
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.75rem',
              }}
            >
              Admin Portal
            </Typography>
          </Box>
        </Box>
      </Toolbar>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />

      {/* Navigation items */}
      <List sx={{ flexGrow: 1, pt: 2 }}>
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path
          
          return (
            <ListItem key={item.path} disablePadding sx={{ px: 2, mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: 2,
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: isActive 
                      ? 'rgba(255, 255, 255, 0.3)' 
                      : 'rgba(255, 255, 255, 0.1)',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
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
          sx={{ 
            display: 'block', 
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.7)',
          }}
        >
          Capital Core Admin Portal
        </Typography>
        <Typography
          variant="caption"
          sx={{ 
            display: 'block', 
            textAlign: 'center', 
            mt: 0.5,
            color: 'rgba(255, 255, 255, 0.7)',
          }}
        >
          v1.0.0
        </Typography>
      </Box>
    </Drawer>
  )
}

export default AdminSidebar