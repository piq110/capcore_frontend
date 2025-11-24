import React from 'react'
import {
  Box,
  Container,
  Paper,
  Typography,
} from '@mui/material'
import LoginForm from '../components/auth/LoginForm'

const Login: React.FC = () => {

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h4" gutterBottom>
            Sign In
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Access your Capital Core account
          </Typography>



          <LoginForm />
        </Paper>
      </Box>
    </Container>
  )
}

export default Login