import ApprovedAnimation from '@/components/animated/approved-animation';
import { getPaymentStatus, useAuthorizePayment } from '@/service/payment';
import { getCards, saveCard, saveCards, SavedCardMeta } from '@/store/card-store';
import { BookingPaymentData } from '@/types/ride-types';
import { useRoute } from '@react-navigation/native';
import { router } from 'expo-router';
import { t } from 'i18next';
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
    Alert,
    Modal,FlatList
} from 'react-native';
import { WebView } from 'react-native-webview';
import Visa from '../../../public/visa.svg';
import Mastercard from '../../../public/Mastercard.svg';
import Amex from '../../../public/amex.svg';
import Mada from '../../../public/mada.svg';

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

const AddNewCard: React.FC = () => {
    const [selectedCard, setSelectedCard] = useState<CardType>('visa');
    const [status, setStatus] = useState<Status>("idle");
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
    const route = useRoute()

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
        const response = await getPaymentStatus(Number(route?.params?.booking_id))
        console?.log(response, "====================response")
        if (response.data?.paymentStatus == 3) {
            setStatus("approved")
        }
    }

    useEffect(() => {
        /* first call immediately */
        handleFetchPaymentStatus();

        /* poll every 5 s */
        const id = setInterval(handleFetchPaymentStatus, 5_000);

        /* stop polling when the screen is left */
        return () => clearInterval(id);
    }, []);

    console.log(route?.params?.booking_id, "booking id")

    const handleSave = async () => {
        setLoading(true);

        // Basic validation
        const [monthStr, yearStr] = formData.expiryDate.split('/');
        const month = Number(monthStr);
        const year = Number(yearStr);

        if (!formData.cardHolderName.trim()) {
            Alert.alert('Error', 'Please enter cardholder name.');
            setLoading(false);
            return;
        }

        const cleanedCardNumber = formData.cardNumber.replace(/\s/g, '');
        if (cleanedCardNumber.length !== 16) {
            Alert.alert('Error', 'Please enter a valid card number (16 digits).');
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
            Alert.alert('Error', 'Please enter a valid expiry date (MM/YY).');
            setLoading(false);
            return;
        }

        if (formData.cvv.length < 3 || formData.cvv.length > 4) {
            Alert.alert('Error', 'Please enter a valid CVV.');
            setLoading(false);
            return;
        }

        if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
            Alert.alert('Error', 'Please enter a valid email address.');
            setLoading(false);
            return;
        }

        const postData: BookingPaymentData = {
            booking_id: Number(route?.params?.booking_id),
            payment_brand: formData.cardType.toUpperCase(),
            card_number: cleanedCardNumber,
            card_holder_name: formData.cardHolderName.trim(),
            card_expiration_month: month,
            card_expiration_year: 2000 + year,
            card_cvv: formData.cvv,
            customer_email: formData.email.trim(),
            billing_street: formData.billingStreet.trim(),
            billing_city: formData.billingCity.trim(),
            billing_state: formData.billingState.trim(),
            billing_post_code: formData.billingPostCode.trim(),
            billing_country: formData.billingCountry.trim(),
            given_name: formData.cardHolderName.trim().split(' ')[0] || '',
            sur_name: formData.cardHolderName.trim().split(' ').slice(1).join(' ') || '',
        };

        try {
            const response = await useAuthorizePayment(postData);
            console.log('Payment authorization response:', response);
            console.log('Payment authorization req:', postData);

            // Fix: Create a SavedCardMeta type data (with all required fields) for saveCard and cardStore.save

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
            };

            const cards = (await getCards()) || [];
            const updatedCards = [...cards, savedCardMeta];
            await saveCards(updatedCards);

            // Check if 3DS authentication is required
            if (response?.message?.url && response?.message?.parameters) {
                setAuthUrl(response.message.url);
                setAuthParams(response.message.parameters);
                setShow3DS(true);
            } else {
                // No 3DS required, payment successful
                // Alert.alert('Success', 'Card added successfully!');
                // router.back();
            }
        } catch (err: any) {
            console.error('Payment failed:', err);
            Alert.alert('Error', err?.message || 'Failed to authorize payment.');
        } finally {
            setLoading(false);
        }
    };

    const handle3DSComplete = (url: string) => {
        // Check if the URL indicates completion
        // You'll need to adjust this based on your success/failure redirect URLs
        if (url.includes('success') || url.includes('approved')) {
            setShow3DS(false);
            Alert.alert('Success', 'Card added successfully!');
            router.back();
        } else if (url.includes('fail') || url.includes('cancel')) {
            setShow3DS(false);
            Alert.alert('Error', 'Payment authentication failed or was cancelled.');
        }
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
                <View className="flex-row items-center px-5 py-4 border-b border-gray-200">
                    <TouchableOpacity
                        className="bg-white rounded-full size-[45px] flex-row items-center justify-center border border-[#EBEBEB]"
                        activeOpacity={0.8}
                        onPress={() => {
                            setShow3DS(false);
                            Alert.alert('Cancelled', 'Authentication was cancelled.');
                        }}
                    >
                        <ChevronLeft color="#3C3F4E" />
                    </TouchableOpacity>
                    <Text className="text-lg font-bold text-gray-900 ml-3">Secure Authentication</Text>
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

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ paddingBottom: 50 }}
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
                            <Text className="text-xl font-bold text-gray-900">Add New Card</Text>
                        </View>

                        {/* Card Type Selection */}
                        <View className="mb-6">
                            <Text className="text-gray-800 font-semibold mb-3">
                                Select Type of Card
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
                            <Text className="text-gray-800 font-semibold mb-2">Card Holder Name</Text>
                            <TextInput
                                value={formData.cardHolderName}
                                onChangeText={(text) => handleInputChange('cardHolderName', text)}
                                placeholder="Enter cardholder name"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="default"
                                className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
                                editable={!loading}
                            />
                        </View>

                        {/* Card Number */}
                        <View className="mb-5">
                            <Text className="text-gray-800 font-semibold mb-2">Card Number</Text>
                            <View className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 flex-row gap-1 items-center">
                                {/* <Text className="text-blue-600 font-bold mr-3">
                                    {selectedCard.toUpperCase()}
                                </Text> */}
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
                                    placeholder="1234 5678 9012 3456"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="numeric"
                                    maxLength={19}
                                    className="flex-1 text-gray-800"
                                    editable={!loading}
                                />
                            </View>
                        </View>

                        {/* Expiry Date and CVV */}
                        <View className="flex-row mb-5">
                            <View className="flex-1 mr-3">
                                <Text className="text-gray-800 font-semibold mb-2">Expiry Date</Text>
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
                                    placeholder="MM/YY"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="numeric"
                                    maxLength={5}
                                    className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
                                    editable={!loading}
                                />
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-800 font-semibold mb-2">CVV</Text>
                                <TextInput
                                    value={formData.cvv}
                                    onChangeText={(text) =>
                                        handleInputChange('cvv', text.replace(/\D/g, ''))
                                    }
                                    placeholder="123"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="numeric"
                                    maxLength={4}
                                    secureTextEntry
                                    className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
                                    editable={!loading}
                                />
                            </View>
                        </View>

                        {/* Billing Details */}
                        <Text className="text-gray-900 font-bold text-lg mb-4">
                            Billing Details
                        </Text>

                        {/* Email */}
                        <View className="mb-5">
                            <Text className="text-gray-800 font-semibold mb-2">Email</Text>
                            <TextInput
                                value={formData.email}
                                onChangeText={(text) => handleInputChange('email', text)}
                                placeholder="Enter email"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="email-address"
                                className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
                                editable={!loading}
                            />
                        </View>

                        {/* Billing Street */}
                        <View className="mb-5">
                            <Text className="text-gray-800 font-semibold mb-2">Billing Street</Text>
                            <TextInput
                                value={formData.billingStreet}
                                onChangeText={(text) => handleInputChange('billingStreet', text)}
                                placeholder="Enter street"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="default"
                                className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
                                editable={!loading}
                            />
                        </View>

                        {/* Billing City */}
                        <View className="mb-5">
                            <Text className="text-gray-800 font-semibold mb-2">Billing City</Text>
                            <TextInput
                                value={formData.billingCity}
                                onChangeText={(text) => handleInputChange('billingCity', text)}
                                placeholder="Enter city"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="default"
                                className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
                                editable={!loading}
                            />
                        </View>

                        {/* Billing State */}
                        <View className="mb-5">
                            <Text className="text-gray-800 font-semibold mb-2">Billing State</Text>
                            <TextInput
                                value={formData.billingState}
                                onChangeText={(text) => handleInputChange('billingState', text)}
                                placeholder="Enter state"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="default"
                                className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
                                editable={!loading}
                            />
                        </View>

                        {/* Billing Post Code */}
                        <View className="mb-5">
                            <Text className="text-gray-800 font-semibold mb-2">Billing Post Code</Text>
                            <TextInput
                                value={formData.billingPostCode}
                                onChangeText={(text) => handleInputChange('billingPostCode', text)}
                                placeholder="Enter post code"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="numeric"
                                className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
                                editable={!loading}
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
                                {loading ? 'Processing...' : 'Save'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
                <Modal visible={status === "approved"} transparent animationType="fade">
                    <View className="flex-1 justify-end bg-black/30">
                        <View className="bg-white px-12 lg:px-24 pt-12 lg:pt-24 rounded-t-3xl items-center">
                            <ApprovedAnimation />
                            <Text
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
                                        router.push("/book");
                                    }}
                                >
                                    <Text
                                        className="text-[18px] text-white text-center font-[Kanit-Medium]"
                                    >
                                        {t("payment.ok")}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default AddNewCard;