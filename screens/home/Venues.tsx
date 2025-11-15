import AppText from "@/components/AppText";
import { select, supabase, theme, useStore } from "@/globals";
import { useNavigation } from "@react-navigation/native";
import { Image } from "expo-image";
import { useEffect, useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, View, TextInput } from "react-native";
import Toast from "react-native-toast-message";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function Venues() {
  const venues = useStore(state => state.venues);
  const userLocation = useStore(state => state.userLocation);
  const setVenues = useStore(state => state.setVenues);
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');

  const fetchVenues = useCallback(async () => {
    if(userLocation === null) {
      return;
    }

    const { data, error } = await supabase
      .from('venues')
      .select(select.venue)
      .eq('location', userLocation.id);

    if(error !== null) {
      Toast.show({
        type: 'error',
        text1: 'Failed to load venues.'
      })
      return;
    }

    setVenues(data);
  }, [userLocation]);

  useEffect(() => {
    fetchVenues();
  }, [userLocation]);

  // Filter venues based on search query
  const filteredVenues = useMemo(() => {
    if (!searchQuery.trim()) return venues;

    const query = searchQuery.toLowerCase();
    return venues.filter(venue =>
      venue.name.toLowerCase().includes(query) ||
      venue.type.toLowerCase().includes(query) ||
      venue.neighborhood.toLowerCase().includes(query)
    );
  }, [venues, searchQuery]);

  return <View style={styles.root}>
    {/* Search Bar */}
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <MaterialCommunityIcons name="magnify" size={20} color={theme.color.secondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search"
          placeholderTextColor={theme.color.secondary}
          cursorColor={theme.color.primary}
        />
      </View>
    </View>

    <FlatList
      data={filteredVenues}
      style={styles.venues}
      contentContainerStyle={styles.venuesContainer}
      renderItem={d => <Pressable hitSlop={10} onPress={() => navigation.navigate('VenueDetail', { venueID: d.item.id })}>
        <View style={[styles.venue, d.index === 0 ? styles.venueNoTopBorder : undefined]}>
          <Image style={styles.banner} source={d.item.banner} contentFit='cover' contentPosition='top center' />
          <View style={styles.info}>
            <Image style={styles.avatar} source={d.item.avatar} contentFit='cover' contentPosition={'center'} />
            <View style={styles.rightInfo}>
              <AppText font='heavy'>{d.item.name}</AppText>
              <AppText size='small' color='secondary'>{d.item.type} • {d.item.neighborhood} • {'$'.repeat(d.item.cost)}</AppText>
            </View>
          </View>
        </View>
      </Pressable>}
    />
  </View>
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: theme.color.bg,
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.color.bgComponent,
    borderRadius: theme.radius.standard,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: theme.color.bgBorder,
  },
  searchIcon: {
    marginRight: 5,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.fontSize.standard,
    color: theme.color.text,
    fontFamily: theme.fontFamily.medium,
  },
  venues: {
    backgroundColor: theme.color.bg,
    flex: 1
  },
  venuesContainer: {
    gap: 20
  },
  venue: {
    backgroundColor: theme.color.bg,
    gap: 8,
    paddingBottom: 8,
    borderTopColor: theme.color.bgBorder,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderBottomColor: theme.color.bgBorder
  },
  venueNoTopBorder: {
    borderTopWidth: 0
  },
  banner: {
    width: '100%',
    height: 120
  },
  info: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 25,
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderColor: theme.color.white,
    borderWidth: 2
  },
  rightInfo: {
    gap: -2
  },
  name: {

  },
  details: {

  }
})