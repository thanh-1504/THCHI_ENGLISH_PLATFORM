import { Loader2, UploadCloud, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const CourseModal = ({ isOpen, onClose, onSave, editData }) => {
  const isEdit = !!editData;
  const blank = {
    title: "",
    subtitle: "",
    description: "",
    imageUrl: "",
    imageFile: null,
    isPremium: false,
    isPublished: true,
    orderIndex: 1,
  };

  const [form, setForm] = useState(
    editData
      ? {
          title: editData.title ?? "",
          subtitle: editData.subtitle ?? "",
          description: editData.description ?? "",
          imageUrl: editData.imageUrl ?? "",
          imageFile: null,
          isPremium: editData.isPremium ?? false,
          isPublished: editData.isPublished ?? true,
          orderIndex: editData.orderIndex ?? 1,
        }
      : blank,
  );

  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(form.imageUrl);

  const fileInputRef = useRef(null);

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);

    try {
      let imageUrl = form.imageUrl;
      let imagePublicId = editData?.imagePublicId ?? null;

      if (form.imageFile) {
        if (isEdit && editData?.imagePublicId) {
          try {
            await courseService.deleteImage(editData.imagePublicId);
          } catch {
            console.log("Có lỗi khi xóa ảnh cũ");
          }
        }
        const uploaded = await courseService.uploadImage(form.imageFile);
        imageUrl = uploaded.url;
        imagePublicId = uploaded.publicId;
      } else if (!form.imageUrl && isEdit && editData?.imagePublicId) {
        try {
          await courseService.deleteImage(editData.imagePublicId);
        } catch {
          console.log("Có lỗi khi xóa ảnh cũ");
        }
        imagePublicId = null;
      }
      const { imageFile, ...rest } = form;
      await onSave({ ...rest, imageUrl, imagePublicId });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setForm({ ...form, imageFile: null, imageUrl: "" });
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-800">
            {isEdit ? "Chỉnh sửa khóa học" : "Thêm khóa học mới"}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <X size={15} className="text-gray-500" />
          </button>
        </div>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên khóa học <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="VD: TOEIC 600+"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400 transition-all"
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả ngắn (subtitle)
            </label>
            <input
              type="text"
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              placeholder="Mô tả ngắn về khóa học..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả chi tiết
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Nhập mô tả chi tiết nội dung khóa học..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400 transition-all resize-none"
            />
          </div>

          {/* Upload ảnh */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ảnh khóa học
            </label>

            <div
              onClick={() => !preview && fileInputRef.current?.click()}
              className={`relative w-full h-44 rounded-xl flex flex-col items-center justify-center transition-all overflow-hidden ${
                preview
                  ? "border border-gray-200 bg-gray-50"
                  : "border-2 border-dashed border-blue-300 bg-blue-50/30 hover:bg-blue-50 cursor-pointer"
              }`}
            >
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setForm({ ...form, imageFile: file });
                    setPreview(URL.createObjectURL(file));
                  }
                }}
              />

              {preview ? (
                <>
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full shadow-sm flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-white transition-all cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3 shadow-sm">
                    <UploadCloud size={24} strokeWidth={2} />
                  </div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    Click để tải ảnh lên
                  </p>
                  <p className="text-xs text-gray-400 font-medium">
                    Hỗ trợ: JPG, PNG, WEBP
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Order + scope + status */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thứ tự
              </label>
              <input
                type="number"
                min={1}
                value={form.orderIndex}
                onChange={(e) =>
                  setForm({ ...form, orderIndex: Number(e.target.value) })
                }
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phạm vi
              </label>
              <select
                value={form.isPremium ? "Premium" : "Free"}
                onChange={(e) =>
                  setForm({ ...form, isPremium: e.target.value === "Premium" })
                }
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400 transition-all bg-white cursor-pointer"
              >
                <option>Free</option>
                <option>Premium</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái
              </label>
              <select
                value={form.isPublished ? "Hiển thị" : "Ẩn"}
                onChange={(e) =>
                  setForm({
                    ...form,
                    isPublished: e.target.value === "Hiển thị",
                  })
                }
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400 transition-all bg-white cursor-pointer"
              >
                <option>Hiển thị</option>
                <option>Ẩn</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6 pt-2 border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-yellow-400 hover:bg-yellow-500 rounded-xl py-2.5 text-sm font-semibold text-white transition-colors cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {isEdit ? "Lưu thay đổi" : "Thêm khóa học"}
          </button>
        </div>
      </div>
    </div>
  );
};
export default CourseModal;
