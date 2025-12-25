import React from 'react';
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, ImageBackground, Alert } from 'react-native';
import {
    Car,
    FileText,
    Bell,
    User,
    ArrowLeftRight,
    CreditCard,
    Building2,
    LogOut,
    ChevronRight,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';   // swap with your navigator if different
import { handleLogOut } from '@/service/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function DrawerComponent() {
    const router = useRouter();

    const menu = [
        { label: 'Your rides', icon: Car, route: '/(tabs)/your-rides' },
        { label: 'Booking request', icon: FileText, route: '/(booking)/booking-request' },
        { label: 'Notification', icon: Bell, route: '/(tabs)/inbox' },
        { label: 'Profile', icon: User, route: '/(tabs)/user-profile' },
        { label: 'Transaction', icon: ArrowLeftRight, route: '/(profile)/transactions' },
        // { label: 'Payment & Refund', icon: CreditCard, route: '/payment' },
        { label: 'Bank Account', icon: Building2, route: '/(profile)/bank' },
    ];

    const handleMenuPress = async (route: string) => {
        try {
            const raw = await AsyncStorage.getItem("userDetails");
            const token = raw ? JSON.parse(raw).token : "";
            
            if (token) {
                router.push(route);
            } else {
                router.replace("/login");
            }
        } catch (error) {
            console.log("Auth check error:", error);
            router.replace("/login");
        }
    };

    const handleLogout = () => {
        handleLogOut().then((res) => {
          AsyncStorage.removeItem("userDetails");
          router.replace("/login");
        }).catch((err) => {
          console.log("error===========", err)
          Alert.alert("Something went wrong")
        })
    
      };

    return (
        <ScrollView bounces={false} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Header */}
            {/* Menu rows */}
            <View className="px-4 gap-3">
                {menu.map((item) => (
                    <TouchableOpacity
                    key={item.label}
                    onPress={() => handleMenuPress(item?.route)}
                    className="flex-row items-center justify-between rounded-lg py-4 px-2 border bg-gray-100  border-gray-200"
                    >
                        <View className="flex-row items-center">
                            <item.icon size={22} color="#374151" />
                            <Text className="ml-3 text-base text-gray-800">{item.label}</Text>
                        </View>
                        <ChevronRight size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                ))}

                {/* Log out */}
                <TouchableOpacity
                    onPress={() => handleLogout()}
                    className="flex-row items-center justify-between py-4 mt-6"
                    >
                    <View className="flex-row items-center">
                        <LogOut size={22} color="#EF4444" />
                        <Text className="ml-3 text-base text-red-600 font-medium">Log out</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}