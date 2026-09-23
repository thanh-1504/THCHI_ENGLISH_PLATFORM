import { yupResolver } from "@hookform/resolvers/yup";
import { X } from "lucide-react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ForgotPasswordSchema from "../../schemas/forgot.password.schema";
import authService from "../../services/auth.service";
import useAuthStore from "../../store/useAuthStore";

const MAX_OTP_SENDS = 4;

const ForgotEmailModal = ({ onClose }) => {
  const navigate = useNavigate();
  const { email, setEmail, loading, setLoading } = useAuthStore();
  const [rateLimited, setRateLimited] = useState(false);
  const [rateLimitMsg, setRateLimitMsg] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
    resolver: yupResolver(ForgotPasswordSchema),
  });

  const handleForgotSubmit = async () => {
    if (!isValid || rateLimited) return;
    setLoading(true);
    try {
      await authService.sendOtp({ email, type: "FORGOT_PASSWORD" });
      setLoading(false);
      onClose();
      navigate("/verify-email", {
        state: { email: email.trim(), type: "FORGOT_PASSWORD" },
      });
    } catch (error) {
      const status = error?.response?.status;
      const msg =
        error?.response?.data?.message ??
        "Gửi mã thất bại. Vui lòng thử lại sau.";
      if (status === 429) {
        setRateLimited(true);
        setRateLimitMsg(msg);
      } else {
        toast.error(msg, { toastId: "forgot_otp_error" });
      }
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
    if (e.key === "Escape") onClose();
  };

  return createPortal(
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 z-[60]" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-[61] pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl min-w-96 pointer-events-auto relative px-8 pt-10 pb-8 flex flex-col gap-6">
          {/* Close button */}
          <button
            onClick={onClose}
            className="
              absolute -top-4 right-3
              p-1 rounded-full bg-white
              cursor-pointer
              shadow-[0_3px_0_rgba(0,0,0,0.15)]
              active:translate-y-[3px] active:shadow-none
              transition-all duration-150
            "
          >
            <X strokeWidth={3.5} size={25} className="text-yellow-400" />
          </button>

          {/* Title */}
          <h2 className="text-lg font-semibold text-gray-800 text-center leading-snug">
            Nhập email chính xác để nhận mã xác thực
          </h2>
          <form onSubmit={handleSubmit(handleForgotSubmit)}>
            {/* Email input */}
            <input
              {...register("email", {
                onChange: (e) => setEmail(e.target.value),
              })}
              type="email"
              onKeyDown={handleKeyDown}
              placeholder="Nhập email tài khoản học"
              autoFocus
              className="
              w-full border border-gray-200 rounded-xl px-4 py-3
              text-gray-700 text-base outline-none
              focus:border-amber-400 focus:ring-2 focus:ring-amber-100
              transition-all duration-150 bg-gray-50
            "
            />

            {/* Error message */}
            {errors?.email && (
              <p className="text-red-400 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
            {/* Rate limit error */}
            {rateLimited && (
              <div className="mt-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-500 text-sm text-center">
                🚫 {rateLimitMsg || `Bạn đã gửi OTP quá ${MAX_OTP_SENDS} lần. Vui lòng thử lại sau vài phút.`}
              </div>
            )}
            {/* Submit button */}
            <button
              type="submit"
              disabled={!isValid || loading || rateLimited}
              className={`p-3 rounded-2xl text-base font-semibold
              transition-all duration-200 w-[50%] mx-auto mt-5 flex justify-center
              ${
                isValid && !loading && !rateLimited
                  ? "bg-(image:--my-gradient) text-white shadow-[0_5px_0_#1f8f2f] hover:opacity-90 active:shadow-none active:translate-y-[3px] cursor-pointer"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }
            `}
            >
              {loading ? "Đang gửi..." : "Nhận mã ngay"}
            </button>
          </form>
        </div>
      </div>
    </>,
    document.body,
  );
};

export default ForgotEmailModal;
