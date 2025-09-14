import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Text } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Region, LatLng } from 'react-native-maps';
import * as Location from 'expo-location';

interface LocationState {
  coords: {
    latitude: number;
    longitude: number;
    altitude: number | null;
    accuracy: number | null;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
  };
  timestamp: number;
}

export interface DirectionRoute {
  coordinates: LatLng[];
  strokeColor?: string;
  strokeWidth?: number;
}

export interface MarkerData {
  id: string;
  coordinate: LatLng;
  title: string;
  description?: string;
  pinColor?: string;
}

interface MapComponentProps {
  directions?: DirectionRoute[];
  markers?: MarkerData[];
  initialRegion?: Region;
}

const MapComponent: React.FC<MapComponentProps> = ({
  directions,
  markers,
  initialRegion,
}) => {
  const [location, setLocation] = useState<LocationState | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mapRegion, setMapRegion] = useState<Region>(
    initialRegion || {
      latitude: 37.78825,
      longitude: -122.4324,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    }
  );

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (directions && directions.length > 0) {
      console.log('Fitting map to directions');
      fitToDirections();
    } else if (markers && markers.length > 0) {
      console.log('Fitting map to markers');
      fitToMarkers();
    }
  }, [directions, markers]);

  const getCurrentLocation = async (): Promise<void> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        Alert.alert('Permission denied', 'Location permission is required to show your position on the map.');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);

      // If no directions or markers, center on user
      if (!directions || directions.length === 0) {
        if (!markers || markers.length === 0) {
          setMapRegion({
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
        }
      }
    } catch (error: any) {
      console.error('Error getting location:', error);
      setErrorMsg(`Location error: ${error.message}`);
    }
  };

  const fitToDirections = (): void => {
    if (!directions || directions.length === 0) return;

    let minLat = Infinity;
    let maxLat = -Infinity;
    let minLng = Infinity;
    let maxLng = -Infinity;

    directions.forEach((route) => {
      route.coordinates.forEach((coord) => {
        if (!coord.latitude || !coord.longitude) return;
        if (!isFinite(coord.latitude) || !isFinite(coord.longitude)) return;

        minLat = Math.min(minLat, coord.latitude);
        maxLat = Math.max(maxLat, coord.latitude);
        minLng = Math.min(minLng, coord.longitude);
        maxLng = Math.max(maxLng, coord.longitude);
      });
    });

    if (minLat === Infinity) {
      console.warn('No valid coordinates found in directions');
      return;
    }

    const latDelta = (maxLat - minLat) * 1.5;
    const lngDelta = (maxLng - minLng) * 1.5;

    setMapRegion({
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(latDelta, 0.01),
      longitudeDelta: Math.max(lngDelta, 0.01),
    });
  };

  const fitToMarkers = (): void => {
    if (!markers || markers.length === 0) return;

    if (markers.length === 1) {
      const { latitude, longitude } = markers[0].coordinate;
      setMapRegion({
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
      return;
    }

    let minLat = Infinity;
    let maxLat = -Infinity;
    let minLng = Infinity;
    let maxLng = -Infinity;

    markers.forEach((marker) => {
      const { latitude, longitude } = marker.coordinate;
      if (!isFinite(latitude) || !isFinite(longitude)) return;

      minLat = Math.min(minLat, latitude);
      maxLat = Math.max(maxLat, latitude);
      minLng = Math.min(minLng, longitude);
      maxLng = Math.max(maxLng, longitude);
    });

    if (minLat === Infinity) return;

    const latDelta = (maxLat - minLat) * 1.5;
    const lngDelta = (maxLng - minLng) * 1.5;

    setMapRegion({
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(latDelta, 0.01),
      longitudeDelta: Math.max(lngDelta, 0.01),
    });
  };

  if (errorMsg) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE} // Remove this line to use default provider (Apple/Google auto)
        style={styles.map}
        region={mapRegion}
        // showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
        zoomEnabled={true}
        scrollEnabled={true}
        loadingEnabled={true}
        onRegionChangeComplete={(region) => console.log('Region changed:', region)}
      >
        {/* Render Directions (Polylines) */}
        {directions &&
          directions.map((route, index) => {
            if (!route.coordinates || route.coordinates.length < 2) {
              console.warn(`Route ${index} skipped: needs at least 2 valid points`);
              return null;
            }

            // Validate coordinates
            const validCoords = route.coordinates.filter(
              (coord) =>
                coord.latitude != null &&
                coord.longitude != null &&
                isFinite(coord.latitude) &&
                isFinite(coord.longitude)
            );

            if (validCoords.length < 2) {
              console.warn(`Route ${index} has invalid or insufficient coordinates`);
              return null;
            }

            return (
              <Polyline
                key={`direction-${index}`}
                coordinates={validCoords}
                strokeColor={route.strokeColor || '#FF0000'} // Bright red for visibility
                strokeWidth={route.strokeWidth || 6}
                geodesic={false}
              />
            );
          })}

        {/* Render Markers */}
        {markers &&
          markers.map((marker) => (
            <Marker
              key={marker.id}
              coordinate={marker.coordinate}
              title={marker.title}
              description={marker.description}
              pinColor={marker.pinColor || 'red'}
            />
          ))}

        {/* Show user location with blue pin if markers exist */}
        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Your Location"
            description="You are here"
            pinColor={markers ? 'blue' : 'red'}
          />
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    flex: 1,
  },
  errorText: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 16,
    color: 'red',
  },
});

export default MapComponent;