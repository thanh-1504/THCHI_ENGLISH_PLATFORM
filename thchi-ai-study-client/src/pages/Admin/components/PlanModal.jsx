import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import premiumService from "../../../services/premium.service";
import { DURATION_OPTIONS } from "../../../utils/config.constant";

const PlanModal = ({ isOpen, onClose, onSuccess, editData }) => {
  const isEdit = !!editData;
  const [form, setForm] = useState(
    editData || {
      duration: "ONE_MONTH",
      price: "",
      originalPrice: "",
      badge: "",
      description: "",
      isActive: true,
    },
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editData) {
      setForm(editData);
    } else {
      setForm({
        duration: "ONE_MONTH",
        price: "",
        originalPrice: "",
        badge: "",
        description: "",
        isActive: true,
      });
    }
  }, [editData, isOpen]);

  const handleSave = async () => {
    if (!form.duration || !form.price) {
      toast.error("Vui lòng điền thông tin gói", {
        toastId: "premium-validation",
        position: "top-center",
      });
      return;
    }

    try {
      setLoading(true);
      const payload = {
        duration: form.duration,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
        badge: form.badge || null,
        description: form.description || null,
        isActive: form.isActive,
      };

      if (isEdit) {
        await premiumService.updatePremiumPlan(editData.id, payload);
        toast.success("Cập nhật gói thành công", {
          toastId: "premium-update-success",
          position: "top-center",
        });
      } else {
        await premiumService.createPremiumPlan(payload);
        toast.success("Tạo gói thành công", {
          toastId: "premium-create-success",
          position: "top-center",
        });
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      let errorMessage = "Có lỗi xảy ra";
      if (error.response?.data?.message) {
        errorMessage = Array.isArray(error.response.data.message)
          ? error.response.data.message[0].message ||
            error.response.data.message[0]
          : error.response.data.message;
      }
      toast.error(errorMessage, {
        toastId: "premium-error",
        position: "top-center",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-lg mx-0 sm:mx-4 p-5 sm:p-6 max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto animate-slide-up sm:animate-none">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-800">
            {isEdit ? "Chỉnh sửa gói Premium" : "Thêm gói Premium mới"}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <X size={15} className="text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thời hạn <span className="text-red-400">*</span>
              </label>
              <select
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400 transition-all bg-white"
                disabled={isEdit}
              >
                {DURATION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái
              </label>
              <select
                value={form.isActive}
                onChange={(e) =>
                  setForm({ ...form, isActive: e.target.value === "true" })
                }
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400 transition-all bg-white cursor-pointer"
              >
                <option value="true">Hoạt động</option>
                <option value="false">Không hoạt động</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giá bán (VND) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="VD: 99000"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giá gốc (VND)
              </label>
              <input
                type="number"
                value={form.originalPrice || ""}
                onChange={(e) =>
                  setForm({ ...form, originalPrice: e.target.value })
                }
                placeholder="VD: 150000"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Badge (Nhãn nổi bật)
            </label>
            <input
              type="text"
              value={form.badge || ""}
              onChange={(e) => setForm({ ...form, badge: e.target.value })}
              placeholder="VD: Phổ biến, Khuyên dùng..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <textarea
              value={form.description || ""}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Mô tả ngắn về gói Premium..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400 transition-all resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 bg-yellow-400 hover:bg-yellow-500 rounded-xl py-2.5 text-sm font-semibold text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            {loading ? "Đang xử lý..." : isEdit ? "Lưu thay đổi" : "Thêm gói"}
          </button>
        </div>
      </div>
    </div>
  );
};
export default PlanModal;
