import { X } from "lucide-react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import authService from "../../services/auth.service";
import useAuthStore from "../../store/useAuthStore";
const ConfirmEmailModal = ({ onClose }) => {
  const navigate = useNavigate();
  const { name, email, password, setLoading, setShowConfirmModal, loading } =
    useAuthStore();

  const handleConfirm = async () => {
    try {
      await authService.sendOtp({ email: email.trim(), type: "REGISTER" });
      setShowConfirmModal(false);
      navigate("/verify-email", {
        state: {
          name,
          email: email.trim(),
          password,
          type: "REGISTER",
        },
      });
    } catch (error) {
      console.log(error);
      setLoading(false);
      setShowConfirmModal(false);
    }
  };

  return createPortal(
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 z-[60]" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-[61] pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-[380px] pointer-events-auto relative px-8 pt-10 pb-8 flex flex-col gap-5 text-center">
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

          {/* Body */}
          <p className="text-gray-800 text-base leading-relaxed">
            Email của bạn là: <strong className="text-gray-900">{email}</strong>{" "}
            đúng chưa nhỉ?
          </p>

          {/* Confirm button */}
          <button
            disabled={loading}
            onClick={handleConfirm}
            className="
              w-[60%] mx-auto py-3 rounded-2xl font-semibold text-white text-base
              bg-(image:--my-gradient)
              shadow-[0_5px_0_#1f8f2f]
              hover:opacity-90
              active:shadow-none active:translate-y-[3px]
              cursor-pointer transition-all duration-150
              disabled:opacity-60 disabled:cursor-not-allowed
            "
          >
            {loading ? "Đang gửi..." : "Nhận mã ngay"}
          </button>

          {/* Re-check link */}
          <button
            onClick={onClose}
            className="text-gray-400 underline underline-offset-2 cursor-pointer hover:text-gray-600 transition-colors"
          >
            Kiểm tra lại
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
};
export default ConfirmEmailModal;
