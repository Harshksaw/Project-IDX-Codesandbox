import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { useAuthStore, workerAPI, theme } from '../globals';

interface PaymentSheetProps {
  mode: 'settings' | 'payment';
  isVisible: boolean;
  onClose: () => void;
  onSuccess?: (result: any) => void;
  onError?: (error: any) => void;
  // For payment mode
  paymentIntentClientSecret?: string;
  customerId?: string;
  ephemeralKey?: string;
}

export const PaymentSheetComponent: React.FC<PaymentSheetProps> = ({
  mode,
  isVisible,
  onClose,
  onSuccess,
  onError,
  paymentIntentClientSecret,
  customerId,
  ephemeralKey,
}) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { userInfo } = useAuthStore();
  
  const [loading, setLoading] = useState(false);

  // Initialize and present PaymentSheet when component becomes visible
  useEffect(() => {
    if (!isVisible) return;

    const initializeAndPresentPaymentSheet = async () => {
      setLoading(true);
      
      try {
        if (mode === 'settings') {
          // Settings mode: Create SetupIntent for managing payment methods
          if (!userInfo?.id) {
            throw new Error('User not authenticated');
          }

          const setupIntentData = await workerAPI.createSetupIntent();
          
          if (setupIntentData.error) {
            throw new Error(setupIntentData.error);
          }

          const { error } = await initPaymentSheet({
            merchantDisplayName: 'BottleUp',
            customerId: setupIntentData.customer,
            customerEphemeralKeySecret: setupIntentData.ephemeralKey,
            setupIntentClientSecret: setupIntentData.setupIntentClientSecret,
            allowsDelayedPaymentMethods: true,
            defaultBillingDetails: {
              name: `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim(),
              email: userInfo.email || undefined,
            },
            appearance: {
              font: {
                family: theme.fontFamily.medium
              },
              shapes: {
                borderRadius: theme.radius.standard
              },
              colors: {
                primary: theme.color.primary,
                background: theme.color.bg,
                componentBackground: theme.color.bgTint,
                componentBorder: theme.color.bgBorder,
                componentDivider: theme.color.bgBorder,
                primaryText: theme.color.text,
                secondaryText: theme.color.secondary,
                componentText: theme.color.text,
                placeholderText: theme.color.secondary,
                icon: theme.color.text
              },
              primaryButton: {
                colors: {
                  background: theme.color.bgPayment,
                  text: theme.color.text
                }
              }
            }
          });

          if (error) {
            console.error('Error initializing payment sheet for settings:', error);
            onError?.(error);
            return;
          }

          // Present the payment sheet immediately after initialization
          const { error: presentError } = await presentPaymentSheet();
          if (presentError) {
            console.error('Error presenting payment sheet for settings:', presentError);
            onError?.(presentError);
          } else {
            // Setup completed successfully!
            console.log('Payment method setup completed successfully');
            onSuccess?.({ setupIntent: 'succeeded' });
          }

        } else {
          // Payment mode: Use existing PaymentIntent for actual payment
          if (!paymentIntentClientSecret || !customerId || !ephemeralKey) {
            throw new Error('Missing payment configuration');
          }

          const { error } = await initPaymentSheet({
            merchantDisplayName: 'BottleUp',
            customerId: customerId,
            customerEphemeralKeySecret: ephemeralKey,
            paymentIntentClientSecret: paymentIntentClientSecret,
            allowsDelayedPaymentMethods: true,
            defaultBillingDetails: {
              name: `${userInfo?.firstName || ''} ${userInfo?.lastName || ''}`.trim(),
              email: userInfo?.email || undefined,
            },
            appearance: {
              font: {
                family: theme.fontFamily.medium
              },
              shapes: {
                borderRadius: theme.radius.standard
              },
              colors: {
                primary: theme.color.primary,
                background: theme.color.bg,
                componentBackground: theme.color.bgTint,
                componentBorder: theme.color.bgBorder,
                componentDivider: theme.color.bgBorder,
                primaryText: theme.color.text,
                secondaryText: theme.color.secondary,
                componentText: theme.color.text,
                placeholderText: theme.color.secondary,
                icon: theme.color.text
              },
              primaryButton: {
                colors: {
                  background: theme.color.bgPayment,
                  text: theme.color.text
                }
              }
            }
          });

          if (error) {
            console.error('Error initializing payment sheet for payment:', error);
            onError?.(error);
            return;
          }

          // Present the payment sheet immediately after initialization
          const { error: presentError } = await presentPaymentSheet();
          if (presentError) {
            console.error('Error presenting payment sheet for payment:', presentError);
            onError?.(presentError);
          } else {
            // Payment completed successfully!
            console.log('Payment completed successfully');
            console.log('Calling onSuccess callback with:', { paymentIntent: 'succeeded' });
            onSuccess?.({ paymentIntent: 'succeeded' });
          }
        }
      } catch (error) {
        console.error('Error initializing payment sheet:', error);
        onError?.(error);
        Alert.alert('Error', 'Failed to initialize payment sheet');
      } finally {
        setLoading(false);
      }
    };

    initializeAndPresentPaymentSheet();
  }, [isVisible, mode, userInfo?.id, paymentIntentClientSecret, customerId, ephemeralKey]);

  // Don't render anything - PaymentSheet is presented via presentPaymentSheet()
  if (!isVisible) return null;
  
  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>
            {mode === 'settings' ? 'Setting up payment methods...' : 'Preparing payment...'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
});