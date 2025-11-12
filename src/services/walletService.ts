import axios from 'axios'
import {
  WalletAddressesResponse,
  WalletBalancesResponse,
  TransactionHistoryResponse,
  WithdrawalRequest,
  WithdrawalResponse,
  WithdrawalHistoryResponse,
  WithdrawalDetailsResponse
} from '../types/wallet'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

const walletApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests if available
walletApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const walletService = {
  async getWalletAddresses(): Promise<WalletAddressesResponse> {
    const response = await walletApi.get('/wallet/addresses')
    return response.data
  },

  async getWalletBalances(): Promise<WalletBalancesResponse> {
    const response = await walletApi.get('/wallet/balances')
    return response.data
  },

  async syncBalances(): Promise<WalletBalancesResponse> {
    const response = await walletApi.post('/wallet/sync-balances')
    return response.data
  },

  async getTransactionHistory(params?: {
    page?: number
    limit?: number
    type?: 'deposit' | 'withdrawal'
    network?: 'ethereum' | 'tron' | 'bsc'
    status?: 'pending' | 'confirmed' | 'failed'
  }): Promise<TransactionHistoryResponse> {
    const response = await walletApi.get('/wallet/transactions', { params })
    return response.data
  },

  async requestWithdrawal(withdrawalData: WithdrawalRequest): Promise<WithdrawalResponse> {
    const response = await walletApi.post('/wallet/withdraw', withdrawalData)
    return response.data
  },

  async getWithdrawalHistory(params?: {
    page?: number
    limit?: number
    status?: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed' | 'failed'
  }): Promise<WithdrawalHistoryResponse> {
    const response = await walletApi.get('/wallet/withdrawals', { params })
    return response.data
  },

  async getWithdrawalDetails(withdrawalId: string): Promise<WithdrawalDetailsResponse> {
    const response = await walletApi.get(`/wallet/withdrawal/${withdrawalId}`)
    return response.data
  }
}