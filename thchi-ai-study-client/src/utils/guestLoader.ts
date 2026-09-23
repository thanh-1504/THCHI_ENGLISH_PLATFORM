import { redirect } from "react-router-dom";
import authService from "../services/auth.service";

export const guestLoader = async () => {
  try {
    const isLogin = await authService.getMe();
    if (isLogin.data) return redirect("/review");
    return null;
  } catch (error) {
    return null;
  }
};
