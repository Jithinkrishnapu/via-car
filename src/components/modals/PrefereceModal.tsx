import { FlatList, Pressable, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform } from "react-native";
import Text from "../common/text";
import ChatIcon from "../../../public/chat.svg";
import { X } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";
import { useUpdateProfileDetails } from "@/service/profile";
import { useGetProfileDetails } from "@/service/auth";

const PreferencesModal = ({ onClose }: { onClose?: () => void }) => {
  const { t } = useTranslation();
  const [input, setInput] = useState("");
  const [userDetails, setUserDetails] = useState<any>();

  useEffect(() => {
    (async () => {
      const res = await useGetProfileDetails();
      if (res?.data) setUserDetails(res.data);
    })();
  }, []);

  const handleAddPreference = async () => {
    if (!input.trim()) return;

    const newTag = input.trim();
    const current = userDetails?.travel_preferences ?? [];
    const updated = [...current, newTag];
    console.log(updated,"updated")
    setUserDetails((prev: any) => ({ ...prev, travel_preferences: updated }));

    const form = new FormData();
    form.append("travel_preferences[]", updated?.join(',')); // ← matches curl
    console.log(form)
    const result = await useUpdateProfileDetails(form);
    console.log(result)
    setInput("");
  };

  console.log("details===========",userDetails?.travel_preferences)

  const tags = useMemo<string[]>(() => {
    const raw = userDetails?.travel_preferences?.[0]; // “a,b,c”
    if (!raw || raw === "") return [];
    return raw
      .split(',')
      .map((t: string) => t.trim())
      .filter(Boolean); // ignore empty chunks
  }, [userDetails]);

  console.log("travelPref======================",userDetails)

  /* Remove preference */
  const handleRemovePreference = async (tagToRemove: string) => {
    // Get current tags and filter out the one to remove
    const updatedTags = tags.filter((t: string) => t !== tagToRemove);
    
    console.log("Removing:", tagToRemove);
    console.log("Current tags:", tags);
    console.log("Updated tags:", updatedTags);
    
    // Update local state - handle empty case properly
    setUserDetails((prev: any) => ({ 
      ...prev, 
      travel_preferences: updatedTags.length > 0 ? [updatedTags.join(',')] : [""] 
    }));

    // Send to backend
    const form = new FormData();
    
    if (updatedTags.length > 0) {
      // Send the updated tags as a comma-separated string
      form.append("travel_preferences[]", updatedTags.join(','));
    } else {
      // Send empty string to clear all preferences
      form.append("travel_preferences[]", "");
    }
    
    console.log("Sending to backend, count:", updatedTags.length);
    const result = await useUpdateProfileDetails(form);
    console.log("Remove result:", result);
  };

  /* 2️⃣  row renderer */
  const renderTag = ({ item }: { item: string }) => {
    if (!item || !item.trim()) return null; // Don't render empty items
    
    return (
      <View className="border border-gray-200 rounded-full flex-row items-center px-4 py-2">
        <ChatIcon width={21} height={21} />
        <Text className="ml-2 text-sm font-[Kanit-Light]">{item}</Text>
        <TouchableOpacity
          onPress={() => handleRemovePreference(item)}
          className="ml-2 -mr-1"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X size={16} color="#666666" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="bg-white h-[60%] rounded-t-3xl"
    >
      <View className="flex-1 px-12 lg:px-24 pt-12 lg:pt-24 items-center">
        <TouchableOpacity
          className="rounded-full absolute right-8 top-8 items-center justify-center"
          onPress={onClose}
        >
          <X color="#000" />
        </TouchableOpacity>

        <View className="flex-1 w-full">
          <Text className="text-[16px] text-black font-[Kanit-Medium] text-center mb-5">
            Preferences
          </Text>

          <View className="bg-[#F1F1F5] mb-4 h-[50px] items-center justify-between flex-row rounded-full px-4">
            <TextInput
              className="w-[70%] h-[50px]"
              placeholder="Enter travel preferences"
              placeholderTextColor={"black"}
              value={input}
              onChangeText={setInput}
              returnKeyType="done"
              onSubmitEditing={handleAddPreference}
            />
            <Pressable 
              className="bg-[#FF4848] rounded-full w-[50px] h-[30px] items-center justify-center"
              onPress={handleAddPreference}
            >
              <Text className="text-white text-[14px] font-[Kanit-Regular]">
                {t("profile.add")}
              </Text>
            </Pressable>
          </View>

          {tags.length > 0 ? (
            <FlatList
              data={tags}
              renderItem={renderTag}
              keyExtractor={(item, index) => `${item}-${index}`}
              horizontal={false}
              numColumns={1000}
              columnWrapperClassName="flex-wrap gap-[15px]"
              showsVerticalScrollIndicator={false}
              className="w-full flex-1"
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
          className="bg-[#FF4848] rounded-full w-full h-[50px] items-center justify-center mt-4 mb-4"
          onPress={onClose}
        >
          <Text className="text-white text-[14px] font-[Kanit-Regular]">
            {t("profile.save")}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default PreferencesModal;