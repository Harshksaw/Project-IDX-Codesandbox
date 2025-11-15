import AppSafeAreaView from "@/components/AppSafeAreaView";
import Header from "@/components/Header";
import { useCallback, useMemo, useState, useEffect } from "react";
import { StackActions, useNavigation } from "@react-navigation/native";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import Divider from "@/components/Divider";
import { Linking } from "react-native";
import { endpoints, supabase, useStore, theme, Order, select } from "@/globals";
import ConfirmationSlideOver from "@/components/ConfirmationSlideOver";
import Toast from "react-native-toast-message";
import { formatInTimeZone } from "date-fns-tz";
import AppText from "@/components/AppText";
import { calculateOrderCost, OrderListing } from "@/components/ListingCostCalculator";
import ListingCostDisplay from "@/components/ListingCostDisplay";
import BottomSlideOver from "@/components/BottomSlideOver";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function BookingMoreDetails(props: { route: any }) {
  const orderID = props.route.params.orderID;
  const navigation = useNavigation<any>();
  const userOrders = useStore(state => state.userOrders);
  const [userOrder, setUserOrder] = useState<Order | null>(null);
  const setSingleUserOrder = useStore(state => state.setSingleUserOrder);
  const setRefundTriggered = useStore(state => state.setRefundTriggered);
  const [showRefundSlideOver, setShowRefundSlideOver] = useState(false);
  const [showOrderFeeBreakdown, setShowOrderFeeBreakdown] = useState(false);
  const location = useStore(state => state.userLocation);
  const timezone = location?.timezone ?? 'Etc/UTC';

  // Format cents helper
  const formatCents = useCallback((cents: number) => {
    return '$' + (cents/100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, []);

  // Fetch order details if not in store
  useEffect(() => {
    const order = userOrders.find(d => d.id === orderID);
    if (order) {
      setUserOrder(order);
    } else {
      // Fetch order if not in store
      const fetchOrder = async () => {
        const { data, error }: { data: Order | null, error: any } = await supabase
          .from('orders')
          .select(select.order)
          .eq('id', orderID)
          .single();

        if(error || data === null) {
          Toast.show({
            type: 'error',
            text1: 'Failed to load order details.'
          });
          return;
        }

        setSingleUserOrder(data);
        setUserOrder(data);
      };

      fetchOrder();
    }
  }, [orderID, userOrders, setSingleUserOrder]);

  // Calculate cost using ListingCostCalculator (only one listing per order)
  const cost = useMemo(() => {
    if (!userOrder || !userOrder.order_listings || userOrder.order_listings.length === 0) {
      return null;
    }

    // Map order_listings to OrderListing format and calculate cost
    const orderListing: OrderListing = {
      listing: {
        price: userOrder.order_listings[0].listing.price,
        collectInPerson: userOrder.order_listings[0].listing.collectInPerson,
        listingEndTime: userOrder.order_listings[0].listing.listingEndTime,
        taxOption: userOrder.order_listings[0].listing.taxOption,
        taxValue: userOrder.order_listings[0].listing.taxValue,
        gratuityOption: userOrder.order_listings[0].listing.gratuityOption,
        gratuityValue: userOrder.order_listings[0].listing.gratuityValue,
        orderFee: userOrder.order_listings[0].listing.orderFee,
      },
      quantity: userOrder.order_listings[0].quantity
    };

    return calculateOrderCost(orderListing);
  }, [userOrder]);

  // handlers
  const handleHeaderBack = useCallback(() => {
    navigation.goBack();
  }, []);

  const handleRequestRefund = useCallback(() => {
    setShowRefundSlideOver(true);
  }, []);


  // refund order
  const refundOrder = useCallback(async () => {
    if(userOrder === null) {
      return;
    }

    const { data: { session }, error: refreshSessionError } = await supabase.auth.refreshSession();
    if(refreshSessionError) {
      console.error(refreshSessionError);
      Toast.show({
        type: 'error',
        text1: 'Failed to prepare order payment.'
      });
      return;
    }

    let refundOrderRes: Response;
    try {
      refundOrderRes = await fetch(endpoints.checkout.refundOrder, {
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
        text1: 'Failed to refund order.'
      });
      setShowRefundSlideOver(false);
      return;
    }

    // hide slideover once done processing
    setShowRefundSlideOver(false);

    if(refundOrderRes.status !== 200) {
      const message = await refundOrderRes.text();
      if(message === 'Refund period expired') {
        Toast.show({
          type: 'error',
          text1: 'The refundable period has expired.'
        });
        return;
      }

      console.error('Failed to refund order');
      console.error(message);
      Toast.show({
        type: 'error',
        text1: 'Failed to refund order.'
      });
      return;
    }

    Toast.show({
      type: 'success',
      text1: 'Refund successful!'
    });

    // removes this order from bookings so it can't get double refunded. also triggers a refresh for bookings to
    // re-fetch updated order data
    setRefundTriggered(true);

    const leaveBookingScreens = StackActions.pop(2);
    navigation.dispatch(leaveBookingScreens);
  }, [userOrder, orderID, navigation, setRefundTriggered]);


  const firstListing = userOrder?.order_listings[0]?.listing;
  const firstOrderListing = userOrder?.order_listings[0];

  if (!userOrder || !cost || !firstListing || !firstOrderListing) {
    return <AppSafeAreaView>
      <Header title={'Details'} leftButton={'chevron-left'} leftButtonHandler={handleHeaderBack} />
      <AppText>Loading...</AppText>
    </AppSafeAreaView>;
  }

  return <AppSafeAreaView>
    <Header title={'Details'} leftButton={'chevron-left'} leftButtonHandler={handleHeaderBack} />

    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
      {/* Top section: Listing quantity x name and description */}
      <View style={styles.topSection}>
        <Divider />
        <AppText preset={'secondary header'} style={styles.headerWithBottomMargin}>Item</AppText>
        <Divider />
        <View style={styles.listingInfo}>
          <AppText size={'standard'} font={'heavy'}>{firstOrderListing.quantity}x {firstListing.name}</AppText>
          {firstListing.description && (
            <AppText size={'small'} color={'text'} style={styles.description}>
              {firstListing.description}
            </AppText>
          )}
        </View>
      </View>

      <Divider />

      {/* Cost breakdown section - using ListingCostDisplay component */}
      <View style={styles.costSection}>
        <ListingCostDisplay
          cost={cost}
          listingName={firstListing.name}
          quantity={firstOrderListing.quantity}
          hasMin={firstListing.hasMin}
          taxValue={firstListing.taxValue}
          gratuityValue={firstListing.gratuityValue}
          collectInPerson={firstListing.collectInPerson}
          orderFee={firstListing.orderFee}
          onShowOrderFeeBreakdown={() => setShowOrderFeeBreakdown(true)}
        />
      </View>

      <Divider />

      {/* Cancel order button */}
      <View style={styles.cancelSection}>
        <Pressable style={styles.cancelButton} onPress={handleRequestRefund}>
          <MaterialCommunityIcons name={'close-circle-outline'} size={20} color={theme.color.textBad} />
          <AppText size={'small'} font={'heavy'} style={{ color: theme.color.textBad }}>Cancel order</AppText>
        </Pressable>
      </View>
    </ScrollView>

    {/* Order Fee Breakdown Modal */}
    <BottomSlideOver show={showOrderFeeBreakdown} setShow={setShowOrderFeeBreakdown} style={styles.slideover}>
      <View style={styles.slideoverHeader}>
        <AppText size={'small'} color={'secondary'}>Order Fee Breakdown</AppText>
      </View>
      <View style={styles.slideoverBody}>
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
      </View>
    </BottomSlideOver>

    <ConfirmationSlideOver show={showRefundSlideOver}
                           setShow={setShowRefundSlideOver}
                           title={'Confirm refund'}
                           body={`You will be refunded the subtotal and sales tax of ${formatCents((cost.subtotal+cost.salesTax))}, not including the order fee. All listings bought in this order will be cancelled. You may only request a refund before ${formatInTimeZone(firstListing.refundTimeLimit, timezone, 'MMM d, h:mm aaa')}.`}
                           rightButtonHandle={refundOrder}
                           leftButtonText={'Cancel'}
                           rightButtonText={'Request refund'}
    />
  </AppSafeAreaView>
}

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 1
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 20
  },
  topSection: {
    //paddingHorizontal: 10,
    paddingTop: 20
  },
  headerWithBottomMargin: {
    marginBottom: 6
  },
  listingInfo: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 12
  },
  description: {
    marginTop: 4,
    lineHeight: 20
  },
  costSection: {
    paddingTop: 8
  },
  cancelSection: {
    paddingHorizontal: 30,
    paddingTop: 20,
    paddingBottom: 30
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: theme.color.textBad,
    borderRadius: theme.radius.standard,
    paddingVertical: 16,
    paddingHorizontal: 20
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
})