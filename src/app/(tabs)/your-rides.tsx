/* RidesTabsScreen.tsx */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  useWindowDimensions,
  FlatList,
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  TextInput,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ChevronDown, ChevronRight, ChevronLeft } from 'lucide-react-native';

import { useLoadFonts } from '@/hooks/use-load-fonts';
import { useDirection } from '@/hooks/useDirection';
import { useGetAllBooking, useGetAlRides, useUpdateBookingStatus, useUpdateRideStatus, useVerifyBooking } from '@/service/ride-booking';

import RideStatusItem from '@/components/common/ride-status-item';
import Text from '@/components/common/text';
import { cn } from '@/lib/utils';
import { RideCard } from '@/components/RideCard';
import { Input } from '@/components/ui/input';

/* ------------------------------------------------------------------ */
/* TYPES / CONSTANTS                                                  */
/* ------------------------------------------------------------------ */
const TABS = ['Pending',"In Progress",'Cancelled', 'Completed'] as const;
const SIDES = ['Driver', 'User'] as const;
type Tab = (typeof TABS)[number];
type Side = (typeof SIDES)[number];

/* ------------------------------------------------------------------ */
/* HELPERS                                                            */
/* ------------------------------------------------------------------ */
const DashedLine = () => (
  <View className="flex-row justify-center py-2">
    {Array.from({ length: 30 }).map((_, i) => (
      <View
        key={i}
        className="w-1.5 h-0.5 bg-gray-400 mx-0.5 rounded-full"
      />
    ))}
  </View>
);

/* ------------------------------------------------------------------ */
/* COMPONENT                                                          */
/* ------------------------------------------------------------------ */
export default function RidesTabsScreen() {
  const { t } = useTranslation('components');
  const { width } = useWindowDimensions();
  const loaded = useLoadFonts();
  const { isRTL, swap } = useDirection();

  /* --------------------- STATE  --------------------- */
  const [activeTab, setActiveTab] = useState<Tab>('Pending');
  const [side, setSide] = useState<Side>('User');
  const [ride_id, setRideId] = useState<number>();
  const [pin, setPin] = useState<string>();
  const [modalVisible, setModalVisible] = useState(true);
  const [sideModalVisible, setSideModalVisible] = useState(false);
  const [showModalVisible, setShowModalVisible] = useState(false);
  const [bookingList, setBookingList] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const handleCancelRide = async (item: any) => {
    const req = {
      ride_id: item?.id,
      status: 5
    }
    const response = await useUpdateRideStatus(req)
    if (response) {
      Alert.alert(t('yourRides.rideCancelled'))
    }
  }
  const handleCancelBooking = async (item: any) => {
    const req = {
      booking_id: item?.id,
      status: 5
    }
    const response = await useUpdateBookingStatus(req)
    if (response) {
      Alert.alert(t('yourRides.bookingCancelled'))
    }
  }

  const handleStartBooking = async (item: any) => {
    const req = {
      ride_id: item?.id,
      status: 3
    }
    const response = await useUpdateRideStatus(req)
    if (response) {
      Alert.alert(t('yourRides.rideStarted'))
    }
  }

  const handleEndBooking = async (item: any) => {
    const req = {
      ride_id: item?.id,
      status: 4
    }
    const response = await useUpdateRideStatus(req)
    if (response) {
      Alert.alert(t('yourRides.bookingCompleted'))
    }
  }

  const handleVerifyBooking = async (ride_id: number, pin: string) => {
    const req = {
      "ride_id": ride_id,
      "pin": pin
    }
    const response = await useVerifyBooking(req)
    if (response) {
      Alert.alert(t('yourRides.bookingVerified'))
    }
  }

  /* ------------------- ANIMATION -------------------- */
  const tabWidth = (width - 48 + 6) / TABS.length;
  const indicatorX = useSharedValue(0);

  useEffect(() => {
    const idx = TABS.indexOf(activeTab);
    const targetX = isRTL 
      ? (TABS.length - 1 - idx) * tabWidth  // Reverse for RTL
      : idx * tabWidth;
    indicatorX.value = withSpring(targetX, { damping: 20, stiffness: 90 });
  }, [activeTab, tabWidth, isRTL]);

  const animatedIndicatorStyle = useAnimatedStyle(
    () => ({
      transform: [{ translateX: indicatorX.value }],
      width: tabWidth,
    }),
    []
  );

  /* ------------------- DATA LOADING  ---------------- */
  const fetchList = useCallback(async (showSpinner = false) => {
    showSpinner && setRefreshing(true);
    try {
      const res =
        side === 'User'
          ? await useGetAllBooking(
            'booked',
            activeTab.toLowerCase() == "in progress" ? "ongoing" : activeTab.toLowerCase() as 'pending' | 'completed' | 'cancelled' | 'ongoing'
          )
          : await useGetAlRides(activeTab?.toLowerCase() as 'pending' | 'completed' | 'cancelled');
      console.log("side============", side, "===================", activeTab, "==============", res?.data)
      setBookingList(res?.data?.length ? res.data : []);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to load data');
      setBookingList([]);
    } finally {
      setRefreshing(false);
    }
  }, [activeTab, side]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  /* ------------------- RENDER ITEMS  ---------------- */
  const renderUserItem = ({ item, index }: any) => (
    <RideStatusItem onCancel={() => handleCancelBooking(item)} data={item} status={activeTab} key={`${activeTab}-${index}`} />
  );

  const renderDriverItem = ({ item, index }: any) => (
    item?.pickup_time ? <RideCard
      activeTab={activeTab}
      status={item?.status}
      onRideCancel={() => handleCancelRide(item)}
      passengers={item?.passengers || ""}
      driverName={`${item?.driver?.first_name}` || ""}
      rating={4.5}
      date={item?.date?.split('T')[0] || ""}
      startTime={item?.pickup_time || ""}
      from={item?.pickup_address || ""}
      price={
        item?.rideAmounts?.length ? `SR ${item.rideAmounts[0]?.amount}` : ''
      }
      duration="4h 40m"
      endTime={item?.drop_time || ""}
      to={item?.drop_address || ""}
      passengerStatus="confirmed"
      onStartRide={() => handleStartBooking(item)}
      onEndRide={() => handleEndBooking(item)}
      onAddPassengers={() => {
        setRideId(item?.id)
        setShowModalVisible(true)
      }}
      key={`${activeTab}-${index}`}
    /> : <></>
  );

  const keyExtractor = (_: any, i: number) => String(i);

  /* ------------------- EARLY EXIT  ------------------ */
  if (!loaded) return null;

  /* ------------------- RENDER  ---------------------- */
  return (
    <View className="flex-1 bg-[rgb(245,245,245)]">
      {/* ---------------- HEADER -------------- */}
      <View className={cn("px-6 flex-row justify-between pt-16 mb-[25px]", isRTL && "flex-row-reverse")}>
        <Text fontSize={22} className="text-black font-[Kanit-Medium]">
          {t('yourRides.title')}
        </Text>

        <Pressable
          onPress={() => setSideModalVisible(true)}
          className={cn("border rounded-2xl flex-row px-2 py-1 mb-2 items-center", isRTL && "flex-row-reverse")}
        >
          <Text className="text-[14px] text-black font-[Kanit-Light]">
            {t(`yourRides.${side.toLowerCase()}Side`)}
          </Text>
          <ChevronDown size={14} />
        </Pressable>
      </View>

      {/* --------------- TABS ----------------- */}
      <View className="px-6">
        <View className={cn("flex-row h-[40px] bg-white border border-[#EBEBEB] rounded-full overflow-hidden", isRTL && "flex-row-reverse")}>
          <Animated.View
            style={animatedIndicatorStyle}
            className="rounded-full bg-[#FF4848] h-[38px] absolute z-0"
          />

          {(isRTL ? [...TABS].reverse() : TABS).map((tab) => {
            const isActive = tab === activeTab;
            return (
              <TouchableOpacity
                key={tab}
                activeOpacity={0.8}
                onPress={() => setActiveTab(tab)}
                className={cn(
                  'flex-1 items-center justify-center rounded-full',
                  !isActive && 'z-10',
                  activeTab === 'Pending' &&
                  tab === 'Cancelled' &&
                  'border-r border-[#EBEBEB]',
                  activeTab === 'Completed' &&
                  tab === 'Cancelled' &&
                  'border-l border-[#EBEBEB]'
                )}
              >
                <Text
                  fontSize={15}
                  className={cn(
                    'text-[15px] font-[Kanit-Regular] z-10',
                    isActive ? 'text-white' : 'text-[#666666]'
                  )}
                >
                  {t(`yourRides.tabs.${tab}`)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* --------------- LIST --------------- */}
        <FlatList
          contentContainerClassName="gap-4 py-5"
          className=''
          data={bookingList}
          keyExtractor={keyExtractor}
          renderItem={side === 'User' ? renderUserItem : renderDriverItem}
          ListEmptyComponent={
            <View className="justify-center items-center pt-10">
              <Text>{t('yourRides.noBookingsFound')}</Text>
            </View>
          }
          ListFooterComponent={() => <View className='w-full h-[100px] my-5' ></View>}
          scrollEnabled={true}
          contentInsetAdjustmentBehavior="automatic"
          automaticallyAdjustsScrollIndicatorInsets={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={() => fetchList(true)}
              tintColor={Platform.OS === 'ios' ? '#FF4848' : undefined}
              title={Platform.OS === 'ios' ? t('yourRides.pullToRefresh') : undefined}
              titleColor={Platform.OS === 'ios' ? '#666' : undefined}
            />
          }
        />
      </View>

      {/* -------------- MODALS ---------------- */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View className="flex-1 justify-end bg-black/30">
          <View className="bg-white px-12 pt-12 rounded-t-3xl items-center">
            <Text className="text-[25px] font-[Kanit-Regular] text-black text-center mt-4">
              {t('yourRides.chooseDashboard')}
            </Text>

            <View className="flex-row items-center gap-4 justify-center">
              <TouchableOpacity
                className="bg-[#FF4848] rounded-full w-[141px] h-[45px] mt-6 mb-12 items-center justify-center"
                activeOpacity={0.8}
                onPress={() => {
                  setSide('User');
                  setModalVisible(false);
                }}
              >
                <Text className="text-[18px] text-white text-center font-[Kanit-Medium]">
                  {t('yourRides.userSide')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="border-[#FF4848] border bg-white rounded-full w-[141px] h-[45px] mt-6 mb-12 items-center justify-center"
                activeOpacity={0.8}
                onPress={() => {
                  setSide('Driver');
                  setModalVisible(false);
                }}
              >
                <Text className="text-[18px] text-[#FF4848] text-center font-[Kanit-Medium]">
                  {t('yourRides.driverSide')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={sideModalVisible} transparent animationType="fade">
        <Pressable
          className="flex-1 bg-black/30"
          onPress={() => setSideModalVisible(false)}
        >
          <View className={cn("flex-1 justify-start", isRTL ? "items-start" : "items-end")}>
            <View className={cn("bg-white px-4 pt-4 w-1/3 top-10 rounded", isRTL && "mr-6")}>
              <FlatList
                contentContainerClassName="gap-2"
                data={SIDES}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => {
                      setSide(item);
                      setSideModalVisible(false);
                    }}
                    className={cn("flex-row p-3 justify-between items-center", isRTL && "flex-row-reverse")}
                  >
                    <Text>{t(`yourRides.${item.toLowerCase()}Side`)}</Text>
                    {swap(<ChevronRight size={14} />, <ChevronLeft size={14} />)}
                  </Pressable>
                )}
                ItemSeparatorComponent={() => <DashedLine />}
              />
            </View>
          </View>
        </Pressable>
      </Modal>
      <Modal visible={showModalVisible} transparent animationType="fade">
        <Pressable
          className="flex-1 bg-black/30"
          onPress={() => setShowModalVisible(false)}
        >
          <View className="flex-1 justify-end bg-black/30">
            <View className="bg-white px-12 rounded-t-3xl items-center">
              <Text className="text-[25px] font-[Kanit-Regular] text-black text-center my-4">
                {t('yourRides.verifyPassenger')}
              </Text>

              <TextInput 
                onChangeText={(text) => setPin(text)} 
                value={pin} 
                placeholder={t('yourRides.enterPin')} 
                placeholderClassName='font-[Kanin-Light]' 
                className='w-full font-[Kanin-Bold] text-[18px] text-black h-[50px] pl-5 bg-slate-200 rounded-full'
                style={{ textAlign: isRTL ? 'right' : 'left', paddingRight: isRTL ? 20 : 5 }}
              />

              <View className="flex-row items-center gap-4 justify-center">
                <TouchableOpacity
                  className="bg-[#FF4848] rounded-full w-full h-[50px] mt-6 mb-12 items-center justify-center"
                  activeOpacity={0.8}
                  onPress={() => {
                    handleVerifyBooking(ride_id!, pin!)
                  }}
                >
                  <Text className="text-[18px] text-white text-center font-[Kanit-Medium]">
                    {t('yourRides.verify')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}