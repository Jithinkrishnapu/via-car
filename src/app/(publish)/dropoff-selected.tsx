import { router } from "expo-router";
import { Check, Circle, CirclePlus } from "lucide-react-native";
import LocationSearchSelected from "@/components/common/location-search-selected";
import { useLoadFonts } from "@/hooks/use-load-fonts";
import { FlatList, Modal, Pressable, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Text from "@/components/common/text";
import { useTranslation } from "react-i18next";
import { useCreateRideStore } from "@/store/useRideStore";
import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { getVehicleList } from "@/service/vehicle";
import { useStore } from "@/store/useStore";

interface Vehicle {
  id: number;
  model: {
    name: string;
    category_name: string;
  };
  brand: {
    name: string;
  };
  year: number;
}

function DropoffSelected() {
  const loaded = useLoadFonts();
  const { t } = useTranslation("components");
  const [isModalVisible, setModalVisible] = useState(false)
  const { ride, setRideField } = useCreateRideStore()
  const [vehicleList, setVehhicleList] = useState<Vehicle[]>([])
  const [selectedVehicle, setVehhicleSelected] = useState<number | null>(null)
  const [loadingVehicles, setLoadingVehicles] = useState(false)
  const {setPath} = useStore()

  // Set default vehicle if ride already has vehicle_id
  useEffect(() => {
    if (ride.vehicle_id && !selectedVehicle) {
      setVehhicleSelected(ride.vehicle_id);
    }
  }, [ride.vehicle_id]);

  // Handle modal visibility when component mounts/unmounts
  useEffect(() => {
    return () => {
      // Cleanup: ensure modal is closed when component unmounts
      setModalVisible(false);
    };
  }, []);


  const handleGetVehicles = async () => {
    setLoadingVehicles(true);
    try {
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
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      // Error will be handled by the global snackbar from the service layer
    } finally {
      setLoadingVehicles(false);
    }
  }

  if (!loaded) return null;
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-1">
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
            setRideField("destination_address", location.mainText || location.address || "")
            // router.push("/(publish)/route");
            setModalVisible(true)
            handleGetVehicles()
          }}
        />
      </View>
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable 
          className="flex-1 bg-black/50 justify-end"
          onPress={() => setModalVisible(false)}
        >
          <Pressable 
            className="bg-white h-fit px-6 pt-4 pb-8 rounded-t-3xl overflow-hidden"
            onPress={(e) => e.stopPropagation()} // Prevent modal close when tapping inside
          >
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-[16px] font-[Kanit-Medium]">{t("Select Vehicle")}</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="p-2"
                activeOpacity={0.7}
              >
                <Text className="text-[#FF4848] font-[Kanit-Medium]">{t("common.close", "Close")}</Text>
              </TouchableOpacity>
            </View>
            {loadingVehicles ? (
              <View className="py-8 items-center">
                <ActivityIndicator size="large" color="#FF4848" />
                <Text className="text-gray-400 font-[Kanit-Light] mt-2">
                  {t("Loading vehicles...")}
                </Text>
              </View>
            ) : vehicleList.length > 0 ? (
              <FlatList
                contentContainerClassName="gap-4 mb-6"
                data={vehicleList}
                scrollEnabled={true}
                contentInsetAdjustmentBehavior="automatic"
                automaticallyAdjustsScrollIndicatorInsets={false}
                renderItem={({ item, index }) => {
                  const isSelected = selectedVehicle === item?.id
                  return (
                    <Pressable 
                      onPress={() => {
                        setRideField("vehicle_id", item.id);
                        setVehhicleSelected(item?.id);
                      }}  
                      key={index} 
                      className={`flex-row p-4 rounded-xl justify-between items-center ${
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
            ) : !loadingVehicles ? (
              <View className="py-8 items-center">
                <Text className="text-gray-400 font-[Kanit-Light] mb-4">
                  {t("No vehicles added yet")}
                </Text>
              </View>
            ) : null}
            
            <Separator className="border-gray-200 my-6" />
            
            {/* Continue Button - shown when vehicle is selected */}
            {selectedVehicle ? (
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  // Small delay to ensure modal closes before navigation
                  setTimeout(() => {
                    router.push("/(publish)/route");
                  }, 100);
                }}
                className="flex-row items-center justify-center h-14 rounded-full bg-[#FF4848] mb-4"
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
                setModalVisible(false);
                setPath("/(publish)/dropoff-selected");
                // Small delay to ensure modal closes before navigation
                setTimeout(() => {
                  router.push("/(profile)/add-vehicles");
                }, 100);
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
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

export default DropoffSelected;
