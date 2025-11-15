import { StyleSheet, View } from "react-native";
import { ChannelList } from "stream-chat-expo";
import { useCallback, useEffect, useState } from "react";

import { streamChatClient, supabase, theme, useAuthStore, usePurchaseStore, constants } from "@/globals";
import RequiredAuthAlert from "@/components/RequiredAuthAlert";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AppText from "@/components/AppText";


export default function Offers() {
  const signedIn = useAuthStore(state => state.signedIn);
  const userInfo = useAuthStore(state => state.userInfo);
  const [userCredentials, setUserCredentials] = useState<null | { id: string, token: string }>(null);
  const [connected, setConnected] = useState(false);
  const navigation = useNavigation<any>();
  const setEventID = usePurchaseStore(state => state.setEventID);
  const setOrderID = usePurchaseStore(state => state.setOrderID);


  // load user ID. this convoluted setup is needed so userID is accessible in the ChannelList component as well as when we're logging in.
  useEffect(() => {
    const getStreamChatCredentials = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, streamChatToken')
        .single();
      if(error) {
        console.error(error);
        Toast.show({
          type: 'error',
          text1: 'Failed to get user chat credentials.'
        });
        return;
      }

      setUserCredentials({ id: data.id, token: data.streamChatToken });
    }

    if(signedIn) {
      getStreamChatCredentials();
    }
  }, [signedIn]);


  // ensure logged in to stream chat
  useEffect(() => {
    if(signedIn && userInfo !== null && userCredentials !== null) {
      console.log('connecting');
      const connect = async () => {
        // don't connect user if we are already connected
        if(streamChatClient.user === undefined) {
          await streamChatClient.connectUser(
            {
              id: userCredentials.id,
              name: userInfo.firstName + ' ' + userInfo.lastName,

            },
            userCredentials.token
          );
          setConnected(true);
        }
      };

      try {
        connect();
      }
      catch(e) {
        console.error(e);
        Toast.show({
          type: 'error',
          text1: 'Failed to load messages.'
        });
      }

      // disconnect
      return () => {
        streamChatClient.disconnectUser();
      };
    }
  }, [signedIn, userInfo, userCredentials]);


const handleSelect = useCallback((channel: any) => {
  // Use concise destructuring from the top snippet
  const { eventID, venueID, orderID } = channel?.data ?? {};

  // Use the complete logic from the bottom snippet
  if (eventID) {
    setEventID(eventID);
  }
  if (orderID) {
    setOrderID(orderID);
  }

  navigation.navigate('RequestOffer', {
    disconnectOnGoBack: false,
    venueID,
    eventID,
    orderID,
  });
// Use a correct and complete dependency array
}, [setEventID, setOrderID, navigation]);


  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyState}>
      <View style={styles.emptyStateInner}>
        <MaterialCommunityIcons name={'forum-outline'} color={theme.color.primary} size={100} />
        <AppText style={{ textAlign: 'center' }}>No messages yet</AppText>
        <AppText size={'small'} color={'secondary'} style={{ textAlign: 'center' }}>Support requests to event and venue staff will show up here.</AppText>
      </View>
    </View>
  ), []);


  return <View style={styles.container}>
    {
      !signedIn
      ? <RequiredAuthAlert />
      : !connected
      ? null
      : <ChannelList
          filters={{
            type: constants.streamChatChannelType,
            members: { $in: [userCredentials!.id] },
            eventEnd: { $gt: new Date().toISOString() }
          }}
          sort={{ last_message_at: -1 }}
          options={{ limit: 20, message_limit: 30 }}
          onSelect={handleSelect}
          EmptyStateIndicator={renderEmptyState}
        />
    }
  </View>
}


const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: theme.color.bgTint
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1
  },
  emptyStateInner: {
    gap: 10,
    alignItems: 'center',
    maxWidth: 200,
    marginBottom: 50
  }
})