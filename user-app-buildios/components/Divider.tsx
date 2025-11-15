import { theme } from "@/globals";
import { View, ViewProps } from "react-native";

export default function Divider(props: ViewProps) {
  return <View
    {...props}
    style={[{
      marginHorizontal: 18,
      borderTopWidth: 1,
      borderTopColor: theme.color.bgBorder
    }, props.style]}
  />
}