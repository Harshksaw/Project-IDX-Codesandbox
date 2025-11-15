import { Event, theme, useStore, formatInTimeZone } from "@/globals";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { format } from 'date-fns';
import { Image } from 'expo-image';
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import AppText from "./AppText";

export default function EventCard(props: { 
  event: Event, 
  showDate?: boolean, 
  showVenueName?: boolean,
  padRight?: boolean 
}) {
  const userTimezone = useStore(state => state.userTimezone);
  const currDate = useMemo(() => new Date(props.event.start), [props.event.start]);
  
  // Check if tables are available (not sold out and not expired)
  const isTableAvailable = useMemo(() => {
    return props.event.listings.some(d => 
      d.type === 0 && 
      d.currInventory !== 0 && 
      new Date(d.purchaseTimeLimit).getTime() > Date.now()
    );
  }, [props.event]);

  // Check if tickets are available (not sold out and not expired)
  const isTicketAvailable = useMemo(() => {
    return props.event.listings.some(d => 
      d.type === 1 && 
      d.currInventory !== 0 && 
      new Date(d.purchaseTimeLimit).getTime() > Date.now()
    );
  }, [props.event]);

  return <View style={[
    styles.event, 
    props.padRight === true ? styles.eventPadRight : null,
    props.showDate === true ? styles.eventWithDate : null
  ]}>
    {props.showDate === true && <View style={styles.dateHeader}>
      <AppText font={'din'}>
        <AppText font={'din'}>{userTimezone ? formatInTimeZone(currDate, userTimezone, 'EEE').toUpperCase() : format(currDate, 'EEE').toUpperCase()},</AppText>
        {/* trick to format with space between text elements */} <AppText font={'din'} color={'primary'}>{userTimezone ? formatInTimeZone(currDate, userTimezone, 'MMM').toUpperCase() : format(currDate, 'MMM').toUpperCase()}</AppText>
        {/* trick to format with space between text elements */} <AppText font={'heavy'}>{userTimezone ? formatInTimeZone(currDate, userTimezone, "d") : format(currDate, "d")}</AppText>
      </AppText>
    </View>}
    <View style={styles.imageContainer}>
      <Image source={props.event.flyer} style={[styles.flyer, props.showDate === true ? styles.flyerDateHeader : {}]} contentFit='cover' contentPosition='top center' />
    </View>
    <View style={styles.contentContainer}>
      <AppText style={styles.eventName} font='heavy'>{props.event.name}</AppText>
      <AppText style={styles.details} color='secondary' size='small'>
        {props.showVenueName !== false ? `${props.event.venue.name} • ` : ''}{userTimezone ? formatInTimeZone(new Date(props.event.start), userTimezone, 'h:mm aa') : format(new Date(props.event.start), 'h:mm aa')}
      </AppText>
    </View>

    <View style={styles.prices}>
      <View style={styles.pricesHalved}>
        <View style={styles.priceContainerLeft}>
          <MaterialCommunityIcons name='bottle-wine' size={12} color={theme.color.table} />
          <AppText font='black' color='text' style={{ fontSize: 11 }}>Tables</AppText>
          <MaterialCommunityIcons 
            name='check-circle' 
            size={12} 
            color={isTableAvailable ? theme.color.table : `${theme.color.table}40`} 
          />
        </View>
      </View>

      <View style={styles.pricesHalved}>
        <View style={styles.priceContainerRight}>
          <MaterialCommunityIcons name='ticket-confirmation' size={12} color={theme.color.ticket} />
          <AppText size='small' font='black' color='text' style={{ fontSize: 11 }}>Tickets</AppText>
          <MaterialCommunityIcons 
            name='check-circle' 
            size={12} 
            color={isTicketAvailable ? theme.color.table : `${theme.color.table}40`} 
          />
        </View>
      </View>
    </View>
  </View>
}

const styles = StyleSheet.create({
  event: {
    flex: 1,
    borderColor: theme.color.bgBorder,
    borderWidth: 1,
    borderRadius: theme.radius.standard,
    alignItems: 'center',
    backgroundColor: theme.color.bg,
    minHeight: 240,
    padding: 6,
    justifyContent: 'space-between',
  },
  eventWithDate: {
    minHeight: 280, // Increased height when date header is shown
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    width: '100%'
  },
  eventPadRight: {
    marginRight: 10
  },
  imageContainer: {
    width: '100%',
    height: 120,
    borderRadius: 0,
    marginBottom: 2,
    overflow: 'hidden'
  },
  flyer: {
    width: '100%',
    height: '100%',
  },
  flyerDateHeader: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 5,
    marginBottom: 2,
  },
  eventName: {
    paddingHorizontal: 4,
    marginBottom: 6,
    textAlign: 'center',
    fontSize: theme.fontSize.standard,
    fontFamily: theme.fontFamily.heavy,
  },
  details: {
    paddingHorizontal: 4,
    textAlign: 'center',
    fontSize: theme.fontSize.small,
  },
  prices: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 4,
    paddingBottom: 2,
  },
  pricesHalved: {
    width: '50%',
  },
  priceContainerLeft: {
    flexDirection: 'row',
    borderColor: theme.color.bgBorderMuted,
    borderWidth: 1,
    borderRadius: theme.radius.standard,
    padding: 3,
    marginRight: 2,
    gap: 4,
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 26
  },
  priceContainerRight: {
    flexDirection: 'row',
    borderColor: theme.color.bgBorderMuted,
    borderWidth: 1,
    borderRadius: theme.radius.standard,
    padding: 3,
    marginLeft: 2,
    gap: 4,
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  tableIcon: {
    color: theme.color.text,
    fontSize: theme.fontSize.small,
  },
  ticketIcon: {
    color: theme.color.text,
    fontSize: theme.fontSize.small,
  },
  priceText: {
    justifyContent: 'center',
    flexDirection: 'row'
  },
  rightSpaceFiller: {
    flexShrink: 1
  }
})