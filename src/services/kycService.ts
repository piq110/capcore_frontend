import axios from 'axios'
import { KYCSubmissionData, KYCStatus, FileUpload } from '../types/kyc'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const kycApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
})

// Add token to requests if available
kycApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const kycService = {
  async submitKYC(submissionData: KYCSubmissionData, files: FileUpload[]): Promise<{ 
    message: string
    submission: {
      id: string
      status: string
      submittedAt: string
      documentsUploaded: number
    }
  }> {
    const formData = new FormData()
    
    // Add submission data
    formData.append('firstName', submissionData.firstName)
    formData.append('lastName', submissionData.lastName)
    formData.append('dateOfBirth', submissionData.dateOfBirth)
    formData.append('nationality', submissionData.nationality)
    formData.append('phoneNumber', submissionData.phoneNumber)
    
    // Add address data
    formData.append('address[street]', submissionData.address.street)
    formData.append('address[city]', submissionData.address.city)
    formData.append('address[state]', submissionData.address.state)
    formData.append('address[postalCode]', submissionData.address.postalCode)
    formData.append('address[country]', submissionData.address.country)
    
    // Add accredited investor data if provided
    if (submissionData.accreditedInvestor) {
      formData.append('accreditedInvestor[claimed]', submissionData.accreditedInvestor.claimed.toString())
      if (submissionData.accreditedInvestor.type) {
        formData.append('accreditedInvestor[type]', submissionData.accreditedInvestor.type)
      }
      if (submissionData.accreditedInvestor.annualIncome) {
        formData.append('accreditedInvestor[annualIncome]', submissionData.accreditedInvestor.annualIncome.toString())
      }
      if (submissionData.accreditedInvestor.netWorth) {
        formData.append('accreditedInvestor[netWorth]', submissionData.accreditedInvestor.netWorth.toString())
      }
      if (submissionData.accreditedInvestor.professionalCertification) {
        formData.append('accreditedInvestor[professionalCertification]', submissionData.accreditedInvestor.professionalCertification)
      }
      if (submissionData.accreditedInvestor.entityType) {
        formData.append('accreditedInvestor[entityType]', submissionData.accreditedInvestor.entityType)
      }
    }
    
    // Add files
    files.forEach((fileUpload) => {
      formData.append(fileUpload.type, fileUpload.file)
    })
    
    const response = await kycApi.post('/kyc/submit', formData)
    return response.data
  },

  async getKYCStatus(): Promise<KYCStatus> {
    const response = await kycApi.get('/kyc/status', {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return response.data
  },

  async downloadDocument(submissionId: string, filename: string): Promise<Blob> {
    const response = await kycApi.get(`/kyc/document/${submissionId}/${filename}`, {
      responseType: 'blob',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return response.data
  },

  validateFile(file: File, maxSize: number = 10 * 1024 * 1024): { isValid: boolean; error?: string } {
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
    ]

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `Invalid file type: ${file.type}. Allowed types: ${allowedTypes.join(', ')}`
      }
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum size: ${(maxSize / 1024 / 1024).toFixed(2)}MB`
      }
    }

    return { isValid: true }
  },

  createFilePreview(file: File): Promise<string> {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result
          if (typeof result === 'string') {
            resolve(result)
          } else {
            resolve('')
          }
        }
        reader.onerror = (error) => {
          console.error('FileReader error:', error)
          resolve('') // Resolve with empty string instead of rejecting
        }
        reader.readAsDataURL(file)
      } else {
        // For PDFs and other files, return empty string (no preview)
        resolve('')
      }
    })
  }
}