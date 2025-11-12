import React from 'react'
import {
  Box,
  Container,
  Paper,
  Typography,
} from '@mui/material'
import RegisterForm from '../components/auth/RegisterForm'

const Register: React.FC = () => {

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
            Sign Up
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create your Capital Core account
          </Typography>



          <RegisterForm />
        </Paper>
      </Box>
    </Container>
  )
}

export default Register