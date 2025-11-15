import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, View } from "react-native";
import { theme, useStore } from "@/globals";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AppText from "@/components/AppText";
import { Image } from "expo-image";
import Events from './Events';
import Venues from "./Venues";
import Bookings from "./Bookings";
import Offers from "./Offers";
import { useNavigation } from "@react-navigation/native";
import AppSafeAreaView from "@/components/AppSafeAreaView";
import DrawerToggleHeader from "@/components/DrawerToggleHeader";
import Search from "@/screens/home/Search";


const Tab = createBottomTabNavigator();

export default function HomeLayout() {
  const navigation = useNavigation<any>();
  const userLocation = useStore(state => state.userLocation);


  return (
    <AppSafeAreaView style={styles.safeArea}>
      {/* top header bar, with hamburger menu, logo, and location */}
      <DrawerToggleHeader bottomLine>
        <View style={styles.topBarMiddle}>
          <Image style={styles.logo} source={require('assets/images/logo.png')} contentFit='cover' />
          <Pressable style={styles.locationContainer} hitSlop={15} onPress={() => navigation.navigate({ name: 'Location' })}>
            <View style={styles.locationLeftBalancer} />
            <AppText font='heavy' size='small'>{userLocation === null ? 'No Location' : userLocation.name}</AppText>
            <Image style={styles.locationDropArrow} source={require('assets/images/expand_arrow.png')} contentFit='cover' />
          </Pressable>
        </View>
      </DrawerToggleHeader>

      {/* main tab navigation */}
      <Tab.Navigator
        initialRouteName='Events'
        screenOptions={{
          headerShown: false,
          tabBarLabelStyle: styles.tabLabel,
          tabBarLabelPosition: 'below-icon',
          tabBarStyle: styles.tabBar
        }}
      >
        <Tab.Screen name='Events' component={Events} options={{
          tabBarLabel: ({ focused }) => <AppText size='small' font={focused ? 'heavy' : 'medium'} color={focused ? 'text' : 'secondary'}>Events</AppText>,
          tabBarIcon: ({ focused }) => <MaterialCommunityIcons  name='calendar-outline' size={20} color={focused ? theme.color.primary : theme.color.secondary} />
        }} />

        <Tab.Screen name='Venues' component={Venues} options={{
          tabBarLabel: ({ focused }) => <AppText size='small' font={focused ? 'heavy' : 'medium'} color={focused ? 'text' : 'secondary'}>Venues</AppText>,
          tabBarIcon: ({ focused }) => <MaterialCommunityIcons  name='store-outline' size={20} color={focused ? theme.color.primary : theme.color.secondary} />
        }} />

        {/* <Tab.Screen name='Search' component={Search} options={{
          tabBarLabel: ({ focused }) => <AppText size='small' font={focused ? 'heavy' : 'medium'} color={focused ? 'text' : 'secondary'}>Search</AppText>,
          tabBarIcon: ({ focused }) => <MaterialCommunityIcons  name='magnify' size={20} color={focused ? theme.color.primary : theme.color.secondary} />
        }} />

        <Tab.Screen name='Offers' component={Offers} options={{
          tabBarLabel: ({ focused }) => <AppText size='small' font={focused ? 'heavy' : 'medium'} color={focused ? 'text' : 'secondary'}>Offers</AppText>,
          tabBarIcon: ({ focused }) => <MaterialCommunityIcons  name='message-text-outline' size={20} color={focused ? theme.color.primary : theme.color.secondary} />
        }} /> */}

        <Tab.Screen name='Bookings' component={Bookings} options={{
          tabBarLabel: ({ focused }) => <AppText size='small' font={focused ? 'heavy' : 'medium'} color={focused ? 'text' : 'secondary'}>Bookings</AppText>,
          tabBarIcon: ({ focused }) => <MaterialCommunityIcons  name='ticket-confirmation-outline' size={20} color={focused ? theme.color.primary : theme.color.secondary} />
        }} />
      </Tab.Navigator>
    </AppSafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: theme.color.bg
  },
  topBarMiddle: {
    alignItems: 'center',
    gap: 3
  },
  logo: {
    width: 88,
    height: 11.5
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  locationLeftBalancer: {
    width: 9
  },
  location: {

  },
  locationDropArrow: {
    width: 9,
    height: 4
  },
  tabBar: {
    backgroundColor: theme.color.bg,
    borderTopWidth: 1,
    borderTopColor: theme.color.bgBorder,
    height: 62,
    paddingTop: 7,
    paddingBottom: 7
  },
  tabLabel: {
    fontSize: theme.fontSize.small
  },
  iconActive: {
    color: theme.color.primary
  },
  iconInactive: {
    color: theme.color.secondary
  }
})