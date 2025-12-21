import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    StyleSheet,
    Alert,
    Text,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import LocationPin from "../../../public/location-pin.svg";

interface SelectedLocation {
    latitude: number;
    longitude: number;
    address?:string
}

interface LocationPickerProps {
    onLocationSelected: (location: SelectedLocation) => void;
    initialRegion?: Region;
    confirmButtonText?: string;
}

const LocationPickerComponent: React.FC<LocationPickerProps> = ({
    onLocationSelected,
    initialRegion,
    confirmButtonText = 'Continue',
}) => {
    const mapRef = useRef<MapView>(null);
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastGeocodeTimeRef = useRef<number>(0);
    
    const [mapRegion, setMapRegion] = useState<Region>(
        initialRegion || {
            latitude: 37.78825,
            longitude: -122.4324,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
        }
    );
    const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null);
    const [address, setAddress] = useState<string>('Loading address...');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const { width, height } = Dimensions.get('window');

    useEffect(() => {
        // Initialize selected location
        const initialLocation = initialRegion
            ? { latitude: initialRegion.latitude, longitude: initialRegion.longitude }
            : null;

        setSelectedLocation(initialLocation || {
            latitude: mapRegion.latitude,
            longitude: mapRegion.longitude,
        });

        // Reverse geocode initial location with delay
        if (initialLocation) {
            setTimeout(() => reverseGeocode(initialLocation), 500);
        }
        // Remove automatic getCurrentLocation() call to prevent unwanted map movement
        
        // Cleanup timeout on unmount
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, []); // ✅ Empty dependency array to run only once

    const getCurrentLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission denied');
                setAddress('Unable to get location');
                return;
            }

            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced, // Changed from default for better performance
            });
            const { latitude, longitude } = location.coords;

            const newRegion = { 
                latitude, 
                longitude, 
                latitudeDelta: 0.0922, 
                longitudeDelta: 0.0421 
            };
            
            // Only animate if this is significantly different from current region
            const isSignificantChange = 
                Math.abs(mapRegion.latitude - latitude) > 0.01 ||
                Math.abs(mapRegion.longitude - longitude) > 0.01;
                
            setMapRegion(newRegion);
            setSelectedLocation({ latitude, longitude });
            
            if (isSignificantChange && mapRef.current) {
                mapRef.current.animateToRegion(newRegion, 1000);
            }
            
            reverseGeocode({ latitude, longitude });
        } catch (error) {
            console.error('Error getting location:', error);
            setAddress('Failed to get current location');
        }
    };

    const debouncedReverseGeocode = useCallback((location: SelectedLocation) => {
        // Clear existing timeout
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }
        
        // Set new timeout
        debounceTimeoutRef.current = setTimeout(() => {
            reverseGeocode(location);
        }, 1200); // Increased debounce time to reduce API calls
    }, []); // Remove reverseGeocode dependency to prevent recreation

    const handleRegionChangeComplete = useCallback(async (region: Region) => {
        const newLocation = {
            latitude: region.latitude,
            longitude: region.longitude,
        };
        
        // Only update if the region has actually changed significantly
        const hasSignificantChange = 
            Math.abs(mapRegion.latitude - region.latitude) > 0.001 || // Increased threshold
            Math.abs(mapRegion.longitude - region.longitude) > 0.001;
            
        if (!hasSignificantChange) {
            return; // Prevent unnecessary updates
        }
        
        setMapRegion(region);
        setSelectedLocation(newLocation);
        
        // Use debounced geocoding to avoid rate limits
        debouncedReverseGeocode(newLocation);
    }, [mapRegion.latitude, mapRegion.longitude, debouncedReverseGeocode]); // More specific dependencies

    const reverseGeocode = useCallback(async (location: SelectedLocation) => {
        const now = Date.now();
        const RATE_LIMIT_MS = 1000; // Minimum 1 second between requests
        
        // Rate limiting check
        if (now - lastGeocodeTimeRef.current < RATE_LIMIT_MS) {
            console.log('Rate limiting: skipping geocode request');
            const fallbackAddress = `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
            setAddress(fallbackAddress);
            onLocationSelected({
                latitude: location.latitude,
                longitude: location.longitude,
                address: fallbackAddress
            });
            return;
        }
        
        try {
            lastGeocodeTimeRef.current = now;
            const [place] = await Location.reverseGeocodeAsync(location);
            let formattedAddress = '';

            if (place) {
                const { city, region, district, street, streetNumber, postalCode } = place;
                formattedAddress = [
                    street && streetNumber ? `${streetNumber} ${street}` : '',
                    district || '',
                    city || '',
                    region || '',
                    postalCode || '',
                ]
                    .filter(Boolean)
                    .join(', ');
            }
            
            const finalAddress = formattedAddress || `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
            
            onLocationSelected({
                latitude: location.latitude,
                longitude: location.longitude,
                address: finalAddress
            });
            setAddress(finalAddress);
        } catch (err) {
            console.warn('Reverse geocoding failed:', err);
            const fallbackAddress = `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
            setAddress(fallbackAddress);
            onLocationSelected({
                latitude: location.latitude,
                longitude: location.longitude,
                address: fallbackAddress
            });
        }
    }, [onLocationSelected]); // ✅ Only depend on onLocationSelected

    const handleConfirm = () => {
        if (selectedLocation) {
            onLocationSelected(selectedLocation);
        } else {
            Alert.alert('Hold on!', 'Please adjust the map to select a location.');
        }
    };

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                region={mapRegion}
                onRegionChangeComplete={handleRegionChangeComplete}
                showsUserLocation={true}
                showsMyLocationButton={false}
                zoomEnabled
                scrollEnabled
                pitchEnabled={false}
                rotateEnabled={false}
                loadingEnabled={true}
                loadingIndicatorColor="#FF4848"
                loadingBackgroundColor="#ffffff"
                moveOnMarkerPress={false}
                showsPointsOfInterest={false}
                showsCompass={false}
                showsScale={false}
                showsBuildings={false}
                showsTraffic={false}
                showsIndoors={false}
                maxZoomLevel={18}
                minZoomLevel={8}
                followsUserLocation={false}
                userLocationUpdateInterval={5000}
                userLocationFastestInterval={5000}
            />

            {/* Center Marker */}
            {/* <View style={styles.centerMarker} /> */}
            <LocationPin
                style={styles.centerMarker}
                className="w-[19px] h-[22px]"
                width={30}
                height={30}
            />

            {/* Selected Location Label */}
            <View style={styles.addressContainer}>
                <Text style={styles.addressLabel} numberOfLines={3} ellipsizeMode="tail">
                    {address}
                </Text>
            </View>

            {/* Confirm Button */}
            {/* <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.buttonText}>{confirmButtonText}</Text>
        </TouchableOpacity>
      </View> */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    centerMarker: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: 22,
        height: 22,
        marginLeft: -8,
        marginTop: -8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    addressContainer: {
        position: 'absolute',
        top: 60,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        minHeight: 44, // Ensure minimum height for text
        justifyContent: 'center',
    },
    addressLabel: {
        fontSize: 14,
        color: '#333',
        textAlign: 'center',
        lineHeight: 20,
        fontFamily: 'Kanit-Regular',
        flexWrap: 'wrap',
        maxWidth: '100%',
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 40,
        left: 20,
        right: 20,
    },
    confirmButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
});

export default LocationPickerComponent;