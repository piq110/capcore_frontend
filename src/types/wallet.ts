export interface WalletAddress {
  ethereum: string
  tron: string
  bsc: string
}

export interface NetworkInfo {
  name: string
  symbol: string
  tokens: string[]
  confirmations: number
}

export interface NetworkBalances {
  ethereum: number
  tron: number
  bsc: number
  total: number
}

export interface MultiChainBalances {
  usdt: NetworkBalances
  usdc: NetworkBalances
  totalUSD: number
}

export interface WalletAddressesResponse {
  success: boolean
  data: {
    addresses: WalletAddress
    networks: {
      ethereum: NetworkInfo
      tron: NetworkInfo
      bsc: NetworkInfo
    }
  }
}

export interface WalletBalancesResponse {
  success: boolean
  data: MultiChainBalances
}

export interface Transaction {
  _id: string
  userId: string
  type: 'deposit' | 'withdrawal'
  network: 'ethereum' | 'tron' | 'bsc'
  token: 'usdt' | 'usdc'
  amount: number
  status: 'pending' | 'confirmed' | 'failed'
  txHash?: string
  fromAddress?: string
  toAddress?: string
  confirmations?: number
  createdAt: string
  updatedAt: string
}

export interface TransactionHistoryResponse {
  success: boolean
  data: {
    transactions: Transaction[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }
}

export interface WithdrawalRequest {
  network: 'ethereum' | 'tron' | 'bsc'
  token: 'usdt' | 'usdc'
  amount: number
  toAddress: string
}

export interface Withdrawal {
  _id: string
  userId: string
  walletId: string
  network: 'ethereum' | 'tron' | 'bsc'
  token: 'usdt' | 'usdc'
  amount: number
  toAddress: string
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed' | 'failed'
  requestedAt: string
  reviewedAt?: string
  processedAt?: string
  completedAt?: string
  rejectionReason?: string
  txHash?: string
  reviewedBy?: {
    email: string
  }
  fraudScore?: number
  fraudFlags?: string[]
}

export interface WithdrawalResponse {
  success: boolean
  data: {
    withdrawalId: string
    status: string
    amount: number
    withdrawalFee: number
    totalDeducted: number
    network: string
    token: string
    estimatedProcessingTime: string
    message: string
  }
}

export interface WithdrawalHistoryResponse {
  success: boolean
  data: {
    withdrawals: Withdrawal[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }
}

export interface WithdrawalDetailsResponse {
  success: boolean
  data: Withdrawal
}