import axios from 'axios'
import { 
  OrderRequest,
  OrderResponse,
  OrdersResponse,
  OrderBookResponse,
  RecentTradesResponse,
  TradesResponse,
  TradingFilters,
  DetailedOrder
} from '../types/trading'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const tradingApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests if available
tradingApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const tradingService = {
  async placeOrder(orderRequest: OrderRequest): Promise<OrderResponse> {
    const response = await tradingApi.post('/trading/orders', orderRequest)
    return response.data
  },

  async getOrders(filters: TradingFilters = {}): Promise<OrdersResponse> {
    const params = new URLSearchParams()
    
    if (filters.status) params.append('status', filters.status)
    if (filters.type) params.append('type', filters.type)
    if (filters.productId) params.append('productId', filters.productId)
    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.offset) params.append('offset', filters.offset.toString())
    if (filters.sortBy) params.append('sortBy', filters.sortBy)
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)

    const response = await tradingApi.get(`/trading/orders?${params.toString()}`)
    return response.data
  },

  async getOrderDetails(orderId: string): Promise<{ success: boolean; data: { order: DetailedOrder } }> {
    const response = await tradingApi.get(`/trading/orders/${orderId}`)
    return response.data
  },

  async cancelOrder(orderId: string, reason?: string): Promise<{ success: boolean; message: string }> {
    const response = await tradingApi.put(`/trading/orders/${orderId}/cancel`, { reason })
    return response.data
  },

  async getOrderBook(productId: string, depth = 10): Promise<OrderBookResponse> {
    const response = await tradingApi.get(`/trading/orderbook/${productId}?depth=${depth}`)
    return response.data
  },

  async getRecentTrades(productId: string, limit = 50): Promise<RecentTradesResponse> {
    const response = await tradingApi.get(`/trading/trades/${productId}?limit=${limit}`)
    return response.data
  },

  async getUserTrades(filters: { 
    limit?: number
    offset?: number
    status?: 'pending' | 'settled' | 'failed'
    productId?: string 
  } = {}): Promise<TradesResponse> {
    const params = new URLSearchParams()
    
    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.offset) params.append('offset', filters.offset.toString())
    if (filters.status) params.append('status', filters.status)
    if (filters.productId) params.append('productId', filters.productId)

    const response = await tradingApi.get(`/trading/user/trades?${params.toString()}`)
    return response.data
  },

  async validateOrder(orderRequest: OrderRequest): Promise<{ 
    valid: boolean
    errors: string[]
    warnings: string[]
  }> {
    // Client-side validation before sending to server
    const errors: string[] = []
    const warnings: string[] = []

    if (orderRequest.quantity <= 0) {
      errors.push('Quantity must be greater than 0')
    }

    if (orderRequest.pricePerShare <= 0) {
      errors.push('Price per share must be greater than 0')
    }

    if (!Number.isInteger(orderRequest.quantity)) {
      errors.push('Quantity must be a whole number')
    }

    const totalAmount = orderRequest.quantity * orderRequest.pricePerShare

    if (totalAmount < 1) {
      errors.push('Total order amount must be at least $1')
    }

    if (orderRequest.type === 'buy' && totalAmount > 1000000) {
      warnings.push('Large order amount - please verify before placing')
    }

    if (orderRequest.expiresAt) {
      const expiryDate = new Date(orderRequest.expiresAt)
      const now = new Date()
      
      if (expiryDate <= now) {
        errors.push('Expiration date must be in the future')
      }
      
      const maxExpiry = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000) // 90 days
      if (expiryDate > maxExpiry) {
        warnings.push('Order expires more than 90 days from now')
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  },

  // Real-time order book subscription (WebSocket implementation)
  subscribeToOrderBook(productId: string, callback: (orderBook: any) => void): () => void {
    console.log(`Subscribing to order book for product ${productId}`)
    
    // TODO: Implement WebSocket subscription for real-time order book updates
    // Callback will be used when WebSocket is implemented
    void callback // Acknowledge callback parameter
    
    // For now, return a no-op unsubscribe function
    return () => {
      console.log(`Unsubscribed from order book for product ${productId}`)
    }
  },

  // Real-time trade feed subscription (WebSocket implementation)
  subscribeToTrades(productId: string, callback: (trades: any[]) => void): () => void {
    console.log(`Subscribing to trades for product ${productId}`)
    
    // TODO: Implement WebSocket subscription for real-time trade feed
    // Callback will be used when WebSocket is implemented
    void callback // Acknowledge callback parameter
    
    // For now, return a no-op unsubscribe function
    return () => {
      console.log(`Unsubscribed from trades for product ${productId}`)
    }
  },
}