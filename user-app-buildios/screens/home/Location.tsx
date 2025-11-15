import { FlatList, Pressable, StyleSheet, View } from "react-native";
import AppText from "@/components/AppText";
import { select, supabase, theme, useStore } from "@/globals";
import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import AppSafeAreaView from "@/components/AppSafeAreaView";
import Toast from "react-native-toast-message";
import { Image } from "expo-image";

export default function Location() {
  const locations = useStore(state => state.locations);
  const setLocations = useStore(state => state.setLocations);
  const setUserLocation = useStore(state => state.setUserLocation);
  const setUserTimezone = useStore(state => state.setUserTimezone);
  const navigation = useNavigation<any>();

  const fetchLocations = async () => {
    const { data, error } = await supabase
      .from('locations')
      .select(select.location);

    if(error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to load locations.'
      });
      return;
    }

    setLocations(data);
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  return <AppSafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
    <View style={styles.root}>
      <View style={styles.logoContainer}>
        <Image style={styles.logo} source={require('assets/images/logo.png')} contentFit='cover' />
      </View>
      <View style={styles.whereContainer}>
        <AppText size='small' font='heavy'>Where to?</AppText>
      </View>
      <View style={styles.divider} />
      <FlatList
        contentContainerStyle={styles.locations}
        data={locations}
        renderItem={({ item }) => <Pressable hitSlop={15} onPress={() => {
          console.log('Location changed, new timezone:', item.timezone);
          setUserLocation(item);
          setUserTimezone(item.timezone);
          navigation.navigate('HomeLayout');
        }}>
          <AppText style={styles.location}>
            {item.name}
          </AppText>
        </Pressable>}
      />
    </View>
  </AppSafeAreaView>
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: theme.color.bg
  },
  root: {
    paddingTop: 20,
    flexGrow: 1,
    paddingHorizontal: 28
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20
  },
  logo: {
    width: 88,
    height: 11.5
  },
  whereContainer: {
    width: '100%',
    height: 55,
    backgroundColor: theme.color.bgTint,
    justifyContent: 'center',
    alignItems: 'center'
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: theme.color.bgBorderMuted,
    marginTop: 40
  },
  locations: {
    gap: 40,
    paddingTop: 40,
    alignItems: 'center',
  },
  location: {

  }
})