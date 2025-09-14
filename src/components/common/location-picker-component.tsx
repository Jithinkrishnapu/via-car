import React, { useState, useEffect, useRef } from 'react';
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

        // Reverse geocode initial location
        if (initialLocation) {
            reverseGeocode(initialLocation);
        } else {
            getCurrentLocation();
        }
    }, []);

    const getCurrentLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission denied');
                setAddress('Unable to get location');
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;

            const newRegion = { latitude, longitude, latitudeDelta: 0.0922, longitudeDelta: 0.0421 };
            setMapRegion(newRegion);
            setSelectedLocation({ latitude, longitude });
            reverseGeocode({ latitude, longitude });

            mapRef.current?.animateToRegion(newRegion, 1000);
        } catch (error) {
            console.error('Error getting location:', error);
            setAddress('Failed to get current location');
        }
    };

    const handleRegionChangeComplete = async (region: Region) => {
        const newLocation = {
            latitude: region.latitude,
            longitude: region.longitude,
        };
        setMapRegion(region);
        setSelectedLocation(newLocation);
        reverseGeocode(newLocation); // Update address
    };

    const reverseGeocode = async (location: SelectedLocation) => {
        try {
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

            setAddress(formattedAddress || `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`);
        } catch (err) {
            console.warn('Reverse geocoding failed:', err);
            setAddress(`${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`);
        }
    };

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
                <Text style={styles.addressLabel} numberOfLines={2}>
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
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
    },
    addressLabel: {
        fontSize: 14,
        color: '#333',
        textAlign: 'center',
        lineHeight: 18,
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