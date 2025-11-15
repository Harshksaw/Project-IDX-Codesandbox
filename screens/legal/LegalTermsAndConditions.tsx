import AppSafeAreaView from "@/components/AppSafeAreaView";
import AppText from "@/components/AppText";
import RowSectionHeaderSpacer from "@/components/RowSectionHeaderSpacer";
import Divider from "@/components/Divider";
import { useNavigation } from "@react-navigation/native";
import { useCallback } from "react";
import Header from "@/components/Header";
import { ScrollView, StyleSheet } from "react-native";

export default function LegalTermsAndConditions() {
  const navigation = useNavigation<any>();


  // handlers
  const handleHeaderBackButton = useCallback(() => {
    navigation.goBack();
  }, []);


  return <AppSafeAreaView>
    <Header title={'Terms and Conditions'} leftButtonHandler={handleHeaderBackButton} leftButton={'chevron-left'} />
    <RowSectionHeaderSpacer />
    <Divider />

    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <AppText size={'small'}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </AppText>
      <AppText size={'small'}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </AppText>
      <AppText size={'small'}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </AppText>
    </ScrollView>
  </AppSafeAreaView>
}


const styles = StyleSheet.create({
  container: {
    marginHorizontal: 18,
  },
  contentContainer: {
    paddingVertical: 18,
    gap: 30
  }
})