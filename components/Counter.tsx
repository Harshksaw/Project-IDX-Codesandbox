import { Pressable, StyleSheet, TextInput, View, ViewProps } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { theme } from "@/globals";
import AppText from "@/components/AppText";
import { useEffect, useState } from "react";

export default function Counter(props: { value: number, setValue: (value: number | ((prev: number) => number)) => void, minCount: number, maxCount: number } & ViewProps) {
  const [inputValue, setInputValue] = useState(`${props.value}`);

  useEffect(() => {
    setInputValue(String(props.value));
  }, [props.value]);

  const handleInput = (s: string) => {
    const numeric = s.replace(/[^0-9]/g, "");
    if(numeric === "") {
      setInputValue("" + props.minCount);
      props.setValue(props.minCount);
      return;
    }

    let num = parseInt(numeric, 10);
    if(num > props.maxCount) num = props.maxCount;
    if(num < props.minCount) num = props.minCount;
    setInputValue(String(num));
    props.setValue(num);
  };

  return <View {...props} style={[styles.container, props.style]}>
    <Pressable onPress={() => {
      if(props.value > props.minCount) {
        props.setValue(prev => prev - 1);
      }
    }} hitSlop={10}>
      <MaterialCommunityIcons name={'minus'} size={16} color={props.value === props.minCount ? 'transparent' : theme.color.secondary} />
    </Pressable>
    <TextInput
      style={styles.input}
      keyboardType={'number-pad'}
      value={inputValue}
      onChangeText={handleInput}
    />
    <Pressable onPress={() => {
      if(props.value < props.maxCount) {
        props.setValue(prev => prev + 1)
      }
    }} hitSlop={10}>
      <MaterialCommunityIcons name={'plus'} size={16} color={props.value === props.maxCount ? 'transparent' : theme.color.secondary} />
    </Pressable>
  </View>
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  input: {
    height: 30,
    minWidth: 50
  }
})
