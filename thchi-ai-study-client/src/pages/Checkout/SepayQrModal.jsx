import { Check, Clock, Copy } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePaymentSocket } from "../../hooks/useSocketListeners";
import { formatTime } from "../../utils/format";

export default function SepayQrModal({
  transaction,
  qrURL,

  onCancel,
}) {
  const navigate = useNavigate();
  const [status, setStatus] = useState("pending");
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 phút
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  // Countdown timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setStatus("expired");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // Socket: lang nghe ket qua thanh toan
  const handleSuccess = useCallback(() => {
    clearInterval(timerRef.current);
    setStatus("success");
    setTimeout(() => navigate("/payment/result?isSuccess=true"), 2000);
  }, [navigate]);

  const handleFailed = useCallback(() => {
    clearInterval(timerRef.current);
    setStatus("failed");
  }, [navigate]);

  usePaymentSocket(transaction?.id, {
    onSuccess: handleSuccess,
    onFailed: handleFailed,
  });

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const amount = Number(transaction?.amount);

  // EXPIRED
  if (status === "expired") {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center">
          <Clock className="w-10 h-10 text-orange-400" strokeWidth={2} />
        </div>
        <p className="text-base font-semibold text-gray-700">
          QR Code đã hết hạn
        </p>
        <p className="text-sm text-gray-500 text-center">
          Vui lòng quay lại và tạo đơn hàng mới
        </p>
        <button
          onClick={onCancel}
          className="mt-2 px-6 py-2.5 rounded-xl bg-[#1a73e8] text-white text-sm font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
        >
          Thử lại
        </button>
      </div>
    );
  }

  // PENDING
  return (
    <div className="flex flex-col items-center gap-5">
      {/* Header + timer */}
      <div className="w-full flex items-center justify-between">
        <p className="text-sm text-gray-500 font-medium">
          Quét mã để thanh toán
        </p>
        <div
          className={`flex items-center gap-1.5 text-sm font-bold px-3 py-1 rounded-full ${
            timeLeft <= 60
              ? "bg-red-50 text-red-500"
              : timeLeft <= 180
                ? "bg-orange-50 text-orange-500"
                : "bg-[#e8f8ee] text-[#1eb54b]"
          }`}
        >
          <Clock className="w-3.5 h-3.5" strokeWidth={2.5} />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* QR Code */}
      <div className="relative">
        <div className="p-3 bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100">
          <img
            src={qrURL}
            alt="QR Thanh toán SePay"
            className="w-52 h-52 object-contain"
          />
        </div>
        {/* SePay badge */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white border border-gray-100 shadow-sm rounded-full px-3 py-1 flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#1eb54b] animate-pulse" />
          <span className="text-[11px] font-semibold text-gray-600">SePay</span>
        </div>
      </div>

      {/* Amount */}
      <div className="mt-2 text-center">
        <p className="text-2xl font-extrabold text-gray-900">
          {amount.toLocaleString("vi-VN")}
          <span className="text-base font-semibold text-gray-500 ml-1">đ</span>
        </p>
      </div>

      {/* Payment info */}
      <div className="w-full bg-[#f8faff] rounded-xl p-4 space-y-3 border border-[#e8eeff]">
        {/* Hàng Nội dung CK */}
        <div className="flex justify-between items-center gap-2">
          <span className="text-xs text-gray-500 shrink-0">Nội dung CK</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-800 break-all text-right">
              {transaction?.paymentCode}
            </span>
            <button
              onClick={() => handleCopy(transaction?.paymentCode)}
              className="shrink-0 p-1 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
              title="Sao chép"
            >
              {copied ? (
                <Check className="w-4 h-4 text-[#1eb54b]" strokeWidth={2.5} />
              ) : (
                <Copy className="w-4 h-4 text-gray-400" strokeWidth={2} />
              )}
            </button>
          </div>
        </div>

        <div className="border-t border-[#e8eeff]" />

        {/* Hàng Số tiền */}
        <div className="flex justify-between items-center gap-2">
          <span className="text-xs text-gray-500 shrink-0">Số tiền</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-800 break-all text-right">
              {amount.toLocaleString("vi-VN")} đ
            </span>
          </div>
        </div>
      </div>

      {/* Waiting indicator */}
      <div className="flex items-center gap-2 text-gray-400 text-sm">
        <svg
          className="animate-spin w-4 h-4 text-[#1eb54b]"
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
        <span>Đang chờ xác nhận thanh toán…</span>
      </div>

      {/* Cancel */}
      <button
        onClick={onCancel}
        className="text-sm text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors cursor-pointer"
      >
        Huỷ và chọn phương thức khác
      </button>
    </div>
  );
}
