import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import AppSafeAreaView from "@/components/AppSafeAreaView";
import AppText from "@/components/AppText";
import Header from "@/components/Header";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { supabase, theme, useAuthStore, Order, useStore, select } from "@/globals";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { isSameDay, isSameMonth } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import openMap from 'react-native-open-maps';
import Toast from "react-native-toast-message";


export default function BookingDetail(props: { route: any }) {
  const orderID = props.route.params.orderID;
  const userOrders = useStore(state => state.userOrders);
  const [userOrder, setUserOrder] = useState<Order | null>(null);
  const setSingleUserOrder = useStore(state => state.setSingleUserOrder);
  const userInfo = useAuthStore(state => state.userInfo);
  const navigation = useNavigation<any>();
  const location = useStore(state => state.userLocation);
  const timezone = location?.timezone ?? 'Etc/UTC';
  
  const startDate = useMemo(() => userOrder ? new Date(userOrder.event.start) : null, [userOrder]);
  const endDate = useMemo(() => userOrder ? new Date(userOrder.event.end) : null, [userOrder]);


  const handleHeaderLeftButton = useCallback(() => {
    navigation.goBack();
  }, []);


  // Fetch order details if not in store or refresh
  useEffect(() => {
    const order = userOrders.find(d => d.id === orderID);
    if (order) {
      setUserOrder(order);
    } else {
      // Fetch order if not in store
      const fetchOrderDetails = async () => {
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

      fetchOrderDetails();
    }
  }, [orderID, userOrders, setSingleUserOrder]);


  // button handlers for actions
  const handleDirections = useCallback(() => {
    openMap({ query: userOrder?.venue.address });
  }, [userOrder]);

  const handleDetails = useCallback(() => {
    navigation.navigate('BookingMoreDetails', { orderID });
  }, []);


  const handleViewPass = useCallback(() => {
    navigation.navigate('QRCode', { orderID });
  }, [navigation, orderID]);

  const handlePurchasePolicy = useCallback(() => {
    navigation.navigate('PurchasePolicy', { orderID });
  }, [navigation, orderID]);

  const handleOrderDetails = useCallback(() => {
    navigation.navigate('BookingMoreDetails', { orderID });
  }, [navigation, orderID]);

  const formatEventDate = useMemo(() => {
    if (!startDate || !endDate) return '';
    // case where date is same
    if(isSameDay(startDate, endDate)) {
      return `${formatInTimeZone(startDate, timezone, 'EEE, MMMM d')}, ${formatInTimeZone(startDate, timezone, 'h:mm aa')}`;
    }
    // case where month is the same (so date needs to be in a range)
    else if(isSameMonth(startDate, endDate)) {
      return `${formatInTimeZone(startDate, timezone, 'EEE, MMMM d')}-${formatInTimeZone(endDate, timezone, 'd')}, ${formatInTimeZone(startDate, timezone, 'h:mm aa')}`;
    }
    // case where months are different
    else {
      return `${formatInTimeZone(startDate, timezone, 'EEE, MMMM d')}-${formatInTimeZone(endDate, timezone, 'EEE, MMMM d')}, ${formatInTimeZone(startDate, timezone, 'h:mm aa')}`;
    }
  }, [startDate, endDate, timezone]);

  if (!userOrder) {
    return <AppSafeAreaView>
      <Header title={''} leftButtonHandler={handleHeaderLeftButton} leftButton={'chevron-left'} />
      <AppText>Loading...</AppText>
    </AppSafeAreaView>;
  }

  const orderListing = userOrder.order_listings?.[0];
  const listing = orderListing?.listing;

  return <AppSafeAreaView>
    <Header title={''} leftButtonHandler={handleHeaderLeftButton} leftButton={'chevron-left'} />

    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <AppText color={'secondary'} size={'small'}>Name</AppText>
          <AppText size={'small'} font={'heavy'}>{userInfo?.firstName} {userInfo?.lastName}</AppText>
        </View>

        <View style={styles.infoRow}>
          <AppText color={'secondary'} size={'small'}>Event</AppText>
          <AppText size={'small'} font={'heavy'}>{userOrder?.event.name}</AppText>
        </View>

        <View style={styles.infoRow}>
          <AppText color={'secondary'} size={'small'}>Item</AppText>
          <AppText size={'small'} font={'heavy'}>{listing?.name || 'N/A'}</AppText>
        </View>

        <View style={styles.infoRow}>
          <AppText color={'secondary'} size={'small'}>Event date</AppText>
          <AppText size={'small'} font={'heavy'}>{formatEventDate}</AppText>
        </View>

        <View style={styles.infoRow}>
          <AppText color={'secondary'} size={'small'}>Location</AppText>
          <View style={styles.locationRow}>
            <View style={styles.locationText}>
              <AppText size={'small'} font={'heavy'}>{userOrder?.venue.name}</AppText>
              <AppText size={'small'} font={'heavy'}>{userOrder?.venue.address}</AppText>
            </View>
            <Pressable onPress={handleDirections} style={styles.directionsButton}>
              <AppText size={'small'} font={'heavy'} color={'text'}>DIRECTIONS</AppText>
            </Pressable>
          </View>
        </View>

        <View style={styles.infoRow}>
          <AppText color={'secondary'} size={'small'}>Order status</AppText>
          {userOrder?.orderStatus === 'confirmed' && (
            <View style={styles.statusPill}>
              <MaterialCommunityIcons name={'check-circle'} size={16} color={theme.color.success} />
              <AppText size={'small'} style={{ color: theme.color.success }}>Confirmed</AppText>
            </View>
          )}
          {userOrder?.orderStatus === 'pending' && (
            <View style={styles.statusPill}>
              <MaterialCommunityIcons name={'clock-outline'} size={16} color={'#FFA500'} />
              <AppText size={'small'} style={{ color: '#FFA500' }}>Pending</AppText>
            </View>
          )}
        </View>
      </View>

      <View style={styles.pillsContainer}>
        <Pressable style={styles.viewPassPill} onPress={handleViewPass}>
          <MaterialCommunityIcons name={'ticket-confirmation-outline'} size={20} color={theme.color.bg} />
          <AppText size={'small'} font={'heavy'} style={{ color: theme.color.bg }}>View Pass</AppText>
        </Pressable>

        <Pressable style={styles.pill} onPress={handlePurchasePolicy}>
          <MaterialCommunityIcons name={'file-document-outline'} size={20} color={theme.color.text} />
          <AppText size={'small'} font={'heavy'}>Purchase policy</AppText>
        </Pressable>

        <Pressable style={styles.pill} onPress={handleOrderDetails}>
          <MaterialCommunityIcons name={'dots-horizontal'} size={20} color={theme.color.text} />
          <AppText size={'small'} font={'heavy'}>Order details</AppText>
        </Pressable>
      </View>
    </ScrollView>

  </AppSafeAreaView>
}


const styles = StyleSheet.create({
  scrollView: {
    flex: 1
  },
  scrollViewContent: {
    paddingHorizontal: 18,
    paddingVertical: 20,
    gap: 24
  },
  infoSection: {
    gap: 18
  },
  infoRow: {
    gap: 8
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12
  },
  locationText: {
    flex: 1,
    gap: 2
  },
  directionsButton: {
    paddingVertical: 4
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  pillsContainer: {
    gap: 12,
    paddingTop: 8
  },
  viewPassPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.color.text,
    borderRadius: theme.radius.standard,
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 8
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.color.bgComponent,
    borderRadius: theme.radius.standard,
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 8
  }
})