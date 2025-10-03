import { TextInput, TouchableOpacity, View } from "react-native";
import Text from "../common/text";
import ChatIcon from "../../../public/chat.svg";
import CigaretteIcon from "../../../public/cigarette-light.svg";
import MusicIcon from "../../../public/music.svg";
import PawIcon from "../../../public/paw.svg";
import { X } from "lucide-react-native";
import { useTranslation } from "react-i18next";

// 📂 components/modals/PreferencesModal.tsx
const PreferencesModal = ({ onClose}: { onClose: () => void}) => {
  const { t, i18n } = useTranslation();
  return(
    <View className="bg-white h-[60%] px-12 lg:px-24 pt-12 lg:pt-24 rounded-t-3xl items-center">
      <TouchableOpacity        className="rounded-full absolute right-8 top-8 items-center justify-center"
        activeOpacity={0.8}
        onPress={onClose}
      >
        <X color={"#000"} />
      </TouchableOpacity>
  
      <View className="flex-1">
        <View className="flex-row w-full items-center justify-center mb-5">
          <Text className="text-[16px] font-[Kanit-Medium] ">Preferences</Text>
        </View>
  
        <View className="bg-[#F1F1F5] mb-4 h-[50px] items-center justify-between flex-row rounded-full px-4">
          <TextInput
            className="w-[70%] h-[50px]"
            placeholderClassName="text-[16px] font-[Kanit-Light]"
            placeholder="Enter travel preferences"
          />
          <TouchableOpacity
            className="bg-[#FF4848] rounded-full w-[50px] h-[30px] items-center justify-center"
            activeOpacity={0.8}
            onPress={onClose}
          >
            <Text
              fontSize={18}
              className="text-[14px] text-white text-center font-[Kanit-Regular]"
            >
              {t("profile.add")}
            </Text>
          </TouchableOpacity>
        </View>
  
        <View className="flex-wrap flex-row gap-[15px]">
          {[
            [ChatIcon, t("I'm chatty when I feel comfortable")],
            [CigaretteIcon, t("Cigarette breaks outside the car are ok")],
            [MusicIcon, t("I'll jam depending on the mood")],
            [PawIcon, t("I'll travel with pets depending on the animal")],
          ].map(([IconComp, text], idx) => (
            <View
              key={idx}
              className="border border-gray-200 rounded-full flex-row items-center px-4 py-2"
            >
              <IconComp width={21} height={21} />
              <Text fontSize={14} className="ml-2 text-sm font-[Kanit-Light]">
                {text as string}
              </Text>
            </View>
          ))}
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
  
  export default PreferencesModal;
  