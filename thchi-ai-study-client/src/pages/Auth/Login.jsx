import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import GoogleIcon from "../../components/icons/GoogleIcon";
import ForgotEmailModal from "../../components/modals/ForgotEmailModal";
import LoginSchema from "../../schemas/login.schema";
import authService from "../../services/auth.service";
import useAuthStore from "../../store/useAuthStore";
import useUIStore from "../../store/useUIStore";
const Login = () => {
  const { setUser, setTokens } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(LoginSchema),
    mode: "onChange",
  });
  const { showForgotModal, setShowForgotModal } = useUIStore();

  const handleLogin = async (data) => {
    if (!isValid) return;
    setLoading(true);
    try {
      const loginRes = await authService.login({ email: data.email, password: data.password });
      setTokens({
        accessToken: loginRes.data.accessToken,
        refreshToken: loginRes.data.refreshToken,
      });
      const res = await authService.getMe();
      setUser(res.data);
      navigate("/review");
    } catch (error) {
      const errorMessage = error.response?.data?.message;
      toast.error(errorMessage, {
        toastId: "login error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const errosMessage = searchParams.get("error");
    if (errosMessage) {
      toast.error(errosMessage, {
        toastId: "google login error",
      });
    }
    searchParams.delete("error");
    setSearchParams(searchParams, { replace: true });
  }, [searchParams, setSearchParams]);
  return (
    <div className="bg-[#f0f0f0] w-full min-h-screen">
      <div className="w-full lg:w-[60%] min-h-screen mx-auto bg-white">
        {/* Login Header */}
        <div className="bg-yellow-400 text-center py-4 rounded-b-2xl">
          <h2 className="text-xl sm:text-2xl font-semibold">Đăng nhập</h2>
        </div>

        <div className="px-5 sm:px-8 lg:px-0 pb-10 lg:pb-0">
          {/* Login With Google Account */}
          <div className="mt-6 sm:mt-8 mb-5">
            <h2 className="text-center text-xl sm:text-2xl font-semibold mb-5 leading-snug px-1">
              Đăng nhập tài khoản học ThChi
            </h2>
            <button
              type="button"
              onClick={() => {
                window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
              }}
              className="
              w-full sm:w-auto lg:min-w-66
              flex items-center justify-center gap-x-4 sm:gap-x-5
              mx-auto
              bg-[#d21919] text-white
              rounded-3xl px-4 py-2.5 sm:p-2
              shadow-[0_5px_0_rgb(255,210,210)]
              active:translate-y-[6px] active:shadow-none
              transition-all duration-100
              cursor-pointer
              "
            >
              <GoogleIcon />
              <span className="font-semibold text-sm sm:text-base">
                Đăng nhập với G+
              </span>
            </button>
            <p className="uppercase text-center mt-5 text-lg sm:text-xl font-semibold">
              HOẶC
            </p>
          </div>

          {/* Login With Email And Password */}
          <form
            onSubmit={handleSubmit(handleLogin)}
            className="flex flex-col gap-y-4 sm:gap-y-5"
          >
            <div className="w-full lg:w-[45%] mx-auto flex flex-col gap-y-1">
              <input
                {...register("email")}
                type="email"
                placeholder="Nhập email tài khoản"
                className="w-full rounded-xl p-3.5 sm:p-4 outline-none bg-gray-100 text-base"
              />
              {errors.email?.message && (
                <span className="text-red-500 text-sm text-left">
                  {errors.email.message}
                </span>
              )}
            </div>
            <div className="w-full lg:w-[45%] mx-auto flex flex-col gap-y-1">
              <input
                {...register("password")}
                type="password"
                placeholder="Nhập chính xác mật khẩu của bạn"
                className="w-full rounded-xl p-3.5 sm:p-4 outline-none bg-gray-100 text-base"
              />
              {errors.password?.message && (
                <span className="text-red-500 text-sm text-left">
                  {errors.password.message}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`
              w-full sm:w-auto lg:min-w-60
              flex items-center justify-center gap-x-5
              mx-auto
              bg-(image:--my-gradient) text-white
              rounded-3xl px-6 py-2.5 sm:p-2
              shadow-[0_5px_0_#1c8c2c]
              active:translate-y-[6px] active:shadow-none
              transition-all duration-100
              cursor-pointer font-semibold text-base sm:text-lg
              disabled:opacity-70 disabled:cursor-not-allowed
              `}
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          {/* Forgot Password And Register */}
          <div className="mt-8 flex flex-col gap-y-3 px-1">
            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="text-center text-blue-400 font-normal underline cursor-pointer hover:text-blue-600 transition-colors"
            >
              Quên mật khẩu?
            </button>
            <div className="text-center text-sm sm:text-base leading-relaxed">
              <span>Chưa có tài khoản?</span>{" "}
              <Link
                to={"/register"}
                className="text-blue-600 font-semibold underline cursor-pointer hover:opacity-80 transition-opacity"
              >
                Tạo tài khoản học mới
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot password modal */}
      {showForgotModal && (
        <ForgotEmailModal onClose={() => setShowForgotModal(false)} />
      )}
    </div>
  );
};

export default Login;
