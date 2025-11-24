import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Chip,
  Button,
  CircularProgress,
  Pagination,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  IconButton,
  useTheme,
} from '@mui/material'
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Business as BusinessIcon,
  AccountBalance as AccountBalanceIcon,
} from '@mui/icons-material'
import { InvestmentProduct, ProductFilters } from '../../types/marketplace'
import { marketplaceService } from '../../services/marketplaceService'
import { useAuth } from '../../hooks/useAuth'
import InfoBar from '../common/InfoBar'
import { useNavigate } from 'react-router-dom'

interface MarketplaceBrowserProps {
  onProductSelect: (product: InvestmentProduct) => void
}

const MarketplaceBrowser: React.FC<MarketplaceBrowserProps> = ({ onProductSelect }) => {
  console.log('MarketplaceBrowser: Component mounting')
  
  const theme = useTheme()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [products, setProducts] = useState<InvestmentProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters] = useState<ProductFilters>({
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })
  const [selectedType, setSelectedType] = useState<'ALL' | 'REIT' | 'BDC'>('ALL')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    hasMore: false
  })

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Apply type filter
      const combinedFilters = selectedType !== 'ALL' ? { ...filters, type: selectedType } : filters

      let response
      if (searchQuery.trim()) {
        const searchResults = await marketplaceService.searchProducts(searchQuery, combinedFilters)
        response = {
          data: {
            products: searchResults,
            pagination: {
              total: searchResults.length,
              limit: pagination.limit,
              offset: (pagination.page - 1) * pagination.limit,
              hasMore: false
            }
          }
        }
      } else {
        response = await marketplaceService.getProducts(
          combinedFilters,
          pagination.limit,
          (pagination.page - 1) * pagination.limit
        )
      }

      console.log('MarketplaceBrowser: Setting products:', response.data.products)
      setProducts(response.data.products)
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination.total,
        hasMore: response.data.pagination.hasMore
      }))
    } catch (err) {
      console.error('Failed to load products:', err)
      setError('Failed to load investment products. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [filters, pagination.limit, pagination.page, searchQuery, selectedType])

  useEffect(() => {
    console.log('MarketplaceBrowser: useEffect triggered, calling loadProducts')
    loadProducts()
  }, [loadProducts])

  useEffect(() => {
    // Reset to first page when filters change
    if (pagination.page !== 1) {
      setPagination(prev => ({ ...prev, page: 1 }))
    }
  }, [searchQuery, selectedType, pagination.page])

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setPagination(prev => ({ ...prev, page }))
  }



  const handleTypeFilter = (type: 'ALL' | 'REIT' | 'BDC') => {
    setSelectedType(type)
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const getProductIcon = (type: string) => {
    return type === 'REIT' ? <AccountBalanceIcon /> : <BusinessIcon />
  }

  const handleStartKYC = () => {
    navigate('/account')
  }

  console.log('MarketplaceBrowser: Render - loading:', loading, 'products.length:', products.length, 'error:', error)

  if (loading && products.length === 0) {
    console.log('MarketplaceBrowser: Showing loading spinner')
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            Marketplace
          </Typography>

        </Box>
      </Box>

      {/* KYC Warning */}
      {user && user.kycStatus !== 'approved' && (
        <InfoBar
          title="Identity Verification Required"
          message="Complete KYC verification to access investment products and place orders."
          severity="warning"
          closable={true}
          collapsible={true}
          defaultExpanded={true}
          actions={[
            {
              label: 'Start KYC Verification',
              onClick: handleStartKYC,
              variant: 'contained',
              color: 'primary',
              size: 'small',
            },
          ]}
          sx={{ mb: 3 }}
        />
      )}

      {/* Featured Products Section */}
      <Box mb={4}>
        <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
          Featured Products
        </Typography>
        
        {/* Search and Filter Bar */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <TextField
            placeholder="Search investment products..."
            value={searchQuery}
            onChange={handleSearchChange}
            size="small"
            sx={{ width: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Box display="flex" gap={1}>
            <Chip 
              label="ALL" 
              variant={selectedType === 'ALL' ? 'filled' : 'outlined'}
              color={selectedType === 'ALL' ? 'primary' : 'default'}
              onClick={() => handleTypeFilter('ALL')}
              clickable
            />
            <Chip 
              label="REITs" 
              variant={selectedType === 'REIT' ? 'filled' : 'outlined'}
              color={selectedType === 'REIT' ? 'primary' : 'default'}
              onClick={() => handleTypeFilter('REIT')}
              clickable
            />
            <Chip 
              label="BDCs" 
              variant={selectedType === 'BDC' ? 'filled' : 'outlined'}
              color={selectedType === 'BDC' ? 'primary' : 'default'}
              onClick={() => handleTypeFilter('BDC')}
              clickable
            />
          </Box>
        </Box>

        {/* Error Display */}
        {error && (
          <InfoBar
            message={error}
            severity="error"
            closable={true}
            onClose={() => setError(null)}
            sx={{ mb: 3 }}
          />
        )}

        {/* Featured Products Grid */}
        {products.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="text.secondary">
              No investment products found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search criteria or filters
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {(() => {
              console.log('MarketplaceBrowser: Rendering products grid, products:', products)
              return products.slice(0, 6).map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[8],
                    },
                    backgroundColor: theme.palette.background.paper,
                  }}
                  onClick={() => onProductSelect(product)}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: theme.palette.primary.main,
                          mr: 2,
                        }}
                      >
                        {getProductIcon(product.type)}
                      </Avatar>
                      <Box flexGrow={1}>
                        <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {product.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {product.symbol} • {product.type}
                        </Typography>
                      </Box>
                    </Box>

                    <Box mb={3}>
                      <Grid container spacing={2}>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            NAV
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {formatCurrency(product.sharePrice)}
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Min Investment
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {formatCurrency(product.minimumInvestment)}
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Available
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {product.availableShares.toLocaleString()}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>

                    <Box display="flex" gap={1} mb={2}>
                      <Button
                        variant="contained"
                        size="small"
                        sx={{ 
                          minWidth: 60,
                          backgroundColor: theme.palette.primary.main,
                          '&:hover': {
                            backgroundColor: theme.palette.primary.dark,
                          }
                        }}
                      >
                        Buy
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ minWidth: 60 }}
                      >
                        Sell
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              ))
            })()}
          </Grid>
        )}
      </Box>

      {/* Additional Investment Opportunities */}
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
            Additional Investment Opportunities
          </Typography>
          <Button variant="text" sx={{ textTransform: 'none' }}>
            Learn More →
          </Button>
        </Box>

        {/* Table View */}
        <TableContainer component={Card}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    Name
                    <IconButton size="small" sx={{ ml: 1 }}>
                      <FilterIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell align="right">NAV</TableCell>
                <TableCell align="right">Min Investment</TableCell>
                <TableCell align="right">Available Shares</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.slice(6).map((product) => (
                <TableRow 
                  key={product.id}
                  hover
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    }
                  }}
                  onClick={() => onProductSelect(product)}
                >
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: theme.palette.primary.main,
                          mr: 2,
                        }}
                      >
                        {getProductIcon(product.type)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {product.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {product.symbol}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {formatCurrency(product.sharePrice)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {formatCurrency(product.minimumInvestment)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {product.availableShares.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box display="flex" gap={1} justifyContent="flex-end">
                      <Button
                        variant="contained"
                        size="small"
                        sx={{ minWidth: 60 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          // Handle buy action
                        }}
                      >
                        Buy
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ minWidth: 60 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          // Handle sell action
                        }}
                      >
                        Sell
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Loading Indicator */}
      {loading && products.length > 0 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <CircularProgress />
        </Box>
      )}

      {/* Pagination */}
      {pagination.total > pagination.limit && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={Math.ceil(pagination.total / pagination.limit)}
            page={pagination.page}
            onChange={handlePageChange}
            color="primary"
            size="large"
          />
        </Box>
      )}
    </Box>
  )
}

export default MarketplaceBrowser