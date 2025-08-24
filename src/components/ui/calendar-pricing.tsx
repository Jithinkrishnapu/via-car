import React, { useEffect } from "react";
import { View, TouchableOpacity } from "react-native";
import { Calendar as RNCalendar, DateData } from "react-native-calendars";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { eachMonthOfInterval, endOfYear, format, startOfYear } from "date-fns";
import Text from "../common/text";

// Specific days of the month with pricing
const specificDays = [
  "02",
  "04",
  "06",
  "09",
  "11",
  "17",
  "19",
  "22",
  "25",
  "30",
];
const price = "SR 460.00";

// Generate pricing for specific days in each month of the given year
const generateDatePricing = (year: number): Record<string, string> => {
  const start = startOfYear(new Date(year, 0, 1));
  const end = endOfYear(new Date(year, 0, 1));
  const allMonths = eachMonthOfInterval({ start, end });

  return allMonths.reduce((acc, month) => {
    const yearStr = format(month, "yyyy");
    const monthStr = format(month, "MM");
    specificDays.forEach((day) => {
      const dateString = `${yearStr}-${monthStr}-${day}`;
      // Verify if the date is valid (e.g., skip Feb 30)
      const date = new Date(`${dateString}T00:00:00`);
      if (
        !isNaN(date.getTime()) &&
        date.getDate() === parseInt(day) &&
        date.getMonth() + 1 === parseInt(monthStr)
      ) {
        acc[dateString] = price;
      }
    });
    return acc;
  }, {} as Record<string, string>);
};

const datePricing: Record<string, string> = generateDatePricing(
  new Date().getFullYear()
);

interface CalendarProps {
  onChange: (newDate: string) => void;
}

const Calendar = ({ onChange }: CalendarProps) => {
  const [selectedDate, setSelectedDate] = React.useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );

  const renderArrow = (direction: "left" | "right") => (
    <View className="py-2">
      {direction === "left" ? (
        <ChevronLeft size={20} color="#B5BEC6" />
      ) : (
        <ChevronRight size={20} color="#B5BEC6" />
      )}
    </View>
  );

  const markedDates = Object.keys(datePricing).reduce((acc, date) => {
    acc[date] = {
      marked: true,
      dotColor: "#2DA771",
      selected: selectedDate === date,
      selectedColor: "#2DA771",
    };
    return acc;
  }, {} as { [key: string]: any });

  useEffect(() => {
    onChange(selectedDate);
    console.log(selectedDate);
  }, [selectedDate]);

  return (
    <View className="px-6 py-4">
      <RNCalendar
        onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
        markedDates={markedDates}
        renderArrow={renderArrow}
        theme={{
          backgroundColor: "#ffffff",
          calendarBackground: "#ffffff",
          textSectionTitleColor: "#B5BEC6",
          selectedDayBackgroundColor: "#2DA771",
          selectedDayTextColor: "#ffffff",
          todayTextColor: "#2DA771",
          dayTextColor: "#4A5660",
          textDisabledColor: "#d9e1e8",
          arrowColor: "#B5BEC6",
          monthTextColor: "#4A5660",
          indicatorColor: "#2DA771",
          textDayFontFamily: "System",
          textMonthFontFamily: "System",
          textDayHeaderFontFamily: "System",
          textDayFontWeight: "400",
          textMonthFontWeight: "600",
          textDayHeaderFontWeight: "400",
          textDayFontSize: 14,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 12,
        }}
        dayComponent={({ date, state }) => {
          const dateString = date?.dateString;
          const price = dateString ? datePricing[dateString] : null;
          const isSelected = dateString === selectedDate;

          return (
            <TouchableOpacity
              className={`relative items-center justify-center w-10 h-10 ${
                isSelected ? "bg-[#2DA771] rounded-full" : ""
              }`}
              onPress={() => {
                if (dateString) {
                  setSelectedDate(dateString);
                }
              }}
            >
              <Text
                fontSize={14}
                className={`text-[14px] font-[Inter] font-medium ${
                  isSelected
                    ? "text-white"
                    : state === "disabled"
                    ? "text-gray-400"
                    : "text-[#4A5660]"
                }`}
              >
                {date?.day}
              </Text>
              {price && (
                <Text
                  fontSize={8}
                  className={`absolute -bottom-4 text-[8px] text-center ${
                    isSelected
                      ? "text-[#00665A] font-[Inter] font-medium"
                      : "text-[#999999]"
                  }`}
                  style={{ fontFamily: "Inter", fontWeight: "500" }}
                >
                  {price}
                </Text>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

export default Calendar;
