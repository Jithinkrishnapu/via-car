import React, { useCallback, useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Image,
  TouchableOpacity,
  ImageBackground,
  useWindowDimensions,
  Modal,
  TextInput,
  Alert,
  FlatList,
} from "react-native";
import { Href, useRouter } from "expo-router";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  LogOut,
  Pencil,
  Star,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react-native";
import Text from "@/components/common/text";
import CheckGreen from "../../../public/check-green.svg";
import VerifyIcon from "../../../public/verify.svg";
import ChatIcon from "../../../public/chat.svg";
import CigaretteIcon from "../../../public/cigarette-light.svg";
import MusicIcon from "../../../public/music.svg";
import PawIcon from "../../../public/paw.svg";
import { Separator } from "@/components/ui/separator";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { cn } from "@/lib/utils";
import MailAnimation from "@/components/animated/mail-animation";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/hooks/useDirection";
import AsyncStorage from "@react-native-async-storage/async-storage";
import EmailModal from "@/components/modals/EmailModal";
import PreferencesModal from "@/components/modals/PrefereceModal";
import AboutModal from "@/components/modals/AboutModal";
import { handleLogOut, useGetProfileDetails } from "@/service/auth";
import { getVehicleList } from "@/service/vehicle";
import ProfileModal from "@/components/modals/ProfileModal";
import { changeLanguage, getCurrentLanguageName, getOppositeLanguageName } from "@/lib/languageUtils";

type ModalTypes = "email" | "preferences" | "about" | "profile"

export default function ProfilePage() {
  const loaded = useLoadFonts();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { isRTL, swap } = useDirection();
  const tabKeys = ["about", "account"] as const;
  type TabKey = (typeof tabKeys)[number];
  const [activeTab, setActiveTab] = useState<TabKey>("about");
  const { width } = useWindowDimensions();
  const indicatorX = useSharedValue(0);
  const tabWidth = (246 + 6) / tabKeys.length;
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalTtype] = useState<ModalTypes>()
  const [vehicleList, setVehhicleList] = useState([])

  const handleGetVehicles = async () => {
    const response = await getVehicleList()
    if (response.data) {
      setVehhicleList(response.data.vehicles)
    }
  }

  const handleDeleteVehicle = (vehicleId: number) => {
    Alert.alert(
      t("profile.Delete Vehicle"),
      t("profile.Are you sure you want to delete this vehicle?"),
      [
        { text: t("profile.Cancel"), style: "cancel" },
        {
          text: t("profile.Delete"),
          style: "destructive",
          onPress: async () => {
            try {
              const { deleteVehicle } = await import("@/service/vehicle");
              await deleteVehicle(vehicleId);
              Alert.alert(t("profile.Success"), t("profile.Vehicle deleted successfully"));
              handleGetVehicles(); // Refresh list
            } catch (error: any) {
              Alert.alert(t("profile.Error"), error?.body?.message || t("profile.Failed to delete vehicle"));
            }
          },
        },
      ]
    );
  };

  const tabLabels = {
    about: t("About"),
    account: t("Account"),
  };

  useEffect(() => {
    handleGetVehicles()
    const index = tabKeys.indexOf(activeTab);
    indicatorX.value = withSpring(index * tabWidth, {
      damping: 20,
      stiffness: 90,
    });
  }, [activeTab, tabWidth]);

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: tabWidth,
  }));

  const handleLogout = () => {
    handleLogOut().then((res) => {
      AsyncStorage.removeItem("userDetails");
      router.replace("/login");
    }).catch((err) => {
      console.log("error===========", err)
      Alert.alert("Something went wrong")
    })

  };

  const [userDetails, setUserDetails] = useState(null);

  const refreshProfile = useCallback(async () => {
    try {
      const res = await useGetProfileDetails();
      console.log('userData============',res.data)
      if (res?.data?.first_name !== "") {setUserDetails(res.data)}else{
      router.replace("/login")
      };
    } catch {
      /* optional toast / log */
      router.replace("/login")
    }
  }, []);

  /* first load */
  useEffect(() => { refreshProfile(); }, [refreshProfile]);

  const renderModalContent = () => {
    const onClose = () => {
      setModalTtype(undefined);
      setModalVisible(false);
      refreshProfile();          // ← always refresh when any modal closes
    };

    switch (modalType) {
      case 'email':
        return <EmailModal onClose={onClose} />;
      case 'preferences':
        return <PreferencesModal onClose={onClose} />;
      case 'about':
        return <AboutModal onClose={onClose} />;
      case 'profile':
        return <ProfileModal onClose={onClose} />;
      default:
        return null;
    }
  };

  if (!loaded) return null;

  return (
    <ScrollView className="font-[Kanit-Regular] bg-white">
      <View className="pb-[40px]">
        <ImageBackground
          className="w-full h-max"
          source={require("../../../public/hero.png")}
          resizeMode="cover"
        >
          <View className="mx-auto w-full max-w-7xl p-6 pt-16">
            <Text
              fontSize={24}
              className="text-2xl text-white font-[Kanit-Medium]"
            >
              {t("Profile")}
            </Text>
            <View className="mt-6 flex-col flex-wrap justify-between">
              <View className="flex flex-row gap-[30px] items-center">
                <Image
                  source={userDetails?.profile_image_url ? {uri:userDetails?.profile_image_url} : require("../../../public/profile-img2.png")}
                  className="size-[80px] rounded-2xl"
                  resizeMode="cover"
                />
                <View className="flex-1">
                  <View className="flex-row justify-between items-center">
                    <Text
                      fontSize={25}
                      className="text-[25px] text-white font-[Kanit-Regular]"
                    >
                      {userDetails?.first_name}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>{
                        setModalTtype("profile")
                      setModalVisible(true)
                      }}
                      className="flex-row items-center bg-transparent border border-gray-200 rounded-full px-[18px] py-[6px]"
                    >
                      <Pencil size={14} color="#FF4848" strokeWidth={1} />
                      <Text
                        fontSize={12}
                        className="text-[12px] text-white font-[Kanit-Light] ml-1"
                      >
                        {t("Edit")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View className="flex-row items-center mt-2 gap-[10px]">
                    <Text
                      fontSize={16}
                      className="text-base text-white font-[Kanit-Regular]"
                    >
                      4.5
                    </Text>
                    <Star
                      size={16}
                      fill="#FF9C00"
                      strokeWidth={0}
                      className="ml-1"
                    />
                  </View>
                </View>
              </View>
              <View className="w-full text-white py-6">
                {[
                  [t("Phone Number"), userDetails?.mobile_number],
                  [t("Mail"), userDetails?.email],
                  [t("Age"), - + Number(userDetails?.calculated_age)],
                  [t("Gender"), userDetails?.gender_name],
                ].map(([label, value], idx) => (
                  value && <View key={idx} className="flex-row py-1">
                    <Text
                      fontSize={14}
                      className="flex-1 text-[14px] text-white font-[Kanit-Light]"
                    >
                      {label}
                    </Text>
                    <Text
                      fontSize={14}
                      className="w-[20px] text-center text-[14px] text-white font-[Kanit-Light]"
                    >
                      :
                    </Text>
                    <Text
                      fontSize={14}
                      className="flex-1 text-[14px] text-white font-[Kanit-Light] ml-1"
                    >
                      {value}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </ImageBackground>

        {/* Tab Switcher */}
        <View className="flex-row h-[40px] bg-white border border-[#EBEBEB] rounded-full overflow-hidden mt-[20px] max-w-[246px] mx-auto">
          <Animated.View
            style={animatedIndicatorStyle}
            className="rounded-full bg-[#FF4848] h-[38px] absolute z-0"
          />
          {tabKeys.map((key) => {
            const isActive = key === activeTab;
            return (
              <TouchableOpacity
                key={key}
                activeOpacity={0.8}
                onPress={() => setActiveTab(key)}
                className={cn(
                  "flex-1 items-center justify-center rounded-full",
                  !isActive && "z-10"
                )}
              >
                <Text
                  fontSize={15}
                  className={cn(
                    "text-[15px] font-[Kanit-Regular] z-10 transition-all duration-700",
                    isActive ? "text-white" : "text-[#666666]"
                  )}
                >
                  {tabLabels[key]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {activeTab === "about" ? (
          <View className="mt-6 space-y-6">
            {/* Verification Section */}
            <View className="pb-6 px-6 border-b-[11px] border-[#F7F7F7]">
              <View className="mt-4 rounded-lg">
                {/* ID Verification - only show if verified */}
                {userDetails?.is_verified && (
                  <>
                    <TouchableOpacity
                      className="flex-row items-center px-4 py-2"
                      onPress={() => { }}
                      activeOpacity={0.8}
                    >
                      <CheckGreen width={18} height={18} />
                      <Text
                        fontSize={14}
                        className="ml-4 text-[14px] font-[Kanit-Light]"
                      >
                        {t("ID verified")}
                      </Text>
                    </TouchableOpacity>
                    <Separator className="my-[6px] border-t !border-dashed !border-[#CDCDCD] bg-transparent" />
                  </>
                )}
                
                {/* Email Verification */}
                {/* <TouchableOpacity
                  onPress={() => {
                    setModalTtype("email")
                    setModalVisible(true)
                  }}
                  className="flex-row items-center px-4 py-2 justify-between"
                  activeOpacity={0.8}
                >
                  <View className="flex-row items-center">
                    {userDetails?.email_verified ? (
                      <CheckGreen width={18} height={18} />
                    ) : (
                      <VerifyIcon width={22} height={22} />
                    )}
                    <Text
                      fontSize={14}
                      className="ml-4 text-[14px] font-[Kanit-Light]"
                    >
                      {userDetails?.email_verified 
                        ? t("Email confirmed") 
                        : t("Confirm your email")}
                    </Text>
                  </View>
                  {!userDetails?.email_verified && swap(<ChevronRight size={24} />, <ChevronLeft size={24} />)}
                </TouchableOpacity> */}
                
                {/* <Separator className="my-[6px] border-t !border-dashed !border-[#CDCDCD] bg-transparent" /> */}
                
                {/* Phone Verification - always confirmed if user is logged in */}
                {/* <TouchableOpacity
                  className="flex-row items-center px-4 py-2"
                  onPress={() => { }}
                  activeOpacity={0.8}
                >
                  <CheckGreen width={18} height={18} />
                  <Text
                    fontSize={14}
                    className="ml-4 text-[14px] font-[Kanit-Light]"
                  >
                    {t("Confirmed phone number")}
                  </Text>
                </TouchableOpacity> */}
              </View>
            </View>

            {/* Travel Preferences */}
            <View className="px-6 py-8">
              <View className="flex-row justify-between items-center mb-[20px]">
                <Text
                  fontSize={16}
                  className="text-[16px] font-[Kanit-Regular]"
                >
                  {t("Travel Preferences")}
                </Text>
                <TouchableOpacity
                  onPress={() => { setModalTtype("preferences"), setModalVisible(true) }}
                  className="flex-row items-center bg-transparent border border-gray-200 rounded-full h-max px-5 py-1.5"
                >
                  <Pencil size={12} color="#FF4848" />
                  <Text fontSize={14} className="text-sm ml-1">
                    {t("Edit")}
                  </Text>
                </TouchableOpacity>
              </View>
              <View className="flex-wrap flex-row gap-[15px]">
                {userDetails?.travel_preferences?.[0]          // take the first (and only) string
                  ?.split(',')                                 // break it into real tags
                  .map((text: string) => (
                    <View
                      key={text}
                      className="border border-gray-200 rounded-full flex-row items-center px-4 py-2"
                    >
                      <ChatIcon width={21} height={21} />
                      <Text className="ml-2 text-sm font-[Kanit-Light]">{text.trim()}</Text>
                    </View>
                  ))}
              </View>
            </View>

            {/* About You */}
            <View className="px-6 mb-[30px]">
              <View className="flex-row justify-between items-center mb-[20px]">
                <Text
                  fontSize={16}
                  className="text-[16px] font-[Kanit-Regular]"
                >
                  {t("About you")}
                </Text>
                <TouchableOpacity
                  className="flex-row items-center bg-transparent border border-gray-200 rounded-full h-8 px-3"
                  onPress={() => { setModalTtype("about"), setModalVisible(true) }}
                >
                  <Pencil size={12} color="#FF4848" />
                  <Text
                    fontSize={14}
                    className="text-sm ml-1 font-[Kanit-Light]"
                  >
                    {t("Edit")}
                  </Text>
                </TouchableOpacity>
              </View>
              { userDetails?.about ?  <Text
                fontSize={14}
                className="bg-gray-100 text-black rounded-2xl p-4 text-sm leading-relaxed font-[Kanit-Light]"
              >
                {userDetails?.about}
              </Text> :
              <Text
                fontSize={14}
                className="bg-gray-100 text-grey-500 rounded-2xl p-4 text-sm leading-relaxed font-[Kanit-Light]"
              >
                Add about you here
              </Text>}
            </View>

            {/* Vehicles */}
            <View className="px-6 pb-8">
              <Text
                fontSize={16}
                className="text-[16px] font-[Kanit-Regular] mb-6"
              >
                {t("Vehicles")}
              </Text>

              {vehicleList.length > 0 ? (
                <View className="mb-6">
                  <FlatList
                    data={vehicleList}
                    ItemSeparatorComponent={() => (
                      <Separator className="border-gray-200 my-5" />
                    )}
                    renderItem={({ item }) => (
                      <View className="flex-row justify-between items-center py-2">
                        <View className="flex-1 mr-4">
                          <Text
                            fontSize={16}
                            className="text-[16px] font-[Kanit-Medium] mb-1"
                          >
                            {item?.model?.name}
                          </Text>
                          <Text
                            fontSize={12}
                            className="text-[12px] text-gray-600 font-[Kanit-Light]"
                          >
                            {item?.model?.category_name}, {item?.brand?.name}
                          </Text>
                          <Text
                            fontSize={11}
                            className="text-[11px] text-gray-500 font-[Kanit-Light] mt-1"
                          >
                            {item?.year}
                          </Text>
                        </View>
                        <View className="flex-row gap-4">
                          <TouchableOpacity
                            onPress={() =>
                              router.push({
                                pathname: "/(profile)/edit-vehicle",
                                params: { vehicleData: JSON.stringify(item) },
                              })
                            }
                            className="p-2 bg-red-50 rounded-full"
                            activeOpacity={0.7}
                          >
                            <Pencil size={18} color="#FF4848" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleDeleteVehicle(item?.id)}
                            className="p-2 bg-gray-100 rounded-full"
                            activeOpacity={0.7}
                          >
                            <Trash2 size={18} color="#666666" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                    keyExtractor={(item) => item?.id?.toString()}
                  />
                </View>
              ) : (
                <View className="items-center py-8 mb-4">
                  <Text className="text-gray-400 text-sm font-[Kanit-Light]">
                    {t("profile.No vehicles added yet")}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                onPress={() => router.push("/(profile)/add-vehicles")}
                className="flex-row items-center justify-center h-14 rounded-full bg-red-500 mt-2"
                activeOpacity={0.8}
              >
                <CirclePlus size={20} color="#fff" strokeWidth={1} />
                <Text
                  fontSize={18}
                  className="ml-2 text-lg text-white font-[Kanit-Regular]"
                >
                  {t("Add vehicle")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View>
            {/* Language Switcher */}
            <View className="px-6 space-y-6 border-t-[11px] border-[#F7F7F7]">
              {[
                [t("profile.Bank Account"), "/(profile)/bank"],
                [t("profile.Transactions"), "/(profile)/transactions"],
                // [t("Payment & Refunds"), "/"],
              ].map(([label, route], idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => router.push(route as Href)}
                  className={cn(
                    "flex-row items-center justify-between pt-4",
                    idx !== 3 && "border-b border-dashed border-gray-200 pb-4"
                  )}
                >
                  <Text
                    fontSize={14}
                    className="text-[14px] font-[Kanit-Light]"
                  >
                    {label}
                  </Text>
                  {swap(
                    <ChevronRight size={25} color="#000000" strokeWidth={1} />,
                    <ChevronLeft size={25} color="#000000" strokeWidth={1} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Language Switcher */}
            <View className="px-6 py-4 border-b border-dashed border-gray-200">
              <TouchableOpacity
                onPress={async () => {
                  const newLang = i18n.language === "en" ? "ar" : "en";
                  const langName = getOppositeLanguageName();
                  
                  Alert.alert(
                    t("profile.Select Language"),
                    `${t("Change Language")} ${langName}?`,
                    [
                      {
                        text: t("profile.Cancel"),
                        style: "cancel"
                      },
                      {
                        text: t("profile.ok"),
                        onPress: async () => {
                          await changeLanguage(newLang, () => {
                            refreshProfile();
                          });
                        }
                      }
                    ]
                  );
                }}
                className="flex-row items-center justify-between"
              >
                <View className="flex-row items-center">
                  <Text fontSize={14} className="text-[14px] font-[Kanit-Light]">
                    {t("profile.Language")}
                  </Text>
                  <Text fontSize={12} className="text-[12px] text-gray-500 font-[Kanit-Light] ml-2">
                    ({getCurrentLanguageName()})
                  </Text>
                </View>
                {swap(
                  <ChevronRight size={25} color="#000000" strokeWidth={1} />,
                  <ChevronLeft size={25} color="#000000" strokeWidth={1} />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={handleLogout} className="px-6 py-4 " >
              <Text className="text-[14px] text-red-400 font-[Kanit-Regular]" >{t("Logout")}</Text>
            </TouchableOpacity>

            <View className="px-6 space-y-6 border-t-[11px] border-[#F7F7F7]">
              {[
                [t("profile.Terms & Conditions"), "/"],
                [t("profile.Privacy Policy"), "/"],
              ].map(([label, route], idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => router.push(route as Href)}
                  className={cn(
                    "flex-row items-center justify-between pt-4",
                    idx !== 3 && "border-b border-dashed border-gray-200 pb-4"
                  )}
                >
                  <Text
                    fontSize={14}
                    className="text-[14px] font-[Kanit-Light]"
                  >
                    {label}
                  </Text>
                  {swap(
                    <ChevronRight size={25} color="#000000" strokeWidth={1} />,
                    <ChevronLeft size={25} color="#000000" strokeWidth={1} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
            <View className="px-6 py-4 " >
              <Text className="text-[14px] text-red-400 font-[Kanit-Regular]" >{t("profile.Close my account")}</Text>
            </View>

          </View>

        )}
      </View>
      <Modal visible={modalVisible} transparent animationType="fade">
        <View className="flex-1 justify-end bg-black/30">
          {renderModalContent()}
        </View>
      </Modal>
    </ScrollView>
  );
}
