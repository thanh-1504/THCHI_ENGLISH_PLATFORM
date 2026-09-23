import { create } from "zustand";

const useSettingStore = create((set) => ({
  darkMode: false,
  setDarkMode: (darkMode) => set({ darkMode }),

  volume: 60,
  setVolume: (volume) => set({ volume }),
}));

export default useSettingStore;
