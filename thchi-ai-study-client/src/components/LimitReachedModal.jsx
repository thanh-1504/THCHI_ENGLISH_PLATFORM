/**
 * Modal hiển thị khi user đã hết 6 lượt luyện tập miễn phí trong ngày.
 * Props:
 *  - onClose: () => void  — đóng modal (quay lại)
 *  - onUpgrade: () => void — điều hướng đến trang Premium
 */
const LimitReachedModal = ({ onClose, onUpgrade }) => {
  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      {/* Modal card */}
      <div
        className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          aria-label="Đóng"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center text-3xl shadow-inner">
          🔒
        </div>

        {/* Title */}
        <h2 className="text-xl font-extrabold text-gray-800 text-center leading-snug">
          Hết lượt luyện tập hôm nay!
        </h2>

        {/* Description */}
        <p className="text-sm text-gray-500 text-center leading-relaxed">
          Bạn đã sử dụng hết{" "}
          <span className="font-semibold text-amber-500">6 lượt miễn phí</span>{" "}
          trong ngày hôm nay.
          <br />
          Lượt luyện tập sẽ được khôi phục vào{" "}
          <span className="font-semibold text-gray-700">ngày mai</span>.
        </p>

        {/* Divider */}
        <div className="w-full border-t border-gray-100 my-1" />

        {/* Premium CTA */}
        <button
          onClick={onUpgrade}
          className="w-full py-3 rounded-2xl font-bold text-white text-sm
                     bg-gradient-to-r from-amber-400 to-orange-500
                     shadow-md hover:brightness-105 active:scale-95
                     transition-all duration-200 cursor-pointer"
        >
          ✨ Nâng cấp Premium — Luyện không giới hạn
        </button>

        {/* Secondary action */}
        <button
          onClick={onClose}
          className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors cursor-pointer"
        >
          Quay lại, tôi sẽ quay lại vào ngày mai
        </button>
      </div>
    </div>
  );
};

export default LimitReachedModal;
