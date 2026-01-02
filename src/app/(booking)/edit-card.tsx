import { getCards, saveCards, SavedCardMeta } from '@/store/card-store';
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
    FlatList,
    Keyboard,
} from 'react-native';
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

const returnIcon = (cardType: CardType) => {
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
    card_index: string;
}

interface ErrorState {
    visible: boolean;
    title: string;
    message: string;
    type: "info" | "warning" | "error" | "success";
}

const EditCard: React.FC = () => {
    const { t } = useTranslation("components");
    const [selectedCard, setSelectedCard] = useState<CardType>('visa');
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

    // Load existing card data
    useEffect(() => {
        const loadCardData = async () => {
            try {
                const cards = await getCards();
                const cardIndex = parseInt(routeParams.card_index);
                
                if (cards && cards[cardIndex]) {
                    const card = cards[cardIndex];
                    const expMonth = card.expMonth.toString().padStart(2, '0');
                    const expYear = card.expYear.toString().slice(-2);
                    
                    setFormData({
                        cardType: card.brand.toLowerCase() as CardType,
                        cardHolderName: card.cardHolderName,
                        cardNumber: card.cardNumber,
                        expiryDate: `${expMonth}/${expYear}`,
                        cvv: '', // Don't pre-fill CVV for security
                        email: card.email,
                        billingStreet: card.billingStreet,
                        billingCity: card.billingCity,
                        billingState: card.billingState,
                        billingPostCode: card.billingPostCode,
                        billingCountry: card.billingCountry,
                    });
                    setSelectedCard(card.brand.toLowerCase() as CardType);
                }
            } catch (error) {
                console.error('Error loading card data:', error);
                showError('Error', 'Failed to load card data');
            }
        };

        loadCardData();

        // Keyboard event listeners
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

        return () => {
            keyboardDidShowListener?.remove();
            keyboardDidHideListener?.remove();
        };
    }, [routeParams.card_index]);

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

        if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
            showError(t("payment.validationError"), t("payment.enterValidEmail"));
            setLoading(false);
            return;
        }

        try {
            const cards = await getCards();
            const cardIndex = parseInt(routeParams.card_index);
            
            if (!cards || !cards[cardIndex]) {
                showError('Error', 'Card not found');
                setLoading(false);
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

            const updatedCard: SavedCardMeta = {
                ...cards[cardIndex], // Keep existing properties like addedAt
                alias,
                last4,
                brand,
                expMonth,
                expYear,
                holder: formData.cardHolderName.trim(),
                cardHolderName: formData.cardHolderName.trim(),
                billingStreet: formData.billingStreet.trim(),
                billingCity: formData.billingCity.trim(),
                billingState: formData.billingState.trim(),
                billingPostCode: formData.billingPostCode.trim(),
                billingCountry: formData.billingCountry.trim(),
                email: formData.email.trim(),
                cardNumber: cleanedCardNumber,
            };

            // Update the card in the array
            const updatedCards = [...cards];
            updatedCards[cardIndex] = updatedCard;
            
            await saveCards(updatedCards);
            
            showSuccess(
                t("payment.cardUpdated") || "Card Updated",
                t("payment.cardUpdatedMessage") || "Your card details have been updated successfully."
            );
        } catch (err: any) {
            console.error('Failed to update card:', err);
            const errorMessage = err?.message || t("payment.failedToUpdateCard") || "Failed to update card details";
            showError(t("payment.error") || "Error", errorMessage);
        } finally {
            setLoading(false);
        }
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
                                onPress={() => router.back()}
                            >
                                <ChevronLeft color="#3C3F4E" />
                            </TouchableOpacity>
                            <Text className="text-xl font-bold text-gray-900 ml-3">
                                {t("payment.editCardTitle") || "Edit Card"}
                            </Text>
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

                        {/* Update Button */}
                        <TouchableOpacity
                            onPress={handleSave}
                            disabled={loading}
                            className={`rounded-full py-4 mt-6 mb-8 ${loading ? 'bg-gray-400' : 'bg-red-500'
                                }`}
                            activeOpacity={0.8}
                        >
                            <Text className="text-white text-center font-bold text-lg">
                                {loading ? t("payment.updating") || "Updating..." : t("payment.updateCard") || "Update Card"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
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
                    router.back();
                }}
                title={successDialog.title}
                message={successDialog.message}
                type="success"
                confirmText={t("common.ok") || "OK"}
                onConfirm={() => {
                    closeSuccessDialog();
                    router.back();
                }}
            />
        </SafeAreaView>
    );
};

export default EditCard;