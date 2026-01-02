import { create } from 'zustand';

interface SearchRideState {
  from: string;
  to: string;
  from_lat_long: { lat: number; lon: number };
  to_lat_long: { lat: number; lon: number };
  setFrom: (value: string) => void;
  setTo: (value: string) => void;
  setFromLatLong: (lat: number, lon: number) => void;
  setToLatLong: (lat: number, lon: number) => void;
  swapFromTo: () => void;
}

export const useSearchRideStore = create<SearchRideState>((set) => ({
  from: "",
  to: "",
  from_lat_long: { lat: 0, lon: 0 }, // Initialize with default values
  to_lat_long: { lat: 0, lon: 0 },   // Initialize with default values

  setFrom: (value) => set({ from: value }),
  setTo: (value) => set({ to: value }),

  setFromLatLong: (lat, lon) => set({ from_lat_long: { lat, lon } }),
  setToLatLong: (lat, lon) => set({ to_lat_long: { lat, lon } }),
  setFromWithCoords: (value: string, lat: number, lon: number) =>
    set({ from: value, from_lat_long: { lat, lon } }),
  swapFromTo: () =>
    set((state) => ({
      from: state.to,
      to: state.from,
      from_lat_long: state.to_lat_long,
      to_lat_long: state.from_lat_long,
    })),
}));