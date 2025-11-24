import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Tabs,
  Tab,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  Snackbar
} from '@mui/material'
import {
  ContentCopy as CopyIcon,
  Info as InfoIcon
} from '@mui/icons-material'
import { QRCodeSVG } from 'qrcode.react'
import { walletService } from '../../services/walletService'
import { WalletAddress, NetworkInfo } from '../../types/wallet'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`deposit-tabpanel-${index}`}
      aria-labelledby={`deposit-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}

const DepositInterface: React.FC = () => {
  const [addresses, setAddresses] = useState<WalletAddress | null>(null)
  const [networks, setNetworks] = useState<Record<string, NetworkInfo> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState(0)
  const [copySuccess, setCopySuccess] = useState<string | null>(null)

  const networkOrder = ['ethereum', 'tron', 'bsc']

  const loadWalletAddresses = async () => {
    try {
      setError(null)
      const response = await walletService.getWalletAddresses()
      setAddresses(response.data.addresses)
      setNetworks(response.data.networks)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load wallet addresses')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWalletAddresses()
  }, [])

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue)
  }

  const handleCopyAddress = async (address: string, network: string) => {
    try {
      await navigator.clipboard.writeText(address)
      setCopySuccess(`${network.toUpperCase()} address copied!`)
    } catch (err) {
      setCopySuccess('Failed to copy address')
    }
  }

  const handleCloseCopySuccess = () => {
    setCopySuccess(null)
  }

  const getNetworkColor = (network: string) => {
    switch (network) {
      case 'ethereum': return '#627EEA'
      case 'tron': return '#FF060A'
      case 'bsc': return '#F3BA2F'
      default: return '#666'
    }
  }

  const getNetworkIcon = (network: string) => {
    // In a real app, you'd use actual network icons
    switch (network) {
      case 'ethereum': return '⟠'
      case 'tron': return '◊'
      case 'bsc': return '◈'
      default: return '●'
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        action={
          <Button color="inherit" size="small" onClick={loadWalletAddresses}>
            Retry
          </Button>
        }
      >
        {error}
      </Alert>
    )
  }

  if (!addresses || !networks) {
    return (
      <Alert severity="info">
        No wallet addresses available. Please try refreshing.
      </Alert>
    )
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Deposit Cryptocurrency
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <Box display="flex" alignItems="center">
          <InfoIcon sx={{ mr: 1 }} />
          <Typography variant="body2">
            Send only USDT or USDC to these addresses. Sending other tokens may result in permanent loss.
            Minimum deposit: $10. Deposits are automatically credited after network confirmations.
          </Typography>
        </Box>
      </Alert>

      <Card>
        <CardContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={selectedTab} 
              onChange={handleTabChange}
              variant="fullWidth"
            >
              {networkOrder.map((network, index) => (
                <Tab
                  key={network}
                  label={
                    <Box display="flex" alignItems="center">
                      <span style={{ fontSize: '1.2em', marginRight: 8 }}>
                        {getNetworkIcon(network)}
                      </span>
                      {networks[network]?.name}
                    </Box>
                  }
                  id={`deposit-tab-${index}`}
                  aria-controls={`deposit-tabpanel-${index}`}
                />
              ))}
            </Tabs>
          </Box>

          {networkOrder.map((network, index) => (
            <TabPanel key={network} value={selectedTab} index={index}>
              <Grid container spacing={3}>
                {/* QR Code */}
                <Grid item xs={12} md={6}>
                  <Box textAlign="center">
                    <Typography variant="h6" gutterBottom>
                      QR Code
                    </Typography>
                    <Box 
                      display="flex" 
                      justifyContent="center" 
                      p={2}
                      sx={{ 
                        backgroundColor: 'white',
                        borderRadius: 2,
                        border: `3px solid ${getNetworkColor(network)}`,
                        display: 'inline-block'
                      }}
                    >
                      <QRCodeSVG
                        value={addresses[network as keyof WalletAddress]}
                        size={200}
                        level="M"
                        includeMargin={true}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Scan with your wallet app
                    </Typography>
                  </Box>
                </Grid>

                {/* Address and Network Info */}
                <Grid item xs={12} md={6}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Deposit Address
                    </Typography>
                    
                    <TextField
                      fullWidth
                      value={addresses[network as keyof WalletAddress]}
                      InputProps={{
                        readOnly: true,
                        endAdornment: (
                          <Tooltip title="Copy address">
                            <IconButton
                              onClick={() => handleCopyAddress(
                                addresses[network as keyof WalletAddress],
                                network
                              )}
                              edge="end"
                            >
                              <CopyIcon />
                            </IconButton>
                          </Tooltip>
                        ),
                      }}
                      sx={{ mb: 2 }}
                    />

                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<CopyIcon />}
                      onClick={() => handleCopyAddress(
                        addresses[network as keyof WalletAddress],
                        network
                      )}
                      sx={{ 
                        mb: 3,
                        borderColor: getNetworkColor(network),
                        color: getNetworkColor(network),
                        '&:hover': {
                          borderColor: getNetworkColor(network),
                          backgroundColor: `${getNetworkColor(network)}10`
                        }
                      }}
                    >
                      Copy Address
                    </Button>

                    {/* Network Information */}
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Network Information
                      </Typography>
                      
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" color="text.secondary">
                          Network:
                        </Typography>
                        <Chip 
                          label={networks[network]?.name}
                          size="small"
                          sx={{ 
                            backgroundColor: `${getNetworkColor(network)}20`,
                            color: getNetworkColor(network)
                          }}
                        />
                      </Box>

                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" color="text.secondary">
                          Supported Tokens:
                        </Typography>
                        <Box>
                          {networks[network]?.tokens.map((token) => (
                            <Chip
                              key={token}
                              label={token}
                              size="small"
                              variant="outlined"
                              sx={{ ml: 0.5 }}
                            />
                          ))}
                        </Box>
                      </Box>

                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" color="text.secondary">
                          Confirmations Required:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {networks[network]?.confirmations}
                        </Typography>
                      </Box>

                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">
                          Estimated Time:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {network === 'ethereum' ? '5-15 min' : 
                           network === 'tron' ? '1-3 min' : '1-5 min'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              {/* Important Notes */}
              <Alert severity="warning" sx={{ mt: 3 }}>
                <Typography variant="body2" fontWeight="medium" gutterBottom>
                  Important Notes for {networks[network]?.name}:
                </Typography>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  <li>Only send USDT or USDC tokens to this address</li>
                  <li>Minimum deposit amount: $10</li>
                  <li>Deposits require {networks[network]?.confirmations} network confirmations</li>
                  <li>Do not send tokens from exchanges that don't support smart contracts</li>
                  {network === 'tron' && (
                    <li>Ensure you have TRX in your wallet to cover transaction fees</li>
                  )}
                  {(network === 'ethereum' || network === 'bsc') && (
                    <li>Ensure you have {network === 'ethereum' ? 'ETH' : 'BNB'} for gas fees</li>
                  )}
                </ul>
              </Alert>
            </TabPanel>
          ))}
        </CardContent>
      </Card>

      <Snackbar
        open={!!copySuccess}
        autoHideDuration={3000}
        onClose={handleCloseCopySuccess}
        message={copySuccess}
      />
    </Box>
  )
}

export default DepositInterface