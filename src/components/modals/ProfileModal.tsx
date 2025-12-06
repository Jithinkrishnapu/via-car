import {
    TextInput,
    TouchableOpacity,
    View,
    Image,
    Alert,
    Platform,
  } from "react-native";
  import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
  import Text from "../common/text";
  import { X } from "lucide-react-native";
  import { useTranslation } from "react-i18next";
  import { useCallback, useState } from "react";
  import * as ImagePicker from "expo-image-picker";
  import { useUpdateProfileDetails } from "@/service/profile";
  import { useGetProfileDetails } from "@/service/auth";
  import DobPicker from "../common/dob-calander";
  import CustomPicker from "../common/dropdown-component";
  import { useFocusEffect } from "expo-router";
  
  const ProfileModal = ({ onClose }: { onClose?: () => void }) => {
    const { t } = useTranslation();
  
    /* -------------- local state -------------- */
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [category, setCategory] = useState<string>("");
    const [dob, setDob] = useState("");
    const [formattedDob, setFormattedDob] = useState("");
    const [error, setError] = useState("");
  
    /* -------------- NEW: image -------------- */
    const [pickedUri, setPickedUri] = useState<string | null>(null); // local preview
    const [pickedFile, setPickedFile] = useState<any | null>(null);  // blob for FormData
  
    const categories = [
      { label: "Male", value: "1" },
      { label: "Female", value: "2" },
      { label: "Other", value: "3" },
    ];
  
    /* -------------- prefetch & pre-fill -------------- */
    useFocusEffect(
      useCallback(() => {
        let isActive = true;
        (async () => {
          try {
            const res = await useGetProfileDetails();
            if (res?.data && isActive) {
              const u = res.data?.data ?? res.data;
              setFirstName(u.first_name ?? "");
              setLastName(u.last_name ?? "");
              setEmail(u.email ?? "");
              setMobileNumber(u.mobile_number ?? "");
              setCategory(String(u.gender ?? ""));
              if (u.date_of_birth) {
                setDob(u.date_of_birth);
                setFormattedDob(u.date_of_birth);
              }
              if (u.profile_image_url) setPickedUri(u.profile_image_url); // show existing
            }
          } catch (e) {
            /* ignore */
          }
        })();
        return () => { isActive = false; };
      }, [])
    );
  
    /* -------------- NEW: pick image -------------- */
    const pickImage = async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "Please allow access to photos.");
        return;
      }
  
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
  
      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        setPickedUri(asset.uri);
  
        // create blob ready for FormData
        const filename = asset.uri.split("/").pop()!;
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";
  
        setPickedFile({
          uri: asset.uri,
          name: filename,
          type,
        });
      }
    };
  
    /* -------------- date change -------------- */
    const handleDateChange = (date: Date, formattedDate: string) => {
      setDob(date.toISOString().split("T")[0]);
      setFormattedDob(formattedDate);
      const age = new Date().getFullYear() - date.getFullYear();
      setError(age < 18 ? "You must be at least 18 years old." : "");
    };
  
    /* -------------- submit -------------- */
    const handleAddPreference = async () => {
      if (error) return;
  
      const form = new FormData();
      form.append("first_name", firstName);
      form.append("last_name", lastName);
      form.append("email", email);
      form.append("mobile_number", mobileNumber);
      form.append("gender", category);
      form.append("date_of_birth", dob);
  
      /* -------------- NEW: attach image -------------- */
      if (pickedFile) {
        form.append("profile_image", pickedFile as any); // same field name as curl
      }
  
      console.log("update request:", form);
  
      const result = await useUpdateProfileDetails(form);
      console.log("update response:", result);
  
      onClose?.();
    };
  
    /* -------------- render -------------- */
    return (
      <View className="bg-white h-[80%] rounded-t-3xl">
        <TouchableOpacity
          className="rounded-full absolute right-8 top-8 items-center justify-center z-10"
          onPress={onClose}
        >
          <X color="#000" />
        </TouchableOpacity>
  
        <KeyboardAwareScrollView
          contentContainerStyle={{
            paddingHorizontal: 48,
            paddingTop: 48,
            paddingBottom: 24,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid={true}
          enableAutomaticScroll={true}
          extraScrollHeight={Platform.OS === 'ios' ? 20 : 40}
          extraHeight={150}
        >
          <Text className="text-[16px] font-[Kanit-Medium] text-center mb-5">
            Profile
          </Text>
  
          {/* -------------- NEW: image picker -------------- */}
          <TouchableOpacity
            onPress={pickImage}
            className="self-center mb-4 w-24 h-24 rounded-full bg-neutral-200 items-center justify-center overflow-hidden"
          >
            {pickedUri ? (
              <Image source={{ uri: pickedUri }} className="w-full h-full" />
            ) : (
              <Text className="text-neutral-500 text-sm">+ Photo</Text>
            )}
          </TouchableOpacity>
  
          {/* ---------- inputs ---------- */}
          <View className="bg-[#F1F1F5] mb-4 h-[50px] items-center justify-between flex-row rounded-full px-4">
            <TextInput
              className="w-[70%] h-[50px]"
              placeholder="First Name"
              placeholderTextColor={"grey"}
              value={firstName}
              onChangeText={setFirstName}
              returnKeyType="done"
            />
          </View>
  
          <View className="bg-[#F1F1F5] mb-4 h-[50px] items-center justify-between flex-row rounded-full px-4">
            <TextInput
              className="w-[70%] h-[50px]"
              placeholder="Last Name"
              placeholderTextColor={"grey"}
              value={lastName}
              onChangeText={setLastName}
              returnKeyType="done"
            />
          </View>
  
          <View className="bg-[#F1F1F5] mb-4 h-[50px] items-center justify-between flex-row rounded-full px-4">
            <TextInput
              className="w-[70%] h-[50px]"
              placeholder="Email"
              placeholderTextColor={"grey"}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              returnKeyType="done"
            />
          </View>
  
          <View className="bg-[#F1F1F5] mb-4 h-[50px] items-center justify-between flex-row rounded-full px-4">
            <TextInput
              className="w-[70%] h-[50px]"
              placeholder="Phone Number"
              placeholderTextColor={"grey"}
              value={mobileNumber}
              onChangeText={setMobileNumber}
              keyboardType="phone-pad"
              returnKeyType="done"
            />
          </View>
  
          <DobPicker
            onDateChange={handleDateChange}
            errorMessage={error}
            minimumAge={18}
            initialDate={dob ? new Date(dob) : undefined}
          />
  
          <View className="mb-5">
            <CustomPicker
              label="Select Gender"
              items={categories}
              selectedValue={category}
              onValueChange={(value) => setCategory(String(value))}
              placeholder="Choose your gender"
              style="w-full"
            />
          </View>

          {/* ---------- save button ---------- */}
          <TouchableOpacity
            className="bg-[#FF4848] rounded-full w-full h-[50px] items-center justify-center mt-6"
            onPress={handleAddPreference}
          >
            <Text className="text-white text-[14px] font-[Kanit-Regular]">
              {t("profile.save")}
            </Text>
          </TouchableOpacity>
        </KeyboardAwareScrollView>
      </View>
    );
  };
  
  export default ProfileModal;