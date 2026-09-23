import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";

const AdminGuard = () => {
  const { user } = useAuthStore();
  if (!user || user.role !== "ADMIN") {
    return <Navigate to="/review" replace />;
  }

  return <Outlet />;
};

export default AdminGuard;
