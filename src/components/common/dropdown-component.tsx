// components/CustomPicker.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Modal from 'react-native-modal';
import { Check } from 'lucide-react-native';

interface PickerItem {
  label: string;
  value: string | number;
}

interface CustomPickerProps {
  label?: string;
  items: PickerItem[];
  selectedValue: string | number;
  onValueChange: (value: string | number) => void;
  placeholder?: string;
  style?: string; // Tailwind classes for outer container
  error?: string; // Error message
}

const CustomPicker: React.FC<CustomPickerProps> = ({
  label,
  items,
  selectedValue,
  onValueChange,
  placeholder = 'Select an option',
  style = '',
  error,
}) => {
  const [visible, setVisible] = useState(false);

  const selectedLabel =
    items.find((i) => i.value === selectedValue)?.label || placeholder;

  const handleSelect = (val: string | number) => {
    onValueChange(val);
    setVisible(false);
  };

  const borderColor = error ? 'border-red-500' : 'border-[#EBEBEB]';

  return (
    <View className={`mb-4 px-2 ${style}`}>
      {label && (
        <Text className="text-gray-700 text-sm font-medium mb-1">{label}</Text>
      )}

      {/* Trigger button (looks like an input) */}
      <TouchableOpacity
        onPress={() => setVisible(true)}
        activeOpacity={0.8}
        className={`h-[50px] border ${borderColor} rounded-full bg-white flex-row items-center justify-between px-4`}
      >
        <Text
          className={`text-base ${
            selectedValue ? 'text-gray-900' : 'text-gray-400'
          }`}
        >
          {selectedLabel}
        </Text>
        <Text className="text-gray-500 text-lg">▼</Text>
      </TouchableOpacity>

      {/* Error message */}
      {error && (
        <Text className="text-red-500 text-sm mt-1 ml-3">{error}</Text>
      )}

      {/* Identical modal on both platforms */}
      <Modal
        isVisible={visible}
        backdropColor="rgba(0,0,0,0.5)"
        backdropOpacity={0.6}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        onBackdropPress={() => setVisible(false)}
        onBackButtonPress={() => setVisible(false)}
        style={styles.modal}
        avoidKeyboard
      >
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Select an option</Text>
            <TouchableOpacity onPress={() => setVisible(false)}>
              <Text style={styles.cancel}>Cancel</Text>
            </TouchableOpacity>
          </View>

          {items.map((it, idx) => (
              <Pressable className='flex-row p-2 border mb-2 border-gray-200 rounded-lg items-center justify-between' key={idx} onPress={()=>handleSelect(it.value)}>
                <Text className='text-[16px] font-[Kanit-Regular]' >{it.label}</Text>
                <Check size={20} color="#666666" style={{ opacity: selectedValue === it.value ? 1 : 0 }} />
                {/* <Text>{it.value}</Text> */}
              </Pressable>
            ))}

          {/* Native picker */}
          {/* <Picker
            selectedValue={selectedValue}
            onValueChange={handleSelect}
            style={styles.picker}
            dropdownIconColor="#6b7280"
          >
            {placeholder && (
              <Picker.Item label={placeholder} value="" color="#9ca3af" />
            )}
            {items.map((it, idx) => (
              <Picker.Item
                key={idx}
                label={it.label}
                value={it.value}
                color="#1f2937"
              />
            ))}
          </Picker> */}

          {/* Done bar (iOS habit) – hidden on Android if you want pure native */}
          {Platform.OS === 'ios' && (
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => setVisible(false)}
            >
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modal: { margin: 0, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: { fontSize: 18, fontWeight: '600', color: '#1f2937' },
  cancel: { fontSize: 16, color: '#6b7280', fontWeight: '500' },
  picker: { width: '100%', height: 180 },
  doneButton: {
    backgroundColor: '#3b82f6',
    marginTop: 8,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  doneText: { color: 'white', fontSize: 16, fontWeight: '600' },
});

export default CustomPicker;