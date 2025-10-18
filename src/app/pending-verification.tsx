// PendingVerification.tsx
import { getUserStatus } from '@/service/auth';
import { useStore } from '@/store/useStore';
import { UserStatusResp } from '@/types/ride-types';
import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Image, Text, View, StyleSheet, Pressable } from 'react-native';

const PendingVerification = () => {
  const { setIsPublish,setPath } = useStore()

  async function enforceProfileCompleteness() {
    try {
      const json: UserStatusResp = await getUserStatus();
      const d = json.data;
      const stored = await useAsyncStorage("userDetails").getItem()
      const userDetails = stored ? JSON.parse(stored) : null
      if (userDetails?.type === "login") {
        if (d.id_verification.completed) {/* 3. No vehicles (for driver flow) */
        if (d.account.is_driver && !d.vehicles.has_vehicles) {
          setPath("/(tabs)/pickup")
          router.replace('/add-vehicles');
          return;
        }else{
          router.replace("/(tabs)/book")
        }
        }
      }

    } catch (e) {
      console.log('Status check failed', e);      /* optionally send to login */
    }
  }

  useEffect(() => {
    /* first call immediately */
    enforceProfileCompleteness();
  
    /* poll every 5 s */
    const id = setInterval(enforceProfileCompleteness, 5_000);
  
    /* stop polling when the screen is left */
    return () => clearInterval(id);
  }, []);


  return (
    <View style={styles.container}>
      {/* Hour-glass animation */}
      <Image
        style={styles.image}
        source={require('../../public/car_gi.gif')}
        resizeMode="contain"
      />

      {/* Heading */}
      <Text className='text-2xl font-[Kanit-SemiBold] text-center text-[#FF4848] mb-6'>Your profile and documents have been submitted successfully</Text>

      {/* Body copy */}
      <Text className='text-base font-[Kanit-Regular] text-center text-[#6B7280]'>
        Our team is currently reviewing your information to ensure it meets our
        community and safety standards. This process helps us maintain a trusted
        environment for all riders and drivers.
      </Text>

      <Pressable onPress={() => router.replace('/(tabs)/book')} className='flex-row items-center gap-2'>
        <Text>Back to Home</Text>
        <ChevronRight size={20} strokeWidth={1} />
      </Pressable>
    </View>
  );
};

export default PendingVerification;

/* ---------- styles ---------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: "100%",
    height: "30%",
    marginBottom: 32,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  body: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});