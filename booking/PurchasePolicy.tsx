import { useNavigation } from "@react-navigation/native";
import { useStore, theme } from "@/globals";
import AppSafeAreaView from "@/components/AppSafeAreaView";
import AppText from "@/components/AppText";
import { useCallback } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

export default function PurchasePolicy(props: { route: any }) {
  const orderID = props.route.params.orderID;
  const navigation = useNavigation<any>();
  const userOrders = useStore(state => state.userOrders);
  const userOrder = userOrders.find(d => d.id === orderID)!;


  // handlers
  const handleClose = useCallback(() => {
    navigation.goBack();
  }, []);

  // Purchase policy terms - same as in cart initial terms modal
  const policyTerms = [
    "No refunds. Unless event is cancelled.",
    "Must be 21+ years old with a valid ID to enter.",
    "Entry is at doorman's discretion.",
    "Must wear appropriate attire to enter.",
    "Additional tax or gratuity may apply."
  ];

  return <AppSafeAreaView style={styles.container}>
    <ScrollView contentContainerStyle={styles.contentContainer}>
      <View style={styles.termsList}>
        {policyTerms.map((term, index) => (
          <View key={index} style={styles.termItem}>
            <AppText size={'small'} color={'secondary'}>{term}</AppText>
          </View>
        ))}
      </View>

      <Pressable style={styles.closeButton} onPress={handleClose}>
        <AppText size={'small'} font={'heavy'}>CLOSE</AppText>
      </Pressable>
    </ScrollView>
  </AppSafeAreaView>
}


const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.color.bgDark,
    flex: 1
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
    justifyContent: 'space-between'
  },
  termsList: {
    gap: 12,
    flex: 1
  },
  termItem: {
    paddingLeft: 4
  },
  closeButton: {
    backgroundColor: theme.color.bgComponent,
    borderRadius: theme.radius.standard,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20
  }
})