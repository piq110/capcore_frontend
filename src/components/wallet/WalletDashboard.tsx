import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Button
} from '@mui/material'
import {
  Refresh as RefreshIcon,
  AccountBalanceWallet as WalletIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material'
import { walletService } from '../../services/walletService'
import { MultiChainBalances } from '../../types/wallet'

interface WalletDashboardProps {
  onRefresh?: () => void
}

const WalletDashboard: React.FC<WalletDashboardProps> = ({ onRefresh }) => {
  const [balances, setBalances] = useState<MultiChainBalances | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadBalances = async () => {
    try {
      setError(null)
      const response = await walletService.getWalletBalances()
      console.log('Wallet balances response:', response.data)
      setBalances(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load wallet balances')
    } finally {
      setLoading(false)
    }
  }

  const handleSyncBalances = async () => {
    try {
      setSyncing(true)
      setError(null)
      const response = await walletService.syncBalances()
      setBalances(response.data)
      onRefresh?.()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to sync balances')
    } finally {
      setSyncing(false)
    }
  }

  useEffect(() => {
    loadBalances()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(amount)
  }

  const getNetworkColor = (network: string) => {
    switch (network) {
      case 'ethereum': return '#627EEA'
      case 'tron': return '#FF060A'
      case 'bsc': return '#F3BA2F'
      default: return '#666'
    }
  }

  const getNetworkName = (network: string) => {
    switch (network) {
      case 'ethereum': return 'Ethereum'
      case 'tron': return 'Tron'
      case 'bsc': return 'BSC'
      default: return network
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        action={
          <Button color="inherit" size="small" onClick={loadBalances}>
            Retry
          </Button>
        }
      >
        {error}
      </Alert>
    )
  }

  if (!balances) {
    return (
      <Alert severity="info">
        No wallet data available. Please try refreshing.
      </Alert>
    )
  }

  return (
    <Box>
      {/* Total Balance Card */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6" color="white" gutterBottom>
                Total Portfolio Value
              </Typography>
              <Typography variant="h3" color="white" fontWeight="bold">
                {formatCurrency(balances.totalUSD)}
              </Typography>
            </Box>
            <Box textAlign="center">
              <WalletIcon sx={{ fontSize: 48, color: 'white', opacity: 0.8 }} />
              <Tooltip title={syncing ? 'Syncing...' : 'Sync balances from blockchain'}>
                <IconButton 
                  onClick={handleSyncBalances} 
                  disabled={syncing}
                  sx={{ color: 'white' }}
                >
                  {syncing ? <CircularProgress size={24} color="inherit" /> : <RefreshIcon />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Token Balances */}
      <Grid container spacing={3}>
        {/* USDT Balances */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  USDT Balances
                </Typography>
                <Chip 
                  label={formatCurrency(balances.usdt.total)}
                  color="primary"
                  variant="outlined"
                />
              </Box>
              
              <Grid container spacing={2}>
                {Object.entries(balances.usdt).map(([network, amount]) => {
                  if (network === 'total') return null
                  return (
                    <Grid item xs={12} key={network}>
                      <Box 
                        display="flex" 
                        justifyContent="space-between" 
                        alignItems="center"
                        p={1}
                        sx={{ 
                          backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50',
                          borderRadius: 1,
                          border: `2px solid ${getNetworkColor(network)}20`
                        }}
                      >
                        <Box display="flex" alignItems="center">
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: getNetworkColor(network),
                              mr: 1
                            }}
                          />
                          <Typography variant="body2" fontWeight="medium">
                            {getNetworkName(network)}
                          </Typography>
                        </Box>
                        <Typography variant="body2" fontWeight="bold">
                          {formatCurrency(amount)}
                        </Typography>
                      </Box>
                    </Grid>
                  )
                })}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* USDC Balances */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  USDC Balances
                </Typography>
                <Chip 
                  label={formatCurrency(balances.usdc.total)}
                  color="secondary"
                  variant="outlined"
                />
              </Box>
              
              <Grid container spacing={2}>
                {Object.entries(balances.usdc).map(([network, amount]) => {
                  if (network === 'total') return null
                  return (
                    <Grid item xs={12} key={network}>
                      <Box 
                        display="flex" 
                        justifyContent="space-between" 
                        alignItems="center"
                        p={1}
                        sx={{ 
                          backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50',
                          borderRadius: 1,
                          border: `2px solid ${getNetworkColor(network)}20`
                        }}
                      >
                        <Box display="flex" alignItems="center">
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: getNetworkColor(network),
                              mr: 1
                            }}
                          />
                          <Typography variant="body2" fontWeight="medium">
                            {getNetworkName(network)}
                          </Typography>
                        </Box>
                        <Typography variant="body2" fontWeight="bold">
                          {formatCurrency(amount)}
                        </Typography>
                      </Box>
                    </Grid>
                  )
                })}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Stats */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Quick Stats
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Box textAlign="center">
                <TrendingUpIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Networks Supported
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  3
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box textAlign="center">
                <WalletIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Tokens Supported
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  2
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box textAlign="center">
                <RefreshIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Last Sync
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  Now
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  )
}

export default WalletDashboard