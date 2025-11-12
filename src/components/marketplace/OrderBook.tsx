import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material'
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material'
import { OrderBook as OrderBookType, RecentTrade } from '../../types/trading'
import { tradingService } from '../../services/tradingService'

interface OrderBookProps {
  productId: string
  productName: string
  productSymbol: string
}

const OrderBook: React.FC<OrderBookProps> = ({ productId, productSymbol }) => {
  const [orderBook, setOrderBook] = useState<OrderBookType | null>(null)
  const [recentTrades, setRecentTrades] = useState<RecentTrade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const loadOrderBook = useCallback(async () => {
    try {
      const response = await tradingService.getOrderBook(productId, 10)
      setOrderBook(response.data.orderBook)
      setError(null)
    } catch (err) {
      console.error('Failed to load order book:', err)
      setError('Failed to load order book')
    }
  }, [productId])

  const loadRecentTrades = useCallback(async () => {
    try {
      const response = await tradingService.getRecentTrades(productId, 20)
      setRecentTrades(response.data.trades)
    } catch (err) {
      console.error('Failed to load recent trades:', err)
    }
  }, [productId])

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([loadOrderBook(), loadRecentTrades()])
      setLoading(false)
      setLastUpdate(new Date())
    }

    loadData()

    // Set up real-time subscriptions
    const unsubscribeOrderBook = tradingService.subscribeToOrderBook(productId, (newOrderBook) => {
      setOrderBook(newOrderBook)
      setLastUpdate(new Date())
    })

    const unsubscribeTrades = tradingService.subscribeToTrades(productId, (newTrades) => {
      setRecentTrades(newTrades)
      setLastUpdate(new Date())
    })

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribeOrderBook()
      unsubscribeTrades()
    }
  }, [productId, loadOrderBook, loadRecentTrades])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
    )
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">
          Order Book - {productSymbol}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Order Book */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Book
              </Typography>
              
              {orderBook && (
                <Box>
                  {/* Market Summary */}
                  <Box mb={2} p={2} bgcolor="grey.50" borderRadius={1}>
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">
                          Spread
                        </Typography>
                        <Typography variant="h6">
                          {formatCurrency(orderBook.spread)}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">
                          Mid Price
                        </Typography>
                        <Typography variant="h6">
                          {formatCurrency(orderBook.midPrice)}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">
                          Total Orders
                        </Typography>
                        <Typography variant="h6">
                          {orderBook.bids.length + orderBook.asks.length}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>

                  <Grid container spacing={2}>
                    {/* Asks (Sell Orders) */}
                    <Grid item xs={6}>
                      <Typography variant="subtitle1" color="error.main" gutterBottom>
                        <TrendingDownIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Asks (Sell)
                      </Typography>
                      <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300 }}>
                        <Table size="small" stickyHeader>
                          <TableHead>
                            <TableRow>
                              <TableCell>Price</TableCell>
                              <TableCell align="right">Quantity</TableCell>
                              <TableCell align="right">Orders</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {orderBook.asks.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={3} align="center">
                                  <Typography variant="body2" color="text.secondary">
                                    No sell orders
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ) : (
                              orderBook.asks
                                .sort((a, b) => a.price - b.price) // Lowest price first
                                .map((ask, index) => (
                                  <TableRow key={index} hover>
                                    <TableCell>
                                      <Typography variant="body2" color="error.main">
                                        {formatCurrency(ask.price)}
                                      </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                      {ask.quantity.toLocaleString()}
                                    </TableCell>
                                    <TableCell align="right">
                                      {ask.orders}
                                    </TableCell>
                                  </TableRow>
                                ))
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>

                    {/* Bids (Buy Orders) */}
                    <Grid item xs={6}>
                      <Typography variant="subtitle1" color="success.main" gutterBottom>
                        <TrendingUpIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Bids (Buy)
                      </Typography>
                      <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300 }}>
                        <Table size="small" stickyHeader>
                          <TableHead>
                            <TableRow>
                              <TableCell>Price</TableCell>
                              <TableCell align="right">Quantity</TableCell>
                              <TableCell align="right">Orders</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {orderBook.bids.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={3} align="center">
                                  <Typography variant="body2" color="text.secondary">
                                    No buy orders
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ) : (
                              orderBook.bids
                                .sort((a, b) => b.price - a.price) // Highest price first
                                .map((bid, index) => (
                                  <TableRow key={index} hover>
                                    <TableCell>
                                      <Typography variant="body2" color="success.main">
                                        {formatCurrency(bid.price)}
                                      </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                      {bid.quantity.toLocaleString()}
                                    </TableCell>
                                    <TableCell align="right">
                                      {bid.orders}
                                    </TableCell>
                                  </TableRow>
                                ))
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Trades */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Trades
              </Typography>
              
              {recentTrades.length === 0 ? (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                  No recent trades
                </Typography>
              ) : (
                <TableContainer sx={{ maxHeight: 400 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Time</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell align="right">Qty</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentTrades.map((trade, index) => (
                        <TableRow key={trade.id || index} hover>
                          <TableCell>
                            <Typography variant="body2">
                              {formatTime(trade.timestamp)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography 
                              variant="body2" 
                              color={trade.side === 'buy' ? 'success.main' : 'error.main'}
                            >
                              {formatCurrency(trade.price)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Box display="flex" alignItems="center" justifyContent="flex-end">
                              <Typography variant="body2">
                                {trade.quantity.toLocaleString()}
                              </Typography>
                              <Chip
                                label={trade.side.toUpperCase()}
                                size="small"
                                color={trade.side === 'buy' ? 'success' : 'error'}
                                sx={{ ml: 1, minWidth: 40, fontSize: '0.7rem' }}
                              />
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default OrderBook