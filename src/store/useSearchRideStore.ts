import { create } from "zustand";

interface SearchRideState {
  from: string;
  to: string;
  setFrom: (value: string) => void;
  setTo: (value: string) => void;
  swapFromTo: () => void;
}

export const useSearchRideStore = create<SearchRideState>((set) => ({
  from: "",
  to: "",
  setFrom: (value) => set({ from: value }),
  setTo: (value) => set({ to: value }),
  swapFromTo: () => set((state) => ({ from: state.to, to: state.from })),
}));
