import { ChevronLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import authService from "../../services/auth.service";
const RESEND_DELAY = 60;
const MAX_RESEND = 4;

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const name = location.state?.name;
  const email = location.state?.email;
  const password = location.state?.password;
  const type = location.state?.type;
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_DELAY);
  const [canResend, setCanResend] = useState(false);
  const [resendCount, setResendCount] = useState(1);
  const [rateLimited, setRateLimited] = useState(false);
  const timerRef = useRef(null);
  const inputRef = useRef(null);

  if (!email) return <Navigate to="/login" replace />;

  useEffect(() => {
    startCountdown();
    return () => clearInterval(timerRef.current);
  }, []);

  const startCountdown = () => {
    setCanResend(false);
    setCountdown(RESEND_DELAY);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResend = async () => {
    if (!canResend || rateLimited) return;
    if (resendCount >= MAX_RESEND) {
      toast.error(
        `Bạn đã gửi OTP quá ${MAX_RESEND} lần. Vui lòng thử lại sau vài phút.`,
        { toastId: "otp_rate_limit" },
      );
      setRateLimited(true);
      setCanResend(false);
      return;
    }
    try {
      await authService.sendOtp({ email, type });
      setResendCount((prev) => prev + 1);
      startCountdown();
    } catch (error) {
      const status = error?.response?.status;
      const msg =
        error?.response?.data?.message ??
        "Gửi OTP thất bại. Vui lòng thử lại sau.";
      if (status === 429) {
        setRateLimited(true);
        setCanResend(false);
        clearInterval(timerRef.current);
      }
      toast.error(msg, { toastId: "otp_rate_limit" });
    }
  };

  const handleUpdateEmail = () => {
    navigate("/register-email");
  };

  const handleVerify = async () => {
    if (otp.trim().length === 0 || loading) return;
    setLoading(true);
    try {
      // Check OTP valid không
      const res = await authService.verifyOtp({
        email: email.trim(),
        code: otp,
        type,
      });
      // Valid thì mới tạo user
      if (res.statusText === "OK" && type === "REGISTER")
        await authService.register({ name, email, password });
      else if (type === "FORGOT_PASSWORD" && res.statusText === "OK") {
        navigate("/reset-password", {
          state: { email: email.trim(), token: res?.data?.token },
        });
      }
      if (type === "REGISTER") {
        navigate("/review");
      }
      setLoading(false);
    } catch (error) {
      console.log("Lỗi xác thực OTP:", error);
      const errorMessage = error.response?.data?.message;
      toast.error(errorMessage, {
        toastId: "otp error",
      });
      setLoading(false);
    }
  };

  const handleOtpChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(val);
  };

  const isReady = otp.trim().length > 0;
  return (
    <div className="bg-[#f0f0f0] w-full min-h-screen min-h-dvh overflow-x-hidden">
      <div className="w-full lg:w-[60%] min-h-screen min-h-dvh mx-auto bg-white">
        {/* ── Header ── */}
        <div className="bg-yellow-400 flex items-center px-4 py-3.5 sm:py-4 rounded-b-2xl relative">
          <button
            type="button"
            onClick={() => navigate("/register-email")}
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
          <h2 className="flex-1 text-center text-xl sm:text-2xl font-semibold text-gray-800 pr-9">
            Xác thực tài khoản
          </h2>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-col items-center gap-5 sm:gap-6 pt-7 sm:pt-12 pb-[calc(2.5rem+env(safe-area-inset-bottom))] px-5 sm:px-8 lg:px-12">
          {/* Description */}
          <p className="text-center text-gray-700 text-base sm:text-xl leading-relaxed px-1">
            Thchi đã gửi mã xác thực đến email:
            <br />
            <span className="font-bold text-gray-900 break-all">{email}</span>
          </p>

          {/* OTP Input */}
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            value={otp}
            onChange={handleOtpChange}
            placeholder="Nhập mã xác thực"
            autoFocus
            autoComplete="one-time-code"
            className="
              w-full max-w-md lg:w-[55%] lg:max-w-none border border-gray-200 rounded-xl px-4 py-3.5 sm:py-3
              text-gray-700 text-base outline-none text-center tracking-widest
              focus:border-amber-400 focus:ring-2 focus:ring-amber-100
              transition-all duration-150 bg-gray-50
            "
          />

          {/* Verify button */}
          <button
            onClick={handleVerify}
            disabled={!isReady || loading}
            className={`
              w-full max-w-md lg:w-[30%] lg:max-w-none py-3 rounded-2xl text-base font-semibold
              transition-all duration-200
              ${
                isReady && !loading
                  ? "bg-(image:--my-gradient) text-white shadow-[0_5px_0_#1f8f2f] hover:opacity-90 active:shadow-none active:translate-y-[3px] cursor-pointer"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }
            `}
          >
            {loading ? "Đang xác thực..." : "Xác thực email"}
          </button>

          {/* Resend section */}
          <div className="w-full max-w-md lg:max-w-none flex flex-col gap-2 text-center text-sm sm:text-base text-gray-600 mt-2">
            <p className="font-medium">Bạn không nhận được mã xác thực?</p>

            {/* 1. Cập nhật lại email */}
            <p>
              <span className="text-text-green font-semibold">1. </span>
              <button
                onClick={handleUpdateEmail}
                className="text-text-green font-semibold cursor-pointer hover:opacity-80 transition-opacity"
              >
                Cập nhật lại email
              </button>
            </p>

            {/* 2. Nhận 1 mã mới */}
            <p>
              <span className="text-text-green font-semibold">2. </span>
              {rateLimited ? (
                <span className="text-red-400 font-semibold">
                  Đã gửi quá {MAX_RESEND} lần — vui lòng thử lại sau vài phút
                </span>
              ) : canResend ? (
                <button
                  onClick={handleResend}
                  className="text-text-green font-semibold cursor-pointer hover:opacity-80 transition-opacity"
                >
                  Nhận 1 mã mới{" "}
                  <span className="text-gray-400 font-normal text-xs">
                    ({resendCount}/{MAX_RESEND} lần)
                  </span>
                </button>
              ) : (
                <button
                  disabled
                  className="text-gray-400 font-semibold cursor-not-allowed"
                >
                  Nhận 1 mã mới{" "}
                  <span className="font-normal">
                    (chờ{" "}
                    <span className="font-bold text-amber-500">
                      {countdown}s
                    </span>
                    )
                  </span>
                </button>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
