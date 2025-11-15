import { Pressable, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AppText from "./AppText";
import { theme } from "@/globals";

export default function Header(props: {
  title: string,
  leftButtonHandler?: () => void,
  leftButton?: React.ComponentProps<typeof MaterialCommunityIcons>['name'],
  rightButtonHandler?: () => void,
  rightButton?: React.ComponentProps<typeof MaterialCommunityIcons>['name']
}) {

  if((props.leftButtonHandler === undefined) !== (props.leftButton === undefined)) {
    console.error('Both leftButtonHandler and leftButton must be defined, or they must both be undefined');
  }
  else if((props.rightButtonHandler === undefined) !== (props.rightButton === undefined)) {
    console.error('Both rightButtonHandler and rightButton must be defined, or they must both be undefined');
  }

  return <View style={{
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
    backgroundColor: theme.color.bg,
    flexDirection: 'row',
    paddingHorizontal: 18
  }}>
    {
      props.leftButton === undefined
        ? <View style={{ width: 20}} />
        : <Pressable onPress={props.leftButtonHandler} hitSlop={10}>
            <MaterialCommunityIcons name={props.leftButton} color={theme.color.text} size={20} />
          </Pressable>
    }

    <AppText size={'small'} font={'heavy'}>{props.title}</AppText>

    {
      props.rightButton === undefined
      ? <View style={{ width: 20}} />
      : <Pressable onPress={props.rightButtonHandler} hitSlop={10}>
          <MaterialCommunityIcons name={props.rightButton} color={theme.color.text} size={20} />
        </Pressable>
    }
  </View>
}