import { TextInput, View } from "react-native"
import Text from "@/components/common/text";

type InputComponentPorps = {
value:string
onChangeText:(text:string)=>void
label:string,
placeHolder:string
} 

export const InputComponent = ()=>{
    return (
       <View className="px-2 gap-2 my-5" >
         <Text
        fontSize={16}
           className="text-[16px] text-[#000000] font-[Kanit-Light] cursor-pointer leading-tight tracking-tight"
       >First Name</Text>
       <TextInput
       allowFontScaling={false}
    //    keyboardType="phone-pad"
       placeholder={"first name"}
       placeholderTextColor={"#666666"}
     //   value={}
     //   onChangeText={handlePhoneChange}
       className="flex-1 h-[50px] border border-[#EBEBEB] rounded-full text-[16px] font-[Kanit-Light] px-5"
       style={{
         textAlign: "left",
         direction: "ltr",
         writingDirection: "ltr",
       }}
     />
       </View>
    )
}