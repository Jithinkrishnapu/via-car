import { useEffect, useState } from "react";
import { View, TouchableOpacity } from "react-native";
import { Link, router } from "expo-router";
import { ChevronLeft, ChevronRight, Verified } from "lucide-react-native";
import Text from "@/components/common/text";
import MapComponent from "@/components/ui/map-view";
import AlertDialog from "@/components/ui/alert-dialog";

import { useLoadFonts } from "@/hooks/use-load-fonts";
import { useDirection } from "@/hooks/useDirection";
import { useBookingApproval } from "@/service/ride-booking";
import Chat from "../../../public/chat.svg";
import Avatar from "@/components/ui/avatar";
import { useRoute } from "@react-navigation/native";

function BookingApproval() {
  // -------------------- Hooks --------------------
  const loaded = useLoadFonts();
  const { swap } = useDirection();
  const route = useRoute<any>();
  
  // -------------------- State --------------------
  const [loading, setLoading] = useState(false);
  const [rideDetail, setRideDetail] = useState<any>(null);
  const [dialog, setDialog] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info' as 'info' | 'warning' | 'error' | 'success',
    onConfirm: () => {}
  });

  // -------------------- Effects --------------------
  useEffect(() => {
    try {
      const itemParam = route?.params?.item;
      if (!itemParam) {
        showDialog(
          'Error',
          'No booking data found. Please try again.',
          'error',
          () => {
            closeDialog();
            router.replace('/(booking)/booking-request');
          }
        );
        return;
      }
      
      const parsedDetail = JSON.parse(itemParam);
      if (!parsedDetail || !parsedDetail.id) {
        showDialog(
          'Error',
          'Invalid booking data. Please try again.',
          'error',
          () => {
            closeDialog();
            router.replace('/(booking)/booking-request');
          }
        );
        return;
      }
      
      setRideDetail(parsedDetail);
      console.log("rideDetail==================", parsedDetail);
    } catch (error) {
      console.error('Error parsing ride detail:', error);
      showDialog(
        'Error',
        'Failed to load booking details. Please try again.',
        'error',
        () => {
          closeDialog();
          router.replace('/(booking)/booking-request');
        }
      );
    }
  }, [route?.params?.item]);

  const fmtUTC = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    return `${String(d.getUTCHours()).padStart(2, '0')}:${String(
      d.getUTCMinutes()
    ).padStart(2, '0')}`;
  };

  // -------------------- Dialog Helpers --------------------
  const showDialog = (
    title: string, 
    message: string, 
    type: 'info' | 'warning' | 'error' | 'success' = 'info',
    onConfirm?: () => void
  ) => {
    setDialog({
      visible: true,
      title,
      message,
      type,
      onConfirm: onConfirm || (() => setDialog(prev => ({ ...prev, visible: false })))
    });
  };

  const closeDialog = () => {
    setDialog(prev => ({ ...prev, visible: false }));
  };

  const handleApprove = async (booking_id: number, type: number) => {
    if (loading) return; // Prevent multiple requests
    
    const actionText = type === 1 ? 'approve' : 'decline';
    const actionPastTense = type === 1 ? 'approved' : 'declined';
    
    setLoading(true);
    
    const req = {
      "booking_id": booking_id,
      "type": type
    };
    
    try {
      const res = await useBookingApproval(req);
      
      if (res?.success || res?.data) {
        console.log(res, 'res===========================', req);
        showDialog(
          'Success',
          `Booking has been ${actionPastTense} successfully.`,
          'success',
          () => {
            closeDialog();
            router.replace('/(booking)/booking-request');
          }
        );
      } else {
        // Handle API response that indicates failure
        const errorMessage = res?.message || res?.error || `Failed to ${actionText} booking. Please try again.`;
        showDialog(
          'Error',
          errorMessage,
          'error'
        );
      }
    } catch (error: any) {
      console.error(`Error ${actionText}ing booking:`, error);
      
      // Handle different types of errors
      let errorMessage = `Failed to ${actionText} booking. Please try again.`;
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      // Handle network errors specifically
      if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      }
      
      // Handle timeout errors
      if (error?.code === 'TIMEOUT' || error?.message?.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.';
      }
      
      showDialog(
        'Error',
        errorMessage,
        'error'
      );
    } finally {
      setLoading(false);
    }
  }


  // -------------------- Render --------------------
  if (!loaded) return null;

  // Show loading or error state if ride detail is not available
  if (!rideDetail) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-[16px] font-[Kanit-Regular] text-gray-600">
          Loading booking details...
        </Text>
        
        {/* Custom Alert Dialog */}
        <AlertDialog
          visible={dialog.visible}
          onClose={closeDialog}
          title={dialog.title}
          message={dialog.message}
          type={dialog.type}
          onConfirm={dialog.onConfirm}
          confirmText="OK"
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* -------------------- Map Section -------------------- */}
      <View className="flex-1 relative">
        {/* Back Button */}
        <TouchableOpacity
          className={swap(
            "absolute top-12 left-6 z-10 bg-white rounded-full size-[46px] border border-[#EBEBEB] items-center justify-center shadow-sm",
            "absolute top-12 right-6 z-10 bg-white rounded-full size-[46px] border border-[#EBEBEB] items-center justify-center shadow-sm"
          )}
          onPress={() => router.replace("..")}
          activeOpacity={0.8}
        >
          {swap(<ChevronLeft size={20} color="#3C3F4E" />, <ChevronRight size={20} color="#3C3F4E" />)}
        </TouchableOpacity>

        {/* Map Component */}
        <View className="flex-1">
          <MapComponent />
        </View>
      </View>

      {/* -------------------- Route Selection -------------------- */}
      <View className="bg-white rounded-t-3xl h-[50%] px-6 z-10">
        
        {/* Route Information */}
        <View className="mt-6 mb-6">
          <View className="flex-row items-start">
            {/* Vertical line + dots */}
            <View className="items-center mr-4">
              <View className="w-3 h-3 rounded-full bg-green-500" />
              <View className="w-0.5 h-14 bg-gray-300 my-2" />
              <View className="w-3 h-3 rounded-full bg-red-500" />
            </View>

            {/* Route details */}
            <View className="flex-1 justify-between">
              <View className="mb-6">
                <Text className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Pick up</Text>
                <Text className="text-sm text-gray-800 font-semibold leading-5">
                  {rideDetail?.pickupAddress}
                </Text>
              </View>

              <View>
                <Text className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Drop off</Text>
                <Text className="text-sm text-gray-800 font-semibold leading-5">
                  {rideDetail?.dropAddress}
                </Text>
              </View>
            </View>

            {/* Time information */}
            <View className="items-end">
              <View className="mb-6">
                <Text className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Pickup</Text>
                <Text className="text-sm text-gray-800 font-semibold">
                  {fmtUTC(rideDetail?.pickupTime)}
                </Text>
              </View>

              <View>
                <Text className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Drop</Text>
                <Text className="text-sm text-gray-800 font-semibold">
                  {fmtUTC(rideDetail?.dropTime)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* User Profile Section */}
        <View className="py-5 border-t border-gray-100">
          <View className="flex-row items-center justify-between">
            <Link href={`/(tabs)/user-profile`} className="flex-row items-center flex-1">
              <Avatar
                source={rideDetail?.user?.profile_image ? { uri: rideDetail.user.profile_image } : require(`../../../public/profile-image.jpg.webp`)}
                size={44}
                initials={rideDetail?.user?.name?.substring(0, 2)?.toUpperCase() || "U"}
              />
              <View className="ml-4">
                <View className="flex-row items-center gap-2">
                  <Text
                    fontSize={16}
                    className="text-[16px] text-black font-[Kanit-Medium]"
                  >
                    {rideDetail?.user?.name}
                  </Text>
                  <Verified width={16} height={16} />
                </View>
                <Text className="text-xs text-gray-500 mt-1">Passenger</Text>
              </View>
            </Link>
            
            <TouchableOpacity
              className="rounded-full size-[42px] border border-[#EBEBEB] items-center justify-center bg-gray-50"
              activeOpacity={0.8}
              onPress={() => {
                try {
                  if (!rideDetail?.user?.id) {
                    showDialog(
                      'Error',
                      'Unable to start chat. User information is not available.',
                      'error'
                    );
                    return;
                  }
                  
                  router.push({
                    pathname:"/(inbox)/chat",
                    params:{
                      driver_id: rideDetail?.user?.id?.toString(),
                      driver_name: rideDetail?.user?.name || 'User',
                      driver_profile_image: rideDetail?.user?.profile_image
                    }
                  });
                } catch (error) {
                  console.error('Error navigating to chat:', error);
                  showDialog(
                    'Error',
                    'Failed to open chat. Please try again.',
                    'error'
                  );
                }
              }}
            >
              <Chat width={16} height={16} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Booking Summary */}
        <View className="flex-row items-center justify-between py-5 border-t border-gray-100">
          <View>
            <Text className="text-gray-500 text-sm mb-1">Booking for</Text>
            <Text className="text-black text-[16px] font-[Kanit-Medium]">
              {rideDetail?.passengers?.length} {rideDetail?.passengers?.length === 1 ? 'Seat' : 'Seats'}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-gray-500 text-sm mb-1">Total Amount</Text>
            <Text className="text-black text-[18px] font-[Kanit-Bold] text-green-600">
              SR {rideDetail?.totalAmount}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-1 justify-end pb-6">
          <View className="flex-row w-full gap-3">
            <TouchableOpacity
              className={`bg-white flex-1 border border-[#FF4848] rounded-full h-[55px] items-center justify-center ${loading ? 'opacity-50' : ''}`}
              onPress={() => handleApprove(rideDetail?.id, 2)}
              activeOpacity={0.8}
              disabled={loading}
            >
              <Text
                fontSize={20}
                className="text-xl text-[#FF4848] font-[Kanit-Regular]"
              >
                {loading ? "Processing..." : "Decline"}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className={`bg-[#FF4848] flex-1 rounded-full h-[55px] items-center justify-center ${loading ? 'opacity-50' : ''}`}
              onPress={() => handleApprove(rideDetail?.id, 1)}
              activeOpacity={0.8}
              disabled={loading}
            >
              <Text
                fontSize={20}
                className="text-xl text-white font-[Kanit-Regular]"
              >
                {loading ? "Processing..." : "Approve"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Custom Alert Dialog */}
      <AlertDialog
        visible={dialog.visible}
        onClose={closeDialog}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
        onConfirm={dialog.onConfirm}
        confirmText="OK"
      />
    </View>
  );
}

export default BookingApproval;
