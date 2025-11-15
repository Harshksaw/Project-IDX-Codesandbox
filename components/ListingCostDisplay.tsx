import { Pressable, StyleSheet, View } from "react-native";
import AppText from "@/components/AppText";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Cost, theme } from "@/globals";
import BottomSlideOver from "@/components/BottomSlideOver";
import { useState } from "react";

interface ListingCostDisplayProps {
  cost: Cost;
  listingName: string;
  quantity: number;
  hasMin: boolean;
  taxValue: number;
  gratuityValue: number;
  collectInPerson: boolean;
  orderFee: 'buyer' | 'cover';
  onShowOrderFeeBreakdown?: () => void;
}

export default function ListingCostDisplay({
  cost,
  listingName,
  quantity,
  hasMin,
  taxValue,
  gratuityValue,
  collectInPerson,
  orderFee,
  onShowOrderFeeBreakdown
}: ListingCostDisplayProps) {
  const [showOrderFeeBreakdown, setShowOrderFeeBreakdown] = useState(false);

  const formatCents = (cents: number) => {
    return '$' + (cents/100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleShowBreakdown = () => {
    if (onShowOrderFeeBreakdown) {
      onShowOrderFeeBreakdown();
    } else {
      setShowOrderFeeBreakdown(true);
    }
  };

  return (
    <>
      <View style={styles.paymentContainer}>
        <View style={styles.paymentRow}>
          <AppText style={styles.paymentRowLabel} size={'small'} color={'text'}>
            {quantity}x {listingName} ({hasMin ? 'min. spend' : 'subtotal'}):
          </AppText>
          <AppText size={'small'}>
            {cost.total === 0 
              ? 'FREE' 
              : formatCents(
                  !collectInPerson && orderFee === 'cover'
                    ? cost.subtotal + cost.totalFees 
                    : cost.subtotal
                )
            }
          </AppText>
        </View>
        {cost.total !== 0 && (
          <>
            {cost.salesTax > 0 && (
              <View style={styles.paymentRow}>
                <AppText style={styles.paymentRowLabel} size={'small'} color={'text'}>
                  Sales tax ({((taxValue || 0) * 100).toFixed(1)}%):
                </AppText>
                <AppText size={'small'}>{formatCents(cost.salesTax)}</AppText>
              </View>
            )}
            {cost.gratuity > 0 && (
              <View style={styles.paymentRow}>
                <AppText style={styles.paymentRowLabel} size={'small'} color={'text'}>
                  Gratuity ({((gratuityValue || 0) * 100).toFixed(1)}%):
                </AppText>
                <AppText size={'small'}>{formatCents(cost.gratuity)}</AppText>
              </View>
            )}
          </>
        )}
      </View>

      {/* In-person display */}
      {collectInPerson && cost.total !== 0 && (
        <>
          <View style={styles.payableAtVenueContainer}>
            <AppText size={'standard'} color={'textPayment'} font={'heavy'}>
              To be paid in person:
            </AppText>
            <View style={styles.payableAtVenueContainerRight}>
              <AppText size={'standard'} color={'textPayment'} font={'heavy'}>
                {formatCents(cost.payableAtVenue)}
              </AppText>
            </View>
          </View>

          {/* Order fee for in-person */}
          <View style={styles.paymentSummaryContainer}>
            <View style={styles.paymentSummaryRow}>
              <View style={styles.orderFeeContainer}>
                <AppText size={'small'} color={'text'}>Order fee (non-refundable)</AppText>
                <Pressable onPress={handleShowBreakdown}>
                  <MaterialCommunityIcons name={'information-outline'} size={16} color={theme.color.secondary} />
                </Pressable>
                <AppText size={'small'} color={'text'}>- due now:</AppText>
              </View>
              <View style={styles.dueNowContainer}>
                <AppText size={'small'} color={'text'}>{formatCents(cost.totalFees)}</AppText>
              </View>
            </View>
          </View>
        </>
      )}

      {/* In-app display */}
      {!collectInPerson && cost.total !== 0 && (
        <>
          {/* Order fee for in-app (only if buyer pays) */}
          {orderFee === 'buyer' && (
            <View style={styles.paymentSummaryContainer}>
              <View style={styles.paymentSummaryRow}>
                <View style={styles.orderFeeContainer}>
                  <AppText size={'small'} color={'text'}>Order fee (non-refundable)</AppText>
                  <Pressable onPress={handleShowBreakdown}>
                    <MaterialCommunityIcons name={'information-outline'} size={16} color={theme.color.secondary} />
                  </Pressable>
                </View>
                <View style={styles.dueNowContainer}>
                  <AppText size={'small'} color={'text'}>{formatCents(cost.totalFees)}</AppText>
                </View>
              </View>
            </View>
          )}

          {/* Due now pill for in-app */}
          <View style={styles.payableAtVenueContainer}>
            <AppText size={'standard'} color={'textPayment'} font={'heavy'}>
              Due now:
            </AppText>
            <View style={styles.payableAtVenueContainerRight}>
              <AppText size={'standard'} color={'textPayment'} font={'heavy'}>
                {formatCents(cost.dueNow)}
              </AppText>
            </View>
          </View>
        </>
      )}

      {/* Free display */}
      {cost.total === 0 && (
        <View style={styles.payableAtVenueContainer}>
          <AppText size={'standard'} color={'textPayment'} font={'heavy'}>
            Total Due:
          </AppText>
          <View style={styles.payableAtVenueContainerRight}>
            <AppText size={'standard'} color={'textPayment'} font={'heavy'}>
              FREE
            </AppText>
          </View>
        </View>
      )}

      {/* Order Fee Breakdown Modal - only render if no external handler provided */}
      {!onShowOrderFeeBreakdown && (
        <BottomSlideOver show={showOrderFeeBreakdown} setShow={setShowOrderFeeBreakdown} style={styles.slideover}>
          <View style={styles.slideoverHeader}>
            <AppText size={'small'} color={'secondary'}>Order Fee Breakdown</AppText>
          </View>
          <View style={styles.slideoverBody}>
            <View style={styles.feeBreakdownRow}>
              <AppText size={'small'} color={'text'}>
                BottleUp Fee (2.1% + $0.69)
              </AppText>
              <AppText size={'small'} color={'text'}>{formatCents(cost.bottleUpFees)}</AppText>
            </View>
            <View style={styles.feeBreakdownRow}>
              <AppText size={'small'} color={'text'}>
                Stripe Processing Fee (2.9% + $0.30)
              </AppText>
              <AppText size={'small'} color={'text'}>{formatCents(cost.stripeFees)}</AppText>
            </View>
            <View style={styles.feeBreakdownRow}>
              <AppText size={'small'} color={'text'} font={'heavy'}>
                Total (5% + $0.99)
              </AppText>
              <AppText size={'small'} color={'text'} font={'heavy'}>{formatCents(cost.totalFees)}</AppText>
            </View>
          </View>
        </BottomSlideOver>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  paymentContainer: {
    gap: 5,
    paddingBottom: 16,
    paddingTop: 16,
    paddingHorizontal: 30
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 8
  },
  paymentRowLabel: {
    flexShrink: 1
  },
  payableAtVenueContainer: {
    backgroundColor: theme.color.bgComponent,
    borderRadius: theme.radius.big,
    height: 60,
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 12,
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24
  },
  payableAtVenueContainerRight: {
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center'
  },
  paymentSummaryContainer: {
    gap: 5,
    paddingBottom: 16,
    paddingHorizontal: 30
  },
  paymentSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 8
  },
  orderFeeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  dueNowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  slideover: {
    paddingTop: 16,
    paddingBottom: 36,
    paddingHorizontal: 20
  },
  slideoverHeader: {
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 30
  },
  slideoverBody: {
    gap: 12,
    marginBottom: 24,
  },
  feeBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
});

