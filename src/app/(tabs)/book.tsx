import CarAnimation from "@/components/animated/car-animation";
import SearchRide from "@/components/common/search-ride";
import Text from "@/components/common/text";
import { useLoadFonts } from "../../hooks/use-load-fonts";
import { ImageBackground, ScrollView, View, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import HambergIocn from '../../../public/drawer.svg'
import BellIocn from '../../../public/bell.svg'
import { router } from "expo-router";
import Drawer from "../drawer";
import { useState, useEffect } from "react";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";

function Book() {
  const { t } = useTranslation("components");
  const loaded = useLoadFonts();
  const [open, setOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const raw = await useAsyncStorage("userDetails").getItem();
      const token = raw ? JSON.parse(raw).token : "";
      setIsAuthenticated(!!token);
    };
    
    checkAuth();
  }, []);

  const handleDrawerPress = () => {
    if (isAuthenticated) {
      setOpen(true);
    }
  };

  const handleBellPress = () => {
    if (isAuthenticated) {
      router.push("/(tabs)/inbox");
    }
  };
  
  if (!loaded) return null;


  return (
    <ScrollView 
      bounces={false} 
      className="flex-1 bg-white"
      contentInsetAdjustmentBehavior="never"
      automaticallyAdjustsScrollIndicatorInsets={false}
      showsVerticalScrollIndicator={false}
      scrollEnabled={!isLocationModalOpen}
      pointerEvents={isLocationModalOpen ? "none" : "auto"}
    >
     
    <ImageBackground
      source={require("../../../public/hero.png")}
      resizeMode="cover"
      className="justify-center items-center pb-24 pt-32"
    >
        <View 
          style={{
            position: 'absolute',
            top: 60,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: 50,
            width: '100%',
            paddingHorizontal: 15,
            backgroundColor: 'transparent',
          }}
        >
          <TouchableOpacity
            onPress={handleDrawerPress}
            activeOpacity={isAuthenticated ? 0.7 : 1}
            style={{
              opacity: isAuthenticated ? 1 : 0.3,
            }}
            disabled={!isAuthenticated}
          >
            <HambergIocn />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleBellPress}
            activeOpacity={isAuthenticated ? 0.7 : 1}
            style={{
              opacity: isAuthenticated ? 1 : 0.3,
            }}
            disabled={!isAuthenticated}
          >
            <BellIocn />
          </TouchableOpacity>
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
    <SearchRide onModalStateChange={setIsLocationModalOpen} />
    <Drawer visible={open} onClose={() => setOpen(false)} />
    </ScrollView>
  );
}

export default Book;
