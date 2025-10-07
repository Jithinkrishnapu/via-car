import { useEffect, useState } from "react";
import { View, TouchableOpacity, Image } from "react-native";
import { router } from "expo-router";
import { ChevronLeft, ChevronRight, Circle } from "lucide-react-native";
import Text from "@/components/common/text";
import MapComponent from "@/components/ui/map-view";
import CheckGreen from "../../../public/check-green.svg";

import { useLoadFonts } from "@/hooks/use-load-fonts";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/hooks/useDirection";
import { useCreateRideStore } from "@/store/useRideStore";
import { placeRoutes } from "@/service/ride-booking";

function Route() {
  // -------------------- Hooks --------------------
  const loaded = useLoadFonts();
  const { t } = useTranslation("components");
  const { isRTL, swap } = useDirection();
  const { ride,setPolyline } = useCreateRideStore();

  // -------------------- States --------------------
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState("1");
  const [selectedRoutes, setSelectedRoutes] = useState(null);


  // -------------------- Map Data --------------------
  const markersData = [
    {
      id: "1",
      coordinate: { latitude: 37.78825, longitude: -122.4324 },
      title: "Location 1",
      description: "First marker",
      pinColor: "green",
    },
    {
      id: "2",
      coordinate: { latitude: 37.79025, longitude: -122.4344 },
      title: "Location 2",
      description: "Second marker",
      pinColor: "yellow",
    },
  ];

  const realRoadRoute = [
    {
      coordinates: [
        { latitude: 24.7136, longitude: 46.6753 }, // Riyadh - King Fahd Road
        { latitude: 24.8247, longitude: 46.7975 },
        { latitude: 25.0619, longitude: 47.1429 },
        { latitude: 25.2847, longitude: 47.4823 },
        { latitude: 25.3619, longitude: 48.1429 },
        { latitude: 25.4247, longitude: 48.5823 },
        { latitude: 26.0619, longitude: 49.4429 },
        { latitude: 26.4242, longitude: 50.0881 }, // Dammam city center
      ],
      strokeColor: "#FF0000",
      strokeWidth: 6,
    },
  ];

  // -------------------- Handlers --------------------
  const handleRoutes = async () => {
    const request = {
      pickup_lat: ride.pickup_lat,
      pickup_lng: ride.pickup_lng,
      dropoff_lat: ride.destination_lat,
      dropoff_lng: ride.destination_lng,
    };

    console.log(request, "Request Payload");

    const response = await placeRoutes(request);
    console.log(response?.data?.routes, "Routes Response");

    setRoutes(response?.data?.routes || []);
  };

  // -------------------- Effects --------------------
  useEffect(() => {
    handleRoutes();
  }, []);

  // -------------------- Render --------------------
  if (!loaded) return null;

  return (
    <View className="flex-1 bg-white">
      {/* -------------------- Map Section -------------------- */}
      <View className="flex-1 relative">
        {/* Back Button */}
        <TouchableOpacity
          className={swap(
            "absolute top-12 left-6 z-10 bg-white rounded-full size-[46px] border border-[#EBEBEB] items-center justify-center",
            "absolute top-12 right-6 z-10 bg-white rounded-full size-[46px] border border-[#EBEBEB] items-center justify-center"
          )}
          onPress={() => router.replace("..")}
          activeOpacity={0.8}
        >
          {swap(<ChevronLeft size={16} />, <ChevronRight size={16} />)}
        </TouchableOpacity>

        {/* Map Component */}
        <MapComponent
        />
      </View>

      {/* -------------------- Route Selection -------------------- */}
      <View className="bg-white rounded-t-3xl px-[28px] pt-[43px] -mt-8 z-10">
        <Text fontSize={23} className="text-[23px] font-[Kanit-Medium] mb-6">
          {t("route.title")}
        </Text>

        {routes.map((loc) => {
          const isSelected = selectedRoute === loc.route_index;

          return (
            <TouchableOpacity
              key={loc.route_index}
              onPress={() => {
                setPolyline(loc?.polyline)
                setSelectedRoutes(loc)
                setSelectedRoute(loc.route_index);
              }}
              activeOpacity={0.8}
              className={`border px-[20px] py-[18px] rounded-2xl mb-4 flex-row justify-between items-center ${
                isSelected
                  ? "border-[#69D2A5] bg-[#F1FFF9]"
                  : "border-[#EBEBEB] bg-white"
              }`}
            >
              <View className="flex-1">
                <Text
                  fontSize={14}
                  className="text-[14px] font-[Kanit-Regular] text-black"
                >
                  {loc.duration_text}
                </Text>
                <Text
                  fontSize={12}
                  className="text-[12px] font-[Kanit-Regular] text-[#999999]"
                >
                  {loc.route_description}
                </Text>
              </View>

              {isSelected ? (
                <CheckGreen width={25} height={25} />
              ) : (
                <Circle
                  color="#BBBBBB"
                  width={25}
                  height={25}
                  strokeWidth={1}
                  className="size-[25px]"
                />
              )}
            </TouchableOpacity>
          );
        })}

        {/* Continue Button */}
        <View className="py-5">
          <TouchableOpacity
            className="bg-[#FF4848] rounded-full h-[55px] flex-row items-center justify-center"
            onPress={() => router.push("/(publish)/stopovers")}
            activeOpacity={0.8}
          >
            <Text
              fontSize={20}
              className="text-xl text-white font-[Kanit-Regular]"
            >
              {t("common.continue")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default Route;
