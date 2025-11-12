export interface InvestmentProduct {
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
  fees: FeeStructure
  status: 'active' | 'on_hold' | 'inactive'
  sector?: string
  geography?: string
  targetReturn?: number
  distributionFrequency?: 'monthly' | 'quarterly' | 'annually'
  nav: number
  navDate: string
  overviewData?: OverviewData
  createdAt: string
  issuer: {
    id: string
    email: string
    companyName?: string
  }
  marketCap: number
  availabilityPercentage: number
  isAvailableForTrading: boolean
  documentsCount: number
}

export interface FeeStructure {
  managementFee: number
  performanceFee: number
  acquisitionFee: number
  dispositionFee: number
}

export interface OverviewData {
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

export interface ProductDocument {
  name: string
  type: 'prospectus' | 'annual_report' | 'quarterly_report' | 'offering_circular' | 'other'
  uploadedAt: string
  url?: string
}

export interface DetailedInvestmentProduct extends InvestmentProduct {
  documents: ProductDocument[]
  cusip?: string
  isin?: string
  lastDistributionDate?: string
  nextDistributionDate?: string
  overviewData?: OverviewData
  updatedAt: string
}

export interface ProductFilters {
  type?: 'REIT' | 'BDC'
  status?: 'active' | 'on_hold' | 'inactive'
  minPrice?: number
  maxPrice?: number
  sector?: string
  geography?: string
  sortBy?: 'name' | 'sharePrice' | 'createdAt' | 'nav' | 'targetReturn'
  sortOrder?: 'asc' | 'desc'
}

export interface ProductsResponse {
  success: boolean
  data: {
    products: InvestmentProduct[]
    pagination: {
      total: number
      limit: number
      offset: number
      hasMore: boolean
    }
    filters: {
      availableTypes: string[]
      availableStatuses: string[]
    }
  }
}

export interface ProductDetailsResponse {
  success: boolean
  data: {
    product: DetailedInvestmentProduct
  }
}