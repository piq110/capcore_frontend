import React from 'react'
import { Box } from '@mui/material'

interface ScreenReaderOnlyProps {
  children: React.ReactNode
  component?: React.ElementType
}

/**
 * Component that renders content only for screen readers
 * Visually hidden but accessible to assistive technologies
 */
const ScreenReaderOnly: React.FC<ScreenReaderOnlyProps> = ({ 
  children, 
  component = 'span' 
}) => {
  return (
    <Box
      component={component}
      sx={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: 0,
      }}
    >
      {children}
    </Box>
  )
}

export default ScreenReaderOnly