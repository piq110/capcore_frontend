import React, { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Button,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  useTheme
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  Download,
  Refresh,
  PieChart,
  Timeline,
  Receipt
} from '@mui/icons-material'
import { portfolioService } from '../services/portfolioService'
import { walletService } from '../services/walletService'
import { tradingService } from '../services/tradingService'
import { PortfolioSummary } from '../types/portfolio'
import { MultiChainBalances } from '../types/wallet'
import PortfolioChart from '../components/portfolio/PortfolioChart'
import TransactionHistory from '../components/portfolio/TransactionHistory'
import AllocationChart from '../components/portfolio/AllocationChart'
import StatementGenerator from '../components/portfolio/StatementGenerator'
import InfoBar from '../components/common/InfoBar'
import { useNotification } from '../hooks/useNotification'
import { 
  calculatePortfolioTotals, 
  formatCurrency, 
  formatPercentage, 
  getPnLColor,
  CalculatedPortfolioSummary 
} from '../utils/portfolioCalculations'

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
      id={`portfolio-tabpanel-${index}`}
      aria-labelledby={`portfolio-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

const Portfolio: React.FC = () => {
  const theme = useTheme()
  const { showSuccess } = useNotification()
  const [rawPortfolio, setRawPortfolio] = useState<PortfolioSummary | null>(null)
  const [walletBalance, setWalletBalance] = useState<MultiChainBalances | null>(null)
  const [activeOrdersCount, setActiveOrdersCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tabValue, setTabValue] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const [showStatementDialog, setShowStatementDialog] = useState(false)

  // Calculate portfolio with real-time PnL
  const portfolio: CalculatedPortfolioSummary | null = useMemo(() => {
    if (!rawPortfolio) return null
    return calculatePortfolioTotals(rawPortfolio)
  }, [rawPortfolio])

  const fetchPortfolio = async () => {
    try {
      setError(null)
      const response = await portfolioService.getPortfolio()
      setRawPortfolio(response.data.portfolio)
    } catch (err: unknown) {
      let errorMessage = 'Failed to load portfolio'
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response?: { data?: { message?: string } } }).response
        errorMessage = response?.data?.message || errorMessage
      }
      setError(errorMessage)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const fetchWalletBalance = async () => {
    try {
      const response = await walletService.getWalletBalances()
      setWalletBalance(response.data)
    } catch (err) {
      console.error('Failed to fetch wallet balance:', err)
      // Don't set error state for wallet balance failure
    }
  }

  const fetchActiveOrders = async () => {
    try {
      const response = await tradingService.getOrders({ status: 'pending' })
      setActiveOrdersCount(response.data.orders.length)
    } catch (err) {
      console.error('Failed to fetch active orders:', err)
      // Don't set error state for orders failure
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      // First cleanup any NaN values
      await portfolioService.cleanupPortfolio()
      
      // Then consolidate duplicates and update prices
      const consolidateResult = await portfolioService.consolidatePortfolio()
      
      // Then fetch the updated data
      await Promise.all([
        fetchPortfolio(),
        fetchWalletBalance(),
        fetchActiveOrders()
      ])
      
      if (!error) {
        try {
          const message = consolidateResult.data?.duplicatesRemoved > 0 
            ? `Portfolio refreshed! Consolidated ${consolidateResult.data.duplicatesRemoved} duplicate holdings.`
            : 'Portfolio refreshed with latest prices!'
          showSuccess(message, { duration: 3000 })
        } catch (err) {
          console.error('Error showing success notification:', err)
        }
      }
    } catch (err) {
      console.error('Error refreshing portfolio:', err)
      try {
        // If consolidation fails, try just fetching the data
        await Promise.all([
          fetchPortfolio(),
          fetchWalletBalance(),
          fetchActiveOrders()
        ])
        showSuccess('Portfolio data refreshed!', { duration: 2000 })
      } catch (fetchErr) {
        console.error('Error fetching portfolio after failed refresh:', fetchErr)
      }
      setRefreshing(false)
    }
  }

  const handleExportHoldings = async () => {
    if (portfolio?.holdings) {
      await portfolioService.exportHoldingsToCsv(
        portfolio.holdings,
        `portfolio-holdings-${new Date().toISOString().split('T')[0]}.csv`
      )
    }
  }

  const handleStatementGenerated = (statementId: string) => {
    console.log('Statement generated:', statementId)
    try {
      showSuccess('Statement generated successfully!', { 
        title: 'Success',
        duration: 5000,
        collapsible: true 
      })
    } catch (err) {
      console.error('Error showing success notification:', err)
    }
  }





  useEffect(() => {
    const fetchAllData = async () => {
      await Promise.all([
        fetchPortfolio(),
        fetchWalletBalance(),
        fetchActiveOrders()
      ])
    }
    fetchAllData()
  }, [])

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Portfolio
        </Typography>
        <InfoBar
          message={error}
          severity="error"
          closable={true}
        />
        <Button variant="contained" onClick={fetchPortfolio}>
          Retry
        </Button>
      </Box>
    )
  }

  if (!portfolio || portfolio.holdings.length === 0) {
    return (
      <Box>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Portfolio & Dashboard
          </Typography>
          <Box>
            <Tooltip title="Refresh Portfolio">
              <IconButton onClick={handleRefresh} disabled={refreshing}>
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>


        
        <InfoBar
          title="Welcome to Your Portfolio"
          message="Your investment portfolio will appear here once you make your first investment."
          severity="info"
          closable={true}
          collapsible={true}
          actions={[
            {
              label: 'Browse Marketplace',
              onClick: () => window.location.href = '/marketplace',
              variant: 'contained',
              color: 'primary',
              size: 'small',
            },
            {
              label: 'Learn More',
              onClick: () => alert('Opening investment guide...'),
              variant: 'outlined',
              color: 'primary',
              size: 'small',
            },
          ]}
        />

        {/* Dashboard Cards for Empty State */}
        <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4, mb: 2 }}>
          Account Overview
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Portfolio Value
                </Typography>
                <Typography variant="h4" color="primary">
                  $0.00
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Complete KYC to start investing
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Wallet Balance
                </Typography>
                <Typography variant="h4" color="primary">
                  {walletBalance ? `$${walletBalance.totalUSD.toLocaleString()}` : '$0.00'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {walletBalance && walletBalance.totalUSD > 0 ? 'Available for trading' : 'Deposit funds to start trading'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Active Orders
                </Typography>
                <Typography variant="h4" color="primary">
                  {activeOrdersCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {activeOrdersCount === 0 ? 'No active orders' : `${activeOrdersCount} pending order${activeOrdersCount > 1 ? 's' : ''}`}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Typography variant="body1" color="text.secondary">
          Start building your alternative investment portfolio by browsing available REITs and BDCs in the marketplace.
        </Typography>
      </Box>
    )
  }

  const getPnLIcon = (pnl: number) => {
    return pnl >= 0 ? <TrendingUp /> : <TrendingDown />
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Portfolio & Dashboard
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <Button
            variant="contained"
            startIcon={refreshing ? <CircularProgress size={16} /> : <Refresh />}
            onClick={handleRefresh}
            disabled={refreshing}
            size="small"
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Tooltip title="Export Holdings">
            <IconButton onClick={handleExportHoldings}>
              <Download />
            </IconButton>
          </Tooltip>
          <Tooltip title="Generate Statement">
            <IconButton onClick={() => setShowStatementDialog(true)}>
              <Receipt />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>



      {/* Portfolio Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Total Value
              </Typography>
              <Typography variant="h5" component="div">
                {formatCurrency(portfolio.totalValue)}
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                {getPnLIcon(portfolio.totalPnL)}
                <Typography 
                  variant="body2" 
                  sx={{ color: getPnLColor(portfolio.totalPnL, theme), ml: 0.5 }}
                >
                  {formatPercentage(portfolio.totalPnLPercentage)} total return
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Total Invested
              </Typography>
              <Typography variant="h5" component="div">
                {formatCurrency(portfolio.totalInvested)}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Cost basis
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Total P&L
              </Typography>
              <Typography 
                variant="h5" 
                component="div"
                sx={{ color: getPnLColor(portfolio.totalPnL, theme) }}
              >
                {formatCurrency(portfolio.totalPnL)}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ color: getPnLColor(portfolio.totalPnL, theme), mt: 1 }}
              >
                {formatPercentage(portfolio.totalPnLPercentage)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Holdings
              </Typography>
              <Typography variant="h5" component="div">
                {portfolio.holdings.length}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Investments
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>


      <Grid container spacing={3} sx={{ mb: 4 }}>


        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Wallet Balance
              </Typography>
              <Typography variant="h4" color="primary">
                {walletBalance ? `$${walletBalance.totalUSD.toLocaleString()}` : '$0.00'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {walletBalance && walletBalance.totalUSD > 0 ? 'Available for trading' : 'Deposit funds to start trading'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Active Orders
              </Typography>
              <Typography variant="h4" color="primary">
                {activeOrdersCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {activeOrdersCount === 0 ? 'No active orders' : `${activeOrdersCount} pending order${activeOrdersCount > 1 ? 's' : ''}`}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="portfolio tabs">
          <Tab label="Holdings" icon={<PieChart />} iconPosition="start" />
          <Tab label="Performance" icon={<Timeline />} iconPosition="start" />
          <Tab label="Transactions" icon={<Download />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Holdings Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Current Holdings
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Investment</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                        <TableCell align="right">Avg Cost</TableCell>
                        <TableCell align="right">Current Value</TableCell>
                        <TableCell align="right">P&L</TableCell>
                        <TableCell align="right">P&L %</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {portfolio.holdings.map((holding) => (
                        <TableRow key={holding.id}>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {holding.product.name}
                              </Typography>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="caption" color="textSecondary">
                                  {holding.product.symbol}
                                </Typography>
                                <Chip 
                                  label={holding.product.type} 
                                  size="small" 
                                  variant="outlined"
                                />
                                <Typography variant="caption" color="primary">
                                  ${holding.product.sharePrice}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            {holding.quantity.toLocaleString()}
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(holding.averageCost)}
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="medium">
                              {formatCurrency(holding.currentValue)}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {holding.quantity} × ${holding.product.sharePrice}
                            </Typography>
                          </TableCell>
                          <TableCell 
                            align="right"
                            sx={{ color: getPnLColor(holding.unrealizedPnL, theme) }}
                          >
                            {formatCurrency(holding.unrealizedPnL)}
                          </TableCell>
                          <TableCell 
                            align="right"
                            sx={{ color: getPnLColor(holding.unrealizedPnL, theme) }}
                          >
                            {formatPercentage(holding.unrealizedPnLPercentage)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={4}>
            <AllocationChart 
              assetAllocation={portfolio.assetAllocation}
              sectorAllocation={portfolio.sectorAllocation}
            />
          </Grid>
        </Grid>
      </TabPanel>

      {/* Performance Tab */}
      <TabPanel value={tabValue} index={1}>
        <PortfolioChart />
      </TabPanel>

      {/* Transactions Tab */}
      <TabPanel value={tabValue} index={2}>
        <TransactionHistory />
      </TabPanel>

      {/* Last Updated */}
      <Box mt={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" color="textSecondary">
            Last updated: {new Date(portfolio.updatedAt).toLocaleString()}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh Prices'}
          </Button>
        </Box>
      </Box>

      {/* Statement Generator Dialog */}
      <StatementGenerator
        open={showStatementDialog}
        onClose={() => setShowStatementDialog(false)}
        onGenerated={handleStatementGenerated}
      />
    </Box>
  )
}

export default Portfolio