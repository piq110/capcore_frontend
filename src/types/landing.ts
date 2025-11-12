/**
 * TypeScript interfaces for landing page components
 */

/**
 * Navigation bar component props
 */
export interface NavigationBarProps {
  currentPage?: string
  onNavigate: (path: string) => void
  isAuthenticated?: boolean
}

/**
 * Customer dropdown component props
 */
export interface CustomerDropdownProps {
  onSelect: (userType: 'individual' | 'institutional' | 'advisor') => void
  isOpen: boolean
  onToggle: () => void
}

/**
 * User type card data structure
 */
export interface UserTypeCard {
  type: 'individual' | 'institution' | 'advisor'
  title: string
  description: string
  icon?: string
}

/**
 * User type cards component props
 */
export interface UserTypeCardsProps {
  onCardClick: (cardType: string) => void
}

/**
 * Footer component props
 */
export interface FooterProps {
  compactMode?: boolean
}

/**
 * Navigation state management
 */
export interface NavigationState {
  currentPage: string
  dropdownOpen: boolean
  mobileMenuOpen: boolean
}

/**
 * User type data configuration
 */
export interface UserTypeData {
  individual: {
    title: string
    description: string
    targetPage: string
  }
  institution: {
    title: string
    description: string
    targetPage: string
  }
  advisor: {
    title: string
    description: string
    targetPage: string
  }
}

/**
 * Legal content structure
 */
export interface LegalContent {
  disclaimer: string
  privacyPolicy: string
  contactInfo: {
    email: string
    company: string
    credentials: string
  }
}