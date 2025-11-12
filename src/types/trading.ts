export interface Order {
  id: string
  product: {
    id: string
    name: string
    symbol: string
    type: 'REIT' | 'BDC'
    sharePrice: number
  }
  type: 'buy' | 'sell'
  orderType: 'market' | 'limit'
  quantity: number
  pricePerShare: number
  totalAmount: number
  status: 'pending' | 'filled' | 'partially_filled' | 'cancelled' | 'rejected'
  filledQuantity: number
  remainingQuantity: number
  averageFillPrice: number
  fees: number
  expiresAt?: string
  filledAt?: string
  cancelledAt?: string
  rejectionReason?: string
  createdAt: string
  updatedAt: string
}

export interface DetailedOrder extends Order {
  remainingValue: number
  filledValue: number
  canBeCancelled: boolean
}

export interface OrderRequest {
  productId: string
  type: 'buy' | 'sell'
  orderType?: 'market' | 'limit'
  quantity: number
  pricePerShare: number
  expiresAt?: string
}

export interface OrderResponse {
  success: boolean
  message: string
  data: {
    order: Order
  }
}

export interface OrdersResponse {
  success: boolean
  data: {
    orders: Order[]
    pagination: {
      total: number
      limit: number
      offset: number
      hasMore: boolean
    }
    summary: {
      totalOrders: number
      pendingOrders: number
      filledOrders: number
      cancelledOrders: number
    }
  }
  userAccess: {
    canTrade: boolean
    kycStatus: string
    kycRequired: boolean
  }
}

export interface OrderBookEntry {
  price: number
  quantity: number
  orders: number
}

export interface OrderBook {
  bids: OrderBookEntry[]
  asks: OrderBookEntry[]
  spread: number
  midPrice: number
}

export interface OrderBookResponse {
  success: boolean
  data: {
    productId: string
    productName: string
    productSymbol: string
    orderBook: OrderBook
    timestamp: string
  }
}

export interface Trade {
  id: string
  product: {
    id: string
    name: string
    symbol: string
    type: 'REIT' | 'BDC'
  }
  side: 'buy' | 'sell'
  quantity: number
  pricePerShare: number
  totalAmount: number
  fees: number
  status: 'pending' | 'settled' | 'failed'
  executedAt: string
  settledAt?: string
  failedAt?: string
  failureReason?: string
}

export interface RecentTrade {
  id: string
  quantity: number
  price: number
  timestamp: string
  side: 'buy' | 'sell'
}

export interface RecentTradesResponse {
  success: boolean
  data: {
    productId: string
    productName: string
    productSymbol: string
    trades: RecentTrade[]
    count: number
    timestamp: string
  }
}

export interface TradesResponse {
  success: boolean
  data: {
    trades: Trade[]
    pagination: {
      total: number
      limit: number
      offset: number
      hasMore: boolean
    }
    summary: {
      totalTrades: number
      settledTrades: number
      pendingTrades: number
    }
  }
}

export interface TradingFilters {
  status?: 'pending' | 'filled' | 'partially_filled' | 'cancelled' | 'rejected'
  type?: 'buy' | 'sell'
  productId?: string
  limit?: number
  offset?: number
  sortBy?: 'createdAt' | 'pricePerShare' | 'totalAmount' | 'status'
  sortOrder?: 'asc' | 'desc'
}

export interface UserAccess {
  canTrade: boolean
  kycRequired: boolean
  kycStatus: string
  accreditedInvestor: boolean
}