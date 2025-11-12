import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  IconButton,
  Tooltip,
  Stack,
  Divider,
} from '@mui/material'
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Warning as WarningIcon,
  Security as SecurityIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import { adminService } from '../../services/adminService'
import { WithdrawalRequest, WithdrawalFilters } from '../../types/admin'

const WithdrawalApprovals: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [totalWithdrawals, setTotalWithdrawals] = useState(0)
  
  // Filters
  const [filters, setFilters] = useState<WithdrawalFilters>({
    status: 'pending',
    sortBy: 'requestedAt',
    sortOrder: 'desc'
  })
  
  // Dialogs
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null)
  const [approvalDialog, setApprovalDialog] = useState(false)
  const [rejectionDialog, setRejectionDialog] = useState(false)
  const [approvalNotes, setApprovalNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [rejectionNotes, setRejectionNotes] = useState('')

  const loadWithdrawals = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await adminService.getWithdrawals({
        ...filters,
        limit: rowsPerPage,
        offset: page * rowsPerPage,
      })
      
      if (response.success) {
        setWithdrawals(response.data.withdrawals)
        setTotalWithdrawals(response.data.pagination.total)
      } else {
        setError('Failed to load withdrawals')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load withdrawals')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWithdrawals()
  }, [page, rowsPerPage, filters])

  const handleFilterChange = (field: keyof WithdrawalFilters, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }))
    setPage(0)
  }

  const handleApproval = async () => {
    if (!selectedWithdrawal) return
    
    try {
      const response = await adminService.approveWithdrawal(
        selectedWithdrawal.id,
        approvalNotes
      )
      
      if (response.success) {
        setApprovalDialog(false)
        setSelectedWithdrawal(null)
        setApprovalNotes('')
        loadWithdrawals()
      } else {
        setError('Failed to approve withdrawal')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve withdrawal')
    }
  }

  const handleRejection = async () => {
    if (!selectedWithdrawal) return
    
    try {
      const response = await adminService.rejectWithdrawal(
        selectedWithdrawal.id,
        rejectionReason,
        rejectionNotes
      )
      
      if (response.success) {
        setRejectionDialog(false)
        setSelectedWithdrawal(null)
        setRejectionReason('')
        setRejectionNotes('')
        loadWithdrawals()
      } else {
        setError('Failed to reject withdrawal')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reject withdrawal')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning'
      case 'approved': return 'success'
      case 'rejected': return 'error'
      case 'processing': return 'info'
      case 'completed': return 'success'
      case 'failed': return 'error'
      default: return 'default'
    }
  }

  const getNetworkColor = (network: string) => {
    switch (network) {
      case 'ethereum': return 'primary'
      case 'tron': return 'secondary'
      case 'bsc': return 'warning'
      default: return 'default'
    }
  }

  const getRiskLevel = (withdrawal: WithdrawalRequest) => {
    const score = withdrawal.fraudScore || 0
    if (score >= 70) return { level: 'High', color: 'error' }
    if (score >= 40) return { level: 'Medium', color: 'warning' }
    return { level: 'Low', color: 'success' }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const pendingCount = withdrawals.filter(w => w.status === 'pending').length
  const totalPendingAmount = withdrawals
    .filter(w => w.status === 'pending')
    .reduce((sum, w) => sum + w.amount, 0)

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Withdrawal Approvals
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pending Approvals
              </Typography>
              <Typography variant="h4" color="warning.main">
                {pendingCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pending Amount
              </Typography>
              <Typography variant="h4" color="warning.main">
                {formatCurrency(totalPendingAmount)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                High Risk
              </Typography>
              <Typography variant="h4" color="error.main">
                {withdrawals.filter(w => (w.fraudScore || 0) >= 70).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Requests
              </Typography>
              <Typography variant="h4">
                {totalWithdrawals}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status || ''}
                label="Status"
                onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
                <MenuItem value="processing">Processing</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Network</InputLabel>
              <Select
                value={filters.network || ''}
                label="Network"
                onChange={(e) => handleFilterChange('network', e.target.value || undefined)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="ethereum">Ethereum</MenuItem>
                <MenuItem value="tron">Tron</MenuItem>
                <MenuItem value="bsc">BSC</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Token</InputLabel>
              <Select
                value={filters.token || ''}
                label="Token"
                onChange={(e) => handleFilterChange('token', e.target.value || undefined)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="usdt">USDT</MenuItem>
                <MenuItem value="usdc">USDC</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              label="Min Amount"
              type="number"
              value={filters.minAmount || ''}
              onChange={(e) => handleFilterChange('minAmount', parseFloat(e.target.value) || undefined)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              label="Max Amount"
              type="number"
              value={filters.maxAmount || ''}
              onChange={(e) => handleFilterChange('maxAmount', parseFloat(e.target.value) || undefined)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadWithdrawals}
              disabled={loading}
              fullWidth
            >
              Refresh
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Withdrawals Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Network</TableCell>
              <TableCell>Destination</TableCell>
              <TableCell>Risk Level</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Requested</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Loading withdrawals...
                </TableCell>
              </TableRow>
            ) : withdrawals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No withdrawals found
                </TableCell>
              </TableRow>
            ) : (
              withdrawals.map((withdrawal) => {
                const risk = getRiskLevel(withdrawal)
                return (
                  <TableRow key={withdrawal.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {withdrawal.user?.email || withdrawal.userEmail}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {formatCurrency(withdrawal.amount)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {withdrawal.token.toUpperCase()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={withdrawal.network.toUpperCase()}
                        color={getNetworkColor(withdrawal.network) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {formatAddress(withdrawal.toAddress)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          label={risk.level}
                          color={risk.color as any}
                          size="small"
                          icon={<SecurityIcon />}
                        />
                        {withdrawal.fraudFlags && withdrawal.fraudFlags.length > 0 && (
                          <Tooltip title={`Flags: ${withdrawal.fraudFlags.join(', ')}`}>
                            <WarningIcon color="warning" fontSize="small" />
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={withdrawal.status}
                        color={getStatusColor(withdrawal.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(withdrawal.requestedAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="View Details">
                          <IconButton size="small" onClick={() => setSelectedWithdrawal(withdrawal)}>
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        {withdrawal.status === 'pending' && (
                          <>
                            <Tooltip title="Approve">
                              <IconButton 
                                size="small" 
                                color="success"
                                onClick={() => {
                                  setSelectedWithdrawal(withdrawal)
                                  setApprovalDialog(true)
                                }}
                              >
                                <ApproveIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => {
                                  setSelectedWithdrawal(withdrawal)
                                  setRejectionDialog(true)
                                }}
                              >
                                <RejectIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={totalWithdrawals}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10))
            setPage(0)
          }}
        />
      </TableContainer>

      {/* Approval Dialog */}
      <Dialog open={approvalDialog} onClose={() => setApprovalDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Approve Withdrawal
        </DialogTitle>
        <DialogContent>
          {selectedWithdrawal && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="h6" gutterBottom>
                Withdrawal Details
              </Typography>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">User:</Typography>
                  <Typography variant="body2">{selectedWithdrawal.user?.email || selectedWithdrawal.userEmail}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Amount:</Typography>
                  <Typography variant="body2">{formatCurrency(selectedWithdrawal.amount)} {selectedWithdrawal.token.toUpperCase()}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Network:</Typography>
                  <Typography variant="body2">{selectedWithdrawal.network.toUpperCase()}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Risk Score:</Typography>
                  <Typography variant="body2">{selectedWithdrawal.fraudScore || 0}/100</Typography>
                </Grid>
              </Grid>
              <Divider sx={{ my: 2 }} />
              <TextField
                fullWidth
                label="Approval Notes (optional)"
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                multiline
                rows={3}
                placeholder="Add any notes about this approval..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprovalDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleApproval} 
            variant="contained"
            color="success"
            startIcon={<ApproveIcon />}
          >
            Approve Withdrawal
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={rejectionDialog} onClose={() => setRejectionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Reject Withdrawal
        </DialogTitle>
        <DialogContent>
          {selectedWithdrawal && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="h6" gutterBottom>
                Withdrawal Details
              </Typography>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">User:</Typography>
                  <Typography variant="body2">{selectedWithdrawal.user?.email || selectedWithdrawal.userEmail}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Amount:</Typography>
                  <Typography variant="body2">{formatCurrency(selectedWithdrawal.amount)} {selectedWithdrawal.token.toUpperCase()}</Typography>
                </Grid>
              </Grid>
              <Divider sx={{ my: 2 }} />
              <TextField
                fullWidth
                label="Rejection Reason (required)"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                multiline
                rows={2}
                required
                sx={{ mb: 2 }}
                placeholder="Provide a clear reason for rejection..."
              />
              <TextField
                fullWidth
                label="Additional Notes"
                value={rejectionNotes}
                onChange={(e) => setRejectionNotes(e.target.value)}
                multiline
                rows={3}
                placeholder="Add any additional notes..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectionDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleRejection} 
            variant="contained"
            color="error"
            startIcon={<RejectIcon />}
            disabled={!rejectionReason.trim()}
          >
            Reject Withdrawal
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default WithdrawalApprovals