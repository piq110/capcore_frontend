import React, { useState, useEffect } from 'react'
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  Pagination,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material'
import { adminService } from '../../services/adminService'
import { useNotification } from '../../hooks/useNotification'

interface Order {
  id: string
  user: {
    _id: string
    email: string
  }
  product: {
    _id: string
    name: string
    symbol: string
  }
  type: 'buy' | 'sell'
  orderType: 'market' | 'limit'
  quantity: number
  pricePerShare: number
  totalAmount: number
  status: 'pending' | 'filled' | 'partially_filled' | 'cancelled' | 'rejected'
  filledQuantity: number
  remainingQuantity: number
  averageFillPrice: number
  fees: number
  expiresAt?: string
  filledAt?: string
  cancelledAt?: string
  rejectionReason?: string
  createdAt: string
  updatedAt: string
}

interface OrderFilters {
  status?: 'pending' | 'filled' | 'partially_filled' | 'cancelled' | 'rejected'
  type?: 'buy' | 'sell'
  userId?: string
  productId?: string
  startDate?: string
  endDate?: string
}

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState<OrderFilters>({})
  const [showFilters, setShowFilters] = useState(false)
  
  // Dialog states
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    order: Order | null
    type: 'confirm' | 'reject'
  }>({
    open: false,
    order: null,
    type: 'confirm'
  })
  
  const [confirmData, setConfirmData] = useState({
    fillPrice: '',
    reason: '',
    notes: ''
  })

  const { showNotification } = useNotification()

  const limit = 20

  useEffect(() => {
    loadOrders()
  }, [page, filters])

  const loadOrders = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await adminService.getOrders({
        limit,
        offset: (page - 1) * limit,
        ...filters,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      })

      if (response.success) {
        setOrders(response.data.orders)
        setTotalPages(Math.ceil(response.data.pagination.total / limit))
      } else {
        setError('Failed to load orders')
      }
    } catch (err: any) {
      console.error('Failed to load orders:', err)
      setError(err.response?.data?.message || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmOrder = async () => {
    if (!confirmDialog.order) return

    try {
      const data: any = {
        notes: confirmData.notes
      }
      
      if (confirmData.fillPrice) {
        data.fillPrice = parseFloat(confirmData.fillPrice)
      }

      const response = await adminService.confirmOrder(confirmDialog.order.id, data)
      
      if (response.success) {
        showNotification('Order confirmed successfully', { severity: 'success' })
        setConfirmDialog({ open: false, order: null, type: 'confirm' })
        setConfirmData({ fillPrice: '', reason: '', notes: '' })
        loadOrders()
      } else {
        showNotification(response.message || 'Failed to confirm order', { severity: 'error' })
      }
    } catch (err: any) {
      console.error('Failed to confirm order:', err)
      showNotification(err.response?.data?.message || 'Failed to confirm order', { severity: 'error' })
    }
  }

  const handleRejectOrder = async () => {
    if (!confirmDialog.order || !confirmData.reason.trim()) return

    try {
      const response = await adminService.rejectOrder(confirmDialog.order.id, {
        reason: confirmData.reason,
        notes: confirmData.notes
      })
      
      if (response.success) {
        showNotification('Order rejected successfully', { severity: 'success' })
        setConfirmDialog({ open: false, order: null, type: 'reject' })
        setConfirmData({ fillPrice: '', reason: '', notes: '' })
        loadOrders()
      } else {
        showNotification(response.message || 'Failed to reject order', { severity: 'error' })
      }
    } catch (err: any) {
      console.error('Failed to reject order:', err)
      showNotification(err.response?.data?.message || 'Failed to reject order', { severity: 'error' })
    }
  }

  const openConfirmDialog = (order: Order, type: 'confirm' | 'reject') => {
    setConfirmDialog({ open: true, order, type })
    setConfirmData({ 
      fillPrice: order.pricePerShare.toString(), 
      reason: '', 
      notes: '' 
    })
  }

  const closeDialog = () => {
    setConfirmDialog({ open: false, order: null, type: 'confirm' })
    setConfirmData({ fillPrice: '', reason: '', notes: '' })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning'
      case 'filled': return 'success'
      case 'partially_filled': return 'info'
      case 'cancelled': return 'default'
      case 'rejected': return 'error'
      default: return 'default'
    }
  }

  const getTypeColor = (type: string) => {
    return type === 'buy' ? 'success' : 'error'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const applyFilters = () => {
    setPage(1)
    loadOrders()
    setShowFilters(false)
  }

  const clearFilters = () => {
    setFilters({})
    setPage(1)
    setShowFilters(false)
  }

  if (loading && orders.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Order Management
        </Typography>
        <Button
          variant="outlined"
          startIcon={<FilterIcon />}
          onClick={() => setShowFilters(!showFilters)}
        >
          Filters
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      {showFilters && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Filter Orders
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status || ''}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value as 'pending' | 'filled' | 'partially_filled' | 'cancelled' | 'rejected' | undefined })}
                    label="Status"
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="filled">Filled</MenuItem>
                    <MenuItem value="partially_filled">Partially Filled</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={filters.type || ''}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value as 'buy' | 'sell' | undefined })}
                    label="Type"
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="buy">Buy</MenuItem>
                    <MenuItem value="sell">Sell</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={filters.startDate || ''}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  value={filters.endDate || ''}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
            <Box mt={2} display="flex" gap={1}>
              <Button variant="contained" onClick={applyFilters}>
                Apply Filters
              </Button>
              <Button variant="outlined" onClick={clearFilters}>
                Clear Filters
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Orders Table */}
      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {order.id.slice(-8)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {order.user.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {order.product.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {order.product.symbol}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={order.type.toUpperCase()}
                        color={getTypeColor(order.type) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{order.quantity.toLocaleString()}</TableCell>
                    <TableCell>{formatCurrency(order.pricePerShare)}</TableCell>
                    <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                    <TableCell>
                      <Chip
                        label={order.status.replace('_', ' ').toUpperCase()}
                        color={getStatusColor(order.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(order.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        {order.status === 'pending' && (
                          <>
                            <Tooltip title="Confirm Order">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => openConfirmDialog(order, 'confirm')}
                              >
                                <ApproveIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject Order">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => openConfirmDialog(order, 'reject')}
                              >
                                <RejectIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        <Tooltip title="View Details">
                          <IconButton size="small">
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, newPage) => setPage(newPage)}
                color="primary"
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Confirm/Reject Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={closeDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {confirmDialog.type === 'confirm' ? 'Confirm Order' : 'Reject Order'}
        </DialogTitle>
        <DialogContent>
          {confirmDialog.order && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Order Details
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>User:</strong> {confirmDialog.order.user.email}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Product:</strong> {confirmDialog.order.product.name}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Type:</strong> {confirmDialog.order.type.toUpperCase()}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Quantity:</strong> {confirmDialog.order.quantity.toLocaleString()}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Price:</strong> {formatCurrency(confirmDialog.order.pricePerShare)}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Total:</strong> {formatCurrency(confirmDialog.order.totalAmount)}
              </Typography>

              <Box mt={3}>
                {confirmDialog.type === 'confirm' ? (
                  <>
                    <TextField
                      fullWidth
                      label="Fill Price (optional)"
                      type="number"
                      value={confirmData.fillPrice}
                      onChange={(e) => setConfirmData({ ...confirmData, fillPrice: e.target.value })}
                      helperText="Leave empty to use order price"
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Notes (optional)"
                      multiline
                      rows={3}
                      value={confirmData.notes}
                      onChange={(e) => setConfirmData({ ...confirmData, notes: e.target.value })}
                    />
                  </>
                ) : (
                  <>
                    <TextField
                      fullWidth
                      label="Rejection Reason"
                      required
                      value={confirmData.reason}
                      onChange={(e) => setConfirmData({ ...confirmData, reason: e.target.value })}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Additional Notes (optional)"
                      multiline
                      rows={3}
                      value={confirmData.notes}
                      onChange={(e) => setConfirmData({ ...confirmData, notes: e.target.value })}
                    />
                  </>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button
            onClick={confirmDialog.type === 'confirm' ? handleConfirmOrder : handleRejectOrder}
            variant="contained"
            color={confirmDialog.type === 'confirm' ? 'success' : 'error'}
            disabled={confirmDialog.type === 'reject' && !confirmData.reason.trim()}
          >
            {confirmDialog.type === 'confirm' ? 'Confirm Order' : 'Reject Order'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default OrderManagement