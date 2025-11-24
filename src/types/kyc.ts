export interface KYCSubmissionData {
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
  }
}

export interface KYCDocument {
  type: 'passport' | 'drivers_license' | 'national_id' | 'proof_of_address' | 'bank_statement' | 'other'
  filename: string
  originalName: string
  mimeType: string
  size: number
  uploadedAt: string
}

export interface KYCSubmission {
  id: string
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
  reviewedAt?: string
  rejectionReason?: string
  additionalInfoRequired?: string
  accreditedInvestorClaimed: boolean
  documents: KYCDocument[]
}

export interface KYCStatus {
  status: 'not_started' | 'pending' | 'approved' | 'rejected'
  submission?: KYCSubmission
}

export interface FileUpload {
  file: File
  type: string
  preview?: string
}

export interface AccreditedInvestorType {
  value: 'income' | 'net_worth' | 'professional' | 'entity'
  label: string
  description: string
  requirements: string[]
}

export const ACCREDITED_INVESTOR_TYPES: AccreditedInvestorType[] = [
  {
    value: 'income',
    label: 'High Income Individual',
    description: 'Individual with annual income exceeding $200,000 (or $300,000 joint)',
    requirements: [
      'Annual income > $200,000 for individual or $300,000 for joint filers',
      'Income maintained for the last 2 years',
      'Reasonable expectation of same income level in current year',
      'Tax returns or W-2s as proof of income'
    ]
  },
  {
    value: 'net_worth',
    label: 'High Net Worth Individual',
    description: 'Individual or joint net worth exceeding $1,000,000',
    requirements: [
      'Net worth > $1,000,000 (excluding primary residence)',
      'Bank statements, investment account statements',
      'Real estate appraisals (excluding primary residence)',
      'Debt statements and liabilities'
    ]
  },
  {
    value: 'professional',
    label: 'Licensed Professional',
    description: 'Holders of certain professional certifications',
    requirements: [
      'Series 7, 65, or 82 licenses in good standing',
      'CPA, CFA, or other qualifying professional designations',
      'Current license or certification documentation',
      'Professional experience in financial services'
    ]
  },
  {
    value: 'entity',
    label: 'Qualified Entity',
    description: 'Entities with assets > $5M or all equity owners are accredited',
    requirements: [
      'Entity assets > $5,000,000',
      'OR all equity owners are accredited investors',
      'Audited financial statements',
      'Entity formation documents'
    ]
  }
]

export interface DocumentType {
  key: string
  label: string
  description: string
  required: boolean
  acceptedFormats: string[]
  maxSize: number
}

export const DOCUMENT_TYPES: DocumentType[] = [
  {
    key: 'passport',
    label: 'Passport',
    description: 'Government-issued passport (photo page)',
    required: false,
    acceptedFormats: ['image/jpeg', 'image/png', 'application/pdf'],
    maxSize: 10 * 1024 * 1024 // 10MB
  },
  {
    key: 'drivers_license',
    label: 'Driver\'s License',
    description: 'Government-issued driver\'s license (front and back)',
    required: false,
    acceptedFormats: ['image/jpeg', 'image/png', 'application/pdf'],
    maxSize: 10 * 1024 * 1024
  },
  {
    key: 'national_id',
    label: 'National ID',
    description: 'Government-issued national identification card',
    required: false,
    acceptedFormats: ['image/jpeg', 'image/png', 'application/pdf'],
    maxSize: 10 * 1024 * 1024
  },
  {
    key: 'proof_of_address',
    label: 'Proof of Address',
    description: 'Utility bill, bank statement, or lease agreement (within 3 months)',
    required: true,
    acceptedFormats: ['image/jpeg', 'image/png', 'application/pdf'],
    maxSize: 10 * 1024 * 1024
  },
  {
    key: 'bank_statement',
    label: 'Bank Statement',
    description: 'Recent bank statement (within 3 months)',
    required: false,
    acceptedFormats: ['image/jpeg', 'image/png', 'application/pdf'],
    maxSize: 10 * 1024 * 1024
  }
]

export const ACCREDITED_DOCUMENT_TYPES: DocumentType[] = [
  {
    key: 'accredited_income',
    label: 'Income Verification',
    description: 'Tax returns, W-2s, or pay stubs for income verification',
    required: false,
    acceptedFormats: ['image/jpeg', 'image/png', 'application/pdf'],
    maxSize: 10 * 1024 * 1024
  },
  {
    key: 'accredited_net_worth',
    label: 'Net Worth Documentation',
    description: 'Bank statements, investment accounts, property appraisals',
    required: false,
    acceptedFormats: ['image/jpeg', 'image/png', 'application/pdf'],
    maxSize: 10 * 1024 * 1024
  },
  {
    key: 'accredited_professional',
    label: 'Professional Certification',
    description: 'Professional licenses or certifications (Series 7, 65, 82, CPA, CFA)',
    required: false,
    acceptedFormats: ['image/jpeg', 'image/png', 'application/pdf'],
    maxSize: 10 * 1024 * 1024
  },
  {
    key: 'accredited_entity',
    label: 'Entity Documentation',
    description: 'Audited financial statements, formation documents',
    required: false,
    acceptedFormats: ['image/jpeg', 'image/png', 'application/pdf'],
    maxSize: 10 * 1024 * 1024
  }
]