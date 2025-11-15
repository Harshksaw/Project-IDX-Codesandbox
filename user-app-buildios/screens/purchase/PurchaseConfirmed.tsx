import AppSafeAreaView from "@/components/AppSafeAreaView";
import { Pressable, StyleSheet, View } from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import AppText from "@/components/AppText";
import GradientButton from "@/components/GradientButton";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { supabase, theme, usePurchaseStore } from "@/globals";
import LottieView from 'lottie-react-native';
import Toast from "react-native-toast-message";

export default function PurchaseConfirmed(props: { route: any }) {
  const orderID = props.route.params.orderID;
  const navigation = useNavigation<any>();
  const clearOrderID = usePurchaseStore(state => state.clearOrderID);
  const [finalized, setFinalized] = useState(false);
  const [orderStatus, setOrderStatus] = useState<'confirmed' | 'pending' | 'declined' | 'canceled' | null>(null);
  const animationRef = useRef<LottieView>(null);
  const checkFinalizedInterval = useRef(500);
  const timeoutID = useRef<null | ReturnType<typeof setTimeout>>(null);


  // wait for order
  useEffect(() => {
    const checkOrderState = async () => {
      const {data, error} = await supabase
        .from('orders')
        .select('state, orderStatus')
        .eq('id', orderID!)
        .single();

      if(error) {
        console.error(error);
        Toast.show({
          type: 'error',
          text1: 'Failed to confirm order finalization.'
        })
      }

      // Update order status
      if(data?.orderStatus) {
        setOrderStatus(data.orderStatus);
      }

      // order finalized! we are done.
      if(data?.state === 2) {
        setFinalized(true);
        clearOrderID();
      }
      // need to keep checking
      else {
        checkFinalizedInterval.current = Math.min(checkFinalizedInterval.current*1.5, 32*1000); // max 32 second backoff
        timeoutID.current = setTimeout(checkOrderState, checkFinalizedInterval.current);
      }
    };
    setTimeout(checkOrderState, checkFinalizedInterval.current);

    return () => {
      if(timeoutID.current !== null) {
        clearTimeout(timeoutID.current);
      }
    };
  }, []);


  const handleViewBookingDetails = useCallback(() => {
    if(finalized) {
      navigation.reset({
        index: 1,
        routes: [
          { name: 'HomeLayout', params: { screen: 'Bookings' } },
          { name: 'BookingDetail', params: { orderID: orderID } }
        ],
      });
    }
  }, [finalized]);


  const handleClose = useCallback(() => {
    if(finalized) {
      navigation.goBack();
    }
  }, [finalized]);


  // sanity check that order id is not null
  if(orderID === null) {
    navigation.reset({
      index: 0,
      routes: [{ name: 'HomeLayout' }],
    });
    return null;
  }


  return <AppSafeAreaView style={styles.container}>
    <View />
    <View style={styles.middle}>
      {
        finalized
          ? <>
            <LottieView
              autoPlay
              loop={false}
              ref={animationRef}
              style={styles.animation}
              resizeMode={'cover'}
              source={require('../../assets/animations/purchase-confirmation.json')}
            />
            <AppText font={'black'} size={'large'}>You're all set!</AppText>
            <AppText size={'small'}>Enjoy the upcoming event!</AppText>
          </>
          : <>
            <View style={styles.loadingIcon} />
            <AppText font={'black'} size={'large'}>Finalizing...</AppText>
            {orderStatus === 'pending' && (
              <AppText size={'small'}>Order pending</AppText>
            )}
            {orderStatus !== 'pending' && (
              <AppText size={'small'}></AppText>
            )}
          </>
      }
    </View>
    <View style={styles.bottom}>
      <GradientButton style={styles.viewDetails} onPress={handleViewBookingDetails} active={finalized}>
        <View style={styles.viewDetailsSideContainer}>
          <MaterialCommunityIcons name={'ticket-confirmation-outline'} size={20} color={theme.color.ticket} />
        </View>
        <AppText font={'heavy'} >View booking details</AppText>
        <View style={styles.viewDetailsSideContainer} />
      </GradientButton>
      <Pressable onPress={handleClose} style={styles.close}>
        <AppText font={'heavy'} color={finalized ? 'textPayment' : 'secondary'}>Close</AppText>
      </Pressable>
    </View>
  </AppSafeAreaView>
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    alignItems: 'stretch'
  },
  middle: {
    justifyContent: 'center',
    alignItems: 'center',
    top: 0
  },
  loadingIcon: {
    bottom: -20,
    width: 160,
    height: 240
  },
  animation: {
    bottom: -20,
    width: 160,
    height: 240
  },
  bottom: {
    alignItems: 'stretch',
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 12
  },
  viewDetails: {
    height: 65,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row'
  },
  viewDetailsSideContainer: {
    flexBasis: 44,
    flexShrink: 1,
    minWidth: 16
  },
  close: {
    height: 65,
    justifyContent: 'center',
    alignItems: 'center'
  }
});