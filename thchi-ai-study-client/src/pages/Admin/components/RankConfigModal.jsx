import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import adminService from "../../../services/admin.service";

const TIER_OPTIONS = ["BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND"];

const Field = ({ label, required, error, children }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const RankConfigModal = ({ isOpen, onClose, onSuccess, editData }) => {
  const isEdit = !!editData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      tier: "BRONZE",
      xpRequired: "",
      xpToMaintain: "",
      description: "",
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    if (isEdit) {
      reset({
        tier: editData.tier,
        xpRequired: editData.xpRequired,
        xpToMaintain: editData.xpToMaintain,
        description: editData.description ?? "",
      });
    } else {
      reset({
        tier: "BRONZE",
        xpRequired: "",
        xpToMaintain: "",
        description: "",
      });
    }
  }, [isOpen, editData, isEdit, reset]);

  const onSubmit = async (values) => {
    try {
      const payload = {
        xpRequired: Number(values.xpRequired),
        xpToMaintain: Number(values.xpToMaintain),
        description: values.description || undefined,
      };

      if (isEdit) {
        await adminService.updateRankTierConfig(editData.id, payload);
        toast.success("Cập nhật mức xếp hạng thành công!");
      } else {
        await adminService.createRankTierConfig({
          ...payload,
          tier: values.tier,
        });
        toast.success("Thêm mức xếp hạng thành công!");
      }

      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* ── Body ───────────────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-6 py-5 space-y-4">
            {/* Tier Select – only visible when creating */}
            {!isEdit && (
              <Field
                label="Tier xếp hạng"
                required
                error={errors.tier?.message}
              >
                <select
                  {...register("tier", { required: "Vui lòng chọn tier" })}
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all bg-white ${
                    errors.tier ? "border-red-400" : "border-gray-200"
                  }`}
                >
                  {TIER_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </Field>
            )}

            {/* XP Required */}
            <Field
              label="XP yêu cầu"
              required
              error={errors.xpRequired?.message}
            >
              <input
                type="number"
                placeholder="Nhập số XP tối thiểu để đạt hạng này"
                {...register("xpRequired", {
                  required: "XP yêu cầu không được để trống",
                  min: { value: 0, message: "XP yêu cầu phải ≥ 0" },
                  valueAsNumber: true,
                })}
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all ${
                  errors.xpRequired ? "border-red-400" : "border-gray-200"
                }`}
              />
            </Field>

            {/* XP Maintain */}
            <Field
              label="XP duy trì"
              required
              error={errors.xpToMaintain?.message}
            >
              <input
                type="number"
                placeholder="Nhập số XP tối thiểu để giữ hạng"
                {...register("xpToMaintain", {
                  required: "XP duy trì không được để trống",
                  min: { value: 0, message: "XP duy trì phải ≥ 0" },
                  valueAsNumber: true,
                })}
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all ${
                  errors.xpToMaintain ? "border-red-400" : "border-gray-200"
                }`}
              />
            </Field>

            {/* Description */}
            <Field label="Mô tả" error={errors.description?.message}>
              <input
                type="text"
                placeholder="Mô tả ngắn về mức xếp hạng này"
                {...register("description")}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
              />
            </Field>
          </div>

          {/* ── Footer ─────────────────────────────────────────────────────────── */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-amber-400 hover:bg-amber-500 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting && (
                <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
              )}
              {isEdit ? "Lưu thay đổi" : "Thêm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RankConfigModal;
