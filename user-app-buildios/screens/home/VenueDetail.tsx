import AppSafeAreaView from "@/components/AppSafeAreaView";
import AppText from "@/components/AppText";
import EventCard from "@/components/EventCard";
import { Event, screenSize, select, supabase, theme, usePurchaseStore, useStore } from "@/globals";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Image } from "expo-image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { MaterialTabBar, MaterialTabBarProps, Tabs } from "react-native-collapsible-tab-view";
import Toast from "react-native-toast-message";

export default function VenueDetail(props: { route: any }) {
  const venueID = props.route.params.venueID;
  const setEventID = usePurchaseStore(state => state.setEventID);
  const venues = useStore(state => state.venues);
  const venue = useMemo(() => venues.find(d => d.id === venueID)!, [venues,  venueID]);
  const [events, setEvents] = useState<Event[]>([]);
  const navigation = useNavigation<any>();
  const [showMoreDescription, setShowMoreDescription] = useState(false);

  // Use global screen size instead of local calculation
  const numColumns = screenSize.isSmall ? 1 : 2;

  // Filter events to only show future events
  const futureEvents = useMemo(() => {
    const now = new Date();
    return events.filter(event => new Date(event.start) > now);
  }, [events]);

  const renderTabBar = useCallback((props: MaterialTabBarProps<any>) => <MaterialTabBar
    {...props}
    getLabelText={text => String(text)}
    style={styles.tabStyle}
    labelStyle={styles.labelStyle}
    activeColor={theme.color.text}
    inactiveColor={theme.color.secondary}
    indicatorStyle={styles.indicatorStyle}
  />, []);

  const fetchEvents = useCallback(async () => {
    const { data, error } = await supabase
      .from('events')
      .select(select.event)
      .eq('venue', venue.id)
      .order('start', { ascending: false });

    if(error !== null) {
      Toast.show({
        type: 'error',
        text1: 'Failed to load events.'
      })
      return;
    }

    // @ts-ignore, supabase type checker doesn't work for venue join.
    setEvents(data);
  }, []);

  useEffect(() => {
    fetchEvents();
  }, []);

  return <View style={styles.container}>
    <Image style={styles.bg} source={venue.banner} contentFit={'cover'} contentPosition={'top center'} />

    <AppSafeAreaView edges={['top', 'left', 'right']}>

      {/* Options and close buttons */}
      <View style={styles.topButtons}>
        {/*<Pressable hitSlop={10}>*/}
        {/*  <View style={styles.semiTransparentButton}>*/}
        {/*    <MaterialCommunityIcons name={'dots-horizontal'} size={24} color={theme.color.text} />*/}
        {/*  </View>*/}
        {/*</Pressable>*/}
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <View style={styles.semiTransparentButton}>
            <MaterialCommunityIcons name={'close'} size={20} color={theme.color.text} />
          </View>
        </Pressable>
      </View>

      {/* Info header */}
      <View style={styles.header}>
        <View style={styles.info}>
          <Image style={styles.avatar} source={venue.avatar} contentFit='cover' contentPosition={'center'} />
          <View style={styles.rightInfo}>
            <AppText font='heavy'>{venue.name}</AppText>
            <AppText size='small' color='secondary'>{venue.type} • Text Example • {'$'.repeat(venue.cost)}</AppText>
          </View>
        </View>
      </View>

      <Tabs.Container
        renderTabBar={renderTabBar}
      >

        {/* events tab */}
        <Tabs.Tab name="Events">
          <FlatList
            data={futureEvents}
            renderItem={({ item, index }) => (
              <Pressable 
                style={[
                  styles.eventWrapper,
                  numColumns === 2 ? styles.eventWrapperTwoCol : styles.eventWrapperFull,
                  numColumns === 2 ? (index % 2 === 0 ? styles.eventWrapperLeft : styles.eventWrapperRight) : null
                ]}
                onPress={() => {
                  setEventID(item.id);
                  navigation.navigate('EventDetail');
                }}
              >
                <EventCard event={item} showDate={true} showVenueName={false} padRight={false} />
              </Pressable>
            )}
            numColumns={numColumns}
            columnWrapperStyle={numColumns === 2 ? styles.eventRow : undefined}
            style={styles.events}
            key={numColumns}
            contentContainerStyle={styles.eventsContainer}
          />
        </Tabs.Tab>

        {/* details tab */}
        <Tabs.Tab name="Details">
          <Tabs.FlatList
            data={[null]}
            renderItem={() => <View style={styles.detailsContainer}>

              {/* description */}
              <AppText style={styles.description} numberOfLines={showMoreDescription ? 0 : 5} size={'small'}>{venue.description}</AppText>
              <Pressable onPress={() => setShowMoreDescription(prev => !prev)} hitSlop={15}>
                <AppText style={styles.descriptionShowMore} size={'small'} color={'primary'}>{showMoreDescription ? 'Show less' : 'Show more'}</AppText>
              </Pressable>

              {/* icon with context */}
              <View style={styles.detailPartContainer}>
                <View style={styles.detailPart}>
                  <MaterialCommunityIcons name={'map-marker-outline'} size={20} color={theme.color.secondary} />
                  <View>
                    <AppText size={'small'}>{venue.name}</AppText>
                    <AppText color={'secondary'} size={'small'}>{venue.address}</AppText>
                  </View>
                </View>
                <View style={styles.detailPart}>
                  <MaterialCommunityIcons name={'compass-outline'} size={20} color={theme.color.secondary} />
                  <AppText size={'small'}>{venue.neighborhood}</AppText>
                </View>
                <View style={styles.detailPart}>
                  <MaterialCommunityIcons name={'store-outline'} size={20} color={theme.color.secondary} />
                  <AppText size={'small'}>{venue.type === 'lounge' ? 'Lounge' : 'Unknown'}</AppText>
                </View>
                <View style={styles.detailPart}>
                  <MaterialCommunityIcons name={'tag-outline'} size={20} color={theme.color.secondary} />
                  <AppText size={'small'}>{'$'.repeat(venue.cost)}</AppText>
                </View>
              </View>
            </View>}
          />
        </Tabs.Tab>
      </Tabs.Container>

    </AppSafeAreaView>
  </View>
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexGrow: 1
  },
  bg: {
    position: 'absolute',
    width: '100%',
    height: 160
  },
  scrollView: {
    flexGrow: 1
  },
  scrollViewPoster: {
    minHeight: '100%'
  },
  topButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 10
  },
  semiTransparentButton: {
    width: 30,
    height: 30,
    // backgroundColor: theme.color.semiTransparentBlack,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center'
  },
  header: {
    borderTopRightRadius: theme.radius.extraBig,
    borderTopLeftRadius: theme.radius.extraBig,
    width: '100%',
    backgroundColor: theme.color.bg,
    paddingVertical: 30,
    paddingHorizontal: 20
  },
  info: {
    flexDirection: 'row',
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
  tabStyle: {
    backgroundColor: theme.color.bg
  },
  labelStyle: {
    fontFamily: theme.fontFamily.heavy,
    color: theme.color.text,
    fontSize: theme.fontSize.standard
  },
  indicatorStyle: {
    backgroundColor: theme.color.text,
  },
  events: {
    width: '100%',
    flexGrow: 1,
    backgroundColor: theme.color.bg,
    paddingVertical: 30,
  },
  eventsContainer: {
    paddingHorizontal: 10,
    paddingTop: 40,
    paddingBottom: 60
  },
  eventWrapper: {
    marginBottom: 10,
  },
  eventWrapperTwoCol: {
    flex: 0,
    width: '49%',
  },
  eventWrapperFull: {
    width: '100%',
  },
  eventWrapperLeft: {
    marginRight: 1,
  },
  eventWrapperRight: {
    marginLeft: 1,
  },
  eventRow: {
    justifyContent: 'space-between',
  },
  detailsContainer: {
    paddingHorizontal: 15,
    paddingVertical: 30,
    width: '100%'
  },
  description: {
    marginBottom: 16
  },
  descriptionShowMore: {
    marginBottom: 30
  },
  detailPartContainer: {
    gap: 30,
  },
  detailPart: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 13,
  }
});