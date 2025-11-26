// RideCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity,FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // expo install @expo/vector-icons
import CloseIcon from '../../public/close.svg';
import Avatar from './ui/avatar';
import { ArrowRight, ChevronRight } from 'lucide-react-native';
import DashedLine from './common/DashedLine';
import { format, parseISO } from 'date-fns';

type Props = {
    driverName: string;
    rating: number;
    date: string;        // DD/MM/YYYY
    startTime: string;   // HH:mm
    from: string;
    price: string;       // e.g. "SR560.00"
    duration: string;    // e.g. "4h 40m"
    endTime: string;     // HH:mm
    to: string;
    passengerStatus: 'confirmed' | 'pending';
    onStartRide?: () => void;
    onEndRide?: () => void;
    onAddPassengers?: () => void;
    passengers:[],
    onRideCancel?:()=>void
    status:number,
    activeTab?: 'Pending' | 'Cancelled' | 'Completed' | 'In Progress'
};

export const RideCard: React.FC<Props> = ({
    driverName,
    rating,
    date,
    startTime,
    from,
    price,
    duration,
    endTime,
    to,
    passengerStatus,
    onStartRide,
    onEndRide,
    onAddPassengers,
    passengers,
    onRideCancel,
    status,
    activeTab
}) => {
    /* -------------------------------------------------
     * Helper – pretty print duration
     * ------------------------------------------------- */
    const prettyDuration = duration.replace('h', 'h '); // “4h40m” → “4h 40m”

    const fmtUTC = (iso?: string) => {
        if (!iso) return '';
        const d = new Date(iso);
        return `${String(d.getUTCHours()).padStart(2, '0')}:${String(
          d.getUTCMinutes()
        ).padStart(2, '0')}`;
      };
    

      console.log("startTime============",startTime)
      console.log("endTime============",endTime)

      const departure = startTime;
      const arrival   = endTime;
    


    return (
        <View className=" my-2 py-2 rounded-2xl bg-white shadow-md overflow-hidden">
            {/* ----------  Header  ---------- */}
            <View className="flex-row items-center justify-between px-4 pt-4">
                <View className="flex-row gap-2 items-center">
                    <Avatar
                        source={require('../../public/profile-img.png')}
                        size={32}
                        initials="CN"
                        className="bg-blue-500"
                        textClassName="text-white"
                    />
                    <Text className="text-lg font-bold text-gray-900">{driverName}</Text>
                    <View className="ml-2 flex-row items-center">
                        <Ionicons name="star" size={14} color="#f59e0b" />
                        <Text className="ml-1 text-sm text-gray-600">{rating}</Text>
                    </View>
                </View>

               { status == 1 &&  <TouchableOpacity onPress={onRideCancel} className='bg-[#FF1919] rounded-full p-2 flex-row gap-3 items-center' >
                    <CloseIcon />
                    <Text className="text-sm text-white font-[Kanit-Light]">Ride Cancel</Text>
                </TouchableOpacity>}
            </View>

            {/* ----------  Date row  ---------- */}
            <Text className="px-4 mt-1 font-[Kanit-Light] text-[14px] text-black">
                On {date} at {departure}
            </Text>

            {/* ----------  Route block  ---------- */}
            <View className="px-4 mt-3">
                <View className="flex-row items-start">
                    {/* ----  vertical line + dots  ---- */}
                    <View className="items-center">
                        <View className="w-2 h-2 rounded-full bg-green-500" />
                        <View className="w-0.5 h-16 bg-gray-300 my-1" />
                        <View className="w-2 h-2 rounded-full bg-red-500" />
                    </View>

                    {/* ----  city / time labels  ---- */}
                    <View className="ml-3 gap-2 flex-1">
                        <View className='flex-row items-center gap-2' >
                            <Text className="text-xs text-gray-500">{departure}</Text>
                            <Text className="text-sm text-gray-800 font-semibold">{from}</Text>
                        </View>

                        {/* duration */}
                        <View className="flex-row items-center">
                            <Ionicons name="time-outline" size={14} color="#6b7280" />
                            <Text className="text-xs text-gray-500">{prettyDuration}</Text>
                        </View>

                        <View className='flex-row items-center gap-2' >
                            <Text className="text-xs text-gray-500">{arrival}</Text>
                            <Text className="text-sm text-gray-800 font-semibold">{to}</Text>
                        </View>
                    </View>

                    {/* ----  price  ---- */}
                    <View className="self-center">
                        <Text className="text-xl font-[Kanit-Medium] text-[#00665A]">{price}</Text>
                    </View>
                </View>
            </View>

            {/* ----------  Footer  ---------- */}
           <View className="mt-4 px-4 pb-4">
           {passengers?.length &&  
               <>
               <Text className='text-[16px] font-[Kanit-Medium] text-black' >Passengers Confirmed</Text>
                <FlatList 
                contentContainerClassName='gap-2'
                className={"flex-1 py-2"}
                data={passengers}
                renderItem={(({item})=>{
                    return <PassengerItem key={item?.id}/>
                })}
                ItemSeparatorComponent={()=><DashedLine/>}
                />
               </>
           }
                
                { (status == 1 || status == 2) && <View className="flex-row items-center gap-3 justify-between">
                    <TouchableOpacity
                        onPress={onAddPassengers}
                        className="p-4 flex-1 rounded-full items-center justify-center bg-[#FF4848]"
                    >
                        <Text className="text-[14px] text-white font-[Kanit-Light]">Add Passengers</Text>
                    </TouchableOpacity>

                    { status == 2 ? <TouchableOpacity
                        onPress={onEndRide}
                        className="p-4 flex-1 rounded-full items-center justify-center bg-[#FF4848]"
                    >
                        <Text className="text-[14px] text-white font-[Kanit-Light]">End Ride</Text>
                    </TouchableOpacity> : <TouchableOpacity
                        onPress={onStartRide}
                        className="p-4 flex-1 rounded-full items-center justify-center bg-[#0E8D7E]"
                    >
                        <Text className="text-[14px] text-white font-[Kanit-Light]">Start Ride</Text>
                    </TouchableOpacity>}

                </View>}
            </View>
        </View>
    );
};

const PassengerItem =()=>{
    return <View className='flex-row items-center gap-2' >
    <Avatar
        source={require('../../public/profile-img.png')}
        size={32}
        initials="CN"
        className="bg-blue-500"
        textClassName="text-white"
    />
    <View className='p-1' >
        <Text className='text-[14px] font-[Kanit-Medium] ' >Karthik</Text>
        <View className='flex-row items-center gap-2' >
            <Text className='text-[12px] text-[#666666] font-[Kanit-Light]' >{`Chennai`}</Text>
            <ArrowRight color={'#A5A5A5'} size={12} />
            <Text  className='text-[12px] text-[#666666] font-[Kanit-Light]' >{`Banglore`}</Text>
        </View>
    </View>
</View>
}