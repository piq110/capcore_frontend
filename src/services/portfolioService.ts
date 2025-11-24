import axios from 'axios'
import { 
  PortfolioResponse,
  TransactionsResponse,
  TransactionFilters,
  PerformanceResponse,
  StatementRequest,
  StatementsResponse
} from '../types/portfolio'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const portfolioApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests if available
portfolioApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const portfolioService = {
  async getPortfolio(): Promise<PortfolioResponse> {
    const response = await portfolioApi.get('/portfolio')
    return response.data
  },

  async refreshPortfolio(): Promise<{ success: boolean; message: string }> {
    const response = await portfolioApi.post('/portfolio/refresh')
    return response.data
  },

  async consolidatePortfolio(): Promise<{ success: boolean; message: string; data: any }> {
    const response = await portfolioApi.post('/portfolio/consolidate')
    return response.data
  },

  async cleanupPortfolio(): Promise<{ success: boolean; message: string; data: any }> {
    const response = await portfolioApi.post('/portfolio/cleanup')
    return response.data
  },

  async getTransactions(filters: TransactionFilters = {}): Promise<TransactionsResponse> {
    const params = new URLSearchParams()
    
    if (filters.type) params.append('type', filters.type)
    if (filters.status) params.append('status', filters.status)
    if (filters.productId) params.append('productId', filters.productId)
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom)
    if (filters.dateTo) params.append('dateTo', filters.dateTo)
    if (filters.minAmount !== undefined) params.append('minAmount', filters.minAmount.toString())
    if (filters.maxAmount !== undefined) params.append('maxAmount', filters.maxAmount.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.offset) params.append('offset', filters.offset.toString())
    if (filters.sortBy) params.append('sortBy', filters.sortBy)
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)

    const response = await portfolioApi.get(`/portfolio/transactions?${params.toString()}`)
    return response.data
  },

  async getPerformance(period: '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL' = '1M'): Promise<PerformanceResponse> {
    const response = await portfolioApi.get(`/portfolio/performance?period=${period}`)
    return response.data
  },

  async generateStatement(request: StatementRequest): Promise<{ success: boolean; data: { statementId: string; downloadUrl?: string } }> {
    const response = await portfolioApi.post('/portfolio/statements', request)
    return response.data
  },

  async getStatements(limit = 20, offset = 0): Promise<StatementsResponse> {
    const response = await portfolioApi.get(`/portfolio/statements?limit=${limit}&offset=${offset}`)
    return response.data
  },

  async downloadStatement(statementId: string, format: 'pdf' | 'csv' | 'excel' = 'pdf'): Promise<Blob> {
    const response = await portfolioApi.get(`/portfolio/statements/${statementId}/download?format=${format}`, {
      responseType: 'blob'
    })
    return response.data
  },

  // Utility functions for calculations
  calculateTotalReturn(currentValue: number, totalInvested: number): { amount: number; percentage: number } {
    const amount = currentValue - totalInvested
    const percentage = totalInvested > 0 ? (amount / totalInvested) * 100 : 0
    return { amount, percentage }
  },

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  },

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  },

  getTransactionTypeColor(type: string): 'success' | 'error' | 'info' | 'warning' {
    switch (type) {
      case 'buy':
      case 'deposit':
      case 'dividend':
        return 'success'
      case 'sell':
      case 'withdrawal':
        return 'error'
      case 'fee':
        return 'warning'
      default:
        return 'info'
    }
  },

  getStatusColor(status: string): 'success' | 'error' | 'warning' | 'info' {
    switch (status) {
      case 'completed':
        return 'success'
      case 'failed':
      case 'cancelled':
        return 'error'
      case 'pending':
        return 'warning'
      default:
        return 'info'
    }
  },

  // Export functions for statements
  async exportTransactionsToCsv(transactions: any[], filename = 'transactions.csv'): Promise<void> {
    const headers = ['Date', 'Type', 'Product', 'Quantity', 'Price', 'Amount', 'Fees', 'Status']
    const csvContent = [
      headers.join(','),
      ...transactions.map(tx => [
        this.formatDate(tx.executedAt),
        tx.type,
        tx.product?.name || 'N/A',
        tx.quantity || '',
        tx.pricePerShare ? `$${tx.pricePerShare.toFixed(2)}` : '',
        `$${tx.amount.toFixed(2)}`,
        `$${tx.fees.toFixed(2)}`,
        tx.status
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    window.URL.revokeObjectURL(url)
  },

  async exportHoldingsToCsv(holdings: any[], filename = 'holdings.csv'): Promise<void> {
    const headers = ['Product', 'Symbol', 'Type', 'Quantity', 'Avg Cost', 'Current Value', 'P&L', 'P&L %']
    const csvContent = [
      headers.join(','),
      ...holdings.map(holding => [
        holding.product.name,
        holding.product.symbol,
        holding.product.type,
        holding.quantity,
        `$${holding.averageCost.toFixed(2)}`,
        `$${holding.currentValue.toFixed(2)}`,
        `$${holding.unrealizedPnL.toFixed(2)}`,
        `${holding.unrealizedPnLPercentage.toFixed(2)}%`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    window.URL.revokeObjectURL(url)
  }
}