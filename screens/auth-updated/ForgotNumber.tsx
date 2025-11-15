import { StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AppSafeAreaView from "@/components/AppSafeAreaView";
import Header from "@/components/Header";
import AppText from "@/components/AppText";
import AppTextInput from "@/components/AppTextInput";
import GradientButton from "@/components/GradientButton";
import { useState, useCallback } from "react";
import { theme, useAuthFlowStore } from "@/globals";
import Toast from "react-native-toast-message";
import { supabase } from "@/globals";

export default function ForgotNumberScreen() {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [emailValid, setEmailValid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const setEmailStore = useAuthFlowStore(state => state.setEmail);
  const setFlowRole = useAuthFlowStore(state => state.setFlowRole);

  const handleEmailChange = useCallback((text: string) => {
    setEmail(text);
    setEmailStore(text);
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
    setEmailValid(isValid);
  }, [setEmailStore]);

  const handleSendRecoveryEmail = useCallback(async () => {
    if (isProcessing || !emailValid) return;
    
    setIsProcessing(true);

    try {
      // Set flow role to forgot
      setFlowRole('forgot');
      
      // Send recovery email using Supabase
      const { error } = await supabase.auth.signInWithOtp({ 
        email: email,
        options: {
          shouldCreateUser: false // Don't create new user, just send recovery
        }
      });
      
      if (error) {
        Toast.show({
          type: 'error',
          text1: 'Failed to send recovery email',
          text2: error.message
        });
        return;
      }
      
      Toast.show({
        type: 'success',
        text1: 'Recovery email sent!',
        text2: 'Please check your inbox and enter the code.'
      });
      
      // Navigate to email verification screen
      navigation.navigate('VerifyEmail');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Something went wrong',
        text2: 'Please try again'
      });
    } finally {
      setIsProcessing(false);
    }
  }, [email, emailValid, isProcessing, setFlowRole]);

  return (
    <AppSafeAreaView>
      <Header title="" leftButton="chevron-left" leftButtonHandler={() => navigation.goBack()} />
      <View style={styles.container}>
        <View style={styles.content}>
          <AppText size="large" font="black" style={styles.title}>
            Input Email for Verification
          </AppText>
          <AppText size="small" color="secondary" style={styles.subtitle}>
            We'll send a verification code to your email to help you recover your phone number.
          </AppText>
          
          <View style={styles.emailInputContainer}>
            <AppTextInput
              setValue={handleEmailChange}
              placeholder="Enter your email address"
              inputProps={{
                keyboardType: 'email-address',
                autoComplete: 'email',
                autoCapitalize: 'none',
                autoCorrect: false
              }}
            />
          </View>
        </View>

        <View style={styles.bottomContainer}>
          <GradientButton 
            style={styles.sendButton}
            onPress={handleSendRecoveryEmail}
            active={emailValid && !isProcessing}
          >
            <AppText font="heavy" color="text">
              {isProcessing ? 'Sending...' : 'Send Code'}
            </AppText>
          </GradientButton>
        </View>
      </View>
    </AppSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  emailInputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  bottomContainer: {
    paddingBottom: 20,
  },
  sendButton: {
    height: 55,
    borderRadius: theme.radius.standard,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
