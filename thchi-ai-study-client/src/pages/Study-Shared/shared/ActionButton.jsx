import learnServices from "../../../services/learn.service";

const ActionButton = ({ onNext, onPrev, step }) => {
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get("sessionId");
  return (
    <div className="flex items-center justify-between">
      {/* <button
        onClick={onPrev}
        className="flex justify-center items-center bg-white text-black px-4 py-2 rounded-lg border border-gray-300 gap-x-1 cursor-pointer"
      >
        <ArrowLeft size={20}></ArrowLeft>
        Từ trước
      </button> */}
      <button
        onClick={() => {
          onNext();
          learnServices.createLearningSessionLog({
            learningSessionId: sessionId,
            wordId: step.word.id,
            step: step.type,
            isCorrect: true,
            attemptCount: 1,
          });
        }}
        className="bg-yellow-400 text-black py-2 rounded-lg border border-gray-300 gap-x-1 px-20 cursor-pointer mx-auto"
      >
        {step.type === "FLASHCARD" ? "Tiếp tục" : "Kiểm tra"}
      </button>
      {/* <button className="flex justify-center items-center bg-white text-black px-4 py-2 rounded-lg border border-gray-300 gap-x-1 cursor-pointer">
        Từ sau
        <ArrowRight size={20}></ArrowRight>
      </button> */}
    </div>
  );
};
export default ActionButton;
