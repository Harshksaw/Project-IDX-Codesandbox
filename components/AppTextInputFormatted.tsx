import { Pressable, StyleSheet, TextInput, TextInputProps, View } from "react-native";
import { theme } from "@/globals";
import AppText from "@/components/AppText";
import { forwardRef, useCallback, useMemo, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";


interface AppTextInputFormattedProps {
  maxLength: number,
  default?: string,
  handleRaw: (rawInput: string) => string // given raw input, return the string that should be displayed. this should also be where your own setters to extract value should be
  handleSubmit?: () => void
  inputProps?: TextInputProps,
  errorMessage?: string,
  contextMessage?: string, // if there is no error, show context message in grey color
  placeholder?: string
}


export default forwardRef<TextInput, AppTextInputFormattedProps>(function AppTextInputFormatted(props, ref) {
  const defaultValue = useMemo(() => props.handleRaw(props.default ?? ''), [props.handleRaw, props.default]);
  const [rawValue, setRawValue] = useState(defaultValue);
  const [formattedValue, setFormattedValue] = useState(defaultValue);


  const handleOnChangeText = useCallback((s: string) => {
    const formatted = props.handleRaw(s);
    setRawValue(formatted);
    setFormattedValue(formatted);
  }, []);


  const handleClearInput = useCallback(() => {
    // can't use memo'd value in case props.handleRaw needs to update state outside this component
    const recalculatedValue = props.handleRaw(props.default ?? '');
    setRawValue(recalculatedValue);
    setFormattedValue(recalculatedValue);
  }, []);


  return <View style={styles.container}>
    <View>
      <View style={styles.inputContainer}>
        <TextInput
          maxLength={props.maxLength}
          style={styles.input}
          value={rawValue}
          onChangeText={handleOnChangeText}
          cursorColor={theme.color.primary}
          onSubmitEditing={props.handleSubmit}
          multiline={false}
          ref={ref}
          {...props.inputProps}
        />
      </View>
      <View pointerEvents={'none'}>
        <AppText style={[styles.text, props.placeholder && props.placeholder.length !== 0 && formattedValue === '' ? styles.textPlaceholder : null]} selectable={false}>
          {props.placeholder && props.placeholder.length !== 0 && formattedValue === '' ? props.placeholder : formattedValue}
        </AppText>
      </View>
      {rawValue !== defaultValue && <Pressable onPress={handleClearInput} style={styles.clearButton} hitSlop={13}>
        <MaterialCommunityIcons name={'close'} color={theme.color.secondary} size={20} />
      </Pressable>}
    </View>
    <AppText
      size={"small"}
      color={props.errorMessage && props.errorMessage.length !== 0 ? "textBad" : "secondary"}
      style={{height: props.errorMessage === "" && !props.contextMessage ? 0 : undefined}}
    >
      {(props.errorMessage && props.errorMessage.length !== 0) ? props.errorMessage : props.contextMessage}
    </AppText>
  </View>
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'stretch',
    gap: 4
  },
  inputContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'flex-start'
  },
  input: {
    color: 'transparent',
    fontSize: theme.fontSize.standard,
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontFamily: theme.fontFamily.heavy
  },
  text: {
    borderWidth: 1,
    borderColor: theme.color.secondary,
    borderRadius: theme.radius.standard,
    fontFamily: theme.fontFamily.heavy,
    paddingVertical: 16,
    paddingHorizontal: 20
  },
  textPlaceholder: {
    color: theme.color.secondary
  },
  clearButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 40,
    justifyContent: 'center',
    alignItems: 'flex-start'
  }
})