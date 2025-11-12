import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  LinearProgress,
  useTheme,
  Alert,
  CircularProgress,
} from '@mui/material'
import {
  People as UsersIcon,
  Store as ProductsIcon,
  TrendingUp as VolumeIcon,
  Assignment as KYCIcon,
  PersonAdd as NewUserIcon,
  ShoppingCart as InvestmentIcon,
  Warning as AlertIcon,
  AccountBalance as RevenueIcon,
} from '@mui/icons-material'
import { adminService } from '../services/adminService'
import { AdminStats } from '../types/admin'

const AdminDashboard: React.FC = () => {
  const theme = useTheme()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [systemSummary, setSystemSummary] = useState<any>(null)
  const [revenueData, setRevenueData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load admin dashboard data
      const summaryResponse = await adminService.getSystemSummary()
      setSystemSummary(summaryResponse.data)

      const revenueResponse = await adminService.getRevenueReport('daily')
      setRevenueData(revenueResponse.data)

      const transactionsResponse = await adminService.getTransactions({
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      })

      // Transform data into AdminStats format
      const transformedStats: AdminStats = {
        totalUsers: summaryResponse.data.users?.total || 0,
        totalInvestments: transactionsResponse.data.summary?.byType?.buy?.count || 0,
        totalVolume: transactionsResponse.data.summary?.totalVolume || 0,
        pendingKYC: summaryResponse.data.users?.pendingKYC || 0,
        activeProducts: summaryResponse.data.platform?.activeProducts || 0,
        recentActivity: transactionsResponse.data.transactions.map((tx: any) => ({
          id: tx.id,
          type: tx.type === 'buy' ? 'investment' : tx.type,
          description: `${tx.type.charAt(0).toUpperCase() + tx.type.slice(1)} transaction: ${tx.productName || tx.type}`,
          userId: tx.userId,
          userEmail: tx.userEmail,
          amount: tx.amount,
          timestamp: tx.createdAt,
          severity: tx.amount > 100000 ? 'high' : tx.amount > 10000 ? 'medium' : 'low'
        }))
      }

      setStats(transformedStats)
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err)
      setError('Failed to load dashboard data. Please try refreshing the page.')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration': return <NewUserIcon />
      case 'investment': 
      case 'buy':
      case 'sell': return <InvestmentIcon />
      case 'kyc_submission': return <KYCIcon />
      case 'system_alert': return <AlertIcon />
      case 'product_creation': return <ProductsIcon />
      case 'deposit':
      case 'withdrawal': return <VolumeIcon />
      default: return <AlertIcon />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'error'
      case 'medium': return 'warning'
      case 'low': return 'success'
      default: return 'default'
    }
  }

  // Show loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  // Show error state
  if (!stats) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load dashboard data. Please try refreshing the page.
        </Alert>
      </Box>
    )
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: <UsersIcon />,
      color: theme.palette.primary.main,
      change: systemSummary?.users?.growth || '+12%'
    },
    {
      title: 'Active Products',
      value: stats.activeProducts.toString(),
      icon: <ProductsIcon />,
      color: theme.palette.success.main,
      change: systemSummary?.platform?.productGrowth || '+2'
    },
    {
      title: 'Total Volume',
      value: formatCurrency(stats.totalVolume),
      icon: <VolumeIcon />,
      color: theme.palette.info.main,
      change: systemSummary?.transactions?.volumeGrowth || '+8.5%'
    },
    {
      title: 'Pending KYC',
      value: stats.pendingKYC.toString(),
      icon: <KYCIcon />,
      color: theme.palette.warning.main,
      change: systemSummary?.users?.kycGrowth || '-3'
    }
  ]

  return (
    <Box>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Overview of platform activity and key metrics
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Avatar
                    sx={{
                      bgcolor: card.color,
                      width: 48,
                      height: 48,
                    }}
                  >
                    {card.icon}
                  </Avatar>
                  <Chip
                    label={card.change}
                    size="small"
                    color={card.change.startsWith('+') ? 'success' : 'error'}
                    variant="outlined"
                  />
                </Box>
                <Typography variant="h4" component="div" sx={{ fontWeight: 600, mb: 1 }}>
                  {card.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {card.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Activity */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 3 }}>
                Recent Activity
              </Typography>
              
              {loading ? (
                <LinearProgress />
              ) : (
                <List>
                  {stats.recentActivity.map((activity, index) => (
                    <ListItem
                      key={activity.id}
                      sx={{
                        borderBottom: index < stats.recentActivity.length - 1 ? '1px solid' : 'none',
                        borderColor: 'divider',
                        px: 0,
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            bgcolor: `${getSeverityColor(activity.severity || 'low')}.main`,
                            width: 40,
                            height: 40,
                          }}
                        >
                          {getActivityIcon(activity.type)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={activity.description}
                        secondary={
                          <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                            <Typography variant="caption" color="text.secondary">
                              {formatTimeAgo(activity.timestamp)}
                            </Typography>
                            {activity.amount && (
                              <Chip
                                label={formatCurrency(activity.amount)}
                                size="small"
                                variant="outlined"
                                color="primary"
                              />
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 3 }}>
                System Status
              </Typography>
              
              <Box mb={3}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2">Server Health</Typography>
                  <Chip 
                    label={systemSummary?.platform?.serverHealth?.status || "Healthy"} 
                    color="success" 
                    size="small" 
                  />
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={systemSummary?.platform?.serverHealth?.percentage || 95} 
                  color="success" 
                />
              </Box>

              <Box mb={3}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2">Database Performance</Typography>
                  <Chip 
                    label={systemSummary?.platform?.database?.status || "Good"} 
                    color="primary" 
                    size="small" 
                  />
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={systemSummary?.platform?.database?.performance || 87} 
                  color="primary" 
                />
              </Box>

              <Box mb={3}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2">API Response Time</Typography>
                  <Chip 
                    label={systemSummary?.platform?.api?.status || "Fast"} 
                    color="success" 
                    size="small" 
                  />
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={systemSummary?.platform?.api?.responseTime || 92} 
                  color="success" 
                />
              </Box>

              <Box mb={3}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2">Storage Usage</Typography>
                  <Chip 
                    label={systemSummary?.platform?.storage?.status || "Normal"} 
                    color="warning" 
                    size="small" 
                  />
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={systemSummary?.platform?.storage?.usage || 68} 
                  color="warning" 
                />
              </Box>

              {/* Revenue Summary */}
              {revenueData && (
                <Box>
                  <Typography variant="body2" sx={{ mb: 2, fontWeight: 600 }}>
                    Today's Revenue
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <RevenueIcon color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {formatCurrency(revenueData.today?.total || 0)}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {revenueData.today?.growth || '+5.2%'} from yesterday
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default AdminDashboard