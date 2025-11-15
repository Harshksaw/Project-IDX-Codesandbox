import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from "react-native";
import { useCallback, useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import AppSafeAreaView from "@/components/AppSafeAreaView";
import Header from "@/components/Header";
import AppText from "@/components/AppText";
import GradientButton from "@/components/GradientButton";
import AppTextInputFormatted from "@/components/AppTextInputFormatted";
import { supabase, useAuthFlowStore, useAuthStore } from "@/globals";
import Toast from "react-native-toast-message";

export default function VerifyEmail() {
  const navigation = useNavigation<any>();
  const email = useAuthFlowStore(state => state.email);
  const setUserId = useAuthFlowStore(state => state.setUserId);
  const signIn = useAuthStore(state => state.signIn);
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [codeIsLongEnough, setCodeIsLongEnough] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!email) {
      navigation.navigate('PhoneInput');
    }
  }, [email]);

  const handleCodeInput = useCallback((s: string) => {
    s = s.replace(/[^0-9]/g, '');
    setCodeIsLongEnough(s.length >= 6);
    setErrorMessage('');
    setCode(s);
    return s;
  }, []);

  const verifyCode = async () => {
    if (!email || isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      const { data, error } = await supabase.auth.verifyOtp({ 
        type: 'email', 
        email: email, 
        token: code 
      });
      
      if (error || !data?.user) {
        setErrorMessage('Failed to verify code.');
        return;
      }
      
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, firstName, lastName, phoneNumber, email, dateOfBirth')
        .eq('id', data.user.id)
        .single();
        
      if (userError || !userData) {
        Toast.show({ type: 'error', text1: 'Failed to fetch user data.' });
        return;
      }
      
      // Set the userId in the auth flow store for the forgot number flow
      setUserId(data.user.id);
      
      // For forgot number flow, navigate to UpdatePhone to set new phone number
      navigation.navigate('UpdatePhone');
    } catch (error) {
      setErrorMessage('An unexpected error occurred.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmitKeyboard = useCallback(() => {
    if (codeIsLongEnough && !isProcessing) {
      verifyCode();
    } else if (!codeIsLongEnough) {
      setErrorMessage('The code is too short.');
    }
  }, [codeIsLongEnough, isProcessing]);

  const handleSubmitButton = useCallback(() => {
    if (codeIsLongEnough && !isProcessing) {
      verifyCode();
    }
  }, [codeIsLongEnough, isProcessing]);

  const resendCode = async () => {
    if (!email) return;
    
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) {
        Toast.show({ type: 'error', text1: 'Failed to resend code.' });
      } else {
        Toast.show({ type: 'success', text1: 'Code resent successfully.' });
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to resend code.' });
    }
  };

  return (
    <AppSafeAreaView>
      <Header title="" leftButton="chevron-left" leftButtonHandler={() => navigation.goBack()} />
      <View style={styles.container}>
        <AppText size="large" font="black">Enter the code</AppText>
        <AppText size="small" color="secondary" style={styles.subtitle}>
          Sent to {email}
        </AppText>
        
        <AppTextInputFormatted 
          maxLength={6} 
          handleRaw={handleCodeInput} 
          errorMessage={errorMessage} 
          handleSubmit={handleSubmitKeyboard} 
          inputProps={{ keyboardType: 'number-pad' }} 
        />
        
        <Pressable style={styles.resend} onPress={resendCode} hitSlop={13}>
          <AppText size="small" color="secondary">Resend code</AppText>
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
          <AppText font="heavy">Next</AppText>
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
