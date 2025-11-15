import AppSafeAreaView from "@/components/AppSafeAreaView";
import Header from "@/components/Header";
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from "react-native";
import AppText from "@/components/AppText";
import GradientButton from "@/components/GradientButton";
import { StackActions, useNavigation } from "@react-navigation/native";
import { useAuthFlowStore, useAuthStore, workerAPI, supabase } from "@/globals";
import { useCallback, useEffect, useRef, useState } from "react";
import AppTextInput from "@/components/AppTextInput";
import AppTextInputFormatted from "@/components/AppTextInputFormatted";
import Toast from "react-native-toast-message";

export default function CompleteProfile() {
  const navigation = useNavigation<any>();
  const signIn = useAuthStore(state => state.signIn);
  const phoneNumber = useAuthFlowStore(state => state.phoneNumber);
  const email = useAuthFlowStore(state => state.email);
  const verifiedOTP = useAuthFlowStore(state => state.verifiedOTP);
  
  const [firstNameInput, setFirstNameInput] = useState('');
  const [lastNameInput, setLastNameInput] = useState('');
  const [emailInput, setEmailInput] = useState(email || '');
  const [dateOfBirthInput, setDateOfBirthInput] = useState('');
  
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [dateOfBirthError, setDateOfBirthError] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);
  
  const lastNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const dateOfBirthRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // IOS ONLY - scroll scrollview to the bottom when keyboard changes
  const scrollToBottom = () => {
    if (Platform.OS === 'ios' && scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  };
  
  useEffect(() => {
    const listener = Keyboard.addListener('keyboardWillChangeFrame', scrollToBottom);
    return () => listener.remove();
  }, []);

  const setFirstNameValue = useCallback((s: string) => {
    setFirstNameInput(s);
    setFirstNameError('');
  }, []);
  
  const validateFirstName = () => {
    if (firstNameInput.length === 0) {
      setFirstNameError('Please enter your first name.');
      return false;
    }
    return true;
  };
  
  const handleFirstNameKeyboardSubmit = useCallback(() => {
    if (validateFirstName() && lastNameRef.current) {
      lastNameRef.current.focus();
    }
  }, [firstNameInput]);

  const setLastNameValue = useCallback((s: string) => {
    setLastNameInput(s);
    setLastNameError('');
  }, []);
  
  const validateLastName = () => {
    if (lastNameInput.length === 0) {
      setLastNameError('Please enter your last name.');
      return false;
    }
    return true;
  };
  
  const handleLastNameKeyboardSubmit = useCallback(() => {
    if (validateLastName() && emailRef.current) {
      emailRef.current.focus();
    }
  }, [lastNameInput]);

  const setEmailValue = useCallback((s: string) => {
    setEmailInput(s);
    setEmailError('');
  }, []);
  
  const validateEmail = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)) {
      setEmailError('Email is invalid.');
      return false;
    }
    return true;
  };
  
  const handleEmailKeyboardSubmit = useCallback(() => {
    if (validateEmail() && dateOfBirthRef.current) {
      dateOfBirthRef.current.focus();
    }
  }, [emailInput]);

  const setDateOfBirthValue = useCallback((s: string) => {
    setDateOfBirthInput(s);
    setDateOfBirthError('');
  }, []);
  
  const validateDateOfBirth = () => {
    // Remove slashes for validation
    const cleanDate = dateOfBirthInput.replace(/\//g, '');
    
    if (cleanDate.length !== 8) {
      setDateOfBirthError('Please enter a valid date (MM/DD/YYYY).');
      return false;
    }
    
    const month = parseInt(cleanDate.substring(0, 2));
    const day = parseInt(cleanDate.substring(2, 4));
    const year = parseInt(cleanDate.substring(4, 8));
    
    if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900 || year > new Date().getFullYear()) {
      setDateOfBirthError('Please enter a valid date.');
      return false;
    }
    
    return true;
  };
  
  const handleDateOfBirthKeyboardSubmit = useCallback(() => {
    if (validateDateOfBirth()) {
      handleSubmit();
    }
  }, [dateOfBirthInput]);

  const handleSubmit = useCallback(async () => {
    if (isProcessing) return;
    
    if (!validateFirstName() || !validateLastName() || !validateEmail() || !validateDateOfBirth()) {
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Format date of birth - remove slashes and convert to YYYY-MM-DD
      const cleanDate = dateOfBirthInput.replace(/\//g, '');
      const month = cleanDate.substring(0, 2);
      const day = cleanDate.substring(2, 4);
      const year = cleanDate.substring(4, 8);
      const formattedDateOfBirth = `${year}-${month}-${day}`;
      
      // Get user ID from auth flow store (if completing existing profile)
      const userId = useAuthFlowStore.getState().userId;
      
      if (userId) {
        // Existing user with incomplete profile - populate the profile
        const result = await workerAPI.populateUser({
          firstName: firstNameInput,
          lastName: lastNameInput,
          email: emailInput,
          dateOfBirth: formattedDateOfBirth
        });

        if (result.error) {
          Toast.show({ type: 'error', text1: 'Failed to complete profile.' });
          return;
        }

        // Fetch the complete user data including stripeCustomerID
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('stripeCustomerID')
          .eq('id', userId)
          .single();

        if (userError || !userData) {
          Toast.show({ type: 'error', text1: 'Failed to fetch user data.' });
          return;
        }

        // Sign in the user with the updated data
        signIn({
          id: userId,
          firstName: firstNameInput,
          lastName: lastNameInput,
          phoneNumber: phoneNumber || '',
          email: emailInput,
          dateOfBirth: formattedDateOfBirth,
          stripeCustomerID: userData.stripeCustomerID
        });
      } else {
        // New user - create everything from scratch
        // Verify session exists
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          Toast.show({ type: 'error', text1: 'Session expired. Please try again.' });
          return;
        }

        // Get the current auth user ID
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user?.id) {
          Toast.show({ type: 'error', text1: 'User not found. Please try again.' });
          return;
        }
        
        const result = await workerAPI.createUser({
          authUserId: user.id,
          phoneNumber: phoneNumber || '',
          firstName: firstNameInput,
          lastName: lastNameInput,
          email: emailInput,
          dateOfBirth: formattedDateOfBirth
        });

        if (result.error) {
          Toast.show({ type: 'error', text1: 'Failed to create account.' });
          return;
        }

        // Note: Supabase session is already created automatically when verifyOtp() succeeds in VerifyPhone.tsx
        // No need to manually create session here

        // Sign in the user with the new data
        signIn({
          id: result.userId,
          firstName: firstNameInput,
          lastName: lastNameInput,
          phoneNumber: phoneNumber || '',
          email: emailInput,
          dateOfBirth: formattedDateOfBirth,
          stripeCustomerID: result.stripeCustomerID
        });
      }
      
      const leaveAuthStack = StackActions.pop(3);
      navigation.dispatch(leaveAuthStack);
      
    } catch (error) {
      Toast.show({ type: 'error', text1: 'An unexpected error occurred.' });
    } finally {
      setIsProcessing(false);
    }
  }, [
    firstNameInput, 
    lastNameInput, 
    emailInput, 
    dateOfBirthInput, 
    phoneNumber, 
    isProcessing
  ]);

  return (
    <AppSafeAreaView>
      <Header title="" leftButton="chevron-left" leftButtonHandler={() => navigation.goBack()} />
      <ScrollView 
        ref={scrollViewRef}
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <AppText size="large" font="black">Finish your account</AppText>
        
        <AppTextInput
          placeholder="First Name"
          default={firstNameInput}
          setValue={setFirstNameValue}
          errorMessage={firstNameError}
          handleSubmit={handleFirstNameKeyboardSubmit}
          inputProps={{
            returnKeyType: 'next',
          }}
        />
        
        <AppTextInput
          placeholder="Last Name"
          default={lastNameInput}
          setValue={setLastNameValue}
          errorMessage={lastNameError}
          handleSubmit={handleLastNameKeyboardSubmit}
          inputProps={{
            returnKeyType: 'next',
          }}
        />
        
        <AppTextInput
          placeholder="Email Address"
          default={emailInput}
          setValue={setEmailValue}
          errorMessage={emailError}
          handleSubmit={handleEmailKeyboardSubmit}
          inputProps={{
            keyboardType: 'email-address',
            returnKeyType: 'next',
            autoCapitalize: 'none',
          }}
        />
        
        <AppTextInputFormatted
          placeholder="Birthday MM/DD/YYYY"
          maxLength={10}
          default={dateOfBirthInput}
          handleRaw={(s) => {
            // Remove all non-digits
            let clean = s.replace(/[^0-9]/g, '');
            
            // Limit to 8 digits
            if (clean.length > 8) clean = clean.substring(0, 8);
            
            // Format with slashes
            let formatted = '';
            if (clean.length >= 1) formatted += clean.substring(0, 2);
            if (clean.length >= 3) formatted += '/' + clean.substring(2, 4);
            if (clean.length >= 5) formatted += '/' + clean.substring(4, 8);
            
            setDateOfBirthValue(formatted);
            return formatted;
          }}
          errorMessage={dateOfBirthError}
          handleSubmit={handleDateOfBirthKeyboardSubmit}
          inputProps={{
            keyboardType: 'number-pad',
            returnKeyType: 'done',
          }}
        />
        
        <AppText size="small" color="secondary" style={styles.legalText}>
          By signing up, you agree to the{' '}
          <AppText size="small" color="primary">Terms of Service</AppText>
          {' '}and{' '}
          <AppText size="small" color="primary">Privacy Policy</AppText>
        </AppText>
      </ScrollView>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.aboveKeyboard}
      >
        <GradientButton 
          style={styles.button} 
          active={!isProcessing} 
          onPress={handleSubmit}
        >
          <AppText font="heavy">Sign Up</AppText>
        </GradientButton>
      </KeyboardAvoidingView>
    </AppSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 26,
    gap: 20,
  },
  legalText: {
    marginTop: 20,
    textAlign: 'center',
  },
  button: {
    alignSelf: 'stretch',
    height: 65,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 18,
  },
  aboveKeyboard: {
    flexGrow: 0,
  },
});
