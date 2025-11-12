import React from 'react'
import { Box, Container } from '@mui/material'
import WalletManagement from '../components/admin/WalletManagement'

const AdminWallets: React.FC = () => {
  return (
    <Container maxWidth="xl">
      <Box py={3}>
        <WalletManagement />
      </Box>
    </Container>
  )
}

export default AdminWallets
