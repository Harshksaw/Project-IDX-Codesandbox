import { ListRenderItemInfo, Platform, StyleSheet, useWindowDimensions, View } from "react-native";
import AppSafeAreaView from "@/components/AppSafeAreaView";
import EventInfoBar from "@/components/purchase/EventInfoBar";
import { Channel, MessageInput, MessageList } from "stream-chat-expo";
import { MaterialTabBar, MaterialTabBarProps, Tabs } from "react-native-collapsible-tab-view";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  constants,
  endpoints,
  Listing,
  select,
  streamChatClient,
  supabase,
  theme,
  useAuthStore,
  usePurchaseStore, useStore
} from "@/globals";
import { Channel as ChannelType } from 'stream-chat';
import Header from "@/components/Header";
import Divider from "@/components/Divider";
import { useNavigation } from "@react-navigation/native";
import RequiredAuthAlert from "@/components/RequiredAuthAlert";
import Toast from "react-native-toast-message";
import ListingDisplay from "@/components/purchase/ListingDisplay";


export default function RequestOffer(props: { route: any }) {
  const disconnectOnGoBack = props.route.params.disconnectOnGoBack ?? true;
  const venueID = props.route.params.venueID;
  const eventID = props.route.params.eventID ?? null;
  const orderID = props.route.params.orderID ?? null;
  const { width: windowWidth} = useWindowDimensions();
  const [channel, setChannel] = useState<ChannelType>();
  const navigation = useNavigation();
  const signedIn = useAuthStore(state => state.signedIn);
  const userInfo = useAuthStore(state => state.userInfo);
  const events = useStore(state => state.events);
  const purchaseEvent = useMemo(() => events.find(d => d.id === eventID)!, [events, eventID]);
  const [customListings, setCustomListings] = useState<Listing[]>([]);


  // header handler
  const handleBackButton = useCallback(() => {
    navigation.goBack();
  }, []);


  // connect to chat channel and retrieve corresponding channel id
  useEffect(() => {
    if(signedIn && userInfo !== null && purchaseEvent !== null) {
      const connect = async () => {
        // don't connect user if we are already connected
        if(streamChatClient.user === undefined) {
          await streamChatClient.connectUser(
            {
              id: userInfo.id,
              name: userInfo.firstName + ' ' + userInfo.lastName,
            },
            userInfo.streamChatToken
          );
        }

        const { data: { session }, error: refreshSessionError } = await supabase.auth.refreshSession();
        if(refreshSessionError) {
          console.error(refreshSessionError);
          Toast.show({
            type: 'error',
            text1: 'Failed to get offer channel.'
          });
          return;
        }

        const res = await fetch(endpoints.messaging.createSupportChat, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session!.access_token}`
          },
          body: JSON.stringify({
            venueID: venueID,
            eventID: eventID,
            orderID: orderID,
            userID: userInfo.id
          })
        });

        if(res.status !== 200) {
          const errorMessage = await res.text();
          console.error(errorMessage);
          Toast.show({
            type: 'error',
            text1: 'Failed to log in to chat.'
          });
          return;
        }

        const { channelID }: { channelID: string } = await res.json();
        const channel = streamChatClient.channel(constants.streamChatChannelType, channelID);
        await channel.watch();
        setChannel(channel);
      };

      try {
        connect();
      }
      catch(e) {
        console.error(e);
        Toast.show({
          type: 'error',
          text1: 'Failed to connect to chat service'
        });
      }

      // disconnect
      return () => {
        if(disconnectOnGoBack) {
          streamChatClient.disconnectUser();
        }
      };
    }
  }, [signedIn, userInfo, disconnectOnGoBack]);


  // update custom listings list
  const fetchCustomListings = async () => {
    const { data, error } = await supabase
      .from('listings')
      .select(select.listing)
      .is('custom', true);

    if(error) {
      console.error(error);
      Toast.show({
        type: 'error',
        text1: 'Failed to load custom orders.'
      });
      return;
    }

    setCustomListings(data);
  };

  // do update when page is loaded as well
  useEffect(() => {
    if(signedIn) {
      fetchCustomListings();
    }
  }, [signedIn])


  // handles tab change - specifically, checks for new custom listings each time the orders tab is opened
  const handleTabIndexChange = useCallback((index: number) => {
    if(index === 1) {
      fetchCustomListings();
    }
  }, []);


  // tab bar for tab swiping
  const renderTabBar = useCallback((props: MaterialTabBarProps<any>) => <MaterialTabBar
    {...props}
    getLabelText={text => String(text)}
    style={styles.tabStyle}
    labelStyle={styles.labelStyle}
    activeColor={theme.color.text}
    inactiveColor={theme.color.text}
    indicatorStyle={styles.indicatorStyle}
  />, []);


  // renders component in custom orders flatlist
  const renderCustomOffer = useCallback((d: ListRenderItemInfo<Listing>) => {
    return <ListingDisplay listing={d.item} fetchNewData={() => {
      if(signedIn) {
        fetchCustomListings();
      }
    }} />
  }, []);


  return <AppSafeAreaView>
    <Header title={'Listings'} leftButton={'close'} leftButtonHandler={handleBackButton} />
    <EventInfoBar />
    <Divider />

    {
      !signedIn
      ? <RequiredAuthAlert titleText={'Sign in to request offers.'} icon={'message-text-outline'} />
      : <Tabs.Container
          renderTabBar={renderTabBar}
          onIndexChange={handleTabIndexChange}
        >
          {/* chat tab */}
          <Tabs.Tab name="Messages">
            <View style={[styles.messagesTab, { width: windowWidth }]}>
              {
                channel && <Channel channel={channel} hasCommands={false} keyboardVerticalOffset={Platform.OS === 'ios' ? 159 : 0} hasFilePicker={false} hasImagePicker={false}>
                  <MessageList />
                  <MessageInput />
                </Channel>
              }
            </View>
          </Tabs.Tab>

          {/* offers tab */}
          <Tabs.Tab name="Offers">
            <Tabs.FlatList
              style={styles.offersTab}
              data={customListings}
              renderItem={renderCustomOffer}
            />
          </Tabs.Tab>
        </Tabs.Container>
    }
  </AppSafeAreaView>
}


const styles = StyleSheet.create({
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
  messagesTab: {
    paddingTop: 48,
    flexGrow: 1
  },
  messagesTabContainer: {
    flexGrow: 1,
  },
  offersTab: {
    flexGrow: 1
  }
})