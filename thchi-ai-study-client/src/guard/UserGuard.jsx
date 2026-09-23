import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";

const UserGuard = () => {
  const { user } = useAuthStore();

  if (user && user.role === "ADMIN") {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return (
    <>
      <Outlet />
    </>
  );
};

export default UserGuard;
