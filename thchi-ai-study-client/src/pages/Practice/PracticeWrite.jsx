import {
  BarChart2,
  Dices,
  FileEdit,
  Info,
  NotebookPen,
  RefreshCw,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import LimitReachedModal from "../../components/LimitReachedModal";
import aiService from "../../services/ai.service";
import rankService from "../../services/rank.service";
import { getScoreColor, getScoreLabel } from "../../utils/calculateScoreColors";

const PracticeWrite = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("idle");
  const [limitReached, setLimitReached] = useState(false);
  const [practiceMode, setPracticeMode] = useState("random");
  const [topic, setTopic] = useState("Gia đình");
  const [level, setLevel] = useState("A1");
  const [inputText, setInputText] = useState("");
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [feedbackData, setFeedbackData] = useState(null);
  const [exerciseData, setExerciseData] = useState({
    vietnamese_sentence: "",
    hint: "",
  });

  const handleNewSentence = async () => {
    setIsLoadingQuestion(true);
    setStatus("writing");
    setInputText("");
    setFeedbackData(null);
    try {
      let res;
      if (practiceMode === "notebook") {
        // Kiểm tra sổ tay có từ không trước khi gọi AI
        const randomWords = await aiService.getRandomNotebookWords();
        if (!randomWords || randomWords.length === 0) {
          setStatus("idle");
          setIsLoadingQuestion(false);
          await Swal.fire({
            icon: "info",
            title: "Sổ tay chưa có từ vựng!",
            text: "Bạn cần học thêm từ mới trước khi luyện tập theo chế độ này.",
            confirmButtonText: "Học từ mới",
            showCancelButton: true,
            cancelButtonText: "Đóng",
            confirmButtonColor: "#ff9600",
          }).then((result) => {
            if (result.isConfirmed) navigate("/learn");
          });
          return;
        }
        res = await aiService.generateSentenceFromNotebook({ level });
      } else {
        res = await aiService.generateSentence({ topic, level });
      }
      setExerciseData(res);
    } catch (error) {
      if (error?.response?.status === 403) {
        setLimitReached(true);
      } else {
        console.log(error);
      }
      setStatus("idle");
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  const handleSubmit = async () => {
    if (!inputText.trim()) return;
    setIsGrading(true);
    setStatus("feedback");

    try {
      const res = await aiService.gradeWriting({
        vietnameseSentence: exerciseData.vietnamese_sentence,
        userTranslation: inputText,
        level,
      });
      setFeedbackData(res);
    } catch (error) {
      console.log(error);
      setStatus("writing");
    } finally {
      setIsGrading(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === "Enter" && status === "writing") {
        handleSubmit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [status, inputText]);

  useEffect(() => {
    const updateXp = async () => {
      if (feedbackData) {
        if (feedbackData.score >= 50 && feedbackData.score < 60) {
          await rankService.addXp(10);
          toast.success("Bạn được cộng 10 điểm kinh nghiệm!");
        } else if (feedbackData.score >= 60 && feedbackData.score < 80) {
          await rankService.addXp(15);
          toast.success("Bạn được cộng 15 điểm kinh nghiệm!");
        } else if (feedbackData.score >= 80 && feedbackData.score <= 100) {
          await rankService.addXp(20);
          toast.success("Bạn được cộng 20 điểm kinh nghiệm!");
        }
      }
    };

    updateXp();
  }, [feedbackData]);

  return (
    <>
      {limitReached && (
        <LimitReachedModal
          onClose={() => setLimitReached(false)}
          onUpgrade={() => navigate("/premium")}
        />
      )}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6 items-start pb-10">
        <div className="flex-1 w-full flex flex-col">
          {/* Header */}
          <div className="mb-4 mt-10">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-1">
              Luyện viết
            </h1>
          </div>

          {/* Control Panel */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
            {/* Tabs chọn chế độ */}
            <div className="flex border-b border-gray-100 bg-gray-50/50">
              <button
                onClick={() => {
                  setPracticeMode("random");
                  setStatus("idle");
                }}
                disabled={isLoadingQuestion || isGrading}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold transition-all border-b-2 ${
                  practiceMode === "random"
                    ? "border-[#ff9600] text-[#ff9600] bg-white"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"
                }`}
              >
                <Dices size={20} /> Ngẫu nhiên
              </button>
              <button
                onClick={() => {
                  setPracticeMode("notebook");
                  setStatus("idle");
                }}
                disabled={isLoadingQuestion || isGrading}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold transition-all border-b-2 ${
                  practiceMode === "notebook"
                    ? "border-[#ff9600] text-[#ff9600] bg-white"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"
                }`}
              >
                <NotebookPen size={20} /> Từ sổ tay
              </button>
            </div>

            {/* Action Controls (Selects & Button) */}
            <div className="p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                {practiceMode === "random" && (
                  <select
                    value={topic}
                    onChange={(e) => {
                      setTopic(e.target.value);
                      setStatus("idle");
                      setFeedbackData(null);
                      setInputText("");
                    }}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm font-semibold text-gray-700 outline-none focus:border-[#ff9600] focus:ring-1 focus:ring-[#ff9600] transition-all hover:bg-white cursor-pointer shadow-sm"
                    disabled={isLoadingQuestion || isGrading}
                  >
                    <option value="gia-dinh">Gia đình</option>
                    <option value="du-lich">Du lịch</option>
                    <option value="am-thuc">Ẩm thực</option>
                    <option value="suc-khoe">Sức khỏe</option>
                    <option value="cong-nghe">Công nghệ</option>
                  </select>
                )}

                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm font-semibold text-gray-700 outline-none focus:border-[#ff9600] focus:ring-1 focus:ring-[#ff9600] transition-all hover:bg-white cursor-pointer shadow-sm"
                  disabled={status === "writing" || isGrading}
                >
                  <option value="A1">A1</option>
                  <option value="A2">A2</option>
                  <option value="B1">B1</option>
                  <option value="B2">B2</option>
                  <option value="C1">C1</option>
                  <option value="C2">C2</option>
                </select>
              </div>

              <button
                onClick={handleNewSentence}
                disabled={isLoadingQuestion || isGrading}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#ff9600] disabled:bg-gray-400 text-white px-7 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg active:scale-95 hover:opacity-90"
              >
                <RefreshCw
                  size={18}
                  className={isLoadingQuestion ? "animate-spin" : ""}
                />
                {isLoadingQuestion ? "Đang tạo..." : "Câu mới"}
              </button>
            </div>
          </div>

          {status === "idle" && (
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-16 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 mt-2">
              <FileEdit
                size={48}
                strokeWidth={1.5}
                className="mb-4 text-gray-300"
              />
              <p className="font-medium text-[15px]">
                {practiceMode === "notebook"
                  ? 'Bấm "Câu mới" để luyện tập với từ vựng trong sổ tay.'
                  : 'Chọn chủ đề và bấm "Câu mới" để bắt đầu.'}
              </p>
            </div>
          )}

          {status === "writing" && (
            <div className="border border-gray-200 rounded-2xl bg-white mt-2 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <span className="text-xs font-bold text-gray-400 tracking-wider">
                  DỊCH SANG TIẾNG ANH:
                </span>

                {isLoadingQuestion ? (
                  <div className="animate-pulse mt-3">
                    <div className="h-6 bg-gray-200 rounded-md w-3/4 mb-4"></div>
                    <div className="h-14 bg-gray-100 rounded-xl w-full border border-gray-100"></div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-[17px] font-bold text-gray-800 mt-2 leading-relaxed">
                      {exerciseData?.vietnamese_sentence ?? ""}
                    </h2>

                    {exerciseData?.hint && (
                      <div className="mt-5 bg-gray-50 p-3.5 rounded-xl flex gap-2.5 text-[13px] text-gray-600 border border-gray-100 items-start">
                        <Info
                          size={16}
                          className="text-gray-400 flex-shrink-0 mt-0.5"
                        />
                        <p>
                          <span className="font-semibold italic">Gợi ý:</span>{" "}
                          {exerciseData.hint}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="p-6 bg-gray-50/30">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={isLoadingQuestion || isGrading}
                  className="w-full h-36 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ff9600] outline-none resize-none transition-all text-sm disabled:opacity-60 disabled:bg-gray-100"
                  placeholder={
                    isLoadingQuestion
                      ? "Vui lòng chờ câu hỏi..."
                      : "Nhập bản dịch tiếng Anh của bạn tại đây..."
                  }
                  autoFocus
                />
                <div className="flex justify-between items-center mt-4">
                  <span className="text-xs font-medium text-gray-400">
                    {inputText.length} ký tự
                  </span>
                  <button
                    onClick={handleSubmit}
                    disabled={
                      !inputText.trim() || isLoadingQuestion || isGrading
                    }
                    className="bg-[#ff9600] hover:opacity-90 hover:cursor-pointer disabled:bg-gray-300 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95"
                  >
                    {isGrading && (
                      <RefreshCw size={16} className="animate-spin" />
                    )}
                    {isGrading ? "Đang chấm bài..." : "Nộp bài dịch"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {status === "feedback" && (
            <div className="border border-gray-200 rounded-2xl bg-white mt-2 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between p-4 px-6 border-b border-gray-100 bg-gray-50/80">
                <div className="flex items-center gap-2 text-sm font-bold text-[#0ea5e9]">
                  <BarChart2 size={18} />{" "}
                  {isGrading
                    ? "AI đang phân tích bản dịch..."
                    : "Đánh giá chi tiết từ AI"}
                </div>
              </div>

              <div className="p-6 flex flex-col md:flex-row gap-8">
                {isGrading ? (
                  <>
                    <div className="w-28 h-28 rounded-full border-[5px] border-gray-100 flex items-center justify-center shrink-0 mx-auto md:mx-0 shadow-sm bg-gray-50 animate-pulse"></div>

                    <div className="flex-1 space-y-6 animate-pulse mt-2 md:mt-0">
                      <div>
                        <div className="h-3 bg-gray-200 rounded w-1/4 mb-3"></div>
                        <div className="h-16 bg-gray-50 border border-gray-100 rounded-xl w-full"></div>
                      </div>
                      <div>
                        <div className="h-3 bg-gray-200 rounded w-1/3 mb-3"></div>
                        <div className="h-12 bg-red-50 border border-red-100 rounded-xl w-full mb-3"></div>
                        <div className="h-10 bg-gray-50 border border-gray-100 rounded-xl w-3/4"></div>
                      </div>
                    </div>
                  </>
                ) : (
                  feedbackData && (
                    <>
                      <div
                        className={`w-28 h-28 rounded-full border-[5px] flex flex-col items-center justify-center shrink-0 mx-auto md:mx-0 shadow-sm bg-white ${getScoreColor(feedbackData.score)}`}
                      >
                        <span className="text-3xl font-black tracking-tight">
                          {feedbackData.score}%
                        </span>
                        <span className="text-sm font-bold uppercase mt-0.5">
                          {getScoreLabel(feedbackData.score)}
                        </span>
                      </div>

                      <div className="flex-1 space-y-6">
                        <div>
                          <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                            Nhận xét tổng quan:
                          </h3>
                          <p className="text-[14px] text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100 font-medium leading-relaxed">
                            {feedbackData.overview}
                          </p>
                        </div>

                        <div>
                          <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                            So sánh & Sửa lỗi:
                          </h3>

                          <div className="space-y-4">
                            {feedbackData.corrections &&
                            feedbackData.corrections.length > 0 ? (
                              <div className="space-y-2 mb-4">
                                <p className="text-xs font-bold text-gray-500 mb-1.5">
                                  Lỗi bạn mắc phải:
                                </p>
                                {feedbackData.corrections.map((corr, idx) => (
                                  <div
                                    key={idx}
                                    className="bg-red-50/50 border border-red-100 p-3 rounded-xl flex flex-wrap items-center gap-2 text-[14px]"
                                  >
                                    <span className="line-through text-red-500 font-medium">
                                      {corr.original}
                                    </span>
                                    <span className="text-gray-400 text-lg">
                                      →
                                    </span>
                                    <span className="text-emerald-600 font-semibold">
                                      {corr.suggestion}
                                    </span>

                                    <span className="ml-auto text-[10px] uppercase font-bold text-gray-400 bg-white px-2 py-1 rounded border border-gray-200">
                                      {corr.type === "grammar"
                                        ? "Ngữ pháp"
                                        : corr.type === "vocabulary"
                                          ? "Từ vựng"
                                          : "Tự nhiên"}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl border border-emerald-100 text-sm font-semibold mb-4">
                                Không sao hết! Bạn hãy cố gắng lần sau nhé.
                              </div>
                            )}

                            <div>
                              <p className="text-xs font-bold text-gray-500 mb-1.5">
                                Bản dịch tham khảo từ AI:
                              </p>
                              <div className="text-gray-800 text-[15px] font-bold mb-3">
                                "{feedbackData.referenceTranslation}"
                              </div>
                            </div>
                          </div>
                        </div>

                        {feedbackData.tips && feedbackData.tips.length > 0 && (
                          <div className="mt-4 border-t border-gray-100 pt-5">
                            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                              💡 Mẹo rút ra:
                            </h3>
                            <ul className="space-y-2">
                              {feedbackData.tips.map((tip, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2 text-[14px] text-gray-700 bg-blue-50/30 p-3 rounded-xl border border-blue-100/50"
                                >
                                  <span className="text-blue-500">✨</span>{" "}
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </>
                  )
                )}
              </div>

              {!isGrading && feedbackData && (
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={handleNewSentence}
                    className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-2 rounded-xl text-sm font-bold shadow-sm cursor-pointer"
                  >
                    Dịch câu khác
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PracticeWrite;
