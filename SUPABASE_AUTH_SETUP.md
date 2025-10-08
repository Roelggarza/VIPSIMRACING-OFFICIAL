# VIP SIM RACING - Supabase Authentication Setup Guide

## Migration Complete! 🎉

Your application has been successfully migrated from localStorage to **Supabase Authentication** with full password reset functionality.

## What Was Changed

### New Features Added:
1. **Supabase Authentication Integration** - Secure, production-ready auth system
2. **Password Reset Flow** - Users can reset passwords via email
3. **Forgot Password Page** (`/forgot-password`) - Request password reset
4. **Reset Password Page** (`/reset-password`) - Set new password with token
5. **Authentication Context** - Centralized auth state management
6. **Secure Password Storage** - Handled by Supabase (bcrypt hashing)
7. **Row Level Security (RLS)** - Database-level security policies

### New Files Created:
- `src/lib/supabase.ts` - Supabase client configuration
- `src/contexts/AuthContext.tsx` - Authentication context and hooks
- `src/components/pages/LoginNew.tsx` - New login page with Supabase Auth
- `src/components/pages/RegistrationNew.tsx` - New registration with Supabase Auth
- `src/components/pages/ForgotPassword.tsx` - Password reset request page
- `src/components/pages/ResetPassword.tsx` - Password reset confirmation page
- `supabase_migration.sql` - Database schema for profiles table

### Updated Files:
- `src/App.tsx` - Added AuthProvider and new routes

---

## Database Setup Instructions

### Step 1: Run the Database Migration

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project: **bpnopwgyjmhmgafohpwu**
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the contents of `supabase_migration.sql`
6. Click **Run** or press `Ctrl/Cmd + Enter`

This will create:
- The `profiles` table with all user data fields
- Row Level Security (RLS) policies for data protection
- Automatic timestamp updates

### Step 2: Configure Email Settings (Required for Password Reset)

1. In Supabase Dashboard, go to **Authentication** → **Email Templates**
2. Customize the **Reset Password** email template:
   - Update the redirect URL to: `https://yourdomain.com/reset-password`
   - Customize the email design and messaging
3. Go to **Authentication** → **Settings**
4. Configure your email provider:
   - **Option A**: Use Supabase's built-in email (limited for free tier)
   - **Option B**: Connect a custom SMTP provider (recommended for production)

### Step 3: Test the Authentication Flow

1. **Registration**:
   - Visit `/register`
   - Fill out the form
   - Submit registration
   - User account is created in `auth.users` and profile in `profiles` table

2. **Login**:
   - Visit `/login`
   - Enter credentials
   - Successful login redirects to `/dashboard`

3. **Password Reset**:
   - Visit `/login`
   - Click "Forgot your password?"
   - Enter email address
   - Check email for reset link
   - Click link (redirects to `/reset-password`)
   - Enter new password
   - Redirect to login

---

## Security Features

### Row Level Security (RLS) Policies:

1. **Users can read own profile** - Users can only view their own data
2. **Users can update own profile** - Users can only modify their own data
3. **Users can insert own profile** - Users can create their profile on signup
4. **Admins can read all profiles** - Admin users can view all user profiles
5. **Public can read basic profile info** - Limited public access for leaderboards

### Password Security:
- Passwords are hashed using bcrypt (handled by Supabase)
- Password reset uses secure, time-limited tokens
- Email enumeration protection (same message for existing/non-existing accounts)
- Password requirements enforced:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character

---

## Authentication Hooks

### Using the Auth Context:

```typescript
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const {
    user,           // Current user object
    profile,        // User profile data
    session,        // Current session
    loading,        // Loading state
    signUp,         // Register new user
    signIn,         // Login user
    signOut,        // Logout user
    resetPassword,  // Request password reset
    updatePassword, // Update password
    updateProfile,  // Update profile data
    refreshProfile  // Refresh profile from database
  } = useAuth();

  // Use these methods in your components
}
```

---

## Migration from localStorage

### Data Migration:
Your old localStorage data (`vip_users`) is still intact but is no longer used for authentication. To migrate existing users:

1. **Option A**: Users re-register with new system
2. **Option B**: Create a migration script to import users into Supabase Auth

### Old Files (Can be kept or removed):
- `src/components/pages/Login.tsx` - Old login (replaced by LoginNew.tsx)
- `src/components/pages/Registration.tsx` - Old registration (replaced by RegistrationNew.tsx)
- `src/utils/userStorage.ts` - localStorage functions (no longer used for auth)

---

## Environment Variables

Current configuration in `.env`:
```
VITE_SUPABASE_URL=https://bpnopwgyjmhmgafohpwu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **Important**: Never commit `.env` to version control!

---

## Password Reset Flow Diagram

```
User Forgets Password
         ↓
   /forgot-password
         ↓
   Enter Email Address
         ↓
 Backend sends reset email
         ↓
User receives email with link
         ↓
  Click link → /reset-password?token=xxx
         ↓
   Enter new password
         ↓
  Password updated in Supabase
         ↓
   Redirect to /login
```

---

## Troubleshooting

### Issue: Password reset email not sending
**Solution**: Check your Supabase email settings and ensure SMTP is configured

### Issue: "Missing Supabase environment variables"
**Solution**: Ensure `.env` file exists with correct VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

### Issue: Database connection errors
**Solution**: Run the migration SQL in Supabase Dashboard SQL Editor

### Issue: Users can't access their data
**Solution**: Verify RLS policies are enabled and correctly configured

---

## Next Steps

1. ✅ Run the database migration SQL
2. ✅ Configure email templates in Supabase
3. ✅ Test registration flow
4. ✅ Test login flow
5. ✅ Test password reset flow
6. 🚀 Deploy to production

---

## Support

For questions or issues with Supabase Auth:
- Supabase Documentation: https://supabase.com/docs/guides/auth
- Supabase Discord: https://discord.supabase.com

---

**Your authentication system is now production-ready with industry-standard security practices!** 🔐
