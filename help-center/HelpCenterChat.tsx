import AppSafeAreaView from "@/components/AppSafeAreaView";
import Header from "@/components/Header";
import { useNavigation } from "@react-navigation/native";

export default function HelpCenterChat() {
  const navigation = useNavigation<any>();


  return <AppSafeAreaView>
    <Header title={'Support Chat'} leftButtonHandler={() => navigation.goBack()} leftButton={'chevron-left'} />
  </AppSafeAreaView>
}