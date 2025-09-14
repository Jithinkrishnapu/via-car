import Text from "@/components/common/text";
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import VerifyOtp from "@/components/login/verify-otp";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { InputComponent } from "@/components/inputs/common-input";
import Dropdown from "@/components/common/dropdown-component";
import { useState } from "react";
import CustomPicker from "@/components/common/dropdown-component";
import DatePicker from "@/components/common/date-picker";
import DobCalendarPicker from "@/components/common/dob-calander";
import DobPicker from "@/components/common/dob-calander";
import { handleRegister } from "@/service/auth";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";

const { height } = Dimensions.get("window");

function Register() {
  const { t } = useTranslation("index");
  const [category, setCategory] = useState<string>('');

  const categories = [
    { label: 'Male', value: '1' },
    { label: 'Female', value: '2' },
    { label: 'Other', value: '3' },
  ];

  const [dob, setDob] = useState('');
  const [formattedDob, setFormattedDob] = useState('');
  const [error, setError] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');


  const handleDateChange = (date: Date, formattedDate: string) => {
    setDob(date.toISOString().split('T')[0]);
    setFormattedDob(formattedDate);

    // Optional: Validate again
    const age = new Date().getFullYear() - date.getFullYear();
    if (age < 18) {
      setError('You must be at least 18 years old.');
    } else {
      setError('');
    }
  };

  const submit = () => {
    if (!dob) {
      setError('Date of birth is required.');
      return;
    }
    Alert.alert('Success', `DOB: ${formattedDob}`);
  };

  const handleRegistration =async()=>{
    const otpId = await useAsyncStorage("otp_id").getItem()
    const formdata = new FormData()
    formdata.append("otp_id",otpId!)
    formdata.append("device_type","1")
    formdata.append("first_name",firstName)
    formdata.append("last_name",lastName)
    formdata.append("date_of_birth",dob)
    formdata.append("gender",category)
    formdata.append("fcm_token","test")
    console.log("sheeet==========",formdata)
   try {
    const response = await handleRegister(formdata)
    if(response){
      console.log("response============",response)
      if (response?.data?.type === "login") {
        await useAsyncStorage('userDetails').setItem(JSON.stringify(response?.data))
        router.push(`/(booking)/payment`);
      } else {
        Alert.alert(response?.message)
      }
    }
   } catch (error) {
    console.log("error===========",error)
   }
  }

  return (
    <ScrollView className="grid grid-cols-[1fr_max-content] min-h-screen *:font-[Kanit-Regular] w-full">
      <Image
        style={{ height: height / 2 }}
        className="object-cover w-full"
        source={require(`../../public/login.png`)}
        alt=""
      />
      <View className="flex flex-col items-center justify-start p-5 w-full overflow-y-auto rounded-t-2xl -mt-[60px] bg-white h-full">
        <View className="max-w-[420px] w-full pt-4 lg:pt-20 pb-10">
          <Text
            fontSize={25}
            className="text-[25px] font-[Kanit-Medium] text-start leading-tight tracking-tight mb-6 flex-1"
          >
            {t("verify_phone_number")}
          </Text>

          <InputComponent label="First Name" placeHolder="first name" onChangeText={(text) => {setFirstName(text) }} value={firstName} />
          <InputComponent label="Last Name" placeHolder="first name" onChangeText={(text) => {setLastName(text) }} value={lastName} />
          <DobPicker
            onDateChange={handleDateChange}
            errorMessage={error}
            minimumAge={18}
          />
          <CustomPicker
            label="Select Gender"
            items={categories}
            selectedValue={category}
            onValueChange={(value) => setCategory(String(value))}
            placeholder="Choose your gender"
            style="w-full"
          />
            <TouchableOpacity
        onPress={handleRegistration}
        className="bg-[#FF4848] flex items-center rounded-full w-full h-[54px] cursor-pointer mb-5"
        activeOpacity={0.8}
      >
        <Text
          fontSize={20}
          className="my-auto text-[20px] text-white font-[Kanit-Regular]"
        >
          {t("Verify")}
        </Text>
      </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

export default Register;
