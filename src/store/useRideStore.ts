import { useCreateRide } from '@/service/ride-booking'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface RideData {
  pickup_lat: number
  pickup_lng: number
  pickup_address: string
  destination_lat: number
  destination_lng: number
  destination_address: string
  departure_time: string
  available_seats: number
  price_per_seat: number
  notes?: string
  vehicle_id: number
  date: string
  time: string
  max_2_in_back: boolean
  segmentPrices?: number[] // 👈 ADDED
  stops?: { address: string; lat: number; lng: number; order: number }[]
  prices?: { pickup_order: number; drop_order: number; amount: number }[]
}

interface SelectedPlace {
  lat: number
  lng: number
  address: string
}

interface CreateRideStore {
  ride: RideData
  loading: boolean
  error: string | null
  success: boolean
  polyline: string
  selectedPlaces: SelectedPlace[]
  setPolyline: (polyline: string) => void
  setRideField: <K extends keyof RideData>(key: K, value: RideData[K]) => void
  resetRide: () => void
  createRide: () => Promise<void>
  setSelectedPlaces: (places: SelectedPlace[]) => void
}

const defaultRide: RideData = {
  pickup_lat: 24.7136,
  pickup_lng: 46.6753,
  pickup_address: 'King Fahd Road, Riyadh',
  destination_lat: 24.7136,
  destination_lng: 46.6753,
  destination_address: 'King Khalid International Airport',
  departure_time: '2025-10-01T08:00:00Z',
  date: "",
  time: "",
  available_seats: 3,
  price_per_seat: 25.5,
  notes: 'Non-smoking ride',
  vehicle_id: 1,
  max_2_in_back: false,
  segmentPrices: undefined, // optional
  stops: [],
  prices: [],
}

export const useCreateRideStore = create<CreateRideStore>()(
  devtools((set, get) => ({
    ride: defaultRide,
    loading: false,
    error: null,
    success: false,
    polyline: '',
    selectedPlaces: [],

    setPolyline: (polyline: string) => set({ polyline }),

    setSelectedPlaces: (places) => set({ selectedPlaces: places }),

    setRideField: (key, value) =>
      set((state) => ({
        ride: { ...state.ride, [key]: value },
      })),

    resetRide: () =>
      set({
        ride: defaultRide,
        loading: false,
        error: null,
        success: false,
        selectedPlaces: [],
        polyline: '',
      }),
  }))
)