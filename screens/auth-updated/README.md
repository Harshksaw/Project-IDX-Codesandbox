# Updated Authentication System

This folder contains the updated authentication screens for the BottleUp user app. The new system implements a cleaner, more reliable authentication flow.

## 🎯 New Authentication Flow

### **Phone-First Authentication:**
1. **Phone Input** (`PhoneInput.tsx`) - User enters phone number
2. **OTP Verification** (`VerifyPhone.tsx`) - User verifies phone with SMS code
3. **Profile Creation** (`CompleteProfile.tsx`) - User completes profile information
4. **User Creation** - Stripe customer + Supabase user + database record created
5. **Sign In** - User is signed in and redirected to main app

### **Recovery Flow (Forgot Number):**
1. **Email Input** (`ForgotNumber.tsx`) - User enters email for recovery
2. **Email Verification** (`VerifyEmail.tsx`) - User verifies email with OTP
3. **Phone Update** (`UpdatePhone.tsx`) - User enters new phone number
4. **Phone Verification** (`VerifyPhone.tsx`) - User verifies new phone
5. **Sign In** - User is signed in with updated phone

## 🔧 Key Changes

### **Delayed User Creation:**
- **Before**: User created immediately after OTP verification
- **Now**: User created only after profile completion
- **Benefits**: No incomplete users, cleaner database, better UX

### **Worker Architecture:**
- **`create-session`**: Only verifies OTP and checks user existence
- **`create-user`**: Creates Stripe customer + Supabase user + database record
- **`populate-user`**: Updates existing incomplete user profiles

## 📱 Screen Details

### **PhoneInput.tsx**
- Phone number input with validation
- "Forgot number?" link for recovery flow
- Uses `libphonenumber-js` for formatting

### **VerifyPhone.tsx**
- 5-digit OTP input
- Handles new users vs existing users
- Navigates to `CompleteProfile` for new users
- Signs in existing complete users

### **CompleteProfile.tsx**
- Profile information collection (firstName, lastName, email, dateOfBirth)
- **New users**: Calls `create-user` worker to create everything
- **Existing users**: Calls `populate-user` worker to complete profile
- Automatic date formatting with slashes (MM/DD/YYYY)

### **ForgotNumber.tsx**
- Email input for recovery
- Validates email format
- Navigates to email verification

### **VerifyEmail.tsx**
- Email OTP verification
- Uses Supabase email OTP
- Navigates to phone update

### **UpdatePhone.tsx**
- New phone number input
- Navigates to phone verification

## 🔄 Worker Integration

### **create-session Worker:**
```typescript
// Response for new user
{ isNewUser: true }

// Response for existing incomplete user
{ 
  isNewUser: false, 
  userId: "uuid", 
  needsProfileCompletion: true 
}

// Response for existing complete user
{ 
  isNewUser: false, 
  needsProfileCompletion: false, 
  user: { /* complete user data */ } 
}
```

### **create-user Worker:**
```typescript
// Creates new user with profile data
{
  phoneNumber: string,
  firstName: string,
  lastName: string,
  email: string,
  dateOfBirth: string
}

// Returns
{ userId: "uuid", stripeCustomerID: "cus_xxx" }
```

### **populate-user Worker:**
```typescript
// Updates existing user profile
{
  userId: string,
  firstName: string,
  lastName: string,
  email: string,
  dateOfBirth: string
}

// Returns
{ success: true }
```

## 🧪 Testing Checklist

### **New User Signup:**
- [ ] Phone number input and validation
- [ ] OTP verification (5 digits)
- [ ] Profile completion with all fields
- [ ] User creation (Stripe + Supabase + database)
- [ ] Successful sign in and navigation

### **Existing User Login:**
- [ ] Phone number input
- [ ] OTP verification
- [ ] Direct sign in (no profile completion)
- [ ] Navigation to main app

### **Incomplete User:**
- [ ] Phone number input
- [ ] OTP verification
- [ ] Profile completion (pre-filled with existing data)
- [ ] Profile update and sign in

### **Recovery Flow:**
- [ ] "Forgot number?" link
- [ ] Email input and validation
- [ ] Email OTP verification
- [ ] New phone number input
- [ ] Phone OTP verification
- [ ] Successful sign in

## 🚀 Environment Variables

### **Required for Workers:**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE`
- `STRIPE_SECRET_KEY`
- `TELNYX_API_KEY`
- `TELNYX_PHONE_NUMBER_ID`

### **Required for Frontend:**
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

## 📋 Error Handling

- **Invalid phone number**: Validation error on input
- **Invalid OTP**: Error toast with retry option
- **Network errors**: Generic error messages
- **User already exists**: Handled gracefully
- **Profile validation**: Field-specific error messages

## 🔒 Security Features

- **Phone verification**: Required for all authentication
- **Email verification**: Required for recovery flow
- **Input validation**: Client-side validation for all fields
- **Rate limiting**: Handled by workers
- **Secure storage**: Tokens stored in Expo SecureStore
