import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
} from '@mui/material'
import { adminService } from '../../services/adminService'
import { useNotification } from '../../hooks/useNotification'

interface BalanceAdjustmentDialogProps {
  open: boolean
  onClose: () => void
  user: {
    id: string
    email: string
  } | null
  onSuccess?: () => void
}

const BalanceAdjustmentDialog: React.FC<BalanceAdjustmentDialogProps> = ({
  open,
  onClose,
  user,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    network: 'ethereum',
    token: 'usdt',
    amount: '',
    operation: 'add',
    reason: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const { showNotification } = useNotification()

  const handleSubmit = async () => {
    if (!user || !formData.amount || !formData.reason.trim()) {
      showNotification('Please fill in all required fields', { severity: 'error' })
      return
    }

    try {
      setLoading(true)
      
      const response = await adminService.adjustUserBalance(user.id, {
        network: formData.network as 'ethereum' | 'tron' | 'bsc',
        token: formData.token as 'usdt' | 'usdc',
        amount: parseFloat(formData.amount),
        operation: formData.operation as 'set' | 'add' | 'subtract',
        reason: formData.reason,
        notes: formData.notes
      })

      if (response.success) {
        showNotification('Balance adjusted successfully', { severity: 'success' })
        handleClose()
        onSuccess?.()
      } else {
        showNotification(response.message || 'Failed to adjust balance', { severity: 'error' })
      }
    } catch (err: any) {
      console.error('Failed to adjust balance:', err)
      showNotification(err.response?.data?.message || 'Failed to adjust balance', { severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      network: 'ethereum',
      token: 'usdt',
      amount: '',
      operation: 'add',
      reason: '',
      notes: ''
    })
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Adjust User Balance</DialogTitle>
      <DialogContent>
        {user && (
          <Box>
            <Alert severity="warning" sx={{ mb: 3 }}>
              You are about to adjust the balance for user: <strong>{user.email}</strong>
            </Alert>

            <Box display="flex" gap={2} mb={2}>
              <FormControl fullWidth>
                <InputLabel>Network</InputLabel>
                <Select
                  value={formData.network}
                  onChange={(e) => setFormData({ ...formData, network: e.target.value })}
                  label="Network"
                >
                  <MenuItem value="ethereum">Ethereum</MenuItem>
                  <MenuItem value="tron">Tron</MenuItem>
                  <MenuItem value="bsc">BSC</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Token</InputLabel>
                <Select
                  value={formData.token}
                  onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                  label="Token"
                >
                  <MenuItem value="usdt">USDT</MenuItem>
                  <MenuItem value="usdc">USDC</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box display="flex" gap={2} mb={2}>
              <FormControl fullWidth>
                <InputLabel>Operation</InputLabel>
                <Select
                  value={formData.operation}
                  onChange={(e) => setFormData({ ...formData, operation: e.target.value })}
                  label="Operation"
                >
                  <MenuItem value="add">Add</MenuItem>
                  <MenuItem value="subtract">Subtract</MenuItem>
                  <MenuItem value="set">Set To</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Amount"
                type="number"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Box>

            <TextField
              fullWidth
              label="Reason"
              required
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              sx={{ mb: 2 }}
              helperText="Required: Explain why this adjustment is being made"
            />

            <TextField
              fullWidth
              label="Additional Notes"
              multiline
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              helperText="Optional: Any additional context or details"
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !formData.amount || !formData.reason.trim()}
        >
          {loading ? 'Adjusting...' : 'Adjust Balance'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default BalanceAdjustmentDialog