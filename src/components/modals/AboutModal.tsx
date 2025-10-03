import { TextInput, TouchableOpacity, View } from "react-native";
import Text from "../common/text";
import { X } from "lucide-react-native";
import { useTranslation } from "react-i18next";

// 📂 components/modals/AboutModal.tsx
const AboutModal = ({ onClose}: { onClose: () => void }) => {
  const { t, i18n } = useTranslation();
  return(
    <View className="bg-white h-[40%] px-12 lg:px-24 pt-12 lg:pt-24 rounded-t-3xl items-center">
      <TouchableOpacity
        className="rounded-full absolute right-8 top-8 items-center justify-center"
        activeOpacity={0.8}
        onPress={onClose}
      >
        <X color={"#000"} />
      </TouchableOpacity>
  
      <View className="flex-1">
        <View className="flex-row w-full items-center justify-center mb-5">
          <Text className="text-[16px] font-[Kanit-Medium] ">About Me</Text>
        </View>
  
        <View className="bg-[#F1F1F5] w-full mb-4 h-[120px] items-center justify-between flex-row rounded-lg px-4">
          <TextInput
            multiline
            numberOfLines={5}
            className="w-full h-[120px]"
            placeholderClassName="text-[16px] font-[Kanit-Light]"
            placeholder="Enter about yourself"
          />
        </View>
      </View>
  
      <TouchableOpacity
        className="bg-[#FF4848] rounded-full w-full h-[50px] items-center justify-center"
        activeOpacity={0.8}
        onPress={onClose}
      >
        <Text
          fontSize={18}
          className="text-[14px] text-white text-center font-[Kanit-Regular]"
        >
          {t("profile.save")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
  
  export default AboutModal;
  