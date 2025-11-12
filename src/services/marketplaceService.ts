import axios from 'axios'
import { 
  ProductsResponse, 
  ProductDetailsResponse, 
  ProductFilters,
  InvestmentProduct
} from '../types/marketplace'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

const marketplaceApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests if available
marketplaceApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const marketplaceService = {
  async getProducts(filters: ProductFilters = {}, limit = 20, offset = 0): Promise<ProductsResponse> {
    const params = new URLSearchParams()
    
    if (filters.type) params.append('type', filters.type)
    if (filters.status) params.append('status', filters.status)
    if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString())
    if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString())
    if (filters.sector) params.append('sector', filters.sector)
    if (filters.geography) params.append('geography', filters.geography)
    if (filters.sortBy) params.append('sortBy', filters.sortBy)
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)
    
    params.append('limit', limit.toString())
    params.append('offset', offset.toString())

    console.log('Loading products from API with filters:', filters, 'limit:', limit, 'offset:', offset)
    const response = await marketplaceApi.get(`/products?${params.toString()}`)
    console.log('API response:', response.data)
    return response.data
  },

  async getProductDetails(productId: string): Promise<ProductDetailsResponse> {
    const response = await marketplaceApi.get(`/products/${productId}`)
    return response.data
  },

  async searchProducts(query: string, filters: ProductFilters = {}): Promise<InvestmentProduct[]> {
    const params = new URLSearchParams()
    params.append('search', query)
    
    if (filters.type) params.append('type', filters.type)
    if (filters.status) params.append('status', filters.status)
    if (filters.sector) params.append('sector', filters.sector)
    if (filters.geography) params.append('geography', filters.geography)
    
    console.log('Searching products via API with query:', query, 'filters:', filters)
    const response = await marketplaceApi.get(`/products?${params.toString()}`)
    return response.data.data.products
  },

  async getAvailableFilters(): Promise<{ types: string[], sectors: string[], geographies: string[] }> {
    // Get all products to extract filter values
    const response = await this.getProducts({}, 1000, 0) // Get a large number to capture all products
    const products = response.data.products
    
    const sectors = [...new Set(products.map(p => p.sector).filter(Boolean))] as string[]
    const geographies = [...new Set(products.map(p => p.geography).filter(Boolean))] as string[]
    const types = ['REIT', 'BDC']
    
    console.log('Available filters from API:', { types, sectors, geographies })
    return { types, sectors, geographies }
  },
}