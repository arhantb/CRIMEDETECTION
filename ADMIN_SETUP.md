# Admin Setup Guide

## Overview
The crime detection system now uses a simple admin authentication system instead of Clerk for admin access. This provides a straightforward way for administrators to access the admin panel.

## Admin Credentials
- **Username**: `admin`
- **Password**: `admin`

## How to Access Admin Panel

### 1. Navigate to Admin Login
- Go to `/admin/login` or click "Access Admin Panel" from the home page
- Enter the credentials: `admin` / `admin`

### 2. Access Admin Dashboard
- After successful login, you'll be redirected to `/admin/checkrequest`
- This is the main admin dashboard where you can:
  - View all crime reports
  - Filter reports by status, priority, and category
  - Search through reports
  - Verify or reject reports
  - View analytics and statistics

## Security Features

### Session Management
- Admin sessions are stored in localStorage
- Sessions expire after 24 hours
- Logout button available in the admin dashboard

### API Protection
- All admin API endpoints require authentication
- Admin token is sent with each request
- Unauthorized requests return 401 status

## API Endpoints

### Protected Admin Routes
- `GET /api/admin/verify` - Fetch crime reports
- `POST /api/admin/verify` - Verify/reject reports
- `GET /api/admin/stats` - Get dashboard statistics

### Authentication Methods
The system accepts admin authentication in two ways:
1. **Query Parameter**: `?admin_token=admin`
2. **Authorization Header**: `Authorization: Bearer admin`

## Production Considerations

### Security Improvements Needed
- Replace hardcoded credentials with environment variables
- Implement proper JWT token system
- Add rate limiting for login attempts
- Use secure session management
- Add two-factor authentication

### Database Integration
- Store admin users in PostgreSQL database
- Hash passwords using bcrypt
- Implement proper user roles and permissions

## Current Implementation Details

### Frontend Authentication
- Uses `useAdminAuth` custom hook
- Manages authentication state in localStorage
- Handles session expiration
- Provides login/logout functionality

### Backend Authentication
- Simple token-based authentication
- Checks for valid admin tokens in requests
- Returns 401 for unauthorized access

## Troubleshooting

### Common Issues
1. **Can't access admin panel**: Ensure you're using correct credentials
2. **Session expired**: Re-login with admin/admin
3. **API errors**: Check if admin token is being sent correctly

### Development Mode
- The system works with mock data when database is unavailable
- Admin authentication still works in development
- All features are functional for testing purposes

## Next Steps for Production
1. Implement proper user management system
2. Add role-based access control
3. Integrate with enterprise authentication (LDAP, SSO)
4. Add audit logging for admin actions
5. Implement backup and recovery procedures
