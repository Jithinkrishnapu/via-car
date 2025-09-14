// components/CustomPicker.tsx
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';

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
  style?: string; // Tailwind classes
}

const CustomPicker: React.FC<CustomPickerProps> = ({
  label,
  items,
  selectedValue,
  onValueChange,
  placeholder = 'Select an option',
  style = '',
}) => {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <View className={`mb-4 px-2 ${style}`}>
      {label ? (
        <Text className="text-gray-700 text-sm font-medium mb-1">{label}</Text>
      ) : null}

      <View className="h-[50px] border border-[#EBEBEB] rounded-full  bg-white">
        <Picker
          selectedValue={selectedValue}
          onValueChange={(itemValue) => onValueChange(itemValue)}
          mode="dropdown"
          style={{ height: 50 }}
          dropdownIconColor="#6b7280"
        >
          {placeholder ? (
            <Picker.Item
              label={placeholder}
              value=""
              color="#9ca3af"
              style={{ color: '#9ca3af' }}
            />
          ) : null}
          {items.map((item, index) => (
            <Picker.Item
              key={index}
              label={item.label}
              value={item.value}
              color="#1f2937"
            />
          ))}
        </Picker>
      </View>
    </View>
  );
};

export default CustomPicker;