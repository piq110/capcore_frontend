import axios from 'axios'
import { 
  UserFilters, 
  UsersResponse, 
  KYCSubmission, 
  KYCFilters, 
  WithdrawalRequest, 
  WithdrawalFilters, 
  AdminProduct, 
  ProductFilters, 
  AdminTransaction, 
  TransactionFilters, 
  TransactionSummary 
} from '../types/admin'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const adminApi = axios.create({
  baseURL: `${API_BASE_URL}/admin`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add admin token to requests if available
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminAuthToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const adminService = {
  // User Management
  async getUsers(filters: UserFilters & { limit?: number; offset?: number } = {}): Promise<UsersResponse> {
    const response = await adminApi.get('/users', { params: filters })
    return response.data
  },

  async getUserDetails(userId: string): Promise<{ success: boolean; data: any }> {
    const response = await adminApi.get(`/users/${userId}`)
    return response.data
  },

  async updateUserStatus(userId: string, status: 'active' | 'suspended' | 'deactivated', reason?: string, notes?: string): Promise<{ success: boolean; message: string }> {
    const response = await adminApi.put(`/users/${userId}/status`, { status, reason, notes })
    return response.data
  },

  async adjustUserBalance(userId: string, data: {
    network: 'ethereum' | 'tron' | 'bsc'
    token: 'usdt' | 'usdc'
    amount: number
    operation: 'set' | 'add' | 'subtract'
    reason: string
    notes?: string
  }): Promise<{ success: boolean; message: string }> {
    const response = await adminApi.put(`/users/${userId}/balance`, data)
    return response.data
  },

  // KYC Management
  async getKYCSubmissions(filters: KYCFilters & { limit?: number; offset?: number } = {}): Promise<{ success: boolean; data: { submissions: KYCSubmission[]; pagination: any } }> {
    const response = await adminApi.get('/kyc/pending', { params: filters })
    // The API returns data directly, so we need to wrap it in the expected format
    return {
      success: true,
      data: {
        submissions: response.data.submissions,
        pagination: response.data.pagination
      }
    }
  },

  async approveKYC(submissionId: string, notes?: string): Promise<{ success: boolean; message: string }> {
    const response = await adminApi.put(`/kyc/${submissionId}/approve`, { notes })
    return response.data
  },

  async rejectKYC(submissionId: string, reason: string, notes?: string): Promise<{ success: boolean; message: string }> {
    const response = await adminApi.put(`/kyc/${submissionId}/reject`, { reason, notes })
    return response.data
  },

  async requestAdditionalKYCInfo(submissionId: string, requirements: string, notes?: string): Promise<{ success: boolean; message: string }> {
    const response = await adminApi.put(`/kyc/${submissionId}/request-info`, { requirements, notes })
    return response.data
  },

  // Withdrawal Management
  async getWithdrawals(filters: WithdrawalFilters & { limit?: number; offset?: number } = {}): Promise<{ success: boolean; data: { withdrawals: WithdrawalRequest[]; pagination: any } }> {
    const response = await adminApi.get('/withdrawals/pending', { params: filters })
    return response.data
  },

  async approveWithdrawal(withdrawalId: string, notes?: string): Promise<{ success: boolean; message: string }> {
    const response = await adminApi.put(`/withdrawals/${withdrawalId}/approve`, { notes })
    return response.data
  },

  async rejectWithdrawal(withdrawalId: string, reason: string, notes?: string): Promise<{ success: boolean; message: string }> {
    const response = await adminApi.put(`/withdrawals/${withdrawalId}/reject`, { reason, notes })
    return response.data
  },

  // Product Management
  async getProducts(filters: ProductFilters & { limit?: number; offset?: number } = {}): Promise<{ success: boolean; data: { products: AdminProduct[]; pagination: any } }> {
    const response = await adminApi.get('/products', { params: filters })
    return response.data
  },

  async createProduct(productData: {
    name: string
    symbol: string
    type: 'REIT' | 'BDC'
    description: string
    strategy: string
    sharePrice: number
    totalShares: number
    minimumInvestment: number
    fees: {
      managementFee: number
      performanceFee: number
      acquisitionFee: number
      dispositionFee: number
    }
    sector?: string
    geography?: string
    targetReturn?: number
    distributionFrequency?: 'monthly' | 'quarterly' | 'annually'
  }): Promise<{ success: boolean; data: { product: AdminProduct } }> {
    const response = await adminApi.post('/products', productData)
    return response.data
  },

  async updateProduct(productId: string, updates: Partial<AdminProduct>): Promise<{ success: boolean; data: { product: AdminProduct } }> {
    const response = await adminApi.put(`/products/${productId}`, updates)
    return response.data
  },

  async updateProductStatus(productId: string, status: 'active' | 'on_hold' | 'inactive'): Promise<{ success: boolean; message: string }> {
    const response = await adminApi.put(`/products/${productId}/status`, { status })
    return response.data
  },

  async deleteProduct(productId: string): Promise<{ success: boolean; message: string }> {
    const response = await adminApi.delete(`/products/${productId}`)
    return response.data
  },

  // Transaction Monitoring
  async getTransactions(filters: TransactionFilters & { limit?: number; offset?: number } = {}): Promise<{ 
    success: boolean; 
    data: { 
      transactions: AdminTransaction[]; 
      pagination: any; 
      summary: TransactionSummary 
    } 
  }> {
    const response = await adminApi.get('/transactions', { params: filters })
    return response.data
  },

  async getAuditLogs(filters: { 
    limit?: number; 
    offset?: number; 
    category?: string; 
    severity?: string; 
    success?: boolean; 
    userId?: string; 
    adminId?: string; 
    action?: string; 
    resource?: string; 
    startDate?: string; 
    endDate?: string 
  } = {}): Promise<{ success: boolean; data: { logs: any[]; pagination: any } }> {
    const response = await adminApi.get('/audit-logs', { params: filters })
    return response.data
  },

  // System Reports
  async getSystemSummary(): Promise<{ 
    success: boolean; 
    data: { 
      users: any; 
      transactions: TransactionSummary; 
      platform: any 
    } 
  }> {
    const response = await adminApi.get('/summary')
    return response.data
  },

  async getRevenueReport(period: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<{ success: boolean; data: any }> {
    const response = await adminApi.get('/revenue', { params: { period } })
    return response.data
  },

  // Order Management
  async getOrders(filters: {
    limit?: number
    offset?: number
    status?: 'pending' | 'filled' | 'partially_filled' | 'cancelled' | 'rejected'
    type?: 'buy' | 'sell'
    userId?: string
    productId?: string
    startDate?: string
    endDate?: string
    sortBy?: 'createdAt' | 'totalAmount' | 'status' | 'pricePerShare'
    sortOrder?: 'asc' | 'desc'
  } = {}): Promise<{
    success: boolean
    data: {
      orders: any[]
      pagination: any
      summary: any
    }
  }> {
    const response = await adminApi.get('/orders', { params: filters })
    return response.data
  },

  async confirmOrder(orderId: string, data: {
    fillPrice?: number
    notes?: string
  }): Promise<{ success: boolean; message: string; data: any }> {
    const response = await adminApi.put(`/orders/${orderId}/confirm`, data)
    return response.data
  },

  async rejectOrder(orderId: string, data: {
    reason: string
    notes?: string
  }): Promise<{ success: boolean; message: string; data: any }> {
    const response = await adminApi.put(`/orders/${orderId}/reject`, data)
    return response.data
  },

  // Wallet Management
  async getWallets(params: {
    page?: number
    limit?: number
    search?: string
  } = {}): Promise<{ success: boolean; data: any }> {
    const queryParams = new URLSearchParams()
    if (params.page) queryParams.append('page', params.page.toString())
    if (params.limit) queryParams.append('limit', params.limit.toString())
    if (params.search) queryParams.append('search', params.search)
    
    const response = await adminApi.get(`/wallets?${queryParams.toString()}`)
    return response.data
  },

  async getWalletPrivateKeys(walletId: string): Promise<{ success: boolean; data: any }> {
    const response = await adminApi.get(`/wallets/${walletId}/private-keys`)
    return response.data
  },

  async decryptPrivateKey(walletId: string, network: 'ethereum' | 'tron' | 'bsc'): Promise<{ success: boolean; data: any }> {
    const response = await adminApi.post(`/wallets/${walletId}/decrypt-private-key`, { network })
    return response.data
  },
}