import { Pressable, StyleSheet, View, Modal, ScrollView } from "react-native";
import { Image } from "expo-image";
import { theme, usePurchaseStore, useStore, formatInTimeZone } from "@/globals";
import AppText from "@/components/AppText";
import { format, isSameDay, isSameMonth } from "date-fns";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo, useState, useCallback } from "react";
import Divider from "@/components/Divider";
import Section from "@/components/Section";

export default function EventInfoBar() {
  const events = useStore(state => state.events);
  const userTimezone = useStore(state => state.userTimezone);
  const eventID = usePurchaseStore(state => state.eventID);
  const purchaseEvent = useMemo(() => events.find(d => d.id === eventID)!, [events, eventID]);
  const [show, setShow] = useState(false);
  const [showMoreDescription, setShowMoreDescription] = useState(false);
  const startDate = useMemo(() => purchaseEvent === null ? null : new Date(purchaseEvent.start), [purchaseEvent]);
  const endDate = useMemo(() => purchaseEvent === null ? null : new Date(purchaseEvent.end), [purchaseEvent]);

  // Simple toggle function
  const handleToggleShow = useCallback(() => {
    setShow(prev => !prev);
  }, []);

  // Handle modal close
  const handleClose = useCallback(() => {
    setShow(false);
    setShowMoreDescription(false);
  }, []);

  if(purchaseEvent === null || startDate === null || endDate === null) {
    console.error('Purchase event is null - it should have been set before EventInfoBar was mounted');
    return null;
  }

  return <View style={styles.container}>
    <Image source={purchaseEvent.flyer} style={styles.image} contentPosition={'center'} contentFit={'cover'} />
    <View style={styles.textStack}>
      <AppText size={'small'} font={'heavy'}>{purchaseEvent.name}</AppText>
      <AppText size={'small'} font={'medium'} color={'secondary'}>
        {format(startDate, 'EEE, MMM d')} at {format(startDate, 'h aaa')} | {purchaseEvent.venue.name}
      </AppText>
    </View>
    <Pressable onPress={handleToggleShow} hitSlop={10}>
      <MaterialCommunityIcons name={'information-outline'} color={theme.color.text} size={20} />
    </Pressable>

    {/* Simple Modal */}
    <Modal
      visible={show}
      animationType="slide"
      presentationStyle="overFullScreen"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header with close button */}
          <View style={styles.modalHeader}>
            <Pressable onPress={handleClose} hitSlop={10}>
              <MaterialCommunityIcons name={'close'} color={theme.color.text} size={20} />
            </Pressable>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* header with event name and date */}
            <View style={styles.header}>
              <View style={styles.date}>
                <AppText size={'small'} color={'secondary'}>{format(startDate, 'EEE')}</AppText>
                <AppText color={'primary'}>{format(startDate, 'MMM').toUpperCase()}</AppText>
                <AppText size={'large'}>{format(startDate, 'd')}</AppText>
              </View>
              <AppText font={'heavy'}>{purchaseEvent.name}</AppText>
            </View>

            <Divider />

            {/* icon with context */}
            <Section style={styles.detailPartContainer}>
              <View style={styles.detailPart}>
                <MaterialCommunityIcons name={'map-marker-outline'} size={20} color={theme.color.secondary} />
                <View>
                  <AppText size={'small'}>{purchaseEvent.venue.name}</AppText>
                  <AppText color={'secondary'} size={'small'}>{purchaseEvent.venue.address}</AppText>
                </View>
              </View>

              {purchaseEvent.performer !== '' && <View style={styles.detailPart}>
                <MaterialCommunityIcons name={'music'} size={20} color={theme.color.secondary} />
                <AppText size={'small'}>{purchaseEvent.performer}</AppText>
              </View>}

              <View style={styles.detailPart}>
                <MaterialCommunityIcons name={'clock-outline'} size={20} color={theme.color.secondary} />
                <AppText size={'small'}>{(() => {
                  const formatDate = (date: Date, formatStr: string) => userTimezone ? formatInTimeZone(date, userTimezone, formatStr) : format(date, formatStr);
                  
                  // case where date is same
                  if(isSameDay(startDate, endDate)) {
                    return `${formatDate(startDate, 'MMM d')}, ${formatDate(startDate, 'h:mm aaa')} - ${formatDate(endDate, 'h:mm aaa')}`;
                  }

                  // case where month is the same (so date needs to be in a range)
                  else if(isSameMonth(startDate, endDate)) {
                    return `${formatDate(startDate, 'MMM d')}-${formatDate(endDate, 'd')}, ${formatDate(startDate, 'h:mm aaa')} - ${formatDate(endDate, 'h:mm aaa')}`;
                  }

                  // case where months are different
                  else {
                    return `${formatDate(startDate, 'MMM d')}-${formatDate(endDate, 'MMM d')}, ${formatDate(startDate, 'h:mm aaa')} - ${formatDate(endDate, 'h:mm aaa')}`;
                  }
                })()}</AppText>
              </View>
            </Section>

            <Divider />

            {/* collapsible description */}
            <Section style={styles.description}>
              <AppText size={'small'} numberOfLines={showMoreDescription ? 0 : 5}>
                {purchaseEvent.description}
              </AppText>
              {purchaseEvent.description.length > 100 && (
                <Pressable onPress={() => setShowMoreDescription(prev => !prev)} hitSlop={15}>
                  <AppText size={'small'} color={'primary'} style={styles.showMoreButton}>
                    {showMoreDescription ? 'Show less' : 'Show more'}
                  </AppText>
                </Pressable>
              )}
            </Section>
          </ScrollView>
        </View>
      </View>
    </Modal>
  </View>
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8
  },
  image: {
    width: 55,
    height: 55,
  },
  textStack: {
    gap: -3,
    flexGrow: 1
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: theme.color.bgDark,
    borderTopLeftRadius: theme.radius.extraBig,
    borderTopRightRadius: theme.radius.extraBig,
    maxHeight: '80%',
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    gap: 40,
    alignItems: 'center',
    paddingBottom: 7,
    paddingTop: 20
  },
  date: {
    alignItems: 'flex-start',
    gap: -4
  },
  detailPartContainer: {
    gap: 30,
  },
  detailPart: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 13,
  },
  description: {
    gap: 12,
  },
  showMoreButton: {
    marginTop: 8
  }
});