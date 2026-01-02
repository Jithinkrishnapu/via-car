import { FlatList, TextInput, TouchableOpacity, View } from "react-native";
import Text from "../common/text";
import ChatIcon from "../../../public/chat.svg";
import { X } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useEffect, useState, useCallback } from "react";
import { useUpdateProfileDetails } from "@/service/profile";
import { useGetProfileDetails } from "@/service/auth";

interface UserDetails {
  travel_preferences?: string[];
  [key: string]: any;
}

const PreferencesModal = ({ onClose }: { onClose?: () => void }) => {
  const { t } = useTranslation();
  const [input, setInput] = useState("");
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch user profile details
  const fetchUserDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await useGetProfileDetails();
      if (response?.data) {
        setUserDetails(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch user details:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  // Normalize travel preferences to always be an array of strings
  const travelPreferences: string[] = (() => {
    if (!userDetails?.travel_preferences) return [];
    
    const prefs = userDetails.travel_preferences;
    
    // If it's already an array of strings, return it
    if (Array.isArray(prefs) && prefs.every(p => typeof p === 'string')) {
      return prefs.filter(p => p.trim().length > 0);
    }
    
    // If it's an array with comma-separated string (legacy format)
    if (Array.isArray(prefs) && prefs.length > 0 && typeof prefs[0] === 'string') {
      return prefs[0]
        .split(',')
        .map(p => p.trim())
        .filter(p => p.length > 0);
    }
    
    return [];
  })();

  // Update preferences on the server
  const updatePreferences = async (preferences: string[]) => {
    setIsUpdating(true);
    try {
      const form = new FormData();
      
      // Send each preference as a separate array item
      preferences.forEach(pref => {
        form.append("travel_preferences[]", pref);
      });
      
      // If no preferences, send empty array
      if (preferences.length === 0) {
        form.append("travel_preferences[]", "");
      }
      
      const result = await useUpdateProfileDetails(form);
      
      // Update local state with the new preferences
      setUserDetails(prev => prev ? {
        ...prev,
        travel_preferences: preferences
      } : null);
      
      return result;
    } catch (error) {
      console.error("Failed to update preferences:", error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddPreference = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    // Check for duplicates
    if (travelPreferences.includes(trimmedInput)) {
      setInput("");
      return;
    }

    const updatedPreferences = [...travelPreferences, trimmedInput];
    
    try {
      await updatePreferences(updatedPreferences);
      setInput("");
    } catch (error) {
      console.error("Failed to add preference:", error);
    }
  };

  const handleRemovePreference = async (tagToRemove: string) => {
    const updatedPreferences = travelPreferences.filter(pref => pref !== tagToRemove);
    
    try {
      await updatePreferences(updatedPreferences);
    } catch (error) {
      console.error("Failed to remove preference:", error);
    }
  };

  const renderTag = ({ item }: { item: string }) => {
    if (!item || !item.trim()) return null;
    
    return (
      <View className="border border-gray-200 rounded-full flex-row items-center px-4 py-2">
        <ChatIcon width={21} height={21} />
        <Text className="ml-2 text-sm font-[Kanit-Light]">{item}</Text>
        <TouchableOpacity
          onPress={() => handleRemovePreference(item)}
          className="ml-2 -mr-1"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          disabled={isUpdating}
        >
          <X size={16} color="#666666" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View className="bg-white h-[60%] px-12 lg:px-24 pt-12 lg:pt-24 rounded-t-3xl items-center">
      <TouchableOpacity
        className="rounded-full absolute right-8 top-8 items-center justify-center"
        onPress={onClose}
      >
        <X color="#000" />
      </TouchableOpacity>

      <View className="flex-1 w-full">
        <Text className="text-[16px] text-black font-[Kanit-Medium] text-center mb-5">
          {t("Preferences")}
        </Text>

        <View className="bg-[#F1F1F5] mb-4 h-[50px] items-center justify-between flex-row rounded-full px-4">
          <TextInput
            className="w-[70%] h-[50px]"
            placeholder={t("Enter travel preferences")}
            placeholderTextColor={"black"}
            value={input}
            onChangeText={setInput}
            returnKeyType="done"
            onSubmitEditing={handleAddPreference}
            editable={!isUpdating}
          />
          <TouchableOpacity
            className={`bg-[#FF4848] rounded-full w-[50px] h-[30px] items-center justify-center ${
              isUpdating || !input.trim() ? 'opacity-50' : ''
            }`}
            onPress={handleAddPreference}
            disabled={isUpdating || !input.trim()}
          >
            <Text className="text-white text-[14px] font-[Kanit-Regular]">
              {t("profile.add")}
            </Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View className="items-center justify-center py-8">
            <Text className="text-gray-400 text-sm font-[Kanit-Light]">
              {t("Loading...")}
            </Text>
          </View>
        ) : travelPreferences.length > 0 ? (
          <FlatList
            data={travelPreferences}
            renderItem={renderTag}
            keyExtractor={(item, index) => `${item}-${index}`}
            horizontal={false}
            numColumns={1000}
            columnWrapperClassName="flex-wrap gap-[15px]"
            showsVerticalScrollIndicator={false}
            className="w-full"
          />
        ) : (
          <View className="items-center justify-center py-8">
            <Text className="text-gray-400 text-sm font-[Kanit-Light]">
              {t("No preferences added yet")}
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        className="bg-[#FF4848] rounded-full w-full h-[50px] items-center justify-center mt-auto mb-4"
        onPress={onClose}
      >
        <Text className="text-white text-[14px] font-[Kanit-Regular]">
          {t("profile.save")}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default PreferencesModal;