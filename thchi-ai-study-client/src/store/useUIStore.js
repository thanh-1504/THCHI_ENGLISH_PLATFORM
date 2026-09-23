import { create } from "zustand";

const useUIStore = create((set) => ({
  isOpenModal: false,
  isOpenModalComment: false,
  isOpenDropdown: false,
  isSelectedCourse: false,
  selectedTopicId: "",
  isOpenAchievementModal: false,
  isOpenSettingModal: false,
  showForgotModal: false,
  setShowForgotModal: (value) => set({ showForgotModal: value }),
  setIsOpenDropdown: (value) => set({ isOpenDropdown: value }),
  setIsOpenModal: () => set((state) => ({ isOpenModal: !state.isOpenModal })),
  setIsOpenModalComment: (value) => set({ isOpenModalComment: value }),
  setIsSelectedCourse: (value) => set({ isSelectedCourse: value }),
  setSelectedTopicId: (value) => set({ selectedTopicId: value }),
  setIsOpenAchievementModal: (value) => set({ isOpenAchievementModal: value }),
  setIsOpenSettingModal: (value) => set({ isOpenSettingModal: value }),
}));
export default useUIStore;
