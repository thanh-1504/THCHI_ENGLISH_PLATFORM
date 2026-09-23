import api from "../lib/axios";
export const authService = {
  login: (data) => api.post("/auth/login", data, { withCredentials: true }),
  getMe: () => api.get("/auth/me"),
  logout: () => api.post("/auth/logout"),
  register: (data) => api.post("/auth/register", data),
  sendOtp: (data) => api.post("/auth/send-otp", data),
  verifyOtp: (data) => api.post("/auth/verify-otp", data),
  loginGoogle: () => api.get("/auth/google"),
  forgotPassword: (data) => api.post("/auth/forgot-password", data),
  resetPassword: (data) => api.post("/auth/reset-password", data),
  changePassword: (data) => api.post("/user/change-password", data),
};
export default authService;
