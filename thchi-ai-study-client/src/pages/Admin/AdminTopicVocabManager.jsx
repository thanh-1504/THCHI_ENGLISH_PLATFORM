import {
  Download,
  Image as ImageIcon,
  Pencil,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Upload,
  Volume2,
} from "lucide-react";
import Papa from "papaparse";
import { useEffect, useRef, useState } from "react";
import { useLoaderData, useLocation, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import adminService from "../../services/admin.service";
import AIGenerateVocabModal from "./AIGenerataeVocabModal";
import VocabModal from "./VocabModal";

const AdminTopicVocabManager = () => {
  const topicWord = useLoaderData();
  const location = useLocation();
  const params = useParams();
  const csvInputRef = useRef(null);
  const { topicTitle } = location?.state ?? {};
  const topicId =
    params.topicId ?? topicWord?.topicId ?? location?.state?.topicId;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVocab, setEditingVocab] = useState(null);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [deletedWords, setDeletedWords] = useState([]);
  const [vocabList, setVocabList] = useState(() => {
    const data = topicWord?.words ?? [];
    return data.map((item, index) => {
      const definition = item.definitions?.[0] || {};
      const exampleObj = item.examples?.[0] || {};
      const rawType = definition.wordType || item.type || "Noun";
      const formattedType =
        rawType.charAt(0).toUpperCase() + rawType.slice(1).toLowerCase();
      return {
        id: item.word?.id || item.id || Date.now() + index,
        term: item.word?.term || item.term || item.word || "",
        phonetic: item.word?.phonetic || item.phonetic || "",
        type: formattedType,
        meaning: definition.meaning || item.meaning || "",
        example: exampleObj.sentence || item.example || "",
        imageUrl: item.word?.imageUrl || item.imageUrl || null,
        audioUrl: item.word?.audioUrl || item.audioUrl || null,
        savedInDb: true,
      };
    });
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleOpenAdd = () => {
    setEditingVocab(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingVocab(item);
    setIsModalOpen(true);
  };


  const uploadMediaFiles = async (imageField, audioField) => {
    let imageUrl = typeof imageField === "string" ? imageField : undefined;
    let audioUrl = typeof audioField === "string" ? audioField : undefined;

    if (imageField instanceof File) {
      const res = await adminService.uploadImage(imageField);
      imageUrl = res.url;
    }
    if (audioField instanceof File) {
      const res = await adminService.uploadAudio(audioField);
      audioUrl = res.url;
    }
    return { imageUrl, audioUrl };
  };

  const buildWordPayload = (item, index) => ({
    term: item.term,
    phonetic: item.phonetic || undefined,
    ...(index !== undefined ? { orderIndex: index } : {}),
    imageUrl: item.imageUrl ?? undefined,
    audioUrl: item.audioUrl ?? undefined,
    definitions: [
      {
        wordType: item.type?.toUpperCase(),
        meaning: item.meaning,
      },
    ],
    examples: item.example
      ? [
          {
            sentence: item.example,
            translation: null,
            isAiGenerated: false,
          },
        ]
      : [],
  });


  const handleSaveVocab = (formData) => {
    const enrichedData = {
      ...formData,
      image: formData.image ?? null,
      audio: formData.audio ?? null,
      imageUrl:
        typeof formData.image === "string"
          ? formData.image
          : formData.image instanceof File
            ? URL.createObjectURL(formData.image)
            : (editingVocab?.imageUrl ?? null),
      audioUrl:
        typeof formData.audio === "string"
          ? formData.audio
          : formData.audio instanceof File
            ? URL.createObjectURL(formData.audio)
            : (editingVocab?.audioUrl ?? null),
    };

    if (editingVocab) {
      setVocabList((prev) =>
        prev.map((v) =>
          v.id === editingVocab.id
            ? {
                ...enrichedData,
                id: editingVocab.id,
                savedInDb: editingVocab.savedInDb,
                isEdited: true, 
              }
            : v,
        ),
      );
    } else {
      setVocabList((prev) => [
        ...prev,
        { ...enrichedData, id: Date.now(), savedInDb: false },
      ]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (word) => {
    console.log(word);
    if (word.savedInDb) {
      setDeletedWords((prev) => [...prev, word]);
    }
    setVocabList((prev) => prev.filter((item) => item.id !== word.id));
  };


  const handleSaveTopic = async () => {
    if (vocabList.length === 0 && deletedWords.length === 0) {
      toast.warning("Chưa có từ vựng nào để lưu!");
      return;
    }

    setIsSaving(true);
    try {
      const savePromises = vocabList
        .filter((item) => !item.savedInDb || item.isEdited) 
        .map(async (item, index) => {
          const { imageUrl, audioUrl } = await uploadMediaFiles(
            item.image ?? item.imageUrl,
            item.audio ?? item.audioUrl,
          );

          const payload = buildWordPayload(
            { ...item, imageUrl, audioUrl },
            index,
          );

          if (item.savedInDb && item.isEdited) {
            return adminService.updateWordInTopicWord({
              topicId,
              wordId: item.id,
              data: payload,
            });
          } else if (!item.savedInDb) {
            return adminService.createTopicWord({
              topicId,
              data: payload,
            });
          }
        });

      const deletePromises = deletedWords.map((word) =>
        adminService.deleteTopicWord({ topicId, wordId: word.id }),
      );

      await Promise.all([...savePromises, ...deletePromises]);

     
      const freshData = await adminService.getTopicWordById(topicId);

      const updatedVocabList = (freshData?.words ?? []).map((item, index) => {
        const definition = item.definitions?.[0] || {};
        const exampleObj = item.examples?.[0] || {};
        const rawType = definition.wordType || item.type || "Noun";
        const formattedType =
          rawType.charAt(0).toUpperCase() + rawType.slice(1).toLowerCase();

        return {
          id: item.word?.id || item.id || Date.now() + index, 
          term: item.word?.term || item.term || item.word || "",
          phonetic: item.word?.phonetic || item.phonetic || "",
          type: formattedType,
          meaning: definition.meaning || item.meaning || "",
          example: exampleObj.sentence || item.example || "",
          imageUrl: item.word?.imageUrl || item.imageUrl || null,
          audioUrl: item.word?.audioUrl || item.audioUrl || null,
          savedInDb: true, 
          isEdited: false, 
        };
      });
      setDeletedWords([]);
      setVocabList(updatedVocabList);
      toast.success("Đã lưu và đồng bộ danh sách từ vựng thành công!");
    } catch (error) {
      console.error("Lỗi khi lưu từ vựng:", error);
      toast.error(
        error?.response?.data?.message || "Có lỗi xảy ra khi lưu từ vựng!",
      );
    } finally {
      setIsSaving(false);
    }
  };
  // ─── Import CSV ─────────────────────────────────────────────────────────────

  const handleCsvImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
      complete: (results) => {
        const newRows = [];
        const errors = [];

        results.data.forEach((row, i) => {
          const term = row.term?.trim();
          const meaning = row.meaning?.trim();
          const rawType =
            row.wordtype?.trim() || row.word_type?.trim() || "Noun";

          const formattedType =
            rawType.charAt(0).toUpperCase() + rawType.slice(1).toLowerCase();

          if (!term) {
            errors.push(`Dòng ${i + 2}: Thiếu từ vựng (term)`);
            return;
          }
          if (!meaning) {
            errors.push(`Dòng ${i + 2}: Thiếu nghĩa của từ (meaning)`);
            return;
          }

          newRows.push({
            id: Date.now() + i,
            term,
            phonetic: row.phonetic?.trim() || "",
            type: formattedType,
            meaning,
            example: row.sentence?.trim() || row.example?.trim() || "",
            image: null,
            audio: null,
            imageUrl: null,
            audioUrl: null,
            savedInDb: false,
          });
        });

        if (newRows.length > 0) {
          setVocabList((prev) => [...prev, ...newRows]);
          toast.success(`Đã import ${newRows.length} từ vựng!`);
        }

        if (errors.length > 0) {
          toast.error(
            <div>
              <p className="font-semibold">Bỏ qua {errors.length} dòng lỗi:</p>
              <p className="text-sm">
                {errors[0]}
                {errors.length > 1 ? "..." : ""}
              </p>
            </div>,
          );
        }
        if (csvInputRef.current) csvInputRef.current.value = "";
      },
      error: () => {
        toast.error("Lỗi đọc file CSV. Vui lòng kiểm tra định dạng!");
        if (csvInputRef.current) csvInputRef.current.value = "";
      },
    });
  };

  // ─── Download CSV Template ───────────────────────────────────────────────────

  const handleDownloadTemplate = () => {
    const headers = [
      "term",
      "wordType",
      "meaning",
      "phonetic",
      "sentence",
      "translation",
    ];
    const sample = [
      [
        "office",
        "NOUN",
        "văn phòng",
        "/ˈɒfɪs/",
        "I work in a modern office.",
        "Tôi làm việc ở một văn phòng hiện đại.",
      ],
      [
        "schedule",
        "VERB",
        "lên lịch",
        "/ˈʃedʒuːl/",
        "Let's schedule a meeting.",
        "Hãy lên lịch một buổi họp.",
      ],
    ];
    const csv = [headers, ...sample].map((row) => row.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vocab_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };



  const handleAIGenerate = async ({ topic, level, quantity }) => {
    setIsGenerating(true);
    try {
      const data = await adminService.generateVocabularyAI({
        topicId,
        topic,
        level,
        quantity,
      });
      if (!data || data.length < 0) return toast.error("Không thể tạo từ vựng");

      const newRows = data?.map((item, i) => {
        const rawType = item.wordType || "Noun";
        return {
          id: Date.now() + i,
          term: item.term,
          phonetic: item.phonetic || "",
          type:
            rawType.charAt(0).toUpperCase() + rawType.slice(1).toLowerCase(),
          meaning: item.meaning,
          example: item.example || "",
          image: null,
          audio: null,
          imageUrl: item.imageUrl || null,
          audioUrl: item.audioUrl || null,
          savedInDb: false, // từ mới từ AI
        };
      });

      setVocabList((prev) => [...prev, ...newRows]);
      toast.success(`AI đã sinh ${newRows.length} từ vựng`);
      setIsAIModalOpen(false);
    } catch (error) {
      console.error("Lỗi sinh từ vựng AI:", error);
      toast.error(
        error?.response?.data?.message ||
          "Có lỗi xảy ra khi sinh từ vựng bằng AI!",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const hasUnsavedChanges =
    vocabList.some((v) => !v.savedInDb || v.isEdited) ||
    deletedWords.length > 0;

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

 

  return (
    <>
    <ToastContainer
      position="top-center"
      autoClose={3500}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      pauseOnHover
    />
    <div className="max-w-7xl mx-auto p-4 sm:p-6 font-sans space-y-6 sm:space-y-8">
      <input
        type="file"
        accept=".csv,text/csv"
        ref={csvInputRef}
        onChange={handleCsvImport}
        className="hidden"
      />

      {/* ─── Header Section ─── */}
      <div className="flex flex-col gap-4 sm:gap-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            {topicTitle || "Tên bộ từ vựng"}
          </h1>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-sm"
            >
              <Download size={16} />
              Download CSV
            </button>

            <button
              onClick={() => csvInputRef.current?.click()}
              className="flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-sm"
            >
              <Upload size={16} />
              Import CSV
            </button>

            <button
              onClick={() => setIsAIModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-sm"
            >
              <Sparkles size={16} />
              Tạo bằng AI
            </button>

            <button
              onClick={handleOpenAdd}
              className="flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-white px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-sm"
            >
              <Plus size={16} />
              Tạo bộ từ mới
            </button>
          </div>

          <button
            onClick={handleSaveTopic}
            disabled={isSaving || !hasUnsavedChanges}
            className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer shadow-md w-full md:w-auto"
          >
            <Save size={18} />
            {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/30">
                <th className="py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[8%]">
                  STT
                </th>
                <th className="py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[12%]">
                  Từ vựng
                </th>
                <th className="py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[10%]">
                  Phiên âm
                </th>
                <th className="py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[9%]">
                  Từ loại
                </th>
                <th className="py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[22%]">
                  Nghĩa
                </th>
                <th className="py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[22%]">
                  Ví dụ
                </th>
                <th className="py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[8%] text-center">
                  Hình ảnh
                </th>
                <th className="py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[8%] text-center">
                  Audio
                </th>
                <th className="py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[9%] text-center">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {vocabList.length === 0 && (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-gray-400">
                    Chưa có từ vựng nào.
                  </td>
                </tr>
              )}
              {vocabList.map((item, index) => (
                <tr
                  key={item.id}
                  className={`hover:bg-gray-50/50 transition-colors ${
                    !item.savedInDb ? "bg-orange-50/40" : ""
                  }`}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <span className="text-[15px] text-gray-900">
                        {index + 1}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-[15px] font-bold text-gray-900">
                      {item.term}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-[14px] text-gray-600 font-medium">
                      {item.phonetic}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-[13px] bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-medium">
                      {item.type}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-[14px] text-gray-700 leading-relaxed pr-4">
                    {item.meaning}
                  </td>
                  <td className="py-4 px-4 text-[14px] text-gray-500 italic leading-relaxed pr-4">
                    {item.example}
                  </td>
                  <td className="py-4 px-4 text-center">
                    {item.imageUrl ? (
                      <div className="w-10 h-10 mx-auto rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src={item.imageUrl}
                          alt={item.term}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 mx-auto rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-300">
                        <ImageIcon size={16} />
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4 text-center">
                    {item.audioUrl ? (
                      <button
                        title="Nghe phát âm"
                        className="w-8 h-8 rounded-full bg-yellow-50 text-yellow-600 flex items-center justify-center hover:bg-yellow-100 transition-colors mx-auto cursor-pointer"
                      >
                        <Volume2 size={16} strokeWidth={2.5} />
                      </button>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-2 text-gray-400">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-yellow-50 hover:text-yellow-500 transition-colors cursor-pointer"
                        title="Chỉnh sửa"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="block md:hidden divide-y divide-gray-100">
          {vocabList.length === 0 && (
            <div className="py-8 text-center text-gray-400">
              Chưa có từ vựng nào.
            </div>
          )}
          {vocabList.map((item, index) => (
            <div
              key={item.id}
              className={`p-4 space-y-3 ${
                !item.savedInDb ? "bg-orange-50/40" : "bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <span className="text-xs font-semibold text-gray-400 mt-1">
                    #{index + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base font-bold text-gray-900">
                        {item.term}
                      </span>
                      {item.phonetic && (
                        <span className="text-xs text-gray-600 font-medium">
                          {item.phonetic}
                        </span>
                      )}
                      <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                        {item.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">
                      <strong className="font-medium text-gray-900">Nghĩa:</strong> {item.meaning}
                    </p>
                    {item.example && (
                      <p className="text-xs text-gray-500 italic mt-1">
                        <strong className="font-normal not-italic text-gray-600">Ví dụ:</strong> {item.example}
                      </p>
                    )}
                  </div>
                </div>

                {item.imageUrl && (
                  <div className="w-14 h-14 shrink-0 rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={item.imageUrl}
                      alt={item.term}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  {item.audioUrl && (
                    <button
                      title="Nghe phát âm"
                      className="h-8 px-3 rounded-lg bg-yellow-50 text-yellow-600 flex items-center gap-1.5 text-xs font-medium hover:bg-yellow-100 transition-colors cursor-pointer"
                    >
                      <Volume2 size={14} strokeWidth={2.5} />
                      <span>Audio</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1 text-gray-400">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="h-8 px-3 rounded-lg bg-gray-50 hover:bg-yellow-50 hover:text-yellow-500 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                    title="Chỉnh sửa"
                  >
                    <Pencil size={14} />
                    <span>Sửa</span>
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="h-8 px-3 rounded-lg bg-gray-50 hover:bg-red-50 hover:text-red-500 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                    title="Xóa"
                  >
                    <Trash2 size={14} />
                    <span>Xóa</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <VocabModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveVocab}
        initialData={editingVocab}
      />
      <AIGenerateVocabModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onGenerate={handleAIGenerate}
        isGenerating={isGenerating}
        defaultTopic={topicTitle}
      />
    </div>
    </>
  );
};

export default AdminTopicVocabManager;
