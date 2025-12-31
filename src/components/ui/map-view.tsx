import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, Text, Platform, Dimensions } from 'react-native';
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

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

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

  /* -------------- fit camera (prevent continuous re-renders) -------------- */
  const hasInitializedRef = useRef(false);
  
  useEffect(() => {
    if (!mapRef.current || hasInitializedRef.current) return;

    const timer = setTimeout(() => {
      /* case 1 : we have markers – fit all markers */
      if (markers?.length) {
        const coords = markers.map((m) => ({ latitude: m.lat, longitude: m.lng }));
        mapRef.current?.fitToCoordinates(coords, {
          edgePadding: { 
            top: Platform.OS === 'ios' ? 80 : 60, 
            right: 40, 
            bottom: Platform.OS === 'ios' ? 80 : 60, 
            left: 40 
          },
          animated: true,
        });
        hasInitializedRef.current = true;
        return;
      }

      /* case 2 : we have a polyline – fit the whole route */
      if (polyCoords.length) {
        mapRef.current?.fitToCoordinates(polyCoords, {
          edgePadding: { 
            top: Platform.OS === 'ios' ? 80 : 60, 
            right: 40, 
            bottom: Platform.OS === 'ios' ? 80 : 60, 
            left: 40 
          },
          animated: true,
        });
        hasInitializedRef.current = true;
      }
    }, Platform.OS === 'ios' ? 600 : 400); // Different delays for iOS/Android

    return () => clearTimeout(timer);
  }, [markers?.length, polyCoords.length]); // Only depend on length, not the arrays themselves

  /* -------------- helpers -------------- */
  const showPolyline = !markers?.length && polyCoords.length > 0;
  const showMarkers = !!markers?.length;
  
  // Get start and end points for polyline
  const startPoint = polyCoords.length > 0 ? polyCoords[0] : null;
  const endPoint = polyCoords.length > 0 ? polyCoords[polyCoords.length - 1] : null;


  console.log(markers, "----------------------------------")

  /* -------------- render -------------- */
  const initialRegion = useMemo(() => ({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  }), []);

  return (
    <View style={styles.container}>
      {name && (
        <View style={styles.nameContainer}>
          <Text style={styles.nameText}>{name}</Text>
        </View>
      )}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        showsUserLocation={false}
        showsMyLocationButton={false}
        toolbarEnabled={false}
        loadingEnabled={true}
        moveOnMarkerPress={false}
        showsCompass={false}
        showsScale={false}
        showsBuildings={false}
        showsTraffic={false}
        showsIndoors={false}
        rotateEnabled={true}
        scrollEnabled={true}
        zoomEnabled={true}
        pitchEnabled={false}
      >
        {/* 1.  Polyline (only when NO markers supplied) */}
        {showPolyline && (
          <>
            <Polyline
              coordinates={polyCoords}
              strokeWidth={5}
              strokeColor="#2980b9"
              lineCap="round"
              lineJoin="round"
            />
            
            {/* Start point marker */}
            {startPoint && (
              <Marker
                coordinate={startPoint}
                anchor={{ x: 0.5, y: 0.5 }}
                centerOffset={{ x: 0, y: 0 }}
              >
                <View style={styles.startMarker} />
                <Callout tooltip={false}>
                  <View style={styles.calloutContainer}>
                    <Text style={styles.calloutText}>Start Point</Text>
                  </View>
                </Callout>
              </Marker>
            )}
            
            {/* End point marker */}
            {endPoint && (
              <Marker
                coordinate={endPoint}
                anchor={{ x: 0.5, y: 0.5 }}
                centerOffset={{ x: 0, y: 0 }}
              >
                <View style={styles.endMarker} />
                <Callout tooltip={false}>
                  <View style={styles.calloutContainer}>
                    <Text style={styles.calloutText}>End Point</Text>
                  </View>
                </Callout>
              </Marker>
            )}
          </>
        )}

        {/* 2.  Markers (only when supplied) */}
        {showMarkers &&
          markers.map((m, idx) => (
            <Marker
              key={`${m.lat}-${m.lng}-${idx}`}
              coordinate={{ latitude: m.lat, longitude: m.lng }}
              onPress={() => {
                setName(m.name);
                onMarkerPress?.({ latitude: m.lat, longitude: m.lng }, idx, m.name);
              }}
            >
              <Callout tooltip={false}>
                <View style={styles.markerCallout}>
                  <Text style={styles.markerCalloutText}>{m.name || `Point ${idx + 1}`}</Text>
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
  container: { 
    flex: 1,
    backgroundColor: '#fff',
  },
  map: { 
    flex: 1,
    width: '100%',
    height: '100%',
  },
  nameContainer: {
    backgroundColor: '#dcfce7', // green-100
    alignSelf: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#166534', // green-800
    marginBottom: Platform.OS === 'ios' ? 12 : 8,
    marginTop: Platform.OS === 'ios' ? 8 : 4,
    width: '75%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    paddingHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  nameText: {
    fontSize: 14,
    textTransform: 'capitalize',
    fontWeight: '500',
    color: '#000',
    textAlign: 'center',
  },
  startMarker: {
    width: 16,
    height: 16,
    backgroundColor: '#22c55e', // green-500
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  endMarker: {
    width: 16,
    height: 16,
    backgroundColor: '#ef4444', // red-500
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  calloutContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  calloutText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  markerCallout: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    maxWidth: screenWidth * 0.6,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  markerCalloutText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    textAlign: 'center',
    flexWrap: 'wrap',
  },
});

export default MapScreen;