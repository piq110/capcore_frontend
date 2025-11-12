import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  TextField,
  Chip,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,

} from '@mui/material'
import {
  Person,
  Security,
  Edit,
  Save,
  Cancel,

  Info
} from '@mui/icons-material'
import { useAuth } from '../../hooks/useAuth'
import { authService } from '../../services/authService'

interface ProfileData {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
}

interface NotificationSettings {
  emailNotifications: boolean
  smsNotifications: boolean
  tradingAlerts: boolean
  securityAlerts: boolean
  marketingEmails: boolean
}

interface SecuritySettings {
  mfaEnabled: boolean
  loginNotifications: boolean
  sessionTimeout: number
}

const AccountSettings: React.FC = () => {
  const { user, refreshUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Profile state
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phoneNumber: ''
  })
  
  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: false,
    tradingAlerts: true,
    securityAlerts: true,
    marketingEmails: false
  })
  
  // Security settings state
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    mfaEnabled: user?.mfaEnabled || false,
    loginNotifications: true,
    sessionTimeout: 30
  })
  
  // MFA management state
  const [showMFADialog, setShowMFADialog] = useState(false)
  const [showBackupCodes, setShowBackupCodes] = useState(false)
  const [mfaSetupData, setMfaSetupData] = useState<any>(null)
  const [mfaCode, setMfaCode] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])

  useEffect(() => {
    // Load user profile data when component mounts
    loadProfileData()
    loadUserSettings()
  }, [user])

  const loadProfileData = async () => {
    try {
      if (user) {
        setProfileData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email,
          phoneNumber: user.phoneNumber || ''
        })
      }
    } catch (error) {
      console.error('Failed to load profile data:', error)
    }
  }

  const loadUserSettings = async () => {
    try {
      // In a real app, this would fetch user preferences from API
      // For now, we'll use default values
      setSecuritySettings(prev => ({
        ...prev,
        mfaEnabled: user?.mfaEnabled || false
      }))
    } catch (error) {
      console.error('Failed to load user settings:', error)
    }
  }

  const handleProfileSave = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      // Call the profile update API
      const response = await authService.updateProfile({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phoneNumber: profileData.phoneNumber
      })
      
      if (response.user) {
        // Refresh user data from server to get complete updated data
        await refreshUser()
        setSuccess('Profile updated successfully')
        setIsEditing(false)
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationSettingsChange = async (setting: keyof NotificationSettings, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: value
    }))
    
    try {
      // In a real app, this would call an API to update settings
      await new Promise(resolve => setTimeout(resolve, 500))
      setSuccess('Notification settings updated')
    } catch (error) {
      setError('Failed to update notification settings')
    }
  }

  const handleMFASetup = async () => {
    try {
      setLoading(true)
      const setupData = await authService.setupMFA()
      setMfaSetupData(setupData.setup)
      setShowMFADialog(true)
    } catch (error) {
      setError('Failed to setup MFA. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleMFAVerification = async () => {
    try {
      setLoading(true)
      const result = await authService.verifyMFA(mfaCode, true)
      
      if (result.backupCodes) {
        setBackupCodes(result.backupCodes)
        setSecuritySettings(prev => ({ ...prev, mfaEnabled: true }))
        setShowMFADialog(false)
        setShowBackupCodes(true)
        setSuccess('MFA enabled successfully')
        await refreshUser()
      } else {
        setError('Invalid MFA code. Please try again.')
      }
    } catch (error) {
      setError('Failed to verify MFA code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleMFADisable = async () => {
    try {
      setLoading(true)
      const result = await authService.disableMFA(mfaCode)
      
      if (result.success) {
        setSecuritySettings(prev => ({ ...prev, mfaEnabled: false }))
        setSuccess('MFA disabled successfully')
        await refreshUser()
      } else {
        setError('Failed to disable MFA. Please verify your code.')
      }
    } catch (error) {
      setError('Failed to disable MFA. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Account Settings
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Profile Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Person sx={{ mr: 1 }} />
                <Typography variant="h6">Profile Information</Typography>
                <Box sx={{ ml: 'auto' }}>
                  {!isEditing ? (
                    <Button
                      startIcon={<Edit />}
                      onClick={() => setIsEditing(true)}
                      size="small"
                    >
                      Edit
                    </Button>
                  ) : (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        startIcon={<Save />}
                        onClick={handleProfileSave}
                        disabled={loading}
                        size="small"
                        variant="contained"
                      >
                        Save
                      </Button>
                      <Button
                        startIcon={<Cancel />}
                        onClick={() => setIsEditing(false)}
                        size="small"
                      >
                        Cancel
                      </Button>
                    </Box>
                  )}
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                    disabled={!isEditing}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                    disabled={!isEditing}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={profileData.email}
                    disabled
                    size="small"
                    helperText="Email cannot be changed. Contact support if needed."
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={profileData.phoneNumber}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    disabled={!isEditing}
                    size="small"
                    placeholder="+1 (555) 123-4567"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Security Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Security sx={{ mr: 1 }} />
                <Typography variant="h6">Security Settings</Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Multi-Factor Authentication
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Chip 
                    label={securitySettings.mfaEnabled ? 'Enabled' : 'Disabled'}
                    color={securitySettings.mfaEnabled ? 'success' : 'default'}
                    size="small"
                  />
                  {!securitySettings.mfaEnabled ? (
                    <Button 
                      size="small" 
                      variant="outlined"
                      onClick={handleMFASetup}
                      disabled={loading}
                    >
                      Enable MFA
                    </Button>
                  ) : (
                    <Button 
                      size="small" 
                      variant="outlined"
                      color="error"
                      onClick={() => setShowMFADialog(true)}
                    >
                      Disable MFA
                    </Button>
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {securitySettings.mfaEnabled 
                    ? 'Your account is protected with two-factor authentication'
                    : 'Add an extra layer of security to your account'
                  }
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Login Notifications
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={securitySettings.loginNotifications}
                      onChange={(e) => setSecuritySettings(prev => ({
                        ...prev,
                        loginNotifications: e.target.checked
                      }))}
                    />
                  }
                  label="Email me when someone logs into my account"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Preferences */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notification Preferences
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="Email Notifications"
                        secondary="Receive notifications via email"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={notificationSettings.emailNotifications}
                          onChange={(e) => handleNotificationSettingsChange('emailNotifications', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    
                    <ListItem>
                      <ListItemText 
                        primary="Trading Alerts"
                        secondary="Order fills, trade confirmations"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={notificationSettings.tradingAlerts}
                          onChange={(e) => handleNotificationSettingsChange('tradingAlerts', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    
                    <ListItem>
                      <ListItemText 
                        primary="Security Alerts"
                        secondary="Login attempts, security changes"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={notificationSettings.securityAlerts}
                          onChange={(e) => handleNotificationSettingsChange('securityAlerts', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="SMS Notifications"
                        secondary="Receive notifications via SMS"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={notificationSettings.smsNotifications}
                          onChange={(e) => handleNotificationSettingsChange('smsNotifications', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    
                    <ListItem>
                      <ListItemText 
                        primary="Marketing Emails"
                        secondary="Product updates, newsletters"
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={notificationSettings.marketingEmails}
                          onChange={(e) => handleNotificationSettingsChange('marketingEmails', e.target.checked)}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* MFA Setup/Disable Dialog */}
      <Dialog open={showMFADialog} onClose={() => setShowMFADialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {securitySettings.mfaEnabled ? 'Disable Multi-Factor Authentication' : 'Setup Multi-Factor Authentication'}
        </DialogTitle>
        <DialogContent>
          {!securitySettings.mfaEnabled && mfaSetupData ? (
            <Box>
              <Typography variant="body2" paragraph>
                Scan this QR code with your authenticator app:
              </Typography>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <img src={mfaSetupData.qrCodeUrl} alt="MFA QR Code" style={{ maxWidth: '200px' }} />
              </Box>
              <Typography variant="body2" paragraph>
                Or manually enter this key: <code>{mfaSetupData.manualEntryKey}</code>
              </Typography>
              <TextField
                fullWidth
                label="Enter 6-digit code from your authenticator app"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                placeholder="123456"
                inputProps={{ maxLength: 6 }}
              />
            </Box>
          ) : (
            <Box>
              <Typography variant="body2" paragraph>
                To disable MFA, please enter a code from your authenticator app:
              </Typography>
              <TextField
                fullWidth
                label="Enter 6-digit MFA code"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                placeholder="123456"
                inputProps={{ maxLength: 6 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowMFADialog(false)}>Cancel</Button>
          <Button 
            onClick={securitySettings.mfaEnabled ? handleMFADisable : handleMFAVerification}
            disabled={loading || mfaCode.length !== 6}
            variant="contained"
          >
            {securitySettings.mfaEnabled ? 'Disable MFA' : 'Verify & Enable'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Backup Codes Dialog */}
      <Dialog open={showBackupCodes} onClose={() => setShowBackupCodes(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Info sx={{ mr: 1 }} />
            Backup Codes
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Save these backup codes in a secure location. Each code can only be used once.
          </Alert>
          <Box sx={{ 
            fontFamily: 'monospace', 
            backgroundColor: 'grey.100', 
            p: 2, 
            borderRadius: 1,
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 1
          }}>
            {backupCodes.map((code, index) => (
              <Typography key={index} variant="body2">
                {code}
              </Typography>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowBackupCodes(false)} variant="contained">
            I've Saved These Codes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default AccountSettings