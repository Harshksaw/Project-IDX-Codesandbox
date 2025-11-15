import { StyleSheet, View } from "react-native";
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

export default function UpdatePhoneScreen() {
  const navigation = useNavigation<any>();
  const [phoneInput, setPhoneInput] = useState('');
  const [parsedPhoneNumber, setParsedPhoneNumber] = useState<string>('');
  const [phoneNumberValid, setPhoneNumberValid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const setPhoneNumber = useAuthFlowStore(state => state.setPhoneNumber);
  const setFlowRole = useAuthFlowStore(state => state.setFlowRole);
  const userId = useAuthFlowStore(state => state.userId);

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

  const handleUpdatePhone = useCallback(async () => {
    if (isProcessing || !phoneNumberValid || !userId) return;
    
    setIsProcessing(true);

    try {
      // 1. Get the user by userId to check their current phone number
      const { data: currentUser, error: userError } = await supabase
        .from('users')
        .select('id, phoneNumber')
        .eq('id', userId)
        .single();

      if (userError || !currentUser) {
        Toast.show({
          type: 'error',
          text1: 'User not found',
          text2: 'Please try the forgot number process again.'
        });
        return;
      }

      // 2. Check if it's the same number
      if (currentUser.phoneNumber === parsedPhoneNumber) {
        Toast.show({
          type: 'info',
          text1: 'That\'s your current number',
          text2: 'Please use the login page instead.'
        });
        return;
      }

      // 3. Check if phone number exists with another user
      const { data: existingUser, error: existingError } = await supabase
        .from('users')
        .select('id')
        .eq('phoneNumber', parsedPhoneNumber)
        .neq('id', currentUser.id)
        .maybeSingle();

      if (existingUser) {
        Toast.show({
          type: 'error',
          text1: 'Phone number already exists',
          text2: 'This number is already associated with another account. Please enter a different number.'
        });
        return;
      }

      // 4. If we get here, the phone number is valid
      setFlowRole('forgot');
      setPhoneNumber(parsedPhoneNumber);
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
  }, [phoneNumberValid, parsedPhoneNumber, isProcessing, setFlowRole, userId]);

  return (
    <AppSafeAreaView>
      <Header title="" leftButton="chevron-left" leftButtonHandler={() => navigation.goBack()} />
      <View style={styles.container}>
        <View style={styles.content}>
          <AppText size="large" font="black" style={styles.title}>
            What's your new number?
          </AppText>
          <AppText size="small" color="secondary" style={styles.subtitle}>
            We'll text a code to verify your new phone number.
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
            />
          </View>
        </View>

        <View style={styles.bottomContainer}>
                           <GradientButton 
                   style={styles.updateButton}
                   onPress={handleUpdatePhone}
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
  bottomContainer: {
    paddingBottom: 20,
  },
  updateButton: {
    height: 55,
    borderRadius: theme.radius.standard,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
