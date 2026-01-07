import ApprovedAnimation from '@/components/animated/approved-animation';
import { getPaymentStatus, useAuthorizePayment } from '@/service/payment';
import { getCards, saveCards, SavedCardMeta } from '@/store/card-store';
import { BookingPaymentData } from '@/types/ride-types';
import { useRoute } from '@react-navigation/native';
import { router } from 'expo-router';
import { useTranslation } from "react-i18next";
import { ChevronLeft } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    Modal,
    FlatList,
    Keyboard,
    Dimensions
} from 'react-native';
import { WebView } from 'react-native-webview';
import Visa from '../../../public/visa.svg';
import Mastercard from '../../../public/Mastercard.svg';
import Amex from '../../../public/amex.svg';
import Mada from '../../../public/mada.svg';
import AlertDialog from '@/components/ui/alert-dialog';

type CardType = 'visa' | 'mastercard' | 'amex' | 'mada';

interface CardData {
    cardType: CardType;
    cardHolderName: string;
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    email: string;
    billingStreet: string;
    billingCity: string;
    billingState: string;
    billingPostCode: string;
    billingCountry: string;
}

type Status = "idle" | "waiting" | "approved";

const returnIcon =(cardType:CardType) =>{
    switch (cardType) {
        case "visa":
            return <Visa className='mr-2' />
        case "mada":
            return <Mada className='mr-2' />
        case "amex":
            return <Amex className='mr-2' />
        case "mastercard":
            return <Mastercard className='mr-2' />
        default:
            break;
    }
}

interface RouteParams {
    booking_id: string;
}

interface ErrorState {
    visible: boolean;
    title: string;
    message: string;
    type: "info" | "warning" | "error" | "success";
}

const AddNewCard: React.FC = () => {
    const { t } = useTranslation("components");
    const [selectedCard, setSelectedCard] = useState<CardType>('visa');
    const [status, setStatus] = useState<Status>("idle");
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    const [formData, setFormData] = useState<CardData>({
        cardType: 'visa',
        cardHolderName: '',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        email: '',
        billingStreet: '',
        billingCity: '',
        billingState: '',
        billingPostCode: '',
        billingCountry: 'SA',
    });
    const [loading, setLoading] = useState(false);
    const [show3DS, setShow3DS] = useState(false);
    const [authUrl, setAuthUrl] = useState('');
    const [authParams, setAuthParams] = useState<any[]>([]);
    const [errorDialog, setErrorDialog] = useState<ErrorState>({
        visible: false,
        title: '',
        message: '',
        type: 'error'
    });
    const [successDialog, setSuccessDialog] = useState({
        visible: false,
        title: '',
        message: ''
    });
    const route = useRoute();
    const routeParams = route.params as RouteParams;
    const scrollViewRef = React.useRef<ScrollView>(null);

    const showError = (title: string, message: string, type: "error" | "warning" | "info" = "error") => {
        setErrorDialog({
            visible: true,
            title,
            message,
            type
        });
    };

    const showSuccess = (title: string, message: string) => {
        setSuccessDialog({
            visible: true,
            title,
            message
        });
    };

    const closeErrorDialog = () => {
        setErrorDialog({
            ...errorDialog,
            visible: false
        });
    };

    const closeSuccessDialog = () => {
        setSuccessDialog({
            visible: false,
            title: '',
            message: ''
        });
    };

    const handleInputFocus = (inputRef?: any) => {
        if (scrollViewRef.current && inputRef) {
            setTimeout(() => {
                inputRef.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
                    scrollViewRef.current?.scrollTo({
                        y: Math.max(0, pageY - 100),
                        animated: true,
                    });
                });
            }, 100);
        }
    };

    const CARD_TYPES = [
        { id: 'visa', label: 'VISA', image: Visa },
        { id: 'mastercard', label: 'Mastercard', image: Mastercard },
        { id: 'amex', label: 'AMEX', image: Amex },
        { id: 'mada', label: 'mada', image: Mada },
    ];

    const handleInputChange = (field: keyof CardData, value: string) => {
        setFormData((prev) => {
            if (prev[field] === value) return prev;
            return { ...prev, [field]: value };
        });
    };

    const handleFetchPaymentStatus = async () => {
        if (!routeParams?.booking_id) return false;
        
        try {
            const response = await getPaymentStatus(Number(routeParams.booking_id));
            console.log(response, "====================response", response.data?.paymentStatus);
            if (response.data?.paymentStatus === 2) {
                setStatus("approved");
                showSuccess(
                    t("payment.bookingConfirmed") || "Booking Confirmed",
                    t("payment.paymentSuccessMessage") || "Your payment has been processed successfully and your booking is confirmed."
                );
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error fetching payment status:", error);
            return false;
        }
    };

    useEffect(() => {
        /* first call immediately */
        handleFetchPaymentStatus();

        /* Keyboard event listeners */
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            (e) => {
                setKeyboardHeight(e.endCoordinates.height);
                setIsKeyboardVisible(true);
            }
        );
        
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setKeyboardHeight(0);
                setIsKeyboardVisible(false);
            }
        );

        /* stop polling when the screen is left */
        return () => {
            keyboardDidShowListener?.remove();
            keyboardDidHideListener?.remove();
        };
    }, []);

    // Separate useEffect for payment status polling
    useEffect(() => {
        let pollInterval: NodeJS.Timeout;
        
        if (status === "waiting") {
            // Start polling when payment is in waiting state
            pollInterval = setInterval(async () => {
                const isApproved = await handleFetchPaymentStatus();
                if (isApproved) {
                    clearInterval(pollInterval);
                }
            }, 3000); // Poll every 3 seconds for better responsiveness

            // Clear interval after 3 minutes to prevent infinite polling
            const timeoutId = setTimeout(() => {
                clearInterval(pollInterval);
                if (status === "waiting") {
                    setStatus("idle");
                    showError(
                        t("payment.timeout") || 'Payment Timeout', 
                        t("payment.timeoutMessage") || 'Payment verification timed out. Please check your booking status or try again.',
                        'warning'
                    );
                }
            }, 180000); // 3 minutes

            return () => {
                clearInterval(pollInterval);
                clearTimeout(timeoutId);
            };
        }

        return () => {
            if (pollInterval) clearInterval(pollInterval);
        };
    }, [status]);

    // Start polling when 3DS is shown, but don't auto-close WebView
    useEffect(() => {
        let pollInterval: NodeJS.Timeout;
        
        if (show3DS) {
            // Start polling immediately when 3DS is shown
            setStatus("waiting");
            
            pollInterval = setInterval(async () => {
                const isApproved = await handleFetchPaymentStatus();
                if (isApproved) {
                    clearInterval(pollInterval);
                    setShow3DS(false); // Only close WebView when payment is approved
                }
            }, 3000); // Poll every 3 seconds

            // Clear interval after 5 minutes to prevent infinite polling
            const timeoutId = setTimeout(() => {
                clearInterval(pollInterval);
                if (status === "waiting" && show3DS) {
                    setStatus("idle");
                    setShow3DS(false);
                    showError(
                        t("payment.timeout") || 'Payment Timeout', 
                        t("payment.timeoutMessage") || 'Payment verification timed out. Please check your booking status or try again.',
                        'warning'
                    );
                }
            }, 300000); // 5 minutes

            return () => {
                clearInterval(pollInterval);
                clearTimeout(timeoutId);
            };
        }

        return () => {
            if (pollInterval) clearInterval(pollInterval);
        };
    }, [show3DS]);

    console.log(routeParams?.booking_id, "booking id")

    const handleSave = async () => {
        setLoading(true);

        // Basic validation
        const [monthStr, yearStr] = formData.expiryDate.split('/');
        const month = Number(monthStr);
        const year = Number(yearStr);

        if (!formData.cardHolderName.trim()) {
            showError(t("payment.validationError"), t("payment.enterCardholderName"));
            setLoading(false);
            return;
        }

        const cleanedCardNumber = formData.cardNumber.replace(/\s/g, '');
        if (cleanedCardNumber.length !== 16) {
            showError(t("payment.validationError"), t("payment.enterValidCardNumber"));
            setLoading(false);
            return;
        }

        if (
            !monthStr ||
            !yearStr ||
            month < 1 ||
            month > 12 ||
            yearStr.length !== 2 ||
            year < 0 ||
            year > 99
        ) {
            showError(t("payment.validationError"), t("payment.enterValidExpiryDate"));
            setLoading(false);
            return;
        }

        if (formData.cvv.length < 3 || formData.cvv.length > 4) {
            showError(t("payment.validationError"), t("payment.enterValidCVV"));
            setLoading(false);
            return;
        }

        if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
            showError(t("payment.validationError"), t("payment.enterValidEmail"));
            setLoading(false);
            return;
        }

        const postData: BookingPaymentData = {
            booking_id: Number(routeParams?.booking_id),
            payment_brand: formData.cardType.toUpperCase(),
            card_number: cleanedCardNumber,
            card_holder_name: formData.cardHolderName.trim(),
            card_expiration_month: month.toString().padStart(2, '0'),
            card_expiration_year: 2000 + year,
            card_cvv: formData.cvv,
            customer_email: formData.email.trim(),
            billing_street: formData.billingStreet.trim(),
            billing_city: formData.billingCity.trim(),
            billing_state: formData.billingState.trim(),
            billing_post_code: formData.billingPostCode.trim(),
            billing_country: formData.billingCountry.trim(),
            given_name: formData.cardHolderName.trim().split(' ')[0] || '',
            sur_name: formData.cardHolderName.trim().split(' ')[0] || '',
        };

        try {
            const response = await useAuthorizePayment(postData);
            console.log('Payment authorization response:', response);
            console.log('Payment authorization req:', postData);

            // Check for API error responses
            if (response?.error || response?.status === 'error') {
                const errorMessage = response?.message || response?.error || t("payment.paymentAuthorizationFailed");
                showError(t("payment.paymentError"), errorMessage);
                return;
            }

            // Check for validation errors
            if (response?.errors && Array.isArray(response.errors)) {
                const errorMessages = response.errors.map((error: any) => error.message || error).join('\n');
                showError(t("payment.validationError"), errorMessages);
                return;
            }

            // Check for specific payment failures
            if (response?.result?.code && response.result.code !== '000.100.110') {
                const errorMessage = response?.result?.description || t("payment.paymentProcessingFailed");
                showError(t("payment.paymentError"), errorMessage);
                return;
            }

            // Extract last 4 digits and brand
            const last4 = cleanedCardNumber.slice(-4);
            const brand = formData.cardType.toUpperCase();
            const expMonth = month;
            const expYear = 2000 + year;
            const alias =
                formData.cardHolderName.trim() +
                ' •••• ' +
                last4 +
                ' ' +
                `${expMonth.toString().padStart(2, "0")}/${expYear}`;
            const savedCardMeta: SavedCardMeta = {
                alias,
                last4,
                brand,
                expMonth,
                expYear,
                holder: formData.cardHolderName.trim(),
                addedAt: new Date().toISOString(),
                cardHolderName: formData.cardHolderName.trim(),
                billingStreet: formData.billingStreet.trim(),
                billingCity: formData.billingCity.trim(),
                billingState: formData.billingState.trim(),
                billingPostCode: formData.billingPostCode.trim(),
                billingCountry: formData.billingCountry.trim(),
                email: formData.email.trim(),
                cardNumber: cleanedCardNumber, // Store full card number for frontend-saved cards
            };

            const cards = (await getCards()) || [];
            const updatedCards = [...cards, savedCardMeta];
            await saveCards(updatedCards);
            // Check if 3DS authentication is required
            if (response?.message?.url && response?.message?.parameters) {
                setAuthUrl(response.message.url);
                setAuthParams(response.message.parameters);
                setShow3DS(true);
            } else if (response?.result?.code === '000.100.110') {
                // Payment successful without 3DS - start polling for status
                setStatus("waiting");
            } else {
                // Payment initiated, start polling for status
                setStatus("waiting");
            }
        } catch (err: any) {
            console.error('Payment failed:', err);
            
            // Handle network errors
            if (err.name === 'TypeError' && err.message.includes('Network request failed')) {
                showError(t("payment.networkError"), t("payment.checkInternetConnection"));
                return;
            }
            
            // Handle timeout errors
            if (err.name === 'AbortError' || err.message.includes('timeout')) {
                showError(t("payment.timeoutError"), t("payment.requestTimedOut"));
                return;
            }
            
            // Handle JSON parsing errors
            if (err.message.includes('JSON')) {
                showError(t("payment.serverError"), t("payment.invalidServerResponse"));
                return;
            }
            
            // Generic error handling
            const errorMessage = err?.response?.data?.message || 
                               err?.message || 
                               t("payment.failedToAuthorizePayment");
            showError(t("payment.paymentError"), errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handle3DSComplete = (url: string) => {
        console.log('3DS Navigation URL:', url);
        
        // Only close WebView on explicit failure/cancel URLs
        // Let the polling handle success detection via API
        if (url.includes('fail') || url.includes('cancel') || url.includes('error')) {
            setShow3DS(false);
            setStatus("idle");
            showError(
                t("payment.authFailed") || 'Authentication Failed', 
                t("payment.authFailedMessage") || 'Payment authentication failed or was cancelled.'
            );
        }
        // Don't auto-close on other URLs - let polling handle success detection
    };

    // Generate HTML form for POST request
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

    const CardTypeButton = ({ type, label, Icon }: { type: CardType; label: string, Icon: any }) => (
        <TouchableOpacity
            onPress={() => {
                setSelectedCard(type);
                handleInputChange('cardType', type);
            }}
            className={`px-6 py-3 rounded-full mr-3 ${selectedCard === type ? 'bg-blue-100' : 'bg-gray-100'
                }`}
            disabled={loading}
        >
            <Icon />
        </TouchableOpacity>
    );

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
                                setStatus("idle");
                                showError(
                                    t("payment.authCancelled") || 'Authentication Cancelled', 
                                    t("payment.authCancelledMessage") || 'Payment authentication was cancelled.'
                                );
                            }}
                        >
                            <ChevronLeft color="#3C3F4E" />
                        </TouchableOpacity>
                        <Text className="text-lg font-bold text-gray-900 ml-3">{t("payment.secureAuthentication")}</Text>
                    </View>
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
                
                {/* Success Bottom Sheet Overlay - Only show when approved */}
                {status === "approved" && (
                    <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-lg border-t border-gray-200">
                        <View className="px-6 py-8">
                            <View className="size-[100px] mx-auto items-center justify-center mb-4">
                                <Text className="text-5xl">✅</Text>
                            </View>
                            <Text className="text-xl font-semibold text-black text-center mb-2">
                                {t("payment.bookingConfirmed") || "Booking Confirmed"}
                            </Text>
                            <Text className="text-sm text-gray-600 text-center mb-4">
                                {t("payment.paymentSuccessMessage") || "Your payment has been processed successfully and your booking is confirmed."}
                            </Text>
                            <TouchableOpacity
                                className="bg-green-500 rounded-full px-6 py-3 mx-auto"
                                onPress={() => {
                                    setStatus("idle");
                                    router.push("/(tabs)/book");
                                }}
                                activeOpacity={0.8}
                            >
                                <Text className="text-white text-center font-semibold">
                                    {t("common.ok") || "OK"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <ScrollView
                    ref={scrollViewRef}
                    bounces={false}
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ 
                        paddingBottom: isKeyboardVisible ? keyboardHeight + 50 : 100,
                        flexGrow: 1 
                    }}
                    scrollEnabled={true}
                    nestedScrollEnabled={true}
                >
                    <View className="px-5 py-6">
                        {/* Header */}
                        <View className="flex-row items-center mb-6">
                            <TouchableOpacity
                                className="bg-white/20 rounded-full size-[45px] flex-row items-center justify-center border border-[#EBEBEB]"
                                activeOpacity={0.8}
                                onPress={() => router.replace("..")}
                            >
                                <ChevronLeft color="#3C3F4E" />
                            </TouchableOpacity>
                            <Text className="text-xl font-bold text-gray-900">{t("payment.addNewCardTitle")}</Text>
                        </View>

                        {/* Card Type Selection */}
                        <View className="mb-6">
                            <Text className="text-gray-800 font-semibold mb-3">
                                {t("payment.selectCardType")}
                            </Text>
                            <FlatList
                                data={CARD_TYPES}
                                keyExtractor={(item: any) => item.id}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                renderItem={({ item }: { item: any }) => (
                                    <CardTypeButton
                                        type={item.id}
                                        label={item.label}
                                        Icon={item.image}
                                    />
                                )}
                            />
                        </View>

                        {/* Card Holder Name */}
                        <View className="mb-5">
                            <Text className="text-gray-800 font-semibold mb-2">{t("payment.cardHolderName")}</Text>
                            <TextInput
                                value={formData.cardHolderName}
                                onChangeText={(text) => handleInputChange('cardHolderName', text)}
                                placeholder={t("payment.cardHolderNamePlaceholder")}
                                placeholderTextColor="#9CA3AF"
                                keyboardType="default"
                                className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
                                editable={!loading}
                                returnKeyType="next"
                                blurOnSubmit={false}
                            />
                        </View>

                        {/* Card Number */}
                        <View className="mb-5">
                            <Text className="text-gray-800 font-semibold mb-2">{t("payment.cardNumber")}</Text>
                            <View className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 flex-row gap-1 items-center">
                                {returnIcon(selectedCard)}
                                <TextInput
                                    value={formData.cardNumber}
                                    onChangeText={(text) => {
                                        // Auto-format with spaces every 4 digits
                                        const cleaned = text.replace(/\D/g, '');
                                        const match = cleaned.match(/^(.{0,4})(.{0,4})(.{0,4})(.{0,4})/);
                                        if (!match) return;
                                        const formatted = [match[1], match[2], match[3], match[4]]
                                            .filter(Boolean)
                                            .join(' ');
                                        handleInputChange('cardNumber', formatted);
                                    }}
                                    placeholder={t("payment.cardNumberPlaceholder")}
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="numeric"
                                    maxLength={19}
                                    className="flex-1 text-gray-800"
                                    editable={!loading}
                                    returnKeyType="next"
                                    blurOnSubmit={false}
                                />
                            </View>
                        </View>

                        {/* Expiry Date and CVV */}
                        <View className="flex-row mb-5">
                            <View className="flex-1 mr-3">
                                <Text className="text-gray-800 font-semibold mb-2">{t("payment.expiryDate")}</Text>
                                <TextInput
                                    value={formData.expiryDate}
                                    onChangeText={(text) => {
                                        // Auto-format as MM/YY
                                        const cleaned = text.replace(/\D/g, '');
                                        if (cleaned.length >= 3) {
                                            const formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
                                            handleInputChange('expiryDate', formatted);
                                        } else {
                                            handleInputChange('expiryDate', cleaned);
                                        }
                                    }}
                                    placeholder={t("payment.expiryDatePlaceholder")}
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="numeric"
                                    maxLength={5}
                                    className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
                                    editable={!loading}
                                    returnKeyType="next"
                                    blurOnSubmit={false}
                                />
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-800 font-semibold mb-2">{t("payment.cvv")}</Text>
                                <TextInput
                                    value={formData.cvv}
                                    onChangeText={(text) =>
                                        handleInputChange('cvv', text.replace(/\D/g, ''))
                                    }
                                    placeholder={t("payment.cvvPlaceholder")}
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="numeric"
                                    maxLength={4}
                                    secureTextEntry
                                    className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
                                    editable={!loading}
                                    returnKeyType="next"
                                    blurOnSubmit={false}
                                />
                            </View>
                        </View>

                        {/* Billing Details */}
                        <Text className="text-gray-900 font-bold text-lg mb-4">
                            {t("payment.billingDetails")}
                        </Text>

                        {/* Email */}
                        <View className="mb-5">
                            <Text className="text-gray-800 font-semibold mb-2">{t("payment.email")}</Text>
                            <TextInput
                                value={formData.email}
                                onChangeText={(text) => handleInputChange('email', text)}
                                placeholder={t("payment.emailPlaceholder")}
                                placeholderTextColor="#9CA3AF"
                                keyboardType="email-address"
                                className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
                                editable={!loading}
                                returnKeyType="next"
                                blurOnSubmit={false}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

                        {/* Billing Street */}
                        <View className="mb-5">
                            <Text className="text-gray-800 font-semibold mb-2">{t("payment.billingStreet")}</Text>
                            <TextInput
                                value={formData.billingStreet}
                                onChangeText={(text) => handleInputChange('billingStreet', text)}
                                placeholder={t("payment.billingStreetPlaceholder")}
                                placeholderTextColor="#9CA3AF"
                                keyboardType="default"
                                className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
                                editable={!loading}
                                returnKeyType="next"
                                blurOnSubmit={false}
                            />
                        </View>

                        {/* Billing City */}
                        <View className="mb-5">
                            <Text className="text-gray-800 font-semibold mb-2">{t("payment.billingCity")}</Text>
                            <TextInput
                                value={formData.billingCity}
                                onChangeText={(text) => handleInputChange('billingCity', text)}
                                placeholder={t("payment.billingCityPlaceholder")}
                                placeholderTextColor="#9CA3AF"
                                keyboardType="default"
                                className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
                                editable={!loading}
                                returnKeyType="next"
                                blurOnSubmit={false}
                            />
                        </View>

                        {/* Billing State */}
                        <View className="mb-5">
                            <Text className="text-gray-800 font-semibold mb-2">{t("payment.billingState")}</Text>
                            <TextInput
                                value={formData.billingState}
                                onChangeText={(text) => handleInputChange('billingState', text)}
                                placeholder={t("payment.billingStatePlaceholder")}
                                placeholderTextColor="#9CA3AF"
                                keyboardType="default"
                                className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
                                editable={!loading}
                                returnKeyType="next"
                                blurOnSubmit={false}
                            />
                        </View>

                        {/* Billing Post Code */}
                        <View className="mb-5">
                            <Text className="text-gray-800 font-semibold mb-2">{t("payment.billingPostCode")}</Text>
                            <TextInput
                                value={formData.billingPostCode}
                                onChangeText={(text) => handleInputChange('billingPostCode', text)}
                                placeholder={t("payment.billingPostCodePlaceholder")}
                                placeholderTextColor="#9CA3AF"
                                keyboardType="numeric"
                                className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
                                editable={!loading}
                                returnKeyType="done"
                                blurOnSubmit={true}
                            />
                        </View>

                        {/* Save Button */}
                        <TouchableOpacity
                            onPress={handleSave}
                            disabled={loading}
                            className={`rounded-full py-4 mt-6 mb-8 ${loading ? 'bg-gray-400' : 'bg-red-500'
                                }`}
                            activeOpacity={0.8}
                        >
                            <Text className="text-white text-center font-bold text-lg">
                                {loading ? t("payment.processing") : t("payment.save")}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
                
                {/* Waiting Modal - Only show when not in 3DS mode */}
                {status === "waiting" && !show3DS && (
                    <Modal visible={true} transparent animationType="fade">
                        <View className="flex-1 justify-end bg-black/30">
                            <View className="bg-white px-12 py-12 rounded-t-3xl">
                                <View className="size-[150px] mx-auto items-center justify-center">
                                    <Text className="text-6xl">⏳</Text>
                                </View>
                                <Text className="text-[25px] font-[Kanit-Regular] text-black text-center mt-4">
                                    {t("payment.waitingApproval") || "Waiting for payment approval..."}
                                </Text>
                                <Text className="text-sm text-gray-600 text-center mt-2">
                                    {t("payment.waitingSubtext") || "Please wait while we verify your payment"}
                                </Text>
                            </View>
                        </View>
                    </Modal>
                )}
            </KeyboardAvoidingView>

            {/* Error Dialog */}
            <AlertDialog
                visible={errorDialog.visible}
                onClose={closeErrorDialog}
                title={errorDialog.title}
                message={errorDialog.message}
                type={errorDialog.type}
                confirmText={t("common.ok") || "OK"}
            />

            {/* Success Dialog */}
            <AlertDialog
                visible={successDialog.visible}
                onClose={() => {
                    closeSuccessDialog();
                    setStatus("idle");
                    router.push("/(tabs)/book");
                }}
                title={successDialog.title}
                message={successDialog.message}
                type="success"
                confirmText={t("common.ok") || "OK"}
                onConfirm={() => {
                    closeSuccessDialog();
                    setStatus("idle");
                    router.push("/(tabs)/book");
                }}
            />
        </SafeAreaView>
    );
};

export default AddNewCard;