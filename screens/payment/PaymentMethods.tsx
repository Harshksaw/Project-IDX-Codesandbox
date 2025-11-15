import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Pressable, ScrollView, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AppSafeAreaView from '@/components/AppSafeAreaView';
import Header from '@/components/Header';
import AppText from '@/components/AppText';
import { theme, useAuthStore, PaymentMethod, supabase } from '@/globals';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import { usePaymentSheet } from '@/hooks/usePaymentSheet';
import { PaymentSheetComponent } from '@/components/PaymentSheet';

export default function PaymentMethods() {
  const navigation = useNavigation<any>();
  const userInfo = useAuthStore(state => state.userInfo);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPaymentMethods = async () => {
    if (!userInfo?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', userInfo.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading payment methods:', error);
        Toast.show({
          type: 'error',
          text1: 'Failed to load payment methods'
        });
        return;
      }
      
      setPaymentMethods((data || []) as PaymentMethod[]);
    } catch (error) {
      console.error('Error loading payment methods:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to load payment methods'
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPaymentMethods();
    setRefreshing(false);
  };

  useEffect(() => {
    loadPaymentMethods();
  }, [userInfo?.id]);

  const handleBack = () => {
    navigation.goBack();
  };

  // PaymentSheet hook for managing payment methods
  const {
    isVisible: isPaymentSheetVisible,
    showSettings,
    hide: hidePaymentSheet,
    handleSuccess: handlePaymentSheetSuccess,
    handleError: handlePaymentSheetError,
  } = usePaymentSheet(
    // onSuccess callback
    async () => {
      console.log('Payment method added successfully');
      await loadPaymentMethods();
      Toast.show({
        type: 'success',
        text1: 'Payment method added successfully'
      });
    },
    // onError callback
    (error) => {
      console.error('Payment sheet error:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to add payment method'
      });
    }
  );

  const handlePaymentMethodPress = (paymentMethod: PaymentMethod) => {
    // Handle payment method selection - could navigate to edit or show options
    console.log('Selected payment method:', paymentMethod);
  };

  const handleAddNewPayment = useCallback(() => {
    // Open PaymentSheet in settings mode for adding payment methods
    showSettings();
  }, [showSettings]);

  // Note: Delete and set default functionality can be added later
  // For now, we'll just show the payment methods and allow adding new ones

  const getCardBrandColor = (brand: string) => {
    switch (brand) {
      case 'VISA':
        return '#1A1F71';
      case 'MASTERCARD':
        return '#EB001B';
      case 'AMEX':
        return '#006FCF';
      default:
        return theme.color.primary;
    }
  };

  if (loading) {
    return (
      <AppSafeAreaView>
        <Header 
          title="Payment Methods" 
          leftButton="chevron-left" 
          leftButtonHandler={handleBack}
        />
        <View style={styles.loadingContainer}>
          <AppText size="standard" color="secondary">Loading payment methods...</AppText>
        </View>
      </AppSafeAreaView>
    );
  }

  return (
    <AppSafeAreaView>
      <Header 
        title="Payment Methods" 
        leftButton="chevron-left" 
        leftButtonHandler={handleBack}
      />
      
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Payment Methods List */}
        {paymentMethods.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons 
              name="credit-card-outline" 
              size={48} 
              color={theme.color.secondary} 
            />
            <AppText size="standard" color="secondary" style={styles.emptyText}>
              No payment methods saved
            </AppText>
            <AppText size="small" color="secondary" style={styles.emptySubtext}>
              Add a payment method to get started
            </AppText>
          </View>
        ) : (
          paymentMethods.map((paymentMethod) => (
            <Pressable 
              key={paymentMethod.id}
              style={styles.paymentMethodRow} 
              onPress={() => handlePaymentMethodPress(paymentMethod)}
            >
              <View style={styles.paymentMethodContent}>
                <View style={styles.cardInfo}>
                  <View style={[styles.cardBrand, { backgroundColor: getCardBrandColor(paymentMethod.brand || '') }]}>
                    <AppText size="small" color="text" font="heavy">{paymentMethod.brand}</AppText>
                  </View>
                  <View style={styles.cardDetails}>
                    <AppText size="standard" color="text" font="heavy">
                      **** {paymentMethod.last4}
                    </AppText>
                    <AppText size="small" color="secondary">
                      Expires {paymentMethod.exp_month?.toString().padStart(2, '0')}/{paymentMethod.exp_year}
                    </AppText>
                  </View>
                </View>
                
                <View style={styles.cardActions}>
                  {paymentMethod.is_default && (
                    <View style={styles.defaultBadge}>
                      <AppText size="small" color="text" font="heavy">Default</AppText>
                    </View>
                  )}
                  <MaterialCommunityIcons 
                    name="chevron-right" 
                    size={20} 
                    color={theme.color.secondary} 
                  />
                </View>
              </View>
            </Pressable>
          ))
        )}

        {/* Add New Payment Method */}
        <Pressable 
          style={styles.addNewRow} 
          onPress={handleAddNewPayment}
        >
          <View style={styles.addNewContent}>
            <MaterialCommunityIcons 
              name="plus-circle-outline" 
              size={24} 
              color={theme.color.primary} 
            />
            <AppText 
              size="standard" 
              color="primary" 
              font="heavy" 
              style={styles.addNewText}
            >
              Add new payment method
            </AppText>
          </View>
        </Pressable>
      </ScrollView>

      {/* PaymentSheet Component for managing payment methods */}
      <PaymentSheetComponent
        mode="settings"
        isVisible={isPaymentSheetVisible}
        onClose={hidePaymentSheet}
        onSuccess={handlePaymentSheetSuccess}
        onError={handlePaymentSheetError}
      />
    </AppSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: 8,
    textAlign: 'center',
  },
  paymentMethodRow: {
    backgroundColor: theme.color.bgComponent,
    borderRadius: theme.radius.standard,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.color.bgBorder,
  },
  paymentMethodContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardBrand: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    minWidth: 50,
    alignItems: 'center',
  },
  cardDetails: {
    gap: 2,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  defaultBadge: {
    backgroundColor: theme.color.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  addNewRow: {
    backgroundColor: theme.color.bgComponent,
    borderRadius: theme.radius.standard,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.color.bgBorder,
    borderStyle: 'dashed',
  },
  addNewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 8,
  },
  addNewText: {
    marginLeft: 4,
  },
});
