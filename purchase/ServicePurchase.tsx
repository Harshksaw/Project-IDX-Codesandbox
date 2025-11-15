import Header from "@/components/Header";
import { endpoints, select, supabase, usePurchaseStore, useStore } from "@/globals";
import { useNavigation } from "@react-navigation/native";
import EventInfoBar from "@/components/purchase/EventInfoBar";
import { useCallback, useEffect, useMemo, useState } from "react";
import Divider from "@/components/Divider";
import { FlatList, StyleSheet, View } from "react-native";
import GradientStateTextButton from "@/components/GradientStateTextButton";
import ListingDisplay from "@/components/purchase/ListingDisplay";
import AppSafeAreaView from "@/components/AppSafeAreaView";
import Toast from "react-native-toast-message";

export default function ServicePurchase(props: { route: any }) {
  const events = useStore(state => state.events);
  const eventID = usePurchaseStore(state => state.eventID);
  const purchaseEvent = useMemo(() => events.find(d => d.id === eventID), [events, eventID])!;
  const setEventListings = useStore(state => state.setEventListings);
  const navigation = useNavigation();
  const [currListingType, setCurrListingType] = useState<'table' | 'ticket'>(props.route.params.listing ?? 'table');
  const [tablesButtonActive, setTablesButtonActive] = useState(currListingType === 'table');
  const [ticketsButtonActive, setTicketsButtonActive] = useState(currListingType === 'ticket');


  const fetchUpdatedListings = async () => {
    const { data, error } = await supabase
      .from('listings')
      .select(select.listing)
      .eq('event', purchaseEvent!.id);

    if(error) {
      console.error(error);
      Toast.show({
        type: 'error',
        text1: 'Failed to load listings'
      });
      return;
    }

    setEventListings(purchaseEvent!.id, data);
  }

  useEffect(() => {
    fetchUpdatedListings();
  }, [purchaseEvent!.id]);


  // handlers
  const handleBackButton = useCallback(() => {
    navigation.goBack();
  }, [])



  if(purchaseEvent === null) {
    navigation.goBack();
    return null;
  }

  return <AppSafeAreaView>
    <Header title={'Listings'} leftButton={'close'} leftButtonHandler={handleBackButton} />
    <EventInfoBar />
    <Divider />

    {/* Switch between tables and tickets */}
    <View style={styles.switcherContainer}>
      <GradientStateTextButton
        active={tablesButtonActive}
        text={'Tables'}
        onPress={() => {
          setCurrListingType("table");
          setTicketsButtonActive(false);
        }}
        onPressIn={() => {
          setTablesButtonActive(true);
        }}
        style={styles.switcherButton}
      />
      <GradientStateTextButton
        active={ticketsButtonActive}
        text={'Tickets'}
        onPress={() => {
          setCurrListingType("ticket");
          setTablesButtonActive(false);
        }}
        onPressIn={() => {
          setTicketsButtonActive(true);
        }}
        style={styles.switcherButton}
      />
    </View>

    <Divider />

    {/* listings */}
    <View style={styles.flatListLimiter}>
      <FlatList
        data={purchaseEvent.listings.filter(d => d.type === (currListingType === 'ticket' ? 1 : 0))}
        style={styles.listingsContainer}
        contentContainerStyle={styles.listingsContentContainer}
        renderItem={d => <ListingDisplay listing={d.item} fetchNewData={fetchUpdatedListings} />}
        ItemSeparatorComponent={Divider}
      />
    </View>

  </AppSafeAreaView>
}

const styles = StyleSheet.create({
  switcherContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    gap: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  switcherButton: {
    height: 40,
  },
  flatListLimiter: {
    flexGrow: 1,
  },
  listingsContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  listingsContentContainer: {
  },
});