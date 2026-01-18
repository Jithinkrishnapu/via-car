import axios from 'axios';
import Constants from 'expo-constants';

const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.ios?.config?.googleMapsApiKey || Constants.expoConfig?.android?.config?.googleMaps?.apiKey || "AIzaSyD4KYXp4bh_CxCX24Q04Bk7iuBmnjYqz8g";

interface LocationPoint {
  lat: number;
  lng: number;
  address?: string;
}

/**
 * Calculate distance between two points using Google Maps Directions API
 * Returns distance in kilometers
 */
export const getRouteDistance = async (origin: LocationPoint, destination: LocationPoint): Promise<number> => {
  if (!origin || !destination) return 0;

  try {
    const originStr = `${origin.lat},${origin.lng}`;
    const destStr = `${destination.lat},${destination.lng}`;
    
    // Explicitly requesting API key if not found in config is a fallback
    // In production, ensure keys are properly managed
    const apiKey = GOOGLE_MAPS_API_KEY;

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destStr}&key=${apiKey}`;
    
    const response = await axios.get(url);
    
    if (response.data.status === 'OK' && response.data.routes.length > 0) {
      const legs = response.data.routes[0].legs;
      let totalDistanceMeters = 0;
      
      for (const leg of legs) {
        totalDistanceMeters += leg.distance.value;
      }
      
      // Convert to km
      return totalDistanceMeters / 1000;
    } else {
      console.warn('Google Maps Directions API Error:', response.data.status);
      return calculateHaversineDistance(origin, destination);
    }
  } catch (error) {
    console.error('Error fetching route distance:', error);
    return calculateHaversineDistance(origin, destination);
  }
};

/**
 * Fallback calculation using Haversine formula
 */
export const calculateHaversineDistance = (p1: LocationPoint, p2: LocationPoint): number => {
    function deg2rad(deg: number) {
        return deg * (Math.PI / 180);
    }
    
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(p2.lat - p1.lat);
    const dLon = deg2rad(p2.lng - p1.lng);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(p1.lat)) * Math.cos(deg2rad(p2.lat)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};
