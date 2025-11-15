import { theme } from '@/globals';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import AppText from './AppText';

interface QuantityDropdownProps {
  value: number;
  setValue: (value: number) => void;
  minCount: number;
  maxCount: number;
}

export default function QuantityDropdown({ value, setValue, minCount, maxCount }: QuantityDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Generate array of available quantities
  const quantities = Array.from(
    { length: maxCount - minCount + 1 }, 
    (_, i) => minCount + i
  );

  return (
    <View style={styles.container}>
      <Pressable 
        style={styles.dropdownButton} 
        onPress={() => setIsOpen(true)}
      >
        <AppText style={styles.dropdownText}>{value}</AppText>
        <MaterialCommunityIcons 
          name="chevron-down" 
          size={16} 
          color={theme.color.text} 
        />
      </Pressable>

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="none"
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pickerContainer}>
            <AppText style={styles.modalTitle} size={'small'} font={'heavy'}>
              Select Quantity
            </AppText>
            <Picker
              selectedValue={value}
              onValueChange={(itemValue) => {
                setValue(itemValue);
              }}
              style={styles.picker}
            >
              {quantities.map((quantity) => (
                <Picker.Item 
                  key={quantity} 
                  label={quantity.toString()} 
                  value={quantity}
                  color={theme.color.text}
                />
              ))}
            </Picker>
                         <Pressable 
               style={styles.doneButton}
               onPress={() => setIsOpen(false)}
             >
               <AppText size={'small'} font={'heavy'} color={'text'}>
                 Select
               </AppText>
             </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 60,
  },
  dropdownButton: {
    backgroundColor: theme.color.bgDark,
    borderWidth: 1,
    borderColor: theme.color.secondary,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 36,
  },
  dropdownText: {
    color: theme.color.text,
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    backgroundColor: theme.color.bg,
    borderRadius: 12,
    padding: 20,
    minWidth: 200,
    maxHeight: 300,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.color.secondary,
  },
  modalTitle: {
    marginBottom: 15,
    color: theme.color.text,
  },
  picker: {
    color: theme.color.text,
    width: 150,
  },
  doneButton: {
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: theme.color.primary,
    borderWidth: 1,
    borderColor: theme.color.text,
  },
});
