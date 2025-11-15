import AppSafeAreaView from "@/components/AppSafeAreaView";
import AppText from "@/components/AppText";
import DrawerToggleHeader from "@/components/DrawerToggleHeader";
import RowSectionHeaderSpacer from "@/components/RowSectionHeaderSpacer";
import Divider from "@/components/Divider";
import RowSection from "@/components/RowSection";
import { useNavigation } from "@react-navigation/native";
import { useCallback } from "react";

export default function Settings() {
  const navigation = useNavigation<any>()


  // handlers
  const handleMyProfile = useCallback(() => {
    navigation.navigate('SettingsProfile');
  }, [])

  const handleNotifications = useCallback(() => {

  }, [])

  const handlePaymentMethods = useCallback(() => {
    navigation.navigate('PaymentMethods');
  }, [])


  return <AppSafeAreaView>
    <DrawerToggleHeader>
      <AppText size={'small'}>Settings</AppText>
    </DrawerToggleHeader>
    <RowSectionHeaderSpacer />
    <Divider />

    <RowSection text={'My profile'} handler={handleMyProfile} />
    <Divider />

    <RowSection text={'Notifications'} handler={handleNotifications} />
    <Divider />

    <RowSection text={'Payment Methods'} handler={handlePaymentMethods} />
    <Divider />
  </AppSafeAreaView>
}