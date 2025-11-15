import Modal from 'react-native-modal';
import { Dimensions, Pressable, ScrollView, StyleSheet, View, ViewProps } from "react-native";
import { theme } from "@/globals";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRef, useState } from "react";

export default function BottomSlideOver(props: { show: boolean, setShow: (prev: boolean) => void, title?: string } & ViewProps) {
  const { height } = Dimensions.get('screen');
  const [scrollOffset, setScrollOffset] = useState(0);
  const [maxScrollOffset, setMaxScrollOffset] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  return <Modal
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
    scrollOffset={scrollOffset}
    scrollOffsetMax={maxScrollOffset}
    style={{
      margin: 0,
      justifyContent: 'flex-end',
    }}
  >
    <View style={[styles.container, props.style]}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.body}
        onScroll={e => {
          setScrollOffset(e.nativeEvent.contentOffset.y);
          if(maxScrollOffset === 0) {
            setMaxScrollOffset(e.nativeEvent.contentSize.height - e.nativeEvent.layoutMeasurement.height)
          }
        }}
        scrollEventThrottle={16}
      >
        {props.children}
      </ScrollView>
      <Pressable style={styles.icon}  onPress={() => props.setShow(false)}>
        <MaterialCommunityIcons name={'close'} size={20} color={theme.color.text} />
      </Pressable>
    </View>
  </Modal>
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.color.bgDark,
    borderTopLeftRadius: theme.radius.big,
    borderTopRightRadius: theme.radius.big,
    alignItems: 'stretch'
  },
  icon: {
    position: 'absolute',
    top: 18,
    right: 24,
    width: 20,
    height: 20,
  },
  body: {
    maxHeight: 500,
    minHeight: 200
  }
});