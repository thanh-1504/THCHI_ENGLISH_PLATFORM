import { create } from "zustand";

export const useChatWidgetStore = create((set) => ({
  isOpen: false,
  messages: [],
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  close: () => set({ isOpen: false }),
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
}));
