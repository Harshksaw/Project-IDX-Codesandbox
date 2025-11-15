import { Text, TextProps } from 'react-native';
import { theme } from "@/globals";

export default function AppText(props: {
  size?: 'small' | 'standard' | 'large' | 'larger',
  color?: 'text' | 'secondary' | 'primary' | 'bgDark' | 'textBad' | 'textPayment' | 'blueLink',
  font?: 'medium' | 'heavy' | 'black' | 'din',
  preset?: 'secondary header'
} & TextProps) {
  return <Text
    {...props}
    style={[
      {
        fontSize: props.size === 'small' ? theme.fontSize.small : props.size === 'larger' ? theme.fontSize.larger : props.size === 'large' ? theme.fontSize.large : theme.fontSize.standard,
        color: props.color === 'secondary' ? theme.color.secondary : props.color === 'primary' ? theme.color.primary : props.color === 'bgDark' ? theme.color.bgDark : props.color === 'textBad' ? theme.color.textBad : props.color === 'textPayment' ? theme.color.textPayment : props.color === 'blueLink' ? theme.color.blueLink : theme.color.text,
        fontFamily: props.font === 'heavy' ? theme.fontFamily.heavy : props.font === 'black' ? theme.fontFamily.black : props.font === 'din' ?theme.fontFamily.din : theme.fontFamily.medium
      },
      props.preset === 'secondary header' ? {
        fontSize: theme.fontSize.small,
        color: theme.color.secondary,
        marginTop: 12,
        marginHorizontal: 20
      } : {},
      props.style
    ]}
  >
    {props.children}
  </Text>
}