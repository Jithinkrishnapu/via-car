import { router } from "expo-router";
import { Check, Circle, CirclePlus, Radio } from "lucide-react-native";
import LocationSearchSelected from "@/components/common/location-search-selected";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import { FlatList, Modal, Pressable, TouchableOpacity, View } from "react-native";
import Text from "@/components/common/text";
import { useTranslation } from "react-i18next";
import { useCreateRideStore } from "@/store/useRideStore";
import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { getVehicleList } from "@/service/vehicle";
import { useStore } from "@/store/useStore";

function DropoffSelected() {
  const loaded = useLoadFonts();
  const { t } = useTranslation("components");
  const [isModalVisible, setModalVisible] = useState(false)
  const { ride, setRideField, createRide, loading, success, error } = useCreateRideStore()
  const [vehicleList, setVehhicleList] = useState([])
  const [selectedVehicle, setVehhicleSelected] = useState<number | null>(null)
  const {setPath} = useStore()

  // Set default vehicle if ride already has vehicle_id
  useEffect(() => {
    if (ride.vehicle_id && !selectedVehicle) {
      setVehhicleSelected(ride.vehicle_id);
    }
  }, [ride.vehicle_id]);


  const handleGetVehicles = async () => {
    const response = await getVehicleList()
    if (response.data && response.data.vehicles.length > 0) {
      const vehicles = response.data.vehicles;
      setVehhicleList(vehicles);
      
      // Auto-select first vehicle if none selected
      if (!selectedVehicle && vehicles[0]) {
        setVehhicleSelected(vehicles[0].id);
        setRideField("vehicle_id", vehicles[0].id);
      }
    }
  }

  if (!loaded) return null;
  return (
    <View className="flex-auto h-full pt-16 bg-white">
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
            <Text className="text-[16px] font-[Kanit-Medium] my-4">{t("profile.Select Vehicle")}</Text>
            {vehicleList.length > 0 ? (
              <FlatList
                contentContainerClassName="gap-3 mb-4"
                data={vehicleList}
                renderItem={({ item, index }) => {
                  const isSelected = selectedVehicle === item?.id
                  return (
                    <Pressable 
                      onPress={() => {
                        setRideField("vehicle_id", item.id)
                        setVehhicleSelected(item?.id)
                      }}  
                      key={index} 
                      className={`flex-row p-3 rounded-lg justify-between items-center ${
                        isSelected ? 'border-2 border-[#FF4848] bg-red-50' : 'border border-gray-300'
                      }`}
                    >
                      <View className="flex-1">
                        <Text
                          fontSize={16}
                          className="text-[16px] font-[Kanit-Medium]"
                        >
                          {item?.model?.name}
                        </Text>
                        <Text
                          fontSize={12}
                          className="text-[12px] text-gray-600 font-[Kanit-Light]"
                        >
                          {item?.model?.category_name}, {item?.brand?.name}
                        </Text>
                        <Text
                          fontSize={11}
                          className="text-[11px] text-gray-500 font-[Kanit-Light] mt-1"
                        >
                          {item?.year}
                        </Text>
                      </View>
                      <View className={`rounded-full p-1 ${isSelected ? 'bg-[#FF4848]' : ''}`}>
                        {isSelected ? (
                          <Check size={20} color="#fff" strokeWidth={3} />
                        ) : (
                          <Circle size={20} color="#666666" />
                        )}
                      </View>
                    </Pressable>
                  )
                }}
                keyExtractor={(item) => item.id.toString()}
              />
            ) : (
              <View className="py-8 items-center">
                <Text className="text-gray-400 font-[Kanit-Light] mb-4">
                  {t("profile.No vehicles added yet")}
                </Text>
              </View>
            )}
            
            <Separator className="border-gray-200 my-4" />
            
            {/* Continue Button - shown when vehicle is selected */}
            {selectedVehicle ? (
              <TouchableOpacity
                onPress={() => {
                  router.push("/(publish)/route");
                }}
                className="flex-row items-center justify-center h-14 rounded-full bg-[#FF4848] mb-3"
                activeOpacity={0.8}
              >
                <Text
                  fontSize={18}
                  className="text-lg text-white font-[Kanit-Regular]"
                >
                  {t("common.continue")}
                </Text>
              </TouchableOpacity>
            ) : null}
            
            {/* Add Vehicle Button */}
            <TouchableOpacity
              onPress={() => {
                setPath("/(publish)/dropoff-selected")
                router.push("/(profile)/add-vehicles")
              }}
              className={`flex-row items-center justify-center h-14 rounded-full ${
                selectedVehicle ? 'bg-white border-2 border-[#FF4848]' : 'bg-[#FF4848]'
              }`}
              activeOpacity={0.8}
            >
              <CirclePlus 
                size={20} 
                color={selectedVehicle ? "#FF4848" : "#fff"} 
                strokeWidth={1} 
              />
              <Text
                fontSize={18}
                className={`ml-2 text-lg font-[Kanit-Regular] ${
                  selectedVehicle ? 'text-[#FF4848]' : 'text-white'
                }`}
              >
                {t("Add vehicle", { ns: "translation" })}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default DropoffSelected;
