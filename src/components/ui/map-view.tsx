import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapView, {
  Marker,
  Polyline,
  PROVIDER_GOOGLE,
  Region,
  LatLng,
  Callout,
} from 'react-native-maps';
import polyline from '@mapbox/polyline';
import { useCreateRideStore } from '@/store/useRideStore';
import LocationPin from "../../../public/location-pin.svg";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */
type Coordinate = LatLng;

type Props = {
  /* parent can give us EITHER markers OR a poly-line */
  markers?: { lat: number; lng: number, name: string }[];
  /* fired when user taps a marker (only when markers are shown) */
  onMarkerPress?: (coord: Coordinate, index: number,name:string) => void;
};

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */
const MapScreen: React.FC<Props> = ({ markers, onMarkerPress }) => {
  const mapRef = useRef<MapView>(null);
  const { polyline: EncodedPolyline } = useCreateRideStore();

  /* -------------- state -------------- */
  const [polyCoords, setPolyCoords] = useState<Coordinate[]>([]);
  const [name,setName] = useState("")

  /* -------------- decode polyline -------------- */
  useEffect(() => {
    if (!EncodedPolyline) return;
    try {
      const decoded = polyline
        .decode(EncodedPolyline)
        .map(([lat, lng]) => ({ latitude: lat, longitude: lng }));
      setPolyCoords(decoded);
    } catch (e) {
      console.error('Invalid polyline:', e);
      setPolyCoords([]);
    }
  }, [EncodedPolyline]);

  /* -------------- fit camera -------------- */
  useEffect(() => {
    if (!mapRef.current) return;

    /* case 1 : we have markers – fit all markers */
    if (markers?.length) {
      const coords = markers.map((m) => ({ latitude: m.lat, longitude: m.lng }));
      mapRef.current.fitToCoordinates(coords, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
      return;
    }

    /* case 2 : we have a polyline – fit the whole route */
    if (polyCoords.length) {
      mapRef.current.fitToCoordinates(polyCoords, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  }, [markers, polyCoords]);

  /* -------------- helpers -------------- */
  const showPolyline = !markers?.length && polyCoords.length > 0;
  const showMarkers = !!markers?.length;


  console.log(markers, "----------------------------------")

  /* -------------- render -------------- */
  return (
    <View style={styles.container}>
       { name && <View className=' bg-green-100 self-center rounded-full border border-green-800 mb-3 w-3/4 justify-center items-center p-2' >
     <Text className='text-[14px] capitalize font-[Kanin-Medium] text-black'>{name}</Text>
     </View>}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {/* 1.  Polyline (only when NO markers supplied) */}
        {showPolyline && (
          <Polyline
            coordinates={polyCoords}
            strokeWidth={5}
            strokeColor="#2980b9"
            lineCap="round"
            lineJoin="round"
          />
        )}

        {/* 2.  Markers (only when supplied) */}
        {showMarkers &&
          markers.map((m, idx) => (
            <Marker
              key={`${m.lat}-${m.lng}`}
              coordinate={{ latitude: m.lat, longitude: m.lng }}
              onPress={() => {
                setName(m.name)
                onMarkerPress?.({ latitude: m.lat, longitude: m.lng }, idx,m.name)}}
            >
              <Callout tooltip={false}>
                <View>
                  <Text>{m.name || `Point ${idx + 1}`}</Text>
                </View>
              </Callout>
            </Marker>
          ))}
      </MapView>
    </View>
  );
};

/* ------------------------------------------------------------------ */
/* Styles                                                             */
/* ------------------------------------------------------------------ */
const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  // callout: {
  //   backgroundColor: '#fff',
  //   paddingHorizontal: 12,
  //   paddingVertical: 6,
  //   borderRadius: 6,
  //   borderColor: '#ccc',
  //   borderWidth: 1,
  // },
  // calloutText: {
  //   fontSize: 14,
  //   color: '#000',
  //   width: 'auto',
  //   height: 90
  // },
});

export default MapScreen;