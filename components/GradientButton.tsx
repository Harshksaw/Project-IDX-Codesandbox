import { LinearGradient } from "expo-linear-gradient";
import { theme } from "@/globals";
import { Pressable, ViewProps } from "react-native";
import { useState } from "react";

export default function GradientButton(props: {
  onPress: () => void,
  active: boolean
} & ViewProps) {
  const [depressed, setDepressed] = useState(false);

  return <Pressable onPress={props.onPress} onPressIn={() => setDepressed(true)} onPressOut={() => setDepressed(false)}>
    <LinearGradient
      colors={[
        '#12497E',
        '#239BE7'
      ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      {...props}
      style={[{
        borderRadius: theme.radius.standard,
        opacity: !props.active ? 0.35 : depressed ? 0.8 : 1
      }, props.style]}
    >
      {props.children}
    </LinearGradient>
  </Pressable>
}