import { Pressable, StyleSheet, View } from "react-native";
import AppSafeAreaView from "@/components/AppSafeAreaView";
import AppText from "@/components/AppText";
import Header from "@/components/Header";
import { useCallback } from "react";
import QRCode from 'react-native-qrcode-svg';
import { useNavigation } from "@react-navigation/native";
import { theme, useStore, Order, select, supabase } from "@/globals";
import { useMemo, useEffect, useState } from "react";
import Toast from "react-native-toast-message";


export default function QRCodePage(props: { route: any }) {
  const orderID = props.route.params.orderID;
  const navigation = useNavigation<any>();
  const userOrders = useStore(state => state.userOrders);
  const [userOrder, setUserOrder] = useState<Order | null>(null);
  const setSingleUserOrder = useStore(state => state.setSingleUserOrder);

  const handleClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

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

  const listingName = useMemo(() => {
    return userOrder?.order_listings[0]?.listing.name || '';
  }, [userOrder]);

  return <AppSafeAreaView style={styles.container}>
    <Header title={''} leftButtonHandler={handleClose} leftButton={'chevron-left'} />

    <View style={styles.content}>
      <View style={styles.itemSection}>
        <AppText color={'secondary'} size={'small'}>Item</AppText>
        <AppText size={'large'} font={'heavy'}>{listingName}</AppText>
      </View>

      <View style={styles.qrCodeContainer}>
        <QRCode
          size={280}
          value={orderID}
          quietZone={20}
          backgroundColor={theme.color.text}
          color={theme.color.bg}
        />
      </View>

      <Pressable style={styles.closeButton} onPress={handleClose}>
        <AppText size={'small'} font={'heavy'}>CLOSE</AppText>
      </Pressable>
    </View>
  </AppSafeAreaView>
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
    gap: 40
  },
  itemSection: {
    alignItems: 'center',
    gap: 8
  },
  qrCodeContainer: {
    padding: 20,
    backgroundColor: theme.color.text,
    borderRadius: theme.radius.standard
  },
  closeButton: {
    backgroundColor: theme.color.bgComponent,
    borderRadius: theme.radius.standard,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center'
  }
})

