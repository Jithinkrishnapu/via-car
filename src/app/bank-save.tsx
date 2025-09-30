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
import { handleBankSave, handleRegister } from "@/service/auth";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { useStore } from "@/store/useStore";

const { height } = Dimensions.get("window");

function BankSave() {
  const { t } = useTranslation("index");
  const [category, setCategory] = useState<string>('');
  const {isPublish} = useStore()
  const categories = [
    { label: 'Male', value: '1' },
    { label: 'Female', value: '2' },
    { label: 'Other', value: '3' },
  ];

  const [accountHolderName, setAccountHolderName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [iban, setIban] = useState('');
  const [swiftCode, setSwiftCode] = useState('');
  const [branch, setBranch] = useState('');


  const handleSaveBank =async()=>{
    const userDetailsString = await useAsyncStorage("userDetails").getItem()
    const userDetails = userDetailsString ? JSON.parse(userDetailsString) : null
    const token = userDetails ? userDetails?.token : ""
    const formdata = new FormData()
    formdata.append("account_holder_name",accountHolderName!)
    formdata.append("bank_name",bankName)
    formdata.append("bank_branch",branch)
    formdata.append("account_number",accountNumber)
    formdata.append("iban",iban)
    formdata.append("swift_code",swiftCode)
    console.log("sheeet==========",formdata)
   try {
    const response = await handleBankSave(formdata,token)
    if(response){
      console.log("response============",response)
      router.push("/(publish)/upload-document")
    }
   } catch (error) {
    console.log("error===========",error)
   }
  }

  return (
    <ScrollView className="grid grid-cols-[1fr_max-content] min-h-screen *:font-[Kanit-Regular] w-full">
      <Image
        style={{ height: height / 4 }}
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
            Add your bank details
          </Text>

          <InputComponent
        label="Account Holder Name"
        placeHolder="Enter here"
        onChangeText={setAccountHolderName}
        value={accountHolderName}
      />
      
      <InputComponent
        label="Bank Name"
        placeHolder="Enter here"
        onChangeText={setBankName}
        value={bankName}
      />
      
      <InputComponent
        label="Account Number"
        placeHolder="Enter here"
        onChangeText={setAccountNumber}
        value={accountNumber}
      />
      
      <InputComponent
        label="IBAN"
        placeHolder="Enter here"
        onChangeText={setIban}
        value={iban}
      />
      
      <InputComponent
        label="SWIFT Code"
        placeHolder="Enter here"
        onChangeText={setSwiftCode}
        value={swiftCode}
      />
      
      <InputComponent
        label="Branch"
        placeHolder="Enter here"
        onChangeText={setBranch}
        value={branch}
      />
            <TouchableOpacity
        onPress={handleSaveBank}
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

export default BankSave;
