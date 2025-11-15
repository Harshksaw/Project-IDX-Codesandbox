import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { PaymentSheetComponent } from './PaymentSheet';
import { usePaymentSheet } from '../hooks/usePaymentSheet';

// Example component showing how to use PaymentSheet
export const PaymentSheetExample: React.FC = () => {
  const {
    isVisible,
    mode,
    showSettings,
    showPayment,
    hide,
    handleSuccess,
    handleError,
  } = usePaymentSheet(
    // onSuccess callback
    (result) => {
      if (mode === 'settings') {
        console.log('Payment method setup successful:', result);
        // Handle successful payment method setup
      } else {
        console.log('Payment successful:', result);
        // Handle successful payment
      }
    },
    // onError callback
    (error) => {
      console.error('Payment sheet error:', error);
      // Handle error
    }
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PaymentSheet Examples</Text>
      
      {/* Settings Mode Button */}
      <TouchableOpacity style={styles.button} onPress={showSettings}>
        <Text style={styles.buttonText}>Manage Payment Methods</Text>
      </TouchableOpacity>
      
      {/* Payment Mode Button */}
      <TouchableOpacity style={styles.button} onPress={showPayment}>
        <Text style={styles.buttonText}>Make Payment</Text>
      </TouchableOpacity>

      {/* PaymentSheet Component */}
      <PaymentSheetComponent
        mode={mode}
        isVisible={isVisible}
        onClose={hide}
        onSuccess={handleSuccess}
        onError={handleError}
        // For payment mode, you would pass these props:
        // paymentIntentClientSecret="pi_..."
        // customerId="cus_..."
        // ephemeralKey="ek_..."
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    marginVertical: 10,
    minWidth: 250,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default PaymentSheetExample;
