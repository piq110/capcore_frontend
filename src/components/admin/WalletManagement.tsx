import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  CircularProgress,
  Tooltip,
  Grid,
  Paper,
} from '@mui/material'
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  ContentCopy as ContentCopyIcon,
  Warning as WarningIcon,
  VpnKey as VpnKeyIcon,
} from '@mui/icons-material'
import { adminService } from '../../services/adminService'
import { useNotification } from '../../hooks/useNotification'

interface Wallet {
  _id: string
  userId: {
    _id: string
    email: string
    firstName?: string
    lastName?: string
    kycStatus: string
  }
  addresses: {
    ethereum?: string
    tron?: string
    bsc?: string
  }
  balances: {
    usdt: {
      ethereum: number
      tron: number
      bsc: number
    }
    usdc: {
      ethereum: number
      tron: number
      bsc: number
    }
  }
  totalBalanceUSD: number
  createdAt: string
}

interface PrivateKeyData {
  walletId: string
  userId: string
  addresses: {
    ethereum?: string
    tron?: string
    bsc?: string
  }
  privateKeys: {
    ethereum?: {
      encryptedKey: string
      iv: string
    }
    tron?: {
      encryptedKey: string
      iv: string
    }
    bsc?: {
      encryptedKey: string
      iv: string
    }
  }
}

const WalletManagement: React.FC = () => {
  const { showSuccess, showError } = useNotification()
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [totalWallets, setTotalWallets] = useState(0)
  
  // Private key dialog state
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null)
  const [privateKeyDialogOpen, setPrivateKeyDialogOpen] = useState(false)
  const [privateKeyData, setPrivateKeyData] = useState<PrivateKeyData | null>(null)
  const [decryptedKeys, setDecryptedKeys] = useState<Record<string, string>>({})
  const [loadingPrivateKeys, setLoadingPrivateKeys] = useState(false)
  const [decryptingNetwork, setDecryptingNetwork] = useState<string | null>(null)

  useEffect(() => {
    loadWallets()
  }, [page, rowsPerPage, searchQuery])

  const loadWallets = async () => {
    try {
      setLoading(true)
      const response = await adminService.getWallets({
        page: page + 1,
        limit: rowsPerPage,
        search: searchQuery || undefined,
      })
      
      setWallets(response.data.wallets)
      setTotalWallets(response.data.pagination.total)
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to load wallets')
    } finally {
      setLoading(false)
    }
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
    setPage(0)
  }

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleViewPrivateKeys = async (wallet: Wallet) => {
    setSelectedWallet(wallet)
    setPrivateKeyDialogOpen(true)
    setPrivateKeyData(null)
    setDecryptedKeys({})
    
    try {
      setLoadingPrivateKeys(true)
      const response = await adminService.getWalletPrivateKeys(wallet._id)
      setPrivateKeyData(response.data)
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to load private keys')
    } finally {
      setLoadingPrivateKeys(false)
    }
  }

  const handleDecryptPrivateKey = async (network: 'ethereum' | 'tron' | 'bsc') => {
    if (!selectedWallet) return
    
    try {
      setDecryptingNetwork(network)
      const response = await adminService.decryptPrivateKey(selectedWallet._id, network)
      setDecryptedKeys(prev => ({
        ...prev,
        [network]: response.data.privateKey
      }))
      showSuccess(`${network.toUpperCase()} private key decrypted`)
    } catch (error: any) {
      showError(error.response?.data?.message || `Failed to decrypt ${network} private key`)
    } finally {
      setDecryptingNetwork(null)
    }
  }

  const handleCopyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    showSuccess(`${label} copied to clipboard`)
  }

  const handleClosePrivateKeyDialog = () => {
    setPrivateKeyDialogOpen(false)
    setSelectedWallet(null)
    setPrivateKeyData(null)
    setDecryptedKeys({})
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const truncateAddress = (address: string) => {
    if (!address) return 'N/A'
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Wallet Management
        </Typography>
      </Box>

      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="body2" fontWeight="bold">
          Security Warning
        </Typography>
        <Typography variant="body2">
          Private keys provide full control over user wallets. Handle with extreme care and never share them.
          All access is logged for security auditing.
        </Typography>
      </Alert>

      <Card>
        <CardContent>
          <Box mb={3}>
            <TextField
              fullWidth
              placeholder="Search by wallet address..."
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Ethereum Address</TableCell>
                      <TableCell>Tron Address</TableCell>
                      <TableCell>BSC Address</TableCell>
                      <TableCell align="right">Total Balance</TableCell>
                      <TableCell>KYC Status</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {wallets.map((wallet) => (
                      <TableRow key={wallet._id} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {wallet.userId.firstName && wallet.userId.lastName
                                ? `${wallet.userId.firstName} ${wallet.userId.lastName}`
                                : wallet.userId.email}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {wallet.userId.email}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body2" fontFamily="monospace">
                              {truncateAddress(wallet.addresses.ethereum || '')}
                            </Typography>
                            {wallet.addresses.ethereum && (
                              <IconButton
                                size="small"
                                onClick={() => handleCopyToClipboard(wallet.addresses.ethereum!, 'Ethereum address')}
                              >
                                <ContentCopyIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body2" fontFamily="monospace">
                              {truncateAddress(wallet.addresses.tron || '')}
                            </Typography>
                            {wallet.addresses.tron && (
                              <IconButton
                                size="small"
                                onClick={() => handleCopyToClipboard(wallet.addresses.tron!, 'Tron address')}
                              >
                                <ContentCopyIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body2" fontFamily="monospace">
                              {truncateAddress(wallet.addresses.bsc || '')}
                            </Typography>
                            {wallet.addresses.bsc && (
                              <IconButton
                                size="small"
                                onClick={() => handleCopyToClipboard(wallet.addresses.bsc!, 'BSC address')}
                              >
                                <ContentCopyIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="medium">
                            {formatCurrency(wallet.totalBalanceUSD)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={wallet.userId.kycStatus}
                            size="small"
                            color={
                              wallet.userId.kycStatus === 'approved'
                                ? 'success'
                                : wallet.userId.kycStatus === 'pending'
                                ? 'warning'
                                : 'default'
                            }
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="View Private Keys">
                            <IconButton
                              color="primary"
                              onClick={() => handleViewPrivateKeys(wallet)}
                            >
                              <VpnKeyIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                rowsPerPageOptions={[10, 25, 50, 100]}
                component="div"
                count={totalWallets}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Private Key Dialog */}
      <Dialog
        open={privateKeyDialogOpen}
        onClose={handleClosePrivateKeyDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <WarningIcon color="warning" />
            <Typography variant="h6">Wallet Private Keys</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedWallet && (
            <Box>
              <Alert severity="error" sx={{ mb: 3 }}>
                <Typography variant="body2" fontWeight="bold">
                  CRITICAL SECURITY WARNING
                </Typography>
                <Typography variant="body2">
                  These private keys provide full control over the wallet. Never share them or log them.
                  This access is being logged for security auditing.
                </Typography>
              </Alert>

              <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle2" gutterBottom>
                  User Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body2">{selectedWallet.userId.email}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      KYC Status
                    </Typography>
                    <Box>
                      <Chip label={selectedWallet.userId.kycStatus} size="small" />
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              {loadingPrivateKeys ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress />
                </Box>
              ) : privateKeyData ? (
                <Box>
                  {/* Ethereum */}
                  {privateKeyData.addresses.ethereum && (
                    <Paper sx={{ p: 2, mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Ethereum Network
                      </Typography>
                      <Box mb={2}>
                        <Typography variant="caption" color="text.secondary">
                          Address
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2" fontFamily="monospace">
                            {privateKeyData.addresses.ethereum}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleCopyToClipboard(privateKeyData.addresses.ethereum!, 'Ethereum address')}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                      
                      {decryptedKeys.ethereum ? (
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Private Key (Decrypted)
                          </Typography>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body2" fontFamily="monospace" color="error">
                              {decryptedKeys.ethereum}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => handleCopyToClipboard(decryptedKeys.ethereum, 'Ethereum private key')}
                            >
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      ) : (
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={decryptingNetwork === 'ethereum' ? <CircularProgress size={16} /> : <VisibilityIcon />}
                          onClick={() => handleDecryptPrivateKey('ethereum')}
                          disabled={decryptingNetwork !== null}
                        >
                          Decrypt Private Key
                        </Button>
                      )}
                    </Paper>
                  )}

                  {/* Tron */}
                  {privateKeyData.addresses.tron && (
                    <Paper sx={{ p: 2, mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Tron Network
                      </Typography>
                      <Box mb={2}>
                        <Typography variant="caption" color="text.secondary">
                          Address
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2" fontFamily="monospace">
                            {privateKeyData.addresses.tron}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleCopyToClipboard(privateKeyData.addresses.tron!, 'Tron address')}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                      
                      {decryptedKeys.tron ? (
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Private Key (Decrypted)
                          </Typography>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body2" fontFamily="monospace" color="error">
                              {decryptedKeys.tron}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => handleCopyToClipboard(decryptedKeys.tron, 'Tron private key')}
                            >
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      ) : (
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={decryptingNetwork === 'tron' ? <CircularProgress size={16} /> : <VisibilityIcon />}
                          onClick={() => handleDecryptPrivateKey('tron')}
                          disabled={decryptingNetwork !== null}
                        >
                          Decrypt Private Key
                        </Button>
                      )}
                    </Paper>
                  )}

                  {/* BSC */}
                  {privateKeyData.addresses.bsc && (
                    <Paper sx={{ p: 2, mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        BSC Network
                      </Typography>
                      <Box mb={2}>
                        <Typography variant="caption" color="text.secondary">
                          Address
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2" fontFamily="monospace">
                            {privateKeyData.addresses.bsc}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleCopyToClipboard(privateKeyData.addresses.bsc!, 'BSC address')}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                      
                      {decryptedKeys.bsc ? (
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Private Key (Decrypted)
                          </Typography>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body2" fontFamily="monospace" color="error">
                              {decryptedKeys.bsc}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => handleCopyToClipboard(decryptedKeys.bsc, 'BSC private key')}
                            >
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      ) : (
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={decryptingNetwork === 'bsc' ? <CircularProgress size={16} /> : <VisibilityIcon />}
                          onClick={() => handleDecryptPrivateKey('bsc')}
                          disabled={decryptingNetwork !== null}
                        >
                          Decrypt Private Key
                        </Button>
                      )}
                    </Paper>
                  )}
                </Box>
              ) : null}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePrivateKeyDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default WalletManagement
