import { Volume2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import StreakCelebration from "../../components/streak/StreakCelebration";
import learnServices from "../../services/learn.service";
import reviewService from "../../services/review.service";
import useLearningStore from "../../store/useLearningStore";
import { buildReviewStep } from "../../utils/build.learning.step";
import calculateTimeSpent from "../../utils/calculateTimeSpent";
import generateOptions from "../../utils/generateOptions";
import playAudio from "../../utils/playAudio";
import LearningLayout from "../Learn/layouts/LearningLayout";
import ChooseMeaning from "../Study-Shared/cards/ChooseMeaning";
import FillInTheBlank from "../Study-Shared/cards/FillInTheBlank";
import ListendAndType from "../Study-Shared/cards/ListenAndType";
import ListenChooseAnswer from "../Study-Shared/cards/ListenChooseAnswer";
import ProgressBar from "../Study-Shared/shared/ProgressBar";
import SummaryScreen from "../Study-Shared/shared/SummaryScreen";

const Reviewing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const screenState = {
    LEARNING: "LEARNING",
    COMPLETING: "COMPLETING",
    LOADING_SUMMARY: "LOADING_SUMMARY",
    SUMMARY: "SUMMARY",
    STREAK_CELEBRATION: "STREAK_CELEBRATION",
  };
  const [screen, setScreen] = useState(screenState.LEARNING);

  const wordsDue = location.state?.wordsDue ?? [];
  const sessionId = location.state?.sessionId ?? "";

  const [userAnswer, setUserAnswer] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentQueue, setCurrentQueue] = useState(null);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  const [isChecked, setIsChecked] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [xpEarned, setXpEarned] = useState(0);
  const [sessionTimeSpent, setSessionTimeSpent] = useState("00:00");

  const [results, setResults] = useState({
    correct: [],
    incorrect: [],
  });

  const { wordsToReview, addWordToReview, clearWordsToReview } =
    useLearningStore();

  const initialQueue = useMemo(() => {
    return buildReviewStep(wordsDue);
  }, [wordsDue]);

  const totalRequiredSteps = initialQueue.length;
  const queue = currentQueue ?? initialQueue;
  const currentStep = queue[currentIndex];

  const stepOptions = useMemo(() => {
    if (
      currentStep?.type !== "LISTEN_CHOOSE_ANSWER" &&
      currentStep?.type !== "CHOOSE_MEANING"
    ) {
      return [];
    }

    return generateOptions(currentStep.word, wordsDue);
  }, [currentStep, wordsDue]);

  const handleCheck = async () => {
    if (!userAnswer.trim() && currentStep.type !== "FLASHCARD") return;

    try {
      let isStepCorrect = false;

      if (currentStep.type === "FLASHCARD") {
        isStepCorrect = true;
      }
      else if (
        currentStep.type === "LISTEN_CHOOSE_ANSWER" ||
        currentStep.type === "CHOOSE_MEANING"
      ) {
        isStepCorrect = userAnswer === currentStep.word.definitions[0].meaning;
      }
      else {
        const checkAnswer = await learnServices.checkAnswer({
          wordId: currentStep.word.id,
          answer: userAnswer,
        });
        isStepCorrect = checkAnswer.isCorrect;
      }
      setIsChecked(true);
      setLastResult(isStepCorrect);

      if (isStepCorrect) {
        setResults((prev) => ({
          ...prev,
          correct: [...prev.correct, currentStep.word],
        }));
      } else {
        setResults((prev) => ({
          ...prev,
          incorrect: [...prev.incorrect, currentStep.word],
        }));
        addWordToReview(currentStep.word);
      }

      await reviewService.createReviewSessionLog(sessionId, {
        notebookEntryId: currentStep.word.notebookEntryId,
        step: currentStep.type,
        isCorrect: isStepCorrect,
      });
    } catch (error) {
      console.error("Lỗi khi check đáp án:", error);
    }
  };

  const handleContinue = async () => {
    if (lastResult) {
      setCompletedSteps((prev) => {
        const newSet = new Set(prev);
        newSet.add(`${currentStep.word.id}-${currentStep.type}`);
        return newSet;
      });
    }

    setIsChecked(false);
    setLastResult(null);
    setUserAnswer("");

    const nextIndex = currentIndex + 1;
    if (nextIndex < queue.length) {
      setCurrentIndex(nextIndex);
    } else {
      await handleRoundFinish();
    }
  };

  const handleDontKnow = async () => {
    try {
      setIsChecked(true);
      setLastResult(false);
      setResults((prev) => ({
        ...prev,
        incorrect: [...prev.incorrect, currentStep.word],
      }));
      addWordToReview(currentStep.word);
      await reviewService.createReviewSessionLog(sessionId, {
        notebookEntryId: currentStep.word.notebookEntryId,
        step: currentStep.type,
        isCorrect: false,
      });
    } catch (error) {
      console.error("Lỗi khi ghi nhận không thuộc:", error);
    }
  };

  const handleRoundFinish = async () => {
    setScreen(screenState.COMPLETING);

    if (wordsToReview.length > 0) {
      const newQueue = buildReviewStep(wordsToReview);
      setCurrentQueue(newQueue);
      setCurrentIndex(0);
      clearWordsToReview();
      setScreen(screenState.LEARNING);
    } else {
      try {
        setScreen(screenState.LOADING_SUMMARY);
        await reviewService.complete(sessionId, {
          xpEarned: 10,
          totalWords: wordsDue.length,
          correctCount: completedSteps.size,
        });
        const review = await reviewService.getReviewSessionById(sessionId);
        setXpEarned(review.xpEarned ?? 0);
        if (review?.startedAt && review?.completedAt) {
          const formattedTime = calculateTimeSpent(
            review.startedAt,
            review.completedAt,
          );
          setSessionTimeSpent(formattedTime);
        }
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        console.error("Complete session thất bại:", error);
      } finally {
        setScreen(screenState.SUMMARY);
      }
    }
  };

  if (screen === screenState.LOADING_SUMMARY) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="flex space-x-2 mb-4">
          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce [animation-delay:0s]"></div>
          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce [animation-delay:0.15s]"></div>
          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce [animation-delay:0.3s]"></div>
        </div>
        <p className="text-gray-500 font-medium animate-pulse">
          Bạn đợi 1 xíu nhé...
        </p>
      </div>
    );
  }
  if (screen === screenState.SUMMARY) {
    const incorrectIds = new Set(results.incorrect.map((w) => w.id));
    const seenIds = new Set();
    const wordResults = [];
    [...results.correct, ...results.incorrect].forEach((word) => {
      if (!seenIds.has(word.id)) {
        seenIds.add(word.id);
        wordResults.push({
          word,
          isCorrect: !incorrectIds.has(word.id),
        });
      }
    });

    const uniqueCorrectCount = wordResults.filter((w) => w.isCorrect).length;

    return (
      <SummaryScreen
        type="Review"
        correctCount={uniqueCorrectCount}
        totalCount={wordsDue.length}
        xpEarned={xpEarned}
        timeSpent={sessionTimeSpent}
        onContinue={() => {
          const today = new Date().toLocaleDateString();
          const lastCelebration = localStorage.getItem(
            "lastStreakCelebrationDate",
          );
          if (lastCelebration === today) navigate("/review");
          else {
            localStorage.setItem("lastStreakCelebrationDate", today);
            setScreen(screenState.STREAK_CELEBRATION);
          }
        }}
        wordResults={wordResults}
      />
    );
  }

  if (screen === screenState.STREAK_CELEBRATION) {
    return (
      <StreakCelebration handleContinue={() => navigate("/review")} />
    );
  }

  if (screen === screenState.COMPLETING || !currentStep) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-lg">
          {wordsToReview.length > 0
            ? "Đang chuẩn bị ôn lại các từ sai..."
            : "Đang xử lý dữ liệu..."}
        </p>
      </div>
    );
  }

  const stepKey = `${currentStep.word.id}-${currentIndex}-${currentStep.type}`;

  return (
    <LearningLayout>
      <div className="flex flex-col min-w-[520px] max-w-[700px] min-h-[calc(100vh-80px)] mx-auto justify-between">
        <div className="flex flex-col pt-4">
          <ProgressBar
            currentStep={completedSteps.size}
            totalSteps={totalRequiredSteps}
          />
          <div className="w-full">
            {currentStep.type === "FILL_IN_BLANK" && (
              <FillInTheBlank
                key={stepKey}
                word={currentStep.word}
                onAnswerChange={(answer) => setUserAnswer(answer)}
                disabled={isChecked}
                isCorrect={lastResult}
              />
            )}
            {currentStep.type === "LISTEN_AND_TYPE" && (
              <ListendAndType
                key={stepKey}
                word={currentStep.word}
                onAnswerChange={(answer) => setUserAnswer(answer)}
                disabled={isChecked}
                isCorrect={lastResult}
              />
            )}
            {currentStep.type === "LISTEN_CHOOSE_ANSWER" && (
              <ListenChooseAnswer
                key={stepKey}
                word={currentStep.word}
                options={stepOptions}
                onAnswerChange={(answer) => setUserAnswer(answer)}
                disabled={isChecked}
                isCorrect={lastResult}
              />
            )}
            {currentStep.type === "CHOOSE_MEANING" && (
              <ChooseMeaning
                key={stepKey}
                word={currentStep.word}
                options={stepOptions}
                onAnswerChange={(answer) => setUserAnswer(answer)}
                disabled={isChecked}
                isCorrect={lastResult}
              />
            )}
          </div>
        </div>

        <div className="shrink-0 w-full flex flex-col items-center pb-6 pt-3">
          {!isChecked ? (
            <div className="flex flex-col items-center w-full max-w-sm">
              <button
                onClick={handleCheck}
                disabled={
                  currentStep.type !== "FLASHCARD" && !userAnswer.trim()
                }
                className="bg-(image:--my-gradient) text-white font-semibold
                shadow-[0_6px_0_#1f8f2f]
                hover:brightness-105
                shadow-[0_5px_0_#1f8f2f] active:shadow-[0_0_0_#1f8f2f] active:translate-y-1
                transition-all
                duration-100
                cursor-pointer w-[65%] px-4 py-2 rounded-full"
              >
                Kiểm tra
              </button>

              <button
                onClick={handleDontKnow}
                className="mt-4 text-sm text-gray-500 underline hover:text-gray-700 transition-colors font-medium cursor-pointer"
              >
                Tôi không thuộc từ này
              </button>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center animate-in slide-in-from-bottom duration-300">
              <div
                className={`w-full rounded-2xl p-5 relative text-white shadow-md ${
                  lastResult ? "bg-text-green" : "bg-[#EF4444]"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex flex-col pr-16 space-y-2">
                    <div>
                      <span className="text-xl font-bold tracking-wide">
                        {currentStep.word.term}
                      </span>
                      <div className="text-sm opacity-90 flex items-center gap-1.5 mt-0.5">
                        <span>{currentStep.word.phonetic || "/.../"}</span>

                        {currentStep.word.definitions[0].wordType && (
                          <span className="font-medium">
                            ({currentStep.word.definitions[0].wordType})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-sm">
                      {currentStep.word.definitions?.[0]?.meaning}
                    </div>

                    {currentStep.word.examples?.[0]?.sentence && (
                      <div className="text-sm">
                        {currentStep.word.examples[0].sentence}
                      </div>
                    )}
                  </div>

                  <div className="absolute top-4 right-4 flex flex-col gap-3">
                    <button
                      onClick={() => playAudio(currentStep.word)}
                      className="w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-sm active:scale-95 transition-transform cursor-pointer"
                    >
                      <Volume2 size={22} className="text-orange-400" />
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={handleContinue}
                className="bg-(image:--my-gradient) text-white font-semibold
                shadow-[0_6px_0_#1f8f2f]
                hover:brightness-105
                shadow-[0_5px_0_#1f8f2f] active:shadow-[0_0_0_#1f8f2f] active:translate-y-1
                transition-all
                duration-100
                cursor-pointer w-[48%] px-4 py-2 rounded-full mt-10"
              >
                TIẾP TỤC
              </button>
            </div>
          )}
        </div>
      </div>
    </LearningLayout>
  );
};

export default Reviewing;
