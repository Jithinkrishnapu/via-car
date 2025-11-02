// RideStatusItem.tsx
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { Ban, Download, Hourglass, Star, MapPin } from 'lucide-react-native';
import Text from './text';
import Avatar from '../ui/avatar';
import TickGreen from '../../../public/tick-green.svg';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

interface Props {
  status: 'Pending' | 'Cancelled' | 'Completed' | 'In Progress';
  data: any;
  onCancel?:()=>void
}

export default function RideStatusItem({ status = 'Pending', data,onCancel}: Props) {
  const { t } = useTranslation('components');

  const fmtUTC = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    return `${String(d.getUTCHours()).padStart(2, '0')}:${String(
      d.getUTCMinutes()
    ).padStart(2, '0')}`;
  };

  const departure = fmtUTC(data?.pickupTime);
  const arrival   = fmtUTC(data?.dropTime);

  console.log(data)

  return (
    <TouchableOpacity
      className="mx-2 mb-3 rounded-2xl bg-white shadow-sm"
      activeOpacity={0.8}
      onPress={() =>
        router.push({
          pathname: '/(your-rides)/ride-details',
          params:   { rideId: data?.rideId, ride_amount_id: data?.rideAmount?.id },
        })
      }
    >
      {/* ---------- top row ---------- */}
      <View className="flex-row items-start justify-between p-4">
        {/* left side */}
        <View className="flex-1">
          <View className='flex-row justify-between' >
            {/* driver */}
          <View className="flex-row items-center">
            <Avatar
              source={require('../../../public/profile-img.png')}
              size={32}
              initials="CN"
              className="bg-blue-500"
              textClassName="text-white"
            />
            <Text fontSize={14} className="ml-2 font-[Kanit-Regular]">
              {data?.driver?.name}
            </Text>
            <Star size={14} color="#FF9C00" fill="#FF9C00" className="ml-2" />
            <Text fontSize={12} className="ml-1 font-[Kanit-Regular]">
              4.5
            </Text>
          </View>

          {/* date */}
          <Text fontSize={18} className="mt-2 text-black font-[Kanit-Regular]">
            On {data?.pickupTime?.split("T")[0]?.replaceAll("-","/")}
          </Text>
        </View>

          {/* route */}
         <View className='flex-row justify-between' >
         <View className=" mt-3 gap-4 w-[80%]">
            <View className="flex-row items-center">
              <Text fontSize={14} className="w-12 font-[Kanit-Regular]">
                {departure}
              </Text>
              <Text fontSize={14} className="flex-1 font-[Kanit-Regular]">
                {data?.pickupAddress}
              </Text>
            </View>

            {/* <Text fontSize={10} className="ml-12 my-1 text-gray-400 font-[Kanit-Regular]">
              4h 40m
            </Text> */}

            <View className="flex-row items-center">
              <Text fontSize={14} className="w-12 font-[Kanit-Regular]">
                {arrival}
              </Text>
              <Text fontSize={14} className="flex-1 font-[Kanit-Regular]">
               {data?.dropAddress}
              </Text>
            </View>
          </View>
          <Text fontSize={18} className="text-[#00665A] font-[Kanit-Medium]">
          SR {data?.totalAmount}
        </Text>
         </View>
        </View>
      </View>

          {/* price */}
          {/* */}

      {/* ---------- dashed divider ---------- */}
      <View className="mx-4 h-0 border-b border-dashed border-gray-300" />

      {/* ---------- bottom row ---------- */}
      <View className="items-center gap-2 justify-center px-4 py-3">
        <View className="w-full border my-2 border-dashed rounded-lg p-3 flex-row justify-center items-center">
          <Text fontSize={18} className="ml-2 text-gray-600 font-[Kanit-Regular]">
            PIN : {data?.secretPin}
          </Text>
        </View>

       { status == "Pending" && <TouchableOpacity onPress={onCancel} className='p-3 justify-center items-center bg-red-500 w-full rounded-full'  >
          <Text fontSize={18} className="text-white font-[Kanit-Regular]">
            Cancel
          </Text>
        </TouchableOpacity>}
      </View>
    </TouchableOpacity>
  );
}