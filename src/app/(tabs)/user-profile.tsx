import React, { useCallback, useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Image,
  TouchableOpacity,
  ImageBackground,
  useWindowDimensions,
  Modal,
  FlatList,
} from "react-native";
import { Href, useRouter } from "expo-router";
import {
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  Pencil,
  Star,
  Trash2,
} from "lucide-react-native";
import Text from "@/components/common/text";
import CheckGreen from "../../../public/check-green.svg";
import ChatIcon from "../../../public/chat.svg";
import { Separator } from "@/components/ui/separator";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/hooks/useDirection";
import AsyncStorage from "@react-native-async-storage/async-storage";
import EmailModal from "@/components/modals/EmailModal";
import PreferencesModal from "@/components/modals/PreferencesModal";
import AboutModal from "@/components/modals/AboutModal";
import { handleLogOut, useGetProfileDetails } from "@/service/auth";
import { deleteVehicle, getVehicleList } from "@/service/vehicle";
import ProfileModal from "@/components/modals/ProfileModal";
import {
  changeLanguage,
  getCurrentLanguageName,
  getOppositeLanguageName,
} from "@/lib/languageUtils";
import { useStore } from "@/store/useStore";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import AlertDialog from "@/components/ui/alert-dialog";

type ModalTypes = "email" | "preferences" | "about" | "profile";

function normalizeTravelPreferences(prefs: any): string[] {
  if (!prefs) return [];
  if (Array.isArray(prefs) && prefs.every((p) => typeof p === "string")) {
    return prefs.filter((p) => p.trim().length > 0);
  }
  return [];
}

export default function ProfilePage() {
  const loaded = useLoadFonts();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { isRTL, swap } = useDirection();
  const tabKeys = ["about", "account"] as const;
  type TabKey = (typeof tabKeys)[number];
  const [activeTab, setActiveTab] = useState<TabKey>("about");
  const indicatorX = useSharedValue(0);
  const tabWidth = (246 + 6) / tabKeys.length;
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalTtype] = useState<ModalTypes>();
  const [vehicleList, setVehhicleList] = useState<any[]>([]);

  // Dialog states
  const [deleteVehicleDialog, setDeleteVehicleDialog] = useState({
    visible: false,
    vehicleId: null as number | null,
  });
  const [languageDialog, setLanguageDialog] = useState({
    visible: false,
    newLang: "",
    langName: "",
  });
  const [logoutDialog, setLogoutDialog] = useState({
    visible: false,
  });
  const [alertDialog, setAlertDialog] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info" as "info" | "warning" | "error" | "success",
  });

  const handleGetVehicles = async () => {
    try {
      const response = await getVehicleList();
      if (response.data) {
        setVehhicleList(response.data.vehicles);
        console.log(
          response.data.vehicles,
          "response.data.vehicles================"
        );
      }
    } catch (error: any) {
      console.error("Get vehicles error:", error);

      let errorMessage = t("Something went wrong");

      // Handle axios errors
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.response?.data) {
        // If response.data is a string
        if (typeof error.response.data === "string") {
          errorMessage = error.response.data;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }

      // Optionally show error to user
      setAlertDialog({
        visible: true,
        title: t("error"),
        message: errorMessage,
        type: "error",
      });
    }
  };

  const handleDeleteVehicle = (vehicleId: number) => {
    setDeleteVehicleDialog({
      visible: true,
      vehicleId,
    });
  };

  const confirmDeleteVehicle = async () => {
    if (!deleteVehicleDialog.vehicleId) return;

    try {
      await deleteVehicle(deleteVehicleDialog.vehicleId);
      setAlertDialog({
        visible: true,
        title: t("profile.Success"),
        message: t("profile.Vehicle deleted successfully"),
        type: "success",
      });
      handleGetVehicles(); // Refresh list
    } catch (error: any) {
      console.error("Delete vehicle error:", error);

      let errorMessage = t("profile.Failed to delete vehicle");

      // Handle axios errors
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.response?.data) {
        // If response.data is a string
        if (typeof error.response.data === "string") {
          errorMessage = error.response.data;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.body?.message) {
        // Fallback for the original structure
        errorMessage = error.body.message;
      }

      setAlertDialog({
        visible: true,
        title: t("profile.Error"),
        message: errorMessage,
        type: "error",
      });
    } finally {
      setDeleteVehicleDialog({ visible: false, vehicleId: null });
    }
  };

  const confirmLanguageChange = async () => {
    if (!languageDialog.newLang) return;

    try {
      await changeLanguage(languageDialog.newLang, () => {
        refreshProfile();
      });
    } catch (error: any) {
      console.error("Language change error:", error);

      let errorMessage = t("Something went wrong");

      // Handle axios errors
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.response?.data) {
        // If response.data is a string
        if (typeof error.response.data === "string") {
          errorMessage = error.response.data;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }

      setAlertDialog({
        visible: true,
        title: t("error"),
        message: errorMessage,
        type: "error",
      });
    } finally {
      setLanguageDialog({ visible: false, newLang: "", langName: "" });
    }
  };

  const tabLabels = {
    about: t("About"),
    account: t("Account"),
  };

  const { setIsPublish, setPath } = useStore();

  useEffect(() => {
    handleGetVehicles();
    const index = tabKeys.indexOf(activeTab);
    const targetX = isRTL
      ? (tabKeys.length - 1 - index) * tabWidth // Reverse for RTL
      : index * tabWidth;
    indicatorX.value = withSpring(targetX, {
      damping: 20,
      stiffness: 90,
    });
  }, [activeTab, tabWidth, isRTL]);

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: tabWidth,
  }));

  const handleLogout = () => {
    setLogoutDialog({
      visible: true,
    });
  };

  const confirmLogout = () => {
    handleLogOut()
      .then(() => {
        AsyncStorage.removeItem("userDetails");
        setIsPublish(false);
        router.replace("/login");
      })
      .catch((err: any) => {
        console.error("Logout error:", err);

        let errorMessage = t("Something went wrong");

        // Handle axios errors
        if (err?.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err?.response?.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err?.response?.data) {
          // If response.data is a string
          if (typeof err.response.data === "string") {
            errorMessage = err.response.data;
          }
        } else if (err?.message) {
          errorMessage = err.message;
        }

        setAlertDialog({
          visible: true,
          title: t("error"),
          message: errorMessage,
          type: "error",
        });
      })
      .finally(() => {
        setLogoutDialog({ visible: false });
      });
  };

  const [userDetails, setUserDetails] = useState<any>(null);

  const refreshProfile = useCallback(async () => {
    try {
      const res = await useGetProfileDetails();
      console.log("userData============", res.data);
      if (res?.data?.first_name !== "") {
        setUserDetails(res.data);
      } else {
        router.replace("/login");
      }
    } catch (error: any) {
      console.error("Profile refresh error:", error);

      // Handle axios errors for debugging
      if (error?.response?.data?.message) {
        console.log("API Error:", error.response.data.message);
      } else if (error?.response?.data?.error) {
        console.log("API Error:", error.response.data.error);
      } else if (error?.message) {
        console.log("Error:", error.message);
      }

      // Redirect to login on profile fetch failure
      router.replace("/login");
    }
  }, []);

  /* first load */
  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const renderModalContent = () => {
    const onClose = () => {
      setModalTtype(undefined);
      setModalVisible(false);
      refreshProfile(); // ← always refresh when any modal closes
    };

    switch (modalType) {
      case "email":
        return <EmailModal onClose={onClose} />;
      case "preferences":
        return <PreferencesModal onClose={onClose} />;
      case "about":
        return <AboutModal onClose={onClose} />;
      case "profile":
        return <ProfileModal onClose={onClose} />;
      default:
        return null;
    }
  };

  if (!loaded) return null;

  console.log("userdetails===============", userDetails);

  return (
    <View className="bg-white flex-1">
      {/* Sticky Hero Section */}
      <ImageBackground
        className="w-full h-max"
        source={require("../../../public/hero.png")}
        resizeMode="cover"
      >
        <View className="mx-auto w-full max-w-7xl p-6 pt-16">
          <Text
            fontSize={24}
            fontWeight="medium"
            className="text-2xl text-white"
          >
            {t("Profile")}
          </Text>
          <View className="mt-6 flex-col flex-wrap justify-between">
            <View
              className={cn(
                "flex flex-row gap-[30px] items-center",
                isRTL && "flex-row-reverse"
              )}
            >
              <Image
                source={
                  userDetails?.profile_image_url
                    ? { uri: userDetails?.profile_image_url }
                    : require(`../../../public/profile-image.jpg.webp`)
                }
                className="size-[80px] rounded-2xl"
                resizeMode="cover"
              />
              <View className="flex-1">
                <View
                  className={cn(
                    "flex-row justify-between items-center",
                    isRTL && "flex-row-reverse"
                  )}
                >
                  <Text
                    fontSize={25}
                    fontWeight="regular"
                    className="text-[25px] text-white"
                  >
                    {userDetails?.first_name}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setModalTtype("profile");
                      setModalVisible(true);
                    }}
                    className={cn(
                      "flex-row items-center bg-transparent border border-gray-200 rounded-full px-[18px] py-[6px]",
                      isRTL && "flex-row-reverse"
                    )}
                  >
                    <Pencil size={14} color="#FF4848" strokeWidth={1} />
                    <Text
                      fontSize={12}
                      fontWeight="light"
                      className={cn(
                        "text-[12px] text-white",
                        isRTL ? "mr-1" : "ml-1"
                      )}
                    >
                      {t("Edit")}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View
                  className={cn(
                    "flex-row items-center mt-2 gap-[10px]",
                    isRTL && "flex-row-reverse"
                  )}
                >
                  <Text
                    fontSize={16}
                    fontWeight="regular"
                    className="text-base text-white"
                  >
                    {userDetails?.avg_rating}
                  </Text>
                  <Star
                    size={16}
                    fill="#FF9C00"
                    strokeWidth={0}
                    className={isRTL ? "mr-1" : "ml-1"}
                  />
                </View>
              </View>
            </View>
            <View className="w-full text-white py-6">
              {[
                [t("Phone Number"), userDetails?.mobile_number],
                [t("Mail"), userDetails?.email],
                [t("Age"), -+Number(userDetails?.calculated_age)],
                [t("Gender"), userDetails?.gender_name],
              ].map(
                ([label, value], idx) =>
                  value && (
                    <View
                      key={idx}
                      className={cn(
                        "flex-row py-1",
                        isRTL && "flex-row-reverse"
                      )}
                    >
                      <Text
                        fontSize={14}
                        fontWeight="light"
                        className="flex-1 text-[14px] text-white"
                        style={{ textAlign: isRTL ? "right" : "left" }}
                      >
                        {label}
                      </Text>
                      <Text
                        fontSize={14}
                        fontWeight="light"
                        className="w-[20px] text-center text-[14px] text-white"
                      >
                        :
                      </Text>
                      <Text
                        fontSize={14}
                        fontWeight="light"
                        className={cn(
                          "flex-1 text-[14px] text-white",
                          isRTL ? "mr-1" : "ml-1"
                        )}
                        style={{ textAlign: isRTL ? "left" : "left" }}
                      >
                        {value}
                      </Text>
                    </View>
                  )
              )}
            </View>
          </View>
        </View>
      </ImageBackground>

      {/* Tab Switcher - Also Sticky */}
      <View
        className={cn(
          "flex-row h-[40px] bg-white border border-[#EBEBEB] rounded-full overflow-hidden mt-[20px] max-w-[246px] mx-auto",
          isRTL && "flex-row-reverse"
        )}
      >
        <Animated.View
          style={animatedIndicatorStyle}
          className="rounded-full bg-[#FF4848] h-[38px] absolute z-0"
        />
        {(isRTL ? [...tabKeys].reverse() : tabKeys).map((key) => {
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
                fontWeight="regular"
                className={cn(
                  "text-[15px] z-10 transition-all duration-700",
                  isActive ? "text-white" : "text-[#666666]"
                )}
              >
                {tabLabels[key]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Scrollable Content Area */}
      <ScrollView
        className="flex-1 bg-white"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View>
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
                        onPress={() => {}}
                        activeOpacity={0.8}
                      >
                        <CheckGreen width={18} height={18} />
                        <Text
                          fontSize={14}
                          fontWeight="light"
                          className="ml-4 text-[14px]"
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
                      fontWeight="light"
                      className="ml-4 text-[14px]"
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
                    fontWeight="light"
                    className="ml-4 text-[14px]"
                  >
                    {t("Confirmed phone number")}
                  </Text>
                </TouchableOpacity> */}
                </View>
              </View>

              {/* Travel Preferences */}
              <View className="px-6 py-8">
                <View
                  className={cn(
                    "flex-row justify-between items-center mb-[20px]",
                    isRTL && "flex-row-reverse"
                  )}
                >
                  <Text
                    fontSize={16}
                    fontWeight="regular"
                    className="text-[16px]"
                  >
                    {t("Travel Preferences")}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setModalTtype("preferences");
                      setModalVisible(true);
                    }}
                    className={cn(
                      "flex-row items-center bg-transparent border border-gray-200 rounded-full h-max px-5 py-1.5",
                      isRTL && "flex-row-reverse"
                    )}
                  >
                    <Pencil size={12} color="#FF4848" />
                    <Text
                      fontSize={14}
                      className={cn("text-sm", isRTL ? "mr-1" : "ml-1")}
                    >
                      {normalizeTravelPreferences(
                        userDetails?.travel_preferences
                      ).length > 0
                        ? t("Edit")
                        : t("Add Travel Preferences")}
                    </Text>
                  </TouchableOpacity>
                </View>
                {(() => {
                  const travelPreferences = normalizeTravelPreferences(
                    userDetails?.travel_preferences
                  );

                  return travelPreferences.length > 0 ? (
                    <View className="flex-wrap flex-row gap-[15px]">
                      {travelPreferences.map((text: string) => (
                        <View
                          key={text}
                          className={cn(
                            "border border-gray-200 rounded-full flex-row items-center px-4 py-2",
                            isRTL && "flex-row-reverse"
                          )}
                        >
                          <ChatIcon width={21} height={21} />
                          <Text
                            className={cn("text-sm", isRTL ? "mr-2" : "ml-2")}
                            fontWeight="light"
                          >
                            {text}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text
                      fontSize={14}
                      fontWeight="light"
                      className="bg-gray-100 text-gray-500 rounded-2xl p-4 text-sm leading-relaxed"
                      style={{ textAlign: isRTL ? "right" : "left" }}
                    >
                      {t("Add your travel preferences here")}
                    </Text>
                  );
                })()}
              </View>

              {/* About You */}
              <View className="px-6 mb-[30px]">
                <View
                  className={cn(
                    "flex-row justify-between items-center mb-[20px]",
                    isRTL && "flex-row-reverse"
                  )}
                >
                  <Text
                    fontSize={16}
                    fontWeight="regular"
                    className="text-[16px]"
                  >
                    {t("About you")}
                  </Text>
                  <TouchableOpacity
                    className={cn(
                      "flex-row items-center bg-transparent border border-gray-200 rounded-full h-8 px-3",
                      isRTL && "flex-row-reverse"
                    )}
                    onPress={() => {
                      setModalTtype("about");
                      setModalVisible(true);
                    }}
                  >
                    <Pencil size={12} color="#FF4848" />
                    <Text
                      fontSize={14}
                      fontWeight="light"
                      className={cn("text-sm", isRTL ? "mr-1" : "ml-1")}
                    >
                      {userDetails?.about ? t("Edit") : t("Add About")}
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text
                  fontSize={14}
                  fontWeight="light"
                  className={`rounded-2xl p-4 text-sm leading-relaxed ${
                    userDetails?.about
                      ? "bg-gray-100 text-black"
                      : "bg-gray-100 text-gray-500"
                  }`}
                  style={{ textAlign: isRTL ? "right" : "left" }}
                >
                  {userDetails?.about || t("Add about you here")}
                </Text>
              </View>

              {/* Vehicles */}
              <View className="px-6 pb-8">
                <Text
                  fontSize={16}
                  fontWeight="regular"
                  className="text-[16px] mb-6"
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
                        <View
                          className={cn(
                            "flex-row justify-between items-center py-2",
                            isRTL && "flex-row-reverse"
                          )}
                        >
                          <View
                            className={cn("flex-1", isRTL ? "ml-4" : "mr-4")}
                          >
                            <Text
                              fontSize={16}
                              fontWeight="medium"
                              className="text-[16px] mb-1"
                              style={{ textAlign: isRTL ? "right" : "left" }}
                            >
                              {item?.model?.name}
                            </Text>
                            <Text
                              fontSize={12}
                              fontWeight="light"
                              className="text-[12px] text-gray-600"
                              style={{ textAlign: isRTL ? "right" : "left" }}
                            >
                              {item?.model?.category_name}, {item?.brand?.name}
                            </Text>
                            <Text
                              fontSize={11}
                              fontWeight="light"
                              className="text-[11px] text-gray-500 mt-1"
                              style={{ textAlign: isRTL ? "right" : "left" }}
                            >
                              {item?.year}
                            </Text>
                          </View>
                          <View
                            className={cn(
                              "flex-row gap-4",
                              isRTL && "flex-row-reverse"
                            )}
                          >
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
                    <Text className="text-gray-400 text-sm" fontWeight="light">
                      {t("profile.No vehicles added yet")}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  onPress={() => {
                    setPath("/user-profile");
                    router.push("/(profile)/add-vehicles");
                  }}
                  className={cn(
                    "flex-row items-center justify-center h-14 rounded-full bg-red-500 mt-2",
                    isRTL && "flex-row-reverse"
                  )}
                  activeOpacity={0.8}
                >
                  <CirclePlus size={20} color="#fff" strokeWidth={1} />
                  <Text
                    fontSize={18}
                    fontWeight="regular"
                    className={cn(
                      "text-lg text-white",
                      isRTL ? "mr-2" : "ml-2"
                    )}
                  >
                    {t("Add vehicle")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View>
              {/* Account Menu Items */}
              <View className="px-6 space-y-6 border-t-[11px] border-[#F7F7F7]">
                {[
                  [t("notifications.title"), "/notifications"],
                  [t("profile.Bank Account"), "/(profile)/bank"],
                  [t("profile.Transactions"), "/(profile)/transactions"],
                  // [t("Payment & Refunds"), "/"],
                ].map(([label, route], idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => router.push(route as Href)}
                    className={cn(
                      "flex-row items-center justify-between pt-4",
                      isRTL && "flex-row-reverse",
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
                      <ChevronRight
                        size={25}
                        color="#000000"
                        strokeWidth={1}
                      />,
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

                    setLanguageDialog({
                      visible: true,
                      newLang,
                      langName,
                    });
                  }}
                  className={cn(
                    "flex-row items-center justify-between",
                    isRTL && "flex-row-reverse"
                  )}
                >
                  <View
                    className={cn(
                      "flex-row items-center",
                      isRTL && "flex-row-reverse"
                    )}
                  >
                    <Text
                      fontSize={14}
                      fontWeight="light"
                      className="text-[14px]"
                    >
                      {t("profile.Language")}
                    </Text>
                    <Text
                      fontSize={12}
                      fontWeight="light"
                      className={cn(
                        "text-[12px] text-gray-500",
                        isRTL ? "mr-2" : "ml-2"
                      )}
                    >
                      ({getCurrentLanguageName()})
                    </Text>
                  </View>
                  {swap(
                    <ChevronRight size={25} color="#000000" strokeWidth={1} />,
                    <ChevronLeft size={25} color="#000000" strokeWidth={1} />
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={handleLogout} className="px-6 py-4 ">
                <Text fontWeight="regular" className="text-[14px] text-red-400">
                  {t("Logout")}
                </Text>
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
                      isRTL && "flex-row-reverse",
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
                      <ChevronRight
                        size={25}
                        color="#000000"
                        strokeWidth={1}
                      />,
                      <ChevronLeft size={25} color="#000000" strokeWidth={1} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
              <View className="px-6 py-4 ">
                <Text fontWeight="regular" className="text-[14px] text-red-400">
                  {t("profile.Close my account")}
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View className="flex-1 justify-end bg-black/30">
          {renderModalContent()}
        </View>
      </Modal>

      {/* Delete Vehicle Confirmation Dialog */}
      <ConfirmDialog
        visible={deleteVehicleDialog.visible}
        onClose={() =>
          setDeleteVehicleDialog({ visible: false, vehicleId: null })
        }
        title={t("profile.Delete Vehicle")}
        message={t("profile.Are you sure you want to delete this vehicle?")}
        confirmText={t("profile.Delete")}
        cancelText={t("profile.Cancel")}
        onConfirm={confirmDeleteVehicle}
        onCancel={() =>
          setDeleteVehicleDialog({ visible: false, vehicleId: null })
        }
        type="destructive"
      />

      {/* Language Change Confirmation Dialog */}
      <ConfirmDialog
        visible={languageDialog.visible}
        onClose={() =>
          setLanguageDialog({ visible: false, newLang: "", langName: "" })
        }
        title={t("profile.Select Language")}
        message={`${t("Change Language")} ${languageDialog.langName}?`}
        confirmText={t("profile.ok")}
        cancelText={t("profile.Cancel")}
        onConfirm={confirmLanguageChange}
        onCancel={() =>
          setLanguageDialog({ visible: false, newLang: "", langName: "" })
        }
      />

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        visible={logoutDialog.visible}
        onClose={() => setLogoutDialog({ visible: false })}
        title={t("Logout")}
        message={t("profile.Are you sure you want to logout?")}
        confirmText={t("Logout")}
        cancelText={t("profile.Cancel")}
        onConfirm={confirmLogout}
        onCancel={() => setLogoutDialog({ visible: false })}
        type="destructive"
      />

      {/* Alert Dialog */}
      <AlertDialog
        visible={alertDialog.visible}
        onClose={() =>
          setAlertDialog({
            visible: false,
            title: "",
            message: "",
            type: "info",
          })
        }
        title={alertDialog.title}
        message={alertDialog.message}
        type={alertDialog.type}
        confirmText={t("profile.ok")}
      />
    </View>
  );
}
