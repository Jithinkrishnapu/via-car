// components/CustomPicker.tsx
import React, { useState } from 'react';
import { View, Text, Platform, TouchableOpacity, StyleSheet } from 'react-native';
import {Picker} from '@react-native-picker/picker';
import Modal from 'react-native-modal';

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
  style?: string; // Tailwind classes (for container)
}

const CustomPicker: React.FC<CustomPickerProps> = ({
  label,
  items,
  selectedValue,
  onValueChange,
  placeholder = 'Select an option',
  style = '',
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Get selected label for display
  const selectedLabel = items.find(item => item.value === selectedValue)?.label || placeholder;

  // Handle selection and close modal
  const handleSelect = (itemValue: string | number) => {
    onValueChange(itemValue);
    setIsModalVisible(false);
  };

  return (
    <View className={`mb-4 px-2 ${style}`}>
      {label && (
        <Text className="text-gray-700 text-sm font-medium mb-1">{label}</Text>
      )}

      {/* Display Button / Input Field (looks like input) */}
      <TouchableOpacity
        onPress={() => setIsModalVisible(true)}
        activeOpacity={0.8}
        className="h-[50px] border border-[#EBEBEB] rounded-full bg-white flex-row items-center justify-between px-4"
      >
        <Text
          style={{
            color: selectedValue ? '#1f2937' : '#9ca3af',
            fontSize: 16,
          }}
        >
          {selectedLabel}
        </Text>
        <Text style={{ color: '#6b7280', fontSize: 18 }}>▼</Text>
      </TouchableOpacity>

      {/* iOS Modal Picker (Full Screen Alert Style) */}
      {Platform.OS === 'ios' && (
        <Modal
          isVisible={isModalVisible}
          backdropColor="rgba(0, 0, 0, 0.5)"
          backdropOpacity={0.6}
          animationIn="slideInUp"
          animationOut="slideOutDown"
          onBackdropPress={() => setIsModalVisible(false)}
          onBackButtonPress={() => setIsModalVisible(false)}
          style={styles.modal}
          avoidKeyboard
        >
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Select an Option</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <Picker
              selectedValue={selectedValue}
              onValueChange={handleSelect}
              style={styles.picker}
              dropdownIconColor="#6b7280"
            >
              {placeholder && (
                <Picker.Item
                  label={placeholder}
                  value=""
                  color="#9ca3af"
                />
              )}
              {items.map((item, index) => (
                <Picker.Item
                  key={index}
                  label={item.label}
                  value={item.value}
                  color="#1f2937"
                />
              ))}
            </Picker>

            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}

      {/* Android: Normal Picker (Dropdown) */}
      {Platform.OS === 'android' && isModalVisible && (
        <Picker
          selectedValue={selectedValue}
          onValueChange={handleSelect}
          mode="dropdown"
          dropdownIconColor="#6b7280"
          style={styles.androidPicker}
        >
          {placeholder && (
            <Picker.Item
              label={placeholder}
              value=""
              color="#9ca3af"
            />
          )}
          {items.map((item, index) => (
            <Picker.Item
              key={index}
              label={item.label}
              value={item.value}
              color="#1f2937"
            />
          ))}
        </Picker>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  cancelText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  picker: {
    height: 200,
    width: '100%',
    marginBottom: 20,
  },
  doneButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  doneButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  androidPicker: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
});

export default CustomPicker;