import axios from 'axios'
import { LoginRequest, RegisterRequest, AuthResponse, MFASetupResponse, EmailVerificationStatus } from '../types/auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests if available
authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await authApi.post('/auth/login', credentials)
    return response.data
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await authApi.post('/auth/register', userData)
    return response.data
  },

  async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    const response = await authApi.get(`/auth/verify-email/${token}`)
    return response.data
  },

  async resendVerificationEmail(): Promise<{ success: boolean; message: string }> {
    const response = await authApi.post('/auth/resend-verification')
    return response.data
  },

  async getEmailVerificationStatus(): Promise<EmailVerificationStatus> {
    const response = await authApi.get('/auth/email-status')
    return response.data
  },

  async setupMFA(): Promise<MFASetupResponse> {
    const response = await authApi.post('/auth/setup-mfa')
    return response.data
  },

  async verifyMFA(code: string, isSetup: boolean = false): Promise<{ success: boolean; backupCodes?: string[] }> {
    const response = await authApi.post('/auth/verify-mfa', { token: code, isSetup })
    return response.data
  },

  async disableMFA(code: string): Promise<{ success: boolean }> {
    const response = await authApi.post('/auth/disable-mfa', { token: code })
    return response.data
  },

  async getCurrentUser() {
    const response = await authApi.get('/auth/me')
    return response.data
  },

  async updateProfile(profileData: {
    firstName?: string
    lastName?: string
    phoneNumber?: string
  }) {
    const response = await authApi.put('/auth/profile', profileData)
    return response.data
  },

  logout() {
    localStorage.removeItem('authToken')
    localStorage.removeItem('refreshToken')
  },
}