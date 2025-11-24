import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  Divider,
  InputAdornment,
  Switch,
  FormControlLabel,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
} from '@mui/material'
import {
  TrendingUp as BuyIcon,
  TrendingDown as SellIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material'
import { InvestmentProduct } from '../../types/marketplace'
import { OrderRequest } from '../../types/trading'
import { tradingService } from '../../services/tradingService'
import { useAuth } from '../../hooks/useAuth'

interface TradingFormProps {
  product: InvestmentProduct
  onClose: () => void
  onTradeComplete: () => void
}

const TradingForm: React.FC<TradingFormProps> = ({ product, onClose, onTradeComplete }) => {
  const { user } = useAuth()
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy')
  const [orderMethod, setOrderMethod] = useState<'market' | 'limit'>('limit')
  const [quantity, setQuantity] = useState<number>(1)
  const [pricePerShare, setPricePerShare] = useState<number>(product.sharePrice)
  const [useExpiration, setUseExpiration] = useState(false)
  const [expirationDate, setExpirationDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [validation, setValidation] = useState<{
    valid: boolean
    errors: string[]
    warnings: string[]
  }>({ valid: true, errors: [], warnings: [] })

  useEffect(() => {
    validateOrder()
  }, [orderType, orderMethod, quantity, pricePerShare, expirationDate])

  useEffect(() => {
    // Set default expiration to 30 days from now
    const defaultExpiry = new Date()
    defaultExpiry.setDate(defaultExpiry.getDate() + 30)
    setExpirationDate(defaultExpiry.toISOString().split('T')[0])
  }, [])

  const validateOrder = async () => {
    if (quantity <= 0 || pricePerShare <= 0) {
      setValidation({ valid: false, errors: [], warnings: [] })
      return
    }

    const orderRequest: OrderRequest = {
      productId: product.id,
      type: orderType,
      orderType: orderMethod,
      quantity,
      pricePerShare,
      expiresAt: useExpiration ? expirationDate : undefined,
    }

    const result = await tradingService.validateOrder(orderRequest)
    setValidation(result)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validation.valid) {
      setError('Please fix validation errors before submitting')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const orderRequest: OrderRequest = {
        productId: product.id,
        type: orderType,
        orderType: orderMethod,
        quantity,
        pricePerShare,
        expiresAt: useExpiration ? expirationDate : undefined,
      }

      const response = await tradingService.placeOrder(orderRequest)
      
      if (response.success) {
        setSuccess(`${orderType === 'buy' ? 'Buy' : 'Sell'} order placed successfully!`)
        setTimeout(() => {
          onTradeComplete()
        }, 2000)
      } else {
        setError('Failed to place order. Please try again.')
      }
    } catch (err: any) {
      console.error('Failed to place order:', err)
      setError(err.response?.data?.message || 'Failed to place order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const totalAmount = quantity * pricePerShare
  const estimatedFees = totalAmount * 0.01 // Assume 1% fee for estimation
  const totalCost = orderType === 'buy' ? totalAmount + estimatedFees : totalAmount - estimatedFees

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const getMinimumShares = () => {
    return Math.ceil(product.minimumInvestment / pricePerShare)
  }

  const canTrade = user?.kycStatus === 'approved'

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          Trade {product.name}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<CloseIcon />}
          onClick={onClose}
        >
          Close
        </Button>
      </Box>

      {!canTrade && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          KYC verification is required to place orders.
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} icon={<CheckCircleIcon />}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Order Type Selection */}
          <Grid item xs={12}>
            <Box display="flex" gap={2}>
              <Button
                variant={orderType === 'buy' ? 'contained' : 'outlined'}
                color="success"
                startIcon={<BuyIcon />}
                onClick={() => setOrderType('buy')}
                fullWidth
                size="large"
              >
                Buy
              </Button>
              <Button
                variant={orderType === 'sell' ? 'contained' : 'outlined'}
                color="error"
                startIcon={<SellIcon />}
                onClick={() => setOrderType('sell')}
                fullWidth
                size="large"
              >
                Sell
              </Button>
            </Box>
          </Grid>

          {/* Order Method */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Order Type</InputLabel>
              <Select
                value={orderMethod}
                label="Order Type"
                onChange={(e) => setOrderMethod(e.target.value as 'market' | 'limit')}
              >
                <MenuItem value="limit">Limit Order</MenuItem>
                <MenuItem value="market">Market Order</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Quantity */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              inputProps={{ 
                min: 1, 
                step: 1,
                max: orderType === 'buy' ? product.availableShares : undefined
              }}
              helperText={`Min: ${getMinimumShares()} shares (${formatCurrency(product.minimumInvestment)})`}
            />
          </Grid>

          {/* Price Per Share */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Price Per Share"
              type="number"
              value={pricePerShare}
              onChange={(e) => setPricePerShare(parseFloat(e.target.value) || 0)}
              disabled={orderMethod === 'market'}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              inputProps={{ 
                min: 0.01, 
                step: 0.01 
              }}
              helperText={orderMethod === 'market' ? 'Market price will be used' : `Current: ${formatCurrency(product.sharePrice)}`}
            />
          </Grid>

          {/* Expiration */}
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={useExpiration}
                  onChange={(e) => setUseExpiration(e.target.checked)}
                />
              }
              label="Set Expiration Date"
            />
            {useExpiration && (
              <TextField
                fullWidth
                label="Expiration Date"
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  min: new Date().toISOString().split('T')[0],
                }}
                sx={{ mt: 1 }}
              />
            )}
          </Grid>

          {/* Order Summary */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Order Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Order Type
                    </Typography>
                    <Chip
                      label={`${orderType.toUpperCase()} ${orderMethod.toUpperCase()}`}
                      color={orderType === 'buy' ? 'success' : 'error'}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Quantity
                    </Typography>
                    <Typography variant="body1">
                      {quantity.toLocaleString()} shares
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Price Per Share
                    </Typography>
                    <Typography variant="body1">
                      {formatCurrency(pricePerShare)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Total Amount
                    </Typography>
                    <Typography variant="body1">
                      {formatCurrency(totalAmount)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Estimated Fees
                    </Typography>
                    <Typography variant="body1">
                      {formatCurrency(estimatedFees)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      {orderType === 'buy' ? 'Total Cost' : 'Net Proceeds'}
                    </Typography>
                    <Typography variant="h6" color={orderType === 'buy' ? 'error.main' : 'success.main'}>
                      {formatCurrency(totalCost)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Validation Messages */}
          {(validation.errors.length > 0 || validation.warnings.length > 0) && (
            <Grid item xs={12}>
              {validation.errors.length > 0 && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Please fix the following errors:
                  </Typography>
                  <List dense>
                    {validation.errors.map((error, index) => (
                      <ListItem key={index} sx={{ py: 0 }}>
                        <ListItemText primary={error} />
                      </ListItem>
                    ))}
                  </List>
                </Alert>
              )}
              
              {validation.warnings.length > 0 && (
                <Alert severity="warning" icon={<WarningIcon />}>
                  <Typography variant="subtitle2" gutterBottom>
                    Please review:
                  </Typography>
                  <List dense>
                    {validation.warnings.map((warning, index) => (
                      <ListItem key={index} sx={{ py: 0 }}>
                        <ListItemText primary={warning} />
                      </ListItem>
                    ))}
                  </List>
                </Alert>
              )}
            </Grid>
          )}

          {/* Submit Button */}
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={!canTrade || !validation.valid || loading || !!success}
              color={orderType === 'buy' ? 'success' : 'error'}
              startIcon={loading ? <CircularProgress size={20} /> : (orderType === 'buy' ? <BuyIcon /> : <SellIcon />)}
            >
              {loading ? 'Placing Order...' : `Place ${orderType === 'buy' ? 'Buy' : 'Sell'} Order`}
            </Button>
          </Grid>
        </Grid>
      </form>

      {/* Product Info */}
      <Box mt={3}>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Product Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Available Shares
            </Typography>
            <Typography variant="body1">
              {product.availableShares.toLocaleString()}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Current Price
            </Typography>
            <Typography variant="body1">
              {formatCurrency(product.sharePrice)}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Minimum Investment
            </Typography>
            <Typography variant="body1">
              {formatCurrency(product.minimumInvestment)}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Management Fee
            </Typography>
            <Typography variant="body1">
              {product.fees.managementFee.toFixed(2)}% annually
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}

export default TradingForm