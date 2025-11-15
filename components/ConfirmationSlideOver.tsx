import { Dimensions, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRef, useState } from "react";
import Modal from "react-native-modal";
import { theme } from "@/globals";
import AppText from "@/components/AppText";
import { MaterialCommunityIcons } from "@expo/vector-icons";


type ButtonVariant = 'primary' | 'bad' | 'secondary';

export default function ConfirmationSlideOver(props: { show: boolean, setShow: (show: boolean) => void, title: string, body: string, leftButtonHandle?: () => void, rightButtonHandle: () => void, leftButtonText: string, leftButtonVariant?: ButtonVariant, rightButtonText: string, rightButtonVariant?: ButtonVariant }) {
  const { height } = Dimensions.get('screen');
  const scrollViewRef = useRef<ScrollView>(null);
  const [leftButtonActive, setLeftButtonActive] = useState(false);
  const [rightButtonActive, setRightButtonActive] = useState(false);


  return (
    <Modal
      isVisible={props.show}
      useNativeDriverForBackdrop
      onBackdropPress={() => props.setShow(false)}
      onSwipeComplete={() => props.setShow(false)}
      swipeDirection={["down", 'down']}
      deviceHeight={height}
      statusBarTranslucent
      backdropColor={theme.color.bg}
      propagateSwipe={true}
      scrollTo={p => {
        if(scrollViewRef.current) {
          scrollViewRef.current.scrollTo(p)
        }
      }}
      style={styles.modal}
    >
      <View style={styles.container}>
        <View style={styles.title}>
          <AppText size={'small'} color={'secondary'}>{props.title}</AppText>
        </View>

        <View style={styles.body}>
          <AppText size={'small'}>{props.body}</AppText>
        </View>

        <View style={styles.bottom}>
          <Pressable onPressIn={() => setLeftButtonActive(true)} onPressOut={() => setLeftButtonActive(false)} style={[styles.button, props.leftButtonVariant === 'primary' ? styles.buttonPrimary : props.leftButtonVariant === 'bad' ? styles.buttonBad : styles.buttonSecondary, leftButtonActive ? (props.leftButtonVariant === 'primary' ? styles.buttonPrimaryActive : props.leftButtonVariant === 'bad' ? styles.buttonBadActive : styles.buttonSecondaryActive) : null]} onPress={props.leftButtonHandle ?? (() => props.setShow(false))}>
            <AppText size={'small'} color={leftButtonActive ? 'bgDark' : 'text'}>{props.leftButtonText}</AppText>
          </Pressable>
          <Pressable onPressIn={() => setRightButtonActive(true)} onPressOut={() => setRightButtonActive(false)} style={[styles.button, props.rightButtonVariant === 'secondary' ? styles.buttonSecondary : props.rightButtonVariant === 'bad' ? styles.buttonBad : styles.buttonPrimary, rightButtonActive ? (props.rightButtonVariant === 'secondary' ? styles.buttonSecondaryActive : props.rightButtonVariant === 'bad' ? styles.buttonBadActive : styles.buttonPrimaryActive) : null]} onPress={props.rightButtonHandle}>
            <AppText size={'small'} color={rightButtonActive ? 'bgDark' : 'text'}>{props.rightButtonText}</AppText>
          </Pressable>
        </View>

        <Pressable style={styles.icon} onPress={() => props.setShow(false)}>
          <MaterialCommunityIcons name={'close'} size={20} color={theme.color.text} />
        </Pressable>
      </View>
    </Modal>
  )
}


const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: theme.color.bgDark,
    borderTopLeftRadius: theme.radius.big,
    borderTopRightRadius: theme.radius.big,
    alignItems: 'stretch',
    paddingHorizontal: 18,
    paddingVertical: 15,
    gap: 15
  },
  title: {
    alignSelf: 'center'
  },
  body: {
    minHeight: 60
  },
  bottom: {
    flexDirection: 'row',
    gap: 20
  },
  button: {
    flex: 1,
    borderRadius: theme.radius.standard,
    borderWidth: 1,
    justifyContent: 'center',
    height: 40,
    alignItems: 'center'
  },
  buttonSecondary: {
    borderColor: theme.color.secondary,
  },
  buttonSecondaryActive: {
    backgroundColor: theme.color.secondary
  },
  buttonPrimary: {
    borderColor: theme.color.primary
  },
  buttonPrimaryActive: {
    backgroundColor: theme.color.primary
  },
  buttonBad: {
    borderColor: theme.color.textBad
  },
  buttonBadActive: {
    backgroundColor: theme.color.textBad
  },
  icon: {
    position: 'absolute',
    top: 15,
    right: 18,
    width: 20,
    height: 20,
  },
});