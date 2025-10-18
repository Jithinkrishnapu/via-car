import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import Text from '@/components/common/text';
import { InputComponent } from '@/components/inputs/common-input';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { getUserStatus, handleBankSave } from '@/service/auth';
import { UserStatusResp } from '@//types/ride-types';

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

  /* ---------- form fields ---------- */
  const [accountHolderName, setAccountHolderName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [iban, setIban] = useState('');
  const [swiftCode, setSwiftCode] = useState('');
  const [branch, setBranch] = useState('');

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

    if (isEmpty(iban)) e.iban = 'Required';
    else if (!ibanRegex.test(iban)) e.iban = 'Invalid IBAN format';

    if (isEmpty(swiftCode)) e.swiftCode = 'Required';
    else if (!swiftRegex.test(swiftCode)) e.swiftCode = 'Invalid SWIFT/BIC';

    if (isEmpty(branch)) e.branch = 'Required';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ---------- submit ---------- */
  const handleSaveBank = async () => {
    if (!validate()) return; // stop early

    setSubmitting(true);
    const payload = {
      account_holder_name: accountHolderName.trim(),
      bank_name: bankName.trim(),
      bank_branch: branch.trim(),
      account_number: accountNumber.trim(),
      iban: iban.trim().toUpperCase(),
      swift_code: swiftCode.trim().toUpperCase(),
    };

    try {
      const res = await handleBankSave(payload);
      const body = await res.json();

      if (res.ok) {
        enforceProfileCompleteness(); // your existing redirect logic
      } else {
        Alert.alert('Error', body.message || 'Unable to save bank details');
      }
    } catch (err: any) {
      console.log(err);
      Alert.alert('Error', 'Network error – please try again');
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
    <ScrollView className="min-h-screen w-full bg-white">
      <Image
        style={{ height: height / 4 }}
        className="w-full"
        source={require('../../public/login.png')}
      />

      <View className="-mt-14 rounded-t-2xl bg-white px-5 pt-4">
        <View className="mx-auto w-full max-w-[420px] pt-4 pb-10">
          <Text fontSize={25} className="mb-6 text-start">
            Add your bank details
          </Text>

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
                {t('Verify')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}