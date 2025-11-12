export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  phoneNumber?: string
  emailVerified: boolean
  mfaEnabled: boolean
  kycStatus: 'pending' | 'approved' | 'rejected' | 'not_started'
  accreditedInvestor: boolean
  role: 'user' | 'issuer' // Keep role but only for user/issuer distinction
  createdAt: string
  updatedAt: string
}

export interface LoginRequest {
  email: string
  password: string
  mfaCode?: string
}

export interface RegisterRequest {
  email: string
  password: string
  confirmPassword: string
}

export interface AuthResponse {
  user: User
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

export interface MFASetupResponse {
  message: string
  setup: {
    qrCodeUrl: string
    manualEntryKey: string
    backupCodes: string[]
  }
  instructions: {
    steps: string[]
    supportedApps: string[]
    troubleshooting: string[]
  }
}

export interface EmailVerificationStatus {
  verified: boolean
  email: string
  resendAvailable: boolean
  resendCooldown?: number
}

export interface InfoBarState {
  showAlphaStage: boolean
  showEmailVerification: boolean
  showKYCStatus: boolean
  kycStatus?: 'pending' | 'approved' | 'rejected' | 'not_started'
}