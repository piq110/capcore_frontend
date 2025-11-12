import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  Chip,
  Grid,
} from '@mui/material'
import { Security, Verified, ContentCopy } from '@mui/icons-material'
import QRCode from 'qrcode.react'
import { authService } from '../../services/authService'
import { useAuth } from '../../hooks/useAuth'

interface MFASetupProps {
  open: boolean
  onClose: () => void
  onComplete: () => void
}

const steps = ['Generate Secret', 'Scan QR Code', 'Verify Setup']

const MFASetup: React.FC<MFASetupProps> = ({ open, onClose, onComplete }) => {
  const { refreshUser } = useAuth()
  const [activeStep, setActiveStep] = useState(0)
  const [secret, setSecret] = useState('')
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [verificationCode, setVerificationCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (open && activeStep === 0) {
      initializeMFASetup()
    }
  }, [open])

  const initializeMFASetup = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await authService.setupMFA()
      setSecret(response.setup.manualEntryKey)
      setQrCodeUrl(response.setup.qrCodeUrl)
      setBackupCodes(response.setup.backupCodes)
      setActiveStep(1)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to initialize MFA setup')
    } finally {
      setIsLoading(false)
    }
  } 
 const handleVerifyMFA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code')
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const response = await authService.verifyMFA(verificationCode)
      if (response.success) {
        setSuccess('MFA has been successfully enabled!')
        setActiveStep(2)
        await refreshUser()
        setTimeout(() => {
          onComplete()
          handleClose()
        }, 2000)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid verification code')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setActiveStep(0)
    setSecret('')
    setQrCodeUrl('')
    setBackupCodes([])
    setVerificationCode('')
    setError(null)
    setSuccess(null)
    onClose()
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const copyAllBackupCodes = () => {
    const codesText = backupCodes.join('\n')
    navigator.clipboard.writeText(codesText)
  }

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Security color="primary" sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Setting up Multi-Factor Authentication
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              MFA adds an extra layer of security to your account by requiring a second form of verification.
            </Typography>
            {isLoading && <CircularProgress />}
          </Box>
        )

      case 1:
        return (
          <Box sx={{ py: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
              Scan QR Code with Authenticator App
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
              Use Google Authenticator, Authy, or any compatible TOTP app to scan this QR code.
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <Paper elevation={1} sx={{ p: 2, display: 'inline-block' }}>
                <QRCode value={qrCodeUrl} size={200} />
              </Paper>
            </Box>

            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Manual Entry Key:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  {secret}
                </Typography>
                <Button
                  size="small"
                  startIcon={<ContentCopy />}
                  onClick={() => copyToClipboard(secret)}
                >
                  Copy
                </Button>
              </Box>
            </Alert>

            <TextField
              fullWidth
              label="Enter 6-digit code from your app"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              inputProps={{
                maxLength: 6,
                style: { textAlign: 'center', fontSize: '1.2rem', letterSpacing: '0.5rem' }
              }}
              sx={{ mb: 2 }}
            />

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button onClick={handleClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleVerifyMFA}
                disabled={isLoading || verificationCode.length !== 6}
              >
                {isLoading ? <CircularProgress size={24} /> : 'Verify & Enable MFA'}
              </Button>
            </Box>
          </Box>
        )

      case 2:
        return (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Verified color="success" sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h6" gutterBottom color="success.main">
              MFA Successfully Enabled!
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Your account is now protected with multi-factor authentication.
            </Typography>

            <Alert severity="warning" sx={{ mb: 3, textAlign: 'left' }}>
              <Typography variant="subtitle2" gutterBottom>
                Save Your Backup Codes
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Store these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.
              </Typography>
              <Grid container spacing={1} sx={{ mb: 2 }}>
                {backupCodes.map((code, index) => (
                  <Grid item xs={6} key={index}>
                    <Chip
                      label={code}
                      variant="outlined"
                      size="small"
                      sx={{ fontFamily: 'monospace' }}
                    />
                  </Grid>
                ))}
              </Grid>
              <Button
                size="small"
                startIcon={<ContentCopy />}
                onClick={copyAllBackupCodes}
              >
                Copy All Codes
              </Button>
            </Alert>
          </Box>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Security />
          Multi-Factor Authentication Setup
        </Box>
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent()}
      </DialogContent>
    </Dialog>
  )
}

export default MFASetup