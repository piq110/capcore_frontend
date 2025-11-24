import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material'
import {
  CloudUpload,
  Delete,
  Visibility,
  CheckCircle,

  ExpandMore,
  AttachFile,
  Description
} from '@mui/icons-material'
import { useDropzone } from 'react-dropzone'
import { 
  KYCSubmissionData, 
  FileUpload, 
  DOCUMENT_TYPES, 
  ACCREDITED_DOCUMENT_TYPES,
  ACCREDITED_INVESTOR_TYPES,

  DocumentType
} from '../../types/kyc'
import { kycService } from '../../services/kycService'
import { useAuth } from '../../hooks/useAuth'

const steps = [
  'Personal Information',
  'Address Information', 
  'Document Upload',
  'Accredited Investor (Optional)',
  'Review & Submit'
]

const KYCSubmission: React.FC = () => {
  const { user, refreshUser } = useAuth()
  const [activeStep, setActiveStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Form data state
  const [formData, setFormData] = useState<KYCSubmissionData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nationality: '',
    phoneNumber: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US'
    },
    accreditedInvestor: {
      claimed: false,
      type: undefined,
      annualIncome: undefined,
      netWorth: undefined,
      professionalCertification: undefined,
      entityType: undefined
    }
  })
  
  // File upload state
  const [uploadedFiles, setUploadedFiles] = useState<FileUpload[]>([])
  const [previewDialog, setPreviewDialog] = useState<{ open: boolean; file?: FileUpload }>({ open: false })
  const [uploadingFiles, setUploadingFiles] = useState<boolean>(false)
  
  // Validation state
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    // Check if user already has KYC submitted
    checkKYCStatus()
  }, [])

  const checkKYCStatus = async () => {
    try {
      const status = await kycService.getKYCStatus()
      if (status.status !== 'not_started') {
        // User already has KYC submission
        setError('You have already submitted KYC information. Check your account status.')
      }
    } catch (error) {
      console.error('Failed to check KYC status:', error)
    }
  }

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {}
    
    switch (step) {
      case 0: // Personal Information
        if (!formData.firstName.trim()) errors.firstName = 'First name is required'
        if (!formData.lastName.trim()) errors.lastName = 'Last name is required'
        if (!formData.dateOfBirth) errors.dateOfBirth = 'Date of birth is required'
        if (!formData.nationality.trim()) errors.nationality = 'Nationality is required'
        if (!formData.phoneNumber.trim()) {
          errors.phoneNumber = 'Phone number is required'
        } else if (!/^\+?[1-9]\d{1,14}$/.test(formData.phoneNumber.trim())) {
          errors.phoneNumber = 'Phone number must be in international format (e.g., +12345678901)'
        }
        
        // Validate age (must be 18+)
        if (formData.dateOfBirth) {
          const birthDate = new Date(formData.dateOfBirth)
          const age = new Date().getFullYear() - birthDate.getFullYear()
          if (age < 18) {
            errors.dateOfBirth = 'You must be at least 18 years old'
          }
        }
        break
        
      case 1: // Address Information
        if (!formData.address.street.trim()) errors['address.street'] = 'Street address is required'
        if (!formData.address.city.trim()) errors['address.city'] = 'City is required'
        if (!formData.address.state.trim()) errors['address.state'] = 'State is required'
        if (!formData.address.postalCode.trim()) errors['address.postalCode'] = 'Postal code is required'
        if (!formData.address.country.trim()) errors['address.country'] = 'Country is required'
        break
        
      case 2: { // Document Upload
        const hasIdentityDoc = uploadedFiles.some(file => 
          ['passport', 'drivers_license', 'national_id'].includes(file.type)
        )
        if (!hasIdentityDoc) {
          errors.documents = 'At least one identity document is required'
        }
        
        const hasProofOfAddress = uploadedFiles.some(file => file.type === 'proof_of_address')
        if (!hasProofOfAddress) {
          errors.proofOfAddress = 'Proof of address is required'
        }
        break
      }
        
      case 3: // Accredited Investor
        if (formData.accreditedInvestor?.claimed) {
          if (!formData.accreditedInvestor.type) {
            errors.accreditedType = 'Please select accredited investor type'
          }
          
          // Validate based on type
          if (formData.accreditedInvestor.type === 'income' && !formData.accreditedInvestor.annualIncome) {
            errors.annualIncome = 'Annual income is required for income-based accreditation'
          }
          
          if (formData.accreditedInvestor.type === 'net_worth' && !formData.accreditedInvestor.netWorth) {
            errors.netWorth = 'Net worth is required for net worth-based accreditation'
          }
          
          if (formData.accreditedInvestor.type === 'professional' && !formData.accreditedInvestor.professionalCertification) {
            errors.professionalCertification = 'Professional certification is required'
          }
          
          if (formData.accreditedInvestor.type === 'entity' && !formData.accreditedInvestor.entityType) {
            errors.entityType = 'Entity type is required'
          }
          
          // Check for supporting documents
          const hasAccreditedDocs = uploadedFiles.some(file => 
            file.type.startsWith('accredited_')
          )
          if (!hasAccreditedDocs) {
            errors.accreditedDocs = 'Supporting documents are required for accredited investor claims'
          }
        }
        break
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    setActiveStep(prev => prev - 1)
  }

  const handleFileUpload = async (acceptedFiles: File[], documentType: string) => {
    setUploadingFiles(true)
    setError(null) // Clear any previous errors
    const newFiles: FileUpload[] = []
    
    for (const file of acceptedFiles) {
      const validation = kycService.validateFile(file, 10 * 1024 * 1024) // 10MB limit
      if (!validation.isValid) {
        setError(validation.error || 'Invalid file')
        continue
      }
      
      try {
        const preview = await kycService.createFilePreview(file)
        const fileUpload: FileUpload = {
          file,
          type: documentType,
          preview
        }
        
        newFiles.push(fileUpload)
      } catch (error) {
        console.error('Failed to create file preview:', error)
        // Still add the file even if preview fails
        const fileUpload: FileUpload = {
          file,
          type: documentType,
          preview: undefined
        }
        
        newFiles.push(fileUpload)
      }
    }
    
    setUploadedFiles(prev => [...prev, ...newFiles])
    setUploadingFiles(false)
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!validateStep(4)) return
    
    setLoading(true)
    setError(null)
    
    try {
      await kycService.submitKYC(formData, uploadedFiles)
      setSuccess('KYC submission successful! Your documents are being reviewed.')
      
      // Refresh user data from server to get updated KYC status
      await refreshUser()
      
      // Reset form
      setActiveStep(0)
      setFormData({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        nationality: '',
        phoneNumber: '',
        address: {
          street: '',
          city: '',
          state: '',
          postalCode: '',
          country: 'US'
        },
        accreditedInvestor: {
          claimed: false
        }
      })
      setUploadedFiles([])
      
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to submit KYC. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const FileUploadZone: React.FC<{ documentType: DocumentType }> = ({ documentType }) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      accept: {
        'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
        'application/pdf': ['.pdf']
      },
      maxSize: documentType.maxSize,
      onDrop: async (acceptedFiles) => await handleFileUpload(acceptedFiles, documentType.key)
    })

    const existingFiles = uploadedFiles.filter(f => f.type === documentType.key)

    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          {documentType.label} {documentType.required && '*'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {documentType.description}
        </Typography>
        
        {existingFiles.length === 0 ? (
          <Paper
            {...getRootProps()}
            sx={{
              p: 2,
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : 'grey.300',
              backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
              cursor: uploadingFiles ? 'not-allowed' : 'pointer',
              textAlign: 'center',
              opacity: uploadingFiles ? 0.6 : 1
            }}
          >
            <input {...getInputProps()} disabled={uploadingFiles} />
            <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body2">
              {uploadingFiles 
                ? 'Processing files...' 
                : isDragActive 
                  ? 'Drop files here' 
                  : 'Drag & drop files here, or click to select'
              }
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Accepted formats: {documentType.acceptedFormats.join(', ')} (max {(documentType.maxSize / 1024 / 1024).toFixed(0)}MB)
            </Typography>
            {uploadingFiles && <LinearProgress sx={{ mt: 1 }} />}
          </Paper>
        ) : (
          <List dense>
            {existingFiles.map((fileUpload, index) => (
              <ListItem key={index} sx={{ border: 1, borderColor: 'grey.300', borderRadius: 1, mb: 1 }}>
                <ListItemIcon>
                  <AttachFile />
                </ListItemIcon>
                <ListItemText
                  primary={fileUpload.file.name}
                  secondary={`${(fileUpload.file.size / 1024 / 1024).toFixed(2)} MB`}
                />
                <IconButton onClick={() => setPreviewDialog({ open: true, file: fileUpload })}>
                  <Visibility />
                </IconButton>
                <IconButton onClick={() => removeFile(uploadedFiles.indexOf(fileUpload))} color="error">
                  <Delete />
                </IconButton>
              </ListItem>
            ))}
            <Button
              {...getRootProps()}
              variant="outlined"
              startIcon={<CloudUpload />}
              size="small"
              disabled={uploadingFiles}
            >
              <input {...getInputProps()} disabled={uploadingFiles} />
              {uploadingFiles ? 'Processing...' : 'Add More Files'}
            </Button>
          </List>
        )}
      </Box>
    )
  }

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                error={!!validationErrors.firstName}
                helperText={validationErrors.firstName}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                error={!!validationErrors.lastName}
                helperText={validationErrors.lastName}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                error={!!validationErrors.dateOfBirth}
                helperText={validationErrors.dateOfBirth}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nationality"
                value={formData.nationality}
                onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
                error={!!validationErrors.nationality}
                helperText={validationErrors.nationality}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phoneNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                error={!!validationErrors.phoneNumber}
                helperText={validationErrors.phoneNumber || "International format: +1234567890 (country code + number)"}
                placeholder="+12345678901"
                required
              />
            </Grid>
          </Grid>
        )

      case 1:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                value={formData.address.street}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  address: { ...prev.address, street: e.target.value }
                }))}
                error={!!validationErrors['address.street']}
                helperText={validationErrors['address.street']}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                value={formData.address.city}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  address: { ...prev.address, city: e.target.value }
                }))}
                error={!!validationErrors['address.city']}
                helperText={validationErrors['address.city']}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="State/Province"
                value={formData.address.state}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  address: { ...prev.address, state: e.target.value }
                }))}
                error={!!validationErrors['address.state']}
                helperText={validationErrors['address.state']}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Postal Code"
                value={formData.address.postalCode}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  address: { ...prev.address, postalCode: e.target.value }
                }))}
                error={!!validationErrors['address.postalCode']}
                helperText={validationErrors['address.postalCode']}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Country</InputLabel>
                <Select
                  value={formData.address.country}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    address: { ...prev.address, country: e.target.value }
                  }))}
                  label="Country"
                >
                  <MenuItem value="US">United States</MenuItem>
                  <MenuItem value="CA">Canada</MenuItem>
                  <MenuItem value="GB">United Kingdom</MenuItem>
                  <MenuItem value="AU">Australia</MenuItem>
                  {/* Add more countries as needed */}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        )

      case 2:
        return (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              Please upload clear, high-quality images or PDFs of your documents. 
              All documents must be valid and not expired.
            </Alert>
            
            {validationErrors.documents && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {validationErrors.documents}
              </Alert>
            )}
            
            {validationErrors.proofOfAddress && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {validationErrors.proofOfAddress}
              </Alert>
            )}

            <Typography variant="h6" gutterBottom>
              Identity Documents (Choose at least one)
            </Typography>
            {DOCUMENT_TYPES.filter(doc => ['passport', 'drivers_license', 'national_id'].includes(doc.key)).map(docType => (
              <FileUploadZone key={docType.key} documentType={docType} />
            ))}

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Additional Documents
            </Typography>
            {DOCUMENT_TYPES.filter(doc => !['passport', 'drivers_license', 'national_id'].includes(doc.key)).map(docType => (
              <FileUploadZone key={docType.key} documentType={docType} />
            ))}
          </Box>
        )

      case 3:
        return (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              Accredited investor status is optional but may provide access to additional investment opportunities.
            </Alert>

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.accreditedInvestor?.claimed || false}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    accreditedInvestor: {
                      ...prev.accreditedInvestor,
                      claimed: e.target.checked
                    }
                  }))}
                />
              }
              label="I claim to be an accredited investor"
            />

            {formData.accreditedInvestor?.claimed && (
              <Box sx={{ mt: 2 }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Accredited Investor Type</InputLabel>
                  <Select
                    value={formData.accreditedInvestor.type || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      accreditedInvestor: {
                        ...prev.accreditedInvestor,
                        claimed: prev.accreditedInvestor?.claimed || false,
                        type: e.target.value as any
                      }
                    }))}
                    label="Accredited Investor Type"
                    error={!!validationErrors.accreditedType}
                  >
                    {ACCREDITED_INVESTOR_TYPES.map(type => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {formData.accreditedInvestor.type && (
                  <Box sx={{ mb: 2 }}>
                    {ACCREDITED_INVESTOR_TYPES.map(type => (
                      formData.accreditedInvestor?.type === type.value && (
                        <Accordion key={type.value} defaultExpanded>
                          <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography variant="subtitle1">{type.label} Requirements</Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Typography variant="body2" paragraph>
                              {type.description}
                            </Typography>
                            <Typography variant="subtitle2" gutterBottom>
                              Requirements:
                            </Typography>
                            <List dense>
                              {type.requirements.map((req, index) => (
                                <ListItem key={index}>
                                  <ListItemIcon>
                                    <CheckCircle color="primary" fontSize="small" />
                                  </ListItemIcon>
                                  <ListItemText primary={req} />
                                </ListItem>
                              ))}
                            </List>
                          </AccordionDetails>
                        </Accordion>
                      )
                    ))}
                  </Box>
                )}

                {/* Type-specific fields */}
                {formData.accreditedInvestor.type === 'income' && (
                  <TextField
                    fullWidth
                    label="Annual Income (USD)"
                    type="number"
                    value={formData.accreditedInvestor.annualIncome || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      accreditedInvestor: {
                        ...prev.accreditedInvestor,
                        claimed: prev.accreditedInvestor?.claimed || false,
                        annualIncome: Number(e.target.value)
                      }
                    }))}
                    error={!!validationErrors.annualIncome}
                    helperText={validationErrors.annualIncome}
                    sx={{ mb: 2 }}
                  />
                )}

                {formData.accreditedInvestor.type === 'net_worth' && (
                  <TextField
                    fullWidth
                    label="Net Worth (USD, excluding primary residence)"
                    type="number"
                    value={formData.accreditedInvestor.netWorth || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      accreditedInvestor: {
                        ...prev.accreditedInvestor,
                        claimed: prev.accreditedInvestor?.claimed || false,
                        netWorth: Number(e.target.value)
                      }
                    }))}
                    error={!!validationErrors.netWorth}
                    helperText={validationErrors.netWorth}
                    sx={{ mb: 2 }}
                  />
                )}

                {formData.accreditedInvestor.type === 'professional' && (
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Professional Certification</InputLabel>
                    <Select
                      value={formData.accreditedInvestor.professionalCertification || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        accreditedInvestor: {
                          ...prev.accreditedInvestor,
                          claimed: prev.accreditedInvestor?.claimed || false,
                          professionalCertification: e.target.value
                        }
                      }))}
                      label="Professional Certification"
                      error={!!validationErrors.professionalCertification}
                    >
                      <MenuItem value="series_7">Series 7</MenuItem>
                      <MenuItem value="series_65">Series 65</MenuItem>
                      <MenuItem value="series_82">Series 82</MenuItem>
                      <MenuItem value="cpa">CPA</MenuItem>
                      <MenuItem value="cfa">CFA</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>
                )}

                {formData.accreditedInvestor.type === 'entity' && (
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Entity Type</InputLabel>
                    <Select
                      value={formData.accreditedInvestor.entityType || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        accreditedInvestor: {
                          ...prev.accreditedInvestor,
                          claimed: prev.accreditedInvestor?.claimed || false,
                          entityType: e.target.value
                        }
                      }))}
                      label="Entity Type"
                      error={!!validationErrors.entityType}
                    >
                      <MenuItem value="corporation">Corporation</MenuItem>
                      <MenuItem value="partnership">Partnership</MenuItem>
                      <MenuItem value="llc">LLC</MenuItem>
                      <MenuItem value="trust">Trust</MenuItem>
                      <MenuItem value="bank">Bank</MenuItem>
                      <MenuItem value="insurance_company">Insurance Company</MenuItem>
                      <MenuItem value="investment_company">Investment Company</MenuItem>
                    </Select>
                  </FormControl>
                )}

                {/* Supporting documents for accredited investor */}
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Supporting Documents
                </Typography>
                
                {validationErrors.accreditedDocs && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {validationErrors.accreditedDocs}
                  </Alert>
                )}

                {ACCREDITED_DOCUMENT_TYPES.filter(doc => 
                  !formData.accreditedInvestor?.type || 
                  doc.key === `accredited_${formData.accreditedInvestor.type}`
                ).map(docType => (
                  <FileUploadZone key={docType.key} documentType={docType} />
                ))}
              </Box>
            )}
          </Box>
        )

      case 4:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Your Information
            </Typography>
            
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>Personal Information</Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}><Typography variant="body2">Name:</Typography></Grid>
                  <Grid item xs={6}><Typography variant="body2">{formData.firstName} {formData.lastName}</Typography></Grid>
                  <Grid item xs={6}><Typography variant="body2">Date of Birth:</Typography></Grid>
                  <Grid item xs={6}><Typography variant="body2">{formData.dateOfBirth}</Typography></Grid>
                  <Grid item xs={6}><Typography variant="body2">Nationality:</Typography></Grid>
                  <Grid item xs={6}><Typography variant="body2">{formData.nationality}</Typography></Grid>
                  <Grid item xs={6}><Typography variant="body2">Phone:</Typography></Grid>
                  <Grid item xs={6}><Typography variant="body2">{formData.phoneNumber}</Typography></Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>Address</Typography>
                <Typography variant="body2">
                  {formData.address.street}<br />
                  {formData.address.city}, {formData.address.state} {formData.address.postalCode}<br />
                  {formData.address.country}
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>Uploaded Documents</Typography>
                <List dense>
                  {uploadedFiles.map((file, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Description />
                      </ListItemIcon>
                      <ListItemText
                        primary={file.file.name}
                        secondary={`Type: ${file.type}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>

            {formData.accreditedInvestor?.claimed && (
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>Accredited Investor</Typography>
                  <Chip label="Claimed" color="primary" size="small" />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Type: {formData.accreditedInvestor.type}
                  </Typography>
                </CardContent>
              </Card>
            )}

            <Alert severity="warning" sx={{ mt: 2 }}>
              By submitting this form, you certify that all information provided is true and accurate. 
              False information may result in account suspension or legal action.
            </Alert>
          </Box>
        )

      default:
        return null
    }
  }

  if (user?.kycStatus !== 'not_started') {
    return (
      <Alert severity="info">
        You have already submitted KYC information. Current status: {user?.kycStatus}
      </Alert>
    )
  }

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Identity Verification (KYC)
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
            <StepContent>
              <Box sx={{ mb: 2 }}>
                {renderStepContent(index)}
              </Box>
              <Box sx={{ mb: 1 }}>
                <Button
                  variant="contained"
                  onClick={index === steps.length - 1 ? handleSubmit : handleNext}
                  sx={{ mt: 1, mr: 1 }}
                  disabled={loading}
                >
                  {index === steps.length - 1 ? 'Submit KYC' : 'Continue'}
                </Button>
                <Button
                  disabled={index === 0 || loading}
                  onClick={handleBack}
                  sx={{ mt: 1, mr: 1 }}
                >
                  Back
                </Button>
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>

      {/* File Preview Dialog */}
      <Dialog 
        open={previewDialog.open} 
        onClose={() => setPreviewDialog({ open: false })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>File Preview</DialogTitle>
        <DialogContent>
          {previewDialog.file && (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle1" gutterBottom>
                {previewDialog.file.file.name}
              </Typography>
              {previewDialog.file.preview ? (
                <img 
                  src={previewDialog.file.preview} 
                  alt="Preview" 
                  style={{ maxWidth: '100%', maxHeight: '400px' }}
                />
              ) : (
                <Box sx={{ p: 4 }}>
                  <Description sx={{ fontSize: 64, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    Preview not available for this file type
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog({ open: false })}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default KYCSubmission