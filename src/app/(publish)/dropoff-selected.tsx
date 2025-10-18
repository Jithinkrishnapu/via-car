import { router } from "expo-router";
import { Check, ChevronLeft, Circle, CirclePlus, Radio } from "lucide-react-native";
import LocationSearchSelected from "@/components/common/location-search-selected";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import { FlatList, Modal, Pressable, TouchableOpacity, View } from "react-native";
import Text from "@/components/common/text";
import { useTranslation } from "react-i18next";
import { useCreateRideStore } from "@/store/useRideStore";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { getVehicleList } from "@/service/vehicle";
import { useStore } from "@/store/useStore";

function DropoffSelected() {
  const loaded = useLoadFonts();
  const { t } = useTranslation("components");
  const [isModalVisible, setModalVisible] = useState(false)
  const { ride, setRideField, createRide, loading, success, error } = useCreateRideStore()
  const [vehicleList, setVehhicleList] = useState([])
  const [selectedVehicle, setVehhicleSelected] = useState([])
  const {setPath} = useStore()


  const handleGetVehicles = async () => {
    const response = await getVehicleList()
    if (response.data) {
      setVehhicleList(response.data.vehicles)
    }
  }

  if (!loaded) return null;
  return (
    <View className="flex-auto h-full pt-16 bg-white">
      <View className="flex-row items-center gap-4 mb-6 px-6">
        <TouchableOpacity
          className="rounded-full size-[46px] border border-[#EBEBEB] items-center justify-center"
          onPress={() => router.replace("..")}
          activeOpacity={0.8}
        >
          <ChevronLeft size={16} />
        </TouchableOpacity>
        <Text
          fontSize={25}
          className="text-[25px] text-black font-[Kanit-Medium] flex-1"
        >
          {t("dropoff.selectedTitle")}
        </Text>
      </View>
      <LocationSearchSelected
        initialRegion={{
          latitude: ride.destination_lat,
          longitude: ride.destination_lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01
        }}
        onContinue={(location) => {
          setRideField("destination_lat", location.latitude)
          setRideField("destination_lng", location.longitude)
          setRideField("destination_address", location.address)
          // router.push("/(publish)/route");
          handleGetVehicles().then(() => {
            setModalVisible(true)
          })
        }}
      />
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white h-fit px-4 py-2 rounded-t-3xl overflow-hidden">
            <Text className="text-[16px] font-[Kanit-Medium] my-4" >Select Vehicle</Text>
            <FlatList
              contentContainerClassName="gap-3"
              data={vehicleList}
              renderItem={({ item, index }) => {
                const isSelected = selectedVehicle == item?.id
                return <Pressable onPress={()=>{
                  setRideField("vehicle_id",item.id)
                  setVehhicleSelected(item?.id)
                  router.push("/(publish)/route");
                  }}  key={index} className="flex-row border border-gray-400 p-2 rounded-lg justify-between items-center">
                  <View>
                    <Text
                      fontSize={16}
                      className="text-[16px] font-[Kanit-Regular]"
                    >
                      {item?.model?.name}
                    </Text>
                    <Text
                      fontSize={12}
                      className="text-[12px] text-gray-600 font-[Kanit-Light]"
                    >
                      {t(`${item?.model?.category_name},${item?.brand?.name}`)}
                    </Text>
                  </View>
                  <View >
                    {isSelected ? <Check size={22} color="#666666" /> : <Circle  size={22} color="#666666" />}
                  </View>
                </Pressable>
              }}
            />
            <Separator className="border-gray-200 mt-4 mb-10" />
            <TouchableOpacity
              onPress={() => {
                setPath("/(publish)/dropoff-selected")
                router.push("/(profile)/add-vehicles")}}
              className="flex-row items-center justify-center h-14 rounded-full bg-red-500"
              activeOpacity={0.8}
            >
              <CirclePlus size={20} color="#fff" strokeWidth={1} />
              <Text
                fontSize={18}
                className="ml-2 text-lg text-white font-[Kanit-Regular]"
              >
                {t("Add vehicle")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default DropoffSelected;
