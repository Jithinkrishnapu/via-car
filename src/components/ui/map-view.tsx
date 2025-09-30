import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Polyline } from 'react-native-maps';
import polyline from '@mapbox/polyline';

const EncodedPolyline = "_hxbAggpoMbBpAr@nAl@JRIbC[Z@dAAr@BVvAk@bGCpDIbDZjCUtE\\zAGhEGjD`B`Eh@vB\\~@BxAZvAlApBx@vALrB@vDj@nA\\tBaBnJaBzE]hCoAbEd@j@nEvA~AdA@hAB~FHlGa@hAYpCd@|D_@xANnCr@dDFbACfAh@pA\\nE_@n@NfAj@lBd@~BWbDQrBl@vAdDdAhGfDpCxCpAjD|BnFpAr@bBRRlAMhCj@fDG~AWxCLr@vAHRPOnAkChKs@tIW~AaIfByHpBiC`BoBlCyIrH_L`HcAdBkDlJ{HfKmIrFmVzKcQvLsR|KaO|HaG|@oLdBqFrA}FxBmFtJwGtMmH`OgIhIiBrCaGvM@xAnAdHh@|Oe@~GKvDk@rAoCp@_@X`@z@r@~@M~C{@`G@tCd@zCnFfIh@lBEhBNbFp@fFlBbGnCzGLhCGxCdClClKnGrClHTrAq@pDk@fC?pD\\lE@xEc@|BwBfAmEjCiAfEJfH|DvELbCs@lDmAvGuDhD}@pFBrDkDjGyD~GwDbFmGrNaDtEiElE}@hBu@bI}AfH}CjJgI~UaCnQ?N@lJYbDeD|DiEtBiCtFkBfF?HMH{DrFgIpJgGlGmDfAyF|Cg@fBKnEsAhAiAZwBGgDNeHlA_HzBqBtA]tBIpBr@zBzCrFRjD_@hEBDUZ}BjBuClFsH`LeD|CwAfCyA|FiBlK_AhESnHWlB_CpDq@xCe@hFsLvN}E|IwAbF_@vDWlBwAlCmLbRkB~DcBpHFtEk@xH_ArIIpFr@`HlE`LZjAI|Fg@zEa@xFcBhIiEfNqBxMoB~Wm@`GmBvD_DxC{Bh@qDf@gDxB{A`DaFlO_AvIcC`KwAjMPbI|AbFvB|FpFfK`CxEvE`D`C`BlA`BJtAUxGeA~E_A`DaBdMuDtTGfBM|BNlRh@dNqAjMi@dEqAtDiDjFyCtNyCzJqIjX_IfXe@hCEzFfDbO|AhCoDvHwJjSgHbEiDpByEzF_C|CiAtA{CtAgAf@m@d@}BvF}AlBwAnAaC~D}BzA_BdEi@nDRnB~AfF?fB]jAwCbDaCvBoBx@eLl@{F`@gJlIeV|V{CnG_B~C}@n@kNzHmGrDkJ|FiClFsBjNk@bHOvFi@bCsE|IwBpCuAr@gHlEkJzGsF~B{_@xHqCbAyBTeIrAp@fGLxLHpF|@lBRh@l@jC|Ak@bGiB`BvFRxAO|A_F~@gAl@iBbEeElI{AfBcKfFoWpIgSjG}Cl@wWjEaHbA_@FMqBYqDKoB\\C";

const MapScreen = () => {
  // Decode the polyline string into array of coordinates
  const decodedCoordinates = polyline.decode(EncodedPolyline);

  // Convert [lat, lng] to [{latitude, longitude}]
  const coordinates = decodedCoordinates.map(([lat, lng]) => ({
    latitude: lat,
    longitude: lng,
  }));

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: coordinates[0]?.latitude || 37.78825,
          longitude: coordinates[0]?.longitude || -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        provider="google" // Required for Google Maps on iOS/Android
      >
        {/* Render the decoded polyline */}
        <Polyline
          coordinates={coordinates}
          strokeWidth={6}
          strokeColor="#2980b9"
          lineCap="round"
          lineJoin="round"
        />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});

export default MapScreen;