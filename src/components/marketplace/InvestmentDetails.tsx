import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Avatar,
  useTheme,

  FormControl,
  Select,
  MenuItem,
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  AccountBalance as AccountBalanceIcon,
  Business as BusinessIcon,
  AttachMoney as AttachMoneyIcon,
  Phone as PhoneIcon,
  Language as LanguageIcon,
} from '@mui/icons-material'
import { DetailedInvestmentProduct } from '../../types/marketplace'
import { marketplaceService } from '../../services/marketplaceService'
import { useAuth } from '../../hooks/useAuth'
import TradingForm from './TradingForm'

interface InvestmentDetailsProps {
  productId: string
  onBack: () => void
  onTradeComplete?: () => void
}



const InvestmentDetails: React.FC<InvestmentDetailsProps> = ({ 
  productId, 
  onBack, 
  onTradeComplete 
}) => {
  const theme = useTheme()
  const { user } = useAuth()
  const [product, setProduct] = useState<DetailedInvestmentProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showTradingForm, setShowTradingForm] = useState(false)

  const loadProductDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await marketplaceService.getProductDetails(productId)
      setProduct(response.data.product)
    } catch (err) {
      console.error('Failed to load product details:', err)
      setError('Failed to load investment details. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProductDetails()
  }, [loadProductDetails, productId])


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`
  }

  const getProductIcon = (type: string) => {
    return type === 'REIT' ? <AccountBalanceIcon /> : <BusinessIcon />
  }

  const canTrade = user && user.kycStatus === 'approved' && product?.isAvailableForTrading

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  if (error || !product) {
    return (
      <Box>
        <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 2 }}>
          Back to Marketplace
        </Button>
        <Alert severity="error">
          {error || 'Investment product not found'}
        </Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: '100%', mx: 'auto', p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box mb={4}>
        <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 3 }}>
          Back to Marketplace
        </Button>
        
        <Box 
          display="flex" 
          flexDirection={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'flex-start', md: 'center' }} 
          justifyContent="space-between" 
          mb={3}
          gap={3}
        >
          <Box display="flex" alignItems="center">
            <Avatar
              sx={{
                width: { xs: 48, md: 64 },
                height: { xs: 48, md: 64 },
                bgcolor: theme.palette.primary.main,
                mr: { xs: 2, md: 3 },
              }}
            >
              {getProductIcon(product.type)}
            </Avatar>
            <Box>
              <Typography 
                variant="h4" 
                component="h1" 
                sx={{ 
                  fontWeight: 600, 
                  mb: 1,
                  fontSize: { xs: '1.5rem', md: '2.125rem' }
                }}
              >
                {product.name}
              </Typography>
              <Typography variant="h6" color="text.secondary">
                {product.symbol}
              </Typography>
            </Box>
          </Box>
          
          <Box 
            display="flex" 
            flexDirection={{ xs: 'column', sm: 'row' }}
            alignItems="center" 
            gap={2}
            width={{ xs: '100%', md: 'auto' }}
          >
            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 200 } }}>
              <Select
                value="Common 2 Share Class"
                displayEmpty
                sx={{
                  backgroundColor: theme.palette.background.paper,
                }}
              >
                <MenuItem value="Common 2 Share Class">Common 2 Share Class</MenuItem>
              </Select>
            </FormControl>
            
            {/* <Box display="flex" gap={2} width={{ xs: '100%', sm: 'auto' }}>
              <Button
                variant="contained"
                sx={{ 
                  minWidth: 80,
                  flex: { xs: 1, sm: 'none' },
                  backgroundColor: theme.palette.primary.main,
                }}
              >
                Buy
              </Button>
              
              <Button
                variant="outlined"
                sx={{ 
                  minWidth: 80,
                  flex: { xs: 1, sm: 'none' },
                }}
              >
                Sell
              </Button>
            </Box> */}
          </Box>
        </Box>
      </Box>

      {/* KYC Warning */}
      {user && user.kycStatus !== 'approved' && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Complete KYC verification to place orders for this investment.
        </Alert>
      )}

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Share Price
              </Typography>
              <Typography variant="h4">
                {formatCurrency(product.sharePrice)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                NAV: {formatCurrency(product.nav)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Market Cap
              </Typography>
              <Typography variant="h4">
                {formatCurrency(product.marketCap)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {product.totalShares.toLocaleString()} shares
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Availability
              </Typography>
              <Typography variant="h4">
                {formatPercentage(product.availabilityPercentage)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {product.availableShares.toLocaleString()} available
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Min Investment
              </Typography>
              <Typography variant="h4">
                {formatCurrency(product.minimumInvestment)}
              </Typography>
              {product.targetReturn && (
                <Typography variant="body2" color="success.main">
                  Target: {formatPercentage(product.targetReturn)}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Trading Button */}
      {canTrade && (
        <Box mb={3}>
          <Button
            variant="contained"
            size="large"
            startIcon={<AttachMoneyIcon />}
            onClick={() => setShowTradingForm(true)}
            disabled={!product.isAvailableForTrading}
          >
            Trade This Investment
          </Button>
        </Box>
      )}

      {/* Trading Form Modal/Panel */}
      {showTradingForm && (
        <Box mb={3}>
          <Card>
            <CardContent>
              <TradingForm
                product={product}
                onClose={() => setShowTradingForm(false)}
                onTradeComplete={() => {
                  setShowTradingForm(false)
                  onTradeComplete?.()
                }}
              />
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Overview Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
          Overview
        </Typography>
        
        {/* Overview Content */}
        <Grid container spacing={{ xs: 3, md: 4 }}>
          {/* Left Column - Key Metrics */}
          <Grid item xs={12} lg={6}>
            {/* Investment Stats */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                  Key Statistics
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Investments
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                      {product.overviewData?.totalInvestments || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Floating Rate
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                      {product.overviewData?.floatingRatePercentage ? `${product.overviewData.floatingRatePercentage}%` : 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total Value
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                      {product.overviewData?.totalValue ? formatCurrency(product.overviewData.totalValue) : 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Financial Metrics */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                  Financial Metrics
                </Typography>
                <Grid container spacing={{ xs: 2, md: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Total Assets
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {product.overviewData?.totalAssets ? formatCurrency(product.overviewData.totalAssets) : 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Net Asset Value (NAV)
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {formatCurrency(product.nav)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Total Liabilities
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {product.overviewData?.totalLiabilities ? formatCurrency(product.overviewData.totalLiabilities) : 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      NAV Per Share
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {product.overviewData?.navPerShare ? formatCurrency(product.overviewData.navPerShare) : formatCurrency(product.nav)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Distributions
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {product.distributionFrequency ? product.distributionFrequency.charAt(0).toUpperCase() + product.distributionFrequency.slice(1) : 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Target Return
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {product.targetReturn ? `${product.targetReturn}%` : 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      EPS
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {product.overviewData?.eps ? formatCurrency(product.overviewData.eps) : 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>


          </Grid>

          {/* Right Column - Description and Contact */}
          <Grid item xs={12} lg={6}>
            {/* Description Section */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Description
                </Typography>
                <Typography variant="body1" paragraph>
                  {product.description}
                </Typography>
                
                <Typography variant="body1" paragraph>
                  {product.strategy}
                </Typography>
              </CardContent>
            </Card>

            {/* Contact Information */}
            {(product.overviewData?.contactWebsite || product.overviewData?.contactPhone) && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Contact Information
                  </Typography>
                  {product.overviewData?.contactWebsite && (
                    <Box mb={2}>
                      <Button
                        variant="text"
                        startIcon={<LanguageIcon />}
                        sx={{ 
                          textTransform: 'none',
                          color: theme.palette.primary.main,
                          p: 0,
                          justifyContent: 'flex-start'
                        }}
                        onClick={() => window.open(product.overviewData?.contactWebsite, '_blank')}
                      >
                        {product.overviewData.contactWebsite}
                      </Button>
                    </Box>
                  )}
                  {product.overviewData?.contactPhone && (
                    <Box display="flex" alignItems="center">
                      <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {product.overviewData.contactPhone}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Sectors */}
            {product.sector && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Sector & Geography
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    <Chip label={product.sector} variant="outlined" />
                    {product.geography && <Chip label={product.geography} variant="outlined" />}
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Portfolio Allocation */}
            {(product.overviewData?.portfolioAllocation?.seniorSecuredLoans || 
              product.overviewData?.portfolioAllocation?.preferredEquity || 
              product.overviewData?.portfolioAllocation?.seniorSecuredBonds || 
              product.overviewData?.portfolioAllocation?.other) && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Portfolio Allocation
                  </Typography>
                  <Box display="flex" alignItems="center" justifyContent="center" height={{ xs: 150, md: 200 }} sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Portfolio allocation chart would go here
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={2}>
                    {product.overviewData?.portfolioAllocation?.seniorSecuredLoans && (
                      <Grid item xs={12} sm={6}>
                        <Box display="flex" alignItems="center">
                          <Box 
                            sx={{ 
                              width: 12, 
                              height: 12, 
                              bgcolor: '#8b5cf6', 
                              borderRadius: '50%', 
                              mr: 1 
                            }} 
                          />
                          <Typography variant="body2" sx={{ flexGrow: 1 }}>Senior Secured Loans</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {product.overviewData.portfolioAllocation.seniorSecuredLoans}%
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                    {product.overviewData?.portfolioAllocation?.preferredEquity && (
                      <Grid item xs={12} sm={6}>
                        <Box display="flex" alignItems="center">
                          <Box 
                            sx={{ 
                              width: 12, 
                              height: 12, 
                              bgcolor: '#a855f7', 
                              borderRadius: '50%', 
                              mr: 1 
                            }} 
                          />
                          <Typography variant="body2" sx={{ flexGrow: 1 }}>Preferred Equity</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {product.overviewData.portfolioAllocation.preferredEquity}%
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                    {product.overviewData?.portfolioAllocation?.seniorSecuredBonds && (
                      <Grid item xs={12} sm={6}>
                        <Box display="flex" alignItems="center">
                          <Box 
                            sx={{ 
                              width: 12, 
                              height: 12, 
                              bgcolor: '#7c3aed', 
                              borderRadius: '50%', 
                              mr: 1 
                            }} 
                          />
                          <Typography variant="body2" sx={{ flexGrow: 1 }}>Senior Secured Bonds</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {product.overviewData.portfolioAllocation.seniorSecuredBonds}%
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                    {product.overviewData?.portfolioAllocation?.other && (
                      <Grid item xs={12} sm={6}>
                        <Box display="flex" alignItems="center">
                          <Box 
                            sx={{ 
                              width: 12, 
                              height: 12, 
                              bgcolor: '#06b6d4', 
                              borderRadius: '50%', 
                              mr: 1 
                            }} 
                          />
                          <Typography variant="body2" sx={{ flexGrow: 1 }}>Other</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {product.overviewData.portfolioAllocation.other}%
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            )}
        </Grid>
        </Grid>
      </Box>
    </Box>
  )
}

export default InvestmentDetails