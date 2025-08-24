import { useState } from "react";
import { CircleHelp, Search } from "lucide-react-native";
import { Image, TextInput, TouchableOpacity, View } from "react-native";
import Text from "./text";
import { useTranslation } from "react-i18next";
import MapView from 'react-native-maps';
import MapDirections from "../ui/map-view";
import MapComponent from "../ui/map-view";

interface Props {
  onContinue?: () => void;
}

export default function LocationSearchSelected({ onContinue }: Props) {
  const { i18n, t } = useTranslation("components");
  const defaultValue = i18n.language === "ar" ? "الخبر" : "Al Khobar";
  const [searchValue, setSearchValue] = useState(defaultValue);

  const handleInputChange = (text: string) => {
    setSearchValue(text);
  };

  return (
    <View className="relative flex-1 font-[Kanit-Regular]">
      <View className="flex-row items-center gap-4 relative px-6">
        <View className="absolute left-10 my-auto z-[1]">
          <Search className="size-[20px]" strokeWidth={1} color="black" />
        </View>
        <TextInput
          allowFontScaling={false}
          value={searchValue}
          onChangeText={handleInputChange}
          placeholder={t("locationSearchSelected.label")}
          autoComplete="off"
          className="text-lg font-[Kanit-Light] placeholder:text-[#666666] bg-[#F1F1F5] border-none h-[57px] rounded-full pl-16 flex-1"
        />
      </View>
      <View className="flex-auto flex-col gap-4 mt-4 h-full">
        <TouchableOpacity
          className="border border-[#EBEBEB] rounded-full h-max w-max mx-auto mb-4 flex-row items-center gap-[15px] px-[10px] py-[6px]"
          activeOpacity={0.8}
        >
          <CircleHelp className="size-[14px]" strokeWidth={1} />
          <Text
            fontSize={12}
            className="text-[12px] font-[Kanit-Light] text-[#3C3F4E]"
          >
            {t(
              "locationSearchSelected.whyExactLocation",
              "Why an exact location?"
            )}
          </Text>
        </TouchableOpacity>
        {/* <View className="rounded-2xl overflow-hidden flex-2"> */}
          {/* <Image
            className="w-full h-full object-cover"
            source={require(`../../../public/map-select.png`)}
            alt=""
          /> */}
          <MapComponent/>
        {/* </View> */}
      </View>
      <View className="absolute right-0 bottom-10 left-0 px-6 z-10">
        <TouchableOpacity
          className="bg-[#FF4848] rounded-full w-full h-[55px] cursor-pointer items-center justify-center"
          onPress={onContinue}
          activeOpacity={0.8}
        >
          <Text
            fontSize={20}
            className="text-xl text-white font-[Kanit-Regular]"
          >
            {t("locationSearchSelected.continue")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
