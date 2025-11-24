import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Box,
  Typography
} from '@mui/material'
// import { DatePicker } from '@mui/x-date-pickers/DatePicker'
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { portfolioService } from '../../services/portfolioService'
import { StatementRequest } from '../../types/portfolio'

interface StatementGeneratorProps {
  open: boolean
  onClose: () => void
  onGenerated?: (statementId: string) => void
}

const StatementGenerator: React.FC<StatementGeneratorProps> = ({
  open,
  onClose,
  onGenerated
}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<StatementRequest>({
    type: 'monthly',
    periodStart: '',
    periodEnd: '',
    format: 'pdf',
    includeTransactions: true,
    includeHoldings: true
  })
  
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)

  const handleSubmit = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates')
      return
    }

    if (startDate >= endDate) {
      setError('End date must be after start date')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const request: StatementRequest = {
        ...formData,
        periodStart: startDate.toISOString().split('T')[0],
        periodEnd: endDate.toISOString().split('T')[0]
      }

      const response = await portfolioService.generateStatement(request)
      
      if (response.success) {
        setSuccess('Statement generated successfully!')
        onGenerated?.(response.data.statementId)
        
        // If download URL is available, trigger download
        if (response.data.downloadUrl) {
          window.open(response.data.downloadUrl, '_blank')
        }
        
        // Close dialog after a short delay
        setTimeout(() => {
          onClose()
          setSuccess(null)
        }, 2000)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate statement')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
      setError(null)
      setSuccess(null)
    }
  }

  const getPresetDates = (type: string) => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()
    
    switch (type) {
      case 'monthly': {
        // Previous month
        const prevMonth = new Date(currentYear, currentMonth - 1, 1)
        const prevMonthEnd = new Date(currentYear, currentMonth, 0)
        setStartDate(prevMonth)
        setEndDate(prevMonthEnd)
        break
      }
        
      case 'quarterly': {
        // Previous quarter
        const quarterStart = new Date(currentYear, Math.floor(currentMonth / 3) * 3 - 3, 1)
        const quarterEnd = new Date(currentYear, Math.floor(currentMonth / 3) * 3, 0)
        setStartDate(quarterStart)
        setEndDate(quarterEnd)
        break
      }
        
      case 'annual': {
        // Previous year
        const yearStart = new Date(currentYear - 1, 0, 1)
        const yearEnd = new Date(currentYear - 1, 11, 31)
        setStartDate(yearStart)
        setEndDate(yearEnd)
        break
      }
        
      default:
        // Custom - clear dates
        setStartDate(null)
        setEndDate(null)
    }
  }

  const handleTypeChange = (type: string) => {
    setFormData(prev => ({ ...prev, type: type as any }))
    getPresetDates(type)
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Generate Portfolio Statement</DialogTitle>
      
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Statement Type"
                value={formData.type}
                onChange={(e) => handleTypeChange(e.target.value)}
                disabled={loading}
              >
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="quarterly">Quarterly</MenuItem>
                <MenuItem value="annual">Annual</MenuItem>
                <MenuItem value="custom">Custom Period</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Format"
                value={formData.format}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  format: e.target.value as any 
                }))}
                disabled={loading}
              >
                <MenuItem value="pdf">PDF</MenuItem>
                <MenuItem value="csv">CSV</MenuItem>
                <MenuItem value="excel">Excel</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                value={startDate?.toISOString().split('T')[0] || ''}
                onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : null)}
                disabled={loading}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="End Date"
                value={endDate?.toISOString().split('T')[0] || ''}
                onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : null)}
                disabled={loading}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Include in Statement:
              </Typography>
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.includeHoldings}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      includeHoldings: e.target.checked 
                    }))}
                    disabled={loading}
                  />
                }
                label="Current Holdings"
              />
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.includeTransactions}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      includeTransactions: e.target.checked 
                    }))}
                    disabled={loading}
                  />
                }
                label="Transaction History"
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !startDate || !endDate}
          startIcon={loading ? <CircularProgress size={20} /> : undefined}
        >
          {loading ? 'Generating...' : 'Generate Statement'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default StatementGenerator