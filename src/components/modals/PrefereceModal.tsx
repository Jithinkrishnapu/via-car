import { FlatList, TextInput, TouchableOpacity, View } from "react-native";
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
    if (!raw) return [];
    return raw
      .split(',')
      .map((t: string) => t.trim())
      .filter(Boolean); // ignore empty chunks
  }, [userDetails,setUserDetails]);

  console.log("travelPref======================",userDetails)

  /* 2️⃣  row renderer */
  const renderTag = ({ item }: { item: string }) => (
    <View className="border border-gray-200 rounded-full flex-row items-center px-4 py-2">
      <ChatIcon width={21} height={21} />
      <Text className="ml-2 text-sm font-[Kanit-Light]">{item}</Text>
    </View>
  );

  return (
    <View className="bg-white h-[60%] px-12 lg:px-24 pt-12 lg:pt-24 rounded-t-3xl items-center">
      <TouchableOpacity
        className="rounded-full absolute right-8 top-8 items-center justify-center"
        onPress={onClose}
      >
        <X color="#000" />
      </TouchableOpacity>

      <View className="flex-1 w-full">
        <Text className="text-[16px] font-[Kanit-Medium] text-center mb-5">
          Preferences
        </Text>

        <View className="bg-[#F1F1F5] mb-4 h-[50px] items-center justify-between flex-row rounded-full px-4">
          <TextInput
            className="w-[70%] h-[50px]"
            placeholder="Enter travel preferences"
            value={input}
            onChangeText={setInput}
            returnKeyType="done"
            onSubmitEditing={handleAddPreference}
          />
          <TouchableOpacity
            className="bg-[#FF4848] rounded-full w-[50px] h-[30px] items-center justify-center"
            onPress={handleAddPreference}
          >
            <Text className="text-white text-[14px] font-[Kanit-Regular]">
              {t("profile.add")}
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={userDetails?.travel_preferences?.toString()?.split(",")}
          renderItem={renderTag}
          keyExtractor={(item) => item}
          horizontal={false}          // vertical flow
          numColumns={1000}           // wrap behaviour (flex-wrap)
          columnWrapperClassName="flex-wrap gap-[15px]"
          showsVerticalScrollIndicator={false}
          className="w-full"
        />
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