import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from "react-native";
import { useAuthFlowStore, useAuthStore, supabase } from "@/globals";
import { StackActions, useNavigation } from "@react-navigation/native";
import AppText from "@/components/AppText";
import AppSafeAreaView from "@/components/AppSafeAreaView";
import Header from "@/components/Header";
import AppTextInputFormatted from "@/components/AppTextInputFormatted";
import GradientButton from "@/components/GradientButton";
import { useCallback, useEffect, useMemo, useState } from "react";
import { parsePhoneNumber } from "libphonenumber-js";
import Toast from "react-native-toast-message";

export default function VerifyPhone() {
  const signIn = useAuthStore(state => state.signIn);
  const phoneNumber = useAuthFlowStore(state => state.phoneNumber);
  const email = useAuthFlowStore(state => state.email);
  const flowRole = useAuthFlowStore(state => state.flowRole);
  const userId = useAuthFlowStore(state => state.userId);
  const setUserId = useAuthFlowStore(state => state.setUserId);
  const setVerifiedOTP = useAuthFlowStore(state => state.setVerifiedOTP);
  const phoneNumberObject = useMemo(() => parsePhoneNumber(phoneNumber ?? '+19999999999'), [phoneNumber]);
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigation = useNavigation<any>();
  const [codeIsLongEnough, setCodeIsLongEnough] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Send phone number verification
  const sendCode = async () => {
    if (!phoneNumber) return;

    console.log('=== VerifyPhone Debug ===');
    console.log('Phone number from store:', phoneNumber);
    console.log('Phone number type:', typeof phoneNumber);
    
    try {
      // Wait 5 seconds before sending OTP (for resend functionality)
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: phoneNumber,
        options: {
          shouldCreateUser: true
        }
      });

      if (error) {
        setErrorMessage('Failed to send code. Please try again later.');
        Toast.show({
          type: 'error',
          text1: 'Failed to send code',
          text2: error.message
        });
      } else {
        Toast.show({
          type: 'success',
          text1: 'Code sent!',
          text2: 'Please check your phone.'
        });
      }
    } catch (error) {
      setErrorMessage('Failed to send code. Please try again later.');
    }
  };

  // Don't auto-send code on page load - it's already sent from PhoneInput
  // useEffect(() => {
  //   sendCode();
  // }, []);

  // Handle text input of code
  const handleCodeInput = useCallback((s: string) => {
    s = s.replaceAll(/[^0-9]/g, ''); // remove non-numeric
    setCodeIsLongEnough(s.length >= 6);
    setErrorMessage('');
    setCode(s);
    return s;
  }, []);

  // Verify code
  const verifyCode = async () => {
    if (isProcessing || !phoneNumber) {
      return;
    }
    
    setIsProcessing(true);

    try {
      // Verify OTP with Supabase
      const { data: supabaseData, error: supabaseError } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token: code,
        type: 'sms'
      });

      if (supabaseError) {
        // OTP verification failed - invalid code
        Toast.show({
          type: 'error',
          text1: 'Invalid code',
          text2: supabaseError.message
        });
        return;
      }

      // OTP is valid! Now check if user exists
      if (supabaseData.user) {
        // Add this right before the users table query
        console.log('=== VerifyPhone Debug ===');
        console.log('supabaseData.user:', supabaseData.user);
        console.log('phoneNumber:', phoneNumber);

        // Check current auth state
        const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
        console.log('currentUser:', currentUser);
        console.log('authError:', authError);

        // Check session
        const { data: { session } } = await supabase.auth.getSession();
        console.log('session:', session);

        // Then try the users table query
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('phoneNumber', phoneNumber)
          .maybeSingle();

        console.log('users table query result:', { userData, userError });

      if (userError || !userData) {
        // Auth user exists but no database user - go to complete profile
        // Verify session exists before navigating
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          Toast.show({ 
            type: 'error', 
            text1: 'Session not established',
            text2: 'Please try signing in again'
          });
          return;
        }

        setVerifiedOTP(code); // Store the verified OTP for later use
        navigation.navigate('CompleteProfile');
        return;
      }

        // User exists and profile is complete - sign them in
        signIn({ 
          id: userData.id, 
          email: userData.email, 
          firstName: userData.firstName, 
          lastName: userData.lastName, 
          dateOfBirth: userData.dateOfBirth, 
          phoneNumber: userData.phoneNumber, 
          stripeCustomerID: userData.stripeCustomerID
        });

        const leaveAuthStack = StackActions.pop(2);
        navigation.dispatch(leaveAuthStack);
        return;
      } else {
        // OTP is valid but no auth user exists - this is a new user
        // Verify session exists before navigating
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          Toast.show({ 
            type: 'error', 
            text1: 'Session not established',
            text2: 'Please try signing in again'
          });
          return;
        }

        // Store the verified OTP and go to complete profile
        setVerifiedOTP(code);
        navigation.navigate('CompleteProfile');
        return;
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'An unexpected error occurred.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmitKeyboard = useCallback(() => {
    if (isProcessing) {
      return;
    }

    if (codeIsLongEnough) {
      verifyCode();
    } else {
      setErrorMessage('The code is too short.');
    }
  }, [codeIsLongEnough, isProcessing]);

  const handleSubmitButton = useCallback(() => {
    if (codeIsLongEnough && !isProcessing) {
      verifyCode();
    }
  }, [codeIsLongEnough, isProcessing]);

  if (phoneNumber === null) {
    console.error('VerifyPhone was reached without setting phoneNumber to a valid value.');
    navigation.navigate('HomeLayout');
    return null;
  }

  return (
    <AppSafeAreaView>
      <Header title="" leftButton="chevron-left" leftButtonHandler={() => navigation.goBack()} />
      <View style={styles.container}>
        <AppText size="large" font="black">Enter the code</AppText>
        <AppText size="small" color="secondary" style={styles.subtitle}>
          Sent to {phoneNumberObject.formatNational()}
        </AppText>
        
        <AppTextInputFormatted
          maxLength={6}
          handleRaw={handleCodeInput}
          errorMessage={errorMessage}
          handleSubmit={handleSubmitKeyboard}
          inputProps={{ 
            keyboardType: 'number-pad',
            returnKeyType: 'done',
            blurOnSubmit: true
          }}
        />
        
        <Pressable style={styles.resend} onPress={sendCode} hitSlop={13}>
          <AppText size="small" color="secondary">
            Resend code
          </AppText>
        </Pressable>
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.aboveKeyboard}
      >
        <GradientButton 
          style={styles.button} 
          active={codeIsLongEnough && !isProcessing} 
          onPress={handleSubmitButton}
        >
          <AppText font="heavy">
            {flowRole === 'forgot' ? 'Update Phone Number' : 'Next'}
          </AppText>
        </GradientButton>
      </KeyboardAvoidingView>
    </AppSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 26,
  },
  subtitle: {
    marginBottom: 20,
  },
  resend: {
    marginTop: 20,
    alignItems: 'center',
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
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
});