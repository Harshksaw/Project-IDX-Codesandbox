// import 'expo-dev-client';
import AppText from "@/components/AppText";
import UniversalStripeProvider from '@/components/UniversalStripeProvider';
import { supabase, theme, useAuthStore } from "@/globals";
import Root from '@/screens/Root';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { DarkTheme, NavigationContainer } from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect } from "react";
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast, { ToastConfig } from "react-native-toast-message";


// if (Platform.OS !== 'web') {
//   const { StripeProvider } = require('@stripe/stripe-react-native');
//   // Use StripeProvider only in native
// }

SplashScreen.preventAutoHideAsync();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: theme.color.bg
  }
}

export default function App() {
  const signIn = useAuthStore(state => state.signIn);
  const signOut = useAuthStore(state => state.signOut);
  const [fontsLoaded] = useFonts({
    'Avenir-Black': require('assets/fonts/Avenir-Black.ttf'),
    'Avenir-Heavy': require('assets/fonts/Avenir-Heavy.ttf'),
    'Avenir-Medium': require('assets/fonts/Avenir-Medium.ttf'),
    'DIN-Alternate-Bold': require('assets/fonts/DIN-Alternate-Bold.otf')
  });

  // toast config
  const toastConfig: ToastConfig = {
    error: ({ text1, text2 }) => (
      <View style={styles.toastContainer}>
        <MaterialCommunityIcons name={'alert-circle-outline'} color={theme.color.textBad} size={24} />
        <View style={styles.textContainer}>
          {text1 && <AppText size={'small'}>{text1}</AppText>}
          {text2 && <AppText size={'small'}>{text2}</AppText>}
        </View>
      </View>
    ),
    success: ({ text1, text2 }) => (
      <View style={styles.toastContainer}>
        <MaterialCommunityIcons name={'check-circle-outline'} color={theme.color.success} size={24} />
        <View style={styles.textContainer}>
          {text1 && <AppText size={'small'}>{text1}</AppText>}
          {text2 && <AppText size={'small'}>{text2}</AppText>}
        </View>
      </View>
    ),
  }

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);


  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider
      style={{ backgroundColor: theme.color.bg }}
      onLayout={onLayoutRootView}
    >
      <UniversalStripeProvider>
        <NavigationContainer theme={navTheme}>
          <StatusBar style="light" translucent={true} />
          <Root />
          <Toast config={toastConfig} topOffset={60} />
        </NavigationContainer>
      </UniversalStripeProvider>
    </SafeAreaProvider>
  );
}


const styles = StyleSheet.create({
  toastContainer: {
    minHeight: 60,
    alignSelf: 'stretch',
    marginHorizontal: 18,
    paddingHorizontal: 18,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: theme.color.bgComponent,
    flexDirection: 'row',
    gap: 20,
    borderRadius: theme.radius.standard,
    borderWidth: 1,
    borderColor: theme.color.bgBorder
  },
  textContainer: {
    flexGrow: 1,
    flexShrink: 1
  }
})