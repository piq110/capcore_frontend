import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  List,
  ListItem,
  ListItemText,
  useTheme
} from '@mui/material'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from 'recharts'
import { formatCurrency, formatPercentage } from '../../utils/portfolioCalculations'

interface AllocationChartProps {
  assetAllocation: {
    type: 'REIT' | 'BDC'
    value: number
    percentage: number
  }[]
  sectorAllocation: {
    sector: string
    value: number
    percentage: number
  }[]
}

const AllocationChart: React.FC<AllocationChartProps> = ({
  assetAllocation,
  sectorAllocation
}) => {
  const theme = useTheme()
  const [viewType, setViewType] = useState<'asset' | 'sector'>('asset')

  const handleViewChange = (
    _event: React.MouseEvent<HTMLElement>,
    newView: 'asset' | 'sector'
  ) => {
    if (newView !== null) {
      setViewType(newView)
    }
  }

  // Color palette for charts
  const colors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
    '#8884d8',
    '#82ca9d',
    '#ffc658',
    '#ff7300',
    '#00ff00',
    '#ff00ff'
  ]

  const currentData = viewType === 'asset' ? assetAllocation : sectorAllocation
  const chartData = currentData.map((item, index) => ({
    name: viewType === 'asset' ? (item as any).type : (item as any).sector,
    value: item.value,
    percentage: item.percentage,
    color: colors[index % colors.length]
  }))

  const renderTooltip = (props: any) => {
    if (props.active && props.payload && props.payload.length) {
      const data = props.payload[0].payload
      return (
        <Box
          sx={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: theme.shape.borderRadius,
            p: 1,
            boxShadow: theme.shadows[3]
          }}
        >
          <Typography variant="body2" fontWeight="medium">
            {data.name}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {formatCurrency(data.value)}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {formatPercentage(data.percentage)}
          </Typography>
        </Box>
      )
    }
    return null
  }

  const renderCustomLabel = (entry: any) => {
    if (entry.percentage < 5) return '' // Don't show labels for small slices
    return `${entry.percentage.toFixed(1)}%`
  }

  if (currentData.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Portfolio Allocation
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Allocation data will be available once you have investments.
          </Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Portfolio Allocation
          </Typography>
          <ToggleButtonGroup
            value={viewType}
            exclusive
            onChange={handleViewChange}
            size="small"
          >
            <ToggleButton value="asset">Asset Type</ToggleButton>
            <ToggleButton value="sector">Sector</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Pie Chart */}
        <Box height={300} mb={2}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={renderTooltip} />
            </PieChart>
          </ResponsiveContainer>
        </Box>

        {/* Allocation List */}
        <List dense>
          {chartData.map((item) => (
            <ListItem key={item.name} sx={{ px: 0 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  backgroundColor: item.color,
                  borderRadius: '50%',
                  mr: 1,
                  flexShrink: 0
                }}
              />
              <ListItemText
                primary={
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" fontWeight="medium">
                      {item.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {formatPercentage(item.percentage)}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Typography variant="caption" color="textSecondary">
                    {formatCurrency(item.value)}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>

        {/* Summary */}
        <Box mt={2} pt={2} borderTop={1} borderColor="divider">
          <Typography variant="caption" color="textSecondary">
            {viewType === 'asset' ? 'Asset Type' : 'Sector'} allocation based on current market values
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

export default AllocationChart