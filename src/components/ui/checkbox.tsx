import React from "react";
import { Pressable } from "react-native";
import { Check } from "lucide-react-native";

interface CheckboxProps {
  checked: boolean;
  onValueChange?: (newValue: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onValueChange,
  disabled = false,
  className = "",
}) => {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      onPress={() => !disabled && onValueChange?.(!checked)}
      disabled={disabled}
      className={
        `size-[20px] rounded-md border items-center justify-center ` +
        `
        ${checked ? "bg-blue-600 border-blue-600" : "bg-white border-gray-300"}
        ${disabled ? "opacity-50" : ""}
        ` +
        className
      }
    >
      {checked && <Check size={20} strokeWidth={2.5} className="text-white" />}
    </Pressable>
  );
};
