import { StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "@/globals";
import AppText from "@/components/AppText";
import { useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import GradientButton from "@/components/GradientButton";

export default function RequiredAuthAlert(props: { titleText?: string, icon?: React.ComponentProps<typeof MaterialCommunityIcons>['name'] }) {
  const navigation = useNavigation<any>();


  // handle sign in
  const handleSignIn = useCallback(() => {
    navigation.navigate('MainStack', { screen: 'PhoneNumber' });
  }, [])


  return <View style={styles.container}>
    <View style={styles.center}>
      <MaterialCommunityIcons name={props.icon ?? 'account-outline'} size={100} color={theme.color.text} />
      <AppText>{props.titleText ?? 'Sign in to access this page.'}</AppText>
    </View>
    <GradientButton onPress={handleSignIn} active={true} style={styles.button}>
      <AppText>Sign in</AppText>
    </GradientButton>
  </View>
}


const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 50
  },
  center: {
    alignSelf: 'center',
    alignItems: 'center',
    gap: 10
  },
  button: {
    alignSelf: 'stretch',
    height: 65,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 18
  }
});