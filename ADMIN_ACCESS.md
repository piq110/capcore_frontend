# Admin Access Documentation

## Overview

The LODAS platform now has separate authentication systems for regular users and administrators, providing enhanced security and role separation.

## Access URLs

### User Portal
- **Login**: `/login`
- **Register**: `/register`
- **Dashboard**: `/` (redirects to marketplace)

### Admin Portal
- **Login**: `/admin/login`
- **Dashboard**: `/admin/dashboard`
- **User Management**: `/admin/users`
- **Product Management**: `/admin/products`
- **KYC Management**: `/admin/kyc`
- **Withdrawal Approvals**: `/admin/withdrawals`
- **Reports & Analytics**: `/admin/reports`

## Admin Account Setup

### Creating an Admin User
Admin users must be created through the backend. Use the provided script:

```bash
cd backend
node scripts/create-admin.js admin@yourdomain.com yourSecurePassword123
```

This script will:
- Create a new user with admin role
- Auto-verify the email address
- Set KYC status to approved
- Activate the account

### Admin Access
- **Login URL**: `/admin/login`
- **Credentials**: Use the admin account created via the script
- **Requirements**: User must have `role: 'admin'` in the database

### Regular User Access
- Use the regular registration flow at `/register`

## Key Differences

### User Portal
- **Theme**: Blue/Primary colors
- **Features**: Marketplace, Portfolio, Wallet, Account management
- **Authentication**: Standard user authentication
- **Token Storage**: `authToken` in localStorage

### Admin Portal
- **Theme**: Red/Error colors (to distinguish from user portal)
- **Features**: 
  - **Dashboard**: System overview, statistics, recent activity, system health
  - **User Management**: User accounts, KYC status, role management, account actions
  - **Product Management**: Investment products, creation, editing, status management
  - **KYC Management**: Document review, approval/rejection, compliance tracking
  - **Withdrawal Approvals**: Pending withdrawals, approval workflow, transaction monitoring
  - **Reports & Analytics**: Transaction reports, audit logs, system analytics
- **Authentication**: Separate admin authentication system
- **Token Storage**: `adminAuthToken` in localStorage
- **Enhanced Security**: Separate authentication flow and session management

## Security Features

1. **Separate Authentication Systems**: Admin and user authentication are completely isolated
2. **Different Token Storage**: Admin tokens are stored separately from user tokens
3. **Role-Based Access**: Admin routes are protected and only accessible to authenticated admins
4. **Visual Distinction**: Admin portal uses red theme to clearly distinguish from user portal
5. **Separate Layouts**: Admin portal has its own layout and navigation structure

## Development Notes

- **Real API Integration**: Admin system now connects to the real backend API
- **Fallback System**: Automatically falls back to mock data if API calls fail
- **Database Integration**: Uses the same User model with role-based access control
- **Authentication**: Uses the standard auth endpoints with admin role validation
- **Comprehensive Components**: Full-featured admin components for all major functions
- **File Structure**:
  - Admin components: `/src/components/admin/`
  - Admin pages: `/src/pages/Admin*.tsx`
  - Admin services: `/src/services/admin*.ts`
  - Admin types: `/src/types/admin.ts`

## Available Admin Functions

### Dashboard
- Real-time system statistics
- Recent activity monitoring
- System health indicators
- Revenue tracking
- Performance metrics

### User Management
- User search and filtering
- Account status management
- KYC status overview
- Role assignment
- Account suspension/activation
- Balance adjustments

### Product Management
- Investment product catalog
- Product creation and editing
- Status management (active/inactive)
- Fee structure configuration
- Performance tracking

### KYC Management
- Document review interface
- Approval/rejection workflow
- Compliance tracking
- Additional information requests
- Audit trail

### Withdrawal Management
- Pending withdrawal queue
- Approval workflow
- Transaction monitoring
- Risk assessment
- Batch processing

### Reports & Analytics
- Transaction reports
- User analytics
- Revenue reports
- Audit logs
- System performance metrics

## Future Enhancements

- Multi-factor authentication for admin accounts
- Audit logging for admin actions
- Advanced permission management
- Admin activity monitoring
- Session timeout controls