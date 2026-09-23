import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import LimitReachedModal from "../../components/LimitReachedModal";
import aiService from "../../services/ai.service";
import rankService from "../../services/rank.service";
export default function PracticeAIQuizlet() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [limitReached, setLimitReached] = useState(false);

  const fetchAndGenerateQuiz = async () => {
    setIsLoading(true);
    try {
      // 1. Lấy từ vựng ngẫu nhiên từ sổ tay
      const randomWords = await aiService.getRandomNotebookWords();

      if (!randomWords || randomWords.length === 0) {
        setIsLoading(false);
        await Swal.fire({
          icon: "info",
          title: "Sổ tay chưa có từ vựng!",
          text: "Bạn cần thêm từ vào sổ tay trước khi luyện tập theo chế độ này.",
          confirmButtonText: "Học từ mới",
          showCancelButton: true,
          cancelButtonText: "Đóng",
          confirmButtonColor: "#ff9600",
        }).then((result) => {
          if (result.isConfirmed) navigate("/learn");
          else navigate(-1);
        });
        return;
      }

      const quizletData = await aiService.generateQuizlet({
        words: randomWords,
      });

      setQuestions(quizletData);
      setCurrentIndex(0);
      setSelectedAnswer("");
      setIsAnswered(false);
      setCorrectCount(0);
      setIsFinished(false);
    } catch (error) {
      if (error?.response?.status === 403) {
        setLimitReached(true);
        setIsLoading(false);
        return;
      }
      console.error("Lỗi khi khởi tạo Quiz:", error);
      toast.error("Có lỗi xảy ra khi tạo bài tập bằng AI. Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAndGenerateQuiz();
  }, []);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const progressPercentage = totalQuestions
    ? ((currentIndex + (isAnswered ? 1 : 0)) / totalQuestions) * 100
    : 0;

  const handleSelectOption = (option) => {
    if (isAnswered) return;

    setSelectedAnswer(option);
    setIsAnswered(true);

    if (option === currentQuestion.correctAnswer) {
      setCorrectCount((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer("");
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleRetry = () => {
    fetchAndGenerateQuiz();
  };

  useEffect(() => {
    const updateXp = async () => {
      if (isFinished) {
        await Promise.all([
          rankService.addXp(20),
          aiService.completeQuizlet(),
        ]);
        toast.success("Bạn được cộng 20 điểm kinh nghiệm!");
      }
    };
    updateXp();
  }, [isFinished]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 font-sans">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          AI đang soạn bài tập...
        </h2>
        <p className="text-gray-600 text-center max-w-sm">
          Vui lòng đợi vài giây, AI đang lấy từ vựng ngẫu nhiên từ sổ tay của
          bạn để thiết kế câu hỏi.
        </p>
      </div>
    );
  }

  if (limitReached) {
    return (
      <LimitReachedModal
        onClose={() => navigate(-1)}
        onUpgrade={() => navigate("/premium")}
      />
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
        <p className="text-gray-500">Không có dữ liệu bài tập.</p>
      </div>
    );
  }

  if (isFinished) {
    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white rounded-2xl shadow-sm p-10 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Hoàn thành Quiz!
          </h2>
          <div className="text-6xl font-extrabold text-blue-500 mb-4">
            {scorePercentage}%
          </div>
          <p className="text-gray-600 mb-8 text-lg">
            Bạn đúng {correctCount} trên {totalQuestions} câu.
          </p>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleRetry}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              Tiếp tục học
            </button>
            <button
              onClick={() => navigate("/practice")}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              Kết thúc
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen  p-4 md:p-8 font-sans">
        <div className="max-w-3xl mx-auto">
          {/* Header & Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigate("/practice")}
                className="flex items-center text-gray-500 hover:text-gray-700 font-medium transition-colors hover:cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5 mr-1" />
                Thoát Quiz
              </button>
              <span className="text-gray-700 font-medium">
                Câu {currentIndex + 1}/{totalQuestions}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-500 h-2.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-10">
            <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-8 leading-snug">
              {currentQuestion.question}
            </h3>

            <div className="flex flex-col gap-4">
              {currentQuestion.options.map((option, index) => {
                let optionClasses =
                  "border-gray-200 text-gray-700 hover:bg-gray-50";

                if (isAnswered) {
                  if (option === currentQuestion.correctAnswer) {
                    optionClasses =
                      "border-green-500 text-green-700 bg-green-50 ring-1 ring-green-500";
                  } else if (option === selectedAnswer) {
                    optionClasses =
                      "border-red-500 text-red-700 bg-red-50 ring-1 ring-red-500";
                  } else {
                    optionClasses = "border-gray-200 text-gray-400 opacity-70";
                  }
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleSelectOption(option)}
                    disabled={isAnswered}
                    className={`text-left p-4 rounded-xl border-2 font-medium text-lg transition-all ${optionClasses}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {/* Feedback*/}
            {isAnswered && (
              <div className="mt-8 bg-gray-50 rounded-xl p-6 border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="mb-4">
                  <p className="font-bold text-gray-800 mb-1">
                    Đáp án đúng: {currentQuestion.correctAnswer}
                  </p>
                  <p className="text-gray-600">
                    Correct answer: {currentQuestion.correctAnswer}.
                  </p>
                </div>
                <button
                  onClick={handleNext}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl flex items-center transition-colors"
                >
                  Tiếp tục
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
