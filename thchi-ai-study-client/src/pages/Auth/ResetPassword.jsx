import { yupResolver } from "@hookform/resolvers/yup";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import ResetPasswordSchema from "../../schemas/reset.password.schema";
import authService from "../../services/auth.service";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const token = location.state?.token;

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
    resolver: yupResolver(ResetPasswordSchema),
  });

  const handleResetPassword = async (data) => {
    if (!isValid || loading) return;
    setLoading(true);
    try {
      await authService.resetPassword({
        token,
        password: data.password,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f0f0f0] w-full min-h-screen">
      <div className="w-[60%] min-h-screen mx-auto bg-white">
        {/* ── Header ── */}
        <div className="bg-yellow-400 flex items-center px-4 py-4 rounded-b-2xl relative">
          <button
            onClick={() => navigate(-1)}
            className="
              w-9 h-9 flex items-center justify-center
              rounded-full bg-white
              cursor-pointer
              shadow-[0_3px_0_rgba(0,0,0,0.12)]
              active:translate-y-[3px] active:shadow-none
              transition-all duration-150
            "
          >
            <ChevronLeft
              size={20}
              className="text-gray-600"
              strokeWidth={2.5}
            />
          </button>
          <h2 className="flex-1 text-center text-2xl font-semibold text-gray-800 pr-9">
            Tạo mật khẩu mới
          </h2>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-col items-center gap-6 pt-12 px-12">
          {success ? (
            /* Success state */
            <div className="flex flex-col items-center gap-4 mt-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-center text-gray-800 text-xl font-semibold">
                Đặt lại mật khẩu thành công!
              </p>
              <p className="text-center text-gray-500 text-base">
                Đang chuyển hướng về trang đăng nhập...
              </p>
            </div>
          ) : (
            <>
              {/* Description */}
              <p className="text-center text-gray-700 text-xl leading-relaxed">
                Tạo mật khẩu mới cho tài khoản
                <br />
                <span className="font-bold text-text-green">{email}</span>
              </p>

              {/* Form */}
              <form
                onSubmit={handleSubmit(handleResetPassword)}
                className="w-full flex flex-col items-center gap-4"
              >
                {/* New password */}
                <div className="w-[55%] relative">
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu mới"
                    autoFocus
                    className="
                      w-full border border-gray-200 rounded-xl px-4 py-3 pr-11
                      text-gray-700 text-base outline-none
                      focus:border-amber-400 focus:ring-2 focus:ring-amber-100
                      transition-all duration-150 bg-gray-50
                    "
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors?.password && (
                  <p className="text-red-400 text-sm -mt-2 w-[55%]">
                    {errors.password.message}
                  </p>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={!isValid || loading}
                  className={`
                    w-[35%] py-3 mt-2 rounded-2xl text-base font-semibold
                    transition-all duration-200
                    ${
                      isValid && !loading
                        ? "bg-(image:--my-gradient) text-white shadow-[0_5px_0_#1f8f2f] hover:opacity-90 active:shadow-none active:translate-y-[3px] cursor-pointer"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }
                  `}
                >
                  {loading ? "Đang xử lý..." : "Tiếp tục"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
