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
  const signIn = useAuthStore(state => state.signIn);
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [codeIsLongEnough, setCodeIsLongEnough] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!email) {
      navigation.navigate('Email');
    }
  }, [email]);

  const handleCodeInput = useCallback((s: string) => {
    s = s.replace(/[^0-9]/g, '');
    setCodeIsLongEnough(s.length >= 5);
    setErrorMessage('');
    setCode(s);
    return s;
  }, []);

  const verifyCode = async () => {
    if (!email || isProcessing) return;
    setIsProcessing(true);
    const { data, error } = await supabase.auth.verifyOtp({ type: 'email', email: email!, token: code });
    setIsProcessing(false);
    if (error || !data?.user) {
      setErrorMessage('Failed to verify code.');
      return;
    }
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, firstName, lastName, phoneNumber, email, dateOfBirth, streamChatToken')
      .single();
    if (userError || !userData) {
      Toast.show({ type: 'error', text1: 'Failed to fetch user data.' });
      return;
    }
    signIn({ id: userData.id, email: userData.email!, firstName: userData.firstName!, lastName: userData.lastName!, dateOfBirth: userData.dateOfBirth!, phoneNumber: userData.phoneNumber!, streamChatToken: userData.streamChatToken! });
    navigation.navigate('HomeLayout');
  };

  const handleSubmitKeyboard = useCallback(() => {
    if (codeIsLongEnough && !isProcessing) {
      verifyCode();
    } else if (!codeIsLongEnough) {
      setErrorMessage('The code is too short.');
    }
  }, [codeIsLongEnough, isProcessing, verifyCode]);

  const handleSubmitButton = useCallback(() => {
    if (codeIsLongEnough && !isProcessing) {
      verifyCode();
    }
  }, [codeIsLongEnough, isProcessing]);

  return (
    <AppSafeAreaView>
      <Header title="" leftButton="chevron-left" leftButtonHandler={() => navigation.goBack()} />
      <View style={styles.container}>
        <AppText size="large" font="black">Enter the verification code.</AppText>
        <AppText size="small" color="secondary" style={styles.subtitle}>Sent to {email}.</AppText>
        <AppTextInputFormatted maxLength={6} handleRaw={handleCodeInput} errorMessage={errorMessage} handleSubmit={handleSubmitKeyboard} inputProps={{ keyboardType: 'number-pad' }} />
        <Pressable style={styles.resend} onPress={() => email && supabase.auth.signInWithOtp({ email })} hitSlop={13}>
          <AppText size="small" color="secondary">Resend code</AppText>
        </Pressable>
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.aboveKeyboard}>
        <GradientButton style={styles.button} active={codeIsLongEnough && !isProcessing} onPress={handleSubmitButton}>
          <AppText font="heavy">Verify</AppText>
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
    flexDirection: 'row',
    alignItems: 'flex-end',
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
