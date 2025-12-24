import {
    TextInput,
    TouchableOpacity,
    View,
    Image,
    Platform,
    ActivityIndicator,
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
  import AlertDialog from "../ui/alert-dialog";
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
    const [loading, setLoading] = useState(false);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  
    /* -------------- NEW: image -------------- */
    const [pickedUri, setPickedUri] = useState<string | null>(null); // local preview
    const [pickedFile, setPickedFile] = useState<any | null>(null);  // blob for FormData
  
    /* -------------- validation errors -------------- */
    const [validationErrors, setValidationErrors] = useState({
      firstName: "",
      lastName: "",
      email: "",
      mobileNumber: "",
      category: "",
      dob: "",
    });
  
    /* -------------- dialog state -------------- */
    const [dialog, setDialog] = useState<{
      visible: boolean;
      title: string;
      message: string;
      type: "info" | "warning" | "error" | "success";
      onConfirm?: () => void;
    }>({
      visible: false,
      title: "",
      message: "",
      type: "info",
    });
  
    const categories = [
      { label: "Male", value: "1" },
      { label: "Female", value: "2" },
      { label: "Other", value: "3" },
    ];
  
    /* -------------- validation functions -------------- */
    const validateEmail = (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email.trim());
    };
  
    const validateMobileNumber = (mobile: string): boolean => {
      const mobileRegex = /^[\+]?[1-9][\d]{0,15}$/;
      return mobileRegex.test(mobile.trim());
    };
  
    const validateForm = (): boolean => {
      const errors = {
        firstName: "",
        lastName: "",
        email: "",
        mobileNumber: "",
        category: "",
        dob: "",
      };
  
      let isValid = true;
  
      // First name validation
      if (!firstName.trim()) {
        errors.firstName = "First name is required";
        isValid = false;
      } else if (firstName.trim().length < 2) {
        errors.firstName = "First name must be at least 2 characters";
        isValid = false;
      }
  
      // Last name validation
      if (!lastName.trim()) {
        errors.lastName = "Last name is required";
        isValid = false;
      } else if (lastName.trim().length < 2) {
        errors.lastName = "Last name must be at least 2 characters";
        isValid = false;
      }
  
      // Email validation
      if (!email.trim()) {
        errors.email = "Email is required";
        isValid = false;
      } else if (!validateEmail(email)) {
        errors.email = "Please enter a valid email address";
        isValid = false;
      }
  
      // Mobile number validation
      if (!mobileNumber.trim()) {
        errors.mobileNumber = "Mobile number is required";
        isValid = false;
      } else if (!validateMobileNumber(mobileNumber)) {
        errors.mobileNumber = "Please enter a valid mobile number";
        isValid = false;
      }
  
      // Category validation
      if (!category) {
        errors.category = "Please select your gender";
        isValid = false;
      }
  
      // DOB validation
      if (!dob) {
        errors.dob = "Date of birth is required";
        isValid = false;
      } else {
        const age = new Date().getFullYear() - new Date(dob).getFullYear();
        if (age < 18) {
          errors.dob = "You must be at least 18 years old";
          isValid = false;
        }
      }
  
      setValidationErrors(errors);
      return isValid;
    };
  
    /* -------------- dialog helpers -------------- */
    const showDialog = (
      title: string,
      message: string,
      type: "info" | "warning" | "error" | "success" = "info",
      onConfirm?: () => void
    ) => {
      setDialog({
        visible: true,
        title,
        message,
        type,
        onConfirm,
      });
    };
  
    const closeDialog = () => {
      setDialog(prev => ({ ...prev, visible: false }));
    };
  
    /* -------------- prefetch & pre-fill -------------- */
    useFocusEffect(
      useCallback(() => {
        let isActive = true;
        (async () => {
          try {
            setIsLoadingProfile(true);
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
            console.error("Error loading profile:", e);
            showDialog(
              "Error",
              "Failed to load profile data. Please try again.",
              "error"
            );
          } finally {
            if (isActive) {
              setIsLoadingProfile(false);
            }
          }
        })();
        return () => { isActive = false; };
      }, [])
    );
  
    /* -------------- NEW: pick image -------------- */
    const pickImage = async () => {
      try {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          showDialog(
            "Permission Required",
            "Please allow access to photos to upload a profile picture.",
            "warning"
          );
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
          
          // Check file size (limit to 5MB)
          if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
            showDialog(
              "File Too Large",
              "Please select an image smaller than 5MB.",
              "warning"
            );
            return;
          }
          
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
      } catch (error) {
        console.error("Error picking image:", error);
        showDialog(
          "Error",
          "Failed to select image. Please try again.",
          "error"
        );
      }
    };
  
    /* -------------- date change -------------- */
    const handleDateChange = (date: Date, formattedDate: string) => {
      setDob(date.toISOString().split("T")[0]);
      setFormattedDob(formattedDate);
      const age = new Date().getFullYear() - date.getFullYear();
      const dobError = age < 18 ? "You must be at least 18 years old." : "";
      setError(dobError);
      
      // Clear validation error for DOB if valid
      if (!dobError) {
        setValidationErrors(prev => ({ ...prev, dob: "" }));
      }
    };
  
    /* -------------- input change handlers -------------- */
    const handleFirstNameChange = (text: string) => {
      setFirstName(text);
      if (validationErrors.firstName) {
        setValidationErrors(prev => ({ ...prev, firstName: "" }));
      }
    };
  
    const handleLastNameChange = (text: string) => {
      setLastName(text);
      if (validationErrors.lastName) {
        setValidationErrors(prev => ({ ...prev, lastName: "" }));
      }
    };
  
    const handleEmailChange = (text: string) => {
      setEmail(text);
      if (validationErrors.email) {
        setValidationErrors(prev => ({ ...prev, email: "" }));
      }
    };
  
    const handleMobileNumberChange = (text: string) => {
      setMobileNumber(text);
      if (validationErrors.mobileNumber) {
        setValidationErrors(prev => ({ ...prev, mobileNumber: "" }));
      }
    };
  
    const handleCategoryChange = (value: string | number) => {
      setCategory(String(value));
      if (validationErrors.category) {
        setValidationErrors(prev => ({ ...prev, category: "" }));
      }
    };
  
    /* -------------- submit -------------- */
    const handleAddPreference = async () => {
      if (error || loading) return;
  
      // Validate form
      if (!validateForm()) {
        showDialog(
          "Validation Error",
          "Please fix the errors below and try again.",
          "warning"
        );
        return;
      }
  
      try {
        setLoading(true);
  
        const form = new FormData();
        form.append("first_name", firstName.trim());
        form.append("last_name", lastName.trim());
        form.append("email", email.trim());
        form.append("mobile_number", mobileNumber.trim());
        form.append("gender", category);
        form.append("date_of_birth", dob);
  
        /* -------------- NEW: attach image -------------- */
        if (pickedFile) {
          form.append("profile_image", pickedFile as any); // same field name as curl
        }
  
        console.log("update request:", form);
  
        const result = await useUpdateProfileDetails(form);
        console.log("update response:", result);
  
        if (result?.success || result?.data) {
          showDialog(
            "Success",
            "Profile updated successfully!",
            "success",
            () => {
              closeDialog();
              onClose?.();
            }
          );
        } else {
          throw new Error(result?.message || "Failed to update profile");
        }
      } catch (error: any) {
        console.error("Profile update error:", error);
        
        let errorMessage = "Failed to update profile. Please try again.";
        
        // Handle specific error cases
        if (error?.response?.status === 422) {
          errorMessage = "Please check your input data and try again.";
        } else if (error?.response?.status === 413) {
          errorMessage = "The uploaded image is too large. Please select a smaller image.";
        } else if (error?.message) {
          errorMessage = error.message;
        }
        
        showDialog(
          "Update Failed",
          errorMessage,
          "error"
        );
      } finally {
        setLoading(false);
      }
    };
  
    /* -------------- render -------------- */
    if (isLoadingProfile) {
      return (
        <View className="bg-white h-[80%] rounded-t-3xl items-center justify-center">
          <ActivityIndicator size="large" color="#FF4848" />
          <Text className="text-[16px] font-[Kanit-Light] mt-4 text-gray-600">
            Loading profile...
          </Text>
        </View>
      );
    }
  
    return (
      <View className="bg-white h-[80%] rounded-t-3xl">
        <TouchableOpacity
          className="rounded-full absolute right-8 top-8 items-center justify-center z-10"
          onPress={onClose}
          disabled={loading}
        >
          <X color={loading ? "#ccc" : "#000"} />
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
            disabled={loading}
            className={`self-center mb-4 w-24 h-24 rounded-full bg-neutral-200 items-center justify-center overflow-hidden ${loading ? 'opacity-50' : ''}`}
          >
            {pickedUri ? (
              <Image source={{ uri: pickedUri }} className="w-full h-full" />
            ) : (
              <Text className="text-neutral-500 text-sm">+ Photo</Text>
            )}
          </TouchableOpacity>
  
          {/* ---------- inputs ---------- */}
          <View className="bg-[#F1F1F5] mb-2 h-[50px] items-center justify-between flex-row rounded-full px-4">
            <TextInput
              className="w-[70%] h-[50px]"
              placeholder="First Name"
              placeholderTextColor={"grey"}
              value={firstName}
              onChangeText={handleFirstNameChange}
              returnKeyType="done"
              editable={!loading}
            />
          </View>
          {validationErrors.firstName ? (
            <Text className="text-red-500 text-xs mb-2 ml-4">{validationErrors.firstName}</Text>
          ) : null}
  
          <View className="bg-[#F1F1F5] mb-2 h-[50px] items-center justify-between flex-row rounded-full px-4">
            <TextInput
              className="w-[70%] h-[50px]"
              placeholder="Last Name"
              placeholderTextColor={"grey"}
              value={lastName}
              onChangeText={handleLastNameChange}
              returnKeyType="done"
              editable={!loading}
            />
          </View>
          {validationErrors.lastName ? (
            <Text className="text-red-500 text-xs mb-2 ml-4">{validationErrors.lastName}</Text>
          ) : null}
  
          <View className="bg-[#F1F1F5] mb-2 h-[50px] items-center justify-between flex-row rounded-full px-4">
            <TextInput
              className="w-[70%] h-[50px]"
              placeholder="Email"
              placeholderTextColor={"grey"}
              value={email}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              returnKeyType="done"
              editable={!loading}
              autoCapitalize="none"
            />
          </View>
          {validationErrors.email ? (
            <Text className="text-red-500 text-xs mb-2 ml-4">{validationErrors.email}</Text>
          ) : null}
  
          <View className="bg-[#F1F1F5] mb-2 h-[50px] items-center justify-between flex-row rounded-full px-4">
            <TextInput
              className="w-[70%] h-[50px]"
              placeholder="Phone Number"
              placeholderTextColor={"grey"}
              value={mobileNumber}
              onChangeText={handleMobileNumberChange}
              keyboardType="phone-pad"
              returnKeyType="done"
              editable={!loading}
            />
          </View>
          {validationErrors.mobileNumber ? (
            <Text className="text-red-500 text-xs mb-2 ml-4">{validationErrors.mobileNumber}</Text>
          ) : null}
  
          <DobPicker
            onDateChange={handleDateChange}
            errorMessage={error}
            minimumAge={18}
            initialDate={dob ? new Date(dob) : undefined}
          />
          {validationErrors.dob ? (
            <Text className="text-red-500 text-xs mb-2 ml-4">{validationErrors.dob}</Text>
          ) : null}
  
          <View className="mb-2">
            <CustomPicker
              label="Select Gender"
              items={categories}
              selectedValue={category}
              onValueChange={handleCategoryChange}
              placeholder="Choose your gender"
              style="w-full"
            />
          </View>
          {validationErrors.category ? (
            <Text className="text-red-500 text-xs mb-5 ml-4">{validationErrors.category}</Text>
          ) : (
            <View className="mb-5" />
          )}

          {/* ---------- save button ---------- */}
          <TouchableOpacity
            className={`bg-[#FF4848] rounded-full w-full h-[50px] items-center justify-center mt-6 ${loading || error ? 'opacity-50' : ''}`}
            onPress={handleAddPreference}
            disabled={loading || !!error}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white text-[14px] font-[Kanit-Regular]">
                {t("profile.save")}
              </Text>
            )}
          </TouchableOpacity>
        </KeyboardAwareScrollView>
  
        {/* -------------- Alert Dialog -------------- */}
        <AlertDialog
          visible={dialog.visible}
          onClose={closeDialog}
          title={dialog.title}
          message={dialog.message}
          type={dialog.type}
          onConfirm={dialog.onConfirm}
          confirmText="OK"
        />
      </View>
    );
  };
  
  export default ProfileModal;