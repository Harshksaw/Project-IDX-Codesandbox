import AppSafeAreaView from "@/components/AppSafeAreaView";
import AppText from "@/components/AppText";
import DrawerToggleHeader from "@/components/DrawerToggleHeader";
import RowSectionHeaderSpacer from "@/components/RowSectionHeaderSpacer";
import Divider from "@/components/Divider";
import RowSection from "@/components/RowSection";
import { useNavigation } from "@react-navigation/native";
import { useCallback } from "react";

export default function InviteFriends() {
  const navigation = useNavigation<any>()


  // handlers
  const handle = useCallback(() => {
    console.log('Handle')
  }, [])


  return <AppSafeAreaView>
    <DrawerToggleHeader>
      <AppText size={'small'}>Invite Friends</AppText>
    </DrawerToggleHeader>
    <RowSectionHeaderSpacer />
    <Divider />

    <RowSection text={'test'} handler={handle} />
    <Divider />
  </AppSafeAreaView>
}