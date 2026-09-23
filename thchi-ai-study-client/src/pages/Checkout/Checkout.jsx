import { Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import premiumService from "../../services/premium.service";
import transactionService from "../../services/transaction.service";
import useAuthStore from "../../store/useAuthStore";
import { PAYMENT_METHODS } from "../../utils/config.constant";
import SepayQrModal from "./SepayQrModal";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const plan = location.state?.plan;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState("SEPAY");
  const [sepayData, setSepayData] = useState(null);

  useEffect(() => {
    if (!plan) navigate("/premium");
  }, [plan, navigate]);

  if (!plan) return null;

  const originalPrice = Number(plan.originalPrice || plan.price);
  const finalPrice = Number(plan.price);
  const discount = originalPrice - finalPrice;

  const handleSepayPayment = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await transactionService.create({
        planId: plan.id,
        amount: finalPrice,
        paymentGateway: "SEPAY",
      });
      setSepayData(data);
    } catch (err) {
      console.error("Lỗi tạo giao dịch SePay:", err);

      const errorData = err?.response?.data?.message || err?.response?.data;
      let errorMessage = "Có lỗi xảy ra khi tạo thanh toán. Vui lòng thử lại.";

      if (typeof errorData === "string") {
        errorMessage = errorData;
      } else if (typeof errorData === "object" && errorData?.message) {
        errorMessage = errorData.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVnpayPayment = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await transactionService.create({
        planId: plan.id,
        amount: finalPrice,
        paymentGateway: "VNPAY",
      });
      const paymentUrl = await premiumService.createPaymentUrl({
        orderId: res.transaction.id,
        amount: finalPrice,
        orderInfo: `Thanh toan goi ${plan.name} - THCHIVOCAB`,
      });
      window.location.href = paymentUrl;
    } catch (err) {
      const errorData = err?.response?.data?.message || err?.response?.data;
      let errorMessage = "Có lỗi xảy ra khi tạo thanh toán. Vui lòng thử lại.";

      if (typeof errorData === "string") {
        errorMessage = errorData;
      } else if (typeof errorData === "object" && errorData?.message) {
        errorMessage = errorData.message;
      }

      setError(errorMessage);
      setLoading(false);
    }
  };

  const handlePayment = () => {
    if (selectedMethod === "SEPAY") return handleSepayPayment();
    return handleVnpayPayment();
  };

  if (sepayData) {
    return (
      <div className="min-h-screen bg-[#f4f7f6] flex justify-center py-12 px-4 font-sans">
        <div className="w-full max-w-[500px] space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.04)] flex justify-center items-center gap-2">
            <span className="font-bold text-gray-800 text-[15px]">
              THCHIVOCAB — Thanh toán SePay
            </span>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
            <SepayQrModal
              transaction={sepayData.transaction}
              qrURL={sepayData.qrURL}
              onCancel={() => setSepayData(null)}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7f6] flex justify-center py-12 px-4 font-sans">
      <div className="w-full max-w-[600px] space-y-4">
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.04)] flex justify-center items-center gap-2">
          <span className="font-bold text-gray-800 text-[15px]">
            Thông tin thanh toán
          </span>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
          <h3 className="text-gray-500 text-[13px] font-semibold tracking-wide mb-4">
            THÔNG TIN TÀI KHOẢN
          </h3>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2 bg-[#f0f7ff] text-[#1a73e8] px-4 py-2 rounded-xl text-sm font-semibold">
              <Mail size={16} strokeWidth={2.5} />
              <span>{user?.email || "Chưa đăng nhập"}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
          <h3 className="text-gray-500 text-[13px] font-semibold tracking-wide mb-4">
            ĐƠN HÀNG CỦA BẠN
          </h3>
          <div className="space-y-4 mb-2">
            <div className="flex justify-between items-center text-[15px] text-gray-800 font-medium">
              <span>THCHIVOCAB - {plan.name}</span>
              <span>{originalPrice.toLocaleString("vi-VN")} VNĐ</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between items-center text-[15px] text-[#1eb54b] font-medium">
                <span>Giảm giá:</span>
                <span>-{discount.toLocaleString("vi-VN")} VNĐ</span>
              </div>
            )}
            <div className="flex justify-between items-center text-lg font-bold text-gray-900 pt-2 border-t border-gray-100">
              <span>Tổng thanh toán:</span>
              <span>{finalPrice.toLocaleString("vi-VN")} VNĐ</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
          <h3 className="text-gray-500 text-[13px] font-semibold tracking-wide mb-4">
            PHƯƠNG THỨC THANH TOÁN
          </h3>
          <div className="space-y-3">
            {PAYMENT_METHODS.map((method) => (
              <button
                key={method.id}
                id={`method-${method.id.toLowerCase()}`}
                onClick={() => setSelectedMethod(method.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left cursor-pointer ${
                  selectedMethod === method.id
                    ? "border-[#1a73e8] bg-[#f0f7ff]"
                    : "border-gray-100 bg-gray-50 hover:border-gray-200"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    selectedMethod === method.id
                      ? "border-[#1a73e8]"
                      : "border-gray-300"
                  }`}
                >
                  {selectedMethod === method.id && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#1a73e8]" />
                  )}
                </div>
                <div
                  className={`shrink-0 ${selectedMethod === method.id ? "text-[#1a73e8]" : "text-gray-400"}`}
                >
                  <method.icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-sm font-semibold ${selectedMethod === method.id ? "text-[#1a73e8]" : "text-gray-700"}`}
                    >
                      {method.label}
                    </span>
                    {method.badge && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${method.badgeColor}`}
                      >
                        {method.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{method.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
              {error}
            </div>
          )}
          <p className="text-[13px] text-gray-500 mb-5 leading-relaxed">
            Bằng cách tiếp tục, bạn đồng ý với{" "}
            <a href="#" className="text-[#1a73e8] hover:underline font-medium">
              Điều khoản &amp; Chính sách bảo mật
            </a>{" "}
            của THCHI
          </p>
          <button
            id="btn-proceed-payment"
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-[#1eb54b] text-white text-base font-bold py-3.5 rounded-xl hover:bg-[#18a042] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Đang xử lý…
              </>
            ) : selectedMethod === "SEPAY" ? (
              `Thanh toán ${finalPrice.toLocaleString("vi-VN")}đ qua SePay`
            ) : (
              `Thanh toán ${finalPrice.toLocaleString("vi-VN")}đ qua VNPay`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
