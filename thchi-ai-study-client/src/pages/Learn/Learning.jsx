import { Volume2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useLoaderData, useLocation, useNavigate } from "react-router-dom";
import StreakCelebration from "../../components/streak/StreakCelebration";
import StreakGoalSelection from "../../components/streak/StreakGoalSelection";
import learnServices from "../../services/learn.service";
import notebookService from "../../services/notebook.service";
import userService from "../../services/user.service";
import useLearningStore from "../../store/useLearningStore";
import { buildLearningStep } from "../../utils/build.learning.step";
import playAudio from "../../utils/playAudio";
import FillInTheBlank from "../Study-Shared/cards/FillInTheBlank";
import FlashcardWord from "../Study-Shared/cards/FlashcardWord";
import ListendAndType from "../Study-Shared/cards/ListenAndType";
import ProgressBar from "../Study-Shared/shared/ProgressBar";
import LessonComplete from "./components/LessonComplete";
import LessonSummary from "./components/LessonSummary";
import LearningLayout from "./layouts/LearningLayout";

const Learning = () => {
  const topicIncludeWords = useLoaderData();
  const navigate = useNavigate();
  const location = useLocation();
  const courseId = location.state?.courseId;

  const screenState = {
    LEARNING: "LEARNING",
    COMPLETING: "COMPLETING",
    LOADING_SUMMARY: "LOADING_SUMMARY",
    COMPLETE_SELECTION: "COMPLETE_SELECTION",
    SUMMARY: "SUMMARY",
    STREAK_CELEBRATION: "STREAK_CELEBRATION",
    STREAK_GOAL_SELECTION: "STREAK_GOAL_SELECTION",
  };
  const [screen, setScreen] = useState(screenState.LEARNING);
  const [userAnswer, setUserAnswer] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentQueue, setCurrentQueue] = useState(null);

  const [isChecked, setIsChecked] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const [summaryStats, setSummaryStats] = useState(null);
  const sessionStartRef = useRef(Date.now());
  const [completedSteps, setCompletedSteps] = useState(new Set());

  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get("sessionId");

  const { wordsToReview, addWordToReview, clearWordsToReview } =
    useLearningStore();

  const initialQueue = useMemo(() => {
    return buildLearningStep(topicIncludeWords.words);
  }, [topicIncludeWords]);

  const totalRequiredSteps = initialQueue.length;
  const queue = currentQueue ?? initialQueue;
  const currentStep = queue[currentIndex];

  const handleCheck = async () => {
    if (!userAnswer.trim() && currentStep.type !== "FLASHCARD") return;

    try {
      if (currentStep.type === "FLASHCARD") {
        await learnServices.createLearningSessionLog({
          attemptCount: 1,
          isCorrect: true,
          learningSessionId: sessionId,
          step: "FLASHCARD",
          wordId: currentStep.word.id,
        });

        setCompletedSteps((prev) => {
          const newSet = new Set(prev);
          newSet.add(`${currentStep.word.id}-${currentStep.type}`);
          return newSet;
        });

        const nextIndex = currentIndex + 1;
        if (nextIndex < queue.length) {
          setCurrentIndex(nextIndex);
        } else {
          handleRoundFinish();
        }
        return;
      }

      const checkAnswer = await learnServices.checkAnswer({
        wordId: currentStep.word.id,
        answer: userAnswer,
      });

      await learnServices.createLearningSessionLog({
        attemptCount: 1,
        isCorrect: checkAnswer.isCorrect,
        learningSessionId: sessionId,
        step: currentStep.type,
        wordId: currentStep.word.id,
      });

      if (!checkAnswer.isCorrect) {
        addWordToReview(currentStep.word);
      }

      setIsChecked(true);
      setLastResult(checkAnswer.isCorrect);
    } catch (error) {
      console.error("Lỗi khi submit:", error);
    }
  };

  const handleContinue = () => {
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
      handleRoundFinish();
    }
  };

  const handleSkipKnown = async () => {
    try {
      // await learnServices.createLearningSessionLog({
      //   attemptCount: 1,
      //   isCorrect: true,
      //   learningSessionId: sessionId,
      //   step: "FLASHCARD",
      //   wordId: currentStep.word.id,
      // });

      setCompletedSteps((prev) => {
        const newSet = new Set(prev);
        newSet.add(`${currentStep.word.id}-FLASHCARD`);
        newSet.add(`${currentStep.word.id}-FILL_IN_BLANK`);
        newSet.add(`${currentStep.word.id}-LISTEN_AND_TYPE`);
        return newSet;
      });

      const filteredQueue = queue.filter(
        (step, idx) =>
          idx <= currentIndex || step.word.id !== currentStep.word.id,
      );

      const nextIndex = currentIndex + 1;
      if (nextIndex < filteredQueue.length) {
        setCurrentQueue(filteredQueue);
        setCurrentIndex(nextIndex);
      } else {
        setCurrentQueue(filteredQueue);
        handleRoundFinish();
      }
    } catch (error) {
      console.error("Lỗi khi bỏ qua từ:", error);
    }
  };

  // Hoàn thành một vòng học
  const handleRoundFinish = async () => {
    setScreen(screenState.COMPLETING);

    if (wordsToReview.length > 0) {
      const newQueue = buildLearningStep(wordsToReview);
      setCurrentQueue(newQueue);
      setCurrentIndex(0);
      clearWordsToReview();
      setScreen(screenState.LEARNING);
    } else {
      try {
        setScreen(screenState.LOADING_SUMMARY);
        await learnServices.completeLearningSession(sessionId, {
          xpEarned: 10,
          wordsCount: topicIncludeWords.words.length,
        });

        await new Promise((resolve) => setTimeout(resolve, 2000));
        setScreen(screenState.COMPLETE_SELECTION);
      } catch (error) {
        console.error("Complete session thất bại:", error);
        setScreen(screenState.LEARNING);
      }
    }
  };

  // --- RENDERING ---

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

  if (screen === screenState.COMPLETE_SELECTION) {
    const durationSecs = Math.floor(
      (Date.now() - sessionStartRef.current) / 1000,
    );

    return (
      <LessonComplete
        words={topicIncludeWords.words}
        onFinish={async (selectedWords) => {
          try {
            await notebookService.saveWords(selectedWords.map((w) => w.id));
          } catch (err) {
            console.error("Lỗi khi lưu vào Sổ tay:", err);
          }
          setSummaryStats({
            savedCount: selectedWords.length,
            totalWords: topicIncludeWords.words.length,
            xpEarned: 10,
            durationSecs,
          });
          setScreen(screenState.SUMMARY);
        }}
      />
    );
  }

  if (screen === screenState.SUMMARY && summaryStats) {
    return (
      <LessonSummary
        {...summaryStats}
        onClose={() => {
          const today = new Date().toLocaleDateString();
          const lastCelebration = localStorage.getItem(
            "lastStreakCelebrationDate",
          );
          if (lastCelebration === today) navigate(`/learn/${courseId}`);
          else {
            localStorage.setItem("lastStreakCelebrationDate", today);
            setScreen(screenState.STREAK_CELEBRATION);
          }
        }}
      />
    );
  }

  if (screen === screenState.STREAK_CELEBRATION) {
    const handleStreakCelebrationDone = async () => {
      try {
        const { hasInProgressGoal } =
          await userService.getMyStreakGoalStatus();
        if (!hasInProgressGoal) {
          setScreen(screenState.STREAK_GOAL_SELECTION);
        } else {
          navigate(`/learn/${courseId}`);
        }
      } catch {
        navigate(`/learn/${courseId}`);
      }
    };

    return (
      <StreakCelebration handleContinue={handleStreakCelebrationDone} />
    );
  }

  if (screen === screenState.STREAK_GOAL_SELECTION) {
    return (
      <StreakGoalSelection onDone={() => navigate(`/learn/${courseId}`)} />
    );
  }

  if (screen === screenState.COMPLETING || !currentStep) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-lg">
          {wordsToReview.length > 0
            ? "Đang chuẩn bị ôn lại các từ sai..."
            : "Đang hoàn thành bài học..."}
        </p>
      </div>
    );
  }

  const stepKey = `${currentStep.word.id}-${currentIndex}-${currentStep.type}`;

  return (
    <LearningLayout>
      <div className="flex flex-col w-full max-w-[700px] min-h-[calc(100vh-80px)] mx-auto justify-between">
        <div className="flex flex-col pt-4">
          <ProgressBar
            currentStep={completedSteps.size}
            totalSteps={totalRequiredSteps}
          />
          <div className="w-full">
            {currentStep.type === "FLASHCARD" && (
              <FlashcardWord
                key={stepKey}
                word={currentStep.word}
                onNext={handleCheck}
              />
            )}
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
                cursor-pointer w-full sm:w-[65%] px-4 py-3 rounded-full"
              >
                {currentStep.type === "FLASHCARD" ? "Tiếp tục" : "Kiểm tra"}
              </button>

              {currentStep.type === "FLASHCARD" && (
                <button
                  onClick={handleSkipKnown}
                  className="mt-4 text-sm text-gray-500 underline hover:text-gray-700 transition-colors font-medium cursor-pointer"
                >
                  Mình đã thuộc từ này
                </button>
              )}
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
                cursor-pointer w-full sm:w-[48%] px-4 py-3 rounded-full mt-4 sm:mt-10"
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

export default Learning;
