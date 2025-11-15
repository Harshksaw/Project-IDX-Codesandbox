import { ReactNode, useCallback } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { theme } from "@/globals";
import { useNavigation } from "@react-navigation/native";

export default function DrawerToggleHeader(props: { bottomLine?: boolean, children?: ReactNode }) {
  const navigation = useNavigation<any>();


  const handleToggleDrawer = useCallback(() => {
    navigation.toggleDrawer();
  }, []);


  return <View style={[styles.topBar, props.bottomLine ? styles.topBarBottomLine : null]}>
    <Pressable style={styles.hamburger} onPress={handleToggleDrawer} hitSlop={10}>
      <View style={styles.hamburgerSlice} />
      <View style={styles.hamburgerSlice} />
      <View style={styles.hamburgerSlice} />
    </Pressable>
    {props.children}
    <View style={styles.topBarRightBalancer} />
  </View>
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theme.color.bg,
    paddingHorizontal: 18,
    paddingVertical: 10,
    height: 50,
    alignSelf: 'stretch',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.color.bg
  },
  topBarBottomLine: {
    borderBottomColor: theme.color.bgBorder
  },
  hamburger: {
    color: theme.color.secondary,
    width: 21,
    height: 16,
    justifyContent: 'space-between'
  },
  hamburgerSlice: {
    borderTopWidth: 2,
    borderTopColor: theme.color.hamburgerIconColor
  },
  topBarRightBalancer: {
    width: 21
  },
})