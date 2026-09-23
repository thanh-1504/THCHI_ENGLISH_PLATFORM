import { CheckCircle, Crown, Printer, User, X } from "lucide-react";
import { formatDateStr, formatPrice, formatStatus } from "../../../utils/format";
import InfoRow from "./InforRow";

const DetailTransactionModal = ({ tx, onClose }) => {
  if (!tx) return null;

  const statusStr = formatStatus(tx.status);
  const isFailed = tx.status === "FAILED";

  const fullName = tx.fullName || (tx.email ? tx.email.split("@")[0] : "N/A");
  const formattedDate = formatDateStr(tx.createdAt);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-3xl mx-auto max-h-[92dvh] overflow-y-auto animate-slide-up sm:animate-none">
        {/* ── Header ── */}
        <div className="flex items-start justify-between px-5 sm:px-6 pt-5 pb-4 border-b border-gray-100">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800">
              Chi tiết giao dịch
            </h3>
            <p className="text-sm text-gray-400 mt-0.5">
              Mã giao dịch:{" "}
              <span className="font-semibold text-yellow-500">{tx.code}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer mt-0.5"
          >
            <X size={15} className="text-gray-500" />
          </button>
        </div>

        {/* ── 3 Info Panels ── */}
        <div className="px-5 sm:px-6 pt-5 pb-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Panel 1 – Transaction info */}
            <div className="border border-gray-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center">
                  <CheckCircle size={16} className="text-pink-500" />
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  1. Thông tin giao dịch
                </span>
              </div>
              <InfoRow label="Mã giao dịch" value={tx.code} />
              <InfoRow label="Ngày & giờ" value={formattedDate} />
              <div className="flex justify-between items-center py-2.5 border-b border-gray-100">
                <span className="text-sm text-gray-500">Trạng thái</span>
                {isFailed ? (
                  <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-500 text-xs font-semibold px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block"></span>
                    {statusStr}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-500 text-xs font-semibold px-2.5 py-1 rounded-full">
                    <CheckCircle size={12} />
                    {statusStr}
                  </span>
                )}
              </div>
              <InfoRow label="Phương thức thanh toán" value={tx.method} />
              <InfoRow
                label="Số tiền"
                value={formatPrice(tx.amount)}
                valueClass="font-bold text-yellow-500"
              />
            </div>

            {/* Panel 2 – User info */}
            <div className="border border-gray-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                  <User size={16} className="text-purple-500" />
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  2. Thông tin người dùng
                </span>
              </div>
              <InfoRow label="Họ tên" value={fullName} />
              <InfoRow label="Email" value={tx.email} />
            </div>

            {/* Panel 3 – Premium plan info */}
            <div className="border border-gray-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center">
                  <Crown size={16} className="text-yellow-500" />
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  3. Thông tin gói Premium
                </span>
              </div>
              <InfoRow label="Tên gói" value={tx.plan} />
            </div>
          </div>
        </div>

        {/* ── Footer Buttons ── */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 px-5 sm:px-6 py-4 border-t border-gray-100 mt-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-yellow-400 hover:bg-yellow-500 rounded-xl transition-colors cursor-pointer shadow-sm"
          >
            <Printer size={15} />
            In hóa đơn
          </button>
        </div>
      </div>
    </div>
  );
};
export default DetailTransactionModal
