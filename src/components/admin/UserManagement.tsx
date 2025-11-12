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
} from '@mui/material'
import {
  Visibility as ViewIcon,
  Block as BlockIcon,
  AccountBalance as BalanceIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import { adminService } from '../../services/adminService'
import { UserManagement as UserManagementType, UserFilters, UsersResponse } from '../../types/admin'
import { BalanceAdjustmentDialog } from '../admin'

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserManagementType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [totalUsers, setTotalUsers] = useState(0)
  const [summary, setSummary] = useState<any>(null)
  
  // Filters
  const [filters, setFilters] = useState<UserFilters>({
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })
  
  // Dialogs
  const [selectedUser, setSelectedUser] = useState<UserManagementType | null>(null)
  const [statusDialog, setStatusDialog] = useState(false)
  const [balanceDialog, setBalanceDialog] = useState(false)
  const [newStatus, setNewStatus] = useState<'active' | 'suspended' | 'deactivated'>('active')
  const [statusReason, setStatusReason] = useState('')
  const [statusNotes, setStatusNotes] = useState('')

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response: UsersResponse = await adminService.getUsers({
        ...filters,
        limit: rowsPerPage,
        offset: page * rowsPerPage,
      })
      
      if (response.success) {
        setUsers(response.data.users as unknown as UserManagementType[])
        setTotalUsers(response.data.pagination.total)
        setSummary(response.data.summary)
      } else {
        setError('Failed to load users')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [page, rowsPerPage, filters])

  const handleFilterChange = (field: keyof UserFilters, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }))
    setPage(0) // Reset to first page when filtering
  }

  const handleStatusChange = async () => {
    if (!selectedUser) return
    
    try {
      const response = await adminService.updateUserStatus(
        selectedUser.id,
        newStatus,
        statusReason,
        statusNotes
      )
      
      if (response.success) {
        setStatusDialog(false)
        setSelectedUser(null)
        setStatusReason('')
        setStatusNotes('')
        loadUsers() // Reload data
      } else {
        setError('Failed to update user status')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update user status')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'suspended': return 'warning'
      case 'deactivated': return 'error'
      default: return 'default'
    }
  }

  const getKYCStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success'
      case 'pending': return 'warning'
      case 'rejected': return 'error'
      case 'not_started': return 'default'
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
        User Management
      </Typography>

      {/* Summary Cards */}
      {summary && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Users
                </Typography>
                <Typography variant="h4">
                  {summary.totalUsers.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Active Users
                </Typography>
                <Typography variant="h4" color="success.main">
                  {summary.activeUsers.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  KYC Approved
                </Typography>
                <Typography variant="h4" color="primary.main">
                  {summary.kycApprovedUsers.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  MFA Enabled
                </Typography>
                <Typography variant="h4" color="info.main">
                  {summary.mfaEnabledUsers.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Search by email"
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status || ''}
                label="Status"
                onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
                <MenuItem value="deactivated">Deactivated</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>KYC Status</InputLabel>
              <Select
                value={filters.kycStatus || ''}
                label="KYC Status"
                onChange={(e) => handleFilterChange('kycStatus', e.target.value || undefined)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="not_started">Not Started</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={filters.role || ''}
                label="Role"
                onChange={(e) => handleFilterChange('role', e.target.value || undefined)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="issuer">Issuer</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={loadUsers}
                disabled={loading}
              >
                Refresh
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Users Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>KYC Status</TableCell>
              <TableCell>Total Value</TableCell>
              <TableCell>Account Age</TableCell>
              <TableCell>Last Login</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {user.email}
                      </Typography>
                      <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                        {user.emailVerified && (
                          <Chip label="Verified" size="small" color="success" variant="outlined" />
                        )}
                        {user.mfaEnabled && (
                          <Chip label="MFA" size="small" color="info" variant="outlined" />
                        )}
                        {user.accreditedInvestor && (
                          <Chip label="Accredited" size="small" color="primary" variant="outlined" />
                        )}
                      </Stack>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.status}
                      color={getStatusColor(user.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.kycStatus.replace('_', ' ')}
                      color={getKYCStatusColor(user.kycStatus) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {formatCurrency(user.totalValue)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      W: {formatCurrency(user.walletBalance)} | P: {formatCurrency(user.portfolioValue)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {user.accountAge} days
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => setSelectedUser(user)}>
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Change Status">
                        <IconButton 
                          size="small" 
                          onClick={() => {
                            setSelectedUser(user)
                            setNewStatus(user.status)
                            setStatusDialog(true)
                          }}
                        >
                          <BlockIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Adjust Balance">
                        <IconButton 
                          size="small" 
                          onClick={() => {
                            setSelectedUser(user)
                            setBalanceDialog(true)
                          }}
                        >
                          <BalanceIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={totalUsers}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10))
            setPage(0)
          }}
        />
      </TableContainer>

      {/* Status Change Dialog */}
      <Dialog open={statusDialog} onClose={() => setStatusDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Change User Status: {selectedUser?.email}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>New Status</InputLabel>
              <Select
                value={newStatus}
                label="New Status"
                onChange={(e) => setNewStatus(e.target.value as any)}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
                <MenuItem value="deactivated">Deactivated</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Reason (required)"
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              multiline
              rows={2}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              label="Additional Notes"
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleStatusChange} 
            variant="contained"
            disabled={!statusReason.trim()}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* Balance Adjustment Dialog */}
      <BalanceAdjustmentDialog
        open={balanceDialog}
        onClose={() => {
          setBalanceDialog(false)
          setSelectedUser(null)
        }}
        user={selectedUser ? { id: selectedUser.id, email: selectedUser.email } : null}
        onSuccess={() => {
          loadUsers() // Reload users to show updated balance
        }}
      />
    </Box>
  )
}

export default UserManagement