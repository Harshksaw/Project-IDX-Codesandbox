import { StyleSheet, View, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AppSafeAreaView from "@/components/AppSafeAreaView";
import Header from "@/components/Header";
import AppText from "@/components/AppText";
import GradientButton from "@/components/GradientButton";
import { useAuthFlowStore, supabase } from "@/globals";
import { useState, useCallback } from "react";
import { parsePhoneNumber } from "libphonenumber-js";
import PhoneInput from "react-native-phone-number-input";
import { theme } from "@/globals";
import Toast from "react-native-toast-message";

export default function PhoneInputScreen() {
  const navigation = useNavigation<any>();
  const [phoneInput, setPhoneInput] = useState('');
  const [parsedPhoneNumber, setParsedPhoneNumber] = useState<string>('');
  const [phoneNumberValid, setPhoneNumberValid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const setPhoneNumber = useAuthFlowStore(state => state.setPhoneNumber);
  const setFlowRole = useAuthFlowStore(state => state.setFlowRole);

  const handlePhoneChange = useCallback((formatted: string) => {
    setPhoneInput(formatted);
    try {
      const number = parsePhoneNumber(formatted);
      if (number && number.isValid()) {
        setParsedPhoneNumber(number.number);
        setPhoneNumberValid(true);
      } else {
        setPhoneNumberValid(false);
      }
    } catch {
      setPhoneNumberValid(false);
    }
  }, []);

  const handleContinue = useCallback(async () => {
    if (isProcessing || !phoneNumberValid) return;
    
    setIsProcessing(true);

    try {
      // Set flow role to login (default for regular auth)
      setFlowRole('login');
      
      // Store phone number in auth flow store
      setPhoneNumber(parsedPhoneNumber);
      
      // Wait 5 seconds before sending OTP
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Send OTP via Supabase (create auth user immediately)
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: parsedPhoneNumber,
        options: {
          shouldCreateUser: true
        }
      });

      if (error) {
        Toast.show({
          type: 'error',
          text1: 'Failed to send code',
          text2: error.message
        });
        return;
      }

      // Navigate to verification screen
      navigation.navigate('VerifyPhone');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Something went wrong',
        text2: 'Please try again'
      });
    } finally {
      setIsProcessing(false);
    }
  }, [phoneNumberValid, parsedPhoneNumber, isProcessing, setFlowRole, setPhoneNumber, navigation]);

  const handleForgotNumber = useCallback(() => {
    navigation.navigate('ForgotNumber');
  }, []);

  return (
    <AppSafeAreaView>
      <Header title="" leftButton="chevron-left" leftButtonHandler={() => navigation.goBack()} />
      <View style={styles.container}>
        <View style={styles.content}>
          <AppText size="large" font="black" style={styles.title}>
            What's your number?
          </AppText>
          <AppText size="small" color="secondary" style={styles.subtitle}>
            We'll text a code to verify your phone.
          </AppText>
          
          <View style={styles.phoneInputContainer}>
            <PhoneInput
              defaultCode="US"
              layout="first"
              onChangeFormattedText={handlePhoneChange}
              containerStyle={styles.phoneInput}
              textContainerStyle={styles.phoneInputText}
              textInputStyle={styles.phoneInputTextInput}
              codeTextStyle={styles.phoneInputCodeText}
              textInputProps={{
                returnKeyType: 'done',
                blurOnSubmit: true
              }}
            />
          </View>

          <TouchableOpacity onPress={handleForgotNumber} style={styles.forgotNumberContainer}>
            <AppText size="small" color="secondary">
              Forgot your number?
            </AppText>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomContainer}>
                           <GradientButton 
                   style={styles.continueButton}
                   onPress={handleContinue}
                   active={phoneNumberValid && !isProcessing}
                 >
                          <AppText font="heavy" color="text">
              {isProcessing ? 'Loading...' : 'Next'}
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
  },
  phoneInputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  phoneInput: {
    width: '100%',
    height: 60,
    backgroundColor: theme.color.bgComponent,
    borderRadius: theme.radius.standard,
    borderWidth: 1,
    borderColor: theme.color.bgBorder,
  },
  phoneInputText: {
    backgroundColor: 'transparent',
    paddingLeft: 10,
  },
  phoneInputTextInput: {
    color: theme.color.text,
    fontSize: 16,
    fontFamily: theme.fontFamily.medium,
  },
  phoneInputCodeText: {
    color: theme.color.text,
    fontSize: 16,
    fontFamily: theme.fontFamily.medium,
  },
  forgotNumberContainer: {
    paddingVertical: 10,
  },
  bottomContainer: {
    paddingBottom: 20,
  },
  continueButton: {
    height: 55,
    borderRadius: theme.radius.standard,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
