import { TextInput, View, TextInputProps } from "react-native";
import Text from "@/components/common/text";
import clsx from "clsx"; // optional – keeps className logic clean

type InputComponentProps = {
  value: string;
  onChangeText: (text: string) => void;
  label: string;
  placeHolder: string;
  error?: string; // NEW
} & Omit<TextInputProps, "onChangeText" | "value">;

export const InputComponent = ({
  label,
  onChangeText,
  placeHolder,
  value,
  error,
  ...rest
}: InputComponentProps) => {
  const borderColor = error ? "border-red-500" : "border-[#EBEBEB]";
  return (
    <View className="px-2 gap-2 mb-4">
      <Text
        fontSize={16}
        className="text-[16px] text-[#000000] font-[Kanit-Light] leading-tight tracking-tight"
      >
        {label}
      </Text>

      <TextInput
        allowFontScaling={false}
        placeholder={placeHolder}
        placeholderTextColor={"#666666"}
        value={value}
        onChangeText={onChangeText}
        className={clsx(
          "h-[50px] rounded-full text-[16px] font-[Kanit-Light] px-5 border",
          borderColor
        )}
        style={{
          textAlign: "left",
          direction: "ltr",
          writingDirection: "ltr",
        }}
        {...rest}
      />

      {/* ----- error caption ----- */}
      {error && (
        <Text fontSize={13} className="text-red-500 pl-3">
          {error}
        </Text>
      )}
    </View>
  );
};