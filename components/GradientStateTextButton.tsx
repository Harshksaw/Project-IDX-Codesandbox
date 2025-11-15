import { Pressable, ViewProps } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "@/globals";
import AppText from "@/components/AppText";

export default function GradientStateTextButton(props: { active: boolean, text: string, onPress: () => void, onPressIn: () => void } & ViewProps) {
  return <Pressable onPress={props.onPress} onPressIn={props.onPressIn} style={{ alignSelf: 'stretch', flexGrow: 1 }}>
    <LinearGradient
      colors={props.active ? [
        '#22C1F3',
        '#14CAF9',
        '#13D9FB',
        '#4BE6F0'
      ] : [theme.color.bg, theme.color.bg]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      {...props}
      style={[{
        borderRadius: theme.radius.standard,
        borderWidth: 1,
        borderColor: props.active ? '#00000000' : theme.color.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'stretch',
        flexGrow: 1
      }, props.style]}
    >
      <AppText size={'small'} font={'heavy'} color={props.active ? 'bgDark' : 'text'}>{props.text}</AppText>
    </LinearGradient>
  </Pressable>
}
