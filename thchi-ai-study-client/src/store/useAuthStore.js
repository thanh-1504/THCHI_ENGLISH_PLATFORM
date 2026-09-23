import { create } from "zustand";

const useAuthStore = create((set) => ({
  email: "",
  setEmail: (email) => set({ email }),
  loading: false,
  setLoading: (loading) => set({ loading }),
  name: "",
  setName: (name) => set({ name }),
  password: "",
  setPassword: (password) => set({ password }),
  showPassword: false,
  setShowPassword: (showPassword) => set({ showPassword }),
  showConfirmModal: false,
  setShowConfirmModal: (showConfirmModal) => set({ showConfirmModal }),
  accessToken: null,
  refreshToken: null,
  user: null,
  isLoggedin: false,
  setTokens: ({ accessToken, refreshToken }) => {
    set({ accessToken, refreshToken });
  },
  user: null,
  setUser: (user) => set({ user }),
  logout: () => {
    set({ accessToken: null, refreshToken: null, user: null });
  },
}));

export default useAuthStore;
