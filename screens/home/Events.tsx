import AppText from "@/components/AppText";
import EventCard from "@/components/EventCard";
import { screenSize, select, supabase, theme, usePurchaseStore, useStore } from '@/globals';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { format, isSameDay } from 'date-fns';
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Pressable, StyleSheet, TextInput, View } from "react-native";
import Toast from "react-native-toast-message";
import { formatInTimeZone } from 'date-fns-tz';

export default function Events() {
  const events = useStore(state => state.events);
  const userLocation = useStore(state => state.userLocation);
  const userTimezone = useStore(state => state.userTimezone);
  const setEvents = useStore(state => state.setEvents);
  const setEventID = usePurchaseStore(state => state.setEventID);
  const [selectedDay, setSelectedDay] = useState(new Date(new Date().setHours(0, 0, 0, 0)));
  const [searchQuery, setSearchQuery] = useState('');
  const [dayList, setDayList] = useState<Date[]>(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setFullYear(end.getFullYear() + 1);
    end.setDate(end.getDate() - 1);
    const days: Date[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    return days;
  });
  const daySelectionRef = useRef<FlatList<Date>>(null);
  const navigation = useNavigation<any>();

  // Use global screen size instead of local calculation
  const numColumns = screenSize.isSmall ? 1 : 2;

  // Helper function to check if an event date matches a day in user's timezone
  const isEventOnDay = useCallback((eventStart: string, day: Date) => {
    if (!userTimezone) {
      return isSameDay(new Date(eventStart), day);
    }
    
    // Convert event start to user's timezone and compare dates
    const eventDate = new Date(eventStart);
    const eventDateInUserTz = formatInTimeZone(eventDate, userTimezone, 'yyyy-MM-dd');
    const dayInUserTz = formatInTimeZone(day, userTimezone, 'yyyy-MM-dd');
    
    return eventDateInUserTz === dayInUserTz;
  }, [userTimezone]);

  // Filter dayList to only show dates that have events
  const filteredDayList = useMemo(() => {
    return dayList.filter(day => {
      return events.some(event => isEventOnDay(event.start, day));
    });
  }, [dayList, events, isEventOnDay]);

  // Auto-select the first available date when filteredDayList changes (e.g., when switching cities)
  useEffect(() => {
    if (filteredDayList.length > 0) {
      const firstAvailableDate = filteredDayList[0];
      setSelectedDay(firstAvailableDate);
    }
  }, [filteredDayList]);

  // Events for selected day, then search filter
  const eventsForSelectedDay = useMemo(() => {
    return events.filter(e => isEventOnDay(e.start, selectedDay));
  }, [events, selectedDay, isEventOnDay]);

  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return eventsForSelectedDay;

    const query = searchQuery.toLowerCase();
    return eventsForSelectedDay.filter(event =>
      event.name.toLowerCase().includes(query) ||
      event.venue.name.toLowerCase().includes(query) ||
      event.performer.toLowerCase().includes(query)
    );
  }, [eventsForSelectedDay, searchQuery]);

  // we have to pre fetch the venue id's for the location because for some reason there's no way to filter on a
  // joined column
  const fetchEvents = useCallback(async () => {
    if(userLocation === null) {
      return;
    }

    const { data: venueData, error: venueError } = await supabase
      .from('venues')
      .select('id')
      .eq('location', userLocation!.id);

    if(venueError) {
      console.error('failed to load venues');
      console.error(venueError);
      Toast.show({
        type: 'error',
        text1: 'Failed to load events.'
      });
      return;
    }

    const { data, error } = await supabase
      .from('events')
      .select(select.event)
      .eq('status', 'live')
      .order('start', { ascending: false })
      .in('venue', venueData.map(d => d.id));

    if(error !== null) {
      Toast.show({
        type: 'error',
        text1: 'Failed to load events.'
      });
      console.error(error);
      return;
    }

    // @ts-ignore, supabase type checker doesn't work for venue join.
    setEvents(data);
  }, [userLocation]);

  useEffect(() => {
    fetchEvents();
  }, [userLocation]);

  // Rebuild the one-year day list at midnight so the end date rolls forward daily
  useEffect(() => {
    const buildDays = () => {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setFullYear(end.getFullYear() + 1);
      end.setDate(end.getDate() - 1);
      const days: Date[] = [];
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        days.push(new Date(d));
      }
      setDayList(days);
    };

    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0);
    const msUntilMidnight = nextMidnight.getTime() - now.getTime();

    let intervalId: ReturnType<typeof setInterval> | null = null;
    const timeoutId = setTimeout(() => {
      buildDays();
      intervalId = setInterval(buildDays, 24 * 60 * 60 * 1000);
    }, msUntilMidnight);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);



return <View style={styles.root}>
<FlatList
  horizontal
  data={filteredDayList}
  ref={daySelectionRef}
  style={styles.daySelection}
  directionalLockEnabled
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={styles.daySelectionContent}
  keyExtractor={(item) => String(item.getTime())}
  getItemLayout={(_, index) => ({ length: 70, offset: 70 * index, index })}
  renderItem={({ item, index }) => (
    <Pressable
      key={item.getTime()}
      onPress={() => {
        daySelectionRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
        setSelectedDay(item);
      }}
    >
      <View style={[styles.day, selectedDay.getTime() === item.getTime() ? styles.dayActive : null]}>
        <AppText color='secondary' font='din'>{userTimezone ? formatInTimeZone(item, userTimezone, 'EEE') : format(item, 'EEE')}</AppText>
        <View style={styles.monthDay}>
          <AppText color='primary' font='din'>{userTimezone ? formatInTimeZone(item, userTimezone, 'MMM').toUpperCase() : format(item, 'MMM').toUpperCase()}</AppText>
          <AppText font='heavy'>{userTimezone ? formatInTimeZone(item, userTimezone, 'd') : format(item, 'd')}</AppText>
        </View>
      </View>
    </Pressable>
  )}
/>

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
  data={filteredEvents}
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
      <EventCard event={item} padRight={false} />
    </Pressable>
  )}
  numColumns={numColumns}
  columnWrapperStyle={numColumns === 2 ? styles.eventRow : undefined}
  style={styles.events}
  key={numColumns}
  contentContainerStyle={styles.eventsContainer}
/>
</View>
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: theme.color.bg,
    flex: 1,
  },
  daySelection: {
    height: 70,
    minHeight: 70,
    borderBottomWidth: 1,
    borderBottomColor: theme.color.bgBorder,
    flexShrink: 1,
    flexGrow: 0
  },
  daySelectionContent: {
    alignItems: 'stretch',
    paddingHorizontal: 15,
  },
  day: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    borderBottomWidth: 2,
    borderBottomColor: theme.color.bg,
    height: '100%'
  },
  dayActive: {
    borderBottomColor: theme.color.text
  },
  monthDay: {
    gap: 4,
    flexDirection: 'row',
    paddingBottom: 3
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
  events: {
    width: '100%',
    flexGrow: 1,
    backgroundColor: theme.color.bg,
  },
  eventsContainer: {
    paddingHorizontal: 10,
    paddingVertical: 5,
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
    marginRight: 5,
  },
  eventWrapperRight: {
    marginLeft: 5,
  },
  eventRow: {
    justifyContent: 'space-between',
  },
});