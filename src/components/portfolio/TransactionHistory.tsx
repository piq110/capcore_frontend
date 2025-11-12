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
  TablePagination,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  MenuItem,
  Grid,
  Button,
  CircularProgress,
  Alert,
  InputAdornment,
  useTheme
} from '@mui/material'
import {
  Download,
  FilterList,
  Search,
  Clear,
  Refresh
} from '@mui/icons-material'
// import { DatePicker } from '@mui/x-date-pickers/DatePicker'
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { portfolioService } from '../../services/portfolioService'
import { Transaction, TransactionFilters } from '../../types/portfolio'
import { formatCurrency } from '../../utils/portfolioCalculations'

const TransactionHistory: React.FC = () => {
  const theme = useTheme()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [totalCount, setTotalCount] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  
  // Filter states
  const [filters, setFilters] = useState<TransactionFilters>({
    limit: 25,
    offset: 0,
    sortBy: 'executedAt',
    sortOrder: 'desc'
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFrom, setDateFrom] = useState<Date | null>(null)
  const [dateTo, setDateTo] = useState<Date | null>(null)

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const currentFilters: TransactionFilters = {
        ...filters,
        limit: rowsPerPage,
        offset: page * rowsPerPage,
        dateFrom: dateFrom?.toISOString().split('T')[0],
        dateTo: dateTo?.toISOString().split('T')[0]
      }

      const response = await portfolioService.getTransactions(currentFilters)
      setTransactions(response.data.transactions)
      setTotalCount(response.data.pagination.total)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [page, rowsPerPage, filters, dateFrom, dateTo])

  const handlePageChange = (_event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleFilterChange = (field: keyof TransactionFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }))
    setPage(0)
  }

  const handleClearFilters = () => {
    setFilters({
      limit: rowsPerPage,
      offset: 0,
      sortBy: 'executedAt',
      sortOrder: 'desc'
    })
    setSearchTerm('')
    setDateFrom(null)
    setDateTo(null)
    setPage(0)
  }

  const handleExportTransactions = async () => {
    if (transactions.length > 0) {
      await portfolioService.exportTransactionsToCsv(
        transactions,
        `transactions-${new Date().toISOString().split('T')[0]}.csv`
      )
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'buy':
        return ''
      case 'sell':
        return ''
      case 'deposit':
        return ''
      case 'withdrawal':
        return ''
      case 'dividend':
        return ''
      case 'fee':
        return ''
      default:
        return ''
    }
  }

  const filteredTransactions = transactions.filter(transaction => {
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase()
    return (
      transaction.description.toLowerCase().includes(searchLower) ||
      transaction.type.toLowerCase().includes(searchLower) ||
      transaction.product?.name.toLowerCase().includes(searchLower) ||
      transaction.product?.symbol.toLowerCase().includes(searchLower)
    )
  })

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button variant="contained" onClick={fetchTransactions}>
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">
            Transaction History
          </Typography>
          <Box>
            <Tooltip title="Toggle Filters">
              <IconButton onClick={() => setShowFilters(!showFilters)}>
                <FilterList />
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh">
              <IconButton onClick={fetchTransactions} disabled={loading}>
                <Refresh />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export CSV">
              <IconButton onClick={handleExportTransactions} disabled={transactions.length === 0}>
                <Download />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Filters */}
        {showFilters && (
          <Box mb={3} p={2} bgcolor="background.default" borderRadius={1}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  select
                  label="Type"
                  value={filters.type || ''}
                  onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="buy">Buy</MenuItem>
                  <MenuItem value="sell">Sell</MenuItem>
                  <MenuItem value="deposit">Deposit</MenuItem>
                  <MenuItem value="withdrawal">Withdrawal</MenuItem>
                  <MenuItem value="dividend">Dividend</MenuItem>
                  <MenuItem value="fee">Fee</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  select
                  label="Status"
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="From Date"
                  value={dateFrom?.toISOString().split('T')[0] || ''}
                  onChange={(e) => setDateFrom(e.target.value ? new Date(e.target.value) : null)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="To Date"
                  value={dateTo?.toISOString().split('T')[0] || ''}
                  onChange={(e) => setDateTo(e.target.value ? new Date(e.target.value) : null)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={1}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleClearFilters}
                  startIcon={<Clear />}
                >
                  Clear
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Transaction Table */}
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="right">Fees</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id} hover>
                      <TableCell>
                        <Typography variant="body2">
                          {portfolioService.formatDate(transaction.executedAt)}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {new Date(transaction.executedAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <span>{getTransactionIcon(transaction.type)}</span>
                          <Chip
                            label={transaction.type.toUpperCase()}
                            size="small"
                            color={portfolioService.getTransactionTypeColor(transaction.type)}
                            variant="outlined"
                          />
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">
                          {transaction.description}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        {transaction.product ? (
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {transaction.product.name}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {transaction.product.symbol} • {transaction.product.type}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="textSecondary">
                            —
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell align="right">
                        {transaction.quantity ? (
                          <Typography variant="body2">
                            {transaction.quantity.toLocaleString()}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="textSecondary">
                            —
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell align="right">
                        {transaction.pricePerShare ? (
                          <Typography variant="body2">
                            {formatCurrency(transaction.pricePerShare)}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="textSecondary">
                            —
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell align="right">
                        <Typography 
                          variant="body2" 
                          fontWeight="medium"
                          sx={{ 
                            color: transaction.type === 'sell' || transaction.type === 'withdrawal' || transaction.type === 'fee'
                              ? theme.palette.error.main 
                              : theme.palette.success.main 
                          }}
                        >
                          {transaction.type === 'sell' || transaction.type === 'withdrawal' || transaction.type === 'fee' ? '-' : '+'}
                          {formatCurrency(Math.abs(transaction.amount))}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Typography variant="body2" color="textSecondary">
                          {formatCurrency(transaction.fees)}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={transaction.status.toUpperCase()}
                          size="small"
                          color={portfolioService.getStatusColor(transaction.status)}
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {filteredTransactions.length === 0 && !loading && (
              <Box textAlign="center" py={4}>
                <Typography variant="body1" color="textSecondary">
                  No transactions found matching your criteria.
                </Typography>
              </Box>
            )}

            {/* Pagination */}
            <TablePagination
              rowsPerPageOptions={[10, 25, 50, 100]}
              component="div"
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
            />
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default TransactionHistory