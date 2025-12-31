import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Alert, Image, ImageBackground } from 'react-native';
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
import { useRouter } from 'expo-router';
import { handleLogOut, useGetProfileDetails } from '@/service/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Avatar from '@/components/ui/avatar';

export default function DrawerComponent() {
    const router = useRouter();
    const [userDetails, setUserDetails] = useState<any>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    useEffect(() => {
        loadUserDetails();
        checkAuthStatus();
    }, []);

    const loadUserDetails = async () => {
        try {
            const response = await useGetProfileDetails();
            if (response?.data) {
                setUserDetails(response.data);
            }
        } catch (error) {
            console.log("Error loading user details:", error);
        }
    };

    const checkAuthStatus = async () => {
        try {
            const raw = await AsyncStorage.getItem("userDetails");
            const token = raw ? JSON.parse(raw).token : "";
            setIsLoggedIn(!!token);
        } catch (error) {
            console.log("Auth status check error:", error);
            setIsLoggedIn(false);
        }
    };

    const menu = [
        { label: 'Your rides', icon: Car, route: '/(tabs)/your-rides', hasNotification: false },
        { label: 'Booking request', icon: FileText, route: '/(booking)/booking-request', hasNotification: true },
        { label: 'Notification', icon: Bell, route: '/notifications', hasNotification: false },
        { label: 'Profile', icon: User, route: '/(tabs)/user-profile', hasNotification: false },
        { label: 'Transaction', icon: ArrowLeftRight, route: '/(profile)/transactions', hasNotification: false },
        // { label: 'Payment & Refund', icon: CreditCard, route: '/payment', hasNotification: false },
        { label: 'Bank Account', icon: Building2, route: '/(profile)/bank', hasNotification: false },
    ];

    const handleMenuPress = async (route: string) => {
        try {
            const raw = await AsyncStorage.getItem("userDetails");
            const token = raw ? JSON.parse(raw).token : "";
            
            if (token) {
                router.push(route as any);
            } else {
                router.replace("/login");
            }
        } catch (error) {
            console.log("Auth check error:", error);
            router.replace("/login");
        }
    };

    const handleLogout = () => {
        handleLogOut().then(() => {
          AsyncStorage.removeItem("userDetails");
          router.replace("/login");
        }).catch((err) => {
          console.log("error===========", err)
          Alert.alert("Something went wrong")
        })
      };

    return (
        <View className="flex-1 bg-white">
            {/* Header with user info */}
            <ImageBackground 
                source={require("../../public/hero.png")}
                className="px-4 py-6 pt-12"
                resizeMode="cover"
            >
                <View className="flex-row items-center">
                    <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center mr-3">
                        {/* {userDetails?.profile_image ? (
                            <Image 
                                source={{ uri: userDetails.profile_image }} 
                                className="w-12 h-12 rounded-full"
                            />
                        ) : (
                            <User size={24} color="white" />
                        )} */}
                         <Avatar
                      source={userDetails?.profile_image !== null ? { uri: userDetails?.profile_image } : require(`../../public/profile-image.jpg.webp`)}
                      size={40}
                      initials="CN"
                    />
                    </View>
                    <View className="flex-1">
                        <Text className="text-white text-lg font-semibold">
                            {userDetails?.first_name ? `${userDetails.first_name} ${userDetails.last_name || ''}`.trim() : 'Guest User'}
                        </Text>
                    </View>
                </View>
            </ImageBackground>

            {/* Menu items */}
            <ScrollView className="flex-1 bg-gray-50" bounces={false}>
                <View className="px-4 py-4 gap-1">
                    {menu.map((item) => (
                        <TouchableOpacity
                            key={item.label}
                            onPress={() => handleMenuPress(item?.route)}
                            className="flex-row items-center justify-between bg-white py-4 px-4 border-b border-gray-100"
                        >
                            <View className="flex-row items-center flex-1">
                                <item.icon size={20} color="#6B7280" />
                                <Text className="ml-4 text-base text-gray-800 flex-1">{item.label}</Text>
                                {item.hasNotification && (
                                    <View className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                                )}
                            </View>
                            <ChevronRight size={16} color="#9CA3AF" />
                        </TouchableOpacity>
                    ))}

                    {/* Log out - only show if user is logged in */}
                    {isLoggedIn && (
                        <TouchableOpacity
                            onPress={() => handleLogout()}
                            className="flex-row items-center justify-between bg-white py-4 px-4 mt-2"
                        >
                            <View className="flex-row items-center flex-1">
                                <LogOut size={20} color="#6B7280" />
                                <Text className="ml-4 text-base text-gray-800">Log out</Text>
                            </View>
                            <ChevronRight size={16} color="#9CA3AF" />
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}