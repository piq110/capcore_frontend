import React from 'react'
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box,
} from '@mui/material'
import {
  Person as PersonIcon,
  Business as BusinessIcon,
  TrendingUp as AdvisorIcon,
} from '@mui/icons-material'

export interface CustomerDropdownProps {
  anchorEl: null | HTMLElement
  open: boolean
  onClose: () => void
  onSelect: (userType: 'individual' | 'institutional' | 'advisor') => void
}

interface CustomerOption {
  type: 'individual' | 'institutional' | 'advisor'
  label: string
  description: string
  icon: React.ReactElement
}

const customerOptions: CustomerOption[] = [
  {
    type: 'individual',
    label: 'Individual Investor',
    description: 'Personal investment and liquidity solutions',
    icon: <PersonIcon />,
  },
  {
    type: 'institutional',
    label: 'Institutional Investor',
    description: 'Organizational investment management',
    icon: <BusinessIcon />,
  },
  {
    type: 'advisor',
    label: 'Financial Advisor',
    description: 'Client liquidity and investment services',
    icon: <AdvisorIcon />,
  },
]

const CustomerDropdown: React.FC<CustomerDropdownProps> = ({
  anchorEl,
  open,
  onClose,
  onSelect,
}) => {
  const handleSelect = (userType: 'individual' | 'institutional' | 'advisor') => {
    onSelect(userType)
    onClose()
  }

  const handleKeyDown = (event: React.KeyboardEvent, userType: 'individual' | 'institutional' | 'advisor') => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleSelect(userType)
    }
  }

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      id="customer-dropdown-menu"
      aria-labelledby="customer-dropdown-button"
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      slotProps={{
        paper: {
          sx: {
            mt: 1,
            minWidth: 320,
            maxWidth: 400,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1.5,
              minHeight: 48,
            },
          },
        },
      }}
    >
      {/* Header */}
      <Box sx={{ px: 2, py: 1, backgroundColor: 'grey.50' }}>
        <Typography variant="subtitle2" color="text.secondary">
          Choose your investor type
        </Typography>
      </Box>
      
      <Divider />

      {/* Customer Options */}
      {customerOptions.map((option) => (
        <MenuItem
          key={option.type}
          onClick={() => handleSelect(option.type)}
          onKeyDown={(event) => handleKeyDown(event, option.type)}
          sx={{
            '&:hover': {
              backgroundColor: 'primary.light',
              '& .MuiListItemIcon-root': {
                color: 'primary.main',
              },
            },
            '&:focus': {
              backgroundColor: 'primary.light',
              '& .MuiListItemIcon-root': {
                color: 'primary.main',
              },
            },
            '&:focus-visible': {
              outline: '2px solid',
              outlineColor: 'primary.main',
              outlineOffset: '-2px'
            }
          }}
          tabIndex={0}
          role="menuitem"
          aria-describedby={`customer-option-${option.type}-description`}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            {option.icon}
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {option.label}
              </Typography>
            }
            secondary={
              <Typography 
                variant="body2" 
                color="text.secondary"
                id={`customer-option-${option.type}-description`}
              >
                {option.description}
              </Typography>
            }
          />
        </MenuItem>
      ))}
    </Menu>
  )
}

export default CustomerDropdown