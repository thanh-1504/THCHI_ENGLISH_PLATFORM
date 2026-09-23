import { MessageCircle, X } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import authService from "../../services/auth.service";
import useAuthStore from "../../store/useAuthStore";
import useSettingStore from "../../store/useSettingStore";
import ChangePasswordModal from "./ChangePasswordModal";
import ModalUserCard from "./shared/ModalUserCard";

const SettingRow = ({ icon, label, right, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-3 border border-gray-200 rounded-2xl px-4 py-3.5
      ${onClick ? "cursor-pointer hover:bg-gray-50 transition-colors" : ""}`}
  >
    <div className="w-10 h-10 shrink-0 flex items-center justify-center">
      {icon}
    </div>
    <span className="flex-1 font-medium text-gray-700">{label}</span>
    {right && <div className="shrink-0">{right}</div>}
  </div>
);

const SettingModal = ({ onClose }) => {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const { volume, darkMode, setVolume, setDarkMode } = useSettingStore();
  const [showChangePassword, setShowChangePassword] = useState(false);

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    navigate("/login", { replace: true });
    onClose();
  };

  const handleChangePassword = () => {
    setShowChangePassword(true);
  };

  // ── Nội dung dùng chung cho cả desktop modal và mobile bottom sheet ──
  const settingContent = (
    <>
      <div className="mx-auto">
        <ModalUserCard showEditName={true} />
      </div>

      {/* Divider */}
      <hr className="border-gray-100" />

      {/* Setting rows */}
      <div className="flex flex-col gap-3">
        {/* Tham gia group */}
        <SettingRow
          icon={
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
              F
            </div>
          }
          label="Tham gia group học viên"
          onClick={() => window.open("https://facebook.com", "_blank")}
        />

        {/* Chat với Thchi */}
        <SettingRow
          icon={
            <div className="w-10 h-10 rounded-full bg-cyan-400 flex items-center justify-center">
              <MessageCircle size={20} className="text-white" />
            </div>
          }
          label="Chat với Thchi"
          onClick={() => {}}
        />
      </div>

      {/* Footer links */}
      <div className="flex flex-col items-center gap-2 pt-2">
        <button
          onClick={handleLogout}
          className="text-lg text-[#828282] underline underline-offset-2 transition-colors cursor-pointer font-semibold hover:opacity-80"
        >
          Đăng xuất
        </button>
        <button
          onClick={handleChangePassword}
          className="text-lg text-[#828282] underline underline-offset-2 transition-colors cursor-pointer font-semibold hover:opacity-80"
        >
          Đổi mật khẩu
        </button>
      </div>
    </>
  );

  return createPortal(
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 z-50" onClick={onClose} />

      {/* ════════════ DESKTOP: Centered Modal ════════════ */}
      <div className="hidden md:flex fixed inset-0 items-center justify-center z-50 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl min-w-[50%] max-h-[90vh] overflow-hidden pointer-events-auto flex flex-col">
          {/* Header */}
          <div className="flex items-center bg-yellow-400 px-4 py-3 relative shrink-0">
            <button
              onClick={onClose}
              className="
                absolute top-2
                p-1 rounded-full bg-white
                cursor-pointer
                shadow-[0_3px_0_rgba(0,0,0,0.102)]
                active:translate-y-[3px] active:shadow-none
                transition-all duration-150
              "
            >
              <X strokeWidth={3.5} className="text-yellow-400" />
            </button>
            <h2 className="mx-auto text-xl font-semibold text-gray-800 pr-9">
              Cài đặt tài khoản
            </h2>
          </div>

          {/* Body */}
          <div className="overflow-y-auto no-scrollbar px-8 pb-8 flex flex-col gap-5 pt-8">
            {settingContent}
          </div>
        </div>
      </div>

      {/* ════════════ MOBILE: Bottom Sheet ════════════ */}
      <div
        className="
          md:hidden
          fixed bottom-0 left-0 right-0 z-50
          bg-white
          rounded-t-3xl
          overflow-hidden /* Bổ sung overflow-hidden để cắt góc bo nền vàng */
          shadow-[0_-4px_24px_rgba(0,0,0,0.15)]
          flex flex-col
          max-h-[92dvh]
          animate-slide-up
        "
      >
        {/* Gộp Header và Drag Handle vào chung nền vàng */}
        <div className="bg-yellow-400 shrink-0">
          {/* Drag handle indicator */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1.5 rounded-full bg-black/15" />{" "}
            {/* Đổi màu sang xám đen mờ để dễ nhìn trên nền vàng */}
          </div>

          {/* Sheet Header */}
          <div className="flex items-center px-4 pb-3 relative">
            <button
              onClick={onClose}
              className="
                absolute top-0
                p-1 rounded-full bg-white
                cursor-pointer
                shadow-[0_3px_0_rgba(0,0,0,0.102)]
                active:translate-y-[3px] active:shadow-none
                transition-all duration-150
              "
            >
              <X strokeWidth={3.5} className="text-yellow-400" />
            </button>
            <h2 className="mx-auto text-xl font-semibold text-gray-800 pr-9">
              Cài đặt tài khoản
            </h2>
          </div>
        </div>

        {/* Sheet Body - scrollable */}
        <div className="overflow-y-auto no-scrollbar px-5 pb-10 flex flex-col gap-5 pt-6 bg-white">
          {settingContent}
        </div>
      </div>

      {showChangePassword && (
        <ChangePasswordModal onClose={() => setShowChangePassword(false)} />
      )}
    </>,
    document.body,
  );
};

export default SettingModal;
