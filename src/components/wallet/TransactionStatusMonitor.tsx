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
  Chip,
  IconButton,
  Tooltip,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  Button,
  Link
} from '@mui/material'
import {
  Refresh as RefreshIcon,
  OpenInNew as OpenInNewIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Pending as PendingIcon
} from '@mui/icons-material'
import { walletService } from '../../services/walletService'
import { Transaction, Withdrawal } from '../../types/wallet'

interface TransactionStatusMonitorProps {
  refreshTrigger?: number
}

const TransactionStatusMonitor: React.FC<TransactionStatusMonitorProps> = ({ refreshTrigger }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    type: 'all',
    network: 'all',
    status: 'all'
  })

  const loadTransactions = async () => {
    try {
      setError(null)
      
      const [transactionResponse, withdrawalResponse] = await Promise.all([
        walletService.getTransactionHistory({
          page,
          limit: 10,
          ...(filters.type !== 'all' && filters.type !== 'withdrawal' ? { type: filters.type as 'deposit' } : {}),
          ...(filters.network !== 'all' ? { network: filters.network as any } : {}),
          ...(filters.status !== 'all' ? { status: filters.status as any } : {})
        }),
        walletService.getWithdrawalHistory({
          page: filters.type === 'withdrawal' ? page : 1,
          limit: filters.type === 'withdrawal' ? 10 : 5,
          ...(filters.status !== 'all' ? { status: filters.status as any } : {})
        })
      ])

      if (filters.type === 'withdrawal') {
        setWithdrawals(withdrawalResponse.data.withdrawals)
        setTotalPages(withdrawalResponse.data.pagination.pages)
        setTransactions([])
      } else {
        setTransactions(transactionResponse.data.transactions)
        setTotalPages(transactionResponse.data.pagination.pages)
        if (filters.type === 'all') {
          setWithdrawals(withdrawalResponse.data.withdrawals.slice(0, 3)) // Show recent withdrawals
        } else {
          setWithdrawals([])
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTransactions()
  }, [page, filters, refreshTrigger])

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }))
    setPage(1) // Reset to first page when filters change
  }

  const handlePageChange = (_event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <PendingIcon color="warning" />
      case 'confirmed':
      case 'completed':
      case 'approved':
        return <CheckCircleIcon color="success" />
      case 'failed':
      case 'rejected':
        return <ErrorIcon color="error" />
      case 'processing':
        return <ScheduleIcon color="info" />
      default:
        return <ScheduleIcon color="disabled" />
    }
  }

  const getStatusColor = (status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (status) {
      case 'pending':
        return 'warning'
      case 'confirmed':
      case 'completed':
      case 'approved':
        return 'success'
      case 'failed':
      case 'rejected':
        return 'error'
      case 'processing':
        return 'info'
      default:
        return 'default'
    }
  }

  const getNetworkColor = (network: string) => {
    switch (network) {
      case 'ethereum': return '#627EEA'
      case 'tron': return '#FF060A'
      case 'bsc': return '#F3BA2F'
      default: return '#666'
    }
  }

  const getExplorerUrl = (txHash: string, network: string) => {
    switch (network) {
      case 'ethereum':
        return `https://etherscan.io/tx/${txHash}`
      case 'tron':
        return `https://tronscan.org/#/transaction/${txHash}`
      case 'bsc':
        return `https://bscscan.com/tx/${txHash}`
      default:
        return '#'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(amount)
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">
          Transaction History
        </Typography>
        <Button
          startIcon={<RefreshIcon />}
          onClick={loadTransactions}
          variant="outlined"
          size="small"
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  label="Type"
                >
                  <MenuItem value="all">All Transactions</MenuItem>
                  <MenuItem value="deposit">Deposits Only</MenuItem>
                  <MenuItem value="withdrawal">Withdrawals Only</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Network</InputLabel>
                <Select
                  value={filters.network}
                  onChange={(e) => handleFilterChange('network', e.target.value)}
                  label="Network"
                >
                  <MenuItem value="all">All Networks</MenuItem>
                  <MenuItem value="ethereum">Ethereum</MenuItem>
                  <MenuItem value="tron">Tron</MenuItem>
                  <MenuItem value="bsc">BSC</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Network</TableCell>
                  <TableCell>Token</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Regular Transactions */}
                {transactions.map((transaction) => (
                  <TableRow key={transaction._id}>
                    <TableCell>
                      <Chip
                        label={transaction.type}
                        size="small"
                        color={transaction.type === 'deposit' ? 'success' : 'primary'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: getNetworkColor(transaction.network),
                            mr: 1
                          }}
                        />
                        {transaction.network.toUpperCase()}
                      </Box>
                    </TableCell>
                    <TableCell>{transaction.token.toUpperCase()}</TableCell>
                    <TableCell align="right">{formatAmount(transaction.amount)}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        {getStatusIcon(transaction.status)}
                        <Chip
                          label={transaction.status}
                          size="small"
                          color={getStatusColor(transaction.status)}
                          sx={{ ml: 1 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                    <TableCell>
                      {transaction.txHash && (
                        <Tooltip title="View on blockchain explorer">
                          <IconButton
                            size="small"
                            component={Link}
                            href={getExplorerUrl(transaction.txHash, transaction.network)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <OpenInNewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}

                {/* Withdrawals */}
                {withdrawals.map((withdrawal) => (
                  <TableRow key={withdrawal._id}>
                    <TableCell>
                      <Chip
                        label="withdrawal"
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: getNetworkColor(withdrawal.network),
                            mr: 1
                          }}
                        />
                        {withdrawal.network.toUpperCase()}
                      </Box>
                    </TableCell>
                    <TableCell>{withdrawal.token.toUpperCase()}</TableCell>
                    <TableCell align="right">{formatAmount(withdrawal.amount)}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        {getStatusIcon(withdrawal.status)}
                        <Chip
                          label={withdrawal.status}
                          size="small"
                          color={getStatusColor(withdrawal.status)}
                          sx={{ ml: 1 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>{formatDate(withdrawal.requestedAt)}</TableCell>
                    <TableCell>
                      {withdrawal.txHash && (
                        <Tooltip title="View on blockchain explorer">
                          <IconButton
                            size="small"
                            component={Link}
                            href={getExplorerUrl(withdrawal.txHash, withdrawal.network)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <OpenInNewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}

                {transactions.length === 0 && withdrawals.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No transactions found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

export default TransactionStatusMonitor