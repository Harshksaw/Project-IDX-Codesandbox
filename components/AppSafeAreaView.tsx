import { StyleSheet } from 'react-native';
import { SafeAreaView, SafeAreaViewProps } from "react-native-safe-area-context";

export default function AppSafeAreaView(props: SafeAreaViewProps) {
  return <SafeAreaView {...props} style={[styles.view, props.style]}>
    {props.children}
  </SafeAreaView>
}

const styles = StyleSheet.create({
  view: {
    width: '100%',
    height: '100%',
    flexGrow: 1
  }
})