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

export interface LocationData {
  lat: number
  lng: number
  mainText: string
  placeId: string
  secondaryText: string
  text: string
}

type Stops = {
  lat: number;
  lng: number;
  address: string;
  order: number;
  // time: string;
};

type Price = {
  pickup_order: number;
  drop_order: number;
  amount: number;
};

export type RideDetails = {
  vehicle_id: number;
  pickup_lat: number;
  pickup_lng: number;
  pickup_address: string;
  drop_lat: number;
  drop_lng: number;
  drop_address: string;
  date: string; // ISO date (e.g., "2025-10-15")
  pickup_time: string; // "HH:mm" format
  drop_time: string; // "HH:mm" format
  passengers: number;
  ride_route: string; // encoded polyline
  max_2_in_back: boolean;
  stops: Stops[];
  prices: Price[];
};


interface PickupDropStop {
  id: number;
  address: string;
  lat: string; // or consider `number` if parsed
  lng: string; // or consider `number` if parsed
  time: string; // e.g., "07:00:00" (HH:mm:ss)
  walking_distance_km: number;
}

interface RideAmount {
  id: number;
  amount: string; // or `number` if parsed (e.g., 210.00)
  distance_km: string; // or `number` (e.g., 28.75)
  duration_minutes: number;
}

interface Driver {
  id: number;
  name: string;
  avg_rating: string; // or `number` (e.g., 0.0)
  profile_image: string | null;
}

interface Vehicle {
  id: number;
  brand: number; // consider using an enum if brands are known
  color: string; // hex color like "#FFFFFF"
}

export interface Rides {
  rideId: number;
  pickup_stop: PickupDropStop;
  drop_stop: PickupDropStop;
  rideAmount: RideAmount;
  available_seats: number;
  driver: Driver;
  vehicle: Vehicle;
}


export interface RideDetail {
  rideId: {
    status: string; // e.g., "Active"
    is_edited: boolean;
    max_2_in_back: boolean;
    additional_notes: string | null;
    date: string; // Format: "DD-MM-YYYY" (e.g., "09-10-2025")
    id: number;
    available_seats: number;
  };
  pickUpStop: {
    address: string;
    lng: string; // longitude as string
    lat: string; // latitude as string
    id: number;
  };
  dropOffStop: {
    address: string;
    lng: string;
    lat: string;
    id: number;
  };
  rideAmount: {
    id: number;
    amount: string; // e.g., "210.00" (string for precision)
    distance_km: string; // e.g., "28.75"
    duration_minutes: number; // e.g., 68
  };
  driver: {
    profile_image: string | null;
    about: string | null;
    mobile_number: string; // e.g., "9048512163"
    country_code: string; // e.g., "+966"
    date_of_birth: string; // ISO 8601: "2005-03-04T00:00:00.000000Z"
    last_name: string;
    first_name: string;
    name: string; // full name
    id: number;
  };
  vehicle: {
    id: number;
    color: string; // hex color, e.g., "#FFFFFF"
    year: number;
    vehicleModel: {
      is_active: number; // 1 = active, 0 = inactive
      category_id: number;
      name: string; // e.g., "Civic"
      id: number;
      category_name: string; // e.g., "Sedan"
      vehicleBrand: {
        id: number;
        name: string; // e.g., "Honda"
        is_active: number;
      };
    };
  };
  passengers: unknown[]; // or define Passenger type if known
  serviceAmount: number; // e.g., 210
  vatPercentage: number; // e.g., 10
  platformFeePercentage: number; // e.g., 10
  vatAmount: number; // e.g., 21
  platformFeeAmount: number; // e.g., 21
  totalAmount: number; // e.g., 252
}