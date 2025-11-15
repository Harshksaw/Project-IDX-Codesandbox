import { useNavigation } from "@react-navigation/native";
import AppSafeAreaView from "@/components/AppSafeAreaView";
import Header from "@/components/Header";
import {useCallback, useMemo} from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useStore } from "@/globals";
import RowSectionHeaderSpacer from "@/components/RowSectionHeaderSpacer";
import AppText from "@/components/AppText";

export default function BookingBreakdown(props: { route: any }) {
  const orderID = props.route.params.orderID;
  const navigation = useNavigation<any>();
  const userOrders = useStore(state => state.userOrders);
  const userOrder = userOrders.find(d => d.id === orderID)!;

  // cost formula is taken directly from cart
  const cost = useMemo(() => {
    let subtotal = 0;
    let bookingDeposit = 0;
    let payableAtVenue = 0;
    let dueNow = 0;
    let salesTax = 0;
    for(const d of userOrder.order_listings) {
      // price is price*quantity rounded to nearest cents
      const price = Math.round(d.listing.price*d.quantity!);
      subtotal += price;
      // deposit is 5% of price rounded to nearest cents
      const deposit = Math.round(price*0.05);
      bookingDeposit += deposit;
      // if collect in person, price is added to payable at venue
      if(d.listing.collectInPerson) {
        payableAtVenue += price;
      }
      // otherwise, we collect in app
      else {
        dueNow += price;
      }

      // sales tax is applied as percentage on top of price+fee
      const tax = Math.round((price+deposit)*userOrder.venue.salesTax);
      salesTax += tax;

      // booking deposit and sales tax is always in app
      dueNow += deposit + tax;
    }

    return {
      subtotal,
      bookingDeposit,
      salesTax,
      total: subtotal+bookingDeposit+salesTax,
      payableAtVenue,
      dueNow
    }
  }, [userOrder]);

  // handlers
  const handleHeaderBack = useCallback(() => {
    navigation.goBack();
  }, []);


  return <AppSafeAreaView>
    <Header title={'Order breakdown'} leftButtonHandler={handleHeaderBack} leftButton={'chevron-left'} />
    <RowSectionHeaderSpacer />

    <ScrollView style={styles.details} contentContainerStyle={styles.detailsContainer}>
      <View style={styles.detailSection}>
        <AppText color={'secondary'} size={'small'}>Listing</AppText>
        <AppText size={'small'} font={'heavy'}>{userOrder?.order_listings[0]?.quantity}x  {userOrder?.order_listings[0]?.listing.name}</AppText>
      </View>

      <View style={styles.detailSection}>
        <AppText color={'secondary'} size={'small'}>Payment</AppText>
        <View style={styles.leftRightAligned}>
          <AppText size={'small'}>Subtotal:</AppText>
          <AppText size={'small'}>${(cost.subtotal/100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</AppText>
        </View>
        <View style={styles.leftRightAligned}>
          <AppText size={'small'}>Booking deposit:</AppText>
          <AppText size={'small'}>${(cost.bookingDeposit/100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</AppText>
        </View>
        <View style={styles.leftRightAligned}>
          <AppText size={'small'}>Sales tax:</AppText>
          <AppText size={'small'}>${(cost.salesTax/100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</AppText>
        </View>
        <View style={styles.leftRightAligned}>
          <AppText size={'small'} font={'black'}>TOTAL:</AppText>
          <AppText size={'small'} font={'black'}>${((cost.total)/100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</AppText>
        </View>
        {/* empty text as a spacer */}
        <AppText></AppText>
        <View style={styles.leftRightAligned}>
          <AppText size={'small'}>Collectable at the venue:</AppText>
          <AppText size={'small'}>${((cost.payableAtVenue)/100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</AppText>
        </View>
        <View style={styles.leftRightAligned}>
          <AppText size={'small'}>Collected on the app:</AppText>
          <AppText size={'small'}>${((cost.dueNow)/100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</AppText>
        </View>
      </View>
    </ScrollView>
  </AppSafeAreaView>
}

const styles = StyleSheet.create({
  details: {
    marginHorizontal: 18,
    flexShrink: 1
  },
  detailsContainer: {
    paddingVertical: 12,
    gap: 18
  },
  detailSection: {

  },
  leftRightAligned: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
});