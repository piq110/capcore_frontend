import React from 'react'
import {
  Box,
  Container,
  Paper,
  useTheme,
} from '@mui/material'
import AdminLoginForm from '../components/admin/AdminLoginForm'

const AdminLogin: React.FC = () => {
  const theme = useTheme()

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 3,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={24}
          sx={{
            p: 4,
            borderRadius: 3,
            backgroundColor: theme.palette.background.paper,
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          }}
        >
          <AdminLoginForm />
        </Paper>
      </Container>
    </Box>
  )
}

export default AdminLogin