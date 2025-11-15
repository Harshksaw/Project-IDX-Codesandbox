import AppSafeAreaView from "@/components/AppSafeAreaView";
import AppText from "@/components/AppText";
import DrawerToggleHeader from "@/components/DrawerToggleHeader";
import RowSectionHeaderSpacer from "@/components/RowSectionHeaderSpacer";
import Divider from "@/components/Divider";
import RowSection from "@/components/RowSection";
import { useNavigation } from "@react-navigation/native";
import { useCallback } from "react";

export default function HelpCenter() {
  const navigation = useNavigation<any>()


  // handlers
  const handleFAQ = useCallback(() => {
    navigation.navigate('HelpCenterFAQ');
  }, []);

  const handleContactSupport = useCallback(() => {
    navigation.navigate('HelpCenterChat');
  }, []);


  return <AppSafeAreaView>
    <DrawerToggleHeader>
      <AppText size={'small'}>Help Center</AppText>
    </DrawerToggleHeader>
    <RowSectionHeaderSpacer />
    <Divider />

    <RowSection text={'FAQ'} handler={handleFAQ} />
    <Divider />

    <RowSection text={'Contact Support'} handler={handleContactSupport} />
    <Divider />
  </AppSafeAreaView>
}