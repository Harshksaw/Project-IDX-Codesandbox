import { ListRenderItemInfo, Pressable, StyleSheet, View } from "react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { MaterialTabBar, MaterialTabBarProps, Tabs } from "react-native-collapsible-tab-view"
import { supabase, theme, Order, useStore, select } from "@/globals";
import { useNavigation } from "@react-navigation/native";
import { formatInTimeZone } from 'date-fns-tz'
import AppText from "@/components/AppText";
import { Image } from "expo-image";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";


export default function Bookings() {
  const navigation = useNavigation<any>();
  const renderTabBar = useCallback((props: MaterialTabBarProps<any>) => <MaterialTabBar
    {...props}
    getLabelText={text => String(text)}
    style={styles.tabStyle}
    labelStyle={styles.labelStyle}
    activeColor={theme.color.text}
    inactiveColor={theme.color.text}
    indicatorStyle={styles.indicatorStyle}
  />, []);
  const userOrders = useStore(state => state.userOrders);
  const setUserOrders = useStore(state => state.setUserOrders);
  const userLocation = useStore(state => state.userLocation);
  const refundTriggered = useStore(state => state.refundTriggered);
  const setRefundTriggered = useStore(state => state.setRefundTriggered);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const timezone = userLocation?.timezone ?? 'Etc/UTC';


  // filter bookings for Future and Past tabs
  const userOrdersFuture = useMemo(() =>
    userOrders
      .filter(d => d.event.status === 'live' && d.orderStatus !== 'canceled' && d.orderStatus !== null)
      .sort((a, b) => new Date(a.event.start).getTime() - new Date(b.event.start).getTime()),
  [userOrders]);

  const userOrdersPast = useMemo(() =>
      userOrders
        .filter(d => d.event.status === 'past' || d.event.status === 'cancelled')
        .sort((a, b) => new Date(a.event.start).getTime() - new Date(b.event.start).getTime()),
    [userOrders]);


  // fetch user orders
  const getUserOrders = async () => {
    const { data, error }: any = await supabase // any is required as currently the typing doesn't recognize eventminimal correctly
      .from('orders')
      .select(select.order)
      .neq('state', -1)
      .neq('orderStatus', 'canceled');

    if(error || data === null) {
      Toast.show({
        type: 'error',
        text1: 'Failed to load bookings.'
      })
      return;
    }

    setUserOrders(data);
    console.log(data);
  };

  // refetches at first load, and when the screen is notified of a refund
  useEffect(() => {
    if(isFirstLoad) {
      getUserOrders();
      setIsFirstLoad(false);
    }
    else if(refundTriggered) {
      getUserOrders();
      setRefundTriggered(false);
    }
  }, [isFirstLoad, refundTriggered]);


  // renders standard booking component
  const renderBooking = useCallback((d: ListRenderItemInfo<Order>) => {
    const orderListing = d.item.order_listings?.[0];
    const listing = orderListing?.listing;
    const quantity = orderListing?.quantity || 1;
    // type 0 = table, type 1 = ticket
    const listingType = listing && listing.type === 0 ? 'table' : 'ticket';
    
    return (
      <Pressable style={styles.booking} onPress={() => navigation.navigate('BookingDetail', { orderID: d.item.id })}>
        <View style={styles.date}>
          <AppText size={'small'} color={'secondary'}>{formatInTimeZone(new Date(d.item.event.start), timezone, 'EEE')}</AppText>
          <AppText size={'small'} color={'primary'}>{formatInTimeZone(new Date(d.item.event.start), timezone, 'MMM').toUpperCase()}</AppText>
          <AppText size={'small'}>{formatInTimeZone(new Date(d.item.event.start), timezone, 'd')}</AppText>
        </View>

        <Image style={styles.image} source={d.item.event.flyer} contentFit={'cover'} contentPosition={'top center'} />

        <View style={styles.details}>
          <AppText size={'small'} font={'heavy'} numberOfLines={1} ellipsizeMode={'tail'}>{d.item.event.name}</AppText>
          <View style={styles.venueTimeRow}>
            <AppText size={'small'} color={'secondary'} numberOfLines={1} ellipsizeMode={'tail'} style={styles.venueName}>{d.item.venue.name}</AppText>
            <AppText size={'small'} color={'secondary'}> • {formatInTimeZone(new Date(d.item.event.start), timezone, 'h:mm aa')}</AppText>
          </View>
          <AppText size={'small'} color={'secondary'}>Qty: {quantity} {listingType}</AppText>
          {d.item.orderStatus === 'confirmed' && (
            <View style={styles.statusPill}>
              <MaterialCommunityIcons name={'check-circle'} size={16} color={theme.color.success} />
              <AppText size={'small'} style={{ color: theme.color.success }}>Confirmed</AppText>
            </View>
          )}
          {d.item.orderStatus === 'pending' && (
            <View style={styles.statusPill}>
              <MaterialCommunityIcons name={'clock-outline'} size={16} color={'#FFD700'} />
              <AppText size={'small'} style={{ color: '#FFD700' }}>Pending</AppText>
            </View>
          )}
        </View>
      </Pressable>
    );
  }, [timezone, navigation]);


  return <View style={styles.container}>
    <Tabs.Container
      renderTabBar={renderTabBar}
    >
      {/* Future tab */}
      <Tabs.Tab name="Future">
        <Tabs.FlatList
          style={styles.tab}
          contentContainerStyle={styles.tabContainer}
          data={userOrdersFuture}
          renderItem={renderBooking}
        />
      </Tabs.Tab>

      {/* Past tab */}
      <Tabs.Tab name="Past">
        <Tabs.FlatList
          style={styles.tab}
          contentContainerStyle={styles.tabContainer}
          data={userOrdersPast}
          renderItem={renderBooking}
        />
      </Tabs.Tab>
    </Tabs.Container>
  </View>
}


const styles = StyleSheet.create({
  container: {
    flexGrow: 1
  },
  tab: {
    flexGrow: 1,
    backgroundColor: theme.color.bg,
    paddingTop: 15
  },
  tabContainer: {
    paddingBottom: 30
  },
  tabStyle: {
    backgroundColor: theme.color.bg
  },
  labelStyle: {
    fontFamily: theme.fontFamily.medium,
    color: theme.color.text,
    fontSize: theme.fontSize.small
  },
  indicatorStyle: {
    backgroundColor: theme.color.text,
  },
  booking: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.color.bgBorder,
    backgroundColor: theme.color.bg,
    paddingVertical: 15,
    paddingLeft: 15,
    paddingRight: 15,
    alignItems: 'center'
  },
  date: {
    paddingRight: 20,
    gap: -3
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: theme.radius.small
  },
  details: {
    flex: 1,
    paddingLeft: 20,
    gap: 4
  },
  venueTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  venueName: {
    flexShrink: 1,
    flex: 0
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2
  }
});