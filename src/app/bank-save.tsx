import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import Text from '@/components/common/text';
import { InputComponent } from '@/components/inputs/common-input';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { getUserStatus, handleBankSave, handleBankUpdate } from '@/service/auth';
import { UserStatusResp } from '@//types/ride-types';
import { useRoute } from '@react-navigation/native';

const { height } = Dimensions.get('window');

/* ---------- tiny helpers ---------- */
const isEmpty = (v: string) => !v || !v.trim();

/* basic IBAN test (starts with 2 letters + 2 digits, min 15) */
const ibanRegex = /^[A-Z]{2}\d{2}[A-Z0-9]{9,30}$/i;

/* SWIFT/BIC = 8 or 11 alphanumeric */
const swiftRegex = /^[A-Z0-9]{8}([A-Z0-9]{3})?$/i;

/* ---------------------------------- */
export default function BankSave() {
  const { t } = useTranslation('index');
  const route = useRoute();

  /* ---------- safe route-data reader ---------- */
  const routeData = React.useMemo(() => {
    try {
      const raw = (route.params as any)?.data;
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }, [route.params]);

  /* ---------- form fields (fallback to empty string) ---------- */
  const [accountHolderName, setAccountHolderName] = useState(
    routeData?.account_holder_name ?? ''
  );
  const [bankName, setBankName] = useState(routeData?.bank_name ?? '');
  const [accountNumber, setAccountNumber] = useState(
    routeData?.account_number ?? ''
  );
  const [iban, setIban] = useState(routeData?.iban ?? '');
  const [swiftCode, setSwiftCode] = useState(routeData?.swift_code ?? '');
  const [branch, setBranch] = useState(routeData?.bank_branch ?? '');

  /* ---------- validation ---------- */
  type Errors = {
    accountHolderName?: string;
    bankName?: string;
    accountNumber?: string;
    iban?: string;
    swiftCode?: string;
    branch?: string;
  };
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = (): boolean => {
    const e: Errors = {};

    if (isEmpty(accountHolderName)) e.accountHolderName = 'Required';
    if (isEmpty(bankName)) e.bankName = 'Required';
    if (isEmpty(accountNumber)) e.accountNumber = 'Required';
    else if (!/^\d+$/.test(accountNumber))
      e.accountNumber = 'Only digits allowed';
    console.log("iban===============",iban)
    if (isEmpty(iban)) e.iban = 'Required';
    else if (!ibanRegex.test(iban)) e.iban = 'Invalid IBAN format';

    if (isEmpty(swiftCode)) e.swiftCode = 'Required';
    else if (!swiftRegex.test(swiftCode)) e.swiftCode = 'Invalid SWIFT/BIC';

    if (isEmpty(branch)) e.branch = 'Required';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ---------- submit ---------- */
  // const handleSaveBank = async () => {
  //   if (!validate()) return;
  //   let handleSave = handleBankSave;

  //   setSubmitting(true);
  //   const payload = {
  //     account_holder_name: accountHolderName.trim(),
  //     bank_name: bankName.trim(),
  //     bank_branch: branch.trim(),
  //     account_number: accountNumber.trim(),
  //     iban: iban.trim().toUpperCase(),
  //     swift_code: swiftCode.trim().toUpperCase(),
  //   };

  //   if (routeData.id) {
  //     payload.id = routeData?.id;
  //     handleSave = handleBankUpdate;
  //   }

  //   try {
  //     const res = await handleSave(payload);
      
  //     // Parse response body
  //     let body;
  //     try {
  //       body = await res.json();
  //     } catch (parseError) {
  //       console.error('Failed to parse response:', parseError);
  //       body = { message: 'Invalid response from server' };
  //     }

  //     if (res.ok) {
  //       // Success - show success message if available
  //       if (body?.message) {
  //         Alert.alert('Success', body.message);
  //       }
        
  //       if (route?.params?.path == "bank-list") {
  //         router.replace('..');
  //       } else {
  //         enforceProfileCompleteness();
  //       }
  //     } else {
  //       // Handle different error response formats
  //       let errorMessage = 'Unable to save bank details';
        
  //       if (body?.message) {
  //         errorMessage = body.message;
  //       } else if (body?.error) {
  //         errorMessage = body.error;
  //       } else if (body?.errors) {
  //         // Handle validation errors object
  //         if (typeof body.errors === 'object') {
  //           const errorMessages = Object.values(body.errors).flat();
  //           errorMessage = errorMessages.join('\n');
  //         } else {
  //           errorMessage = body.errors;
  //         }
  //       } else if (typeof body === 'string') {
  //         errorMessage = body;
  //       }
        
  //       Alert.alert('Error', errorMessage);
  //     }
  //   } catch (err: any) {
  //     console.error('Bank save error:', err);
      
  //     // Handle network errors
  //     let errorMessage = 'Network error – please try again';
      
  //     if (err?.message) {
  //       errorMessage = err.message;
  //     } else if (err?.response?.data?.message) {
  //       errorMessage = err.response.data.message;
  //     }
      
  //     Alert.alert('Error', errorMessage);
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };

  const handleSaveBank = async () => {
  if (!validate()) return;

  let handleSave = handleBankSave;

  setSubmitting(true);
  const payload = {
    account_holder_name: accountHolderName.trim(),
    bank_name: bankName.trim(),
    bank_branch: branch.trim(),
    account_number: accountNumber.trim(),
    iban: iban.trim().toUpperCase(),
    swift_code: swiftCode.trim().toUpperCase(),
  };

  if (routeData.id) {
    payload.id = routeData.id;
    handleSave = handleBankUpdate; // make sure this one returns {res, body} too
  }

  try {
    const { res, body } = await handleSave(payload);

    // ---------- SUCCESS ----------
    if (body?.message) Alert.alert('Success', body.message);

    if (route?.params?.path === 'bank-list') {
      router.replace('..');
    } else {
      enforceProfileCompleteness();
    }
  } catch (err: any) {
    // ---------- ERROR ----------
    const msg = err?.body?.message || err.message || 'Network error – please try again';
    Alert.alert('Error', msg);
  } finally {
    setSubmitting(false);
  }
};

  /* ---------- existing redirect helper ---------- */
  async function enforceProfileCompleteness() {
    try {
      const json: UserStatusResp = await getUserStatus();
      const d = json.data;

      if (!d.id_verification.completed) {
        router.replace('/(publish)/upload-document');
        return;
      }
      if (d.account.is_driver && !d.vehicles.has_vehicles) {
        router.replace('/add-vehicles');
        return;
      }
      router.replace('/(tabs)/book');
    } catch (e) {
      console.log('Status check failed', e);
    }
  }

  /* ---------- UI ---------- */
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        className="flex-1 w-full bg-white"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Image
          style={{ height: height / 4 }}
          className="w-full"
          source={require('../../public/login.png')}
        />

        <View className="-mt-14 rounded-t-2xl bg-white px-5 pt-4">
          <View className="mx-auto w-full max-w-[420px] pt-4 pb-10">
            <View className="flex-row items-center mb-6">
              <TouchableOpacity
                onPress={() => router.replace('../')}
                className="mr-3 p-2 -ml-2"
                activeOpacity={0.7}
              >
                <ArrowLeft size={24} color="#0A2033" />
              </TouchableOpacity>
              <Text fontSize={25} className="flex-1 font-[Kanit-Medium] text-start">
                Add your bank details
              </Text>
            </View>

            {/* ----- fields ----- */}
            <InputComponent
              label="Account Holder Name"
              placeHolder="Enter here"
              value={accountHolderName}
              onChangeText={(t) => {
                setAccountHolderName(t);
                setErrors((x) => ({ ...x, accountHolderName: undefined }));
              }}
              error={errors.accountHolderName}
            />

            <InputComponent
              label="Bank Name"
              placeHolder="Enter here"
              value={bankName}
              onChangeText={(t) => {
                setBankName(t);
                setErrors((x) => ({ ...x, bankName: undefined }));
              }}
              error={errors.bankName}
            />

            <InputComponent
              label="Account Number"
              placeHolder="Enter here"
              keyboardType="number-pad"
              value={accountNumber}
              onChangeText={(t) => {
                setAccountNumber(t);
                setErrors((x) => ({ ...x, accountNumber: undefined }));
              }}
              error={errors.accountNumber}
            />

            <InputComponent
              label="IBAN"
              placeHolder="Enter here"
              autoCapitalize="characters"
              value={iban}
              onChangeText={(t) => {
                setIban(t);
                setErrors((x) => ({ ...x, iban: undefined }));
              }}
              error={errors.iban}
            />

            <InputComponent
              label="SWIFT Code"
              placeHolder="Enter here"
              autoCapitalize="characters"
              value={swiftCode}
              onChangeText={(t) => {
                setSwiftCode(t);
                setErrors((x) => ({ ...x, swiftCode: undefined }));
              }}
              error={errors.swiftCode}
            />

            <InputComponent
              label="Branch"
              placeHolder="Enter here"
              value={branch}
              onChangeText={(t) => {
                setBranch(t);
                setErrors((x) => ({ ...x, branch: undefined }));
              }}
              error={errors.branch}
            />

            {/* ----- button ----- */}
            <TouchableOpacity
              onPress={handleSaveBank}
              disabled={submitting}
              className="bg-[#FF4848] rounded-full w-full h-[54px] items-center justify-center mt-4"
              activeOpacity={0.8}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text fontSize={20} className="text-white">
                  {routeData?.id ? t('Update') : t("Save")}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}