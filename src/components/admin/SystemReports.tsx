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
  Alert,
  Tabs,
  Tab,
} from '@mui/material'
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material'
import { adminService } from '../../services/adminService'
import { AdminTransaction, TransactionFilters, TransactionSummary } from '../../types/admin'

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
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  )
}

const SystemReports: React.FC = () => {
  const [tabValue, setTabValue] = useState(0)
  const [transactions, setTransactions] = useState<AdminTransaction[]>([])
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [summary, setSummary] = useState<TransactionSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [totalCount, setTotalCount] = useState(0)
  
  // Filters
  const [transactionFilters, setTransactionFilters] = useState<TransactionFilters>({
    type: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })
  
  const [auditFilters, setAuditFilters] = useState({
    category: '',
    severity: '',
    success: undefined as boolean | undefined,
    sortBy: 'timestamp',
    sortOrder: 'desc'
  })

  const loadTransactions = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await adminService.getTransactions({
        ...transactionFilters,
        limit: rowsPerPage,
        offset: page * rowsPerPage,
      })
      
      if (response.success) {
        setTransactions(response.data.transactions)
        setTotalCount(response.data.pagination.total)
        setSummary(response.data.summary)
      } else {
        setError('Failed to load transactions')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  const loadAuditLogs = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await adminService.getAuditLogs({
        ...auditFilters,
        limit: rowsPerPage,
        offset: page * rowsPerPage,
      })
      
      if (response.success) {
        setAuditLogs(response.data.logs)
        setTotalCount(response.data.pagination.total)
      } else {
        setError('Failed to load audit logs')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (tabValue === 0) {
      loadTransactions()
    } else if (tabValue === 1) {
      loadAuditLogs()
    }
  }, [tabValue, page, rowsPerPage, transactionFilters, auditFilters])

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
    setPage(0) // Reset pagination when switching tabs
  }

  const handleTransactionFilterChange = (field: keyof TransactionFilters, value: any) => {
    setTransactionFilters(prev => ({ ...prev, [field]: value }))
    setPage(0)
  }

  const handleAuditFilterChange = (field: string, value: any) => {
    setAuditFilters(prev => ({ ...prev, [field]: value }))
    setPage(0)
  }

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'deposit': return 'success'
      case 'withdrawal': return 'warning'
      case 'trade': return 'primary'
      default: return 'default'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'settled':
      case 'completed': return 'success'
      case 'pending': return 'warning'
      case 'failed':
      case 'rejected': return 'error'
      default: return 'default'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error'
      case 'high': return 'warning'
      case 'medium': return 'info'
      case 'low': return 'success'
      default: return 'default'
    }
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

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        System Reports & Monitoring
      </Typography>

      {/* Summary Cards */}
      {summary && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Transactions
                </Typography>
                <Typography variant="h4">
                  {summary.totalTransactions.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  24h Volume
                </Typography>
                <Typography variant="h4" color="primary.main">
                  {formatCurrency(summary.totalVolume)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  24h Fees
                </Typography>
                <Typography variant="h4" color="success.main">
                  {formatCurrency(summary.totalFees)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Pending Items
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {summary.byStatus.pending}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="system reports tabs">
          <Tab 
            label="Transaction Monitoring" 
            icon={<TrendingUpIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="Audit Logs" 
            icon={<SecurityIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="System Analytics" 
            icon={<AssessmentIcon />} 
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Transaction Monitoring Tab */}
      <TabPanel value={tabValue} index={0}>
        {/* Transaction Filters */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={transactionFilters.type || 'all'}
                  label="Type"
                  onChange={(e) => handleTransactionFilterChange('type', e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="deposit">Deposits</MenuItem>
                  <MenuItem value="withdrawal">Withdrawals</MenuItem>
                  <MenuItem value="trade">Trades</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={transactionFilters.status || ''}
                  label="Status"
                  onChange={(e) => handleTransactionFilterChange('status', e.target.value || undefined)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="settled">Settled</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={transactionFilters.startDate || ''}
                onChange={(e) => handleTransactionFilterChange('startDate', e.target.value || undefined)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={transactionFilters.endDate || ''}
                onChange={(e) => handleTransactionFilterChange('endDate', e.target.value || undefined)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                label="Min Amount"
                type="number"
                value={transactionFilters.minAmount || ''}
                onChange={(e) => handleTransactionFilterChange('minAmount', parseFloat(e.target.value) || undefined)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={loadTransactions}
                disabled={loading}
                fullWidth
              >
                Refresh
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Transactions Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Network/Product</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Category</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Loading transactions...
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id} hover>
                    <TableCell>
                      <Chip
                        label={transaction.type}
                        color={getTransactionTypeColor(transaction.type) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {transaction.userEmail || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {formatCurrency(transaction.amount)}
                      </Typography>
                      {transaction.currency && (
                        <Typography variant="caption" color="text.secondary">
                          {transaction.currency.toUpperCase()}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.status}
                        color={getStatusColor(transaction.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {transaction.network?.toUpperCase() || 
                         transaction.productSymbol || 
                         'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(transaction.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.type}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100]}
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10))
              setPage(0)
            }}
          />
        </TableContainer>
      </TabPanel>

      {/* Audit Logs Tab */}
      <TabPanel value={tabValue} index={1}>
        {/* Audit Filters */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={auditFilters.category}
                  label="Category"
                  onChange={(e) => handleAuditFilterChange('category', e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="auth">Authentication</MenuItem>
                  <MenuItem value="user_management">User Management</MenuItem>
                  <MenuItem value="trading">Trading</MenuItem>
                  <MenuItem value="wallet">Wallet</MenuItem>
                  <MenuItem value="kyc">KYC</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="system">System</MenuItem>
                  <MenuItem value="security">Security</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Severity</InputLabel>
                <Select
                  value={auditFilters.severity}
                  label="Severity"
                  onChange={(e) => handleAuditFilterChange('severity', e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Success</InputLabel>
                <Select
                  value={auditFilters.success === undefined ? '' : auditFilters.success.toString()}
                  label="Success"
                  onChange={(e) => handleAuditFilterChange('success', e.target.value === '' ? undefined : e.target.value === 'true')}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="true">Success</MenuItem>
                  <MenuItem value="false">Failed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={loadAuditLogs}
                disabled={loading}
                fullWidth
              >
                Refresh
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                fullWidth
              >
                Export Logs
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Audit Logs Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Severity</TableCell>
                <TableCell>Success</TableCell>
                <TableCell>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Loading audit logs...
                  </TableCell>
                </TableRow>
              ) : auditLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No audit logs found
                  </TableCell>
                </TableRow>
              ) : (
                auditLogs.map((log, index) => (
                  <TableRow key={index} hover>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(log.timestamp)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {log.action}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {log.user?.email || log.adminId || 'System'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.category}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.severity}
                        color={getSeverityColor(log.severity) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.success ? 'Success' : 'Failed'}
                        color={log.success ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap>
                        {log.details || 'No details'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100]}
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10))
              setPage(0)
            }}
          />
        </TableContainer>
      </TabPanel>

      {/* System Analytics Tab */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  System Analytics
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Advanced analytics and reporting features will be implemented here.
                  This includes revenue analytics, user growth metrics, trading volume trends,
                  and compliance reporting.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
    </Box>
  )
}

export default SystemReports