import AppText from "@/components/AppText";
import { FlatList, ListRenderItemInfo, Pressable, StyleSheet, TextInput, View } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { Event, select, supabase, theme, usePurchaseStore, useStore, Venue } from "@/globals";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { formatInTimeZone } from "date-fns-tz";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import { isSameDay, isSameMonth } from "date-fns";


type EventOrVenue = { d: Event, type: 'event' } | { d: Venue, type: 'venue' };


export default function Search() {
  const setEventID = usePurchaseStore(state => state.setEventID);
  const location = useStore(state => state.userLocation);
  const timezone = location?.timezone ?? 'Etc/UTC';
  const navigation = useNavigation<any>();
  const [searchInput, setSearchInput] = useState('');
  const [results, setResults] = useState<EventOrVenue[]>([]);


  const handleClearInput = useCallback(() => {
    setSearchInput('');
  }, []);


  // search with search input. timeout used to debounce
  useEffect(() => {
    if(searchInput === '' || location === null) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      // search events and venues concurrently
      const [{ data: venueSearchData, error: venueSearchError}, { data: eventSearchData, error: eventSearchError}] = await Promise.all([
        supabase
          .from('venues')
          .select(select.venue)
          .eq('location', location.id)
          .textSearch('fts', searchInput, { type: 'websearch' }),

        supabase
          .from('events')
          .select(select.event)
          .eq('venue.location', location.id)
          .textSearch('fts', searchInput, { type: 'websearch' })
      ]);

      if(venueSearchError || eventSearchError) {
        console.error(venueSearchError);
        console.error(eventSearchError);
        Toast.show({
          type: 'error',
          text1: 'Failed to load search results.'
        });
        return;
      }

      // @ts-ignore
      setResults(venueSearchData!.map(d => ({ d: d, type: 'venue' })).concat(eventSearchData!.map(d => ({ d: d, type: 'event' }))));
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchInput]);


  // renders either an event or a venue card
  const renderResult = useCallback((d: ListRenderItemInfo<EventOrVenue>) => (
    <Pressable style={styles.booking} onPress={() => {
      if(d.item.type === 'event') {
        setEventID(d.item.d.id);
        navigation.navigate('EventDetail');
      }
      else {
        navigation.navigate('VenueDetail', { venueID: d.item.d.id })
      }
    }}>
      <Image style={d.item.type === 'venue' ? styles.imageVenue : styles.imageEvent} source={d.item.type === 'event' ? d.item.d.flyer : d.item.d.avatar} contentFit={'cover'} contentPosition={'top center'} />

      <View style={styles.details}>
        <AppText size={'standard'} font={'heavy'}>{d.item.type === 'event' ? d.item.d.name : d.item.d.name}</AppText>
        {
          d.item.type === 'venue'
            ? <AppText size={'small'} color={'secondary'}>{d.item.d.type} • {d.item.d.neighborhood} • {'$'.repeat(d.item.d.cost)}</AppText>
            : <>
                <AppText size={'small'} color={'secondary'}>{d.item.d.venue.name}{d.item.d.performer !== '' && ` • ${d.item.d.performer}`}</AppText>
                <AppText size={'small'} color={'secondary'}>{(() => {
                  const startDate =  new Date(d.item.d.start);
                  const endDate = new Date(d.item.d.end);
                  // case where date is same
                  if(isSameDay(startDate, endDate)) {
                    return `${formatInTimeZone(startDate, timezone, 'MMM d, h:mm aaa')} - ${formatInTimeZone(endDate, timezone, 'h:mm aaa')}`;
                  }
                  // case where month is the same (so date needs to be in a range)
                  else if(isSameMonth(startDate, endDate)) {
                    return `${formatInTimeZone(startDate, timezone, 'MMM d')}-${formatInTimeZone(endDate, timezone, 'd')}, ${formatInTimeZone(startDate, timezone, 'h:mm aaa')} - ${formatInTimeZone(endDate, timezone, 'h:mm aaa')}`;
                  }
                  // case where months are different
                  else {
                    return `${formatInTimeZone(startDate, timezone, 'MMM d')}-${formatInTimeZone(endDate, timezone, 'MMM d')}, ${formatInTimeZone(startDate, timezone, 'h:mm aaa')} - ${formatInTimeZone(endDate, timezone, 'h:mm aaa')}`;
                  }
                })()}</AppText>
              </>
        }
      </View>
    </Pressable>
  ), []);



  return <View style={styles.container}>
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        value={searchInput}
        onChangeText={setSearchInput}
        cursorColor={theme.color.primary}
        placeholder={'Search for a venue or event'}
        placeholderTextColor={theme.color.secondary}
      />
      {searchInput !== '' && <Pressable onPress={handleClearInput} style={styles.clearButton} hitSlop={13}>
        <MaterialCommunityIcons name={'close'} color={theme.color.secondary} size={20} />
      </Pressable>}
    </View>

    <FlatList keyboardShouldPersistTaps={'handled'} style={styles.resultsList} contentContainerStyle={styles.resultsListContainer} data={results} renderItem={renderResult} />
  </View>
}


const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: theme.color.bgTint
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: theme.color.secondary,
    borderRadius: theme.radius.standard,
    flexDirection: 'row',
    backgroundColor: theme.color.bg,
    marginVertical: 15,
    marginHorizontal: 12
  },
  input: {
    flexGrow: 1,
    flexShrink: 1,
    fontFamily: theme.fontFamily.heavy,
    fontSize: theme.fontSize.standard,
    paddingVertical: 8,
    paddingHorizontal: 12,
    color: theme.color.text
  },
  clearButton: {
    width: 32,
    justifyContent: 'center',
    alignItems: 'flex-start'
  },
  resultsList: {
    flexGrow: 1
  },
  resultsListContainer: {
    gap: 15,
    paddingBottom: 30
  },
  booking: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.color.bgBorder,
    backgroundColor: theme.color.bg,
    paddingVertical: 15,
    paddingLeft: 5,
    paddingRight: 15,
    alignItems: 'center'
  },
  date: {
    paddingLeft: 8,
    paddingRight: 20,
    gap: -3
  },
  imageVenue: {
    width: 60,
    height: 60,
    borderRadius: 30
  },
  imageEvent: {
    width: 100,
    height: 100,
    borderRadius: theme.radius.small
  },
  details: {
    paddingLeft: 20
  }
})