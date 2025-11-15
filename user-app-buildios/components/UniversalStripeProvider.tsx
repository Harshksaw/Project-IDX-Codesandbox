import React from 'react';
import { Platform } from 'react-native';
import { constants } from '@/globals';

// Native Stripe (iOS/Android)
let StripeProviderNative: any;
if (Platform.OS !== 'web') {
  try {
    StripeProviderNative = require('@stripe/stripe-react-native').StripeProvider;
  } catch (e) {
    console.warn('Stripe React Native not installed.');
  }
}

// Web Stripe
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(constants.stripePublishableKey ?? '');

type Props = {
  children: React.ReactNode;
};

export default function UniversalStripeProvider({ children }: Props) {
  if (Platform.OS === 'web') {
    return <Elements stripe={stripePromise}>{children}</Elements>;
  }

  if (StripeProviderNative) {
    return (
      <StripeProviderNative publishableKey={constants.stripePublishableKey}>
        {children}
      </StripeProviderNative>
    );
  }

  console.error('Stripe provider not available for this platform.');
  return <>{children}</>;
}