import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material'
import {
  Send as SendIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material'
import { useFormik } from 'formik'
import * as yup from 'yup'
import { walletService } from '../../services/walletService'
import { MultiChainBalances, WithdrawalRequest, WithdrawalResponse } from '../../types/wallet'

interface WithdrawalFormProps {
  balances: MultiChainBalances | null
  onWithdrawalSuccess?: (withdrawal: WithdrawalResponse) => void
}

const validationSchema = yup.object({
  network: yup
    .string()
    .oneOf(['ethereum', 'tron', 'bsc'], 'Invalid network')
    .required('Network is required'),
  token: yup
    .string()
    .oneOf(['usdt', 'usdc'], 'Invalid token')
    .required('Token is required'),
  amount: yup
    .number()
    .min(10, 'Minimum withdrawal amount is $10')
    .max(10000, 'Maximum withdrawal amount is $10,000')
    .required('Amount is required'),
  toAddress: yup
    .string()
    .required('Destination address is required')
    .test('address-format', 'Invalid address format', function(value) {
      const { network } = this.parent
      if (!value || !network) return false
      
      if (network === 'ethereum' || network === 'bsc') {
        return /^0x[a-fA-F0-9]{40}$/.test(value)
      } else if (network === 'tron') {
        return /^T[A-Za-z0-9]{33}$/.test(value)
      }
      return false
    })
})

const WithdrawalForm: React.FC<WithdrawalFormProps> = ({ balances, onWithdrawalSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmDialog, setConfirmDialog] = useState(false)
  const [withdrawalResult, setWithdrawalResult] = useState<WithdrawalResponse | null>(null)

  const formik = useFormik<WithdrawalRequest>({
    initialValues: {
      network: 'ethereum',
      token: 'usdt',
      amount: 0,
      toAddress: ''
    },
    validationSchema,
    onSubmit: () => {
      setConfirmDialog(true)
    }
  })

  const handleConfirmWithdrawal = async () => {
    try {
      setLoading(true)
      setError(null)
      setConfirmDialog(false)

      const response = await walletService.requestWithdrawal(formik.values)
      setWithdrawalResult(response)
      onWithdrawalSuccess?.(response)
      formik.resetForm()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit withdrawal request')
    } finally {
      setLoading(false)
    }
  }

  const getAvailableBalance = () => {
    if (!balances) return 0
    const { network, token } = formik.values
    return balances[token as 'usdt' | 'usdc'][network as 'ethereum' | 'tron' | 'bsc']
  }

  const getNetworkColor = (network: string) => {
    switch (network) {
      case 'ethereum': return '#627EEA'
      case 'tron': return '#FF060A'
      case 'bsc': return '#F3BA2F'
      default: return '#666'
    }
  }

  const getNetworkName = (network: string) => {
    switch (network) {
      case 'ethereum': return 'Ethereum'
      case 'tron': return 'Tron'
      case 'bsc': return 'Binance Smart Chain'
      default: return network
    }
  }

  const estimatedFee = Math.max(formik.values.amount * 0.005, 1) // 0.5% or $1 minimum
  const totalDeduction = formik.values.amount + estimatedFee
  const availableBalance = getAvailableBalance()

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Withdraw Cryptocurrency
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          Withdrawals require admin approval and may take 1-3 business days to process.
          Minimum withdrawal: $10. Maximum daily limit: $10,000.
        </Typography>
      </Alert>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {withdrawalResult && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="body2" fontWeight="medium">
            Withdrawal request submitted successfully!
          </Typography>
          <Typography variant="body2">
            Request ID: {withdrawalResult.data.withdrawalId}
          </Typography>
          <Typography variant="body2">
            Status: {withdrawalResult.data.status} - {withdrawalResult.data.message}
          </Typography>
        </Alert>
      )}

      <Card>
        <CardContent>
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              {/* Network Selection */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Network</InputLabel>
                  <Select
                    name="network"
                    value={formik.values.network}
                    onChange={formik.handleChange}
                    error={formik.touched.network && Boolean(formik.errors.network)}
                    label="Network"
                  >
                    <MenuItem value="ethereum">
                      <Box display="flex" alignItems="center">
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: getNetworkColor('ethereum'),
                            mr: 1
                          }}
                        />
                        Ethereum
                      </Box>
                    </MenuItem>
                    <MenuItem value="tron">
                      <Box display="flex" alignItems="center">
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: getNetworkColor('tron'),
                            mr: 1
                          }}
                        />
                        Tron
                      </Box>
                    </MenuItem>
                    <MenuItem value="bsc">
                      <Box display="flex" alignItems="center">
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: getNetworkColor('bsc'),
                            mr: 1
                          }}
                        />
                        Binance Smart Chain
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Token Selection */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Token</InputLabel>
                  <Select
                    name="token"
                    value={formik.values.token}
                    onChange={formik.handleChange}
                    error={formik.touched.token && Boolean(formik.errors.token)}
                    label="Token"
                  >
                    <MenuItem value="usdt">USDT</MenuItem>
                    <MenuItem value="usdc">USDC</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Amount */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="amount"
                  label="Amount (USD)"
                  type="number"
                  value={formik.values.amount}
                  onChange={formik.handleChange}
                  error={formik.touched.amount && Boolean(formik.errors.amount)}
                  helperText={
                    formik.touched.amount && formik.errors.amount ? 
                    formik.errors.amount : 
                    `Available: $${availableBalance.toFixed(2)}`
                  }
                  InputProps={{
                    inputProps: { min: 10, max: Math.min(10000, availableBalance), step: 0.01 }
                  }}
                />
                {availableBalance > 0 && (
                  <Box mt={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => formik.setFieldValue('amount', Math.min(availableBalance - estimatedFee, 10000))}
                    >
                      Max Available
                    </Button>
                  </Box>
                )}
              </Grid>

              {/* Destination Address */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="toAddress"
                  label="Destination Address"
                  value={formik.values.toAddress}
                  onChange={formik.handleChange}
                  error={formik.touched.toAddress && Boolean(formik.errors.toAddress)}
                  helperText={
                    formik.touched.toAddress && formik.errors.toAddress ? 
                    formik.errors.toAddress : 
                    `Enter a valid ${getNetworkName(formik.values.network)} address`
                  }
                  placeholder={
                    formik.values.network === 'tron' ? 
                    'TxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxX' : 
                    '0xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
                  }
                />
              </Grid>

              {/* Fee Information */}
              {formik.values.amount > 0 && (
                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ backgroundColor: 'grey.50' }}>
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>
                        Transaction Summary
                      </Typography>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">Withdrawal Amount:</Typography>
                        <Typography variant="body2">${formik.values.amount.toFixed(2)}</Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">Network Fee (est.):</Typography>
                        <Typography variant="body2">${estimatedFee.toFixed(2)}</Typography>
                      </Box>
                      <Divider sx={{ my: 1 }} />
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" fontWeight="bold">Total Deduction:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          ${totalDeduction.toFixed(2)}
                        </Typography>
                      </Box>
                      {totalDeduction > availableBalance && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                          Insufficient balance. You need ${(totalDeduction - availableBalance).toFixed(2)} more.
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Submit Button */}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                  disabled={loading || !formik.isValid || totalDeduction > availableBalance}
                  sx={{ mt: 2 }}
                >
                  {loading ? 'Processing...' : 'Request Withdrawal'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <WarningIcon color="warning" sx={{ mr: 1 }} />
            Confirm Withdrawal Request
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Please review your withdrawal details carefully. This action cannot be undone.
          </Alert>
          
          <List>
            <ListItem>
              <ListItemText
                primary="Network"
                secondary={
                  <Chip
                    label={getNetworkName(formik.values.network)}
                    size="small"
                    sx={{ 
                      backgroundColor: `${getNetworkColor(formik.values.network)}20`,
                      color: getNetworkColor(formik.values.network)
                    }}
                  />
                }
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Token"
                secondary={formik.values.token.toUpperCase()}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Amount"
                secondary={`$${formik.values.amount.toFixed(2)}`}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Destination Address"
                secondary={formik.values.toAddress}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Estimated Fee"
                secondary={`$${estimatedFee.toFixed(2)}`}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Total Deduction"
                secondary={`$${totalDeduction.toFixed(2)}`}
              />
            </ListItem>
          </List>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Box display="flex" alignItems="center" mb={1}>
              <ScheduleIcon sx={{ mr: 1 }} />
              <Typography variant="body2" fontWeight="medium">
                Processing Time: 1-3 business days
              </Typography>
            </Box>
            <Typography variant="body2">
              Your withdrawal will be reviewed by our admin team before processing.
              You will receive email notifications about status updates.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmWithdrawal}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
          >
            {loading ? 'Submitting...' : 'Confirm Withdrawal'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default WithdrawalForm