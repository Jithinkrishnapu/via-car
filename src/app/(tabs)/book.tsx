import CarAnimation from "@/components/animated/car-animation";
import SearchRide from "@/components/common/search-ride";
import Text from "@/components/common/text";
import { useLoadFonts } from "../../hooks/use-load-fonts";
import { ImageBackground, ScrollView, View } from "react-native";
import { useTranslation } from "react-i18next";
import HambergIocn from '../../../public/drawer.svg'
import BellIocn from '../../../public/bell.svg'
import { router } from "expo-router";
import Drawer from "../drawer";
import { useState } from "react";

function Book() {
  const { t } = useTranslation("components");
  const loaded = useLoadFonts();
  const [open, setOpen] = useState(false);
  if (!loaded) return null;


  return (
    <ScrollView className="flex-col bg-white">
       
      <ImageBackground
        source={require("../../../public/hero.png")}
        resizeMode="cover"
        className="justify-center items-center pb-24 pt-32"
      >
          <View className="flex-row top-10 absolute bg-transparent justify-between items-center h-[50px] w-full px-[15px]" >
          <HambergIocn onPress={()=>setOpen(true)} />
          <BellIocn onPress={()=>router.push("/(tabs)/inbox")} />
        </View>
        <View className="w-full max-w-[645px] items-center px-6">
          <Text
            fontSize={34}
            className="text-[34px] font-[Kanit-Medium] text-white text-center"
          >
            {t("book.title")}
            <Text fontSize={34} className="text-[#FFC0C0]">
              {" "}
              {t("book.affordable")}{" "}
            </Text>
            {t("book.prices")}
          </Text>
        </View>
        <View className="mt-4 w-full px-6">
          <CarAnimation />
        </View>
      </ImageBackground>
      <SearchRide />
      <Drawer visible={open} onClose={() => setOpen(false)} />
    </ScrollView>
  );
}

export default Book;
