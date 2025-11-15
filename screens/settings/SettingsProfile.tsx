import AppSafeAreaView from "@/components/AppSafeAreaView";
import Header from "@/components/Header";
import { useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthStore, workerAPI, supabase } from "@/globals";
import RequiredAuthAlert from "@/components/RequiredAuthAlert";
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from "react-native";
import AppText from "@/components/AppText";
import GradientButton from "@/components/GradientButton";
import AppTextInput from "@/components/AppTextInput";
import AppTextInputFormatted from "@/components/AppTextInputFormatted";
import Toast from "react-native-toast-message";
import { parsePhoneNumber } from "libphonenumber-js";
import PhoneInput from "react-native-phone-number-input";
import { theme } from "@/globals";

export default function SettingsProfile() {
  const navigation = useNavigation<any>();
  const signedIn = useAuthStore(state => state.signedIn);
  const userInfo = useAuthStore(state => state.userInfo);
  const signIn = useAuthStore(state => state.signIn);

  // Form state
  const [firstNameInput, setFirstNameInput] = useState(userInfo?.firstName || '');
  const [lastNameInput, setLastNameInput] = useState(userInfo?.lastName || '');
  const [emailInput, setEmailInput] = useState(userInfo?.email || '');
  
  // Extract just the national number (without country code) for display
  const getNationalNumber = (fullNumber: string) => {
    if (!fullNumber) return '';
    try {
      const parsed = parsePhoneNumber(fullNumber);
      return parsed ? parsed.nationalNumber : fullNumber.replace(/^\+1/, '');
    } catch {
      return fullNumber.replace(/^\+1/, '');
    }
  };
  
  const [phoneInput, setPhoneInput] = useState(getNationalNumber(userInfo?.phoneNumber || ''));
  const [parsedPhoneNumber, setParsedPhoneNumber] = useState<string>(userInfo?.phoneNumber || '');
  const [dateOfBirthInput, setDateOfBirthInput] = useState(
    userInfo?.dateOfBirth ? 
    `${userInfo.dateOfBirth.substring(5, 7)}/${userInfo.dateOfBirth.substring(8, 10)}/${userInfo.dateOfBirth.substring(0, 4)}` : 
    ''
  );

  // Error states
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [dateOfBirthError, setDateOfBirthError] = useState('');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);

  // Refs
  const lastNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<any>(null);
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

  // Validation functions
  const validateFirstName = () => {
    if (firstNameInput.length === 0) {
      setFirstNameError('Please enter your first name.');
      return false;
    }
    return true;
  };

  const validateLastName = () => {
    if (lastNameInput.length === 0) {
      setLastNameError('Please enter your last name.');
      return false;
    }
    return true;
  };

  const validateEmail = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)) {
      setEmailError('Email is invalid.');
      return false;
    }
    return true;
  };

  const validatePhone = () => {
    if (parsedPhoneNumber && !parsePhoneNumber(parsedPhoneNumber).isValid()) {
      setPhoneError('Please enter a valid phone number.');
      return false;
    }
    return true;
  };

  const validateDateOfBirth = () => {
    if (dateOfBirthInput.length === 10) {
      const m = +dateOfBirthInput.substring(0, 2);
      const y = +dateOfBirthInput.substring(6);
      if (m >= 1 && m <= 12 && y >= 1907 && y <= new Date().getFullYear() + 1) {
        const d = +dateOfBirthInput.substring(3, 5);
        if (new Date(y, m).getTime() <= new Date(y, m, d).getTime() && new Date(y, m, d).getTime() <= new Date(y, m + 1).getTime()) {
          if (new Date(y, m, d).getTime() <= new Date(y, m, d).getTime()) {
            return true;
          }
        }
      }
    }
    setDateOfBirthError(`That doesn't seem right. Please enter your date of birth in the format MM/DD/YYYY.`);
    return false;
  };

  // Input handlers
  const setFirstNameValue = useCallback((s: string) => {
    setFirstNameInput(s);
    setFirstNameError('');
  }, []);

  const setLastNameValue = useCallback((s: string) => {
    setLastNameInput(s);
    setLastNameError('');
  }, []);

  const setEmailValue = useCallback((s: string) => {
    setEmailInput(s);
    setEmailError('');
  }, []);

  const handlePhoneChange = useCallback((formatted: string) => {
    setPhoneInput(formatted);
    setPhoneError('');
    try {
      const number = parsePhoneNumber(formatted);
      if (number && number.isValid()) {
        setParsedPhoneNumber(number.number);
      } else {
        setParsedPhoneNumber('');
      }
    } catch {
      setParsedPhoneNumber('');
    }
  }, []);

  const handleDateOfBirthRaw = useCallback((s: string) => {
    const raw = s.replaceAll(/[^0-9]/g, '');
    let dob;
    if (raw.length <= 2) {
      dob = raw;
    } else if (raw.length <= 4) {
      dob = `${raw.substring(0, 2)}/${raw.substring(2, 4)}`;
    } else {
      dob = `${raw.substring(0, 2)}/${raw.substring(2, 4)}/${raw.substring(4)}`;
    }
    setDateOfBirthInput(dob);
    setDateOfBirthError('');
    return dob;
  }, []);

  // Keyboard submit handlers
  const handleFirstNameKeyboardSubmit = useCallback(() => {
    if (validateFirstName() && lastNameRef.current) {
      lastNameRef.current.focus();
    }
  }, [firstNameInput]);

  const handleLastNameKeyboardSubmit = useCallback(() => {
    if (validateLastName() && emailRef.current) {
      emailRef.current.focus();
    }
  }, [lastNameInput]);

  const handleEmailKeyboardSubmit = useCallback(() => {
    if (validateEmail() && phoneRef.current) {
      phoneRef.current.focus();
    }
  }, [emailInput]);

  const handlePhoneKeyboardSubmit = useCallback(() => {
    if (validatePhone() && dateOfBirthRef.current) {
      dateOfBirthRef.current.focus();
    }
  }, [parsedPhoneNumber]);

  const handleDateOfBirthKeyboardSubmit = useCallback(() => {
    if (validateDateOfBirth()) {
      handleSubmit();
    }
  }, [dateOfBirthInput]);

  // Main submit handler
  const handleSubmit = useCallback(async () => {
    if (isProcessing || !userInfo) return;

    // Validate all fields
    const firstNameValid = validateFirstName();
    const lastNameValid = validateLastName();
    const emailValid = validateEmail();
    const phoneValid = validatePhone();
    const dateOfBirthValid = validateDateOfBirth();

    if (!firstNameValid || !lastNameValid || !emailValid || !phoneValid || !dateOfBirthValid) {
      return;
    }

    setIsProcessing(true);

    try {
      // Format date of birth
      const m = dateOfBirthInput.substring(0, 2);
      const d = dateOfBirthInput.substring(3, 5);
      const y = dateOfBirthInput.substring(6);
      const dobFormatted = `${y}-${m}-${d}`;

      // Build update data object
      const updateData: any = {};
      
      if (firstNameInput !== userInfo.firstName) {
        updateData.firstName = firstNameInput;
      }
      if (lastNameInput !== userInfo.lastName) {
        updateData.lastName = lastNameInput;
      }
      if (emailInput !== userInfo.email) {
        updateData.email = emailInput;
      }
      if (parsedPhoneNumber !== userInfo.phoneNumber) {
        updateData.phoneNumber = parsedPhoneNumber;
      }
      if (dobFormatted !== userInfo.dateOfBirth) {
        updateData.dateOfBirth = dobFormatted;
      }

      // Check if there are any changes
      if (Object.keys(updateData).length === 0) {
        Toast.show({
          type: 'info',
          text1: 'No changes to save'
        });
        return;
      }

      // Update user using populate-user worker
      const result = await workerAPI.populateUser(updateData);

      if (result.error) {
        // Handle specific error codes
        if (result.code === 'EMAIL_EXISTS') {
          setEmailError('This email is already associated with another account.');
          return;
        }
        if (result.code === 'PHONE_EXISTS') {
          setPhoneError('This phone number is already associated with another account.');
          return;
        }
        if (result.code === 'SAME_NUMBER') {
          setPhoneError('This is already your current phone number.');
          return;
        }
        
        Toast.show({
          type: 'error',
          text1: 'Failed to update profile',
          text2: result.error
        });
        return;
      }

      // Update Supabase auth user if phone number changed
      if (updateData.phoneNumber) {
        const { error: authError } = await supabase.auth.updateUser({
          phone: updateData.phoneNumber
        });
        
        if (authError) {
          console.warn('Failed to update auth phone number:', authError);
          // Don't fail the whole update, just log the warning
        }
      }

      // Update local user state
      signIn({
        ...userInfo,
        firstName: firstNameInput,
        lastName: lastNameInput,
        email: emailInput,
        phoneNumber: parsedPhoneNumber,
        dateOfBirth: dobFormatted
      });

      Toast.show({
        type: 'success',
        text1: 'Profile updated successfully!'
      });

      navigation.goBack();

    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Something went wrong',
        text2: 'Please try again'
      });
    } finally {
      setIsProcessing(false);
    }
  }, [
    firstNameInput,
    lastNameInput,
    emailInput,
    parsedPhoneNumber,
    dateOfBirthInput,
    userInfo,
    isProcessing
  ]);

  // Ensure that user is signed in
  if (!signedIn) {
    return (
      <AppSafeAreaView>
        <Header title={'Profile'} leftButtonHandler={() => navigation.goBack()} leftButton={'chevron-left'} />
        <RequiredAuthAlert titleText={'Sign in to edit your profile details.'} icon={'badge-account-outline'} />
      </AppSafeAreaView>
    );
  }

  return (
    <AppSafeAreaView>
      <Header title="Profile" leftButton="chevron-left" leftButtonHandler={() => navigation.goBack()} />
      <ScrollView
        ref={scrollViewRef}
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <AppText size="large" font="black">Update your profile details</AppText>
        
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
          ref={lastNameRef}
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
          ref={emailRef}
          inputProps={{
            keyboardType: 'email-address',
            returnKeyType: 'next',
            autoCapitalize: 'none',
          }}
        />

        <View style={styles.phoneInputContainer}>
          <PhoneInput
            defaultCode="US"
            layout="first"
            defaultValue={phoneInput}
            onChangeFormattedText={handlePhoneChange}
            containerStyle={styles.phoneInput}
            textContainerStyle={styles.phoneInputText}
            textInputStyle={styles.phoneInputTextInput}
            codeTextStyle={styles.phoneInputCodeText}
            ref={phoneRef}
          />
          {phoneError ? (
            <AppText size="small" color="textBad" style={styles.errorText}>
              {phoneError}
            </AppText>
          ) : null}
        </View>
        
        <AppTextInputFormatted
          placeholder="Birthday MM/DD/YYYY"
          maxLength={10}
          default={dateOfBirthInput}
          handleRaw={handleDateOfBirthRaw}
          errorMessage={dateOfBirthError}
          handleSubmit={handleDateOfBirthKeyboardSubmit}
          ref={dateOfBirthRef}
          inputProps={{
            keyboardType: 'number-pad',
            returnKeyType: 'done',
          }}
        />
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
          <AppText font="heavy">
            {isProcessing ? 'Updating...' : 'Update Profile'}
          </AppText>
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
  phoneInputContainer: {
    width: '100%',
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
  errorText: {
    marginTop: 8,
    marginLeft: 4,
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