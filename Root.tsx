import AppText from "@/components/AppText";
import { theme, useAuthStore, useStore, version } from "@/globals";
import PhoneInput from "@/screens/auth-updated/PhoneInput";
import VerifyPhone from "@/screens/auth-updated/VerifyPhone";
import VerifyEmail from "@/screens/auth-updated/VerifyEmail";
import CompleteProfile from "@/screens/auth-updated/CompleteProfile";
import ForgotNumber from "@/screens/auth-updated/ForgotNumber";
import UpdatePhone from "@/screens/auth-updated/UpdatePhone";
import BookingBreakdown from "@/screens/booking/BookingBreakdown";
import BookingDetail from "@/screens/booking/BookingDetail";
import BookingMoreDetails from "@/screens/booking/BookingMoreDetails";
import PurchasePolicy from "@/screens/booking/PurchasePolicy";
import QRCode from "@/screens/booking/QRCode";
import HelpCenter from "@/screens/help-center/HelpCenter";
import HelpCenterChat from "@/screens/help-center/HelpCenterChat";
import HelpCenterFAQ from "@/screens/help-center/HelpCenterFAQ";
import HomeLayout from '@/screens/home/HomeLayout';
import Location from "@/screens/home/Location";
import VenueDetail from "@/screens/home/VenueDetail";
import InviteFriends from "@/screens/invite-friends/InviteFriends";
import Legal from "@/screens/legal/Legal";
import LegalPrivacyPolicy from "@/screens/legal/LegalPrivacyPolicy";
import LegalTermsAndConditions from "@/screens/legal/LegalTermsAndConditions";
import Cart from "@/screens/purchase/Cart";
import EventDetail from "@/screens/purchase/EventDetail";
import PurchaseConfirmed from "@/screens/purchase/PurchaseConfirmed";
import RequestOffer from "@/screens/purchase/RequestOffer";
import ServicePurchase from "@/screens/purchase/ServicePurchase";
import Settings from "@/screens/settings/Settings";
import SettingsProfile from "@/screens/settings/SettingsProfile";
import { PaymentMethods } from "@/screens/payment";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  createDrawerNavigator,
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList
} from "@react-navigation/drawer";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useCallback } from "react";
import { StyleSheet, View } from "react-native";


const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();


export default function Root() {
  const userLocation = useStore((state) => state.userLocation);
  const signedIn = useAuthStore(state => state.signedIn);
  const signOut = useAuthStore(state => state.signOut);


  const MainStack = useCallback(() => <Stack.Navigator initialRouteName={userLocation === null ? 'Location' : 'HomeLayout'} screenOptions={{
    headerShown: false
  }}>
    {/* onboarding */}
    <Stack.Screen name='Location' component={Location} />

    {/* home tabs navigation */}
    <Stack.Screen name='HomeLayout' component={HomeLayout} />
    <Stack.Screen name='VenueDetail' component={VenueDetail} />

    {/* purchase flow screens */}
    <Stack.Screen name={'EventDetail'} component={EventDetail} />
    <Stack.Screen name={'ServicePurchase'} component={ServicePurchase} />
    <Stack.Screen name={'RequestOffer'} component={RequestOffer} />
    <Stack.Screen name={'Cart'} component={Cart} />
    <Stack.Screen name={'PurchaseConfirmed'} component={PurchaseConfirmed} options={{ presentation: "fullScreenModal" }} />

    {/* booking info */}
    <Stack.Screen name={'BookingDetail'} component={BookingDetail} />
    <Stack.Screen name={'BookingMoreDetails'} component={BookingMoreDetails} />
    <Stack.Screen name={'BookingBreakdown'} component={BookingBreakdown} />
    <Stack.Screen name={'PurchasePolicy'} component={PurchasePolicy} />
    <Stack.Screen name={'QRCode'} component={QRCode} />

    {/* auth screens */}
    <Stack.Screen name={'PhoneInput'} component={PhoneInput} />
    <Stack.Screen name={'VerifyPhone'} component={VerifyPhone} />
    <Stack.Screen name={'VerifyEmail'} component={VerifyEmail} />
    <Stack.Screen name={'CompleteProfile'} component={CompleteProfile} />
    <Stack.Screen name={'ForgotNumber'} component={ForgotNumber} />
    <Stack.Screen name={'UpdatePhone'} component={UpdatePhone} />
  </Stack.Navigator>, []);


  const SettingsStack = useCallback(() => <Stack.Navigator initialRouteName={'Settings'} screenOptions={{ headerShown: false }}>
    <Stack.Screen name={'Settings'} component={Settings} />
    <Stack.Screen name={'SettingsProfile'} component={SettingsProfile} />
    <Stack.Screen name={'PaymentMethods'} component={PaymentMethods} />
  </Stack.Navigator>, []);


  const HelpDeskStack = useCallback(() => <Stack.Navigator initialRouteName={'HelpCenter'} screenOptions={{ headerShown: false }}>
    <Stack.Screen name={'HelpCenter'} component={HelpCenter} />
    <Stack.Screen name={'HelpCenterFAQ'} component={HelpCenterFAQ} />
    <Stack.Screen name={'HelpCenterChat'} component={HelpCenterChat} />
  </Stack.Navigator>, []);


  const LegalStack = useCallback(() => <Stack.Navigator initialRouteName={'Legal'} screenOptions={{ headerShown: false }}>
    <Stack.Screen name={'Legal'} component={Legal} />
    <Stack.Screen name={'LegalPrivacyPolicy'} component={LegalPrivacyPolicy} />
    <Stack.Screen name={'LegalTermsAndConditions'} component={LegalTermsAndConditions} />
  </Stack.Navigator>, []);


  const DrawerContent = useCallback((props: DrawerContentComponentProps) => {
    return <DrawerContentScrollView style={styles.drawerScrollViewStyle} contentContainerStyle={styles.drawerScrollViewContentContainer} {...props}>
      <DrawerItemList {...props} />
      <DrawerItem
        label={() => <AppText size={'small'}>{signedIn ? 'Sign Out' : 'Log In/Sign Up'}</AppText>}
        onPress={() => {
          if(signedIn) {
            signOut();
            props.navigation.navigate('MainStack');
          }
          else {
            props.navigation.navigate('MainStack');
            props.navigation.navigate('MainStack', { screen: 'PhoneInput' })
            props.navigation.closeDrawer();
          }
        }}
        icon={() => <MaterialCommunityIcons name={signedIn ? 'logout-variant' : 'login-variant'} size={20} color={theme.color.logOut} />}
        style={styles.drawerItemStyle}
      />
      <View style={styles.footerContainer}>
        <AppText font={'din'} size={'small'} color={'secondary'}>Version {version}</AppText>
      </View>
    </DrawerContentScrollView>
  }, [signedIn]);


  return <>
    <Drawer.Navigator
      initialRouteName={'MainStack'}
      screenOptions={{
        headerShown: false,
        drawerType: 'slide',
        drawerStyle: styles.drawerStyle,
        drawerItemStyle: styles.drawerItemStyle,
        drawerActiveBackgroundColor: theme.color.bgTint
      }}
      drawerContent={DrawerContent}
    >
      <Drawer.Screen name={'MainStack'} component={MainStack} options={{
        drawerLabel: () => <AppText size={'small'}>Home</AppText>,
        drawerIcon: () => <MaterialCommunityIcons name={'home-outline'} size={20} color={theme.color.primary} />
      }} />

      <Drawer.Screen name={'SettingsStack'} component={SettingsStack} options={{
        drawerLabel: () => <AppText size={'small'}>Settings</AppText>,
        drawerIcon: () => <MaterialCommunityIcons name={'tune'} size={20} color={theme.color.settings} />
      }} />

      <Drawer.Screen name={'HelpDeskStack'} component={HelpDeskStack} options={{
        drawerLabel: () => <AppText size={'small'}>Help Desk</AppText>,
        drawerIcon: () => <MaterialCommunityIcons name={'phone-ring-outline'} size={20} color={theme.color.helpDesk} />
      }} />

      <Drawer.Screen name={'LegalStack'} component={LegalStack} options={{
        drawerLabel: () => <AppText size={'small'}>Legal</AppText>,
        drawerIcon: () => <MaterialCommunityIcons name={'file-document-multiple-outline'} size={20} color={theme.color.legal} />
      }} />
    </Drawer.Navigator>
  </>
}


const styles = StyleSheet.create({
  drawerScrollViewStyle: {
    height: '100%'
  },
  drawerScrollViewContentContainer: {
    marginTop: 40,
    flex: 1
  },
  drawerStyle: {
    backgroundColor: theme.color.bg,
    flexGrow: 1,
    width: 250
  },
  drawerItemStyle: {
    marginVertical: 12
  },
  footerContainer: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 40
  }
});
