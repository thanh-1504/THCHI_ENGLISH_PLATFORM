import { useEffect } from "react";
import authService from "../services/auth.service";
import useAuthStore from "../store/useAuthStore";

const AuthProvider = ({ children }) => {
  const { setUser } = useAuthStore();
  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await authService.getMe();
        setUser(res.data);
      } catch (error) {
        setUser(null);
      }
    };
    initAuth();
  }, []);
  return children;
};
export default AuthProvider;
