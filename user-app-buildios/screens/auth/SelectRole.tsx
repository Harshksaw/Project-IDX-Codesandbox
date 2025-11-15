import { StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AppSafeAreaView from "@/components/AppSafeAreaView";
import Header from "@/components/Header";
import GradientButton from "@/components/GradientButton";
import AppText from "@/components/AppText";
import { useAuthFlowStore } from "@/globals";

export default function SelectRole() {
  const navigation = useNavigation<any>();
  const setRole = useAuthFlowStore(state => state.setRole);

  const chooseUser = () => {
    setRole('user');
    navigation.navigate('PhoneNumber');
  };

  const chooseVendor = () => {
    setRole('vendor');
    navigation.navigate('Email');
  };

  const chooseAdmin = () => {
    setRole('super-admin');
    navigation.navigate('Email');
  };

  return (
    <AppSafeAreaView>
      <Header title="" leftButton="chevron-left" leftButtonHandler={() => navigation.goBack()} />
      <View style={styles.container}>
        <AppText size="large" font="black" style={styles.subtitle}>Log in as</AppText>
        <GradientButton style={styles.button} onPress={chooseUser} active={true}>
          <AppText font="heavy">User</AppText>
        </GradientButton>
        <GradientButton style={styles.button} onPress={chooseVendor} active={true}>
          <AppText font="heavy">Vendor</AppText>
        </GradientButton>
        <GradientButton style={styles.button} onPress={chooseAdmin} active={true}>
          <AppText font="heavy">Super Admin</AppText>
        </GradientButton>
      </View>
    </AppSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 26,
    gap: 20,
  },
  subtitle: {
    marginBottom: 20,
  },
  button: {
    alignSelf: 'stretch',
    height: 65,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
