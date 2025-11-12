import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { AdminUser } from '../types/admin'
import { adminAuthService } from '../services/adminAuthService'

interface AdminAuthContextType {
  admin: AdminUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string, mfaCode?: string) => Promise<void>
  logout: () => void
  refreshAdmin: () => Promise<void>
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!admin

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('adminAuthToken')
      if (token) {
        try {
          // Get current admin data
          const adminData = await adminAuthService.getCurrentAdmin()
          setAdmin(adminData.user)
        } catch (error) {
          console.error('Failed to authenticate admin:', error)
          localStorage.removeItem('adminAuthToken')
          localStorage.removeItem('adminRefreshToken')
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string, mfaCode?: string) => {
    // Login with admin credentials
    const response = await adminAuthService.login({ email, password, mfaCode })
    
    localStorage.setItem('adminAuthToken', response.tokens.accessToken)
    localStorage.setItem('adminRefreshToken', response.tokens.refreshToken)
    setAdmin(response.user)
  }

  const logout = () => {
    adminAuthService.logout()
    setAdmin(null)
  }

  const refreshAdmin = async () => {
    if (isAuthenticated) {
      try {
        // Refresh admin data
        const adminData = await adminAuthService.getCurrentAdmin()
        setAdmin(adminData.user)
      } catch (error) {
        console.error('Failed to refresh admin data:', error)
        logout()
      }
    }
  }

  const value = {
    admin,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshAdmin,
  }

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}