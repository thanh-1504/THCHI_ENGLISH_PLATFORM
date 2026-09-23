import { Loader2, Save, Upload, UploadCloud, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import courseService from "../../../services/course.service";

const LessonModal = ({ isOpen, onClose, onSave, editData, lessonCount }) => {
  const isEdit = !!editData;
  const thumbnailRef = useRef();
  const csvInputRef = useRef();
  const [saving, setSaving] = useState(false);
  const [csvImporting, setCsvImporting] = useState(false);

  const [existingWords, setExistingWords] = useState([]);
  const [removedWordIds, setRemovedWordIds] = useState(new Set());
  const [loadingWords, setLoadingWords] = useState(false);

  useEffect(() => {
    if (isOpen && isEdit && editData?.id) {
      setLoadingWords(true);
      setRemovedWordIds(new Set());
      courseService
        .getTopicWords(editData.id)
        .then((res) => {
          setExistingWords(res?.words ?? []);
        })
        .catch(() => setExistingWords([]))
        .finally(() => setLoadingWords(false));
    } else if (!isOpen) {
      setExistingWords([]);
      setRemovedWordIds(new Set());
    }
  }, [isOpen, isEdit, editData?.id]);

  const handleCsvImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCsvImporting(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
      complete: (results) => {
        const VALID_TYPES = ["NOUN", "VERB", "ADJECTIVE", "ADVERB", "OTHER"];
        const newRows = [];
        const errors = [];

        results.data.forEach((row, i) => {
          const term = row.term?.trim();
          const rawType = row.wordtype?.trim().toUpperCase() || "NOUN";
          const wordType = VALID_TYPES.includes(rawType) ? rawType : "NOUN";
          const meaning = row.meaning?.trim();
          const phonetic = row.phonetic?.trim() || "";
          const sentence = row.sentence?.trim() || "";

          if (!term) {
            errors.push(`Dòng ${i + 2}: thiếu từ (term)`);
            return;
          }
          if (!meaning) {
            errors.push(`Dòng ${i + 2}: thiếu nghĩa (meaning)`);
            return;
          }

          newRows.push({
            word: term,
            phonetic: phonetic,
            type: wordType,
            meaning: meaning,
            example: sentence,
            audio: null,
            image: null,
            imagePreview: null,
            difficulty: 1,
          });
        });

        if (newRows.length > 0) {
          newRows.forEach((row) => append(row));
          toast.success(`Đã import ${newRows.length} từ vựng từ CSV!`);
        }

        if (errors.length > 0) {
          toast.warning(
            `Bỏ qua ${errors.length} dòng lỗi: ${errors[0]}${errors.length > 1 ? " ..." : ""}`,
          );
        }

        setCsvImporting(false);
        if (csvInputRef.current) csvInputRef.current.value = "";
      },
      error: (err) => {
        console.error("Parse Error:", err);
        toast.error("Không thể đọc file CSV. Vui lòng kiểm tra định dạng!");
        setCsvImporting(false);
        if (csvInputRef.current) csvInputRef.current.value = "";
      },
    });
  };

  const defaultVocab = {
    word: "",
    phonetic: "",
    type: "NOUN",
    meaning: "",
    example: "",
    audio: null,
    image: null,
    imagePreview: null,
    difficulty: 1,
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      subtitle: "",
      description: "",
      orderIndex: lessonCount + 1,
      isPremium: false,
      isPublished: false,
      thumbnail: null,
      thumbnailPreview: null,
      vocab: [],
    },
  });

  const { append } = useFieldArray({
    control,
    name: "vocab",
  });

  const watchThumbnailPreview = watch("thumbnailPreview");
  const watchVocab = watch("vocab");

  useEffect(() => {
    if (isOpen) {
      reset({
        title: editData?.title ?? "",
        subtitle: editData?.subtitle ?? "",
        description: editData?.description ?? "",
        orderIndex: editData?.orderIndex ?? lessonCount + 1,
        isPremium: editData?.isPremium ?? false,
        isPublished: editData?.isPublished ?? false,
        thumbnail: null,
        thumbnailPreview: editData?.imageUrl ?? null,
        vocab: [],
      });
    }
  }, [isOpen, editData, lessonCount, reset]);

  const handleThumbnail = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setValue("thumbnail", file);
    setValue("thumbnailPreview", URL.createObjectURL(file));
  };

  const retainedExistingCount = existingWords.filter(
    (w) => !removedWordIds.has(w.id),
  ).length;
  const newVocabCount = (watchVocab ?? []).filter((v) => v.word?.trim()).length;
  const totalVocabAfterSave = isEdit
    ? retainedExistingCount + newVocabCount
    : newVocabCount;

  const handleSaveTopic = async (data) => {
    if (isEdit && totalVocabAfterSave < 5) {
      toast.error(
        `Bài học phải có ít nhất 5 từ vựng! Hiện tại: ${totalVocabAfterSave} từ.`,
      );
      return;
    }

    setSaving(true);
    try {
      let imageUrl = editData?.imageUrl ?? "";
      if (data.thumbnail) {
        const uploaded = await courseService.uploadImage(data.thumbnail);
        imageUrl = uploaded.url;
      }

      if (isEdit) {
        const topicPayload = {
          title: data.title.trim(),
          subtitle: data.subtitle?.trim() ?? "",
          imageUrl: imageUrl || undefined,
          orderIndex: Number(data.orderIndex) || editData.orderIndex,
          isPremium: data.isPremium === true || data.isPremium === "true",
          isPublished: data.isPublished === true || data.isPublished === "true",
        };

        if (removedWordIds.size > 0) {
          await Promise.all(
            [...removedWordIds].map((wordId) =>
              courseService.removeTopicWord(editData.id, wordId),
            ),
          );
        }

        const filteredNewVocab = (data.vocab ?? []).filter((v) =>
          v.word?.trim(),
        );
        await Promise.all(
          filteredNewVocab.map(async (v, index) => {
            let audioUrl = null;
            let wordImageUrl = null;

            if (v.audio instanceof File) {
              const uploaded = await courseService.uploadAudio(v.audio);
              audioUrl = uploaded.url;
            }
            if (v.image instanceof File) {
              const uploaded = await courseService.uploadImage(v.image);
              wordImageUrl = uploaded.url;
            }

            const wordPayload = {
              term: v.word.trim(),
              phonetic: v.phonetic?.trim() || null,
              audioUrl,
              imageUrl: wordImageUrl || undefined,
              orderIndex: existingWords.length + index,
              definitions: [
                {
                  wordType: v.type ?? "NOUN",
                  meaning: v.meaning?.trim() ?? "",
                },
              ],
              examples: v.example?.trim()
                ? [
                    {
                      sentence: v.example.trim(),
                      translation: null,
                      isAiGenerated: false,
                    },
                  ]
                : [],
            };

            return courseService.addTopicWord(editData.id, wordPayload);
          }),
        );

        await onSave(topicPayload);
      } else {
        // ── CREATE FLOW ──────────────────────────────────────────────────
        const filteredVocab = (data.vocab ?? []).filter((v) => v.word?.trim());
        const vocabWithUrls = await Promise.all(
          filteredVocab.map(async (v) => {
            let audioUrl = null;
            let wordImageUrl = null;

            if (v.audio instanceof File) {
              const uploaded = await courseService.uploadAudio(v.audio);
              audioUrl = uploaded.url;
            }
            if (v.image instanceof File) {
              const uploaded = await courseService.uploadImage(v.image);
              wordImageUrl = uploaded.url;
            }

            return {
              term: v.word.trim(),
              phonetic: v.phonetic?.trim() || null,
              audioUrl,
              imageUrl: wordImageUrl,
              definitions: [
                {
                  wordType: v.type ?? "NOUN",
                  meaning: v.meaning?.trim() ?? "",
                },
              ],
              examples: v.example?.trim()
                ? [
                    {
                      sentence: v.example.trim(),
                      translation: null,
                      isAiGenerated: false,
                    },
                  ]
                : [],
            };
          }),
        );

        const payload = {
          courseId: data.id,
          title: data.title.trim(),
          subtitle: data.subtitle?.trim() ?? "",
          imageUrl: imageUrl,
          orderIndex: Number(data.orderIndex) || lessonCount + 1,
          isPremium: data.isPremium === true || data.isPremium === "true",
        };

        await onSave(payload);
      }
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-6 px-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-800">
              {isEdit ? "Chỉnh sửa bài học" : "Thêm bài học mới"}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Bài học #{isEdit ? editData.orderIndex : lessonCount + 1}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Hidden CSV file input */}
            <input
              ref={csvInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={handleCsvImport}
            />
            {/* Download template */}
            {/* <button
              type="button"
              onClick={handleDownloadTemplate}
              className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
              title="Tải file mẫu CSV"
            >
              <Download size={13} />
              Mẫu CSV
            </button> */}
            {/* Save button */}
            <button
              type="button"
              onClick={handleSubmit(handleSaveTopic)}
              disabled={saving}
              className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-70 text-white rounded-xl px-5 py-2 text-sm font-semibold transition-colors cursor-pointer"
            >
              {saving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              {isEdit ? "Lưu thay đổi" : "Thêm bài học"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer"
            >
              <X size={15} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="px-6 py-5 space-y-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Tên bài học <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="VD: Unit 1 – Văn phòng"
                  {...register("title", {
                    required: "Tên bài học không được để trống",
                  })}
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400 transition-all ${
                    errors.title ? "border-red-400" : "border-gray-200"
                  }`}
                />
                {errors.title && (
                  <p className="text-xs text-red-400 mt-1">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Subtitle <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="VD: Từ vựng về môi trường văn phòng"
                  {...register("subtitle", {
                    required: "Subtitle không được để trống",
                  })}
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400 transition-all ${
                    errors.subtitle ? "border-red-400" : "border-gray-200"
                  }`}
                />
                {errors.subtitle && (
                  <p className="text-xs text-red-400 mt-1">
                    {errors.subtitle.message}
                  </p>
                )}
              </div>

              {/* Description (Tiptap) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Mô tả ngắn
                </label>
                <textarea
                  placeholder="Nhập mô tả ngắn về bài học..."
                  {...register("description")}
                  className="w-full min-h-25 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400 transition-all resize-none"
                />
              </div>

              {/* Order + isPremium + isPublished */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Thứ tự bài học
                  </label>
                  <input
                    type="number"
                    min={1}
                    {...register("orderIndex", { valueAsNumber: true })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Phân loại
                  </label>
                  <select
                    {...register("isPremium")}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400 transition-all bg-white cursor-pointer"
                  >
                    <option value={false}>Free</option>
                    <option value={true}>Premium</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Trạng thái
                  </label>
                  <select
                    {...register("isPublished")}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400 transition-all bg-white cursor-pointer"
                  >
                    <option value={false}>Bản nháp</option>
                    <option value={true}>Đã xuất bản</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right: thumbnail upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ảnh thumbnail <span className="text-red-400">*</span>
              </label>
              <div
                onClick={() =>
                  !watchThumbnailPreview && thumbnailRef.current?.click()
                }
                className={`relative rounded-xl overflow-hidden transition-all ${
                  watchThumbnailPreview
                    ? "border border-gray-200 bg-gray-50"
                    : "border-2 border-dashed border-blue-300 bg-blue-50/30 hover:bg-blue-50 cursor-pointer h-36 flex flex-col items-center justify-center"
                }`}
              >
                <input
                  ref={thumbnailRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleThumbnail}
                />
                {watchThumbnailPreview ? (
                  <>
                    <img
                      src={watchThumbnailPreview}
                      alt="Thumbnail"
                      className="w-full h-36 object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setValue("thumbnail", null);
                        setValue("thumbnailPreview", null);
                        if (thumbnailRef.current)
                          thumbnailRef.current.value = "";
                      }}
                      className="absolute top-2 right-2 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full shadow flex items-center justify-center text-gray-500 hover:text-red-500 transition-all cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        thumbnailRef.current?.click();
                      }}
                      className="absolute bottom-2 right-2 flex items-center gap-1 text-xs bg-white/90 backdrop-blur-sm text-gray-600 border border-gray-200 rounded-lg px-2 py-1 shadow hover:bg-white transition-all cursor-pointer"
                    >
                      <Upload size={11} /> Đổi ảnh
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2 shadow-sm">
                      <UploadCloud size={20} />
                    </div>
                    <p className="text-xs font-semibold text-gray-700">
                      Click để tải ảnh lên
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      JPG, PNG, WEBP
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LessonModal;
