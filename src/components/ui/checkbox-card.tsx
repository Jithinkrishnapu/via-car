import React, { useState } from "react";
import { View, TouchableOpacity } from "react-native";
import { BatteryCharging } from "lucide-react-native";
import { cn } from "@/lib/utils";
import UsersBoldIcon from "../icons/users-bold-icon";
import ClockIcon from "../icons/clock-icon";
import CheckRoundedIcon from "../icons/check-rounded-icon";
import CigaretteIcon from "../icons/cigarette-icon";
import PetsIcon from "../icons/pets-icon";
import SnowFlakeIcon from "../icons/snowflake-icon";
import WheelChairIcon from "../icons/wheelchair";
import Text from "../common/text";
import { useTranslation } from "react-i18next";

interface IconProps {
  width?: number;
  height?: number;
  color?: string;
}

interface Option {
  label: string;
  value: string;
  count: number;
  Icon: React.FC<IconProps>;
  defaultChecked?: boolean;
}

interface Props {
  setCheckedItem: (items: Record<string, boolean>) => void;
  checkedItems?: Record<string, boolean>;
}

const CheckboxCard = ({ setCheckedItem, checkedItems: externalCheckedItems }: Props) => {
  const { t } = useTranslation("components");
  const options: Option[] = [
    {
      label: t("checkboxCard.maxTwoInBack"),
      value: "max_2_in_back",
      count: 40,
      Icon: ({ width = 22, height = 22, color }) => (
        <UsersBoldIcon width={width} height={height} stroke={color} />
      ),
      defaultChecked: false,
    },
    {
      label: t("checkboxCard.instantBooking"),
      value: "instant_booking",
      count: 40,
      Icon: ({ width = 22, height = 22, color }) => (
        <ClockIcon width={width} height={height} stroke={color} />
      ),
      defaultChecked: false,
    },
    {
      label: t("checkboxCard.smokingAllowed"),
      value: "smoking_allowed",
      count: 40,
      Icon: ({ width = 22, height = 22, color }) => (
        <CigaretteIcon width={width} height={height} stroke={color} />
      ),
      defaultChecked: false,
    },
    {
      label: t("checkboxCard.petsAllowed"),
      value: "pets_allowed",
      count: 40,
      Icon: ({ width = 22, height = 22, color }) => (
        <PetsIcon width={width} height={height} stroke={color} />
      ),
    },
    {
      label: t("checkboxCard.powerOutlets"),
      value: "power_outlets",
      count: 40,
      Icon: ({ width = 22, height = 22, color }) => (
        <BatteryCharging size={width} color={color} strokeWidth={1} />
      ),
    },
    {
      label: t("checkboxCard.airConditioning"),
      value: "air_conditioning",
      count: 40,
      Icon: ({ width = 22, height = 22, color }) => (
        <SnowFlakeIcon width={width} height={height} stroke={color} />
      ),
    },
    {
      label: t("checkboxCard.accessibleForDisabilities"),
      value: "accessible_for_disabled",
      count: 40,
      Icon: ({ width = 22, height = 22, color }) => (
        <WheelChairIcon width={width} height={height} stroke={color} />
      ),
    },
  ];

  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(
    () =>
      Object.fromEntries(
        options.map((opt) => [opt.value, !!opt.defaultChecked])
      )
  );

  // Update internal state when external state changes (for clearing)
  React.useEffect(() => {
    if (externalCheckedItems) {
      setCheckedItems(externalCheckedItems);
    }
  }, [externalCheckedItems]);

  const toggleCheckbox = (value: string) => {
    setCheckedItems((prev) => {
      const newState = { ...prev, [value]: !prev[value] };
      setCheckedItem(newState);
      return newState;
    });
  };

  return (
    <View className="w-full gap-[9px]">
      {options.map((option) => {
        const isChecked = checkedItems[option.value];

        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => toggleCheckbox(option.value)}
            className={cn(
              "relative ring-[1px] rounded-lg px-[38px] py-2 min-h-[55px] flex-row items-center justify-between gap-2.5",
              isChecked
                ? "bg-[#FF4848] ring-[#FF4848] text-white"
                : "ring-[#C3C3C3] text-muted-foreground"
            )}
            activeOpacity={0.8}
          >
            <Text
              fontSize={14}
              className={cn(
                "text-[14px] font-[Kanit-Regular] tracking-tight",
                isChecked ? "text-white" : "text-[#666666]"
              )}
            >
              {option.label}
            </Text>
            <View className="flex-row items-center gap-[9px]">
              <Text
                fontSize={14}
                className={cn(
                  "text-[14px] font-[Kanit-Regular] tracking-tight",
                  isChecked ? "text-white" : "text-[#666666]"
                )}
              >
                {option.count}
              </Text>
              <option.Icon
                width={22}
                height={22}
                color={isChecked ? "white" : "#999999"}
              />
              {isChecked && (
                <CheckRoundedIcon
                  className="ml-[18px]"
                  width={15}
                  height={15}
                  stroke="white"
                />
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default CheckboxCard;
