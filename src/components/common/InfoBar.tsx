import React, { useState } from 'react'
import {
  Alert,
  AlertTitle,
  Collapse,
  IconButton,
  Box,
  Typography,
  Button,
  Stack,
} from '@mui/material'
import {
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material'

interface ActionButton {
  label: string
  onClick: () => void
  variant?: 'text' | 'outlined' | 'contained'
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning'
  size?: 'small' | 'medium' | 'large'
}

interface InfoBarProps {
  title?: string
  message: string | React.ReactNode
  severity?: 'error' | 'warning' | 'info' | 'success'
  variant?: 'filled' | 'outlined' | 'standard'
  closable?: boolean
  collapsible?: boolean
  defaultExpanded?: boolean
  actions?: ActionButton[]
  onClose?: () => void
  sx?: object
}

const InfoBar: React.FC<InfoBarProps> = ({
  title,
  message,
  severity = 'info',
  variant = 'standard',
  closable = true,
  collapsible = false,
  defaultExpanded = true,
  actions = [],
  onClose,
  sx = {},
}) => {
  const [isVisible, setIsVisible] = useState(true)
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  const handleClose = () => {
    setIsVisible(false)
    onClose?.()
  }

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  if (!isVisible) {
    return null
  }

  return (
    <Alert
      severity={severity}
      variant={variant}
      sx={{
        mb: 1,
        py: 1,
        minHeight: 'auto',
        '& .MuiAlert-message': {
          width: '100%',
          py: 0,
        },
        ...sx,
      }}
      action={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {collapsible && (
            <IconButton
              size="small"
              onClick={handleToggleExpand}
              sx={{ color: 'inherit' }}
            >
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          )}
          {closable && (
            <IconButton
              size="small"
              onClick={handleClose}
              sx={{ color: 'inherit' }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      }
    >
      {title && (
        <AlertTitle sx={{ mb: collapsible ? 0 : 1, fontSize: '0.875rem' }}>
          {title}
        </AlertTitle>
      )}
      
      {collapsible ? (
        <Collapse in={isExpanded}>
          <Box sx={{ mt: title ? 1 : 0 }}>
            {typeof message === 'string' ? (
              <Typography variant="body2">{message}</Typography>
            ) : (
              message
            )}
            {actions.length > 0 && (
              <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                {actions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant || 'contained'}
                    color={action.color || 'primary'}
                    size={action.size || 'small'}
                    onClick={action.onClick}
                  >
                    {action.label}
                  </Button>
                ))}
              </Stack>
            )}
          </Box>
        </Collapse>
      ) : (
        <Box sx={{ mt: title ? 0 : 0 }}>
          {typeof message === 'string' ? (
            <Typography variant="body2">{message}</Typography>
          ) : (
            message
          )}
          {actions.length > 0 && (
            <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'contained'}
                  color={action.color || 'primary'}
                  size={action.size || 'small'}
                  onClick={action.onClick}
                >
                  {action.label}
                </Button>
              ))}
            </Stack>
          )}
        </Box>
      )}
    </Alert>
  )
}

export default InfoBar