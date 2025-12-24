import { ChevronLeft } from "lucide-react-native";
import { router } from "expo-router";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import ApprovedAnimation from "@/components/animated/approved-animation";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  ImageSourcePropType,
  Modal,
  ScrollView,
  TouchableOpacity,
  View,
  TextInput,
} from "react-native";
import Text from "@/components/common/text";
import CheckLightGreen from "../../../public/check-light-green.svg";
import { useTranslation } from "react-i18next";
import { getCards, SavedCardMeta } from "@/store/card-store";
import { useRoute } from "@react-navigation/native";
import { useAuthorizePayment, getPaymentStatus } from "@/service/payment";
import { BookingPaymentData } from "@/types/ride-types";
import AlertDialog from "@/components/ui/alert-dialog";
import Dialog from "@/components/ui/dialog";

type Status = "idle" | "waiting" | "approved";

const CheckIcon = () => (
  <CheckLightGreen
    width={27}
    height={27}
    className="absolute inset-0 m-auto size-[27px]"
  />
);

interface Options {
  id: string;
  title: string;
  description?: string;
  img: ImageSourcePropType;
  cardData?: SavedCardMeta;
}

interface RouteParams {
  booking_id: string;
  amount: string;
}

interface ErrorState {
  visible: boolean;
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
}

interface CVVDialogState {
  visible: boolean;
  cvv: string;
  loading: boolean;
}

function Payment() {
  const loaded = useLoadFonts();
  const { t } = useTranslation("components");
  const route = useRoute();
  const routeParams = route.params as RouteParams;

  const [selectedId, setSelectedId] = useState<string>("0");
  const [cardsData, setCardsData] = useState<Options[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [loading, setLoading] = useState(false);
  const [errorDialog, setErrorDialog] = useState<ErrorState>({
    visible: false,
    title: '',
    message: '',
    type: 'error'
  });
  const [cvvDialog, setCvvDialog] = useState<CVVDialogState>({
    visible: false,
    cvv: '',
    loading: false
  });

  const showError = (title: string, message: string, type: "error" | "warning" | "info" = "error") => {
    setErrorDialog({
      visible: true,
      title,
      message,
      type
    });
  };

  const closeErrorDialog = () => {
    setErrorDialog({
      ...errorDialog,
      visible: false
    });
  };

  const closeCVVDialog = () => {
    setCvvDialog({ visible: false, cvv: '', loading: false });
  };

  const fetchSavedCards = async () => {
    const data = await getCards();
    console.log(data, "===================cards");
    if (data?.length) {
      const iterateData: Options[] = data.map((val, index) => {
        return {
          id: index.toString(),
          title: `${val?.brand} ending in ${val?.last4}`,
          description: `Ex.date ${val?.expMonth.toString().padStart(2, '0')}/${val?.expYear?.toString()?.slice(2, 4)}`,
          img: require("../../../public/visa.png"),
          cardData: val,
        };
      });
      setCardsData(iterateData);
      if (iterateData.length > 0) {
        setSelectedId("0");
      }
    }
  };

  const handleFetchPaymentStatus = async () => {
    if (!routeParams?.booking_id) return false;
    
    try {
      const response = await getPaymentStatus(Number(routeParams.booking_id));
      console.log(response, "====================response", response.data?.paymentStatus);
      if (response.data?.paymentStatus === 2) {
        setStatus("approved");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error fetching payment status:", error);
      // Don't show error for polling failures, just log them
      return false;
    }
  };

  const handlePayWithSavedCard = async () => {
    if (!routeParams?.booking_id || cardsData.length === 0) {
      showError('Payment Error', 'No booking ID or saved cards available');
      return;
    }

    const selectedCard = cardsData.find(card => card.id === selectedId);
    if (!selectedCard?.cardData) {
      showError('Payment Error', 'Please select a payment method');
      return;
    }

    // Show CVV dialog for saved cards
    setCvvDialog({
      visible: true,
      cvv: '',
      loading: false
    });
  };

  const handleCVVSubmit = async () => {
    if (!cvvDialog.cvv || cvvDialog.cvv.length < 3) {
      showError('Validation Error', 'Please enter a valid CVV');
      return;
    }

    const selectedCard = cardsData.find(card => card.id === selectedId);
    if (!selectedCard?.cardData) {
      showError('Payment Error', 'Please select a payment method');
      return;
    }

    setCvvDialog(prev => ({ ...prev, loading: true }));
    setLoading(true);
    setStatus("waiting");

    const postData: BookingPaymentData = {
      booking_id: Number(routeParams.booking_id),
      payment_brand: selectedCard.cardData.brand,
      card_number: selectedCard.cardData.cardNumber, // Use stored full card number
      card_holder_name: selectedCard.cardData.cardHolderName,
      card_expiration_month: Number(selectedCard.cardData.expMonth.toString().padStart(2, '0')),
      card_expiration_year: selectedCard.cardData.expYear,
      card_cvv: cvvDialog.cvv, // Use entered CVV
      customer_email: selectedCard.cardData.email,
      billing_street: selectedCard.cardData.billingStreet,
      billing_city: selectedCard.cardData.billingCity,
      billing_state: selectedCard.cardData.billingState,
      billing_post_code: selectedCard.cardData.billingPostCode,
      billing_country: selectedCard.cardData.billingCountry,
      given_name: selectedCard.cardData.cardHolderName.split(' ')[0] || '',
      sur_name: selectedCard.cardData.cardHolderName.split(' ').slice(1).join(' ') || '',
      alias: selectedCard.cardData.alias,
    };

    console.log("Saved card payment payload:", postData);

    // Close CVV dialog
    setCvvDialog({ visible: false, cvv: '', loading: false });

    try {
      const response = await useAuthorizePayment(postData);
      console.log('Payment authorization response:', response);

      // Check for API error responses
      if (response?.error || response?.status === 'error') {
        const errorMessage = response?.message || response?.error || 'Payment authorization failed';
        showError('Payment Error', errorMessage);
        setStatus("idle");
        return;
      }

      // Check for validation errors
      if (response?.errors && Array.isArray(response.errors)) {
        const errorMessages = response.errors.map((error: any) => error.message || error).join('\n');
        showError('Validation Error', errorMessages);
        setStatus("idle");
        return;
      }

      // Check for specific payment failures
      if (response?.result?.code && response.result.code !== '000.100.110') {
        const errorMessage = response?.result?.description || 'Payment processing failed';
        showError('Payment Failed', errorMessage);
        setStatus("idle");
        return;
      }

      // Start polling for payment status
      const pollInterval = setInterval(async () => {
        await handleFetchPaymentStatus();
      }, 3000);

      // Clear interval after 2 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        if (status === "waiting") {
          setStatus("idle");
          showError('Payment Timeout', 'Payment verification timed out. Please check your booking status.', 'warning');
        }
      }, 120000);

    } catch (err: any) {
      console.error('Payment failed:', err);
      setStatus("idle");
      
      // Handle network errors
      if (err.name === 'TypeError' && err.message.includes('Network request failed')) {
        showError('Network Error', 'Please check your internet connection and try again.');
        return;
      }
      
      // Handle timeout errors
      if (err.name === 'AbortError' || err.message.includes('timeout')) {
        showError('Timeout Error', 'Request timed out. Please try again.');
        return;
      }
      
      // Generic error handling
      const errorMessage = err?.response?.data?.message || 
                         err?.message || 
                         'Failed to authorize payment. Please try again.';
      showError('Payment Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedCards();
  }, []);

  useEffect(() => {
    if (status === "waiting") {
      // Start polling when payment is initiated
      const pollInterval = setInterval(async () => {
        const isApproved = await handleFetchPaymentStatus();
        if (isApproved) {
          clearInterval(pollInterval);
        }
      }, 3000);

      // Clear interval after 2 minutes to prevent infinite polling
      const timeoutId = setTimeout(() => {
        clearInterval(pollInterval);
        if (status === "waiting") {
          setStatus("idle");
          showError('Payment Timeout', 'Payment verification timed out. Please check your booking status.', 'warning');
        }
      }, 120000);
      
      // Cleanup interval when component unmounts or status changes
      return () => {
        clearInterval(pollInterval);
        clearTimeout(timeoutId);
      };
    }
  }, [status, routeParams?.booking_id]);

  if (!loaded) return null;

  const renderOption = ({ id, title, description, img }: Options) => {
    const isChecked = selectedId === id;

    return (
      <TouchableOpacity
        key={id}
        onPress={() => setSelectedId(id)}
        activeOpacity={0.8}
        className="border border-[#EBEBEB] p-[15px] rounded-2xl bg-[#F5F5F5] flex-row items-center gap-4"
      >
        <Image className="w-[74px] h-[45px]" source={img} alt={title} />
        <View className="flex-col items-start">
          <Text fontSize={18} className="text-[18px] font-[Kanit-Regular]">
            {title}
          </Text>
          {description && (
            <Text
              fontSize={15}
              className="text-[15px] font-[Kanit-Light] text-[#999999]"
            >
              {description}
            </Text>
          )}
        </View>
        <View className="ml-auto size-[27px] aspect-square relative border border-gray-300 rounded-full flex-row items-center justify-center">
          {isChecked && <CheckIcon />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 relative pb-[100px]">
      <ScrollView bounces={false} className="font-[Kanit-Regular] w-full bg-white">
        <View className="max-w-[1379px] w-full mx-auto px-6 pt-16 lg:pt-[80px] pb-10 lg:pb-[100px] flex flex-col gap-7">
          <View className="flex-row items-center gap-4 mb-6 w-full">
            <TouchableOpacity
              className="bg-white/20 rounded-full size-[45px] flex-row items-center justify-center border border-[#EBEBEB]"
              activeOpacity={0.8}
              onPress={() => router.replace("..")}
            >
              <ChevronLeft color="#3C3F4E" />
            </TouchableOpacity>
            <Text
              fontSize={22}
              className="text-[22px] text-black font-[Kanit-Medium]"
            >
              {t("payment.selectPaymentMethod")}
            </Text>
          </View>

          {/* Credit/Debit Section */}
          <View className="flex-row items-center gap-2">
            <Text
              fontSize={15}
              className="text-[15px] text-[#666666] font-[Kanit-Medium] uppercase"
            >
              {t("payment.creditDebitCards")}
            </Text>
            <Image
              className="size-[18px]"
              source={require(`../../../public/payment-method.png`)}
            />
          </View>

          {/* {cardsData.map(renderOption)} */}

          <FlatList
          contentContainerClassName="gap-4"
          data={cardsData}
          renderItem={(({item})=>renderOption(item))}
          />

          <TouchableOpacity
            onPress={() => router.push({
              pathname: "/(booking)/add-new-card",
              params: { booking_id: routeParams?.booking_id }
            })}
            className="rounded-full w-max mx-auto border border-[#EBEBEB] px-[16px] py-[8px]"
            activeOpacity={0.8}
          >
            <Text fontSize={13} className="text-[13px] font-[Kanit-Regular]">
              {t("payment.addNewCard")}
            </Text>
          </TouchableOpacity>

          {/* <Separator className="mt-2 border-t !border-dashed !border-[#DADADA] bg-transparent" /> */}

          {/* UPI Section */}
          {/* <View className="flex-row items-center gap-2">
            <Text
              fontSize={15}
              className="text-[15px] text-[#666666] font-[Kanit-Medium] uppercase"
            >
              {t("payment.otherUpiApps")}
            </Text>
            <Image
              className="size-[18px]"
              source={require(`../../../public/payment-method.png`)}
            />
          </View> */}

          {/* {upi.map(renderOption)} */}

          {/* <TouchableOpacity
            className="rounded-full w-max mx-auto border border-[#EBEBEB] px-[16px] py-[8px]"
            activeOpacity={0.8}
          >
            <Text fontSize={13} className="text-[13px] font-[Kanit-Regular]">
              {t("payment.addNew")}
            </Text>
          </TouchableOpacity> */}
        </View>
      </ScrollView>
      {/* Continue Button */}
      <View
        className="flex-row items-center justify-between gap-4 w-full mx-auto absolute right-0 bottom-0 left-0 px-[27px] py-[20px] bg-white shadow-[0_20px_25px_5px_rgb(0_0_0_/_0.1)]"
        style={{
          shadowColor: "rgb(0 0 0 / 0.5)",
          shadowOffset: { width: 0, height: 20 },
          shadowOpacity: 1,
          shadowRadius: 25,
        }}
      >
        <View className="flex-1">
          <Text
            fontSize={16}
            className="text-[16px] text-[#666666] font-[Kanit-Regular]"
          >
            {t("payment.amount")}
          </Text>
          <Text fontSize={25} className="text-[25px] font-[Kanit-Regular]">
            {t("payment.currency")} {routeParams?.amount}
          </Text>
        </View>
        <View className="flex-1">
          <TouchableOpacity
            className="bg-[#FF4848] rounded-full w-max h-[55px] cursor-pointer items-center justify-center"
            onPress={handlePayWithSavedCard}
            activeOpacity={0.8}
            disabled={loading || cardsData.length === 0}
          >
            <Text
              fontSize={18}
              className="text-[18px] text-center text-white font-[Kanit-Medium] uppercase"
            >
              {loading ? t("payment.processing") || "Processing..." : t("payment.pay")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Waiting Modal */}
      <Modal visible={status === "waiting"} transparent animationType="fade">
        <View className="flex-1 justify-end bg-black/30">
          <View className="bg-white px-12 py-12 rounded-t-3xl">
            <Image
              className="size-[150px] mx-auto object-contain"
              source={require(`../../../public/hour-glass.gif`)}
            />
            <Text
              fontSize={25}
              className="text-[25px] font-[Kanit-Regular] text-black text-center mt-4"
            >
              {t("payment.waitingApproval")}
            </Text>
          </View>
        </View>
      </Modal>

      {/* Approved Modal */}
      <Modal visible={status === "approved"} transparent animationType="fade">
        <View className="flex-1 justify-end bg-black/30">
          <View className="bg-white px-12 lg:px-24 pt-12 lg:pt-24 rounded-t-3xl items-center">
            <ApprovedAnimation />
            <Text
              fontSize={25}
              className="text-[25px] font-[Kanit-Regular] text-black text-center mt-4"
            >
              {t("payment.bookingConfirmed")}
            </Text>
            <View className="flex-row items-center justify-center">
              <TouchableOpacity
                className="bg-[#FF4848] rounded-full w-[141px] h-[45px] mt-6 mb-12 items-center justify-center"
                activeOpacity={0.8}
                onPress={() => {
                  setStatus("idle");
                  router.push("/(tabs)/book");
                }}
              >
                <Text
                  fontSize={18}
                  className="text-[18px] text-white text-center font-[Kanit-Medium]"
                >
                  {t("payment.ok")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Error Dialog */}
      <AlertDialog
        visible={errorDialog.visible}
        onClose={closeErrorDialog}
        title={errorDialog.title}
        message={errorDialog.message}
        type={errorDialog.type}
        confirmText="OK"
      />

      {/* CVV Dialog for Saved Cards */}
      <Dialog
        visible={cvvDialog.visible}
        onClose={closeCVVDialog}
        title="Enter CVV"
        showButtons={true}
        confirmText="Pay"
        cancelText="Cancel"
        onConfirm={handleCVVSubmit}
        onCancel={closeCVVDialog}
        confirmDisabled={cvvDialog.loading || cvvDialog.cvv.length < 3}
      >
        <View className="py-4">
          <Text className="text-[16px] font-[Kanit-Regular] text-gray-700 mb-4 text-center">
            Please enter your CVV to complete the payment
          </Text>
          <TextInput
            value={cvvDialog.cvv}
            onChangeText={(text) => setCvvDialog(prev => ({ ...prev, cvv: text.replace(/\D/g, '') }))}
            placeholder="CVV"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            maxLength={4}
            secureTextEntry
            className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800 text-center text-lg"
            editable={!cvvDialog.loading}
            autoFocus
          />
        </View>
      </Dialog>
    </View>
  );
}

export default Payment;