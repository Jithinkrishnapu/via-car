import { ChevronLeft, MoreVertical, Edit, Trash2 } from "lucide-react-native";
import { router } from "expo-router";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import ApprovedAnimation from "@/components/animated/approved-animation";
import { useCallback, useEffect, useState, useRef } from "react";
import {
  Image,
  ImageSourcePropType,
  Modal,
  ScrollView,
  TouchableOpacity,
  View,
  TextInput,
  RefreshControl,
  SafeAreaView,
} from "react-native";
import { WebView } from 'react-native-webview';
import Text from "@/components/common/text";
import CheckLightGreen from "../../../public/check-light-green.svg";
import { useTranslation } from "react-i18next";
import { getCards, SavedCardMeta, saveCards } from "@/store/card-store";
import { useRoute, useFocusEffect } from "@react-navigation/native";
import { useAuthorizePayment as authorizePayment } from "@/service/payment";
import { BookingPaymentData } from "@/types/ride-types";
import AlertDialog from "@/components/ui/alert-dialog";
import Dialog from "@/components/ui/dialog";
import { usePaymentStatus } from "@/hooks/use-payment-status";

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

interface CardMenuState {
  visible: boolean;
  cardId: string;
  cardIndex: number;
}

function Payment() {
  const loaded = useLoadFonts();
  const { t } = useTranslation("components");
  const route = useRoute();
  const routeParams = route.params as RouteParams;

  const [selectedId, setSelectedId] = useState<string>("0");
  const [cardsData, setCardsData] = useState<Options[]>([]);
  
  const { status, setStatus, startPolling } = usePaymentStatus(routeParams?.booking_id);
  
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
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
  const [cardMenu, setCardMenu] = useState<CardMenuState>({
    visible: false,
    cardId: '',
    cardIndex: -1
  });
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState({
    visible: false,
    cardIndex: -1
  });

  const [show3DS, setShow3DS] = useState(false);
  const [authUrl, setAuthUrl] = useState('');
  const [authParams, setAuthParams] = useState<any[]>([]);

  const showError = useCallback((title: string, message: string, type: "error" | "warning" | "info" | "success" = "error") => {
    setErrorDialog({
      visible: true,
      title,
      message,
      type
    });
  }, []);

  const closeErrorDialog = () => {
    setErrorDialog({
      ...errorDialog,
      visible: false
    });
  };

  const closeCVVDialog = () => {
    setCvvDialog({ visible: false, cvv: '', loading: false });
  };

  const closeCardMenu = () => {
    setCardMenu({ visible: false, cardId: '', cardIndex: -1 });
  };

  const handleDeleteCard = async (cardIndex: number) => {
    try {
      // const updatedCards = cardsData.filter((_, index) => index !== cardIndex);
      const updatedCardsMeta = (await getCards()).filter((_, index) => index !== cardIndex);
      
      await saveCards(updatedCardsMeta);
      
      // Refresh the cards list to ensure consistency
      await fetchSavedCards();
      
      setDeleteConfirmDialog({ visible: false, cardIndex: -1 });
      showError('Success', 'Card deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting card:', error);
      showError('Error', 'Failed to delete card');
    }
  };

  const handleEditCard = (cardIndex: number) => {
    closeCardMenu();
    router.push({
      pathname: "/(booking)/edit-card",
      params: { 
        booking_id: routeParams?.booking_id,
        card_index: cardIndex.toString()
      }
    });
  };

  const fetchSavedCards = useCallback(async (showRefreshIndicator = false, isInitialLoad = false) => {
    if (showRefreshIndicator) {
      setRefreshing(true);
    }
    if (isInitialLoad) {
      setInitialLoading(true);
    }
    
    try {
      const data = await getCards();
      console.log(data, "===================cards");
      if (data?.length) {
        const iterateData: Options[] = data.map((val, index) => {
          return {
            id: index.toString(),
            title: `${val?.brand} ending in ${val?.last4}`,
            description: `Ex.date ${val?.expMonth.toString().padStart(2, '0')}/${val?.expYear?.toString()?.slice(-2)}`,
            img: require("../../../public/visa.png"),
            cardData: val,
          };
        });
        setCardsData(iterateData);
        
        // Ensure selectedId is valid
        const isValid = iterateData.some(c => c.id === selectedId);
        if (iterateData.length > 0 && (!selectedId || selectedId === "" || !isValid)) {
          setSelectedId("0");
        } else if (iterateData.length === 0) {
          setSelectedId("");
        }
      }
    } catch (error) {
      console.error('Error fetching cards:', error);
      if (showRefreshIndicator || isInitialLoad) {
        showError('Error', 'Failed to load cards');
      }
    } finally {
      if (showRefreshIndicator) {
        setRefreshing(false);
      }
      if (isInitialLoad) {
        setInitialLoading(false);
      }
    }
  }, [selectedId, showError]);

  const generate3DSForm = () => {
    const paramsHtml = authParams
      .map((param) => {
        const key = param.name || Object.keys(param)[0];
        const value = param.value || param[key];
        return `<input type="hidden" name="${key}" value="${value}" />`;
      })
      .join('\n');

    return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body onload="document.forms[0].submit()">
                <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
                    <p>Redirecting to authentication...</p>
                </div>
                <form method="POST" action="${authUrl}">
                    ${paramsHtml}
                </form>
            </body>
            <script type="text/javascript">
var wpwlOptions = {
 paymentTarget: "_top",
}
</script>
            </html>
        `;
  };

  // Use a ref to track if 3DS is active to avoid stale closure in timeouts
  const is3DSActive = useRef(false);
  
  useEffect(() => {
      is3DSActive.current = show3DS;
  }, [show3DS]);

  const handle3DSComplete = (url: string) => {
    console.log('3DS Navigation URL:', url);

    // If we are already approved, ignore further navigation
    if ((status as string) === 'approved') return;

    // Check if the URL indicates completion
    if (url.includes('success') || url.includes('approved') || url.includes('complete')) {
      setShow3DS(false);
      startPolling(); // Start polling for payment status
    } else if (url.includes('fail') || url.includes('cancel') || url.includes('error')) {
      setShow3DS(false);
      showError(
        t("payment.authFailed") || 'Authentication Failed',
        t("payment.authFailedMessage") || 'Payment authentication failed or was cancelled.'
      );
    }
    // If URL doesn't match success/fail patterns, keep the WebView open
    // but also start polling after a delay in case the redirect is delayed
    else if (url !== authUrl && !url.includes('about:blank')) {
      // Start polling after 2 seconds if we're on a different URL that's not the initial auth URL
      setTimeout(() => {
        if (is3DSActive.current && (status as string) !== 'approved') {
          setShow3DS(false);
          startPolling();
        }
      }, 2000);
    }
  };

  const onRefresh = useCallback(() => {
    fetchSavedCards(true);
  }, [fetchSavedCards]);

  // Removed handleFetchPaymentStatus as it is now handled by usePaymentStatus hook

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
    // Don't set status to waiting yet, only after auth success

    const postData: BookingPaymentData = {
      booking_id: Number(routeParams.booking_id),
      payment_brand: selectedCard.cardData.brand,
      card_number: selectedCard.cardData.cardNumber, // Use stored full card number
      card_holder_name: selectedCard.cardData.cardHolderName,
      card_expiration_month: selectedCard.cardData.expMonth?.toString().padStart(2, '0'),
      card_expiration_year: selectedCard.cardData.expYear,
      card_cvv: cvvDialog.cvv, // Use entered CVV
      customer_email: selectedCard.cardData.email,
      billing_street: selectedCard.cardData.billingStreet,
      billing_city: selectedCard.cardData.billingCity,
      billing_state: selectedCard.cardData.billingState,
      billing_post_code: selectedCard.cardData.billingPostCode,
      billing_country: selectedCard.cardData.billingCountry,
      given_name: selectedCard.cardData.cardHolderName.split(' ')[0] || '',
      sur_name: selectedCard.cardData.cardHolderName.split(' ').slice(1).join(' ') || selectedCard.cardData.cardHolderName.split(' ')[0] || '',
    };

    console.log("Saved card payment payload:", postData);

    // Close CVV dialog
    setCvvDialog({ visible: false, cvv: '', loading: false });

    try {
      const response = await authorizePayment(postData);
      console.log('Payment authorization response:', response);

      // Check for API error responses
      if (response?.error || response?.status === 'error') {
        const errorMessage = response?.message || response?.error || 'Payment authorization failed';
        showError('Payment Error', errorMessage);
        setLoading(false); // Stop loading mainly
        return;
      }

      // Check for validation errors
      if (response?.errors && Array.isArray(response.errors)) {
        const errorMessages = response.errors.map((error: any) => error.message || error).join('\n');
        showError('Validation Error', errorMessages);
        setLoading(false);
        return;
      }

      // Check if 3DS authentication is required
      if (response?.message?.url && response?.message?.parameters) {
        setAuthUrl(response.message.url);
        setAuthParams(response.message.parameters);
        setShow3DS(true);
        // Loading stays true until we exit 3DS or complete flow? 
        // Actually usually we stop loading spinner when showing 3DS
        setLoading(false); 
        return;
      }

      // Check for specific payment failures
      if (response?.result?.code && response.result.code !== '000.100.110') {
        const errorMessage = response?.result?.description || 'Payment processing failed';
        showError('Payment Failed', errorMessage);
        setLoading(false);
        return;
      }

      // If we are here, it might mean success (000.100.110) or pending
      // Start polling for payment status
      startPolling();
      // Ensure loading is false, as we show the "Waiting" modal based on status
      setLoading(false); 

    } catch (err: any) {
      console.error('Payment failed:', err);
      setLoading(false);
      
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

      // Handle JSON parsing errors specifically
      if (err.message && err.message.includes('JSON')) {
        showError('Server Error', 'Invalid response from server. Please try again later.');
        return;
      }

      showError('Payment Error', errorMessage);
    }
  };

  useEffect(() => {
    fetchSavedCards(false, true);
  }, [fetchSavedCards]);

  // Refetch cards when screen comes into focus (e.g., returning from add/edit card)
  useFocusEffect(
    useCallback(() => {
      // Only refetch if not initial loading to avoid double loading
      if (!initialLoading) {
        fetchSavedCards();
      }
    }, [initialLoading, fetchSavedCards])
  );

  // Handle timeout/failure from hook
  useEffect(() => {
    if (status === 'failed') {
        showError('Payment Timeout', 'Payment verification timed out. Please check your booking status.', 'warning');
        setStatus('idle');
    }
  }, [status, setStatus, showError]);

  if (!loaded) return null;

  // Show 3DS WebView if needed
  if (show3DS) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-200">
          <View className="flex-row items-center">
            <TouchableOpacity
              className="bg-white rounded-full size-[45px] flex-row items-center justify-center border border-[#EBEBEB]"
              activeOpacity={0.8}
              onPress={() => {
                setShow3DS(false);
                showError(
                  t("payment.authCancelled") || 'Authentication Cancelled',
                  t("payment.authCancelledMessage") || 'Payment authentication was cancelled.'
                );
              }}
            >
              <ChevronLeft color="#3C3F4E" />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-gray-900 ml-3">{t("payment.secureAuthentication") || "Secure Authentication"}</Text>
          </View>
          <TouchableOpacity
            className="bg-blue-500 rounded-lg px-4 py-2"
            activeOpacity={0.8}
            onPress={() => {
              setShow3DS(false);
              setStatus("waiting");
            }}
          >
            <Text className="text-white text-sm font-semibold">{t("payment.done") || "Done"}</Text>
          </TouchableOpacity>
        </View>
        <WebView
          source={{ html: generate3DSForm() }}
          onNavigationStateChange={(navState) => {
            console.log('Navigation URL:', navState.url);
            handle3DSComplete(navState.url);
          }}
          style={{ flex: 1 }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      </SafeAreaView>
    );
  }

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
        <View className="flex-col items-start flex-1">
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
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            onPress={() => setCardMenu({ 
              visible: true, 
              cardId: id, 
              cardIndex: parseInt(id) 
            })}
            className="p-2"
            activeOpacity={0.7}
          >
            <MoreVertical size={20} color="#666666" />
          </TouchableOpacity>
          <View className="size-[27px] aspect-square relative border border-gray-300 rounded-full flex-row items-center justify-center">
            {isChecked && <CheckIcon />}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 relative pb-[100px]">
      <ScrollView 
        bounces={false} 
        className="font-[Kanit-Regular] w-full bg-white"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FF4848']} // Android
            tintColor="#FF4848" // iOS
          />
        }
      >
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

          {/* Cards List - using map instead of FlatList inside ScrollView */}
          <View className="flex flex-col gap-4">
            {cardsData.length > 0 ? (
              cardsData.map((item) => renderOption(item))
            ) : (
                <View className="py-8 items-center">
                  <Text className="text-[16px] font-[Kanit-Light] text-gray-500 text-center">
                    {initialLoading ? 'Loading cards...' : refreshing ? 'Refreshing cards...' : 'No saved cards found'}
                  </Text>
                  {!refreshing && !initialLoading && (
                    <Text className="text-[14px] font-[Kanit-Light] text-gray-400 text-center mt-2">
                      Pull down to refresh or add a new card
                    </Text>
                  )}
                </View>
            )}
          </View>

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
            disabled={loading || cardsData.length === 0 || initialLoading}
          >
            <Text
              fontSize={18}
              className="text-[18px] text-center text-white font-[Kanit-Medium] uppercase"
            >
              {loading ? t("payment.processing") || "Processing..." : 
               initialLoading ? "Loading..." : 
               t("payment.pay")}
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

      {/* Card Menu Dialog */}
      <Modal visible={cardMenu.visible} transparent animationType="fade">
        <TouchableOpacity 
          className="flex-1 bg-black/30 justify-center items-center"
          activeOpacity={1}
          onPress={closeCardMenu}
        >
          <View className="bg-white rounded-2xl mx-6 p-4 min-w-[200px]">
            <TouchableOpacity
              className="flex-row items-center py-3 px-2"
              onPress={() => handleEditCard(cardMenu.cardIndex)}
              activeOpacity={0.7}
            >
              <Edit size={20} color="#666666" />
              <Text className="ml-3 text-[16px] font-[Kanit-Regular] text-gray-800">
                {t("payment.editCard") || "Edit Card"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row items-center py-3 px-2"
              onPress={() => {
                closeCardMenu();
                setDeleteConfirmDialog({ visible: true, cardIndex: cardMenu.cardIndex });
              }}
              activeOpacity={0.7}
            >
              <Trash2 size={20} color="#EF4444" />
              <Text className="ml-3 text-[16px] font-[Kanit-Regular] text-red-500">
                {t("payment.deleteCard") || "Delete Card"}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Dialog
        visible={deleteConfirmDialog.visible}
        onClose={() => setDeleteConfirmDialog({ visible: false, cardIndex: -1 })}
        title={t("payment.deleteCardTitle") || "Delete Card"}
        showButtons={true}
        confirmText={t("payment.delete") || "Delete"}
        cancelText={t("common.cancel") || "Cancel"}
        onConfirm={() => handleDeleteCard(deleteConfirmDialog.cardIndex)}
        onCancel={() => setDeleteConfirmDialog({ visible: false, cardIndex: -1 })}
      >
        <View className="py-4">
          <Text className="text-[32px] mb-4 text-center">⚠️</Text>
          <Text className="text-[16px] font-[Kanit-Light] text-center text-gray-700 leading-6">
            {t("payment.deleteCardMessage") || "Are you sure you want to delete this card? This action cannot be undone."}
          </Text>
        </View>
      </Dialog>
    </View>
  );
}

export default Payment;