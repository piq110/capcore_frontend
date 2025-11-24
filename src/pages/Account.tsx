import React, { useState } from 'react'
import { 
  Box, 
  Typography, 
  Tabs,
  Tab,
  Paper
} from '@mui/material'
import EmailVerification from '../components/auth/EmailVerification'
import { AccountSettings, KYCSubmission } from '../components/account'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`account-tabpanel-${index}`}
      aria-labelledby={`account-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  )
}

function a11yProps(index: number) {
  return {
    id: `account-tab-${index}`,
    'aria-controls': `account-tabpanel-${index}`,
  }
}

const Account: React.FC = () => {
  const [tabValue, setTabValue] = useState(0)
  const [showEmailVerification] = useState(false)

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }



  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Account Management
      </Typography>

      {showEmailVerification && (
        <Box sx={{ mb: 3 }}>
          <EmailVerification showAsComponent={true} />
        </Box>
      )}

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="account tabs">
            <Tab label="Account Settings" {...a11yProps(0)} />
            <Tab label="Identity Verification" {...a11yProps(1)} />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <AccountSettings />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <KYCSubmission />
        </TabPanel>
      </Paper>
    </Box>
  )
}



export default Account