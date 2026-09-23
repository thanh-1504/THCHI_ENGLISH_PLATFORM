import { yupResolver } from "@hookform/resolvers/yup";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import LoginSchema from "../../schemas/login.schema";
import authService from "../../services/auth.service";
import useAuthStore from "../../store/useAuthStore";

const AdminLogin = () => {
  const navigate = useNavigate();
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(LoginSchema),
    mode: "onChange",
  });
  const { showPassword, setShowPassword } = useAuthStore();

  const handleLogin = async (data) => {
    if (!isValid) return;
    try {
      await authService.login({
        email: data.email,
        password: data.password,
        isAdminPage: true,
      });
      navigate("/admin/dashboard");
    } catch (error) {
      const errMessage = error.response?.data.message || "Đăng nhập thất bại";
      toast.error(errMessage, {
        toastId: "login-error",
        position: "top-center",
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin(e);
  };
  return (
    <>
      <div className="w-full min-h-screen flex items-center justify-center relative overflow-hidden bg-[#f0f0f0]">
        <div className="relative w-full max-w-md mx-4 rounded-3xl overflow-hidden bg-white">
          <div className="px-8 py-10 flex flex-col gap-7">
            <div className="flex flex-col items-center gap-4">
              <div className="text-center">
                <h1 className="text-2xl font-black tracking-tight text-yellow-400">
                  ThChi Admin
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  Cổng quản trị hệ thống
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <span className="text-gray-600 text-sm font-medium tracking-widest uppercase">
                Đăng nhập
              </span>
            </div>

            <form
              onSubmit={handleSubmit(handleLogin)}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5">
                <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider pl-1">
                  Email
                </label>
                <div className="relative group">
                  <Mail
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 transition-colors duration-200"
                  />
                  <input
                    type="email"
                    {...register("email")}
                    placeholder="admin@thchi.edu.vn"
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-3.5 rounded-xl text-sm outline-none placeholder-gray-400 border border-[rgba(255,255,255,0.1)] focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all duration-150 bg-gray-50"
                  />
                </div>
                {errors.email?.message && (
                  <p className="text-red-400 text-sm">{errors.email.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider pl-1">
                  Mật khẩu
                </label>
                <div className="relative group">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 transition-colors duration-200"
                  />
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full pl-10 pr-10 py-3.5 rounded-xl text-sm outline-none placeholder-gray-400 border border-[rgba(255,255,255,0.1)] focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all duration-150 bg-gray-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors duration-150 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password?.message && (
                  <p className="text-red-400 text-sm">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <button
                id="admin-login-btn"
                type="submit"
                className={`relative w-full py-3.5 rounded-xl text-sm font-bold text-white overflow-hidden bg-(image:--my-gradient) shadow-[0_5px_0_#1f8f2f] hover:opacity-90 cursor-pointer active:translate-y-1 active:shadow-[0_0px_0_#1f8f2f] transition-all duration-100`}
              >
                Đăng nhập
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;
