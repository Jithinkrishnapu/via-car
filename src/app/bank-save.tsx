import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import Text from '@/components/common/text';
import { InputComponent } from '@/components/inputs/common-input';
import Dialog from '@/components/ui/dialog';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { getUserStatus, handleBankSave, handleBankUpdate } from '@/service/auth';
import { UserStatusResp } from '@//types/ride-types';
import { useRoute } from '@react-navigation/native';
import { useDirection } from '@/hooks/useDirection';
import { cn } from '@/lib/utils';

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
  const { isRTL, swap } = useDirection();
  
  // Dialog states
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

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

  const isFormValid = (): boolean => {
    return !isEmpty(accountHolderName) &&
           !isEmpty(bankName) &&
           !isEmpty(accountNumber) &&
           /^\d+$/.test(accountNumber) &&
           !isEmpty(iban) &&
           ibanRegex.test(iban) &&
           !isEmpty(swiftCode) &&
           swiftRegex.test(swiftCode) &&
           !isEmpty(branch);
  };

  /* ---------- submit ---------- */

  const handleSaveBank = async () => {
    if (!validate()) return;

    let handleSave = handleBankSave;

    setSubmitting(true);
    const payload: any = {
      account_holder_name: accountHolderName.trim(),
      bank_name: bankName.trim(),
      bank_branch: branch.trim(),
      account_number: accountNumber.trim(),
      iban: iban.trim().toUpperCase(),
      swift_code: swiftCode.trim().toUpperCase(),
    };

    if (routeData.id) {
      payload.id = routeData.id;
      handleSave = handleBankUpdate;
    }

    try {
      const { res, body } = await handleSave(payload);

      // Success
      if (body?.message) {
        setDialogMessage(body.message);
        setShowSuccessDialog(true);
      } else {
        setDialogMessage('Bank details saved successfully!');
        setShowSuccessDialog(true);
      }
    } catch (err: any) {
      // Error handling
      let errorMessage = 'Network error – please try again';
      
      if (err?.body?.message) {
        errorMessage = err.body.message;
      } else if (err?.body?.error) {
        errorMessage = err.body.error;
      } else if (err?.body?.errors) {
        // Handle validation errors object
        if (typeof err.body.errors === 'object') {
          const errorMessages = Object.values(err.body.errors).flat();
          errorMessage = errorMessages.join('\n');
        } else {
          errorMessage = err.body.errors;
        }
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      setDialogMessage(errorMessage);
      setShowErrorDialog(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
    
    if ((route?.params as any)?.path === 'bank-list') {
      router.replace('..');
    } else {
      enforceProfileCompleteness();
    }
  };

  /* ---------- existing redirect helper ---------- */
  async function enforceProfileCompleteness() {
    try {
      const json: UserStatusResp = await getUserStatus();
      const d = json.data;

      // Continue with publish flow requirements
      if (!d.id_verification.completed) {
        if (d.id_verification.status === "pending") {
          router.replace('/pending-verification');
        } else {
          router.replace('/(publish)/upload-document');
        }
        return;
      }
      
      if (d.account.is_driver && !d.vehicles.has_vehicles) {
        router.replace('/add-vehicles');
        return;
      }
      
      // All requirements met, go to pickup for publish flow
      router.replace('/(tabs)/pickup');
    } catch (e) {
      console.log('Status check failed', e);
      // Fallback to book tab
      router.replace('/(tabs)/book');
    }
  }

  const handleBack = () => {
    router.replace('../');
  };

  /* ---------- UI ---------- */
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        bounces={false}
        className="flex-1 w-full bg-white"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <View className={cn("absolute top-12 z-10", isRTL ? "right-6" : "left-6")}>
          <TouchableOpacity
            className="bg-white rounded-full size-[45px] flex-row items-center justify-center border border-[#EBEBEB]"
            activeOpacity={0.8}
            onPress={handleBack}
          >
            {swap(<ChevronLeft color="#3C3F4E" />, <ChevronRight color="#3C3F4E" />)}
          </TouchableOpacity>
        </View>

        <Image
          style={{ height: height / 4 }}
          className="w-full"
          source={require('../../public/login.png')}
        />

        <View className="-mt-14 rounded-t-2xl bg-white px-5 pt-4">
          <View className="mx-auto w-full max-w-[420px] pt-4 pb-10">
            <Text fontSize={25} className="font-[Kanit-Medium] text-start mb-6">
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
              disabled={submitting || !isFormValid()}
              className={`rounded-full w-full h-[54px] items-center justify-center mt-4 ${
                submitting || !isFormValid() 
                  ? 'bg-gray-400' 
                  : 'bg-[#FF4848]'
              }`}
              activeOpacity={0.8}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text fontSize={20} className="text-white font-[Kanit-Regular]">
                  {routeData?.id ? t('Update') : t("Save")}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Success Dialog */}
      <Dialog
        visible={showSuccessDialog}
        onClose={handleSuccessDialogClose}
        title="Success"
        showButtons={true}
        confirmText="OK"
        onConfirm={handleSuccessDialogClose}
      >
        <Text className="text-[16px] font-[Kanit-Regular] text-gray-700 text-center">
          {dialogMessage}
        </Text>
      </Dialog>

      {/* Error Dialog */}
      <Dialog
        visible={showErrorDialog}
        onClose={() => setShowErrorDialog(false)}
        title="Error"
        showButtons={true}
        confirmText="OK"
        onConfirm={() => setShowErrorDialog(false)}
      >
        <Text className="text-[16px] font-[Kanit-Regular] text-gray-700 text-center">
          {dialogMessage}
        </Text>
      </Dialog>
    </KeyboardAvoidingView>
  );
}