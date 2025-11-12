import React from 'react'
import { Box } from '@mui/material'
import { useAuth } from '../../hooks/useAuth'
import InfoBar from './InfoBar'

interface InfoBarsProps {
  onEmailVerificationClick?: () => void
  onKYCClick?: () => void
}

const getKYCActions = (kycStatus: string, onKYCClick?: () => void) => {
  if (!onKYCClick) return undefined

  switch (kycStatus) {
    case 'not_started':
      return [
        {
          label: 'Start KYC',
          onClick: onKYCClick,
          variant: 'contained' as const,
          color: 'primary' as const,
          size: 'small' as const,
        },
      ]
    case 'rejected':
      return [
        {
          label: 'Resubmit KYC',
          onClick: onKYCClick,
          variant: 'contained' as const,
          color: 'error' as const,
          size: 'small' as const,
        },
        {
          label: 'Contact Support',
          onClick: () => window.open('mailto:support@lodas.com', '_blank'),
          variant: 'outlined' as const,
          color: 'error' as const,
          size: 'small' as const,
        },
      ]
    default:
      return undefined
  }
}

const InfoBars: React.FC<InfoBarsProps> = ({ onEmailVerificationClick, onKYCClick }) => {
  const { user } = useAuth()

  // Don't show anything if user is not authenticated
  if (!user) return null

  const showEmailVerification = !user.emailVerified
  const showKYCStatus = user.kycStatus !== 'approved'

  return (
    <Box sx={{ mb: 2 }}>
      {/* Email Verification Info Bar */}
      {showEmailVerification && (
        <InfoBar
          title="Email Verification Required"
          message="Please verify your email address to access all platform features. Check your inbox for the verification link."
          severity="warning"
          closable={true}
          collapsible={true}
          defaultExpanded={false}
          actions={onEmailVerificationClick ? [
            {
              label: 'Verify Now',
              onClick: onEmailVerificationClick,
              variant: 'contained',
              color: 'primary',
              size: 'small',
            },
          ] : undefined}
          sx={{ mb: 1 }}
        />
      )}

      {/* KYC Status Info Bar */}
      {showKYCStatus && (
        <InfoBar
          title={`KYC Verification ${getKYCStatusTitle(user.kycStatus)}`}
          message={getKYCStatusMessage(user.kycStatus)}
          severity={user.kycStatus === 'rejected' ? 'error' : 'warning'}
          closable={true}
          collapsible={true}
          defaultExpanded={false}
          actions={getKYCActions(user.kycStatus, onKYCClick)}
          sx={{ mb: 1 }}
        />
      )}
    </Box>
  )
}





const getKYCStatusTitle = (status: string): string => {
  switch (status) {
    case 'not_started':
      return 'Required'
    case 'pending':
      return 'Under Review'
    case 'rejected':
      return 'Rejected'
    default:
      return ''
  }
}

const getKYCStatusMessage = (status: string): string => {
  switch (status) {
    case 'not_started':
      return 'Complete your KYC verification to access trading and investment features. This process helps us comply with regulatory requirements.'
    case 'pending':
      return 'Your KYC documents are being reviewed by our compliance team. This typically takes 1-3 business days. You can browse investments but cannot trade until approved.'
    case 'rejected':
      return 'Your KYC verification was rejected. Please contact support or resubmit your documents with the required corrections.'
    default:
      return ''
  }
}

export default InfoBars