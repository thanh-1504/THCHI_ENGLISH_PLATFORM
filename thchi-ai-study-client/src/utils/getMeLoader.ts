import { redirect } from "react-router-dom";
import authService from "../services/auth.service";

export const getMeLoader = async () => {
  try {
    const currentUser = await authService.getMe();

    if (!currentUser.data) return redirect("/login");
    if (currentUser.data?.role !== "ADMIN") return redirect("/review");
    return currentUser.data;
  } catch (error) {
    return redirect("/admin/login");
  }
};