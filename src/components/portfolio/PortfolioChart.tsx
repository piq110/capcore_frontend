import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Alert,
  Grid,
  Chip,
  useTheme
} from '@mui/material'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'
import { portfolioService } from '../../services/portfolioService'
import { PortfolioPerformance } from '../../types/portfolio'
import { formatCurrency, formatPercentage } from '../../utils/portfolioCalculations'

const PortfolioChart: React.FC = () => {
  const theme = useTheme()
  const [performance, setPerformance] = useState<PortfolioPerformance | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<'1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL'>('1M')

  const fetchPerformance = async (selectedPeriod: typeof period) => {
    try {
      setLoading(true)
      setError(null)
      const response = await portfolioService.getPerformance(selectedPeriod)
      
      // Transform the API response to match PortfolioPerformance interface
      const apiData = response.data as any // API returns data directly, not wrapped in { performance: ... }
      const transformedPerformance: PortfolioPerformance = {
        period: selectedPeriod,
        data: apiData.performanceHistory?.map((item: any) => ({
          date: item.date,
          value: item.cumulativeRealized || 0,
          pnl: (item.cumulativeRealized || 0) - (item.cumulativeInvested || 0),
          pnlPercentage: item.cumulativeInvested > 0 
            ? (((item.cumulativeRealized || 0) - (item.cumulativeInvested || 0)) / (item.cumulativeInvested || 0)) * 100 
            : 0
        })) || [],
        totalReturn: apiData.summary?.totalReturn || 0,
        totalReturnPercentage: apiData.summary?.totalReturn || 0,
        annualizedReturn: undefined, // Not provided in API response
        volatility: undefined, // Not provided in API response
        sharpeRatio: undefined, // Not provided in API response
        maxDrawdown: undefined, // Not provided in API response
      }
      
      setPerformance(transformedPerformance)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load performance data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPerformance(period)
  }, [period])

  const handlePeriodChange = (
    _event: React.MouseEvent<HTMLElement>,
    newPeriod: typeof period
  ) => {
    if (newPeriod !== null) {
      setPeriod(newPeriod)
    }
  }

  const formatTooltipValue = (value: number, name: string) => {
    if (name === 'value') {
      return [formatCurrency(value), 'Portfolio Value']
    }
    if (name === 'pnl') {
      return [formatCurrency(value), 'P&L']
    }
    if (name === 'pnlPercentage') {
      return [formatPercentage(value), 'P&L %']
    }
    return [value, name]
  }

  const formatTooltipLabel = (label: string) => {
    return new Date(label).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: period === '1D' ? undefined : 'numeric'
    })
  }

  const getPerformanceColor = (value: number) => {
    return value >= 0 ? theme.palette.success.main : theme.palette.error.main
  }

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">{error}</Alert>
        </CardContent>
      </Card>
    )
  }

  if (!performance || !performance.data) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Portfolio Performance
          </Typography>
          <Alert severity="info">
            Performance data will be available once you have investment activity.
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">
            Portfolio Performance
          </Typography>
          <ToggleButtonGroup
            value={period}
            exclusive
            onChange={handlePeriodChange}
            size="small"
          >
            <ToggleButton value="1D">1D</ToggleButton>
            <ToggleButton value="1W">1W</ToggleButton>
            <ToggleButton value="1M">1M</ToggleButton>
            <ToggleButton value="3M">3M</ToggleButton>
            <ToggleButton value="6M">6M</ToggleButton>
            <ToggleButton value="1Y">1Y</ToggleButton>
            <ToggleButton value="ALL">ALL</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Performance Metrics */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Box textAlign="center">
              <Typography variant="body2" color="textSecondary">
                Total Return
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ color: getPerformanceColor(performance?.totalReturn || 0) }}
              >
                {formatCurrency(performance?.totalReturn || 0)}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ color: getPerformanceColor(performance?.totalReturn || 0) }}
              >
                {formatPercentage(performance?.totalReturnPercentage || 0)}
              </Typography>
            </Box>
          </Grid>

          {performance?.annualizedReturn !== undefined && (
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography variant="body2" color="textSecondary">
                  Annualized Return
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ color: getPerformanceColor(performance?.annualizedReturn || 0) }}
                >
                  {formatPercentage(performance?.annualizedReturn || 0)}
                </Typography>
              </Box>
            </Grid>
          )}

          {performance?.volatility !== undefined && (
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography variant="body2" color="textSecondary">
                  Volatility
                </Typography>
                <Typography variant="h6">
                  {formatPercentage(performance?.volatility || 0)}
                </Typography>
              </Box>
            </Grid>
          )}

          {performance?.sharpeRatio !== undefined && (
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography variant="body2" color="textSecondary">
                  Sharpe Ratio
                </Typography>
                <Typography variant="h6">
                  {(performance?.sharpeRatio || 0).toFixed(2)}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>

        {/* Chart */}
        <Box height={400}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performance?.data || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatTooltipLabel}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tickFormatter={(value) => formatCurrency(value)}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                formatter={formatTooltipValue}
                labelFormatter={formatTooltipLabel}
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: theme.shape.borderRadius,
                }}
              />
              <ReferenceLine y={0} stroke={theme.palette.divider} strokeDasharray="2 2" />
              <Line
                type="monotone"
                dataKey="value"
                stroke={theme.palette.primary.main}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>

        {/* Performance Indicators */}
        <Box display="flex" gap={1} mt={2} flexWrap="wrap">
          {performance?.maxDrawdown !== undefined && (
            <Chip
              label={`Max Drawdown: ${formatPercentage(performance?.maxDrawdown || 0)}`}
              size="small"
              color={(performance?.maxDrawdown || 0) < -10 ? 'error' : 'default'}
              variant="outlined"
            />
          )}
          <Chip
            label={`Period: ${period}`}
            size="small"
            color="primary"
            variant="outlined"
          />
          <Chip
            label={`Data Points: ${performance?.data?.length || 0}`}
            size="small"
            variant="outlined"
          />
        </Box>
      </CardContent>
    </Card>
  )
}

export default PortfolioChart