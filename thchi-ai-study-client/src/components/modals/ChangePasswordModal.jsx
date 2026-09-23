import { Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import authService from "../../services/auth.service";

const REQUIREMENTS = [
  {
    id: "length",
    label: "Ít nhất 6 ký tự, không được lớn hơn 60 ký tự",
    test: (v) => v.length >= 6 && v.length <= 60,
  },
  {
    id: "match",
    label: "Mật khẩu trùng khớp hoàn toàn",
    test: (v, confirm) => v.length > 0 && v === confirm,
  },
];


const PasswordField = ({ label, id, registration, icon: Icon, error, watch }) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}
      </label>
      <div
        className={`flex items-center gap-3 border rounded-2xl px-4 py-3 transition-all ${
          error ? "border-red-400 ring-1 ring-red-300" : "border-gray-200 focus-within:border-green-400 focus-within:ring-1 focus-within:ring-green-200"
        }`}
      >
        <Icon size={17} className="text-gray-400 shrink-0" />
        <input
          type={show ? "text" : "password"}
          id={id}
          {...registration}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

const SuccessScreen = ({ onClose }) => (
  <div className="flex flex-col items-center py-8 px-6 gap-6">
    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
      <ShieldCheck size={40} className="text-green-500" strokeWidth={1.8} />
    </div>
    <div className="text-center">
      <h3 className="text-2xl font-extrabold text-gray-900 mb-2">
        Cập nhật thành công!
      </h3>
      <p className="text-sm text-gray-500 leading-relaxed">
        Mật khẩu của bạn đã được cập nhật. Giờ đây bạn có thể đăng nhập bằng mật khẩu mới này.
      </p>
    </div>
    <button
      onClick={onClose}
      className="w-full py-3.5 bg-green-500 hover:bg-green-600 active:scale-95 text-white font-bold rounded-2xl transition-all duration-150 shadow-[0_3px_0_#1f8f2f]"
    >
      Đóng
    </button>
  </div>
);


const ChangePasswordModal = ({ onClose }) => {
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onChange" });

  const newPassword = watch("newPassword", "");
  const confirmPassword = watch("confirmPassword", "");

  const onSubmit = async (values) => {
    try {
      await authService.changePassword({
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });
      setSuccess(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.");
    }
  };

  return createPortal(
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" onClick={!success ? onClose : undefined} />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-[60] pointer-events-none p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[420px] pointer-events-auto overflow-hidden">
          {success ? (
            <SuccessScreen onClose={onClose} />
          ) : (
            <>
              {/* Header */}
              <div className="flex flex-col items-center pt-8 pb-4 px-6">
                <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mb-4">
                  <ShieldCheck size={30} className="text-green-500" strokeWidth={1.8} />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900">
                  Đổi mật khẩu
                </h2>
              </div>

              {/* Form */}
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="px-6 pb-6 flex flex-col gap-4"
              >
                {/* New password */}
                <PasswordField
                  label="Mật khẩu mới"
                  id="newPassword"
                  icon={Lock}
                  error={errors.newPassword?.message}
                  registration={register("newPassword", {
                    required: "Vui lòng nhập mật khẩu mới",
                    minLength: { value: 6, message: "Mật khẩu phải ít nhất 6 ký tự" },
                    maxLength: { value: 60, message: "Mật khẩu không được quá 60 ký tự" },
                  })}
                />

                {/* Confirm password */}
                <PasswordField
                  label="Xác nhận mật khẩu mới"
                  id="confirmPassword"
                  icon={ShieldCheck}
                  error={errors.confirmPassword?.message}
                  registration={register("confirmPassword", {
                    required: "Vui lòng xác nhận mật khẩu",
                    validate: (val) =>
                      val === newPassword || "Mật khẩu xác nhận không khớp",
                  })}
                />

                {/* Requirements checklist */}
                <div className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 space-y-2">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Yêu cầu bảo mật
                  </p>
                  {REQUIREMENTS.map((req) => {
                    const passed =
                      req.id === "match"
                        ? req.test(newPassword, confirmPassword)
                        : req.test(newPassword);
                    return (
                      <div key={req.id} className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                            passed ? "bg-green-500" : "bg-gray-200"
                          }`}
                        >
                          {passed && (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span
                          className={`text-xs transition-colors ${
                            passed ? "text-green-600 font-medium" : "text-gray-400"
                          }`}
                        >
                          {req.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 active:scale-95 transition-all duration-150 shadow-[0_3px_0_#e5e7eb]"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 rounded-2xl bg-green-500 hover:bg-green-600 text-white text-sm font-bold active:scale-95 transition-all duration-150 shadow-[0_3px_0_#1f8f2f] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting && (
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    )}
                    Tiếp tục
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </>,
    document.body,
  );
};

export default ChangePasswordModal;
