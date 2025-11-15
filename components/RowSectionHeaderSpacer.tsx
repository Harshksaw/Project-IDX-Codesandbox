import { StyleSheet, View } from "react-native";

export default function RowSectionHeaderSpacer() {
  return <View style={styles.spacer} />
}

const styles = StyleSheet.create({
  spacer: {
    height: 30
  }
})