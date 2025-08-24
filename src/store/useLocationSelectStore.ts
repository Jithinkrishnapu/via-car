import { create } from "zustand";

interface LocationSelectState {
  selectedValue: string;
  searchValue: string;
  setSelectedValue: (value: string) => void;
  setSearchValue: (value: string) => void;
}

export const useLocationSelectStore = create<LocationSelectState>((set) => ({
  selectedValue: "",
  searchValue: "",
  setSelectedValue: (value) => set({ selectedValue: value }),
  setSearchValue: (value) => set({ searchValue: value }),
}));
