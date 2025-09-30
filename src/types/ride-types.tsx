export interface SearchRideRequest {
    user_lat: number;
    user_lng: number;
    destination_lat: number;
    destination_lng: number;
    date: string; // ISO date string (e.g., "2025-07-25")
    passengers: number;
    max_walking_distance_km: number;
    max_2_in_back?:boolean,
    include_total?:boolean,
    sort_by?:number
  }


interface Stop {
    id: number;
    address: string;
    lat: string; // API returns as string — keep as string if precision matters
    lng: string;
    time: string; // e.g., "16:30"
    walking_distance_km: number;
  }
  
  interface Vehicle {
    id: number;
    brand: number; // Could be enum ID — adjust if you have brand names
    color: string; // e.g., "#FFF"
  }
  
  interface Driver {
    id: number;
    name: string;
  }
  
  interface Ride {
    ride_id: number;
    ride_route: string;
    pickup_stop: Stop;
    drop_stop: Stop;
    amount: string; // e.g., "20.00" — string because it's formatted currency
    distance_km: string; // e.g., "14.19"
    duration_minutes: number;
    available_seats: number;
    driver: Driver;
    vehicle: Vehicle;
  }
  
  interface SearchRideData {
    rides: Ride[];
  }
  
  export interface SearchRideResponse {
    commonData: null;
    data: SearchRideData;
    message: string;
  }

  export interface RoutesRequest {
    "pickup_lat":number,
    "pickup_lng":number,
    "dropoff_lat":number,
    "dropoff_lng":number
}