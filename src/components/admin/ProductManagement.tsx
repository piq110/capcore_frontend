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
  Edit as EditIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  Business as BusinessIcon,
} from '@mui/icons-material'
import { adminService } from '../../services/adminService'
import { AdminProduct, ProductFilters } from '../../types/admin'

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [totalProducts, setTotalProducts] = useState(0)
  
  // Filters
  const [filters, setFilters] = useState<ProductFilters>({
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })
  
  // Dialogs
  const [createDialog, setCreateDialog] = useState(false)
  const [editDialog, setEditDialog] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null)
  
  // Form data for create/edit
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    type: 'REIT' as 'REIT' | 'BDC',
    description: '',
    strategy: '',
    sharePrice: 0,
    totalShares: 0,
    minimumInvestment: 1000,
    fees: {
      managementFee: 0,
      performanceFee: 0,
      acquisitionFee: 0,
      dispositionFee: 0,
    },
    sector: '',
    geography: '',
    targetReturn: 0,
    distributionFrequency: 'quarterly' as 'monthly' | 'quarterly' | 'annually',
    overviewData: {
      totalInvestments: 0,
      floatingRatePercentage: 0,
      totalValue: 0,
      totalAssets: 0,
      totalLiabilities: 0,
      eps: 0,
      lastSalePrice: 0,
      contactWebsite: '',
      contactPhone: '',
      portfolioAllocation: {
        seniorSecuredLoans: 0,
        preferredEquity: 0,
        seniorSecuredBonds: 0,
        other: 0,
      },
    },
  })

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await adminService.getProducts({
        ...filters,
        limit: rowsPerPage,
        offset: page * rowsPerPage,
      })
      
      if (response.success) {
        setProducts(response.data.products)
        setTotalProducts(response.data.pagination.total)
      } else {
        setError('Failed to load products')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [page, rowsPerPage, filters])

  const handleFilterChange = (field: keyof ProductFilters, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }))
    setPage(0)
  }

  const handleCreateProduct = async () => {
    try {
      const response = await adminService.createProduct(formData)
      
      if (response.success) {
        setCreateDialog(false)
        resetForm()
        loadProducts()
      } else {
        setError('Failed to create product')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create product')
    }
  }

  const handleUpdateProduct = async () => {
    if (!selectedProduct) return
    
    try {
      const response = await adminService.updateProduct(selectedProduct.id, formData)
      
      if (response.success) {
        setEditDialog(false)
        setSelectedProduct(null)
        resetForm()
        loadProducts()
      } else {
        setError('Failed to update product')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update product')
    }
  }

  const handleStatusChange = async (productId: string, status: 'active' | 'on_hold' | 'inactive') => {
    try {
      const response = await adminService.updateProductStatus(productId, status)
      
      if (response.success) {
        loadProducts()
      } else {
        setError('Failed to update product status')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update product status')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      symbol: '',
      type: 'REIT',
      description: '',
      strategy: '',
      sharePrice: 0,
      totalShares: 0,
      minimumInvestment: 1000,
      fees: {
        managementFee: 0,
        performanceFee: 0,
        acquisitionFee: 0,
        dispositionFee: 0,
      },
      sector: '',
      geography: '',
      targetReturn: 0,
      distributionFrequency: 'quarterly',
      overviewData: {
        totalInvestments: 0,
        floatingRatePercentage: 0,
        totalValue: 0,
        totalAssets: 0,
        totalLiabilities: 0,
        eps: 0,
        lastSalePrice: 0,
        contactWebsite: '',
        contactPhone: '',
        portfolioAllocation: {
          seniorSecuredLoans: 0,
          preferredEquity: 0,
          seniorSecuredBonds: 0,
          other: 0,
        },
      },
    })
  }

  const openEditDialog = (product: AdminProduct) => {
    setSelectedProduct(product)
    setFormData({
      name: product.name,
      symbol: product.symbol,
      type: product.type,
      description: product.description || '',
      strategy: product.strategy || '',
      sharePrice: product.sharePrice,
      totalShares: product.totalShares,
      minimumInvestment: product.minimumInvestment || 1000,
      fees: product.fees || {
        managementFee: 0,
        performanceFee: 0,
        acquisitionFee: 0,
        dispositionFee: 0,
      },
      sector: product.sector || '',
      geography: product.geography || '',
      targetReturn: product.targetReturn || 0,
      distributionFrequency: product.distributionFrequency || 'quarterly',
      overviewData: {
        totalInvestments: product.overviewData?.totalInvestments ?? 0,
        floatingRatePercentage: product.overviewData?.floatingRatePercentage ?? 0,
        totalValue: product.overviewData?.totalValue ?? 0,
        totalAssets: product.overviewData?.totalAssets ?? 0,
        totalLiabilities: product.overviewData?.totalLiabilities ?? 0,

        eps: product.overviewData?.eps ?? 0,
        lastSalePrice: product.overviewData?.lastSalePrice ?? 0,
        contactWebsite: product.overviewData?.contactWebsite ?? '',
        contactPhone: product.overviewData?.contactPhone ?? '',
        portfolioAllocation: {
          seniorSecuredLoans: product.overviewData?.portfolioAllocation?.seniorSecuredLoans ?? 0,
          preferredEquity: product.overviewData?.portfolioAllocation?.preferredEquity ?? 0,
          seniorSecuredBonds: product.overviewData?.portfolioAllocation?.seniorSecuredBonds ?? 0,
          other: product.overviewData?.portfolioAllocation?.other ?? 0,
        },
      },
    })
    setEditDialog(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'on_hold': return 'warning'
      case 'inactive': return 'error'
      default: return 'default'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }



  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          Product Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialog(true)}
        >
          Add Product
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Products
              </Typography>
              <Typography variant="h4">
                {totalProducts}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Products
              </Typography>
              <Typography variant="h4" color="success.main">
                {products.filter(p => p.status === 'active').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                REITs
              </Typography>
              <Typography variant="h4" color="primary.main">
                {products.filter(p => p.type === 'REIT').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                BDCs
              </Typography>
              <Typography variant="h4" color="secondary.main">
                {products.filter(p => p.type === 'BDC').length}
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
              <InputLabel>Type</InputLabel>
              <Select
                value={filters.type || ''}
                label="Type"
                onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="REIT">REIT</MenuItem>
                <MenuItem value="BDC">BDC</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status || ''}
                label="Status"
                onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="on_hold">On Hold</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={filters.sortBy || 'createdAt'}
                label="Sort By"
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="sharePrice">Share Price</MenuItem>
                <MenuItem value="createdAt">Created Date</MenuItem>
                <MenuItem value="marketCap">Market Cap</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadProducts}
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

      {/* Products Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Share Price</TableCell>
              <TableCell>Market Cap</TableCell>
              <TableCell>Availability</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Issuer</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Loading products...
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {product.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {product.symbol}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={product.type}
                      color={product.type === 'REIT' ? 'primary' : 'secondary'}
                      size="small"
                      icon={product.type === 'REIT' ? <BusinessIcon /> : <TrendingUpIcon />}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {formatCurrency(product.sharePrice)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatCurrency(product.marketCap)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {((product.availableShares / product.totalShares) * 100).toFixed(1)}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {product.availableShares.toLocaleString()} / {product.totalShares.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={product.status.replace('_', ' ')}
                      color={getStatusColor(product.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {product.issuer.companyName || product.issuer.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="View Details">
                        <IconButton size="small">
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Product">
                        <IconButton size="small" onClick={() => openEditDialog(product)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <FormControl size="small" sx={{ minWidth: 80 }}>
                        <Select
                          value={product.status}
                          onChange={(e) => handleStatusChange(product.id, e.target.value as any)}
                          size="small"
                        >
                          <MenuItem value="active">Active</MenuItem>
                          <MenuItem value="on_hold">On Hold</MenuItem>
                          <MenuItem value="inactive">Inactive</MenuItem>
                        </Select>
                      </FormControl>
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
          count={totalProducts}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10))
            setPage(0)
          }}
        />
      </TableContainer>

      {/* Create Product Dialog */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Product</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Product Name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Symbol"
                value={formData.symbol}
                onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.type}
                  label="Type"
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                >
                  <MenuItem value="REIT">REIT</MenuItem>
                  <MenuItem value="BDC">BDC</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Share Price"
                type="number"
                value={formData.sharePrice}
                onChange={(e) => setFormData(prev => ({ ...prev, sharePrice: parseFloat(e.target.value) || 0 }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Total Shares"
                type="number"
                value={formData.totalShares}
                onChange={(e) => setFormData(prev => ({ ...prev, totalShares: parseInt(e.target.value) || 0 }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Minimum Investment"
                type="number"
                value={formData.minimumInvestment}
                onChange={(e) => setFormData(prev => ({ ...prev, minimumInvestment: parseFloat(e.target.value) || 0 }))}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                multiline
                rows={3}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Investment Strategy"
                value={formData.strategy}
                onChange={(e) => setFormData(prev => ({ ...prev, strategy: e.target.value }))}
                multiline
                rows={2}
                required
              />
            </Grid>
            
            {/* Overview Data Section */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                Overview Information
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Total Investments"
                type="number"
                value={formData.overviewData?.totalInvestments || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  overviewData: { 
                    ...prev.overviewData, 
                    totalInvestments: parseInt(e.target.value) || 0 
                  } 
                }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Floating Rate Percentage"
                type="number"
                value={formData.overviewData?.floatingRatePercentage || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  overviewData: { 
                    ...prev.overviewData, 
                    floatingRatePercentage: parseFloat(e.target.value) || 0 
                  } 
                }))}
                InputProps={{ endAdornment: '%' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Total Value"
                type="number"
                value={formData.overviewData?.totalValue || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  overviewData: { 
                    ...prev.overviewData, 
                    totalValue: parseFloat(e.target.value) || 0 
                  } 
                }))}
                InputProps={{ startAdornment: '$' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Total Assets"
                type="number"
                value={formData.overviewData?.totalAssets || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  overviewData: { 
                    ...prev.overviewData, 
                    totalAssets: parseFloat(e.target.value) || 0 
                  } 
                }))}
                InputProps={{ startAdornment: '$' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Total Liabilities"
                type="number"
                value={formData.overviewData?.totalLiabilities || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  overviewData: { 
                    ...prev.overviewData, 
                    totalLiabilities: parseFloat(e.target.value) || 0 
                  } 
                }))}
                InputProps={{ startAdornment: '$' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="EPS (Earnings Per Share)"
                type="number"
                value={formData.overviewData?.eps || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  overviewData: { 
                    ...prev.overviewData, 
                    eps: parseFloat(e.target.value) || 0 
                  } 
                }))}
                InputProps={{ startAdornment: '$' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Sale Price"
                type="number"
                value={formData.overviewData?.lastSalePrice || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  overviewData: { 
                    ...prev.overviewData, 
                    lastSalePrice: parseFloat(e.target.value) || 0 
                  } 
                }))}
                InputProps={{ startAdornment: '$' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Website"
                value={formData.overviewData?.contactWebsite || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  overviewData: { 
                    ...prev.overviewData, 
                    contactWebsite: e.target.value 
                  } 
                }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Phone"
                value={formData.overviewData?.contactPhone || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  overviewData: { 
                    ...prev.overviewData, 
                    contactPhone: e.target.value 
                  } 
                }))}
              />
            </Grid>
            
            {/* Portfolio Allocation Section */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                Portfolio Allocation (%)
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Senior Secured Loans"
                type="number"
                value={formData.overviewData?.portfolioAllocation?.seniorSecuredLoans || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  overviewData: { 
                    ...prev.overviewData, 
                    portfolioAllocation: {
                      ...prev.overviewData?.portfolioAllocation,
                      seniorSecuredLoans: parseFloat(e.target.value) || 0 
                    }
                  } 
                }))}
                InputProps={{ endAdornment: '%' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Preferred Equity"
                type="number"
                value={formData.overviewData?.portfolioAllocation?.preferredEquity || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  overviewData: { 
                    ...prev.overviewData, 
                    portfolioAllocation: {
                      ...prev.overviewData?.portfolioAllocation,
                      preferredEquity: parseFloat(e.target.value) || 0 
                    }
                  } 
                }))}
                InputProps={{ endAdornment: '%' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Senior Secured Bonds"
                type="number"
                value={formData.overviewData?.portfolioAllocation?.seniorSecuredBonds || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  overviewData: { 
                    ...prev.overviewData, 
                    portfolioAllocation: {
                      ...prev.overviewData?.portfolioAllocation,
                      seniorSecuredBonds: parseFloat(e.target.value) || 0 
                    }
                  } 
                }))}
                InputProps={{ endAdornment: '%' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Other"
                type="number"
                value={formData.overviewData?.portfolioAllocation?.other || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  overviewData: { 
                    ...prev.overviewData, 
                    portfolioAllocation: {
                      ...prev.overviewData?.portfolioAllocation,
                      other: parseFloat(e.target.value) || 0 
                    }
                  } 
                }))}
                InputProps={{ endAdornment: '%' }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateProduct} 
            variant="contained"
            disabled={!formData.name || !formData.symbol || !formData.description}
          >
            Create Product
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          Edit Product: {selectedProduct?.name}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            {/* Basic Product Info */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Product Name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Symbol"
                value={formData.symbol}
                onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Share Price"
                type="number"
                value={formData.sharePrice}
                onChange={(e) => setFormData(prev => ({ ...prev, sharePrice: parseFloat(e.target.value) || 0 }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Total Shares"
                type="number"
                value={formData.totalShares}
                onChange={(e) => setFormData(prev => ({ ...prev, totalShares: parseInt(e.target.value) || 0 }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Minimum Investment"
                type="number"
                value={formData.minimumInvestment}
                onChange={(e) => setFormData(prev => ({ ...prev, minimumInvestment: parseFloat(e.target.value) || 0 }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Sector"
                value={formData.sector}
                onChange={(e) => setFormData(prev => ({ ...prev, sector: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Geography"
                value={formData.geography}
                onChange={(e) => setFormData(prev => ({ ...prev, geography: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Target Return (%)"
                type="number"
                value={formData.targetReturn}
                onChange={(e) => setFormData(prev => ({ ...prev, targetReturn: parseFloat(e.target.value) || 0 }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                multiline
                rows={3}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Investment Strategy"
                value={formData.strategy}
                onChange={(e) => setFormData(prev => ({ ...prev, strategy: e.target.value }))}
                multiline
                rows={2}
                required
              />
            </Grid>
            
            {/* Overview Data Section */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                Overview Information
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Total Investments"
                type="number"
                value={formData.overviewData?.totalInvestments || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  overviewData: { 
                    ...prev.overviewData, 
                    totalInvestments: parseInt(e.target.value) || 0 
                  } 
                }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Floating Rate Percentage"
                type="number"
                value={formData.overviewData?.floatingRatePercentage || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  overviewData: { 
                    ...prev.overviewData, 
                    floatingRatePercentage: parseFloat(e.target.value) || 0 
                  } 
                }))}
                InputProps={{ endAdornment: '%' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Total Value"
                type="number"
                value={formData.overviewData?.totalValue || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  overviewData: { 
                    ...prev.overviewData, 
                    totalValue: parseFloat(e.target.value) || 0 
                  } 
                }))}
                InputProps={{ startAdornment: '$' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Total Assets"
                type="number"
                value={formData.overviewData?.totalAssets || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  overviewData: { 
                    ...prev.overviewData, 
                    totalAssets: parseFloat(e.target.value) || 0 
                  } 
                }))}
                InputProps={{ startAdornment: '$' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Total Liabilities"
                type="number"
                value={formData.overviewData?.totalLiabilities || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  overviewData: { 
                    ...prev.overviewData, 
                    totalLiabilities: parseFloat(e.target.value) || 0 
                  } 
                }))}
                InputProps={{ startAdornment: '$' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="EPS (Earnings Per Share)"
                type="number"
                value={formData.overviewData?.eps || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  overviewData: { 
                    ...prev.overviewData, 
                    eps: parseFloat(e.target.value) || 0 
                  } 
                }))}
                InputProps={{ startAdornment: '$' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Sale Price"
                type="number"
                value={formData.overviewData?.lastSalePrice || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  overviewData: { 
                    ...prev.overviewData, 
                    lastSalePrice: parseFloat(e.target.value) || 0 
                  } 
                }))}
                InputProps={{ startAdornment: '$' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Website"
                value={formData.overviewData?.contactWebsite || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  overviewData: { 
                    ...prev.overviewData, 
                    contactWebsite: e.target.value 
                  } 
                }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Phone"
                value={formData.overviewData?.contactPhone || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  overviewData: { 
                    ...prev.overviewData, 
                    contactPhone: e.target.value 
                  } 
                }))}
              />
            </Grid>
            
            {/* Portfolio Allocation Section */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                Portfolio Allocation (%)
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Senior Secured Loans"
                type="number"
                value={formData.overviewData?.portfolioAllocation?.seniorSecuredLoans || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  overviewData: { 
                    ...prev.overviewData, 
                    portfolioAllocation: {
                      ...prev.overviewData?.portfolioAllocation,
                      seniorSecuredLoans: parseFloat(e.target.value) || 0 
                    }
                  } 
                }))}
                InputProps={{ endAdornment: '%' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Preferred Equity"
                type="number"
                value={formData.overviewData?.portfolioAllocation?.preferredEquity || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  overviewData: { 
                    ...prev.overviewData, 
                    portfolioAllocation: {
                      ...prev.overviewData?.portfolioAllocation,
                      preferredEquity: parseFloat(e.target.value) || 0 
                    }
                  } 
                }))}
                InputProps={{ endAdornment: '%' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Senior Secured Bonds"
                type="number"
                value={formData.overviewData?.portfolioAllocation?.seniorSecuredBonds || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  overviewData: { 
                    ...prev.overviewData, 
                    portfolioAllocation: {
                      ...prev.overviewData?.portfolioAllocation,
                      seniorSecuredBonds: parseFloat(e.target.value) || 0 
                    }
                  } 
                }))}
                InputProps={{ endAdornment: '%' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Other"
                type="number"
                value={formData.overviewData?.portfolioAllocation?.other || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  overviewData: { 
                    ...prev.overviewData, 
                    portfolioAllocation: {
                      ...prev.overviewData?.portfolioAllocation,
                      other: parseFloat(e.target.value) || 0 
                    }
                  } 
                }))}
                InputProps={{ endAdornment: '%' }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateProduct} 
            variant="contained"
          >
            Update Product
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ProductManagement