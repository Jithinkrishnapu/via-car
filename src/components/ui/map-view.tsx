import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Polyline, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import polyline from '@mapbox/polyline';
import { useCreateRideStore } from '@/store/useRideStore';

type Coordinate = {
  latitude: number;
  longitude: number;
};

const MapScreen: React.FC = () => {
  const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
  const mapRef = useRef<MapView>(null);
  const { polyline: EncodedPolyline } = useCreateRideStore();

  useEffect(() => {
    if (EncodedPolyline) {
      try {
        const decodedCoordinates = polyline.decode(EncodedPolyline);
        const formattedCoordinates = decodedCoordinates.map(([lat, lng]) => ({
          latitude: lat,
          longitude: lng,
        }));
        setCoordinates(formattedCoordinates);
      } catch (error) {
        console.error('Invalid polyline string:', error);
      }
    }
  }, [EncodedPolyline]);

  useEffect(() => {
    if (coordinates.length > 0 && mapRef.current) {
      // Fit the map to show the entire polyline
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  }, [coordinates]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: coordinates[0]?.latitude || 37.78825,
          longitude: coordinates[0]?.longitude || -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {coordinates.length > 0 && (
          <Polyline
            coordinates={coordinates}
            strokeWidth={5}
            strokeColor="#2980b9"
            lineCap="round"
            lineJoin="round"
          />
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});

export default MapScreen;
