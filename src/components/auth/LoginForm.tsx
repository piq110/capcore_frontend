import React, { useState } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import {
  Box,
  TextField,
  Button,
  Link,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useAuth } from '../../hooks/useAuth'
import { useNotification } from '../../hooks/useNotification'

interface LoginFormData {
  email: string
  password: string
  mfaCode?: string
}

const loginSchema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  mfaCode: yup
    .string()
    .matches(/^\d{6}$/, 'MFA code must be 6 digits')
    .optional(),
})

const LoginForm: React.FC = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { showSuccess } = useNotification()
  const [showPassword, setShowPassword] = useState(false)
  const [showMfaField, setShowMfaField] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      await login(data.email, data.password, data.mfaCode)
      showSuccess('Successfully logged in! Welcome back.', { duration: 3000 })
      navigate('/app')
    } catch (err: any) {
      if (err.response?.status === 401 && err.response?.data?.requiresMfa) {
        setShowMfaField(true)
        setError('Please enter your MFA code to continue')
      } else if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError('Login failed. Please check your credentials and try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        {...register('email')}
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email Address"
        name="email"
        autoComplete="email"
        autoFocus
        error={!!errors.email}
        helperText={errors.email?.message}
        disabled={isLoading}
      />

      <TextField
        {...register('password')}
        margin="normal"
        required
        fullWidth
        name="password"
        label="Password"
        type={showPassword ? 'text' : 'password'}
        id="password"
        autoComplete="current-password"
        error={!!errors.password}
        helperText={errors.password?.message}
        disabled={isLoading}
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

      {showMfaField && (
        <TextField
          {...register('mfaCode')}
          margin="normal"
          fullWidth
          name="mfaCode"
          label="MFA Code"
          placeholder="Enter 6-digit code"
          error={!!errors.mfaCode}
          helperText={errors.mfaCode?.message || 'Enter the 6-digit code from your authenticator app'}
          disabled={isLoading}
          inputProps={{
            maxLength: 6,
            pattern: '[0-9]*',
          }}
        />
      )}

      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={isLoading}
      >
        {isLoading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          'Sign In'
        )}
      </Button>

      <Box sx={{ textAlign: 'center' }}>
        <Link component={RouterLink} to="/register" variant="body2">
          Don't have an account? Sign Up
        </Link>
      </Box>
    </Box>
  )
}

export default LoginForm