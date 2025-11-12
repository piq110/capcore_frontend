export interface PortfolioHolding {
  id: string
  product: {
    id: string
    name: string
    symbol: string
    type: 'REIT' | 'BDC'
    sharePrice: number
    sector?: string
    geography?: string
  }
  quantity: number
  averageCost: number
  currentValue: number
  unrealizedPnL: number
  unrealizedPnLPercentage?: number
  totalInvested: number
  lastUpdated: string
}

export interface PortfolioSummary {
  totalValue: number
  totalInvested: number
  totalPnL: number
  totalPnLPercentage?: number
  dayChange: number
  dayChangePercentage?: number
  holdings: PortfolioHolding[]
  assetAllocation: {
    type: 'REIT' | 'BDC'
    value: number
    percentage: number
  }[]
  sectorAllocation: {
    sector: string
    value: number
    percentage: number
  }[]
  updatedAt: string
}

export interface PortfolioResponse {
  success: boolean
  data: {
    portfolio: PortfolioSummary
  }
}

export interface Transaction {
  id: string
  type: 'buy' | 'sell' | 'deposit' | 'withdrawal' | 'fee' | 'dividend'
  product?: {
    id: string
    name: string
    symbol: string
    type: 'REIT' | 'BDC'
  }
  quantity?: number
  pricePerShare?: number
  amount: number
  fees: number
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  description: string
  executedAt: string
  settledAt?: string
  failedAt?: string
  failureReason?: string
  orderId?: string
  tradeId?: string
}

export interface TransactionFilters {
  type?: 'buy' | 'sell' | 'deposit' | 'withdrawal' | 'fee' | 'dividend'
  status?: 'pending' | 'completed' | 'failed' | 'cancelled'
  productId?: string
  dateFrom?: string
  dateTo?: string
  minAmount?: number
  maxAmount?: number
  limit?: number
  offset?: number
  sortBy?: 'executedAt' | 'amount' | 'type' | 'status'
  sortOrder?: 'asc' | 'desc'
}

export interface TransactionsResponse {
  success: boolean
  data: {
    transactions: Transaction[]
    pagination: {
      total: number
      limit: number
      offset: number
      hasMore: boolean
    }
    summary: {
      totalTransactions: number
      totalVolume: number
      totalFees: number
      completedTransactions: number
      pendingTransactions: number
    }
  }
}

export interface PortfolioPerformance {
  period: '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL'
  data: {
    date: string
    value: number
    pnl: number
    pnlPercentage: number
  }[]
  totalReturn: number
  totalReturnPercentage: number
  annualizedReturn?: number
  volatility?: number
  sharpeRatio?: number
  maxDrawdown?: number
}

export interface PerformanceResponse {
  success: boolean
  data: {
    performance: PortfolioPerformance
  }
}

export interface PortfolioStatement {
  id: string
  type: 'monthly' | 'quarterly' | 'annual' | 'custom'
  periodStart: string
  periodEnd: string
  generatedAt: string
  summary: {
    openingValue: number
    closingValue: number
    totalReturn: number
    totalReturnPercentage: number
    totalDeposits: number
    totalWithdrawals: number
    totalFees: number
    totalDividends: number
  }
  holdings: PortfolioHolding[]
  transactions: Transaction[]
  downloadUrl?: string
}

export interface StatementRequest {
  type: 'monthly' | 'quarterly' | 'annual' | 'custom'
  periodStart: string
  periodEnd: string
  format: 'pdf' | 'csv' | 'excel'
  includeTransactions: boolean
  includeHoldings: boolean
}

export interface StatementsResponse {
  success: boolean
  data: {
    statements: PortfolioStatement[]
    pagination: {
      total: number
      limit: number
      offset: number
      hasMore: boolean
    }
  }
}