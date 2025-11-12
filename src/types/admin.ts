export interface AdminUser {
  id: string
  email: string
  emailVerified: boolean
  mfaEnabled: boolean
  role: 'admin'
  permissions: string[]
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

export interface AdminLoginRequest {
  email: string
  password: string
  mfaCode?: string
}

export interface AdminAuthResponse {
  user: AdminUser
  tokens: {
    accessToken: string
    refreshToken: string
    expiresIn: number
  }
  message: string
  requiresEmailVerification?: boolean
  requiresMFA?: boolean
  stage?: string
}

export interface AdminStats {
  totalUsers: number
  totalInvestments: number
  totalVolume: number
  pendingKYC: number
  activeProducts: number
  recentActivity: AdminActivity[]
}

export interface AdminActivity {
  id: string
  type: 'user_registration' | 'kyc_submission' | 'investment' | 'product_creation' | 'system_alert'
  description: string
  userId?: string
  userEmail?: string
  amount?: number
  timestamp: string
  severity?: 'low' | 'medium' | 'high'
}

export interface UserManagement {
  id: string
  email: string
  role: 'user' | 'admin' | 'issuer'
  status: 'active' | 'suspended' | 'deactivated'
  kycStatus: 'not_started' | 'pending' | 'approved' | 'rejected'
  emailVerified: boolean
  mfaEnabled: boolean
  lastLoginAt?: string
  createdAt: string
  totalInvestments: number
  totalVolume: number
  accreditedInvestor?: boolean
  totalValue: number
  walletBalance: number
  portfolioValue: number
  accountAge: number
}

export interface ProductManagement {
  id: string
  name: string
  symbol: string
  type: 'REIT' | 'BDC'
  status: 'active' | 'on_hold' | 'inactive'
  sharePrice: number
  totalShares: number
  availableShares: number
  totalInvested: number
  investorCount: number
  issuer: {
    id: string
    email: string
    companyName?: string
  }
  createdAt: string
  lastUpdated: string
}

// Additional types needed by adminService
export interface UserFilters {
  role?: 'user' | 'admin' | 'issuer'
  status?: 'active' | 'suspended' | 'deactivated'
  kycStatus?: 'not_started' | 'pending' | 'approved' | 'rejected'
  emailVerified?: boolean
  mfaEnabled?: boolean
  search?: string
  sortBy?: 'email' | 'createdAt' | 'lastLoginAt' | 'totalVolume'
  sortOrder?: 'asc' | 'desc'
  startDate?: string
  endDate?: string
}

export interface UsersResponse {
  success: boolean
  data: {
    users: AdminUser[]
    pagination: {
      total: number
      limit: number
      offset: number
      hasMore: boolean
    }
    summary: {
      totalUsers: number
      activeUsers: number
      suspendedUsers: number
      pendingKYC: number
      approvedKYC: number
    }
  }
}

export interface KYCSubmission {
  id: string
  userId: string
  user: {
    _id: string
    email: string
    createdAt: string
  }
  status: 'pending' | 'approved' | 'rejected' | 'requires_additional_info'
  submittedAt: string
  reviewedAt?: string
  reviewedBy?: {
    _id: string
    email: string
  }
  firstName: string
  lastName: string
  dateOfBirth: string
  nationality: string
  phoneNumber: string
  address: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  accreditedInvestor: {
    claimed: boolean
    type?: 'income' | 'net_worth' | 'professional' | 'entity'
    annualIncome?: number
    netWorth?: number
    professionalCertification?: string
    entityType?: string
    verificationDocsCount: number
  }
  documents: {
    type: string
    filename: string
    originalName: string
    mimeType: string
    size: number
    uploadedAt: string
  }[]
  documentsCount: number
  auditLogCount: number
  lastAuditAction: string
  notes?: string
  rejectionReason?: string
}

export interface KYCFilters {
  status?: 'pending' | 'approved' | 'rejected' | 'requires_additional_info'
  accreditedClaimed?: boolean
  submittedAfter?: string
  submittedBefore?: string
  reviewedBy?: string
  sortBy?: 'submittedAt' | 'reviewedAt' | 'firstName' | 'lastName' | 'status'
  sortOrder?: 'asc' | 'desc'
}

export interface WithdrawalRequest {
  id: string
  userId: string
  userEmail: string
  amount: number
  network: 'ethereum' | 'tron' | 'bsc'
  token: 'usdt' | 'usdc'
  toAddress: string
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'failed'
  requestedAt: string
  processedAt?: string
  processedBy?: string
  transactionHash?: string
  notes?: string
  rejectionReason?: string
  fraudScore?: number
  fraudFlags?: string[]
  user?: {
    email: string
  }
}

export interface WithdrawalFilters {
  status?: 'pending' | 'approved' | 'rejected' | 'completed' | 'failed'
  network?: 'ethereum' | 'tron' | 'bsc'
  token?: 'usdt' | 'usdc'
  minAmount?: number
  maxAmount?: number
  requestedAfter?: string
  requestedBefore?: string
  processedBy?: string
  sortBy?: 'requestedAt' | 'processedAt' | 'amount'
  sortOrder?: 'asc' | 'desc'
}

export interface AdminProduct {
  id: string
  name: string
  symbol: string
  type: 'REIT' | 'BDC'
  description: string
  strategy: string
  sharePrice: number
  totalShares: number
  availableShares: number
  minimumInvestment: number
  fees: {
    managementFee: number
    performanceFee: number
    acquisitionFee: number
    dispositionFee: number
  }
  status: 'active' | 'on_hold' | 'inactive'
  sector?: string
  geography?: string
  targetReturn?: number
  distributionFrequency?: 'monthly' | 'quarterly' | 'annually'
  nav: number
  navDate: string
  overviewData?: {
    totalInvestments?: number
    floatingRatePercentage?: number
    totalValue?: number
    totalAssets?: number
    totalLiabilities?: number
    navPerShare?: number
    eps?: number
    lastSalePrice?: number
    contactWebsite?: string
    contactPhone?: string
    portfolioAllocation?: {
      seniorSecuredLoans?: number
      preferredEquity?: number
      seniorSecuredBonds?: number
      other?: number
    }
  }
  createdAt: string
  updatedAt: string
  issuer: {
    id: string
    email: string
    companyName?: string
  }
  marketCap: number
  totalInvested: number
  investorCount: number
  documentsCount: number
}

export interface ProductFilters {
  type?: 'REIT' | 'BDC'
  status?: 'active' | 'on_hold' | 'inactive'
  sector?: string
  geography?: string
  minPrice?: number
  maxPrice?: number
  issuerId?: string
  search?: string
  sortBy?: 'name' | 'sharePrice' | 'createdAt' | 'totalInvested' | 'investorCount'
  sortOrder?: 'asc' | 'desc'
}

export interface AdminTransaction {
  id: string
  userId: string
  userEmail: string
  type: 'buy' | 'sell' | 'deposit' | 'withdrawal' | 'fee' | 'dividend'
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  amount: number
  currency: string
  productId?: string
  productName?: string
  productSymbol?: string
  network?: 'ethereum' | 'tron' | 'bsc'
  transactionHash?: string
  createdAt: string
  completedAt?: string
  fees: {
    platformFee: number
    networkFee: number
    totalFees: number
  }
  metadata?: {
    shares?: number
    pricePerShare?: number
    orderType?: string
  }
}

export interface TransactionFilters {
  type?: 'buy' | 'sell' | 'deposit' | 'withdrawal' | 'fee' | 'dividend' | 'all'
  status?: 'pending' | 'completed' | 'failed' | 'cancelled'
  userId?: string
  productId?: string
  network?: 'ethereum' | 'tron' | 'bsc'
  minAmount?: number
  maxAmount?: number
  startDate?: string
  endDate?: string
  sortBy?: 'createdAt' | 'completedAt' | 'amount'
  sortOrder?: 'asc' | 'desc'
}

export interface TransactionSummary {
  totalTransactions: number
  totalVolume: number
  totalFees: number
  byType: {
    buy: { count: number; volume: number }
    sell: { count: number; volume: number }
    deposit: { count: number; volume: number }
    withdrawal: { count: number; volume: number }
  }
  byStatus: {
    pending: number
    completed: number
    failed: number
    cancelled: number
  }
}