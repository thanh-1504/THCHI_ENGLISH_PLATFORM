import {
  ArrowRightLeft,
  BookOpen,
  House,
  LogOut,
  Menu,
  Newspaper,
  Settings,
  UserRoundCog,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import PremiumIcon from "../components/icons/PremiumIcon";
import useAuthStore from "../store/useAuthStore";
import authService from "../services/auth.service";


const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-x-3 cursor-pointer pl-8 py-3 rounded-lg transition-colors duration-150 ${
      isActive
        ? "bg-white text-yellow-500 font-semibold"
        : "hover:bg-yellow-500 text-black font-medium"
    }`;

  const getCourseClass = () => {
    const isCourseRoute =
      location.pathname.startsWith("/admin/courses") ||
      location.pathname.startsWith("/admin/lessons");

    return `flex items-center gap-x-3 cursor-pointer pl-8 py-3 rounded-lg transition-colors duration-150 hover:text-white ${
      isCourseRoute
        ? "bg-white text-yellow-500 font-semibold"
        : "hover:bg-yellow-500 text-black font-medium"
    }`;
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    navigate("/admin/login");
  };

  useEffect(() => {
    if (!isMobileMenuOpen) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsMobileMenuOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isMobileMenuOpen]);

  return (
    <div className="min-h-screen flex">
      <aside className="hidden lg:flex sticky top-0 h-screen min-w-[20%] max-w-[20%] bg-yellow-400 px-2 flex-col pb-4">

        <div>
          {/* User Information */}
          <div className="flex items-center justify-center gap-x-2 pt-5">
            <img
              className="w-13 h-13 object-cover rounded-full"
              src="https://plus.unsplash.com/premium_photo-1688676796006-bbd1599bbfb6?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="User avatar"
            />
            <div>
              <p className="text-black font-medium">Dương Nhật Thành</p>
              <p className="text-black font-medium text-sm text-center">
                Administrator
              </p>
            </div>
          </div>

          <nav className="flex flex-col mt-5">
            {/* Dashboard */}
            <NavLink to="/admin/dashboard" className={navLinkClass}>
              <House size={21} />
              <span>Dashboard</span>
            </NavLink>

            {/* Người dùng */}
            <NavLink to="/admin/users" className={navLinkClass}>
              <UserRoundCog size={21} />
              <span>Người dùng</span>
            </NavLink>

            {/* Gói Premium */}
            <NavLink to="/admin/premiums" className={navLinkClass}>
              <PremiumIcon />
              <span>Gói Premium</span>
            </NavLink>

            {/* Giao dịch */}
            <NavLink to="/admin/transaction" className={navLinkClass}>
              <ArrowRightLeft size={21} />
              <span>Giao dịch</span>
            </NavLink>

            {/* Khóa học & Bài học */}
            <NavLink to="/admin/courses" className={getCourseClass}>
              <BookOpen size={21} />
              <span>Khóa học &amp; Bài học</span>
            </NavLink>

            {/* Cài đặt hệ thống */}
            <NavLink to="/admin/posts" className={navLinkClass}>
              <Newspaper size={21} />
              <span>Bài viết</span>
            </NavLink>

            <NavLink to="/admin/rank-config" className={navLinkClass}>
              <Settings size={21} />
              <span>Cấu hình xếp hạng</span>
            </NavLink>
          </nav>
        </div>

        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-x-3 cursor-pointer pl-8 py-3 rounded-lg transition-colors duration-150 text-black font-medium hover:bg-red-500 hover:text-white"
          >
            <LogOut size={21} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="lg:hidden sticky top-0 z-40 h-14 px-4 bg-yellow-400 flex items-center justify-between shadow-sm">
          <button
            type="button"
            aria-label="Mở menu quản trị"
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(true)}
            className="w-10 h-10 inline-flex items-center justify-center rounded-xl text-black hover:bg-yellow-500 active:scale-95 transition"
          >
            <Menu size={24} />
          </button>
          <p className="font-bold text-gray-800">THCHI Admin</p>
          <img
            className="w-8 h-8 object-cover rounded-full"
            src="https://plus.unsplash.com/premium_photo-1688676796006-bbd1599bbfb6?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fA%3D%3D"
            alt="User avatar"
          />
        </header>

        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Đóng menu quản trị"
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/40"
            />
            <aside
              role="dialog"
              aria-modal="true"
              aria-label="Menu quản trị"
              className="relative h-full w-[80vw] max-w-80 bg-yellow-400 px-2 flex flex-col pb-4 overflow-y-auto shadow-xl animate-[slideInLeft_0.2s_ease-out]"
            >
              <button
                type="button"
                aria-label="Đóng menu quản trị"
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-3 right-3 w-10 h-10 inline-flex items-center justify-center rounded-xl text-black hover:bg-yellow-500 active:scale-95 transition"
              >
                <X size={22} />
              </button>

              <div>
                <div className="flex items-center justify-center gap-x-2 pt-5">
                  <img
                    className="w-13 h-13 object-cover rounded-full"
                    src="https://plus.unsplash.com/premium_photo-1688676796006-bbd1599bbfb6?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fA%3D%3D"
                    alt="User avatar"
                  />
                  <div>
                    <p className="text-black font-medium">Dương Nhật Thành</p>
                    <p className="text-black font-medium text-sm text-center">
                      Administrator
                    </p>
                  </div>
                </div>

                <nav className="flex flex-col mt-5" aria-label="Điều hướng quản trị">
                  <NavLink
                    to="/admin/dashboard"
                    className={navLinkClass}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <House size={21} />
                    <span>Dashboard</span>
                  </NavLink>
                  <NavLink
                    to="/admin/users"
                    className={navLinkClass}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <UserRoundCog size={21} />
                    <span>Người dùng</span>
                  </NavLink>
                  <NavLink
                    to="/admin/premiums"
                    className={navLinkClass}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <PremiumIcon />
                    <span>Gói Premium</span>
                  </NavLink>
                  <NavLink
                    to="/admin/transaction"
                    className={navLinkClass}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <ArrowRightLeft size={21} />
                    <span>Giao dịch</span>
                  </NavLink>
                  <NavLink
                    to="/admin/courses"
                    className={getCourseClass}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <BookOpen size={21} />
                    <span>Khóa học &amp; Bài học</span>
                  </NavLink>
                  <NavLink
                    to="/admin/posts"
                    className={navLinkClass}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Newspaper size={21} />
                    <span>Bài viết</span>
                  </NavLink>
                  <NavLink
                    to="/admin/rank-config"
                    className={navLinkClass}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Settings size={21} />
                    <span>Cấu hình xếp hạng</span>
                  </NavLink>
                </nav>
              </div>

              <div className="mt-auto">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-x-3 cursor-pointer pl-8 py-3 rounded-lg transition-colors duration-150 text-black font-medium hover:bg-red-500 hover:text-white"
                >
                  <LogOut size={21} />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </aside>
          </div>
        )}

        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
