import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Container,
} from '@mui/material'
import { CheckCircle, Email, Refresh } from '@mui/icons-material'
import { authService } from '../../services/authService'
import { useAuth } from '../../hooks/useAuth'

interface EmailVerificationProps {
  showAsComponent?: boolean
}

const EmailVerification: React.FC<EmailVerificationProps> = ({ showAsComponent = false }) => {
  const [searchParams] = useSearchParams()
  const { user, refreshUser } = useAuth()
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'pending'>('loading')
  const [message, setMessage] = useState('')
  const [isResending, setIsResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const token = searchParams.get('token')

  useEffect(() => {
    if (token) {
      verifyEmailToken(token)
    } else if (showAsComponent && user) {
      if (user.emailVerified) {
        setStatus('success')
        setMessage('Your email has been verified!')
      } else {
        setStatus('pending')
        setMessage('Please check your email and click the verification link.')
      }
    }
  }, [token, showAsComponent, user])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [resendCooldown])

  const verifyEmailToken = async (verificationToken: string) => {
    try {
      const response = await authService.verifyEmail(verificationToken)
      if (response.success) {
        setStatus('success')
        setMessage('Email verified successfully! You can now access all platform features.')
        await refreshUser()
      } else {
        setStatus('error')
        setMessage('Email verification failed. The link may be expired or invalid.')
      }
    } catch (error: any) {
      setStatus('error')
      setMessage(error.response?.data?.message || 'Email verification failed.')
    }
  }

  const handleResendVerification = async () => {
    setIsResending(true)
    try {
      const response = await authService.resendVerificationEmail()
      if (response.success) {
        setMessage('Verification email sent! Please check your inbox.')
        setResendCooldown(60) // 60 second cooldown
      }
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to resend verification email.')
    } finally {
      setIsResending(false)
    }
  }

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Verifying your email...
            </Typography>
            <Typography color="text.secondary">
              Please wait while we verify your email address.
            </Typography>
          </Box>
        )

      case 'success':
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircle color="success" sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h5" gutterBottom color="success.main">
              Email Verified!
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              {message}
            </Typography>
            {!showAsComponent && (
              <Button variant="contained" href="/">
                Continue to Dashboard
              </Button>
            )}
          </Box>
        )

      case 'error':
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Alert severity="error" sx={{ mb: 3 }}>
              {message}
            </Alert>
            <Typography variant="h6" gutterBottom>
              Email Verification Failed
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              The verification link may be expired or invalid.
            </Typography>
            <Button
              variant="contained"
              onClick={handleResendVerification}
              disabled={isResending || resendCooldown > 0}
              startIcon={isResending ? <CircularProgress size={20} /> : <Refresh />}
            >
              {resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : isResending
                ? 'Sending...'
                : 'Resend Verification Email'}
            </Button>
          </Box>
        )

      case 'pending':
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Email color="primary" sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Check Your Email
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              {message}
            </Typography>
            <Button
              variant="outlined"
              onClick={handleResendVerification}
              disabled={isResending || resendCooldown > 0}
              startIcon={isResending ? <CircularProgress size={20} /> : <Refresh />}
            >
              {resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : isResending
                ? 'Sending...'
                : 'Resend Verification Email'}
            </Button>
          </Box>
        )

      default:
        return null
    }
  }

  if (showAsComponent) {
    return renderContent()
  }

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
            Email Verification
          </Typography>
          {renderContent()}
        </Paper>
      </Box>
    </Container>
  )
}

export default EmailVerification