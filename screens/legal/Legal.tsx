import AppSafeAreaView from "@/components/AppSafeAreaView";
import AppText from "@/components/AppText";
import DrawerToggleHeader from "@/components/DrawerToggleHeader";
import RowSectionHeaderSpacer from "@/components/RowSectionHeaderSpacer";
import Divider from "@/components/Divider";
import RowSection from "@/components/RowSection";
import { useNavigation } from "@react-navigation/native";
import { useCallback } from "react";

export default function Legal() {
  const navigation = useNavigation<any>()


  // handlers
  const handleTermsAndConditions = useCallback(() => {
    navigation.navigate('LegalTermsAndConditions');
  }, [])

  const handlePrivacyPolicy = useCallback(() => {
    navigation.navigate('LegalPrivacyPolicy');
  }, [])


  return <AppSafeAreaView>
    <DrawerToggleHeader>
      <AppText size={'small'}>Legal</AppText>
    </DrawerToggleHeader>
    <RowSectionHeaderSpacer />
    <Divider />

    <RowSection text={'Terms and Conditions'} handler={handleTermsAndConditions} />
    <Divider />

    <RowSection text={'Privacy Policy'} handler={handlePrivacyPolicy} />
    <Divider />
  </AppSafeAreaView>
}