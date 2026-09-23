import axios from "axios";
import useAuthStore from "../store/useAuthStore";

const baseURL =
  import.meta.env.MODE === "production"
    ? import.meta.env.VITE_SERVER_URL
    : import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

let isRefreshing = false;
let refreshQueue = [];
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthCheckRoute =
      originalRequest.url.includes("/auth/me") ||
      originalRequest.url.includes("/auth/refresh-token");
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthCheckRoute
    ) {
      originalRequest._retry = true;
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push(() => resolve(api(originalRequest)));
        });
      }
      isRefreshing = true;
      try {
        const refreshRes = await api.post("/auth/refresh-token");
        useAuthStore.getState().setTokens({
          accessToken: refreshRes.data.accessToken,
          refreshToken: refreshRes.data.refreshToken,
        });
        const res = await api.get("/auth/me");
        useAuthStore.getState().setUser(res.data);
        refreshQueue.forEach((cb) => cb());
        refreshQueue = [];
        isRefreshing = false;
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        refreshQueue = [];
        useAuthStore.getState().logout();
        window.location.replace("/login");
        return new Promise(() => {});
      }
    }
    return Promise.reject(error);
  },
);

export default api;
