import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material'
import { useAdminAuth } from '../../hooks/useAdminAuth'

const AdminLoginForm: React.FC = () => {
  const navigate = useNavigate()
  const { login } = useAdminAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    mfaCode: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [requiresMFA, setRequiresMFA] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await login(formData.email, formData.password, formData.mfaCode)
      navigate('/admin/dashboard')
    } catch (err: any) {
      if (err.message?.includes('MFA')) {
        setRequiresMFA(true)
        setError('Please enter your MFA code')
      } else {
        setError(err.message || 'Invalid admin credentials')
      }
    } finally {
      setLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <Box display="flex" alignItems="center" justifyContent="center" mb={3}>
        <AdminIcon sx={{ fontSize: 40, color: 'primary.main', mr: 1 }} />
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Admin Portal
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" textAlign="center" mb={4}>
        Secure access for system administrators
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Admin Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        required
        disabled={loading}
        sx={{ mb: 3 }}
        placeholder="admin@lodas.com"
      />

      <TextField
        fullWidth
        label="Password"
        name="password"
        type={showPassword ? 'text' : 'password'}
        value={formData.password}
        onChange={handleChange}
        required
        disabled={loading}
        sx={{ mb: requiresMFA ? 3 : 4 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={togglePasswordVisibility}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {requiresMFA && (
        <TextField
          fullWidth
          label="MFA Code"
          name="mfaCode"
          value={formData.mfaCode}
          onChange={handleChange}
          required
          disabled={loading}
          sx={{ mb: 4 }}
          placeholder="Enter 6-digit code"
          inputProps={{ maxLength: 6 }}
        />
      )}

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={loading}
        sx={{ 
          mb: 3,
          height: 48,
          backgroundColor: 'error.main',
          '&:hover': {
            backgroundColor: 'error.dark',
          }
        }}
      >
        {loading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          'Sign In to Admin Portal'
        )}
      </Button>

      <Box textAlign="center">
        <Typography variant="body2" color="text.secondary">
          Use your admin account credentials to access the admin portal
        </Typography>
      </Box>
    </Box>
  )
}

export default AdminLoginForm