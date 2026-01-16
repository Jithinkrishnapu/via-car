import CarAnimation from "@/components/animated/car-animation";
import SearchRide from "@/components/common/search-ride";
import Text from "@/components/common/text";
import { useLoadFonts } from "../../hooks/use-load-fonts";
import { ImageBackground, ScrollView, View, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import HambergIocn from '../../../public/drawer.svg'
import BellIocn from '../../../public/bell.svg'
import { router, useFocusEffect } from "expo-router";
import Drawer from "../drawer";
import { useState, useEffect, useCallback } from "react";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";

function Book() {
  const { t } = useTranslation("components");
  const loaded = useLoadFonts();
  const [open, setOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useFocusEffect(
    useCallback(() => {
      return () => {
        setOpen(false);
      };
    }, [])
  );

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
    setOpen(true);
  };

  const handleBellPress = () => {
    router.push("/notifications");
  };
  
  if (!loaded) return null;


  return (
    <ScrollView 
      bounces={false} 
      className="flex-1 bg-white"
      contentInsetAdjustmentBehavior="never"
      automaticallyAdjustsScrollIndicatorInsets={false}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      scrollEnabled={!isLocationModalOpen}
      pointerEvents={isLocationModalOpen ? "none" : "auto"}
    >
     
    <ImageBackground
      source={require("../../../public/hero.png")}
      resizeMode="cover"
      className="justify-center items-center pb-16 pt-28"
    >
        <View 
          style={{
            position: 'absolute',
            top: 50,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: 44,
            width: '100%',
            paddingHorizontal: 20,
            backgroundColor: 'transparent',
          }}
        >
          <TouchableOpacity
            onPress={handleDrawerPress}
            activeOpacity={0.7}
          >
            <HambergIocn />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleBellPress}
            activeOpacity={0.7}
          >
            <BellIocn />
          </TouchableOpacity>
        </View>
        <View className="w-full max-w-[645px] items-center px-5">
          <Text
            fontSize={30}
            className="text-[30px] font-[Kanit-Medium] text-white text-center leading-tight"
          >
            {t("book.title")}
            <Text fontSize={30} className="text-[#FFC0C0]">
              {" "}
              {t("book.affordable")}{" "}
            </Text>
            {t("book.prices")}
          </Text>
        </View>
        <View className="mt-3 w-full px-5">
          <CarAnimation />
        </View>
      </ImageBackground>
    <SearchRide onModalStateChange={setIsLocationModalOpen} />
    <Drawer visible={open} onClose={() => setOpen(false)} />
    </ScrollView>
  );
}

export default Book;
