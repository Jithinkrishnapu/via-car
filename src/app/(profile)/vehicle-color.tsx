import React, { useState } from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import Text from "@/components/common/text";
import ColorSearch from "@/components/common/color-search";
import Dialog from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/hooks/useDirection";
import { addVehicle } from "@/service/vehicle";
import { useStore } from "@/store/useStore";
import { handleApiError } from "@/utils/apiErrorHandler";

export default function VehiclePage() {
  const loaded = useLoadFonts();
  const router = useRouter();
  const { t } = useTranslation();
  const { isRTL, swap } = useDirection();
  const { vehicle_model_id, path,setPath } = useStore();
  const [selectedColor, setSelectedColor] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Dialog states
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogTitle, setDialogTitle] = useState('');

  if (!loaded) return null;

  const showError = (title: string, message: string) => {
    setDialogTitle(title);
    setDialogMessage(message);
    setShowErrorDialog(true);
  };

  const showSuccess = (title: string, message: string) => {
    setDialogTitle(title);
    setDialogMessage(message);
    setShowSuccessDialog(true);
  };

  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
    // Navigate to the specified path or default to pickup for publish flow
    if (typeof path === "string" && path.startsWith("/")) {
      router.replace(path as any);
      setPath("")
    } else {
      // Default to pickup for publish users
      setPath("")
      router.replace("/(tabs)/pickup");
    }
  };

  const handleAddVehicle = async () => {
    if (!selectedColor.trim()) {
      showError(t("error"), t("profile.pleaseSelectColor"));
      return;
    }

    if (!vehicle_model_id) {
      showError(t("error"), t("profile.vehicleModelRequired"));
      return;
    }

    try {
      setLoading(true);
      const formdata = new FormData();
      formdata.append("model_id", vehicle_model_id.toString());
      formdata.append("color", selectedColor.trim());
      formdata.append("year", "2021");

      const response = await addVehicle(formdata);
      console.log("Add vehicle response:", response);

      if (response?.ok) {
        showSuccess(t("success"), t("profile.vehicleAddedSuccessfully"));
      } else {
        // Handle non-ok response
        let errorMessage = t("profile.failedToAddVehicle");
        
        // Try to get more specific error message from response
        try {
          const errorData = await response.json();
          if (errorData?.message) {
            errorMessage = errorData.message;
          } else if (errorData?.error) {
            errorMessage = errorData.error;
          }
        } catch (parseError) {
          console.log("Could not parse error response:", parseError);
        }
        
        showError(t("error"), errorMessage);
      }
    } catch (error: any) {
      console.error("Add vehicle error:", error);
      
      let errorMessage = t("profile.failedToAddVehicle");
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      showError(t("error"), errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="font-[Kanit-Regular] flex-1 bg-white relative">
      <View className="px-6 pb-4 pt-16 flex-row items-center gap-4">
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.8}
          className="rounded-full size-[46px] border border-[#EBEBEB] items-center justify-center"
          disabled={loading}
        >
          {swap(
            <ChevronLeft size={24} color="#3C3F4E" />,
            <ChevronRight size={24} color="#3C3F4E" />
          )}
        </TouchableOpacity>
        <Text
          fontSize={24}
          className={swap(
            "text-2xl text-black font-[Kanit-Medium] ml-4",
            "text-2xl text-black font-[Kanit-Medium] mr-4"
          )}
        >
          {t("profile.vehicleColor")}
        </Text>
      </View>

      <View className="px-6 mt-6">
        <View className={loading ? "opacity-50" : "opacity-100"} pointerEvents={loading ? "none" : "auto"}>
          <ColorSearch
            name="pickup"
            placeholder={t("profile.enterVehicleName")}
            onSelect={(value) => setSelectedColor(value)}
          />
        </View>
      </View>
      
      <View className="absolute inset-x-0 bottom-10 px-6">
        <TouchableOpacity
          onPress={handleAddVehicle}
          activeOpacity={0.8}
          disabled={loading || !selectedColor.trim()}
          className={`h-14 rounded-full flex-row items-center justify-center ${
            loading || !selectedColor.trim() 
              ? 'bg-gray-400' 
              : 'bg-red-500'
          }`}
        >
          <Text
            fontSize={20}
            className="text-xl text-white font-[Kanit-Regular]"
          >
            {loading ? t("profile.adding") + "..." : t("profile.add")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Success Dialog */}
      <Dialog
        visible={showSuccessDialog}
        onClose={handleSuccessDialogClose}
        title={dialogTitle}
        showButtons={true}
        confirmText={t("ok")}
        onConfirm={handleSuccessDialogClose}
      >
        <Text className="text-[16px] font-[Kanit-Regular] text-gray-700 text-center">
          {dialogMessage}
        </Text>
      </Dialog>

      {/* Error Dialog */}
      <Dialog
        visible={showErrorDialog}
        onClose={() => setShowErrorDialog(false)}
        title={dialogTitle}
        showButtons={true}
        confirmText={t("ok")}
        onConfirm={() => setShowErrorDialog(false)}
      >
        <Text className="text-[16px] font-[Kanit-Regular] text-gray-700 text-center">
          {dialogMessage}
        </Text>
      </Dialog>
    </View>
  );
}
