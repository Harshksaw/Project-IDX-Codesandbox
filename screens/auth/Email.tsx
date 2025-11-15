import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { useCallback, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import AppSafeAreaView from "@/components/AppSafeAreaView";
import Header from "@/components/Header";
import AppText from "@/components/AppText";
import AppTextInput from "@/components/AppTextInput";
import GradientButton from "@/components/GradientButton";
import { supabase, useAuthFlowStore } from "@/globals";

export default function Email() {
  const navigation = useNavigation<any>();
  const [emailInput, setEmailInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const setEmail = useAuthFlowStore(state => state.setEmail);

  const handleSubmit = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOtp({ email: emailInput });
    if (error) {
      setErrorMessage('Failed to send verification email.');
      return;
    }
    setEmail(emailInput);
    navigation.navigate('VerifyEmail');
  }, [emailInput]);

  return (
    <AppSafeAreaView>
      <Header title="" leftButton="chevron-left" leftButtonHandler={() => navigation.goBack()} />
      <View style={styles.container}>
        <AppText size="large" font="black">What's your email?</AppText>
        <AppText size="small" color="secondary" style={styles.subtitle}>We'll email a code to verify your account.</AppText>
        <AppTextInput placeholder="email" setValue={setEmailInput} handleSubmit={handleSubmit} errorMessage={errorMessage} inputProps={{ keyboardType: 'email-address', returnKeyType: 'done' }} />
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.aboveKeyboard}>
        <GradientButton style={styles.button} active={emailInput.length > 3} onPress={handleSubmit}>
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
