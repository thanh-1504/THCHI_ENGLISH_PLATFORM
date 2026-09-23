import { Check, Dices, Mic, NotebookPen, RefreshCw, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import LimitReachedModal from "../../components/LimitReachedModal";
import aiService from "../../services/ai.service";
import rankService from "../../services/rank.service";
import {
  getScoreColor,
  getWordScoreColor,
  playWordSound,
} from "../../utils/calculateScoreColors";

const PracticeSpeaking = () => {
  const navigate = useNavigate();
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunkRef = useRef(null);
  const [status, setStatus] = useState("idle");
  const [limitReached, setLimitReached] = useState(false);
  const [practiceMode, setPracticeMode] = useState("random");
  const [topic, setTopic] = useState("gia-dinh");
  const [level, setLevel] = useState("A1");
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [feedbackData, setFeedbackData] = useState(null);
  const [userAudioUrl, setUserAudioUrl] = useState(null);
  const [exerciseData, setExerciseData] = useState({
    english_sentence: "",
    vietnamese_meaning: "",
  });

  const handleNewSentence = async () => {
    setIsLoadingQuestion(true);
    setStatus("speaking");
    setInputText("");
    setTranscript("");
    setFeedbackData(null);
    try {
      let res;
      if (practiceMode === "notebook") {
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
        res = await aiService.generateSpeakingSentenceFromNotebook({ level });
      } else {
        res = await aiService.generateSpeakingSentence({ topic, level });
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
      const res = await aiService.gradeSpeaking({
        level: level,
        referenceSentence: exerciseData.english_sentence,
        transcript: inputText,
      });
      setFeedbackData(res);
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi khi chấm điểm. Vui lòng thử lại!");
      setStatus("speaking");
    } finally {
      setIsGrading(false);
    }
  };

  const handleStartRecording = async () => {
    setTranscript("");
    setInputText("");
    setUserAudioUrl(null);
    audioChunkRef.current = [];
    recognitionRef.current?.start();
    setIsRecording(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunkRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunkRef.current, {
          type: "audio/webm",
        });
        const audioUrl = URL.createObjectURL(audioBlob);
        setUserAudioUrl(audioUrl);

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
    } catch (err) {
      console.error("Không thể lấy quyền Microphone ghi âm:", err);
    }
  };

  const handleStopRecording = () => {
    recognitionRef.current?.stop();
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
  };

  const playUserAudio = () => {
    if (userAudioUrl) {
      const audio = new Audio(userAudioUrl);
      audio.play();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter" && status === "speaking") {
        handleSubmit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [status, inputText]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error(
        "Trình duyệt không hỗ trợ nhận diện giọng nói. Vui lòng dùng Chrome.",
      );
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      setInputText(text);
    };
    recognition.onerror = (event) => {
      if (event.error === "network")
        toast.error(
          "Nhận dạng giọng nói gặp lỗi kết nối. Hãy thử nói lại hoặc gõ câu trả lời.",
        );
      else if (event.error === "no-speech")
        toast.warning("Không nghe thấy giọng nói, thử lại nhé!");
      setIsRecording(false);
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
    };
    recognition.onend = () => {
      setIsRecording(false);
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      )
        mediaRecorderRef.current.stop();
    };
    recognitionRef.current = recognition;
  }, []);

  useEffect(() => {
    const updateXp = async () => {
      if (feedbackData) {
        if (feedbackData.fluency >= 50 && feedbackData.fluency < 60) {
          await rankService.addXp(10);
          toast.success("Bạn được cộng 10 điểm kinh nghiệm!");
        } else if (feedbackData.fluency >= 60 && feedbackData.fluency < 80) {
          await rankService.addXp(15);
          toast.success("Bạn được cộng 15 điểm kinh nghiệm!");
        } else if (feedbackData.fluency >= 80 && feedbackData.fluency <= 100) {
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
              Luyện nói câu / đoạn
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
                      setTranscript("");
                    }}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm font-semibold text-gray-700 outline-none focus:border-[#ff9600] focus:ring-1 focus:ring-[#ff9600] transition-all hover:bg-white cursor-pointer shadow-sm"
                    disabled={isLoadingQuestion || isGrading}
                  >
                    <option value="gia-dinh">Gia đình</option>
                    <option value="du-lich">Du lịch</option>
                    <option value="cong-viec">Công việc</option>
                  </select>
                )}

                <select
                  value={level}
                  onChange={(e) => {
                    setLevel(e.target.value);
                    setStatus("idle");
                    setFeedbackData(null);
                    setInputText("");
                    setTranscript("");
                  }}
                  className="px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm font-semibold text-gray-700 outline-none focus:border-[#ff9600] focus:ring-1 focus:ring-[#ff9600] transition-all hover:bg-white cursor-pointer shadow-sm"
                  disabled={isLoadingQuestion || isGrading}
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
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#ff9600] disabled:bg-gray-400 text-white px-7 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg active:scale-95 hover:opacity-90 cursor-pointer"
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
              <Mic size={54} strokeWidth={1.5} className="mb-4 text-gray-300" />
              <p className="font-medium text-[15px]">
                {practiceMode === "notebook"
                  ? 'Bấm "Câu mới" để luyện nói với từ vựng trong sổ tay.'
                  : 'Chọn chủ đề và bấm "Câu mới" để bắt đầu.'}
              </p>
            </div>
          )}

          {(status === "speaking" || status === "feedback") && (
            <div className="flex flex-col gap-6 mt-2">
              <div className="border border-gray-200 rounded-2xl bg-white shadow-sm p-6">
                {isLoadingQuestion ? (
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-gray-100 rounded w-1/2 mb-6"></div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-bold text-gray-800 leading-relaxed mb-3">
                      {exerciseData?.english_sentence ||
                        "Vui lòng bấm 'Câu mới' để bắt đầu."}
                    </h2>
                    <p className="text-[15px] text-gray-500 italic mb-6">
                      {exerciseData?.vietnamese_meaning || ""}
                    </p>
                  </>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() =>
                      speechSynthesis.speak(
                        new SpeechSynthesisUtterance(
                          exerciseData?.english_sentence || "",
                        ),
                      )
                    }
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold transition-colors cursor-pointer"
                  >
                    <Volume2 size={18} /> Nghe mẫu
                  </button>
                  <button
                    onMouseDown={handleStartRecording}
                    onMouseUp={handleStopRecording}
                    onTouchStart={handleStartRecording}
                    onTouchEnd={handleStopRecording}
                    disabled={isLoadingQuestion || isGrading}
                    className={`flex items-center gap-2 px-4 py-2 text-white rounded-xl text-sm font-bold transition-colors shadow-sm cursor-pointer disabled:opacity-50 ${isRecording ? "bg-red-500 animate-pulse" : "bg-blue-500"}`}
                  >
                    <Mic size={20} />{" "}
                    {isRecording ? "Đang nghe..." : "Nhấn giữ mic & nói theo"}
                  </button>
                  {userAudioUrl && (
                    <button
                      onClick={playUserAudio}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-[13px] font-bold transition-colors border border-indigo-100 cursor-pointer"
                    >
                      <Volume2 size={16} /> Nghe lại giọng bạn
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {status === "speaking" && (
                  <span className="text-[13px] font-medium text-gray-400 ml-1">
                    Giữ nút mic và đọc câu trên (hoặc gõ tay vào ô dưới).
                  </span>
                )}
                {status === "feedback" && (
                  <div className="flex items-center gap-4 ml-1 mb-2">
                    <span className="text-[15px] font-bold text-gray-700">
                      Bạn nói: "{inputText}"
                    </span>
                  </div>
                )}

                <div
                  className={`flex items-center gap-3 ${status === "feedback" ? "hidden" : ""}`}
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Văn bản nhận diện sẽ hiện ở đây..."
                    className="flex-1 h-12 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0ea5e9] outline-none text-[15px] shadow-sm bg-white"
                    disabled={isGrading}
                  />
                  <button
                    onClick={handleSubmit}
                    disabled={!inputText.trim() || isGrading}
                    className="h-12 px-6 flex items-center gap-2 bg-[#ff9600] disabled:bg-gray-300 text-white rounded-xl text-sm font-bold transition-colors shadow-sm cursor-pointer hover:opacity-90"
                  >
                    {isGrading ? (
                      <RefreshCw size={18} className="animate-spin" />
                    ) : (
                      <Check size={18} />
                    )}
                    Chấm
                  </button>
                </div>
              </div>

              {/* FEEDBACK */}
              {status === "feedback" && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <h3 className="text-xl font-extrabold text-gray-900 mb-4 mt-2">
                    Nhận xét
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    {[
                      { label: "Phát âm", key: "pronunciation" },
                      { label: "Trôi chảy", key: "fluency" },
                      { label: "Ngữ pháp", key: "grammar" },
                    ].map((item, idx) => {
                      const score = feedbackData ? feedbackData[item.key] : 0;
                      const colors = getScoreColor(score);
                      return (
                        <div
                          key={idx}
                          className="flex-1 bg-white border border-gray-100 rounded-2xl p-6 flex flex-col items-center justify-center shadow-sm min-w-[120px]"
                        >
                          {isGrading ? (
                            <div className="w-18 h-18 rounded-full border-4 border-gray-100 bg-gray-50 animate-pulse mb-3"></div>
                          ) : (
                            <div
                              className={`w-18 h-18 rounded-full border-4 ${getScoreColor(score)} flex items-center justify-center mb-3`}
                            >
                              <span
                                className={`text-[17px] font-black ${colors.text}`}
                              >
                                {score}%
                              </span>
                            </div>
                          )}
                          <span className="text-[13px] font-bold text-gray-700">
                            {item.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {feedbackData?.wordDetails &&
                    feedbackData?.wordDetails.length > 0 && (
                      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-6">
                        <h3 className="text-[14px] font-bold text-gray-700 mb-4">
                          Chi tiết phát âm từng từ:
                        </h3>

                        <div className="flex flex-wrap gap-2.5 mb-4">
                          {feedbackData?.wordDetails.map((item, idx) => (
                            <button
                              key={idx}
                              onClick={() => playWordSound(item.word)}
                              title="Click để nghe phát âm từ này"
                              className={`flex flex-col items-center justify-center px-4 py-2.5 rounded-xl border ${getWordScoreColor(item.score)} transition-transform active:scale-95 cursor-pointer`}
                            >
                              <span className="font-bold text-[16px] leading-none mb-1">
                                {item.word}
                              </span>
                              <span className="text-[11px] font-semibold opacity-70 leading-none">
                                {item.score}%
                              </span>
                            </button>
                          ))}
                        </div>

                        <p className="text-[13px] text-gray-500 italic flex items-center gap-1.5">
                          <span className="text-yellow-500">💡</span>
                          Nhấp vào từng từ ở trên để nghe AI phát âm mẫu riêng
                          cho từ đó.
                        </p>
                      </div>
                    )}

                  {feedbackData?.tips && feedbackData?.tips.length > 0 && (
                    <div className="bg-orange-50/60 border border-orange-100 rounded-2xl p-5 mb-6">
                      <h4 className="font-bold text-orange-800 text-[14.5px] mb-3 flex items-center gap-2">
                        <Mic size={16} className="text-orange-600" /> Mẹo khẩu
                        hình cho các âm chưa chuẩn (màu đỏ/vàng):
                      </h4>
                      <ul className="space-y-2.5">
                        {feedbackData?.tips.map((tip, idx) => (
                          <li
                            key={idx}
                            className="text-[14px] text-orange-900/80 leading-relaxed"
                          >
                            <strong className="text-orange-600 font-bold mr-1">
                              {tip.sound}:
                            </strong>
                            {tip.instruction}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="text-[14.5px] text-gray-700 leading-relaxed font-medium bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    {isGrading ? (
                      <div className="animate-pulse space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                      </div>
                    ) : (
                      feedbackData && (
                        <>
                          <p className="mb-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                            {feedbackData.overview}
                          </p>
                        </>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PracticeSpeaking;
