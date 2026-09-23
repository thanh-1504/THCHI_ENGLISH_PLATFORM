import { CheckCircle, Home, RefreshCcw, XCircle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

const PaymentResultPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const isSuccess = searchParams.get("isSuccess");

  return (
    <div className="min-h-screen bg-[#f4f7f6] flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.08)] max-w-[480px] w-full p-10 flex flex-col items-center text-center">
        {/* Icon */}
        <div
          className={`mb-6 rounded-full p-5 ${
            isSuccess ? "bg-green-50" : "bg-red-50"
          }`}
        >
          {isSuccess ? (
            <CheckCircle
              size={64}
              className="text-[#1eb54b]"
              strokeWidth={1.5}
            />
          ) : (
            <XCircle size={64} className="text-red-500" strokeWidth={1.5} />
          )}
        </div>

        {/* Tiêu đề */}
        <h1
          className={`text-2xl font-bold mb-2 ${
            isSuccess ? "text-gray-900" : "text-gray-900"
          }`}
        >
          {isSuccess ? "Thanh toán thành công!" : "Thanh toán thất bại"}
        </h1>

        {/* Mô tả */}
        <p className="text-gray-500 text-sm mb-8">
          {isSuccess
            ? "Cảm ơn bạn đã nâng cấp! Gói Premium đã được kích hoạt cho tài khoản của bạn."
            : "Giao dịch không thành công. Vui lòng thử lại hoặc liên hệ hỗ trợ nếu vấn đề vẫn tiếp tục."}
        </p>

        {/* Nút hành động */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          {!isSuccess && (
            <button
              onClick={() => navigate(-2)}
              className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-700 font-semibold py-3 rounded-2xl hover:bg-gray-50 transition-all cursor-pointer"
            >
              <RefreshCcw size={16} />
              Thử lại
            </button>
          )}
          <button
            onClick={() => navigate("/review")}
            className="flex-1 flex items-center justify-center gap-2 bg-[#1eb54b] text-white font-semibold py-3 rounded-2xl hover:bg-[#18a042] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Home size={16} />
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentResultPage;
