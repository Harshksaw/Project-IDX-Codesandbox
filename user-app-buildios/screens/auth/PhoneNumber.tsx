import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import Header from "@/components/Header";
import { useNavigation } from "@react-navigation/native";
import AppText from "@/components/AppText";
import { useAuthFlowStore } from "@/globals";
import { useCallback, useRef, useState } from "react";
import GradientButton from "@/components/GradientButton";
import AppSafeAreaView from "@/components/AppSafeAreaView";
import { parsePhoneNumber } from "libphonenumber-js";
import PhoneInput from "react-native-phone-number-input";
import { theme, supabase } from "@/globals";

export default function PhoneNumber() {
  const navigation = useNavigation<any>();
  const [rawInput, setRawInput] = useState('');
  const [parsedNumber, setParsedNumber] = useState<string>('');
  const setPhoneNumber = useAuthFlowStore(state => state.setPhoneNumber);
  const [phoneNumberValid, setPhoneNumberValid] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const phoneInput = useRef<any>(null);


  const handlePhoneNumber = useCallback((formatted: string) => {
    setRawInput(formatted);
    try {
      const number = parsePhoneNumber(formatted);
      if (number && number.isValid()) {
        setParsedNumber(number.number);
        setPhoneNumberValid(true);
      } else {
        setPhoneNumberValid(false);
      }
    } catch {
      setPhoneNumberValid(false);
    }
    setErrorMessage('');
  }, []);


  // handleSubmitKeyboard displays an error message, while handleSubmitButton acts as though the press didn't even happen
  const submit = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOtp({ phone: parsedNumber });
    if (error) {
      setErrorMessage('Failed to send verification code.');
      return;
    }
    setPhoneNumber(parsedNumber);
    navigation.navigate('VerifyPhoneNumber');
  }, [parsedNumber]);

  const handleSubmitKeyboard = useCallback(() => {
    if(phoneNumberValid) {
      submit();
    }
    else {
      setErrorMessage(`The phone number isn't valid.`)
    }
  }, [phoneNumberValid, submit]);

  const handleSubmitButton = useCallback(() => {
    if(phoneNumberValid) {
      submit();
    }
  }, [phoneNumberValid, submit]);


  return <AppSafeAreaView>
    <Header title={''} leftButton={'chevron-left'} leftButtonHandler={() => navigation.goBack()} />
    <View style={styles.container}>
      <AppText size={'large'} font={'black'}>What's your number?</AppText>
      <AppText size={'small'} color={'secondary'} style={styles.subtitle}>We'll text a code to verify your phone.</AppText>
      <PhoneInput
        ref={phoneInput}
        defaultCode="US"
        layout="first"
        value={rawInput}
        onChangeFormattedText={handlePhoneNumber}
        containerStyle={styles.phoneInputContainer}
        textContainerStyle={styles.phoneInputTextContainer}
        textInputProps={{
          returnKeyType: 'done',
          keyboardType: 'phone-pad',
          onSubmitEditing: handleSubmitKeyboard
        }}
      />
      {errorMessage !== '' && (
        <AppText size={'small'} color={'textBad'}>{errorMessage}</AppText>
      )}
    </View>
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.aboveKeyboard}
    >
      <GradientButton style={styles.button} active={phoneNumberValid} onPress={handleSubmitButton}>
        <AppText font={'heavy'}>Next</AppText>
      </GradientButton>
    </KeyboardAvoidingView>
  </AppSafeAreaView>
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 26,
  },
  subtitle: {
    marginBottom: 20
  },
  button: {
    alignSelf: 'stretch',
    height: 65,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 18
  },
  phoneInputContainer: {
    borderWidth: 1,
    borderColor: theme.color.secondary,
    borderRadius: theme.radius.standard,
    backgroundColor: 'transparent'
  },
  phoneInputTextContainer: {
    backgroundColor: 'transparent',
    paddingVertical: 0
  },
  aboveKeyboard: {
    flexGrow: 1,
    justifyContent: 'flex-end'
  }
});