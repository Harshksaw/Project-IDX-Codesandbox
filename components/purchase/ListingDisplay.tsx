import AppText from "@/components/AppText";
import GradientOutlineButton from "@/components/GradientOutlineButton";
import QuantityDropdown from "@/components/QuantityDropdown";
import Section from "@/components/Section";
import { endpoints, Listing, usePurchaseStore, useStore } from "@/globals";
import { useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";

export default function ListingDisplay(props: { listing: Listing, fetchNewData: () => void }) {
  const events = useStore(state => state.events);
  const eventID = usePurchaseStore(state => state.eventID);
  const purchaseEvent = useMemo(() => events.find(d => d.id === eventID), [events, eventID])!;
  const orderID = usePurchaseStore(state => state.orderID);
  const orderAge = usePurchaseStore(state => state.orderAge);
  const setOrderID = usePurchaseStore(state => state.setOrderID);
  const clearOrderID = usePurchaseStore(state => state.clearOrderID);
  const updateCart = usePurchaseStore(state => state.updateCart);
  const [quantity, setQuantity] = useState(props.listing.minPerOrder);
  const [isProcessing, setIsProcessing] = useState(false);
  const purchaseTimeLimitDate = useMemo(() => new Date(props.listing.purchaseTimeLimit), [props.listing]);
  const soldOut = props.listing.currInventory === 0;
  const [purchaseTimeExpired, setPurchaseTimeExpired] = useState(purchaseTimeLimitDate.getTime() < new Date().getTime());
  const navigation = useNavigation<any>();
  const [secondsTillExpired, setSecondsTillExpired] = useState(Math.round((purchaseTimeLimitDate.getTime() - Date.now()) / 1000));
  const [showPurchaseTimer, setShowPurchaseTimer] = useState(false);


  // sets countdown timer if we need to display it
  useEffect(() => {
    const timeDiff = purchaseTimeLimitDate.getTime() - Date.now();
    if(timeDiff > 0 && timeDiff < 1000*60*60*24) {
      setShowPurchaseTimer(true);

      const interval = setInterval(() => {
        setSecondsTillExpired(prev => {
          if(prev <= 0) {
            setPurchaseTimeExpired(true);
            setShowPurchaseTimer(false);
            clearInterval(interval);
            return 0;
          }

          return prev-1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [])

  // update order with listing. if order doesn't exist, create one and add listing
  const handleListingAdd = useCallback(async () => {
    if(isProcessing) {
      return;
    }
    setIsProcessing(true);

    if(purchaseEvent === null) {
      console.error('Purchase event was not set while listing details are displayed');
      navigation.navigate('HomeLayout');
      setIsProcessing(false);
      return;
    }

    // create order if necessary
    let newOrderID;
    if(orderID === null || purchaseEvent.id !== props.listing.event || orderAge!.getTime() + 1000*60*60*20 < new Date().getTime()) {
      if(orderID !== null) {
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

      const createOrderRes = await fetch(endpoints.checkout.createOrder, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          event: props.listing.event,
          venue: purchaseEvent.venue.id
        })
      });
      if(createOrderRes.status !== 200) {
        Toast.show({
          type: 'error',
          text1: 'Failed to begin new order.'
        })
        setIsProcessing(false);
        return;
      }
      else {
        newOrderID = await createOrderRes.text();
        setOrderID(newOrderID);
      }
    }

    // update order with quantity
    const updateOrderRes = await fetch(endpoints.checkout.updateOrder, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        order: orderID ?? newOrderID,
        listing: props.listing.id,
        quantity: quantity
      })
    });

    if(updateOrderRes.status === 400) {
      const message = await updateOrderRes.text();
      if(message === 'Quantity too high') {
        Toast.show({
          type: 'error',
          text1: 'Failed to add to cart - quantity too high.'
        });
        setIsProcessing(false);
        props.fetchNewData();
        return;
      }
      else {
        console.error(message);
        Toast.show({
          type: 'error',
          text1: 'Failed to add to cart.'
        });
        setIsProcessing(false);
        return;
      }
    }
    else if(updateOrderRes.status !== 200) {
      console.error(await updateOrderRes.text());
      setIsProcessing(false);
      return;
    }
    const newCart = await updateOrderRes.json();
    updateCart(newCart);
    setIsProcessing(false);

    navigation.navigate("Cart");
  }, [orderID, quantity, isProcessing]);


  return <Section color={'primary'} style={styles.listing}>
    <View style={styles.upper}>
      <View style={styles.listingDetails}>
        <AppText style={styles.title} size={'small'} font={'black'}>{props.listing.name}</AppText>
        <AppText size={'small'} color={'secondary'} font={'din'}>${(props.listing.price/100).toFixed(2)} {props.listing.collectInPerson && '(collected in person)'}</AppText>
      </View>

      {
        soldOut || purchaseTimeExpired
        ? <View style={styles.counterPlaceholder}></View>
        : <QuantityDropdown value={quantity} setValue={setQuantity} minCount={props.listing.minPerOrder} maxCount={Math.min(props.listing.currInventory, props.listing.maxPerOrder ?? 99999999)} />
      }

      <GradientOutlineButton style={styles.listingSelectButton}
                             onPress={() => {
                               if(!soldOut && !purchaseTimeExpired) {
                                 handleListingAdd();
                               }
                             }}
                             active={!soldOut && !purchaseTimeExpired}
      >
        <AppText size={"small"} font={"black"}>Select</AppText>
      </GradientOutlineButton>
    </View>
    <View>
      {
        soldOut
        ? <AppText font={'black'} size={'small'} color={'textBad'}>SOLD OUT</AppText>
        : purchaseTimeExpired
        ? <AppText font={'black'} size={'small'} color={'textBad'}>No longer available</AppText>
        : props.listing.currInventory < 10
        ? <AppText font={'black'} size={'small'} color={'textBad'}>{props.listing.currInventory} unit{props.listing.currInventory !== 1 && 's'} remaining</AppText>
        : <></>
      }
      {
        showPurchaseTimer && (
          <AppText font={'black'} size={'small'} color={'textBad'}>
            Bookings end in
            {} {secondsTillExpired >= 60*60 ? `${Math.floor(secondsTillExpired / (60*60))} hour${Math.floor(secondsTillExpired / (60*60)) !== 1 ? 's' : ''}, ` : ''}
            {secondsTillExpired >= 60 ? `${Math.floor(secondsTillExpired/60) % 60} minute${Math.floor(secondsTillExpired/60) % 60 !== 1 ? 's' : ''}, ` : ''}
            {secondsTillExpired % 60} second{secondsTillExpired % 60 !== 1 && 's'}
          </AppText>
        )
      }
      <AppText size={'small'} color={'secondary'}>{props.listing.description}</AppText>
    </View>
  </Section>
}

const styles = StyleSheet.create({
  listing: {
    gap: 20
  },
  upper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18
  },
  listingDetails: {
    flexGrow: 1,
    flexShrink: 1
  },
  title: {
    marginBottom: 5
  },
  dueNow: {
    marginTop: 5
  },
  quantity: {
    flexGrow: 1,
  },
  listingSelectButton: {
    width: 80,
    height: 45,
    flexBasis: 80,
    flexGrow: 0,
    flexShrink: 0
  },
  counterPlaceholder: {
    width: 60
  }
});