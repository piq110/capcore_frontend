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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material'
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Info as InfoIcon,
  AttachFile as FileIcon,
  Refresh as RefreshIcon,
  AccountBalance as AccreditedIcon,
} from '@mui/icons-material'
import { adminService } from '../../services/adminService'
import { KYCSubmission, KYCFilters } from '../../types/admin'

const KYCManagement: React.FC = () => {
  const [submissions, setSubmissions] = useState<KYCSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [totalSubmissions, setTotalSubmissions] = useState(0)
  
  // Filters
  const [filters, setFilters] = useState<KYCFilters>({
    status: 'pending',
    sortBy: 'submittedAt',
    sortOrder: 'desc'
  })
  
  // Dialogs
  const [selectedSubmission, setSelectedSubmission] = useState<KYCSubmission | null>(null)
  const [detailsDialog, setDetailsDialog] = useState(false)
  const [approvalDialog, setApprovalDialog] = useState(false)
  const [rejectionDialog, setRejectionDialog] = useState(false)
  const [additionalInfoDialog, setAdditionalInfoDialog] = useState(false)
  
  // Form data
  const [approvalNotes, setApprovalNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [rejectionNotes, setRejectionNotes] = useState('')
  const [additionalInfoRequirements, setAdditionalInfoRequirements] = useState('')
  const [additionalInfoNotes, setAdditionalInfoNotes] = useState('')

  const loadSubmissions = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await adminService.getKYCSubmissions({
        ...filters,
        limit: rowsPerPage,
        offset: page * rowsPerPage,
      })
      
      if (response.success) {
        setSubmissions(response.data.submissions)
        setTotalSubmissions(response.data.pagination.total)
      } else {
        setError('Failed to load KYC submissions')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load KYC submissions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSubmissions()
  }, [page, rowsPerPage, filters])

  const handleFilterChange = (field: keyof KYCFilters, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }))
    setPage(0)
  }

  const handleApproval = async () => {
    if (!selectedSubmission) return
    
    try {
      const response = await adminService.approveKYC(
        selectedSubmission.id,
        approvalNotes
      )
      
      if (response.success) {
        setApprovalDialog(false)
        setSelectedSubmission(null)
        setApprovalNotes('')
        loadSubmissions()
      } else {
        setError('Failed to approve KYC')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve KYC')
    }
  }

  const handleRejection = async () => {
    if (!selectedSubmission) return
    
    try {
      const response = await adminService.rejectKYC(
        selectedSubmission.id,
        rejectionReason,
        rejectionNotes
      )
      
      if (response.success) {
        setRejectionDialog(false)
        setSelectedSubmission(null)
        setRejectionReason('')
        setRejectionNotes('')
        loadSubmissions()
      } else {
        setError('Failed to reject KYC')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reject KYC')
    }
  }

  const handleAdditionalInfoRequest = async () => {
    if (!selectedSubmission) return
    
    try {
      const response = await adminService.requestAdditionalKYCInfo(
        selectedSubmission.id,
        additionalInfoRequirements,
        additionalInfoNotes
      )
      
      if (response.success) {
        setAdditionalInfoDialog(false)
        setSelectedSubmission(null)
        setAdditionalInfoRequirements('')
        setAdditionalInfoNotes('')
        loadSubmissions()
      } else {
        setError('Failed to request additional information')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to request additional information')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning'
      case 'approved': return 'success'
      case 'rejected': return 'error'
      case 'requires_additional_info': return 'info'
      default: return 'default'
    }
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const pendingCount = submissions.filter(s => s.status === 'pending').length
  const accreditedCount = submissions.filter(s => s.accreditedInvestor.claimed).length

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        KYC Management
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pending Reviews
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
                Accredited Claims
              </Typography>
              <Typography variant="h4" color="primary.main">
                {accreditedCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Submissions
              </Typography>
              <Typography variant="h4">
                {totalSubmissions}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Approved Rate
              </Typography>
              <Typography variant="h4" color="success.main">
                {totalSubmissions > 0 
                  ? Math.round((submissions.filter(s => s.status === 'approved').length / totalSubmissions) * 100)
                  : 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
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
                <MenuItem value="requires_additional_info">Needs Info</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Accredited Claimed</InputLabel>
              <Select
                value={filters.accreditedClaimed === undefined ? '' : filters.accreditedClaimed.toString()}
                label="Accredited Claimed"
                onChange={(e) => handleFilterChange('accreditedClaimed', e.target.value === '' ? undefined : e.target.value === 'true')}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="true">Yes</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={filters.sortBy || 'submittedAt'}
                label="Sort By"
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <MenuItem value="submittedAt">Submitted Date</MenuItem>
                <MenuItem value="firstName">First Name</MenuItem>
                <MenuItem value="lastName">Last Name</MenuItem>
                <MenuItem value="status">Status</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadSubmissions}
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

      {/* KYC Submissions Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Applicant</TableCell>
              <TableCell>User Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Accredited</TableCell>
              <TableCell>Documents</TableCell>
              <TableCell>Submitted</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Loading KYC submissions...
                </TableCell>
              </TableRow>
            ) : submissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No KYC submissions found
                </TableCell>
              </TableRow>
            ) : (
              submissions.map((submission) => (
                <TableRow key={submission.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {submission.firstName} {submission.lastName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {submission.user.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={submission.status.replace('_', ' ')}
                      color={getStatusColor(submission.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {submission.accreditedInvestor.claimed ? (
                        <Chip
                          label={submission.accreditedInvestor.type || 'Claimed'}
                          color="primary"
                          size="small"
                          icon={<AccreditedIcon />}
                        />
                      ) : (
                        <Chip
                          label="No"
                          variant="outlined"
                          size="small"
                        />
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <FileIcon fontSize="small" />
                      <Typography variant="body2">
                        {submission.documents.length}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(submission.submittedAt)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="View Details">
                        <IconButton 
                          size="small" 
                          onClick={() => {
                            setSelectedSubmission(submission)
                            setDetailsDialog(true)
                          }}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      {submission.status === 'pending' && (
                        <>
                          <Tooltip title="Approve">
                            <IconButton 
                              size="small" 
                              color="success"
                              onClick={() => {
                                setSelectedSubmission(submission)
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
                                setSelectedSubmission(submission)
                                setRejectionDialog(true)
                              }}
                            >
                              <RejectIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Request Info">
                            <IconButton 
                              size="small" 
                              color="info"
                              onClick={() => {
                                setSelectedSubmission(submission)
                                setAdditionalInfoDialog(true)
                              }}
                            >
                              <InfoIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={totalSubmissions}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10))
            setPage(0)
          }}
        />
      </TableContainer>

      {/* Details Dialog */}
      <Dialog open={detailsDialog} onClose={() => setDetailsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          KYC Submission Details
        </DialogTitle>
        <DialogContent>
          {selectedSubmission && (
            <Box sx={{ pt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>Personal Information</Typography>
                  <Typography variant="body2">Name: {selectedSubmission.firstName} {selectedSubmission.lastName}</Typography>
                  <Typography variant="body2">Email: {selectedSubmission.user.email}</Typography>
                  <Typography variant="body2">Submitted: {formatDate(selectedSubmission.submittedAt)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>Status Information</Typography>
                  <Chip
                    label={selectedSubmission.status.replace('_', ' ')}
                    color={getStatusColor(selectedSubmission.status) as any}
                    size="small"
                    sx={{ mb: 1 }}
                  />
                  {selectedSubmission.reviewedAt && (
                    <Typography variant="body2">
                      Reviewed: {formatDate(selectedSubmission.reviewedAt)}
                    </Typography>
                  )}
                  {selectedSubmission.reviewedBy && (
                    <Typography variant="body2">
                      Reviewed by: {selectedSubmission.reviewedBy.email}
                    </Typography>
                  )}
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>Documents</Typography>
              <List dense>
                {selectedSubmission.documents.map((doc, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <FileIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={doc.originalName}
                      secondary={`${doc.type} - Uploaded ${formatDate(doc.uploadedAt)}`}
                    />
                  </ListItem>
                ))}
              </List>
              
              {selectedSubmission.accreditedInvestor.claimed && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" gutterBottom>Accredited Investor Information</Typography>
                  <Typography variant="body2">Type: {selectedSubmission.accreditedInvestor.type}</Typography>
                  {selectedSubmission.accreditedInvestor.annualIncome && (
                    <Typography variant="body2">
                      Annual Income: {formatCurrency(selectedSubmission.accreditedInvestor.annualIncome)}
                    </Typography>
                  )}
                  {selectedSubmission.accreditedInvestor.netWorth && (
                    <Typography variant="body2">
                      Net Worth: {formatCurrency(selectedSubmission.accreditedInvestor.netWorth)}
                    </Typography>
                  )}
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog open={approvalDialog} onClose={() => setApprovalDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Approve KYC Submission</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprovalDialog(false)}>Cancel</Button>
          <Button onClick={handleApproval} variant="contained" color="success">
            Approve KYC
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={rejectionDialog} onClose={() => setRejectionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject KYC Submission</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Rejection Reason (required)"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              multiline
              rows={2}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Additional Notes"
              value={rejectionNotes}
              onChange={(e) => setRejectionNotes(e.target.value)}
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectionDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleRejection} 
            variant="contained" 
            color="error"
            disabled={!rejectionReason.trim()}
          >
            Reject KYC
          </Button>
        </DialogActions>
      </Dialog>

      {/* Additional Info Dialog */}
      <Dialog open={additionalInfoDialog} onClose={() => setAdditionalInfoDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Request Additional Information</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Required Information (required)"
              value={additionalInfoRequirements}
              onChange={(e) => setAdditionalInfoRequirements(e.target.value)}
              multiline
              rows={3}
              required
              sx={{ mb: 2 }}
              placeholder="Specify what additional information is needed..."
            />
            <TextField
              fullWidth
              label="Additional Notes"
              value={additionalInfoNotes}
              onChange={(e) => setAdditionalInfoNotes(e.target.value)}
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAdditionalInfoDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleAdditionalInfoRequest} 
            variant="contained"
            disabled={!additionalInfoRequirements.trim()}
          >
            Request Information
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default KYCManagement