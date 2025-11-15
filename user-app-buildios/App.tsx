// import 'expo-dev-client';
import AppText from "@/components/AppText";
import SentryErrorBoundary from "@/components/SentryErrorBoundary";
import UniversalStripeProvider from '@/components/UniversalStripeProvider';
import { supabase, theme, useAuthStore } from "@/globals";
import Root from '@/screens/Root';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { DarkTheme, NavigationContainer } from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View, Alert, Text } from 'react-native';
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast, { ToastConfig } from "react-native-toast-message";
import * as Sentry from '@sentry/react-native';
import { Platform } from 'react-native';

// Sentry initialization with comprehensive error handling
try {
  console.log('🔧 Initializing Sentry...');

  // Configure integrations based on environment and platform
  const integrations: any[] = [];

  // Only add replay in development or on specific error conditions
  // Replay can cause performance issues and black screens in production
  if (__DEV__) {
    console.log('📹 Adding Sentry Replay integration (dev mode)');
    try {
      integrations.push(
        Sentry.mobileReplayIntegration({
          maskAllText: true,
          maskAllImages: true,
        })
      );
    } catch (replayError) {
      console.warn('⚠️ Failed to initialize Replay integration:', replayError);
    }
  }

  // Feedback integration can cause issues on iOS - add with caution
  // Commenting out for now to prevent black screen
  // if (Platform.OS === 'android') {
  //   integrations.push(Sentry.feedbackIntegration());
  // }

  Sentry.init({
    dsn: 'https://528c41fd9946e97748a86370097135d6@o4510352872308736.ingest.us.sentry.io/4510365654908928',

    // Environment configuration
    debug: __DEV__, // Enable debug logging in development
    environment: __DEV__ ? 'development' : 'production',

    // Performance Monitoring
    tracesSampleRate: __DEV__ ? 1.0 : 0.2, // 100% in dev, 20% in prod
    enableAutoSessionTracking: true,
    sessionTrackingIntervalMillis: 30000, // 30 seconds

    // Error sampling
    sampleRate: 1.0, // Send 100% of errors

    // Adds more context data to events
    sendDefaultPii: true,
    attachStacktrace: true,
    attachScreenshot: true, // Attach screenshots on errors

    // Native crash handling
    enableNativeCrashHandling: true,
    enableNativeNagger: __DEV__, // Warn about native debug symbols in dev

    // Auto instrumentation
    enableAutoPerformanceTracing: true,
    enableAppHangTracking: true,
    appHangTimeoutInterval: 5000, // 5 seconds

    // Network breadcrumbs
    enableCaptureFailedRequests: true,

    // Integrations
    integrations,

    // Session Replay configuration (more conservative)
    replaysSessionSampleRate: __DEV__ ? 0.5 : 0.0, // 50% in dev, disabled in prod
    replaysOnErrorSampleRate: __DEV__ ? 1.0 : 0.2, // 100% in dev, 20% in prod

    // Before send hook for filtering/modifying events
    beforeSend(event, hint) {
      console.log('📤 Sentry capturing event:', event.level, event.message);

      // Filter out low-priority errors if needed
      // if (event.level === 'warning' && !__DEV__) {
      //   return null;
      // }

      return event;
    },

    // Before breadcrumb hook for filtering
    beforeBreadcrumb(breadcrumb, hint) {
      // Log breadcrumbs in development
      if (__DEV__) {
        console.log('🍞 Breadcrumb:', breadcrumb.category, breadcrumb.message);
      }
      return breadcrumb;
    },
  });

  // Set additional context
  Sentry.setTag('platform', Platform.OS);
  Sentry.setTag('platform_version', Platform.Version.toString());
  Sentry.setContext('device', {
    os: Platform.OS,
    version: Platform.Version,
  });

  console.log('✅ Sentry initialized successfully');
} catch (error) {
  console.error('❌ CRITICAL: Failed to initialize Sentry:', error);
  // App should continue even if Sentry fails
}

console.log('🔥 App.tsx loaded - JS bundle executing');


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

export default Sentry.wrap(function App() {
  console.log('✅ App component rendering');

  const signIn = useAuthStore(state => state.signIn);
  const signOut = useAuthStore(state => state.signOut);
  const [appReady, setAppReady] = useState(false);
  const [fontError, setFontError] = useState<string | null>(null);

  const [fontsLoaded, fontLoadError] = useFonts({
    'Avenir-Black': require('assets/fonts/Avenir-Black.ttf'),
    'Avenir-Heavy': require('assets/fonts/Avenir-Heavy.ttf'),
    'Avenir-Medium': require('assets/fonts/Avenir-Medium.ttf'),
    'DIN-Alternate-Bold': require('assets/fonts/DIN-Alternate-Bold.otf')
  });

  useEffect(() => {
    console.log('📱 Font loading status:', { fontsLoaded, fontLoadError });

    if (fontLoadError) {
      console.error('❌ Font loading error:', fontLoadError);
      setFontError(fontLoadError.message);
      // Show alert in production to debug
      Alert.alert('Font Load Error', `Fonts failed to load: ${fontLoadError.message}. App will continue with system fonts.`);
      // Allow app to continue even if fonts fail
      setAppReady(true);
    } else if (fontsLoaded) {
      console.log('✅ Fonts loaded successfully');
      setAppReady(true);
    }
  }, [fontsLoaded, fontLoadError]);

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
    if (appReady) {
      console.log('🎉 Hiding splash screen');
      await SplashScreen.hideAsync();
    }
  }, [appReady]);

  // Show debug screen if not ready after 10 seconds (timeout safety)
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!appReady) {
        console.error('⏰ TIMEOUT: App not ready after 10 seconds');
        Alert.alert(
          'BottleUp Debug',
          `App stuck loading. Fonts loaded: ${fontsLoaded}, Error: ${fontError || 'none'}`,
          [{ text: 'Continue Anyway', onPress: () => setAppReady(true) }]
        );
      }
    }, 10000);
    return () => clearTimeout(timeout);
  }, [appReady, fontsLoaded, fontError]);

  if (!appReady) {
    console.log('⏳ Waiting for app to be ready...');
    // Show a simple loading screen instead of returning null
    return (
      <View style={{ flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#fff', fontSize: 18 }}>Loading BottleUp...</Text>
        {fontError && <Text style={{ color: '#f00', fontSize: 14, marginTop: 20 }}>Font Error: {fontError}</Text>}
      </View>
    );
  }

  console.log('🚀 Rendering main app');

  return (
    <SentryErrorBoundary>
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
    </SentryErrorBoundary>
  );
});


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