import { useEffect, useState, useCallback } from "react";
import { CircleHelp, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react-native";
import { TouchableOpacity, View, ActivityIndicator, StyleSheet, Platform, Dimensions } from "react-native";
import Text from "./text";
import { useTranslation } from "react-i18next";
import { Region } from 'react-native-maps';
import MapComponent from "../ui/map-view";
import LocationPickerComponent from "./location-picker-component";
import { useGetExactLocation } from "@/service/ride-booking";
import { router } from "expo-router";
import { useDirection } from "@/hooks/useDirection";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

interface Props {
  onContinue?: (location: LocationData) => void;
  initialRegion: Region;
  onBack?: () => void;
}

export default function LocationSearchSelected({ 
  onContinue, 
  initialRegion, 
  onBack 
}: Props) {
  const { t } = useTranslation("components");
  
  // State management
  const [location, setLocation] = useState<LocationData | null>(null);
  const [markers, setMarkers] = useState<any>(null);
  const [whyExact, setWhyExact] = useState<boolean>(false);
  const [isLoadingMarkers, setIsLoadingMarkers] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch exact location markers
  const handleGetExactLocation = useCallback(async () => {
    if (!initialRegion?.latitude || !initialRegion?.longitude) {
      return;
    }
    
    // Prevent duplicate calls
    if (isLoadingMarkers) {
      return;
    }
    
    setIsLoadingMarkers(true);
    setError(null);
    
    try {
      const request = {
        lat: initialRegion.latitude,
        lng: initialRegion.longitude,
        radius: 5000,
        limit: 20
      };
      
      const response = await useGetExactLocation(request);
      
      if (response?.data?.places) {
        setMarkers(response.data.places);
      } else {
        setError(t("locationSearchSelected.noLocationsFound", "No locations found nearby"));
      }
    } catch (err) {
      console.error("Error fetching exact location:", err);
      setError(t("locationSearchSelected.errorFetchingLocations", "Failed to load nearby locations"));
    } finally {
      setIsLoadingMarkers(false);
    }
  }, [initialRegion?.latitude, initialRegion?.longitude, t]);

  // Fetch markers when whyExact becomes true for the first time
  useEffect(() => {
    if (whyExact && !markers && !isLoadingMarkers) {
      handleGetExactLocation();
    }
  }, [whyExact, markers, isLoadingMarkers, handleGetExactLocation]);

  // Navigation handlers
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const handleContinue = () => {
    if (!location) {
      // Optionally show a warning that no location is selected
      console.warn("No location selected");
      return;
    }
    
    onContinue?.(location);
  };

  const handleLocationSelected = (selectedLocation: LocationData) => {
    setLocation(selectedLocation);
    setError(null); // Clear any previous errors
  };

  const handleMarkerPress = (loc: any, _index: number, name: string) => {
    setLocation({
      latitude: loc.latitude,
      longitude: loc.longitude,
      address: name
    });
    setError(null);
  };

    const { isRTL, swap } = useDirection();

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <View style={styles.backButtonContainer}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          activeOpacity={0.8}
        >
           {swap(<ChevronLeft size={16} />, <ChevronRight size={16} />)}
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        {/* Why Exact Location Button */}
        <TouchableOpacity
          onPress={() => setWhyExact(true)}
          style={styles.whyExactButton}
          activeOpacity={0.8}
        >
          <CircleHelp size={14} strokeWidth={1} />
          <Text
            fontSize={12}
            style={styles.whyExactText}
          >
            {t("locationSearchSelected.whyExactLocation", "Why an exact location?")}
          </Text>
        </TouchableOpacity>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Loading Indicator */}
        {isLoadingMarkers && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF4848" />
          </View>
        )}

        {/* Map Component - Conditional Rendering */}
        <View style={styles.mapContainer}>
          {whyExact ? (
            <MapComponent 
              onMarkerPress={handleMarkerPress} 
              markers={markers} 
            />
          ) : (
            <LocationPickerComponent 
              initialRegion={initialRegion} 
              onLocationSelected={handleLocationSelected}
              confirmButtonText={t("locationSearchSelected.selectLocation", "Select This Location")}
            />
          )}
        </View>
      </View>

      {/* Continue Button */}
      <View style={styles.continueButtonContainer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            location ? styles.continueButtonActive : styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
          activeOpacity={0.8}
          disabled={!location}
        >
          <Text
            fontSize={20}
            style={styles.continueButtonText}
          >
            {t("locationSearchSelected.continue", "Continue")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flex: 1,
    backgroundColor: '#fff',
  },
  backButtonContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 35,
    left: 24,
    zIndex: 20,
  },
  backButton: {
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'column',
    marginTop: Platform.OS === 'ios' ? 80 : 70,
    height: '100%',
  },
  whyExactButton: {
    borderWidth: 1,
    borderColor: '#EBEBEB',
    borderRadius: 25,
    alignSelf: 'center',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 8 : 6,
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  whyExactText: {
    fontSize: 12,
    fontWeight: '300',
    color: '#3C3F4E',
  },
  errorContainer: {
    marginHorizontal: 24,
    padding: 12,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
  },
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    zIndex: 30,
    transform: [
      { translateX: -25 },
      { translateY: -25 }
    ],
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 25,
    padding: 15,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  mapContainer: {
    flex: 1,
    marginTop: 4,
  },
  continueButtonContainer: {
    position: 'absolute',
    right: 0,
    bottom: Platform.OS === 'ios' ? 50 : 30,
    left: 0,
    paddingHorizontal: 24,
    zIndex: 10,
  },
  continueButton: {
    borderRadius: 27.5,
    width: '100%',
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  continueButtonActive: {
    backgroundColor: '#FF4848',
  },
  continueButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  continueButtonText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '400',
    textAlign: 'center',
  },
});