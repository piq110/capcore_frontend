import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { User } from '../types/auth'
import { authService } from '../services/authService'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string, mfaCode?: string) => Promise<void>
  register: (email: string, password: string, confirmPassword: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
  updateUser: (userData: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('authToken')
      if (token) {
        try {
          const userData = await authService.getCurrentUser()
          setUser(userData.user)
        } catch (error) {
          localStorage.removeItem('authToken')
          localStorage.removeItem('refreshToken')
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string, mfaCode?: string) => {
    const response = await authService.login({ email, password, mfaCode })
    localStorage.setItem('authToken', response.tokens.accessToken)
    localStorage.setItem('refreshToken', response.tokens.refreshToken)
    setUser(response.user)
  }

  const register = async (email: string, password: string, confirmPassword: string) => {
    const response = await authService.register({ email, password, confirmPassword })
    localStorage.setItem('authToken', response.tokens.accessToken)
    localStorage.setItem('refreshToken', response.tokens.refreshToken)
    setUser(response.user)
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  const refreshUser = async () => {
    if (isAuthenticated) {
      try {
        const userData = await authService.getCurrentUser()
        setUser(userData.user)
      } catch (error) {
        logout()
      }
    }
  }

  const updateUser = (userData: User) => {
    setUser(userData)
  }

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}