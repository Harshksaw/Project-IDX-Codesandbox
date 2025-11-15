import { View, ViewProps } from "react-native";
import { theme } from "@/globals";

export default function Section(props: { color?: 'primary' | 'secondary' | 'text' } & ViewProps) {
  return <View
    {...props}
    style={[{
      alignSelf: 'stretch',
      paddingVertical: 6,
      paddingHorizontal: 18,
      marginVertical: 12,
      marginLeft: 8,
      marginRight: 10,
      borderLeftWidth: 2,
      borderLeftColor: props.color === 'secondary' ? theme.color.secondary : props.color === 'primary' ? theme.color.primary : theme.color.text
    }, props.style]}
  >
    {props.children}
  </View>
}