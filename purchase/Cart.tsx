import { Platform, Pressable, ScrollView, StyleSheet, View, Modal } from "react-native";
import { Cost, endpoints, supabase, theme, useAuthStore, usePurchaseStore, useStore, screenSize } from "@/globals";
import {StackActions, useNavigation} from "@react-navigation/native";

import AppText from "@/components/AppText";
import Header from "@/components/Header";
import { useCallback, useEffect, useMemo, useState } from "react";
import EventInfoBar from "@/components/purchase/EventInfoBar";
import Divider from "@/components/Divider";
import Section from "@/components/Section";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import BottomSlideOver from "@/components/BottomSlideOver";
import GradientOutlineButton from "@/components/GradientOutlineButton";
import AppSafeAreaView from "@/components/AppSafeAreaView";
import Toast from "react-native-toast-message";
import { usePaymentSheet } from "@/hooks/usePaymentSheet";
import { PaymentSheetComponent } from "@/components/PaymentSheet";

export default function Cart() {
  const events = useStore(state => state.events);
  const eventID = usePurchaseStore(state => state.eventID);
  const purchaseEvent = useMemo(() => events.find(d => d.id === eventID)!, [events, eventID]);  const purchaseCart = usePurchaseStore(state => state.cart);
  const updateCart = usePurchaseStore(state => state.updateCart);
  const orderID = usePurchaseStore(state => state.orderID);
  const orderAge = usePurchaseStore(state => state.orderAge);
  const clearOrderID = usePurchaseStore(state => state.clearOrderID);
  const signedIn = useAuthStore(state => state.signedIn);
  const userInfo = useAuthStore(state => state.userInfo);
  const navigation = useNavigation<any>();

  const [showDepositExplanation, setShowDepositExplanation] = useState(false);
  const [showInitialTerms, setShowInitialTerms] = useState(true); // New state for initial terms modal
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showOrderFeeBreakdown, setShowOrderFeeBreakdown] = useState(false);
  const [cost, setCost] = useState<null | Cost>(null);
  const [doneInitializing, setDoneInitializing] = useState(false);
  const [preparePaymentFailed, setPreparePaymentFailed] = useState(false);
  const [stripeCustomerID, setStripeCustomerID] = useState<string | null>(null);
  const [ephemeralKey, setEphemeralKey] = useState<string | null>(null);
  const [paymentIntentClientSecret, setPaymentIntentClientSecret] = useState<string | null>(null);


  // all of this happens when the screen is loaded - responsible for intializing order
  const init = async () => {
    // checks if the order is at risk of being stale - if so, redirects to the event page for a new order to be created.
    if(orderAge!.getTime() + 1000*60*60*20 < new Date().getTime()) { // 20 hour age (vs. 24 hours when order is declared style automatically
      const action = StackActions.pop(2);
      navigation.dispatch(action);
      // declare stale order id asynchronously
      fetch(endpoints.checkout.declareStale, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderID: orderID
        })
      });
      clearOrderID();
      return;
    }

    // Refresh session for JWT token
    const { data: { session }, error: refreshSessionError } = await supabase.auth.refreshSession();
    if(refreshSessionError) {
      console.error(refreshSessionError);
      Toast.show({
        type: 'error',
        text1: 'Failed to refresh session.'
      });
      return;
    }

    // calculate cost of everything attached to order
    const calculateCostRes = await fetch(endpoints.checkout.calculateOrderCost, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session!.access_token}`
      },
      body: JSON.stringify({
        orderID: orderID
      })
    });

    if(calculateCostRes.status === 400) {
      const message = await calculateCostRes.text();
      if(message === 'Purchase time limit expired') {
        Toast.show({
          type: 'error',
          text1: 'Time to purchase listing has expired.'
        });
        navigation.dispatch(StackActions.pop(2));
        return;
      }
    }
    else if(calculateCostRes.status !== 200) {
      Toast.show({
        type: 'error',
        text1: 'Failed to calculate order cost.'
      })
      console.error(await calculateCostRes.text());
      return;
    }

    setCost(await calculateCostRes.json());


    // if we're signed in, prepare payment by attaching user to order
    if(!signedIn) {
      return;
    }

    let preparePaymentRes: Response;
    try {
      preparePaymentRes = await fetch(endpoints.checkout.prepareOrderPayment, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session!.access_token}`
        },
        body: JSON.stringify({
          orderID: orderID
        })
      });
    } catch (e) {
      console.error(e);
      Toast.show({
        type: 'error',
        text1: 'Failed to prepare order payment.'
      });
      return;
    }

    if(preparePaymentRes.status !== 200) {
      const errorText = await preparePaymentRes.text();
      console.error('prepareOrderPayment failed:', errorText);
      setPreparePaymentFailed(true);
      Toast.show({
        type: 'error',
        text1: 'Failed to prepare order payment.'
      });
      return;
    }
    
    setPreparePaymentFailed(false);

    const preparePaymentData = await preparePaymentRes.json();
    console.log('prepareOrderPayment response:', preparePaymentData);
    
    const { paymentIntentClientSecret, ephemeralKey, customer: stripeCustomerID }: { paymentIntentClientSecret: string, ephemeralKey: string, customer: string } = preparePaymentData;

    // Store payment data for use with unified PaymentSheet
    setStripeCustomerID(stripeCustomerID);
    setEphemeralKey(ephemeralKey);
    setPaymentIntentClientSecret(paymentIntentClientSecret);

    setDoneInitializing(true);
  };


  useEffect(() => {
    console.log('Re-initializing');
    init();
  }, [signedIn, userInfo]);


  // handle go back button - also clears cart and order
  const handleGoBack = useCallback(async () => {
    // Clear order if it exists
    if(orderID !== null) {
      // declare stale order id asynchronously
      fetch(endpoints.checkout.declareStale, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderID: orderID
        })
      });
      clearOrderID();
    }
    
    navigation.goBack();
    await Promise.all(purchaseCart.map(async (cartItem) => {
      const updateOrderRes = await fetch(endpoints.checkout.updateOrder, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          order: orderID,
          listing: cartItem.listing.id,
          quantity: -9999
        })
      });
      if(updateOrderRes.status !== 200) {
        Toast.show({
          type: 'error',
          text1: 'Failed to update order.'
        })
        return;
      }
      const newCart = await updateOrderRes.json();
      updateCart(newCart);
    }));
  }, [orderID, clearOrderID]);


  // handles user details button interaction
  const handleBuyerDetails = useCallback(async () => {
    if(signedIn) {
      // User is signed in - navigate to settings profile
      navigation.navigate('SettingsStack', { screen: 'SettingsProfile' });
    } else {
      // User is not signed in - navigate to new auth system
      navigation.navigate('PhoneInput');
    }
  }, [signedIn, navigation]);





  // standard formatting function for cost in cents
  const formatCents = useCallback((cents: number) => {
    return '$' + (cents/100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, []);


  // handlers
  const handleInitialTermsProceed = useCallback(() => {
    setShowInitialTerms(false);
  }, []);

  const handleTermsPress = useCallback(() => {
    setShowTermsModal(true);
  }, []);

  const handlePrivacyPress = useCallback(() => {
    setShowPrivacyModal(true);
  }, []);


  // PaymentSheet hook for processing payments
  const {
    isVisible: isPaymentSheetVisible,
    mode: paymentSheetMode,
    showPayment,
    hide: hidePaymentSheet,
    handleSuccess: handlePaymentSheetSuccess,
    handleError: handlePaymentSheetError,
  } = usePaymentSheet(
    // onSuccess callback
    async (result) => {
      console.log('Cart.tsx: Processing payment success, orderID:', orderID);
      console.log('Payment completed:', result);
      // Navigate to confirmation page
      navigation.reset({
        index: 1,
        routes: [
          { name: 'HomeLayout' },
          { name: 'PurchaseConfirmed', params: { orderID } }
        ],
      });
    },
    // onError callback
    (error) => {
      console.error('Payment sheet error:', error);
      Toast.show({
        type: 'error',
        text1: 'Payment failed'
      });
    }
  );

  // guard against accessing cart out of order
  if(purchaseEvent === null) {
    console.error('Cart was accessed without a valid purchase event');
    navigation.navigate('HomeLayout');
    return null;
  }

  // Function to open PaymentSheet in payment mode
  const openPaymentSheet = useCallback(async () => {
    if(!doneInitializing) {
      return;
    }
    
    console.log('Cart.tsx: Opening payment sheet in payment mode');
    // Use the unified PaymentSheet in payment mode
    showPayment();
  }, [doneInitializing, showPayment]);


  return <AppSafeAreaView>
    <Header title={'Checkout'} leftButtonHandler={handleGoBack} leftButton={'close'} />

    <EventInfoBar />

    <Divider />

    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>

      {/* items in cart */}
      {/*<AppText preset={'secondary header'}>Item</AppText>*/}
      {/*{purchaseCart.map((d, i) => <Fragment key={d.listing.id+d.quantity+(i+1 === purchaseCart.length)}>*/}
      {/*  <Section style={styles.cartItem} color={'primary'}>*/}
      {/*    <View style={styles.cartItemQuantity}>*/}
      {/*      <AppText font={'heavy'}>{d.quantity}</AppText>*/}
      {/*      <AppText size={'small'} font={'heavy'}>QTY.</AppText>*/}
      {/*    </View>*/}
      {/*    <AppText>{d.listing.name}</AppText>*/}
      {/*  </Section>*/}
      {/*  {i+1 !== purchaseCart.length && <Divider />}*/}
      {/*</Fragment>)}*/}
      {/*<Divider />*/}

      {/* buyer details */}
      <Pressable onPress={handleBuyerDetails} style={styles.buyerDetailsContainer}>
        <AppText size={'small'} color={'text'}>Contact details:</AppText>
        <View style={styles.buyerDetailsContainerLeft}>
          {
            signedIn
              ? <AppText size={'small'} color={'text'} font={'heavy'}>{userInfo!.firstName} {userInfo!.lastName}</AppText>
              : <AppText size={'small'} color={'textBad'} font={'heavy'}>Required</AppText>
          }
          <MaterialCommunityIcons name={'chevron-right'} size={24} color={theme.color.secondary} />
        </View>
      </Pressable>


      {/* item breakdown */}
      <AppText preset={'secondary header'} style={styles.headerWithBottomMargin}>Item</AppText>
      <Divider />
      <View style={styles.paymentContainer}>
        <View style={styles.paymentRow}>
          <AppText style={styles.paymentRowLabel} size={'small'} color={'text'}>
            {purchaseCart[0]?.quantity}x {purchaseCart[0]?.listing.name} ({purchaseCart[0]?.listing.hasMin ? 'min. spend' : 'subtotal'}):
          </AppText>
          <AppText size={'small'}>
            {cost?.total === 0 
              ? 'FREE' 
              : formatCents(
                  !purchaseCart[0]?.listing.collectInPerson && 
                  purchaseCart[0]?.listing.orderFee === 'cover' && 
                  cost !== null
                    ? cost.subtotal + cost.totalFees 
                    : cost?.subtotal || 0
                )
            }
          </AppText>
        </View>
        {cost !== null && cost.total !== 0 && (
          <>
            {cost.salesTax > 0 && (
              <View style={styles.paymentRow}>
                <AppText style={styles.paymentRowLabel} size={'small'} color={'text'}>
                  Sales tax ({((purchaseCart[0]?.listing.taxValue || 0) * 100).toFixed(1)}%):
                </AppText>
                <AppText size={'small'}>{formatCents(cost.salesTax)}</AppText>
              </View>
            )}
            {cost.gratuity > 0 && (
              <View style={styles.paymentRow}>
                <AppText style={styles.paymentRowLabel} size={'small'} color={'text'}>
                  Gratuity ({((purchaseCart[0]?.listing.gratuityValue || 0) * 100).toFixed(1)}%):
                </AppText>
                <AppText size={'small'}>{formatCents(cost.gratuity)}</AppText>
              </View>
            )}
          </>
        )}
      </View>

      {/* In-person display */}
      {purchaseCart[0]?.listing.collectInPerson && cost !== null && cost.total !== 0 && (
        <>
          <View style={styles.payableAtVenueContainer}>
            <AppText size={'standard'} color={'textPayment'} font={'heavy'}>
              To be paid in person:
            </AppText>
            <View style={styles.payableAtVenueContainerRight}>
              <AppText size={'standard'} color={'textPayment'} font={'heavy'}>
                {formatCents(cost.payableAtVenue)}
              </AppText>
            </View>
          </View>

          {/* Order fee for in-person */}
          <View style={styles.paymentSummaryContainer}>
            <View style={styles.paymentSummaryRow}>
              <View style={styles.orderFeeContainer}>
                <AppText size={'small'} color={'text'}>Order fee (non-refundable)</AppText>
                <Pressable onPress={() => setShowOrderFeeBreakdown(true)}>
                  <MaterialCommunityIcons name={'information-outline'} size={16} color={theme.color.secondary} />
                </Pressable>
                <AppText size={'small'} color={'text'}>- due now:</AppText>
              </View>
              <View style={styles.dueNowContainer}>
                <AppText size={'small'} color={'text'}>{formatCents(cost.totalFees)}</AppText>
              </View>
            </View>
          </View>
        </>
      )}

      {/* In-app display */}
      {!purchaseCart[0]?.listing.collectInPerson && cost !== null && cost.total !== 0 && (
        <>
          {/* Order fee for in-app (only if buyer pays) */}
          {purchaseCart[0]?.listing.orderFee === 'buyer' && (
            <View style={styles.paymentSummaryContainer}>
              <View style={styles.paymentSummaryRow}>
                <View style={styles.orderFeeContainer}>
                  <AppText size={'small'} color={'text'}>Order fee (non-refundable)</AppText>
                  <Pressable onPress={() => setShowOrderFeeBreakdown(true)}>
                    <MaterialCommunityIcons name={'information-outline'} size={16} color={theme.color.secondary} />
                  </Pressable>
                </View>
                <View style={styles.dueNowContainer}>
                  <AppText size={'small'} color={'text'}>{formatCents(cost.totalFees)}</AppText>
                </View>
              </View>
            </View>
          )}

          {/* Due now pill for in-app */}
          <View style={styles.payableAtVenueContainer}>
            <AppText size={'standard'} color={'textPayment'} font={'heavy'}>
              Due now:
            </AppText>
            <View style={styles.payableAtVenueContainerRight}>
              <AppText size={'standard'} color={'textPayment'} font={'heavy'}>
                {formatCents(cost.dueNow)}
              </AppText>
            </View>
          </View>
        </>
      )}

      {/* Free display */}
      {cost !== null && cost.total === 0 && (
        <View style={styles.payableAtVenueContainer}>
          <AppText size={'standard'} color={'textPayment'} font={'heavy'}>
            Total Due:
          </AppText>
          <View style={styles.payableAtVenueContainerRight}>
            <AppText size={'standard'} color={'textPayment'} font={'heavy'}>
              FREE
            </AppText>
          </View>
        </View>
      )}

      <Divider />

      {/* payment buttons */}
      <View style={styles.bottomButtonsSpacer} />
      <Pressable style={styles.viewPurchaseTerms} onPress={() => setShowInitialTerms(true)}>
        <AppText size={'small'} color={'blueLink'}>View purchase terms</AppText>
      </Pressable>
      <Pressable 
        style={[
          styles.bookNow, 
          ((!signedIn || preparePaymentFailed) && cost !== null && cost.total !== 0) ? styles.bookNowDisabled : null
        ]} 
        onPress={cost === null || cost.total === 0 ? () => {
          // Handle free booking - skip payment and go directly to confirmation
          navigation.reset({
            index: 1,
            routes: [
              { name: 'HomeLayout' },
              { name: 'PurchaseConfirmed', params: { orderID } }
            ],
          });
        } : openPaymentSheet}>
        <View style={styles.bookNowSideContainer}>
          <MaterialCommunityIcons name={'lock-outline'} color={theme.color.text} size={20} />
        </View>
        <AppText font={'heavy'} color={'text'}>
          {purchaseCart[0]?.listing.collectInPerson ? 'Reserve Now' : 'Book Now'}
          {cost !== null && cost.total !== 0 && (
            <AppText font={'heavy'} color={'text'}>
              {' '}
              {formatCents(cost.dueNow)}
            </AppText>
          )}
        </AppText>
        <View style={styles.bookNowSideContainer} />
      </Pressable>

      {/* terms and privacy text */}
      <View style={styles.termsPrivacyContainer}>
        <AppText size={'small'} color={'text'}>
          By booking you agree to{' '}
          <AppText size={'small'} color={'blueLink'} onPress={handleTermsPress}>Terms & Conditions</AppText>
          {' '}and{' '}
          <AppText size={'small'} color={'blueLink'} onPress={handlePrivacyPress}>Privacy Policy</AppText>
        </AppText>
      </View>

    </ScrollView>

    {/* booking deposit explanation slideover */}
    <BottomSlideOver show={showDepositExplanation} setShow={setShowDepositExplanation} style={styles.slideover}>
      <View style={styles.slideoverHeader}>
        <AppText size={'small'} color={'secondary'}>Booking deposit</AppText>
      </View>
      <View style={styles.slideoverBody}>
        <AppText size={'small'}>Lorem ipsum is placeholder text commonly used in the graphic, print, and publishing industries for previewing layouts and visual mockups.</AppText>
      </View>
    </BottomSlideOver>

    {/* Initial purchase terms modal - appears immediately */}
    <Modal
      visible={showInitialTerms}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowInitialTerms(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.initialTermsModal}>
        <View style={styles.initialTermsHeader}>
            <View style={styles.headerSpacer} />
            <AppText size={'small'} color={'secondary'}>Purchase terms</AppText>
            <Pressable onPress={() => setShowInitialTerms(false)} style={styles.closeButton}>
              <MaterialCommunityIcons name={'close'} size={20} color={theme.color.text} />
            </Pressable>
          </View>
          <View style={styles.initialTermsBody}>
            <View style={styles.termsList}>
              <View style={styles.termItem}>
                <AppText size={'small'} color={'text'}>- No refunds. Unless event is cancelled.</AppText>
              </View>
              <View style={styles.termItem}>
                <AppText size={'small'} color={'text'}>- Must be 21+ years old with a valid ID to enter.</AppText>
              </View>
              <View style={styles.termItem}>
                <AppText size={'small'} color={'text'}>- Entry is at doorman's discretion.</AppText>
              </View>
              <View style={styles.termItem}>
                <AppText size={'small'} color={'text'}>- Must wear appropriate attire to enter.</AppText>
              </View>
              <View style={styles.termItem}>
                <AppText size={'small'} color={'text'}>- Additional tax or gratuity may apply.</AppText>
              </View>
            </View>
          </View>
          <View style={styles.initialTermsFooter}>
            <GradientOutlineButton 
              onPress={handleInitialTermsProceed} 
              style={styles.proceedButton}
              background={'bgDark'}
            >
              <AppText size={'small'} font={'black'} color={'text'}>Proceed to checkout</AppText>
            </GradientOutlineButton>
          </View>
        </View>
      </View>
    </Modal>

    {/* Terms & Conditions Modal */}
    <Modal
      visible={showTermsModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowTermsModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.termsPrivacyModal}>
          <View style={styles.termsPrivacyHeader}>
            <View style={styles.headerSpacer} />
            <AppText size={'small'} color={'secondary'}>Terms & Conditions</AppText>
            <Pressable onPress={() => setShowTermsModal(false)} style={styles.closeButton}>
              <MaterialCommunityIcons name={'close'} size={20} color={theme.color.text} />
            </Pressable>
          </View>
          <View style={styles.termsPrivacyBody}>
            <AppText size={'small'} color={'text'}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </AppText>
          </View>
        </View>
      </View>
    </Modal>

    {/* Privacy Policy Modal */}
    <Modal
      visible={showPrivacyModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowPrivacyModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.termsPrivacyModal}>
          <View style={styles.termsPrivacyHeader}>
            <View style={styles.headerSpacer} />
            <AppText size={'small'} color={'secondary'}>Privacy Policy</AppText>
            <Pressable onPress={() => setShowPrivacyModal(false)} style={styles.closeButton}>
              <MaterialCommunityIcons name={'close'} size={20} color={theme.color.text} />
            </Pressable>
          </View>
          <View style={styles.termsPrivacyBody}>
            <AppText size={'small'} color={'text'}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </AppText>
          </View>
        </View>
      </View>
    </Modal>

    {/* Order Fee Breakdown Modal */}
    <BottomSlideOver show={showOrderFeeBreakdown} setShow={setShowOrderFeeBreakdown} style={styles.slideover}>
      <View style={styles.slideoverHeader}>
        <AppText size={'small'} color={'secondary'}>Order Fee Breakdown</AppText>
      </View>
      <View style={styles.slideoverBody}>
        {cost !== null && (
          <>
            <View style={styles.feeBreakdownRow}>
              <AppText size={'small'} color={'text'}>
                BottleUp Fee (2.1% + $0.69)
              </AppText>
              <AppText size={'small'} color={'text'}>{formatCents(cost.bottleUpFees)}</AppText>
            </View>
            <View style={styles.feeBreakdownRow}>
              <AppText size={'small'} color={'text'}>
                Stripe Processing Fee (2.9% + $0.30)
              </AppText>
              <AppText size={'small'} color={'text'}>{formatCents(cost.stripeFees)}</AppText>
            </View>
            <View style={styles.feeBreakdownRow}>
              <AppText size={'small'} color={'text'} font={'heavy'}>
                Total (5% + $0.99)
              </AppText>
              <AppText size={'small'} color={'text'} font={'heavy'}>{formatCents(cost.totalFees)}</AppText>
            </View>
          </>
        )}
      </View>
    </BottomSlideOver>

    {/* PaymentSheet Component for processing payments */}
    <PaymentSheetComponent
      mode="payment"
      isVisible={isPaymentSheetVisible}
      onClose={hidePaymentSheet}
      onSuccess={handlePaymentSheetSuccess}
      onError={handlePaymentSheetError}
      paymentIntentClientSecret={paymentIntentClientSecret || undefined}
      customerId={stripeCustomerID || undefined}
      ephemeralKey={ephemeralKey || undefined}
    />

  </AppSafeAreaView>
}

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 1
  },
  scrollViewContent: {
    flexGrow: 1
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24
  },
  cartItemQuantity: {
    alignItems: 'center',
    gap: -4
  },
  headerWithBottomMargin: {
    marginBottom: 12
  },
  buyerDetailsContainer: {
    backgroundColor: theme.color.bgComponent,
    borderRadius: 25,
    height: 60,
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 12,
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginTop: 24,
    marginBottom: 24
  },
  buyerDetailsContainerLeft: {
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center'
  },
  paymentContainer: {
    gap: 5,
    paddingBottom: 16,
    paddingTop: 16,
    paddingHorizontal: 30
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 8
  },
  paymentRowLabel: {
    flexShrink: 1
  },
  bookingDepositOverflowHider: {
    overflow: 'hidden',
    position: 'relative',
    left: -2,
  },
  bookingDepositDashed: {
    borderWidth: 1,
    borderColor: theme.color.secondary,
    borderStyle: 'dashed',
    margin: -2,
    padding: 2,
    marginBottom: 2
  },
  totalRow: {
    marginTop: 8
  },
  bottomButtonsSpacer: {
    flexGrow: 1
  },
  viewPurchaseTerms: {
    alignSelf: 'stretch',
    height: 65,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  bookNow: {
    alignSelf: 'stretch',
    height: 65,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.color.bgPayment,
    flexDirection: 'row',
    marginHorizontal: 12,
    borderRadius: theme.radius.standard,
    marginBottom: 18
  },
  bookNowDisabled: {
    opacity: 0.35
  },
  bookNowSideContainer: {
    flexBasis: 44,
    flexShrink: 1,
    minWidth: 16,
  },
  slideover: {
    paddingTop: 16,
    paddingBottom: 36,
    paddingHorizontal: 20
  },
  slideoverHeader: {
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 30
  },
  slideoverBody: {
    gap: 12,
    marginBottom: 24,
  },
  feeBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  // termsCheckout: {
  //   justifyContent: 'center',
  //   flexDirection: 'row'
  // },
  // termsCheckoutButton: {
  //   height: 50,
  //   width: 200,
  // }
  // ... existing code ...

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingBottom: 40,
  },
  initialTermsModal: {
    backgroundColor: theme.color.bgDark,
    borderRadius: theme.radius.big,
    //borderTopRightRadius: theme.radius.big,
    borderWidth: 0.5,
    borderColor: '#333333',
    width: '100%',
    maxWidth: 400,
    height: screenSize.isSmall ? '45%' : '37%',
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  initialTermsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  headerSpacer: {
    width: 20,
  },
  closeButton: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialTermsBody: {
    flex: 1,
    marginBottom: 20,
  },
  termsList: {
    gap: 6,
  },
  termItem: {
    paddingLeft: 4,
  },
  initialTermsFooter: {
    alignItems: 'stretch',
  },
  proceedButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    width: 200,
  },
  paymentSummaryContainer: {
    gap: 5,
    paddingBottom: 16,
    paddingHorizontal: 30
  },
  paymentSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 8
  },
  orderFeeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  dueNowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  termsPrivacyContainer: {
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 18,
  },
  termsPrivacyModal: {
    backgroundColor: theme.color.bgDark,
    borderRadius: theme.radius.big,
    //borderTopRightRadius: theme.radius.big,
    borderWidth: 0.5,
    borderColor: '#333333',
    width: '100%',
    maxWidth: 400,
    height: screenSize.isSmall ? '45%' : '37%',
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  termsPrivacyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  termsPrivacyBody: {
    flex: 1,
    marginBottom: 20,
  },
  payableAtVenueContainer: {
    backgroundColor: theme.color.bgComponent,
    borderRadius: theme.radius.big,
    height: 60,
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 12,
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24
  },
  payableAtVenueContainerRight: {
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center'
  },
})