import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import {
  CountryCode,
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
} from "libphonenumber-js";
import countriesData from "i18n-iso-countries/langs/en.json";
import isoCountries from "i18n-iso-countries";
import { ChevronDown } from "lucide-react-native";
import { cn } from "@/lib/utils";
import Text from "../common/text";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/hooks/useDirection";

isoCountries.registerLocale(countriesData);

type Country = {
  code: string;
  name: string;
  iso: CountryCode;
  flag: string;
};

const countries: Country[] = getCountries().map((country) => ({
  code: `+${getCountryCallingCode(country)}`,
  name: isoCountries.getName(country, "en") || country,
  iso: country,
  flag: getFlagEmoji(country),
}));

function getFlagEmoji(cc: string): string {
  return cc
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

interface PhoneInputProps {
  value?: string;
  defaultCountryCode?: CountryCode;
  onChange?: (phone: string, countryCode: CountryCode) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

function PhoneInput({
  value = "",
  defaultCountryCode = "SA",
  onChange,
  placeholder = "00 00 00 00 00",
  label = "Phone Number",
  className = "",
}: PhoneInputProps) {
  const { t } = useTranslation("components");
  const { isRTL } = useDirection();
  const [phone, setPhone] = useState(value);
  const [countryCode, setCountryCode] =
    useState<CountryCode>(defaultCountryCode);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const selectedCountry = countries.find((c) => c.iso === countryCode);
  const filteredCountries = countries.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePhoneChange = (text: string) => {
    const parsed = parsePhoneNumberFromString(text, countryCode);
    const formatted = parsed
      ? parsed.formatNational()
      : text.replace(/\D/g, "");
    setPhone(formatted);
  };

  useEffect(() => {
    onChange?.(phone, countryCode);
  }, [phone, countryCode]);

  return (
    <View
      className={cn("text-[16px] font-[Kanit-Light]", className)}
      style={{ direction: "ltr" }}
    >
      {label && (
        <Text
          fontSize={16}
          className="text-[16px] font-[Kanit-Regular] mb-[11px]"
          style={{ direction: isRTL ? "rtl" : "ltr" }}
        >
          {t(label)}
        </Text>
      )}

      <View
        className="flex-row border border-[#F5F5F5] rounded-full overflow-hidden items-center bg-white"
        style={{ direction: "ltr" }}
      >
        <TouchableOpacity
          // onPress={() => setModalVisible(true)}
          className="py-1 lg:py-2 px-2 lg:px-4 h-[48px] w-[75px] justify-center items-center flex-row gap-2.5 bg-[#F5F5F5] rounded-full"
        >
          <Text
            fontSize={20}
            className="text-[20px] flex items-center justify-center"
          >
            {selectedCountry?.flag}
          </Text>
          {/* <ChevronDown size={16} color="#666666" className="" /> */}
        </TouchableOpacity>

        <Text
          fontSize={16}
          className="px-3 text-[16px] justify-center text-center flex items-center"
          style={{ textAlign: "left" }}
        >
          {selectedCountry?.code}
        </Text>

        <TextInput
          allowFontScaling={false}
          keyboardType="phone-pad"
          placeholder={t(placeholder, { ns: "components" })}
          value={phone}
          onChangeText={handlePhoneChange}
          className="flex-1 h-[50px] text-[16px] font-[Kanit-Light] px-2"
          style={{
            textAlign: "left",
            direction: "ltr",
            writingDirection: "ltr",
          }}
        />
      </View>

      <Modal visible={modalVisible} animationType="slide">
        <View className="flex-1 p-4 bg-white" style={{ direction: "ltr" }}>
          <TextInput
            allowFontScaling={false}
            placeholder={t("Search...", { ns: "components" })}
            value={searchTerm}
            onChangeText={setSearchTerm}
            className="border border-gray-300 rounded-lg p-2 mb-4 h-[50px] text-black text-[20px] font-[Kanit-Regular]"
            style={{
              textAlign: "left",
              direction: "ltr",
              writingDirection: "ltr",
            }}
          />
          <FlatList
            data={filteredCountries}
            keyExtractor={(item) => item.iso}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="flex-row items-center py-3 px-2"
                onPress={() => {
                  setCountryCode(item.iso);
                  setSearchTerm("");
                  setModalVisible(false);
                }}
              >
                <Text fontSize={20} className="text-xl mr-3">
                  {item.flag}
                </Text>
                <Text
                  fontSize={16}
                  className="text-[16px]"
                  style={{ textAlign: "left" }}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

export default PhoneInput;
