import { Pressable, StyleSheet } from "react-native";
import AppText from "@/components/AppText";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "@/globals";

export default function RowSection(props: { text: string, handler: () => void }) {
  return <Pressable onPress={props.handler} style={styles.container}>
    <AppText size={'small'}>{props.text}</AppText>
    <MaterialCommunityIcons name={'chevron-right'} size={24} color={theme.color.secondary} />
  </Pressable>
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 30,
    marginRight: 20,
    height: 70
  }
})