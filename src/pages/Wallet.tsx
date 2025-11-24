import React, { useState, useEffect } from 'react'
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  Alert,
  Container
} from '@mui/material'
import {
  AccountBalanceWallet as WalletIcon,
  Download as DepositIcon,
  Upload as WithdrawIcon,
  History as HistoryIcon
} from '@mui/icons-material'
import { 
  WalletDashboard, 
  DepositInterface, 
  WithdrawalForm, 
  TransactionStatusMonitor 
} from '../components/wallet'
import { walletService } from '../services/walletService'
import { MultiChainBalances } from '../types/wallet'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`wallet-tabpanel-${index}`}
      aria-labelledby={`wallet-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

const Wallet: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0)
  const [balances, setBalances] = useState<MultiChainBalances | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue)
  }

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
    loadBalances()
  }

  const loadBalances = async () => {
    try {
      const response = await walletService.getWalletBalances()
      setBalances(response.data)
    } catch (error) {
      console.error('Failed to load balances:', error)
    }
  }

  useEffect(() => {
    loadBalances()
  }, [])

  return (
    <Container maxWidth="lg">
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Cryptocurrency Wallet
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          Your multi-chain cryptocurrency wallet supports USDT and USDC on Ethereum, Tron, and BSC networks.
          All deposits are automatically detected and credited to your account.
        </Alert>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={selectedTab} 
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ minHeight: 48 }}
          >
            <Tab
              icon={<WalletIcon />}
              label="Dashboard"
              id="wallet-tab-0"
              aria-controls="wallet-tabpanel-0"
            />
            <Tab
              icon={<DepositIcon />}
              label="Deposit"
              id="wallet-tab-1"
              aria-controls="wallet-tabpanel-1"
            />
            <Tab
              icon={<WithdrawIcon />}
              label="Withdraw"
              id="wallet-tab-2"
              aria-controls="wallet-tabpanel-2"
            />
            <Tab
              icon={<HistoryIcon />}
              label="History"
              id="wallet-tab-3"
              aria-controls="wallet-tabpanel-3"
            />
          </Tabs>
        </Box>

        <TabPanel value={selectedTab} index={0}>
          <WalletDashboard onRefresh={handleRefresh} />
        </TabPanel>

        <TabPanel value={selectedTab} index={1}>
          <DepositInterface />
        </TabPanel>

        <TabPanel value={selectedTab} index={2}>
          <WithdrawalForm 
            balances={balances}
            onWithdrawalSuccess={() => {
              handleRefresh()
              setSelectedTab(3) // Switch to history tab
            }}
          />
        </TabPanel>

        <TabPanel value={selectedTab} index={3}>
          <TransactionStatusMonitor refreshTrigger={refreshTrigger} />
        </TabPanel>
      </Box>
    </Container>
  )
}

export default Wallet