import AppSafeAreaView from "@/components/AppSafeAreaView";
import Header from "@/components/Header";
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from "react-native";
import AppText from "@/components/AppText";
import GradientButton from "@/components/GradientButton";
import { StackActions, useNavigation } from "@react-navigation/native";
import { endpoints, supabase, useAuthFlowStore, useAuthStore } from "@/globals";
import { useCallback, useEffect, useRef, useState } from "react";
import AppTextInput from "@/components/AppTextInput";
import AppTextInputFormatted from "@/components/AppTextInputFormatted";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Toast from "react-native-toast-message";

export default function UserDetails(props: { variant?: 'edit' }) {
  const navigation = useNavigation<any>();
  const signIn = useAuthStore(state => state.signIn);
  const existingUserDetails = useAuthStore(state => state.userInfo);
  const phoneNumber = useAuthFlowStore(state => state.phoneNumber);
  const firstNameDefault = props.variant === 'edit' && existingUserDetails !== null ? existingUserDetails.firstName : '';
  const lastNameDefault = props.variant === 'edit' && existingUserDetails !== null ? existingUserDetails.lastName : '';
  const emailDefault = props.variant === 'edit' && existingUserDetails !== null ? existingUserDetails.email : '';
  const dateOfBirthDefault = props.variant === 'edit' && existingUserDetails !== null ? `${existingUserDetails?.dateOfBirth.substring(5, 7)}${existingUserDetails?.dateOfBirth.substring(8, 10)}${existingUserDetails?.dateOfBirth.substring(0, 4)}` : '';
  const [firstNameInput, setFirstNameInput] = useState(firstNameDefault);
  const [lastNameInput, setLastNameInput] = useState(lastNameDefault);
  const [emailInput, setEmailInput] = useState(emailDefault);
  const [dateOfBirthInput, setDateOfBirthInput] = useState(dateOfBirthDefault);
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [dateOfBirthError, setDateOfBirthError] = useState('');
  const lastNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const dateOfBirthRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);




  // IOS ONLY - scroll scrollview to the bottom when keyboard changes
  const scrollToBottom = () => {
    if(Platform.OS === 'ios' && scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }
  useEffect(() => {
    const listener = Keyboard.addListener('keyboardWillChangeFrame', scrollToBottom);
    return () => listener.remove();
  }, []);


  const goBackHandler = useCallback(() => {
    navigation.goBack();
  }, []);


  const setFirstNameValue = useCallback((s: string) => {
    setFirstNameInput(s);
    setFirstNameError('');
  }, []);
  const validateFirstName = () => {
    if(firstNameInput.length === 0) {
      setFirstNameError('Please enter your first name.');
      return false;
    }
    return true;
  };
  const handleFirstNameKeyboardSubmit = useCallback(() => {
    if(validateFirstName() && lastNameRef.current) {
      lastNameRef.current.focus();
    }
  }, [firstNameInput]);


  const setLastNameValue = useCallback((s: string) => {
    setLastNameInput(s);
    setLastNameError('');
  }, []);
  const validateLastName = () => {
    if(lastNameInput.length === 0) {
      setLastNameError('Please enter your last name.');
      return false;
    }
    return true;
  }
  const handleLastNameKeyboardSubmit = useCallback(() => {
    if(validateLastName() && emailRef.current) {
      emailRef.current.focus();
    }
  }, [lastNameInput]);


  const setEmailValue = useCallback((s: string) => {
    setEmailInput(s);
    setEmailError('');
  }, []);
  const validateEmail = () => {
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)) {
      setEmailError('Email is invalid.');
      return false;
    }
    return true;
  }
  const handleEmailKeyboardSubmit = useCallback(() => {
    if(validateEmail() && dateOfBirthRef.current) {
      dateOfBirthRef.current.focus();
    }
  }, [emailInput]);


  const handleDateOfBirthRaw = useCallback((s: string) => {
    const raw = s.replaceAll(/[^0-9]/g, '');
    let dob;
    if(raw.length <= 2) {
      dob = raw;
    }
    else if(raw.length <= 4) {
      dob = `${raw.substring(0, 2)}/${raw.substring(2, 4)}`
    }
    else {
      dob = `${raw.substring(0, 2)}/${raw.substring(2, 4)}/${raw.substring(4)}`
    }
    setDateOfBirthInput(dob);
    setDateOfBirthError('');
    return dob;
  }, []);
  const validateDateOfBirth = () => {
    if (dateOfBirthInput.length === 10) {
      const m = +dateOfBirthInput.substring(0, 2);
      const y = +dateOfBirthInput.substring(6);
      if (m >= 1 && m <= 12 && y >= 1907 && y <= new Date().getFullYear() + 1) { // strict sanity checks for month and year. 1907 comes from the current oldest person alive's birthday.
        const d = +dateOfBirthInput.substring(3, 5);
        if (new Date(y, m).getTime() <= new Date(y, m, d).getTime() && new Date(y, m, d).getTime() <= new Date(y, m + 1).getTime()) { // check day of month is valid
          if (new Date(y, m, d).getTime() <= new Date(y, m, d).getTime()) { // check that it isn't a future date
            return true;
          }
        }
      }
    }
    // failed checks
    setDateOfBirthError(`That doesn't seem right. Please enter your date of birth in the format MM/DD/YYYY.`);
    return false;
  }


  const handleSubmit = useCallback(async () => {
    // separating out checks is necessary so all are validated at once - otherwise the and operator would escape the calls.
    const firstNameValid = validateFirstName();
    const lastNameValid = validateLastName();
    const emailValid = validateLastName();
    const dateOfBirthValid = validateDateOfBirth();

    // submit updates to user data
    if(firstNameValid && lastNameValid && emailValid && dateOfBirthValid) {
      const m = dateOfBirthInput.substring(0, 2);
      const d = dateOfBirthInput.substring(3, 5);
      const y = dateOfBirthInput.substring(6);
      const dobFormatted = `${y}-${m}-${d}`;

      // get authorization header
      const { data: { session }, error: refreshSessionError } = await supabase.auth.refreshSession();
      if(refreshSessionError) {
        console.error(refreshSessionError);
        Toast.show({
          type: 'error',
          text1: 'Failed to update user data.'
        });
        return;
      }


      const res = await fetch(endpoints.auth.populateUser, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session!.access_token}`
        },
        body: JSON.stringify({
          firstName: firstNameInput,
          lastName: lastNameInput,
          email: emailInput,
          dateOfBirth: dobFormatted
        })
      });

      if(res.status !== 200) {
        console.error('Populating user failed');
        console.error(await res.text());
        Toast.show({
          type: 'error',
          text1: 'Failed to populate user details.'
        });
        return;
      }


      // refetch user data to get stream chat token
      const { data, error } = await supabase
        .from('users')
        .select('id, firstName, lastName, phoneNumber, email, dateOfBirth, streamChatToken')
        .single();
      if(error) {
        console.error(error);
        Toast.show({
          type: 'error',
          text1: 'Failed to fetch user data.'
        });
        return;
      }

      if(data !== null && data.email !== null && data.firstName !== null && data.lastName !== null && data.dateOfBirth !== null) {
        signIn({ id: data.id, email: data.email, firstName: data.firstName, lastName: data.lastName, dateOfBirth: data.dateOfBirth, phoneNumber: data.phoneNumber, streamChatToken: data.streamChatToken });
        const leaveAuthStack = StackActions.pop(2);
        navigation.dispatch(leaveAuthStack);
        return;
      }


      const leaveAuthStack = StackActions.pop(props.variant === 'edit' ? 1 : 3);
      navigation.dispatch(leaveAuthStack);
    }
  }, [firstNameInput, lastNameInput, emailInput, dateOfBirthInput]);
  const handleSubmitFromButton = useCallback(() => {
    if(firstNameInput !== '' && lastNameInput !== '' && emailInput !== '' && dateOfBirthInput.length === 10) {
      handleSubmit();
    }
  }, [firstNameInput, lastNameInput, emailInput, dateOfBirthInput]);


  // need different keyboard avoidiance schemes for ios, android
  if(Platform.OS === 'ios') {
    return <AppSafeAreaView>
      <ScrollView
        ref={scrollViewRef}
        style={styles.aboveKeyboardScrollView}
        contentContainerStyle={styles.aboveKeyboardContainer}
        keyboardShouldPersistTaps={'handled'}
      >
        <Header title={props.variant === 'edit' ? 'Profile' : ''} leftButton={'chevron-left'} leftButtonHandler={goBackHandler} />
        <View style={styles.container}>
          <AppText size={'large'} font={'black'}>{props.variant === 'edit' ? 'Update' : 'Enter'} your name and details.</AppText>
          <AppTextInput default={firstNameDefault} setValue={setFirstNameValue} placeholder={'First name'} handleSubmit={handleFirstNameKeyboardSubmit} errorMessage={firstNameError} inputProps={{ autoComplete: 'name-given', textContentType: 'givenName' }} />
          <AppTextInput default={lastNameDefault} setValue={setLastNameValue} placeholder={'Last name'} ref={lastNameRef} handleSubmit={handleLastNameKeyboardSubmit} errorMessage={lastNameError} inputProps={{ autoComplete: 'name-family', textContentType: 'familyName' }} />
          <AppTextInput default={emailDefault} setValue={setEmailValue} placeholder={'Email address'} ref={emailRef} handleSubmit={handleEmailKeyboardSubmit} errorMessage={emailError} inputProps={{ keyboardType: 'email-address', autoComplete: 'email', autoCapitalize: 'none' }} />
          <AppTextInputFormatted default={dateOfBirthDefault} maxLength={10} handleRaw={handleDateOfBirthRaw} handleSubmit={handleSubmit} placeholder={'Date of birth'} ref={dateOfBirthRef} inputProps={{ keyboardType: 'number-pad' }} contextMessage={'Enter in MM/DD/YYYY'} errorMessage={dateOfBirthError} />
        </View>
      </ScrollView>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.aboveKeyboard}
      >
        <GradientButton style={styles.button} active={firstNameInput !== '' && lastNameInput !== '' && emailInput !== '' && dateOfBirthInput.length === 10} onPress={handleSubmitFromButton}>
          <AppText font={'heavy'}>{props.variant === 'edit' ? 'Update' : 'Finish'}</AppText>
        </GradientButton>
      </KeyboardAvoidingView>
    </AppSafeAreaView>
  }
  else {
    return <AppSafeAreaView>
      <KeyboardAwareScrollView
        extraHeight={250}
        enableOnAndroid={true}
        contentContainerStyle={styles.aboveKeyboard}
        keyboardShouldPersistTaps={'handled'}
      >
        <Header title={props.variant === 'edit' ? 'Profile' : ''} leftButton={'chevron-left'} leftButtonHandler={goBackHandler} />
        <View style={styles.container}>
          <AppText size={'large'} font={'black'}>{props.variant === 'edit' ? 'Update' : 'Enter'} your name and details.</AppText>
          <AppTextInput default={firstNameDefault} setValue={setFirstNameValue} placeholder={'First name'} handleSubmit={handleFirstNameKeyboardSubmit} errorMessage={firstNameError} inputProps={{ autoComplete: 'name-given', textContentType: 'givenName' }} />
          <AppTextInput default={lastNameDefault} setValue={setLastNameValue} placeholder={'Last name'} ref={lastNameRef} handleSubmit={handleLastNameKeyboardSubmit} errorMessage={lastNameError} inputProps={{ autoComplete: 'name-family', textContentType: 'familyName' }} />
          <AppTextInput default={emailDefault} setValue={setEmailValue} placeholder={'Email address'} ref={emailRef} handleSubmit={handleEmailKeyboardSubmit} errorMessage={emailError} inputProps={{ keyboardType: 'email-address', autoComplete: 'email', autoCapitalize: 'none' }} />
          <AppTextInputFormatted default={dateOfBirthDefault} maxLength={10} handleRaw={handleDateOfBirthRaw} handleSubmit={handleSubmit} placeholder={'Date of birth'} ref={dateOfBirthRef} inputProps={{ keyboardType: 'number-pad' }} contextMessage={'Enter in MM/DD/YYYY'} errorMessage={dateOfBirthError} />
        </View>
        <GradientButton style={styles.button} active={firstNameInput !== '' && lastNameInput !== '' && emailInput !== '' && dateOfBirthInput.length === 10} onPress={handleSubmitFromButton}>
          <AppText font={'heavy'}>{props.variant === 'edit' ? 'Update' : 'Finish'}</AppText>
        </GradientButton>
      </KeyboardAwareScrollView>
    </AppSafeAreaView>
  }

}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 26,
    flexGrow: 1,
    gap: 20
  },
  button: {
    alignSelf: 'stretch',
    height: 65,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 18
  },
  aboveKeyboard: {
    flexGrow: 1
  },
  aboveKeyboardContainer: {
    flexGrow: 1,
    justifyContent: 'flex-end'
  },
  aboveKeyboardScrollView: {
    flexShrink: 1,
    flexGrow: 1
  }
});