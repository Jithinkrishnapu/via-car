// components/DobPicker.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';

type DobPickerProps = {
  label?: string;
  onDateChange: (date: Date, formattedDate: string) => void;
  errorMessage?: string;
  minimumAge?: number; // e.g., 18
  initialDate:any
};

const DEFAULT_MIN_AGE = 18;

const DobPicker: React.FC<DobPickerProps> = ({
  label = 'Date of Birth',
  onDateChange,
  errorMessage,
  minimumAge = DEFAULT_MIN_AGE,
  initialDate
}) => {
  const [date, setDate] = useState<Date | null>(null);
  const [show, setShow] = useState(false);

  const today = new Date();
  const maxDate = new Date();
  maxDate.setFullYear(today.getFullYear() - minimumAge);

  const formatDate = (rawDate: Date): string => {
    const day = String(rawDate.getDate()).padStart(2, '0');
    const month = String(rawDate.getMonth() + 1).padStart(2, '0');
    const year = rawDate.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear() - minimumAge);
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [selectedDay, setSelectedDay] = useState(1);
  console.log("initialdate=============",initialDate)
  const handleDateSelect = () => {
    const selectedDate = new Date(selectedYear, selectedMonth - 1, selectedDay);
    setDate(selectedDate);
    onDateChange(selectedDate, formatDate(selectedDate));
    setShow(false);
  };

  const openPicker = () => {
    setShow(true);
  };

  return (
    <View className="mb-4 px-2">
      {/* Label */}
      <Text className="text-gray-700 text-sm font-medium mb-1">{label}</Text>

      {/* Input Button */}
      <TouchableOpacity
        onPress={openPicker}
        className={
          `border border-[#EBEBEB] rounded-full px-4 py-3 bg-white flex-row items-center justify-between`
        }
      >
        <Text className={(date || initialDate) ? 'text-black' : 'text-gray-400'}>
          {date ? formatDate(date) : initialDate ? formatDate(initialDate) : 'DD/MM/YYYY'}
        </Text>
        <Text className="text-red-500 text-lg">📅</Text>
      </TouchableOpacity>

      {/* Error Message */}
      {errorMessage ? (
        <Text className="text-red-500 text-xs mt-1">{errorMessage}</Text>
      ) : null}

      {/* DateTimePicker */}
      {show && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={show}
          onRequestClose={() => setShow(false)}
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white rounded-t-3xl p-4">
              <View className="flex-row justify-between items-center mb-4">
                <TouchableOpacity onPress={() => setShow(false)}>
                  <Text className="text-red-600 font-semibold">Cancel</Text>
                </TouchableOpacity>
                <Text className="text-lg font-semibold">Select Date</Text>
                <TouchableOpacity onPress={handleDateSelect}>
                  <Text className="text-red-600 font-semibold">Done</Text>
                </TouchableOpacity>
              </View>
              <ScrollView className="max-h-80">
                {/* Year Picker */}
                <View className="mb-4">
                  <Text className="text-gray-600 text-sm mb-2">Year</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                    {Array.from({ length: 100 }, (_, i) => {
                      const year = new Date().getFullYear() - minimumAge - i;
                      return (
                        <TouchableOpacity
                          key={year}
                          onPress={() => setSelectedYear(year)}
                          className={`px-3 py-2 mx-1 rounded-lg ${
                            selectedYear === year ? 'bg-red-500' : 'bg-gray-200'
                          }`}
                        >
                          <Text className={selectedYear === year ? 'text-white' : 'text-gray-700'}>
                            {year}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                {/* Month Picker */}
                <View className="mb-4">
                  <Text className="text-gray-600 text-sm mb-2">Month</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                    {Array.from({ length: 12 }, (_, i) => (
                      <TouchableOpacity
                        key={i + 1}
                        onPress={() => setSelectedMonth(i + 1)}
                        className={`px-3 py-2 mx-1 rounded-lg ${
                          selectedMonth === i + 1 ? 'bg-red-500' : 'bg-gray-200'
                        }`}
                      >
                        <Text className={selectedMonth === i + 1 ? 'text-white' : 'text-gray-700'}>
                          {new Date(2000, i).toLocaleDateString('en-US', { month: 'short' })}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Day Picker */}
                <View className="mb-4">
                  <Text className="text-gray-600 text-sm mb-2">Day</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                    {Array.from({ length: 31 }, (_, i) => (
                      <TouchableOpacity
                        key={i + 1}
                        onPress={() => setSelectedDay(i + 1)}
                        className={`px-3 py-2 mx-1 rounded-lg ${
                          selectedDay === i + 1 ? 'bg-red-500' : 'bg-gray-200'
                        }`}
                      >
                        <Text className={selectedDay === i + 1 ? 'text-white' : 'text-gray-700'}>
                          {i + 1}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default DobPicker;