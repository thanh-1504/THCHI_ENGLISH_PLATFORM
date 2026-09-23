import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import GoogleIcon from "../../components/icons/GoogleIcon";

const RegisterMethod = () => {
  const navigate = useNavigate();

  const handleGoogleRegister = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  const handleEmailRegister = () => {
    navigate("/register-email");
  };

  return (
    <div className="bg-[#f0f0f0] w-full min-h-screen min-h-dvh overflow-x-hidden">
      <div className="w-full lg:w-[60%] min-h-screen min-h-dvh mx-auto bg-white flex flex-col">
        {/* ── Header ── */}
        <div className="bg-yellow-400 flex items-center px-4 py-3.5 sm:py-4 rounded-b-2xl shrink-0">
          <button
            type="button"
            onClick={() => navigate("/login")}
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
            Tạo tài khoản mới
          </h2>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-col items-center gap-5 pt-6 sm:pt-10 pb-[calc(2.5rem+env(safe-area-inset-bottom))] sm:pb-10 px-5 sm:px-8 lg:px-10 flex-1">
          {/* Question */}
          <p className="text-center text-lg sm:text-xl font-semibold text-gray-800 leading-snug">
            Bạn muốn tạo tài khoản
            <br />
            bằng cách nào nhỉ?
          </p>

          <div className="text-6xl sm:text-7xl select-none py-2 sm:py-4">🎉</div>

          {/* Google button */}
          <button
            onClick={handleGoogleRegister}
            className="
              w-full max-w-md lg:w-[40%] lg:max-w-none flex items-center justify-center gap-3 lg:gap-4
              bg-[#d21919] text-white
              rounded-3xl py-3 px-4 lg:px-6
              shadow-[0_5px_0_rgb(255,210,210)]
              active:translate-y-[5px] active:shadow-none
              transition-all duration-100
              cursor-pointer font-semibold text-base
            "
          >
            <GoogleIcon />
            <span>Tạo tài khoản với G+</span>
          </button>

          {/* Divider */}
          <p className="uppercase font-bold tracking-widest ">HOẶC</p>

          {/* Email register */}
          <button
            onClick={handleEmailRegister}
            className="
              w-full max-w-md lg:w-[40%] lg:max-w-none flex items-center justify-center gap-3 lg:gap-4
              bg-white text-black
              rounded-3xl py-3 px-4 lg:px-6
              shadow-[0_2px_2px_rgba(0,0,0,0.12)]
              active:translate-y-[5px] active:shadow-none
              transition-all duration-100
              cursor-pointer font-semibold text-base
            "
          >
            Tự tạo tài khoản với email
          </button>

          {/* Footer */}
          <p className="w-full mt-auto pt-4 text-center text-sm sm:text-base">
            Bạn đã có tài khoản?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-blue-500 font-semibold underline underline-offset-2 cursor-pointer hover:opacity-80 transition-opacity"
            >
              Đăng nhập ngay
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterMethod;
