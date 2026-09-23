import { yupResolver } from "@hookform/resolvers/yup";
import { Image as ImageIcon, Mic, Music, X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";

const schema = yup.object().shape({
  term: yup.string().required("Vui lòng nhập từ vựng"),
  type: yup.string().required("Vui lòng chọn từ loại"),
  meaning: yup.string().required("Vui lòng nhập nghĩa của từ"),
  phonetic: yup.string(),
  example: yup.string(),
  imageUrl: yup.mixed().nullable(),
  audioUrl: yup.mixed().nullable(),
});

const VocabModal = ({ isOpen, onClose, onSave, initialData }) => {
  const isEditMode = Boolean(initialData);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      term: "",
      phonetic: "",
      type: "Noun",
      meaning: "",
      example: "",
      image: null,
      audio: null,
    },
  });

  const watchImage = watch("image");
  const watchAudio = watch("audio");

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && initialData) {
        reset({
          term: initialData.term || "",
          phonetic: initialData.phonetic || "",
          type: initialData.type || "Noun",
          meaning: initialData.meaning || "",
          example: initialData.example || "",
          image: initialData.imageUrl || null,
          audio: initialData.audioUrl || null,
        });
      } else {
        reset({
          term: "",
          phonetic: "",
          type: "Noun",
          meaning: "",
          example: "",
          image: null,
          audio: null,
        });
      }
    }
  }, [isOpen, isEditMode, initialData, reset]);

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      setValue(fieldName, file, { shouldValidate: true });
    }
  };

  const handleRemoveFile = (e, fieldName) => {
    e.stopPropagation();
    setValue(fieldName, null);
    const input = document.getElementById(`${fieldName}-upload`);
    if (input) input.value = "";
  };

  const onSubmit = (data) => {
    onSave(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-[520px] max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditMode ? "Chỉnh sửa từ vựng" : "Thêm từ mới"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body / Form */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form
            id="vocab-form"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
          >
            {/* Từ vựng */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Từ vựng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("term")}
                placeholder="Ví dụ: eloquent"
                className={`w-full px-3.5 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all text-sm ${
                  errors.term
                    ? "border-red-500 focus:ring-red-300 focus:border-red-500"
                    : "border-gray-300 focus:ring-yellow-300 focus:border-yellow-400"
                }`}
              />
              {errors.term && (
                <p className="text-red-500 text-xs mt-1.5 font-medium">
                  {errors.term.message}
                </p>
              )}
            </div>

            {/* Phiên âm & Từ loại */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phiên âm
                </label>
                <input
                  type="text"
                  {...register("phonetic")}
                  placeholder="Ví dụ: /'el.ə.kwənt/"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400 transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Từ loại <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("type")}
                  className={`w-full px-3.5 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all text-sm bg-white cursor-pointer ${
                    errors.type
                      ? "border-red-500 focus:ring-red-300 focus:border-red-500"
                      : "border-gray-300 focus:ring-yellow-300 focus:border-yellow-400"
                  }`}
                >
                  <option value="Noun">Noun</option>
                  <option value="Verb">Verb</option>
                  <option value="Adjective">Adjective</option>
                  <option value="Adverb">Adverb</option>
                  <option value="Preposition">Preposition</option>
                  <option value="Conjunction">Conjunction</option>
                </select>
                {errors.type && (
                  <p className="text-red-500 text-xs mt-1.5 font-medium">
                    {errors.type.message}
                  </p>
                )}
              </div>
            </div>

            {/* Nghĩa của từ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nghĩa của từ <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register("meaning")}
                placeholder="Định nghĩa của từ vựng"
                rows="3"
                className={`w-full px-3.5 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all text-sm resize-none ${
                  errors.meaning
                    ? "border-red-500 focus:ring-red-300 focus:border-red-500"
                    : "border-gray-300 focus:ring-yellow-300 focus:border-yellow-400"
                }`}
              ></textarea>
              {errors.meaning && (
                <p className="text-red-500 text-xs mt-1.5 font-medium">
                  {errors.meaning.message}
                </p>
              )}
            </div>

            {/* Ví dụ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Ví dụ
              </label>
              <textarea
                {...register("example")}
                placeholder="Câu ví dụ sử dụng từ này"
                rows="3"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400 transition-all text-sm resize-none"
              ></textarea>
            </div>

            {/* VÙNG UPLOAD MEDIA */}
            <div className="grid grid-cols-2 gap-4">
              {/* Box Upload Ảnh */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Hình ảnh minh họa
                </label>
                <div
                  onClick={() =>
                    !watchImage &&
                    document.getElementById("image-upload").click()
                  }
                  className={`relative flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl transition-all ${
                    watchImage
                      ? "border-gray-200 bg-gray-50 cursor-default"
                      : "border-gray-300 hover:border-yellow-400 hover:bg-yellow-50 cursor-pointer"
                  }`}
                >
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "image")}
                    className="hidden"
                  />

                  {watchImage ? (
                    <>
                      <img
                        src={
                          typeof watchImage === "string"
                            ? watchImage
                            : URL.createObjectURL(watchImage)
                        }
                        alt="Preview"
                        className="w-full h-full object-cover rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={(e) => handleRemoveFile(e, "image")}
                        className="absolute -top-2 -right-2 bg-white text-gray-400 hover:text-red-500 rounded-full p-1 shadow hover:shadow-md border border-gray-100 transition-all cursor-pointer"
                        title="Xóa ảnh"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center text-gray-400">
                      <ImageIcon size={24} className="mb-2" />
                      <span className="text-sm font-medium text-gray-600">
                        Chọn hình ảnh
                      </span>
                      <span className="text-[11px] mt-1">PNG, JPG, WEBP</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Box Upload Audio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Audio phát âm
                </label>
                <div
                  onClick={() =>
                    !watchAudio &&
                    document.getElementById("audio-upload").click()
                  }
                  className={`relative flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl transition-all ${
                    watchAudio
                      ? "border-gray-200 bg-gray-50 cursor-default"
                      : "border-gray-300 hover:border-yellow-400 hover:bg-yellow-50 cursor-pointer"
                  }`}
                >
                  <input
                    id="audio-upload"
                    type="file"
                    accept="audio/*"
                    onChange={(e) => handleFileChange(e, "audio")}
                    className="hidden"
                  />

                  {watchAudio ? (
                    <div className="flex flex-col items-center justify-center p-3 w-full text-center">
                      <div className="w-10 h-10 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center mb-2">
                        <Music size={18} />
                      </div>
                      <span className="text-xs font-medium text-gray-700 line-clamp-1 w-full px-2">
                        {typeof watchAudio === "string"
                          ? "Tệp Audio hiện tại"
                          : watchAudio.name}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleRemoveFile(e, "audio")}
                        className="absolute -top-2 -right-2 bg-white text-gray-400 hover:text-red-500 rounded-full p-1 shadow hover:shadow-md border border-gray-100 transition-all cursor-pointer"
                        title="Xóa audio"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-gray-400">
                      <Mic size={24} className="mb-2" />
                      <span className="text-sm font-medium text-gray-600">
                        Chọn audio
                      </span>
                      <span className="text-[11px] mt-1">MP3, WAV, OGG</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer / Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="submit"
            form="vocab-form"
            className="px-5 py-2 text-sm font-semibold text-white bg-yellow-400 hover:bg-yellow-500 rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            {isEditMode ? "Lưu thay đổi" : "Thêm từ"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VocabModal;
