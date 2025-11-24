import axios from 'axios'
import { AdminLoginRequest, AdminAuthResponse, AdminUser } from '../types/admin'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

const adminAuthApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add admin token to requests if available
adminAuthApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminAuthToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const adminAuthService = {
  async login(credentials: AdminLoginRequest): Promise<AdminAuthResponse> {
    // Use the regular auth endpoint but validate admin role
    const response = await adminAuthApi.post('/auth/login', credentials)
    
    // Check if user has admin role
    if (response.data.user.role !== 'admin') {
      throw new Error('Access denied. Admin privileges required.')
    }
    
    // Transform response to match AdminAuthResponse format
    return {
      user: {
        id: response.data.user.id,
        email: response.data.user.email,
        emailVerified: response.data.user.emailVerified,
        mfaEnabled: response.data.user.mfaEnabled,
        role: 'admin',
        permissions: ['user_management', 'product_management', 'system_settings', 'analytics', 'kyc_management', 'withdrawal_management'],
        lastLoginAt: new Date().toISOString(),
        createdAt: response.data.user.createdAt,
        updatedAt: response.data.user.updatedAt
      },
      tokens: response.data.tokens,
      message: 'Admin login successful',
      requiresEmailVerification: response.data.requiresEmailVerification,
      requiresMFA: response.data.requiresMFA,
      stage: response.data.stage
    }
  },

  async getCurrentAdmin(): Promise<{ user: AdminUser }> {
    const response = await adminAuthApi.get('/auth/me')
    
    // Check if user has admin role
    if (response.data.user.role !== 'admin') {
      throw new Error('Access denied. Admin privileges required.')
    }
    
    return {
      user: {
        id: response.data.user.id,
        email: response.data.user.email,
        emailVerified: response.data.user.emailVerified,
        mfaEnabled: response.data.user.mfaEnabled,
        role: 'admin',
        permissions: ['user_management', 'product_management', 'system_settings', 'analytics', 'kyc_management', 'withdrawal_management'],
        lastLoginAt: response.data.user.lastLoginAt,
        createdAt: response.data.user.createdAt,
        updatedAt: response.data.user.updatedAt
      }
    }
  },

  async verifyMFA(code: string): Promise<{ success: boolean }> {
    const response = await adminAuthApi.post('/admin/auth/verify-mfa', { token: code })
    return response.data
  },

  logout() {
    localStorage.removeItem('adminAuthToken')
    localStorage.removeItem('adminRefreshToken')
  }
}