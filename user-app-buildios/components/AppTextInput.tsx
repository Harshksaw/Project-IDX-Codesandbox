import { Pressable, StyleSheet, TextInput, TextInputProps, View } from "react-native";
import { theme } from "@/globals";
import AppText from "@/components/AppText";
import { forwardRef, useCallback, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";


interface AppTextInputProps {
  default?: string,
  placeholder?: string,
  setValue: (value: string) => void // extract text when editing finished
  handleSubmit?: () => void
  inputProps?: TextInputProps,
  errorMessage?: string,
}


export default forwardRef<TextInput, AppTextInputProps>(function AppTextInput(props: AppTextInputProps, ref) {
  const [value, setValue] = useState(props.default ?? '');


  const handleChangeText = useCallback((s: string) => {
    props.setValue(s);
    setValue(s);
  }, []);


  const handleClearInput = useCallback(() => {
    props.setValue(props.default ?? '');
    setValue(props.default ?? '');
  }, []);


  return <View style={styles.container}>
    <View style={styles.inputContainer}>
      <TextInput
        ref={ref}
        style={styles.input}
        value={value}
        onChangeText={handleChangeText}
        cursorColor={theme.color.primary}
        placeholder={props.placeholder}
        placeholderTextColor={theme.color.secondary}
        onSubmitEditing={props.handleSubmit}
        {...props.inputProps}
      />
      {value !== props.default && value !== '' && <Pressable onPress={handleClearInput} style={styles.clearButton} hitSlop={13}>
        <MaterialCommunityIcons name={'close'} color={theme.color.secondary} size={20} />
      </Pressable>}
    </View>
    <AppText size={'small'} color={'textBad'} style={{ height: props.errorMessage === '' ? 0 : undefined }}>{props.errorMessage}</AppText>
  </View>
});


const styles = StyleSheet.create({
  container: {
    alignItems: 'stretch',
    gap: 4
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: theme.color.secondary,
    borderRadius: theme.radius.standard,
    flexDirection: 'row',
  },
  input: {
    flexGrow: 1,
    flexShrink: 1,
    fontFamily: theme.fontFamily.heavy,
    fontSize: theme.fontSize.standard,
    paddingVertical: 16,
    paddingHorizontal: 20,
    color: theme.color.text
  },
  clearButton: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'flex-start'
  }
})